import { AppShell } from "@/components/layout/app-shell"
import prisma from "@/lib/prisma"
import { InsumoRecebimentoClient } from "./page-client"

export default async function InsumosRecebimentoPage() {
  // Pega pedidos que ainda não foram totalmente entregues
  const comprasPendentes = await prisma.insumoCompra.findMany({
    where: {
      status_entrega: { in: ["PENDENTE", "PARCIALMENTE_ENTREGUE"] }
    },
    include: {
      parceiro: true,
      itens: {
        include: { insumo: true }
      }
    },
    orderBy: { data_solicitacao: "desc" }
  })

  return (
    <AppShell title="Recebimento de Insumos">
      <InsumoRecebimentoClient comprasPendentes={comprasPendentes || []} />
    </AppShell>
  )
}
