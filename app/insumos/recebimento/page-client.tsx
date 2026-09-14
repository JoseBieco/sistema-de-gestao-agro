"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { receiveRomaneio } from "../actions"

export function InsumoRecebimentoClient({ comprasPendentes }: { comprasPendentes: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [compraSelecionadaId, setCompraSelecionadaId] = useState("")
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().split("T")[0])
  const [recebedor, setRecebedor] = useState("")
  
  // Estado para armazenar os dados preenchidos dos itens (qtd, lote, validade)
  const [itensRecebimento, setItensRecebimento] = useState<Record<string, any>>({})

  const compraSelecionada = comprasPendentes.find(c => c.id === compraSelecionadaId)

  const handleSelecionarCompra = (id: string) => {
    setCompraSelecionadaId(id)
    const compra = comprasPendentes.find(c => c.id === id)
    if (compra) {
      // Preencher o state inicial baseado nos itens da compra
      const initialItems: Record<string, any> = {}
      compra.itens.forEach((item: any) => {
        initialItems[item.id] = {
          insumo_compra_item_id: item.id,
          quantidade_entregue: item.quantidade_compra, // sugere a qtd total
          numero_lote: "",
          data_validade: ""
        }
      })
      setItensRecebimento(initialItems)
    }
  }

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setItensRecebimento(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!compraSelecionada) return

    setLoading(true)

    // Filtra itens com qtd maior que 0
    const itensParaEnviar = Object.values(itensRecebimento)
      .filter(i => Number(i.quantidade_entregue) > 0)
      .map(i => ({
        ...i,
        quantidade_entregue: Number(i.quantidade_entregue)
      }))

    if (itensParaEnviar.length === 0) {
      toast.error("Você precisa informar a quantidade entregue de pelo menos um item.")
      setLoading(false)
      return
    }

    const payload = {
      insumo_compra_id: compraSelecionada.id,
      data_entrega: dataEntrega,
      nome_recebedor: recebedor,
      itens_recebidos: itensParaEnviar
    }

    const result = await receiveRomaneio(payload)

    if (result.success) {
      toast.success("Romaneio recebido e Kardex atualizado com sucesso!")
      router.push("/insumos")
    } else {
      toast.error("Erro: " + result.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Pedido Pendente</CardTitle>
        </CardHeader>
        <CardContent>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={compraSelecionadaId}
            onChange={e => handleSelecionarCompra(e.target.value)}
          >
            <option value="">Selecione um pedido pendente...</option>
            {comprasPendentes.map(c => (
              <option key={c.id} value={c.id}>
                {new Date(c.data_solicitacao).toLocaleDateString("pt-BR")} - {c.parceiro?.nome} (R$ {c.valor_total})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {compraSelecionada && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Romaneio (Entrega)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data da Chegada</label>
                  <Input type="date" required value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quem Recebeu (Assinatura)</label>
                  <Input value={recebedor} onChange={e => setRecebedor(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conferência de Itens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {compraSelecionada.itens.map((item: any) => {
                  const stateItem = itensRecebimento[item.id]
                  if (!stateItem) return null

                  return (
                    <div key={item.id} className="grid grid-cols-4 gap-4 p-4 border rounded-lg items-end bg-muted/50">
                      <div>
                        <p className="font-semibold">{item.insumo?.nome}</p>
                        <p className="text-xs text-muted-foreground">Comprado: {item.quantidade_compra} {item.unidade_compra}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Qtd Chegou ({item.unidade_compra})</label>
                        <Input type="number" step="0.01" min="0" value={stateItem.quantidade_entregue} onChange={e => handleItemChange(item.id, "quantidade_entregue", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Lote (Opcional)</label>
                        <Input placeholder="Ex: LT-450" value={stateItem.numero_lote} onChange={e => handleItemChange(item.id, "numero_lote", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Validade (Opcional)</label>
                        <Input type="date" value={stateItem.data_validade} onChange={e => handleItemChange(item.id, "data_validade", e.target.value)} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? "Processando Kardex..." : "Confirmar Recebimento e Alimentar Estoque"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}
