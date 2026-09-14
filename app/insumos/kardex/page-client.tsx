"use client"

import { useState } from "react"
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

export function InsumoKardexClient({ initialData }: { initialData: any[] }) {
  const [movimentacoes] = useState(initialData)

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-"
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getTipoTransacaoConfig = (tipo: string) => {
    switch (tipo) {
      case "ENTRADA_COMPRA":
        return { label: "Entrada via Compra", color: "bg-blue-100 text-blue-800" }
      case "SAIDA_CONSUMO":
        return { label: "Saída p/ Consumo", color: "bg-orange-100 text-orange-800" }
      case "AJUSTE_INVENTARIO":
        return { label: "Ajuste de Inventário", color: "bg-purple-100 text-purple-800" }
      case "PERDA_VALIDADE":
        return { label: "Descarte / Validade", color: "bg-red-100 text-red-800" }
      default:
        return { label: tipo, color: "bg-gray-100 text-gray-800" }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">
          Esta tela é do tipo "append-only". Todos os registros de movimentação são imutáveis, garantindo total auditoria do estoque (fator de conversão já aplicado).
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Transação</TableHead>
                <TableHead>Insumo</TableHead>
                <TableHead>Tipo Operação</TableHead>
                <TableHead className="text-right">Qtd Movimentada (Base)</TableHead>
                <TableHead>Lote / Validade</TableHead>
                <TableHead>Custo Unit. (Rateado)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhuma movimentação de estoque registrada.
                  </TableCell>
                </TableRow>
              ) : (
                movimentacoes.map((mov) => {
                  const config = getTipoTransacaoConfig(mov.tipo_transacao)
                  const isEntrada = mov.quantidade > 0
                  
                  return (
                    <TableRow key={mov.id}>
                      <TableCell>{formatDate(mov.data_transacao)}</TableCell>
                      <TableCell className="font-medium">
                        {mov.insumo?.nome} 
                        <span className="text-xs text-muted-foreground ml-1">({mov.insumo?.unidade_base})</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={config.color}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${isEntrada ? 'text-green-600' : 'text-red-600'}`}>
                        {isEntrada ? '+' : ''}{mov.quantidade}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {mov.numero_lote ? `Lote: ${mov.numero_lote}` : '-'}
                        <br />
                        {mov.data_validade ? `Venc: ${new Date(mov.data_validade).toLocaleDateString()}` : ''}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(mov.custo_por_unidade)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
