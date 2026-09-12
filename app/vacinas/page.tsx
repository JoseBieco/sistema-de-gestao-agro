import { AppShell } from "@/components/layout/app-shell"
import { VacinasPageClient } from "./page-client"
import { getTiposVacina } from "./actions"

export default async function VacinasPage() {
  const tiposVacina = await getTiposVacina()

  return (
    <AppShell title="Tipos de Vacina">
      <VacinasPageClient initialTipos={tiposVacina || []} />
    </AppShell>
  )
}
