import { AppShell } from "@/components/layout/app-shell"
import { TransactionForm } from "@/components/financial/transaction-form"

export default function NovaCompraPage() {
  return (
    <AppShell title="Nova Compra">
      <TransactionForm tipo="compra" />
    </AppShell>
  )
}
