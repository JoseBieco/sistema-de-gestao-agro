import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { VacinasPageClient } from "./page-client"

export default async function VacinasPage() {
  const supabase = await createClient()

  const { data: tiposVacina } = await supabase.from("tipos_vacina").select("*").order("nome")

  return (
    <AppShell title="Tipos de Vacina">
      <VacinasPageClient initialTipos={tiposVacina || []} />
    </AppShell>
  )
}
