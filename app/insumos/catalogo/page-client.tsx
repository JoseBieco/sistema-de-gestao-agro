"use client"

import { useState } from "react"
import { Plus, Edit, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createInsumo, updateInsumo } from "../actions"
import { toast } from "sonner"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  unidade_base: z.string().min(1, "Unidade é obrigatória"),
  descricao: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

export function InsumosCatalogoClient({ initialData }: { initialData: any[] }) {
  const [insumos, setInsumos] = useState(initialData)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      unidade_base: "",
      descricao: ""
    }
  })

  const handleOpenDialog = (insumo?: any) => {
    if (insumo) {
      setEditingId(insumo.id)
      form.reset({ nome: insumo.nome, unidade_base: insumo.unidade_base, descricao: insumo.descricao || "" })
    } else {
      setEditingId(null)
      form.reset({ nome: "", unidade_base: "", descricao: "" })
    }
    setIsOpen(true)
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      let result
      if (editingId) {
        result = await updateInsumo(editingId, data)
      } else {
        result = await createInsumo(data)
      }
      
      if (result.success) {
        toast.success(editingId ? "Insumo atualizado!" : "Insumo cadastrado!")
        if (editingId) {
          setInsumos(insumos.map(i => i.id === editingId ? { ...i, ...data } : i))
        } else {
          setInsumos([...insumos, result.data])
        }
        setIsOpen(false)
      } else {
        toast.error("Erro: " + result.error)
      }
    } catch (error) {
      toast.error("Erro ao salvar insumo.")
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => <div className="font-medium">{row.getValue("nome")}</div>,
    },
    {
      accessorKey: "unidade_base",
      header: "Unidade Base",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("unidade_base")}</Badge>,
    },
    {
      accessorKey: "estoque_em_cache",
      header: "Estoque Atual",
      cell: ({ row }) => {
        const value = parseFloat(row.getValue("estoque_em_cache") || "0")
        return <div>{value} {row.original.unidade_base}</div>
      }
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
      cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("descricao") || "-"}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const insumo = row.original
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
              <DropdownMenuItem asChild>
                <Link href={`/insumos/catalogo/${insumo.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleOpenDialog(insumo)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
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
        <h2 className="text-2xl font-bold tracking-tight">Todos os Insumos</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Novo Insumo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Insumo" : "Cadastrar Insumo Base"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Milho Grão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unidade_base"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade Base (Consumo Interno)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Kg, Litro, Mg" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        A menor unidade utilizada para consumo diário ou fracionado.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Detalhes adicionais..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Insumo"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable 
        columns={columns} 
        data={insumos} 
        searchKey="nome" 
        searchPlaceholder="Buscar insumos..." 
      />
    </div>
  )
}
