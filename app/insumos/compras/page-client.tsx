"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Eye, Edit, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cancelCompra } from "../actions"
import { toast } from "sonner"

export function InsumosComprasClient({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [compras] = useState(initialData)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
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

  // Lógica de Filtragem
  const filteredCompras = compras.filter((c) => {
    const matchSearch = c.parceiro?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEntrega = statusEntregaFilter === "TODOS" || c.status_entrega === statusEntregaFilter
    const matchPagamento = statusPagamentoFilter === "TODOS" || c.status_pagamento === statusPagamentoFilter
    return matchSearch && matchEntrega && matchPagamento
  })

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
        <CardHeader className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 max-w-sm w-full relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por fornecedor..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row">
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
          </div>
        </CardHeader>
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
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Nenhum pedido de compra encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompras.map((compra) => {
                  const isCancelado = compra.status_entrega === "CANCELADO"
                  const hasRomaneios = compra.romaneios && compra.romaneios.length > 0
                  
                  return (
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
                          {compra.status_pagamento.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {compra.data_prevista_entrega ? formatDate(compra.data_prevista_entrega) : "-"}
                      </TableCell>
                      <TableCell>
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
                              <DropdownMenuItem asChild>
                                <Link href={`/insumos/compras/${compra.id}/editar`} className="cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" /> Editar Pedido
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {!isCancelado && !hasRomaneios && (
                              <DropdownMenuItem 
                                className="text-red-600 cursor-pointer"
                                onClick={() => handleCancel(compra.id)}
                              >
                                <Ban className="mr-2 h-4 w-4" /> Cancelar Pedido
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
