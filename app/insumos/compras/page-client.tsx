"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function InsumosComprasClient({ initialData }: { initialData: any[] }) {
  const [compras] = useState(initialData)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ENTREGUE":
      case "PAGO":
        return "bg-green-500 hover:bg-green-600"
      case "PARCIALMENTE_ENTREGUE":
      case "PARCIAL":
        return "bg-amber-500 hover:bg-amber-600"
      default:
        return "bg-slate-500 hover:bg-slate-600"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">Histórico de Pedidos</h2>
        <Button asChild>
          <Link href="/insumos/compras/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Pedido de Compra
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Prevista</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum pedido de compra registrado.
                  </TableCell>
                </TableRow>
              ) : (
                compras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell>{formatDate(compra.data_solicitacao)}</TableCell>
                    <TableCell className="font-medium">{compra.parceiro?.nome || "Desconhecido"}</TableCell>
                    <TableCell>{formatCurrency(compra.valor_total)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(compra.status_entrega)}>
                        {compra.status_entrega.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(compra.status_pagamento)}>
                        {compra.status_pagamento}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {compra.data_prevista_entrega ? formatDate(compra.data_prevista_entrega) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
