import { AppShell } from "@/components/layout/app-shell"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function DetalhesInsumoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const insumo = await prisma.insumo.findUnique({
    where: { id },
    include: {
      movimentacoes: {
        orderBy: { data_transacao: "desc" },
        take: 50 // Limitando aos últimos 50 para o extrato rápido
      }
    }
  })

  if (!insumo) return notFound()

  return (
    <AppShell title={`Detalhes: ${insumo.nome}`}>
      <div className="space-y-6">
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
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead>Custo Médio Unit.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insumo.movimentacoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Nenhuma movimentação registrada.</TableCell>
                  </TableRow>
                ) : (
                  insumo.movimentacoes.map(mov => {
                    const isEntrada = mov.quantidade > 0
                    return (
                      <TableRow key={mov.id}>
                        <TableCell>{new Date(mov.data_transacao).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="outline">{mov.tipo_transacao}</Badge></TableCell>
                        <TableCell className={`text-right font-bold ${isEntrada ? 'text-green-600' : 'text-red-600'}`}>
                          {isEntrada ? '+' : ''}{mov.quantidade}
                        </TableCell>
                        <TableCell>R$ {mov.custo_por_unidade?.toFixed(4) || '-'}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
