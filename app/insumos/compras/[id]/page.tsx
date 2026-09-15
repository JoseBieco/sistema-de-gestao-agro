import { AppShell } from "@/components/layout/app-shell"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Edit, Ban } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function DetalhesCompraPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const compra = await prisma.insumoCompra.findUnique({
    where: { id },
    include: {
      parceiro: true,
      itens: { include: { insumo: true } },
      parcelas: { orderBy: { numero_parcela: "asc" } },
      romaneios: { include: { itens: true } }
    },
  })

  if (!compra) return notFound()
  
  const podeEditar = compra.romaneios.length === 0
  const isCancelado = compra.status_entrega === "CANCELADO"
  const temParcelasPagas = compra.parcelas.some((p: any) => p.status === "PAGO")

  return (
    <AppShell title={`Pedido de Compra: ${compra.id.slice(0,8)}`}>
      <div className="space-y-6">
        
        {isCancelado && (
          <Alert variant={temParcelasPagas ? "default" : "destructive"} className={temParcelasPagas ? "bg-amber-50 text-amber-900 border-amber-200" : ""}>
            <Ban className={temParcelasPagas ? "h-4 w-4 text-amber-600" : "h-4 w-4"} />
            <AlertTitle>Pedido Cancelado</AlertTitle>
            <AlertDescription>
              {temParcelasPagas 
                ? "Este pedido foi cancelado, mas possui parcelas que já foram pagas anteriormente. As parcelas pendentes foram excluídas." 
                : "Este pedido de compra foi cancelado."}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Fornecedor: {compra.parceiro.nome}</h2>
            <p className="text-sm text-muted-foreground">Pedido em {new Date(compra.data_solicitacao).toLocaleDateString()}</p>
          </div>
          {podeEditar && (
            <Button asChild variant="outline">
              <Link href={`/insumos/compras/${compra.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" /> Editar Pedido
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status Entrega</CardTitle></CardHeader>
            <CardContent><Badge>{compra.status_entrega}</Badge></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status Financeiro</CardTitle></CardHeader>
            <CardContent><Badge variant="outline">{compra.status_pagamento}</Badge></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Itens (Frete+Custos)</CardTitle></CardHeader>
            <CardContent><div className="font-bold">R$ {compra.valor_itens.toFixed(2)} (+R$ {(Number(compra.valor_frete) + Number(compra.valor_outros_custos)).toFixed(2)})</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Pedido</CardTitle></CardHeader>
            <CardContent><div className="font-bold text-xl text-green-600">R$ {compra.valor_total.toFixed(2)}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Itens Solicitados</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead>Qtd. Compra</TableHead>
                  <TableHead>Vlr. Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Fator Base</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compra.itens.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.insumo.nome}</TableCell>
                    <TableCell>{Number(item.quantidade_compra)} {item.unidade_compra}</TableCell>
                    <TableCell>R$ {item.valor_unitario.toFixed(2)}</TableCell>
                    <TableCell>R$ {item.valor_total.toFixed(2)}</TableCell>
                    <TableCell>x{Number(item.fator_conversao)} = {Number(item.quantidade_compra) * Number(item.fator_conversao)} {item.insumo.unidade_medida}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {compra.romaneios.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Romaneios Recebidos</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Entrega</TableHead>
                    <TableHead>Recebedor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compra.romaneios.map(rom => (
                    <TableRow key={rom.id}>
                      <TableCell>{new Date(rom.data_entrega).toLocaleDateString()}</TableCell>
                      <TableCell>{rom.nome_recebedor || "-"}</TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" asChild>
                          <Link href={`/insumos/recebimento/${rom.id}`}>Ver Detalhes</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Parcelas</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compra.parcelas.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.numero_parcela}</TableCell>
                    <TableCell>{new Date(p.data_vencimento).toLocaleDateString()}</TableCell>
                    <TableCell>R$ {p.valor.toFixed(2)}</TableCell>
                    <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </AppShell>
  )
}
