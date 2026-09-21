import { AppShell } from "@/components/layout/app-shell"
import { VacinasPageClient } from "./page-client"
import { getTiposVacina } from "@/app/vacinas/actions"

export default async function VacinasPage() {
  const tiposVacina = await getTiposVacina()

  return (
    <AppShell title="Calendário Sanitário">
      <VacinasPageClient initialTipos={tiposVacina || []} />
    </AppShell>
  )
}
