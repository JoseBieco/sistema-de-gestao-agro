"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProdutoSanitario } from "../actions"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

const formSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  tipo: z.enum(["REMEDIO", "VACINA"]),
  unidade_medida: z.string().min(1, "Selecione uma unidade"),
  quantidade_estoque: z.coerce.number().min(0, "O estoque não pode ser negativo").optional().default(0),
  indicacao: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

export default function NovoProdutoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      tipo: "REMEDIO",
      quantidade_estoque: 0,
      unidade_medida: "ml",
      indicacao: ""
    }
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      await createProdutoSanitario({
        ...data,
        quantidade_estoque: data.quantidade_estoque || 0
      })
      toast.success("Produto criado com sucesso!")
      router.push("/sanitario/estoque")
    } catch (error) {
      toast.error("Erro ao criar produto.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell title="Novo Produto Sanitário">
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Remédio ou Vacina</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ivermectina" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="REMEDIO">Remédio</SelectItem>
                            <SelectItem value="VACINA">Vacina</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unidade_medida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade de Medida *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="mg">mg</SelectItem>
                            <SelectItem value="frasco">Frasco</SelectItem>
                            <SelectItem value="dose">Dose</SelectItem>
                            <SelectItem value="comprimido">Comprimido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="quantidade_estoque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Inicial</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="indicacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indicação (Para que serve)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Combate a carrapatos, Prevenção de febre aftosa..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar Produto"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
