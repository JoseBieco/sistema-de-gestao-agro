"use client"

import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export function ExtratoClient({ movimentacoes }: { movimentacoes: any[] }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "data_transacao",
      header: "Data",
      cell: ({ row }) => new Date(row.getValue("data_transacao")).toLocaleDateString(),
    },
    {
      accessorKey: "tipo_transacao",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("tipo_transacao")}</Badge>,
    },
    {
      accessorKey: "quantidade",
      header: "Quantidade",
      cell: ({ row }) => {
        const qt = parseFloat(row.getValue("quantidade"))
        const isEntrada = qt > 0
        return (
          <div className={`font-bold ${isEntrada ? 'text-green-600' : 'text-red-600'}`}>
            {isEntrada ? '+' : ''}{qt}
          </div>
        )
      }
    },
    {
      accessorKey: "custo_por_unidade",
      header: "Custo Médio Unit.",
      cell: ({ row }) => {
        const val = row.getValue("custo_por_unidade")
        return val ? `R$ ${parseFloat(val as string).toFixed(4)}` : "-"
      }
    }
  ]

  return (
    <DataTable 
      columns={columns} 
      data={movimentacoes} 
      searchKey="tipo_transacao" 
      searchPlaceholder="Filtrar por tipo..." 
    />
  )
}
