"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Eye, Edit, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cancelCompra } from "../actions"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

export function InsumosComprasClient({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [compras] = useState(initialData)
  
  // Custom Filters
  const [statusEntregaFilter, setStatusEntregaFilter] = useState("TODOS")
  const [statusPagamentoFilter, setStatusPagamentoFilter] = useState("TODOS")

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
      case "PENDENTE_PAGAMENTO":
        return "bg-amber-500 hover:bg-amber-600"
      case "CANCELADO":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-slate-500 hover:bg-slate-600"
    }
  }

  const handleCancel = async (id: string) => {
    if (confirm("Tem certeza que deseja cancelar este pedido? Se existirem parcelas pagas, elas serão mantidas, mas as pendentes serão excluídas.")) {
      const res = await cancelCompra(id)
      if (res.success) {
        toast.success("Pedido cancelado com sucesso!")
        router.refresh()
      } else {
        toast.error(res.error)
      }
    }
  }

  const filteredCompras = compras.filter((c) => {
    const matchEntrega = statusEntregaFilter === "TODOS" || c.status_entrega === statusEntregaFilter
    const matchPagamento = statusPagamentoFilter === "TODOS" || c.status_pagamento === statusPagamentoFilter
    return matchEntrega && matchPagamento
  }).map(c => ({
    ...c,
    parceiro_nome: c.parceiro?.nome || "Desconhecido" // Flattened for DataTable search
  }))

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "data_solicitacao",
      header: "Data",
      cell: ({ row }) => formatDate(row.getValue("data_solicitacao")),
    },
    {
      accessorKey: "parceiro_nome",
      header: "Fornecedor",
      cell: ({ row }) => <div className="font-medium">{row.getValue("parceiro_nome")}</div>,
    },
    {
      accessorKey: "valor_total",
      header: "Valor Total",
      cell: ({ row }) => formatCurrency(row.getValue("valor_total")),
    },
    {
      accessorKey: "status_entrega",
      header: "Entrega",
      cell: ({ row }) => {
        const status = row.getValue("status_entrega") as string
        return (
          <Badge className={getStatusColor(status)}>
            {status.replace("_", " ")}
          </Badge>
        )
      }
    },
    {
      accessorKey: "status_pagamento",
      header: "Pagamento",
      cell: ({ row }) => {
        const status = row.getValue("status_pagamento") as string
        return (
          <Badge className={getStatusColor(status)}>
            {status.replace("_", " ")}
          </Badge>
        )
      }
    },
    {
      accessorKey: "data_prevista_entrega",
      header: "Prevista",
      cell: ({ row }) => {
        const val = row.getValue("data_prevista_entrega") as string | null
        return <div className="text-muted-foreground">{val ? formatDate(val) : "-"}</div>
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const compra = row.original
        const isCancelado = compra.status_entrega === "CANCELADO"
        const hasRomaneios = compra.romaneios && compra.romaneios.length > 0
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/insumos/compras/${compra.id}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                </Link>
              </DropdownMenuItem>
              {!isCancelado && !hasRomaneios && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/insumos/compras/${compra.id}/editar`} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" /> Editar Pedido
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => handleCancel(compra.id)}
                  >
                    <Ban className="mr-2 h-4 w-4" /> Cancelar Pedido
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-2xl font-bold tracking-tight">Histórico de Pedidos</h2>
        <Button asChild>
          <Link href="/insumos/compras/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Pedido de Compra
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <select 
          className="flex h-10 w-full md:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={statusEntregaFilter}
          onChange={(e) => setStatusEntregaFilter(e.target.value)}
        >
          <option value="TODOS">Qualquer Entrega</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PARCIALMENTE_ENTREGUE">Parcialmente Entregue</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        <select 
          className="flex h-10 w-full md:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={statusPagamentoFilter}
          onChange={(e) => setStatusPagamentoFilter(e.target.value)}
        >
          <option value="TODOS">Qualquer Pagamento</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PENDENTE_PAGAMENTO">Pendente (Falta Pagar)</option>
          <option value="PAGO">Pago</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredCompras} 
        searchKey="parceiro_nome" 
        searchPlaceholder="Buscar por fornecedor..." 
      />
    </div>
  )
}
