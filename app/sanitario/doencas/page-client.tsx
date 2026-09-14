"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, MoreHorizontal, ShieldAlert } from "lucide-react"
import { deleteOcorrencia } from "./actions"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export function DoencasPageClient({ initialOcorrencias }: { initialOcorrencias: any[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este protocolo/doença?")) {
      try {
        await deleteOcorrencia(id)
        toast.success("Protocolo excluído com sucesso!")
        router.refresh()
      } catch (error) {
        toast.error("Erro ao excluir protocolo.")
      }
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="h-4 w-4 text-primary" />
          {row.getValue("nome")}
        </div>
      ),
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
      cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue("descricao") || "-"}</div>,
    },
    {
      id: "tratamento",
      header: "Tratamento Padrão",
      cell: ({ row }) => {
        const produtos = row.original.produtos_indicados
        if (!produtos || produtos.length === 0) {
          return <span className="text-muted-foreground text-sm">Nenhum</span>
        }
        return (
          <div className="flex flex-col gap-1 text-sm">
            {produtos.map((pi: any) => (
              <span key={pi.id}>
                {pi.produto.nome} ({pi.dosagens?.map((d: any) => d.nome_faixa).join(", ")})
              </span>
            ))}
          </div>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ocorrencia = row.original
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
              <DropdownMenuItem onClick={() => router.push(`/sanitario/doencas/${ocorrencia.id}/editar`)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(ocorrencia.id)} className="text-destructive focus:text-destructive">
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
        <h2 className="text-2xl font-bold tracking-tight">Protocolos Sanitários</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/sanitario/doencas/aplicar")}>
            Aplicar Tratamento
          </Button>
          <Button onClick={() => router.push("/sanitario/doencas/novo")}>
            <Plus className="mr-2 h-4 w-4" /> Nova Ocorrência
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={initialOcorrencias} 
        searchKey="nome" 
        searchPlaceholder="Buscar protocolos..." 
      />
    </div>
  )
}
