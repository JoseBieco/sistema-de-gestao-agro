import { AppShell } from "@/components/layout/app-shell"
import { EstoquePageClient } from "./page-client"
import { getProdutosSanitarios } from "./actions"

export default async function EstoqueSanitarioPage() {
  const produtos = await getProdutosSanitarios()

  return (
    <AppShell title="Estoque Sanitário (Remédios e Vacinas)">
      <EstoquePageClient initialProdutos={produtos} />
    </AppShell>
  )
}
