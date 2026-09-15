"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash, Plus, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { createCompra } from "../../actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const itemSchema = z.object({
  insumo_id: z.string().min(1, "Selecione um insumo"),
  quantidade_compra: z.coerce.number().positive("Deve ser > 0"),
  unidade_compra: z.string().min(1, "Obrigatório"),
  fator_conversao: z.coerce.number().positive("Deve ser > 0"),
  valor_unitario: z.coerce.number().nonnegative("Deve ser >= 0")
})

const formSchema = z.object({
  parceiro_id: z.string().min(1, "Selecione um fornecedor"),
  data_solicitacao: z.string().min(1, "Data é obrigatória"),
  data_prevista_entrega: z.string().optional(),
  valor_frete: z.coerce.number().nonnegative(),
  valor_outros_custos: z.coerce.number().nonnegative(),
  observacoes: z.string().optional(),
  itens: z.array(itemSchema).min(1, "Adicione pelo menos um item"),
  gerar_parcelas: z.boolean().default(true),
  qtd_parcelas: z.coerce.number().min(1).default(1),
  forma_pagamento: z.string().default("dinheiro"),
  data_primeira_parcela: z.string().default(new Date().toISOString().split("T")[0])
})

type FormValues = z.infer<typeof formSchema>

export function InsumoCompraFormClient({ insumos, fornecedores }: { insumos: any[], fornecedores: any[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parceiro_id: "",
      data_solicitacao: new Date().toISOString().split("T")[0],
      data_prevista_entrega: "",
      valor_frete: 0,
      valor_outros_custos: 0,
      observacoes: "",
      itens: [{
        insumo_id: "",
        quantidade_compra: 1,
        unidade_compra: "",
        fator_conversao: 1,
        valor_unitario: 0
      }],
      gerar_parcelas: true,
      qtd_parcelas: 1,
      forma_pagamento: "dinheiro",
      data_primeira_parcela: new Date().toISOString().split("T")[0]
    }
  })

  const { fields: itensFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "itens"
  })

  const watchItens = form.watch("itens")
  const watchFrete = form.watch("valor_frete")
  const watchOutros = form.watch("valor_outros_custos")
  const watchGerarParcelas = form.watch("gerar_parcelas")

  const valorTotalItens = watchItens.reduce((acc, item) => acc + (Number(item.quantidade_compra) * Number(item.valor_unitario)), 0)
  const valorTotalGeral = valorTotalItens + Number(watchFrete) + Number(watchOutros)

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Gerar Parcelas
      const parcelas = []
      if (data.gerar_parcelas && data.qtd_parcelas > 0) {
        const valorPorParcela = valorTotalGeral / data.qtd_parcelas;
        let dataVenc = new Date(data.data_primeira_parcela);
        
        for (let i = 1; i <= data.qtd_parcelas; i++) {
          parcelas.push({
            numero_parcela: i,
            data_vencimento: dataVenc.toISOString().split("T")[0],
            valor: Number(valorPorParcela.toFixed(2)),
            forma_pagamento: data.forma_pagamento
          });
          dataVenc.setDate(dataVenc.getDate() + 30);
        }
      } else {
        parcelas.push({
          numero_parcela: 1,
          data_vencimento: data.data_solicitacao,
          valor: valorTotalGeral,
          forma_pagamento: "A_VISTA"
        });
      }

      const payload = {
        parceiro_id: data.parceiro_id,
        data_solicitacao: data.data_solicitacao,
        data_prevista_entrega: data.data_prevista_entrega,
        valor_frete: data.valor_frete,
        valor_outros_custos: data.valor_outros_custos,
        observacoes: data.observacoes,
        itens: data.itens,
        parcelas
      }

      const result = await createCompra(payload)

      if (result.success) {
        toast.success("Pedido gerado com sucesso!")
        router.push("/insumos/compras")
      } else {
        toast.error("Erro: " + result.error)
      }
    } catch (error) {
      toast.error("Erro ao gerar pedido.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pb-10">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Novo Pedido de Compra</h2>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Pedido"}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dados Principais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="parceiro_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o fornecedor..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fornecedores.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="data_solicitacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data do Pedido *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="data_prevista_entrega"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prevista para Entregar</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Custos Adicionais & Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valor_frete"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Frete (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valor_outros_custos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outros Custos (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Total do Pedido:</span>
                  <span className="text-xl font-bold text-green-600">
                    R$ {valorTotalGeral.toFixed(2)}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t space-y-4">
                  <h3 className="text-sm font-medium">Financeiro (Parcelas)</h3>
                  
                  <FormField
                    control={form.control}
                    name="gerar_parcelas"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Gerar parcelas no módulo financeiro</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {watchGerarParcelas && (
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <FormField
                        control={form.control}
                        name="forma_pagamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Forma Pagamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-9 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                <SelectItem value="pix">PIX</SelectItem>
                                <SelectItem value="boleto">Boleto</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="qtd_parcelas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Nº Parcelas</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" className="h-9 text-xs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="data_primeira_parcela"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Data 1ª Parcela</FormLabel>
                            <FormControl>
                              <Input type="date" className="h-9 text-xs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Itens da Compra</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => appendItem({
                insumo_id: "",
                quantidade_compra: 1,
                unidade_compra: "",
                fator_conversao: 1,
                valor_unitario: 0
              })}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Insumo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {form.formState.errors.itens?.root && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.itens.root.message}</p>
                )}
                {form.formState.errors.itens?.message && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.itens.message}</p>
                )}

                {itensFields.map((item, index) => (
                  <div key={item.id} className="flex gap-4 items-end border p-4 rounded-lg flex-wrap md:flex-nowrap">
                    <FormField
                      control={form.control}
                      name={`itens.${index}.insumo_id`}
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[200px]">
                          <FormLabel className="text-xs">Insumo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {insumos.map(i => (
                                <SelectItem key={i.id} value={i.id}>{i.nome} (Base: {i.unidade_medida})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.quantidade_compra`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel className="text-xs">Qtd</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0.01" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.unidade_compra`}
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormLabel className="text-xs">Unid. Compra</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Saco" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.fator_conversao`}
                      render={({ field }) => (
                        <FormItem className="w-20">
                          <FormLabel className="text-xs" title="Multiplicador para a unidade base">Fator</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.001" min="0.001" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.valor_unitario`}
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormLabel className="text-xs">R$ Unitário</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2 w-28">
                      <label className="text-xs font-medium">Subtotal</label>
                      <div className="h-10 flex items-center font-semibold text-sm">
                        R$ {(Number(watchItens[index]?.quantidade_compra || 0) * Number(watchItens[index]?.valor_unitario || 0)).toFixed(2)}
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="mb-1">
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
