import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { AnimalsPageClient } from "./page-client"

export default async function AnimaisPage() {
  const supabase = await createClient()

  const { data: animals } = await supabase
    .from("animais")
    .select(`
      *,
      raca:racas(id, nome)
    `)
    .order("created_at", { ascending: false })

  return (
    <AppShell title="Animais">
      <AnimalsPageClient initialAnimals={animals || []} />
    </AppShell>
  )
}
