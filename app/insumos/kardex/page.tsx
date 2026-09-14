import { AppShell } from "@/components/layout/app-shell"
import { getMovimentacoesEstoque } from "../actions"
import { InsumoKardexClient } from "./page-client"

export default async function InsumosKardexPage() {
  const movimentacoes = await getMovimentacoesEstoque()

  return (
    <AppShell title="Kardex (Livro Razão de Estoque)">
      <InsumoKardexClient initialData={movimentacoes || []} />
    </AppShell>
  )
}
