import { AppShell } from "@/components/layout/app-shell"
import { getInsumos } from "../../actions"
import { InsumoCompraFormClient } from "./page-client"
import prisma from "@/lib/prisma"

export default async function NovoPedidoCompraPage() {
  const insumos = await getInsumos()
  // Pega apenas fornecedores, assumindo que eles têm o tipo 'fornecedor_insumo' 
  // (ou pegamos todos e filtramos no cliente para evitar erros se não tiverem esse tipo ainda)
  const fornecedores = await prisma.parceiro.findMany({
    orderBy: { nome: "asc" }
  })

  return (
    <AppShell title="Novo Pedido de Compra">
      <InsumoCompraFormClient insumos={insumos || []} fornecedores={fornecedores || []} />
    </AppShell>
  )
}
