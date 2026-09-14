"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { receiveRomaneio } from "../actions"

const itemSchema = z.object({
  insumo_compra_item_id: z.string(),
  nome_insumo: z.string(),
  unidade_compra: z.string(),
  quantidade_pedida: z.number(),
  quantidade_entregue: z.coerce.number().min(0, "Quantidade não pode ser negativa"),
  numero_lote: z.string().optional(),
  data_validade: z.string().optional()
})

const formSchema = z.object({
  compra_id: z.string().min(1, "Selecione um pedido pendente"),
  data_entrega: z.string().min(1, "Data da chegada é obrigatória"),
  nome_recebedor: z.string().optional(),
  itens: z.array(itemSchema)
})

type FormValues = z.infer<typeof formSchema>

export function InsumoRecebimentoClient({ comprasPendentes }: { comprasPendentes: any[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      compra_id: "",
      data_entrega: new Date().toISOString().split("T")[0],
      nome_recebedor: "",
      itens: []
    }
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "itens"
  })

  const watchCompraId = form.watch("compra_id")

  useEffect(() => {
    if (watchCompraId) {
      const compra = comprasPendentes.find(c => c.id === watchCompraId)
      if (compra) {
        replace(compra.itens.map((item: any) => ({
          insumo_compra_item_id: item.id,
          nome_insumo: item.insumo?.nome || "Insumo Desconhecido",
          unidade_compra: item.unidade_compra,
          quantidade_pedida: Number(item.quantidade_compra),
          quantidade_entregue: Number(item.quantidade_compra),
          numero_lote: "",
          data_validade: ""
        })))
      }
    } else {
      replace([])
    }
  }, [watchCompraId, comprasPendentes, replace])

  const onSubmit = async (data: FormValues) => {
    const itensParaEnviar = data.itens.filter(i => i.quantidade_entregue > 0)
    
    if (itensParaEnviar.length === 0) {
      toast.error("Você precisa informar a quantidade entregue de pelo menos um item.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        insumo_compra_id: data.compra_id,
        data_entrega: data.data_entrega,
        nome_recebedor: data.nome_recebedor || "",
        itens_recebidos: itensParaEnviar.map(i => ({
          insumo_compra_item_id: i.insumo_compra_item_id,
          quantidade_entregue: i.quantidade_entregue,
          numero_lote: i.numero_lote || "",
          data_validade: i.data_validade || ""
        }))
      }

      const result = await receiveRomaneio(payload)

      if (result.success) {
        toast.success("Romaneio recebido e Kardex atualizado com sucesso!")
        router.push("/insumos")
      } else {
        toast.error("Erro: " + result.error)
      }
    } catch (error) {
      toast.error("Erro ao processar recebimento.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Pedido Pendente</CardTitle>
              <CardDescription>Apenas pedidos aguardando entrega são listados.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="compra_id"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um pedido pendente..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {comprasPendentes.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {new Date(c.data_solicitacao).toLocaleDateString("pt-BR")} - {c.parceiro?.nome} (R$ {c.valor_total})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {watchCompraId && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Romaneio (Entrega)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="data_entrega"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data da Chegada *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nome_recebedor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quem Recebeu (Assinatura)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
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
                  <CardTitle>Conferência de Itens</CardTitle>
                  <CardDescription>Verifique o que chegou fisicamente. Zerar um item significa que ele não chegou.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg items-end bg-muted/20">
                        <div className="md:col-span-1">
                          <p className="font-semibold text-sm">{field.nome_insumo}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Comprado: {field.quantidade_pedida} {field.unidade_compra}
                          </p>
                        </div>
                        <FormField
                          control={form.control}
                          name={`itens.${index}.quantidade_entregue`}
                          render={({ field: subField }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Qtd Chegou ({field.unidade_compra})</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0" {...subField} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`itens.${index}.numero_lote`}
                          render={({ field: subField }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Lote (Opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: LT-450" {...subField} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`itens.${index}.data_validade`}
                          render={({ field: subField }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Validade (Opcional)</FormLabel>
                              <FormControl>
                                <Input type="date" {...subField} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? "Processando Kardex..." : "Confirmar Recebimento e Alimentar Estoque"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </form>
      </Form>
    </div>
  )
}
