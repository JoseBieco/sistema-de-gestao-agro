import { AppShell } from "@/components/layout/app-shell"
import { ParcelasPageClient } from "./page-client"
import { getParcelas } from "./actions"

export default async function ParcelasPage() {
  const parcelas = await getParcelas()

  return (
    <AppShell title="Parcelas">
      <ParcelasPageClient initialParcelas={parcelas || []} />
    </AppShell>
  )
}
