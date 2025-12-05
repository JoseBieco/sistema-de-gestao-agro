import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { ParcelasPageClient } from "./page-client"

export default async function ParcelasPage() {
  const supabase = await createClient()

  const { data: parcelas } = await supabase
    .from("parcelas")
    .select(`
      *,
      transacao:transacoes(
        id,
        tipo,
        parceiro:parceiros(id, nome)
      )
    `)
    .order("data_vencimento", { ascending: true })

  return (
    <AppShell title="Parcelas">
      <ParcelasPageClient initialParcelas={parcelas || []} />
    </AppShell>
  )
}
