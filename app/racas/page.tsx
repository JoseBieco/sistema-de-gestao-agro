import { AppShell } from "@/components/layout/app-shell"
import { RacasPageClient } from "./page-client"
import { getRacas } from "./actions"

export default async function RacasPage() {
  const racas = await getRacas()

  return (
    <AppShell title="Raças">
      <RacasPageClient initialRacas={racas || []} />
    </AppShell>
  )
}
