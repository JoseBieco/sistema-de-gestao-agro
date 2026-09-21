import { AppShell } from "@/components/layout/app-shell"
import { ParcelasPageClient } from "./page-client"
import { getAllParcelasUnified } from "./actions"

export default async function ParcelasPage() {
  const parcelas = await getAllParcelasUnified()

  return (
    <AppShell title="Parcelas">
      <ParcelasPageClient initialParcelas={parcelas || []} />
    </AppShell>
  )
}
