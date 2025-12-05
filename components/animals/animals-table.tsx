"use client"

import { useState } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AnimalStatusDialog } from "./animal-status-dialog"
import { calcularIdade, getStatusColor } from "@/lib/utils/format"
import { MoreHorizontal, Eye, Edit, RefreshCw } from "lucide-react"
import type { Animal } from "@/lib/types/database"

interface AnimalsTableProps {
  animals: Animal[]
  onRefresh: () => void
}

export function AnimalsTable({ animals, onRefresh }: AnimalsTableProps) {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  const columns: ColumnDef<Animal>[] = [
    {
      accessorKey: "numero_brinco",
      header: "Brinco",
      cell: ({ row }) => <span className="font-medium">{row.original.numero_brinco || "-"}</span>,
    },
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => row.original.nome || "-",
    },
    {
      accessorKey: "genero",
      header: "Gênero",
      cell: ({ row }) => (
        <Badge variant={row.original.genero === "M" ? "default" : "secondary"}>
          {row.original.genero === "M" ? "Macho" : "Fêmea"}
        </Badge>
      ),
    },
    {
      accessorKey: "raca",
      header: "Raça",
      cell: ({ row }) => row.original.raca?.nome || "-",
    },
    {
      accessorKey: "data_nascimento",
      header: "Idade",
      cell: ({ row }) => (row.original.data_nascimento ? calcularIdade(row.original.data_nascimento) : "-"),
    },
    {
      accessorKey: "origem",
      header: "Origem",
      cell: ({ row }) => <span className="capitalize">{row.original.origem}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const animal = row.original

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
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/animais/${animal.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/animais/${animal.id}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAnimal(animal)
                  setStatusDialogOpen(true)
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Alterar status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={animals} searchKey="numero_brinco" searchPlaceholder="Buscar por brinco..." />
      <AnimalStatusDialog
        animal={selectedAnimal}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  )
}
