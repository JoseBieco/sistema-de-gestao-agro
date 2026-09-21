import { AppShell } from "@/components/layout/app-shell"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function RecebimentoDetalhesPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const romaneio = await prisma.romaneioEntrega.findUnique({
    where: { id },
    include: {
      compra: { include: { parceiro: true } },
      itens: { 
        include: { 
          compra_item: { 
            include: { insumo: true } 
          } 
        } 
      }
    }
  })

  if (!romaneio) return notFound()

  return (
    <AppShell title={`Romaneio de Entrega`}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Recebimento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fornecedor</p>
              <p className="font-medium">{romaneio.compra.parceiro.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data da Entrega</p>
              <p className="font-medium">{new Date(romaneio.data_entrega).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recebedor (Funcionário)</p>
              <p className="font-medium">{romaneio.nome_recebedor || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pedido de Compra Original</p>
              <p className="font-medium">#{romaneio.insumo_compra_id.slice(0, 8)}</p>
            </div>
            {romaneio.observacoes && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                <p className="text-sm">{romaneio.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens Recebidos neste Romaneio</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead>Qtd. Recebida (Compra)</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Fator &rarr; Base</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {romaneio.itens.map((item: any) => {
                  const fator = item.compra_item.fator_conversao
                  const baseQty = item.quantidade_entregue * fator
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.compra_item.insumo.nome}</TableCell>
                      <TableCell>{item.quantidade_entregue} {item.compra_item.unidade_compra}</TableCell>
                      <TableCell>{item.numero_lote || "-"}</TableCell>
                      <TableCell>{item.data_validade ? new Date(item.data_validade).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>x{fator} = {baseQty} {item.compra_item.insumo.unidade_medida}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
