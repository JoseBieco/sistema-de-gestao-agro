"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import { updateOcorrencia } from "../../actions"
import { toast } from "sonner"

const dosagemSchema = z.object({
  nome_faixa: z.string().min(1, "Nome da faixa é obrigatório"),
  quantidade: z.coerce.number().positive("Quantidade deve ser maior que zero")
})

const produtoSchema = z.object({
  produto_id: z.string().min(1, "Selecione um produto"),
  observacoes: z.string().optional(),
  dosagens: z.array(dosagemSchema).min(1, "Adicione pelo menos uma dosagem")
})

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  produtos: z.array(produtoSchema).min(1, "Adicione pelo menos um produto ao tratamento")
})

type OcorrenciaFormValues = z.infer<typeof formSchema>

export function EditarDoencaClient({ ocorrencia, produtos }: { ocorrencia: any, produtos: any[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues = {
    nome: ocorrencia.nome,
    descricao: ocorrencia.descricao || "",
    produtos: ocorrencia.produtos_indicados.map((p: any) => ({
      produto_id: p.produto_id,
      observacoes: p.observacoes || "",
      dosagens: p.dosagens.map((d: any) => ({
        nome_faixa: d.nome_faixa,
        quantidade: d.quantidade
      }))
    }))
  }

  const form = useForm<OcorrenciaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  const { fields: produtoFields, append: appendProduto, remove: removeProduto } = useFieldArray({
    control: form.control,
    name: "produtos"
  })

  const onSubmit = async (data: OcorrenciaFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        nome: data.nome,
        descricao: data.descricao || "",
        produtos: data.produtos.map(p => ({
          produto_id: p.produto_id,
          observacoes: p.observacoes || "",
          dosagens: p.dosagens.map(d => ({
            nome_faixa: d.nome_faixa,
            quantidade: d.quantidade
          }))
        }))
      }

      const res = await updateOcorrencia(ocorrencia.id, payload)
      if (res.success) {
        toast.success("Ocorrência atualizada com sucesso!")
        router.push("/sanitario/doencas")
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error("Erro ao atualizar ocorrência.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-4">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar Protocolo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Ocorrência *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Protocolo de Tratamento</CardTitle>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => appendProduto({ produto_id: "", observacoes: "", dosagens: [] })}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {produtoFields.length === 0 && (
                <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                  Nenhum produto vinculado ainda. Clique em "Adicionar Produto" acima.
                </div>
              )}
              {form.formState.errors.produtos?.root && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.produtos.root.message}</p>
              )}
              {form.formState.errors.produtos?.message && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.produtos.message}</p>
              )}

              {produtoFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg relative bg-muted/20">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-destructive"
                    onClick={() => removeProduto(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <h4 className="font-semibold mb-4">Produto {index + 1}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name={`produtos.${index}.produto_id`}
                      render={({ field: subField }) => (
                        <FormItem>
                          <FormLabel>Selecione o Remédio/Vacina *</FormLabel>
                          <Select onValueChange={subField.onChange} defaultValue={subField.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {produtos.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nome} ({p.unidade_medida})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`produtos.${index}.observacoes`}
                      render={({ field: subField }) => (
                        <FormItem>
                          <FormLabel>Observações de Aplicação</FormLabel>
                          <FormControl>
                            <Input {...subField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DosagensList control={form.control} produtoIndex={index} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : <><Save className="w-4 h-4 mr-2"/> Salvar Alterações</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

function DosagensList({ control, produtoIndex }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `produtos.${produtoIndex}.dosagens`
  })

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-semibold">Faixas de Dosagem</Label>
        <Button type="button" variant="secondary" size="sm" onClick={() => append({ nome_faixa: "", quantidade: undefined as any })}>
          <Plus className="h-3 w-3 mr-1" /> Nova Faixa
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">Adicione ao menos uma dosagem</p>
      ) : (
        <div className="space-y-2 mt-2">
          {fields.map((field, dIndex) => (
            <div key={field.id} className="flex gap-2 items-start">
              <FormField
                control={control}
                name={`produtos.${produtoIndex}.dosagens.${dIndex}.nome_faixa`}
                render={({ field: subField }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Nome" {...subField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`produtos.${produtoIndex}.dosagens.${dIndex}.quantidade`}
                render={({ field: subField }) => (
                  <FormItem className="w-24">
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Qtd" {...subField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(dIndex)} className="text-destructive mt-0.5">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
