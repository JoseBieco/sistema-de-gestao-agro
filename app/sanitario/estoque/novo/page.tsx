"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProdutoSanitario } from "../actions"

export default function NovoProdutoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "REMEDIO",
    quantidade_estoque: "",
    unidade_medida: "ml",
    indicacao: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createProdutoSanitario({
      ...formData,
      quantidade_estoque: parseFloat(formData.quantidade_estoque || "0")
    })
    router.push("/sanitario/estoque")
  }

  return (
    <AppShell title="Novo Produto Sanitário">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Remédio ou Vacina</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Produto *</Label>
                <Input 
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select 
                    value={formData.tipo}
                    onValueChange={(val) => setFormData({ ...formData, tipo: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REMEDIO">Remédio</SelectItem>
                      <SelectItem value="VACINA">Vacina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Unidade de Medida *</Label>
                  <Select 
                    value={formData.unidade_medida}
                    onValueChange={(val) => setFormData({ ...formData, unidade_medida: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="frasco">Frasco</SelectItem>
                      <SelectItem value="dose">Dose</SelectItem>
                      <SelectItem value="comprimido">Comprimido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estoque Inicial</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.quantidade_estoque}
                  onChange={(e) => setFormData({ ...formData, quantidade_estoque: e.target.value })}
                  placeholder="Deixe 0 se não tiver"
                />
              </div>

              <div className="space-y-2">
                <Label>Indicação (Para que serve)</Label>
                <Input 
                  value={formData.indicacao}
                  onChange={(e) => setFormData({ ...formData, indicacao: e.target.value })}
                  placeholder="Ex: Combate a carrapatos, Prevenção de febre aftosa..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Produto</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
