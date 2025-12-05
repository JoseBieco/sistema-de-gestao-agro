import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { ParceirosPageClient } from "./page-client"

export default async function ParceirosPage() {
  const supabase = await createClient()

  const { data: parceiros } = await supabase.from("parceiros").select("*").order("nome")

  return (
    <AppShell title="Parceiros">
      <ParceirosPageClient initialParceiros={parceiros || []} />
    </AppShell>
  )
}
