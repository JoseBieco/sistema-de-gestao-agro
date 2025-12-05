import { AppShell } from "@/components/layout/app-shell"
import { TransactionForm } from "@/components/financial/transaction-form"

export default function NovaVendaPage() {
  return (
    <AppShell title="Nova Venda">
      <TransactionForm tipo="venda" />
    </AppShell>
  )
}
