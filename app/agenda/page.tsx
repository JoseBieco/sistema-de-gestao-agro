import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { AgendaPageClient } from "./page-client"

export default async function AgendaPage() {
  const supabase = await createClient()

  const { data: agendaVacinas } = await supabase
    .from("agenda_vacinas")
    .select(`
      *,
      animal:animais(id, numero_brinco, nome, genero),
      tipo_vacina:tipos_vacina(id, nome, doses_por_ano, dias_entre_doses)
    `)
    .order("data_prevista", { ascending: true })

  return (
    <AppShell title="Agenda de Vacinas">
      <AgendaPageClient initialAgenda={agendaVacinas || []} />
    </AppShell>
  )
}
