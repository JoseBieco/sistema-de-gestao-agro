"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

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
        return { label: "Entrada via Compra", color: "bg-blue-100 text-blue-800 border-blue-200" }
      case "SAIDA_CONSUMO":
        return { label: "Saída p/ Consumo", color: "bg-orange-100 text-orange-800 border-orange-200" }
      case "AJUSTE_INVENTARIO":
        return { label: "Ajuste de Inventário", color: "bg-purple-100 text-purple-800 border-purple-200" }
      case "PERDA_VALIDADE":
        return { label: "Descarte / Validade", color: "bg-red-100 text-red-800 border-red-200" }
      default:
        return { label: tipo, color: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  // Pre-process data for easier searching in DataTable
  const data = movimentacoes.map(mov => ({
    ...mov,
    insumo_nome: mov.insumo?.nome || "Desconhecido",
    unidade_base: mov.insumo?.unidade_base || "",
  }))

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "data_transacao",
      header: "Data Transação",
      cell: ({ row }) => formatDate(row.getValue("data_transacao")),
    },
    {
      accessorKey: "insumo_nome",
      header: "Insumo",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("insumo_nome")}
          <span className="text-xs text-muted-foreground ml-1">({row.original.unidade_base})</span>
        </div>
      ),
    },
    {
      accessorKey: "tipo_transacao",
      header: "Tipo Operação",
      cell: ({ row }) => {
        const config = getTipoTransacaoConfig(row.getValue("tipo_transacao"))
        return (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        )
      }
    },
    {
      accessorKey: "quantidade",
      header: "Qtd Movimentada (Base)",
      cell: ({ row }) => {
        const qtd = row.getValue("quantidade") as number
        const isEntrada = qtd > 0
        return (
          <div className={`font-bold ${isEntrada ? 'text-green-600' : 'text-red-600'}`}>
            {isEntrada ? '+' : ''}{qtd}
          </div>
        )
      }
    },
    {
      id: "lote_validade",
      header: "Lote / Validade",
      cell: ({ row }) => {
        const lote = row.original.numero_lote
        const val = row.original.data_validade
        return (
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            <div>{lote ? `Lote: ${lote}` : '-'}</div>
            {val && <div>Venc: {new Date(val).toLocaleDateString()}</div>}
          </div>
        )
      }
    },
    {
      accessorKey: "custo_por_unidade",
      header: "Custo Unit. (Rateado)",
      cell: ({ row }) => formatCurrency(row.getValue("custo_por_unidade")),
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm border-l-4 border-blue-500 pl-4 py-1 bg-blue-50/50">
          Esta tela é do tipo "append-only". Todos os registros de movimentação são imutáveis, garantindo total auditoria do estoque (fator de conversão já aplicado).
        </p>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="insumo_nome" 
        searchPlaceholder="Buscar por insumo..." 
      />
    </div>
  )
}
