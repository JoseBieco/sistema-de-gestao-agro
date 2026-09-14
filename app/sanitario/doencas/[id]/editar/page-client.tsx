"use client"

import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save } from "lucide-react"
import { updateOcorrencia } from "../../actions"
import { toast } from "sonner"

export function EditarDoencaClient({ ocorrencia, produtos }: { ocorrencia: any, produtos: any[] }) {
  const router = useRouter()

  const defaultValues = {
    nome: ocorrencia.nome,
    descricao: ocorrencia.descricao || "",
    produtos: ocorrencia.produtos_indicados.map((p: any) => ({
      produto_id: p.produto_id,
      observacoes: p.observacoes || "",
      dosagens: p.dosagens.map((d: any) => ({
        nome_faixa: d.nome_faixa,
        quantidade: d.quantidade.toString()
      }))
    }))
  }

  const { register, control, handleSubmit } = useForm({ defaultValues })

  const { fields: produtoFields, append: appendProduto, remove: removeProduto } = useFieldArray({
    control,
    name: "produtos"
  })

  const onSubmit = async (data: any) => {
    const payload = {
      nome: data.nome,
      descricao: data.descricao,
      produtos: data.produtos.map((p: any) => ({
        produto_id: p.produto_id,
        observacoes: p.observacoes,
        dosagens: p.dosagens.map((d: any) => ({
          nome_faixa: d.nome_faixa,
          quantidade: parseFloat(d.quantidade || "0")
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
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Editar Protocolo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Ocorrência *</Label>
              <Input {...register("nome", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input {...register("descricao")} />
            </div>
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
                  <div className="space-y-2">
                    <Label>Selecione o Remédio/Vacina *</Label>
                    <select 
                      {...register(`produtos.${index}.produto_id` as const, { required: true })}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione...</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome} ({p.unidade_medida})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações de Aplicação</Label>
                    <Input {...register(`produtos.${index}.observacoes` as const)} />
                  </div>
                </div>

                <DosagensList control={control} register={register} produtoIndex={index} />

              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit"><Save className="w-4 h-4 mr-2"/> Salvar Alterações</Button>
        </div>
      </form>
    </div>
  )
}

function DosagensList({ control, register, produtoIndex }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `produtos.${produtoIndex}.dosagens`
  })

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-semibold">Faixas de Dosagem</Label>
        <Button type="button" variant="secondary" size="sm" onClick={() => append({ nome_faixa: "", quantidade: "" })}>
          <Plus className="h-3 w-3 mr-1" /> Nova Faixa
        </Button>
      </div>

      <div className="space-y-2 mt-2">
        {fields.map((field, dIndex) => (
          <div key={field.id} className="flex gap-2 items-center">
            <Input 
              {...register(`produtos.${produtoIndex}.dosagens.${dIndex}.nome_faixa`)} 
              placeholder="Nome" 
              className="flex-1"
              required
            />
            <Input 
              type="number"
              step="0.01"
              {...register(`produtos.${produtoIndex}.dosagens.${dIndex}.quantidade`)} 
              placeholder="Qtd" 
              className="w-24"
              required
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(dIndex)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
