import { AppShell } from "@/components/layout/app-shell"
import { AgendaPageClient } from "./page-client"
import { getAgendas } from "@/app/vacinas/actions"

export default async function AgendaPage() {
  const agendaVacinas = await getAgendas()

  return (
    <AppShell title="Vacinas (Aplicadas e Agendadas)">
      <AgendaPageClient initialAgenda={agendaVacinas || []} />
    </AppShell>
  )
}
