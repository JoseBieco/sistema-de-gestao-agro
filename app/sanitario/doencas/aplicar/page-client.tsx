"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { aplicarTratamento } from "../actions"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"

export function AplicarTratamentoClient({ animais, ocorrencias }: { animais: any[], ocorrencias: any[] }) {
  const router = useRouter()
  const [selectedAnimal, setSelectedAnimal] = useState("")
  const [selectedOcorrencia, setSelectedOcorrencia] = useState("")
  const [observacoes, setObservacoes] = useState("")
  
  // Mapeia produto_id -> quantidade selecionada (baseada na faixa)
  const [dosagensSelecionadas, setDosagensSelecionadas] = useState<Record<string, number>>({})

  const ocorrenciaAtual = ocorrencias.find(o => o.id === selectedOcorrencia)

  const handleOcorrenciaChange = (id: string) => {
    setSelectedOcorrencia(id)
    setDosagensSelecionadas({}) // Reseta as seleções ao trocar de protocolo
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAnimal || !selectedOcorrencia) {
      toast.error("Selecione o animal e o protocolo.")
      return
    }

    if (!ocorrenciaAtual) return

    // Verifica se todos os produtos têm uma dosagem selecionada
    const produtosAplicados: { produto_id: string, quantidade: number }[] = []
    
    for (const pi of ocorrenciaAtual.produtos_indicados) {
      const qtd = dosagensSelecionadas[pi.item_id]
      if (qtd === undefined) {
        toast.error(`Selecione uma dosagem para o produto: ${pi.produto.nome}`)
        return
      }
      produtosAplicados.push({
        produto_id: pi.item_id,
        quantidade: qtd
      })
    }

    const payload = {
      animal_id: selectedAnimal,
      ocorrencia_id: selectedOcorrencia,
      observacoes,
      produtos: produtosAplicados
    }

    const res = await aplicarTratamento(payload)
    if (res.success) {
      toast.success("Tratamento aplicado e estoque atualizado com sucesso!")
      router.push("/sanitario/doencas")
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Registro de Aplicação de Tratamento</CardTitle>
          <CardDescription>O sistema abaterá automaticamente do estoque os produtos selecionados.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Animal *</Label>
                <select 
                  required
                  value={selectedAnimal}
                  onChange={(e) => setSelectedAnimal(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Selecione o Animal...</option>
                  {animais.map(a => (
                    <option key={a.id} value={a.id}>{a.brinco} {a.nome ? `- ${a.nome}` : ""}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Protocolo / Ocorrência *</Label>
                <select 
                  required
                  value={selectedOcorrencia}
                  onChange={(e) => handleOcorrenciaChange(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Selecione...</option>
                  {ocorrencias.map(o => (
                    <option key={o.id} value={o.id}>{o.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações Gerais</Label>
              <Input 
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Animal apresentou febre antes da aplicação..."
              />
            </div>

            {ocorrenciaAtual && (
              <div className="mt-8 p-4 border rounded-lg bg-muted/10">
                <h3 className="font-semibold text-lg mb-4">Produtos a Aplicar ({ocorrenciaAtual.nome})</h3>
                
                {ocorrenciaAtual.produtos_indicados.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum produto cadastrado para este protocolo.</p>
                ) : (
                  <div className="space-y-4">
                    {ocorrenciaAtual.produtos_indicados.map((pi: any) => (
                      <div key={pi.id} className="p-4 bg-background border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium">{pi.produto.nome}</span>
                            <span className="text-xs ml-2 px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                              Estoque Atual: {pi.produto.estoque_atual} {pi.produto.unidade_medida}
                            </span>
                          </div>
                          {pi.observacoes && (
                            <span className="text-xs text-muted-foreground italic">Nota: {pi.observacoes}</span>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <Label className="text-sm mb-2 block">Selecione a Dosagem:</Label>
                          <div className="flex flex-wrap gap-2">
                            {pi.dosagens.map((d: any) => {
                              const isSelected = dosagensSelecionadas[pi.item_id] === d.quantidade;
                              return (
                                <Button
                                  key={d.id}
                                  type="button"
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setDosagensSelecionadas({
                                    ...dosagensSelecionadas,
                                    [pi.item_id]: d.quantidade
                                  })}
                                >
                                  {d.nome_faixa}: {d.quantidade} {pi.produto.unidade_medida}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit" disabled={!ocorrenciaAtual || ocorrenciaAtual.produtos_indicados.length === 0}>
                <CheckCircle className="w-4 h-4 mr-2"/>
                Confirmar Aplicação e Baixar Estoque
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
