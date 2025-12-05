import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { RacasPageClient } from "./page-client"

export default async function RacasPage() {
  const supabase = await createClient()

  const { data: racas } = await supabase.from("racas").select("*").order("nome")

  return (
    <AppShell title="Raças">
      <RacasPageClient initialRacas={racas || []} />
    </AppShell>
  )
}
