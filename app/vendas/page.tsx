import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { TransacoesPageClient } from "@/components/financial/transacoes-page-client"

export default async function VendasPage() {
  const supabase = await createClient()

  const { data: transacoes } = await supabase
    .from("transacoes")
    .select(`
      *,
      parceiro:parceiros(id, nome),
      parcelas(id, status, valor)
    `)
    .eq("tipo", "venda")
    .order("data_negociacao", { ascending: false })

  return (
    <AppShell title="Vendas">
      <TransacoesPageClient tipo="venda" initialTransacoes={transacoes || []} />
    </AppShell>
  )
}
