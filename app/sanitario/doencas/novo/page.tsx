import { AppShell } from "@/components/layout/app-shell"
import { getProdutosSanitarios } from "../../estoque/actions"
import { NovoDoencaClient } from "./page-client"

export default async function NovaDoencaPage() {
  const produtos = await getProdutosSanitarios()

  return (
    <AppShell title="Novo Protocolo Sanitário">
      <NovoDoencaClient produtos={produtos} />
    </AppShell>
  )
}
