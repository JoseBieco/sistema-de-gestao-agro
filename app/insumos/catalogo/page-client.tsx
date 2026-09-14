"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createInsumo } from "../actions"
import { toast } from "sonner"

export function InsumosCatalogoClient({ initialData }: { initialData: any[] }) {
  const [insumos, setInsumos] = useState(initialData)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ nome: "", unidade_base: "", descricao: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await createInsumo(formData)
    
    if (result.success) {
      toast.success("Insumo cadastrado com sucesso!")
      setInsumos([...insumos, result.data])
      setIsOpen(false)
      setFormData({ nome: "", unidade_base: "", descricao: "" })
    } else {
      toast.error("Erro ao cadastrar: " + result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">Todos os Insumos</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Insumo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Insumo Base</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Produto</label>
                <Input 
                  placeholder="Ex: Milho Grão" 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidade Base (Consumo Interno)</label>
                <Input 
                  placeholder="Ex: Kg, Litro, Mg" 
                  value={formData.unidade_base}
                  onChange={e => setFormData({...formData, unidade_base: e.target.value})}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A menor unidade utilizada para consumo diário ou fracionado.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição (Opcional)</label>
                <Input 
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Insumo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade Base</TableHead>
                <TableHead>Estoque Atual (Cache)</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insumos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhum insumo cadastrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                insumos.map((insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell className="font-medium">{insumo.nome}</TableCell>
                    <TableCell>{insumo.unidade_base}</TableCell>
                    <TableCell>{insumo.estoque_em_cache} {insumo.unidade_base}</TableCell>
                    <TableCell className="text-muted-foreground">{insumo.descricao || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
