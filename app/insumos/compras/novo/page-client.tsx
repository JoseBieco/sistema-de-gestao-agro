"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash, Plus } from "lucide-react"
import { toast } from "sonner"
import { createCompra } from "../../actions"

export function InsumoCompraFormClient({ insumos, fornecedores }: { insumos: any[], fornecedores: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    parceiro_id: "",
    data_solicitacao: new Date().toISOString().split("T")[0],
    data_prevista_entrega: "",
    valor_frete: 0,
    valor_outros_custos: 0,
    observacoes: ""
  })

  const [itens, setItens] = useState([{
    insumo_id: "",
    quantidade_compra: 1,
    unidade_compra: "",
    fator_conversao: 1,
    valor_unitario: 0
  }])

  const handleAddItem = () => {
    setItens([...itens, { insumo_id: "", quantidade_compra: 1, unidade_compra: "", fator_conversao: 1, valor_unitario: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItens = [...itens]
    newItens[index] = { ...newItens[index], [field]: value }
    setItens(newItens)
  }

  const valorTotalItens = itens.reduce((acc, item) => acc + (item.quantidade_compra * item.valor_unitario), 0)
  const valorTotalGeral = valorTotalItens + Number(formData.valor_frete) + Number(formData.valor_outros_custos)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.parceiro_id) {
      toast.error("Selecione um fornecedor.")
      return
    }
    if (itens.some(i => !i.insumo_id || i.quantidade_compra <= 0 || i.valor_unitario <= 0)) {
      toast.error("Preencha todos os itens corretamente.")
      return
    }

    setLoading(true)

    // Criar parcela única automaticamente (pode ser evoluído depois)
    const parcelas = [{
      numero_parcela: 1,
      data_vencimento: formData.data_solicitacao,
      valor: valorTotalGeral,
      forma_pagamento: "A_VISTA"
    }]

    const payload = {
      ...formData,
      valor_frete: Number(formData.valor_frete),
      valor_outros_custos: Number(formData.valor_outros_custos),
      itens: itens.map(i => ({
        ...i,
        quantidade_compra: Number(i.quantidade_compra),
        fator_conversao: Number(i.fator_conversao),
        valor_unitario: Number(i.valor_unitario)
      })),
      parcelas
    }

    const result = await createCompra(payload)

    if (result.success) {
      toast.success("Pedido gerado com sucesso!")
      router.push("/insumos/compras")
    } else {
      toast.error("Erro: " + result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Novo Pedido de Compra</h2>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Pedido"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fornecedor</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.parceiro_id}
                onChange={e => setFormData({...formData, parceiro_id: e.target.value})}
                required
              >
                <option value="">Selecione...</option>
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data do Pedido</label>
                <Input type="date" required value={formData.data_solicitacao} onChange={e => setFormData({...formData, data_solicitacao: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prevista para Entregar</label>
                <Input type="date" value={formData.data_prevista_entrega} onChange={e => setFormData({...formData, data_prevista_entrega: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custos Adicionais & Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Frete (R$)</label>
                <Input type="number" step="0.01" min="0" value={formData.valor_frete} onChange={e => setFormData({...formData, valor_frete: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Outros Custos (R$)</label>
                <Input type="number" step="0.01" min="0" value={formData.valor_outros_custos} onChange={e => setFormData({...formData, valor_outros_custos: Number(e.target.value)})} />
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg flex justify-between items-center">
              <span className="font-semibold">Total do Pedido:</span>
              <span className="text-xl font-bold text-green-600">
                R$ {valorTotalGeral.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Itens da Compra</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Insumo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {itens.map((item, index) => (
              <div key={index} className="flex gap-4 items-end border p-4 rounded-lg">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Insumo</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={item.insumo_id}
                    onChange={e => handleItemChange(index, "insumo_id", e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {insumos.map(i => (
                      <option key={i.id} value={i.id}>{i.nome} (Base: {i.unidade_base})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 w-32">
                  <label className="text-sm font-medium">Qtd</label>
                  <Input type="number" step="0.01" min="0.01" value={item.quantidade_compra} onChange={e => handleItemChange(index, "quantidade_compra", e.target.value)} required />
                </div>
                <div className="space-y-2 w-32">
                  <label className="text-sm font-medium">Unidade (Compra)</label>
                  <Input placeholder="Ex: Tonelada" value={item.unidade_compra} onChange={e => handleItemChange(index, "unidade_compra", e.target.value)} required />
                </div>
                <div className="space-y-2 w-24">
                  <label className="text-sm font-medium">Fator</label>
                  <Input type="number" step="0.001" min="0.001" value={item.fator_conversao} onChange={e => handleItemChange(index, "fator_conversao", e.target.value)} required title="Multiplicador para a unidade base" />
                </div>
                <div className="space-y-2 w-32">
                  <label className="text-sm font-medium">R$ Unitário</label>
                  <Input type="number" step="0.01" min="0" value={item.valor_unitario} onChange={e => handleItemChange(index, "valor_unitario", e.target.value)} required />
                </div>
                <div className="space-y-2 w-28">
                  <label className="text-sm font-medium">Subtotal</label>
                  <div className="h-10 flex items-center font-semibold">
                    R$ {(item.quantidade_compra * item.valor_unitario).toFixed(2)}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
