import { AppShell } from "@/components/layout/app-shell"
import { AgendaPageClient } from "./page-client"
import { getAgendas } from "@/app/vacinas/actions"
import type { AgendaVacina, Animal, TipoVacina } from "@/lib/types/database"

export default async function AgendaPage() {
  const agendaVacinas = await getAgendas()

  return (
    <AppShell title="Vacinas (Aplicadas e Agendadas)">
      <AgendaPageClient
        initialAgenda={
          (agendaVacinas || []) as unknown as (AgendaVacina & { animal?: Animal; tipo_vacina?: TipoVacina })[]
        }
      />
    </AppShell>
  )
}
