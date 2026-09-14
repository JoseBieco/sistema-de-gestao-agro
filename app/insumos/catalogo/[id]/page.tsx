import { AppShell } from "@/components/layout/app-shell"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExtratoClient } from "./extrato-client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DetalhesInsumoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const insumo = await prisma.insumo.findUnique({
    where: { id },
    include: {
      movimentacoes: {
        orderBy: { data_transacao: "desc" },
        take: 50
      }
    }
  })

  if (!insumo) return notFound()

  return (
    <AppShell title={`Detalhes: ${insumo.nome}`}>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/insumos/catalogo">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insumo.estoque_em_cache} <span className="text-lg font-normal text-muted-foreground">{insumo.unidade_base}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unidade Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insumo.unidade_base}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Extrato Recente (Kardex)</CardTitle>
          </CardHeader>
          <CardContent>
            <ExtratoClient movimentacoes={insumo.movimentacoes} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
