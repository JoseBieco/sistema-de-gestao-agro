"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Edit, Trash2, ShieldAlert } from "lucide-react"
import { deleteOcorrencia } from "./actions"

export function DoencasPageClient({ initialOcorrencias }: { initialOcorrencias: any[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este protocolo/doença?")) {
      await deleteOcorrencia(id)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Protocolos Sanitários</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/sanitario/doencas/aplicar")}>
            Aplicar Tratamento
          </Button>
          <Button onClick={() => router.push("/sanitario/doencas/novo")}>
            <Plus className="mr-2 h-4 w-4" /> Nova Ocorrência
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialOcorrencias.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
            Nenhuma doença ou ocorrência cadastrada.
          </div>
        ) : (
          initialOcorrencias.map((ocorrencia) => (
            <Card key={ocorrencia.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  {ocorrencia.nome}
                </CardTitle>
                {ocorrencia.descricao && (
                  <CardDescription className="line-clamp-2">
                    {ocorrencia.descricao}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-semibold">Tratamento Padrão:</h4>
                  {ocorrencia.produtos_indicados.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Nenhum produto vinculado</span>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {ocorrencia.produtos_indicados.map((pi: any) => (
                        <li key={pi.id} className="text-muted-foreground">
                          • {pi.produto.nome} ({pi.dosagens.map((d: any) => d.nome_faixa).join(", ")})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
              <div className="border-t p-3 flex justify-end gap-2 bg-muted/10">
                <Button variant="outline" size="sm" onClick={() => router.push(`/sanitario/doencas/${ocorrencia.id}/editar`)}>
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(ocorrencia.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
