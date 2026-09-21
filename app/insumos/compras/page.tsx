import { AppShell } from "@/components/layout/app-shell"
import { getCompras } from "../actions"
import { InsumosComprasClient } from "./page-client"

export default async function ComprasInsumosPage() {
  const compras = await getCompras()

  return (
    <AppShell title="Pedidos de Compra">
      <InsumosComprasClient initialData={compras || []} />
    </AppShell>
  )
}
