"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, ArrowDownUp, Trash2, MoreHorizontal } from "lucide-react"
import { registrarMovimentacaoSanitaria, deleteProdutoSanitario } from "./actions"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const movimentacaoSchema = z.object({
  tipo_transacao: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]),
  quantidade: z.coerce.number().positive("A quantidade deve ser maior que zero"),
  observacoes: z.string().optional()
})

type MovimentacaoFormValues = z.infer<typeof movimentacaoSchema>

export function EstoquePageClient({ initialProdutos }: { initialProdutos: any[] }) {
  const router = useRouter()
  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<any>(null)
  const [isSubmittingMov, setIsSubmittingMov] = useState(false)

  const form = useForm<MovimentacaoFormValues>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: {
      tipo_transacao: "ENTRADA",
      quantidade: undefined,
      observacoes: ""
    }
  })

  const openMovimentacao = (produto: any) => {
    setSelectedProduto(produto)
    form.reset({ tipo_transacao: "ENTRADA", quantidade: undefined, observacoes: "" })
    setIsMovimentacaoOpen(true)
  }

  const handleMovimentacaoSubmit = async (data: MovimentacaoFormValues) => {
    if (!selectedProduto) return
    setIsSubmittingMov(true)
    
    try {
      await registrarMovimentacaoSanitaria({
        produto_id: selectedProduto.id,
        tipo_transacao: data.tipo_transacao,
        quantidade: data.quantidade,
        observacoes: data.observacoes || ""
      })
      toast.success("Movimentação registrada com sucesso!")
      setIsMovimentacaoOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Erro ao registrar movimentação.")
    } finally {
      setIsSubmittingMov(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este produto?")) {
      try {
        await deleteProdutoSanitario(id)
        toast.success("Produto excluído com sucesso!")
        router.refresh()
      } catch (error) {
        toast.error("Erro ao excluir produto.")
      }
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => <div className="font-medium">{row.getValue("nome")}</div>,
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const tipo = row.getValue("tipo") as string
        return (
          <Badge variant={tipo === "REMEDIO" ? "default" : "secondary"}>
            {tipo === "REMEDIO" ? "Remédio" : "Vacina"}
          </Badge>
        )
      }
    },
    {
      accessorKey: "estoque_atual",
      header: "Quantidade",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("estoque_atual"))
        return <div className="font-medium">{amount} {row.original.unidade_medida}</div>
      }
    },
    {
      accessorKey: "indicacao",
      header: "Indicação",
      cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("indicacao") || "-"}</div>
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const produto = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openMovimentacao(produto)}>
                <ArrowDownUp className="mr-2 h-4 w-4" /> Movimentar Estoque
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/sanitario/estoque/${produto.id}/editar`)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(produto.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Estoque Sanitário</h2>
        <Button onClick={() => router.push("/sanitario/estoque/novo")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={initialProdutos} 
        searchKey="nome" 
        searchPlaceholder="Buscar produtos..." 
      />

      <Dialog open={isMovimentacaoOpen} onOpenChange={setIsMovimentacaoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimentar Estoque - {selectedProduto?.nome}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleMovimentacaoSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tipo_transacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Movimentação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ENTRADA">Entrada (+)</SelectItem>
                        <SelectItem value="SAIDA">Saída (-)</SelectItem>
                        <SelectItem value="AJUSTE">Ajuste (Substituir total)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade ({selectedProduto?.unidade_medida})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (Opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsMovimentacaoOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmittingMov}>
                  {isSubmittingMov ? "Salvando..." : "Salvar Movimentação"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
