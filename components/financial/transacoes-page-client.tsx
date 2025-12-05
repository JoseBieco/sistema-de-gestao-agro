"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/format"
import { Plus, ShoppingCart, TrendingUp, Eye } from "lucide-react"
import type { Transacao, TipoTransacao, Parceiro, Parcela } from "@/lib/types/database"

type TransacaoExtended = Transacao & {
  parceiro?: Parceiro
  parcelas?: Parcela[]
}

interface TransacoesPageClientProps {
  tipo: TipoTransacao
  initialTransacoes: TransacaoExtended[]
}

export function TransacoesPageClient({ tipo, initialTransacoes }: TransacoesPageClientProps) {
  const [transacoes] = useState(initialTransacoes)

  const isCompra = tipo === "compra"
  const Icon = isCompra ? ShoppingCart : TrendingUp

  const stats = {
    total: transacoes.length,
    valorTotal: transacoes.reduce((acc, t) => acc + (t.valor_total || 0), 0),
    pendentes: transacoes.filter((t) => t.status === "pendente").length,
    finalizadas: transacoes.filter((t) => t.status === "finalizada").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-lg p-3 ${isCompra ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
              <Icon className={`h-5 w-5 ${isCompra ? "text-red-600" : "text-emerald-600"}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className={`text-xl font-bold ${isCompra ? "text-red-600" : "text-emerald-600"}`}>
                {formatCurrency(stats.valorTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Icon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{stats.pendentes}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <Icon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Finalizadas</p>
              <p className="text-2xl font-bold">{stats.finalizadas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {isCompra ? "Compras" : "Vendas"}
          </CardTitle>
          <Link href={isCompra ? "/compras/nova" : "/vendas/nova"}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova {isCompra ? "Compra" : "Venda"}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>{isCompra ? "Vendedor" : "Comprador"}</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead>Forma Pgto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoes.length > 0 ? (
                transacoes.map((t) => {
                  const parcelasPagas = t.parcelas?.filter((p) => p.status === "pago").length || 0
                  const totalParcelas = t.parcelas?.length || 0

                  return (
                    <TableRow key={t.id}>
                      <TableCell>{formatDate(t.data_negociacao)}</TableCell>
                      <TableCell className="font-medium">{t.parceiro?.nome || "-"}</TableCell>
                      <TableCell className={isCompra ? "text-red-600" : "text-emerald-600"}>
                        {formatCurrency(t.valor_total || 0)}
                      </TableCell>
                      <TableCell>
                        {parcelasPagas}/{totalParcelas}
                      </TableCell>
                      <TableCell className="capitalize">{t.forma_pagamento?.replace("_", " ") || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(t.status)}>
                          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/${tipo}s/${t.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma {isCompra ? "compra" : "venda"} registrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
