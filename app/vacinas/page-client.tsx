"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Loader2, Syringe } from "lucide-react"
import type { TipoVacina } from "@/lib/types/database"

interface VacinasPageClientProps {
  initialTipos: TipoVacina[]
}

export function VacinasPageClient({ initialTipos }: VacinasPageClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [tipos, setTipos] = useState(initialTipos)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoVacina | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    doses_por_ano: 1,
    dias_entre_doses: 365,
    obrigatoria: false,
    apenas_femeas: false,
  })

  function openDialog(tipo?: TipoVacina) {
    if (tipo) {
      setEditingTipo(tipo)
      setFormData({
        nome: tipo.nome,
        descricao: tipo.descricao || "",
        doses_por_ano: tipo.doses_por_ano,
        dias_entre_doses: tipo.dias_entre_doses,
        obrigatoria: tipo.obrigatoria,
        apenas_femeas: tipo.apenas_femeas,
      })
    } else {
      setEditingTipo(null)
      setFormData({
        nome: "",
        descricao: "",
        doses_por_ano: 1,
        dias_entre_doses: 365,
        obrigatoria: false,
        apenas_femeas: false,
      })
    }
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formData.nome.trim()) return
    setLoading(true)

    try {
      if (editingTipo) {
        const { error } = await supabase.from("tipos_vacina").update(formData).eq("id", editingTipo.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("tipos_vacina").insert(formData)
        if (error) throw error
      }

      const { data } = await supabase.from("tipos_vacina").select("*").order("nome")
      if (data) setTipos(data)
      setDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar tipo de vacina:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este tipo de vacina?")) return

    try {
      const { error } = await supabase.from("tipos_vacina").delete().eq("id", id)
      if (error) throw error

      setTipos(tipos.filter((t) => t.id !== id))
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir tipo de vacina:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Cadastro de Vacinas
          </CardTitle>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Vacina
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Doses/Ano</TableHead>
                <TableHead>Intervalo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.length > 0 ? (
                tipos.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tipo.nome}</p>
                        {tipo.descricao && <p className="text-xs text-muted-foreground">{tipo.descricao}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{tipo.doses_por_ano}x</TableCell>
                    <TableCell>{tipo.dias_entre_doses} dias</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tipo.obrigatoria && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatória
                          </Badge>
                        )}
                        {tipo.apenas_femeas && (
                          <Badge variant="secondary" className="text-xs">
                            Apenas Fêmeas
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(tipo)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tipo.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum tipo de vacina cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTipo ? "Editar Vacina" : "Nova Vacina"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Febre Aftosa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição da vacina (opcional)"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="doses_por_ano">Doses por Ano</Label>
                <Input
                  id="doses_por_ano"
                  type="number"
                  min={1}
                  value={formData.doses_por_ano}
                  onChange={(e) => setFormData({ ...formData, doses_por_ano: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dias_entre_doses">Dias entre Doses</Label>
                <Input
                  id="dias_entre_doses"
                  type="number"
                  min={1}
                  value={formData.dias_entre_doses}
                  onChange={(e) =>
                    setFormData({ ...formData, dias_entre_doses: Number.parseInt(e.target.value) || 365 })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="obrigatoria">Vacina Obrigatória</Label>
                <p className="text-xs text-muted-foreground">Exigida pela legislação</p>
              </div>
              <Switch
                id="obrigatoria"
                checked={formData.obrigatoria}
                onCheckedChange={(checked) => setFormData({ ...formData, obrigatoria: checked })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="apenas_femeas">Apenas Fêmeas</Label>
                <p className="text-xs text-muted-foreground">Ex: Brucelose</p>
              </div>
              <Switch
                id="apenas_femeas"
                checked={formData.apenas_femeas}
                onCheckedChange={(checked) => setFormData({ ...formData, apenas_femeas: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.nome.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTipo ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
