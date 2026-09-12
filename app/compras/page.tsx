import { AppShell } from "@/components/layout/app-shell"
import { TransacoesPageClient } from "@/components/financial/transacoes-page-client"
import { TransacaoService } from "@/src/core/services/TransacaoService"

export default async function ComprasPage() {
  const transacaoService = new TransacaoService();
  const allTransacoes = await transacaoService.getAllTransacoes();
  
  // Filtrar apenas tipo compra
  const transacoes = allTransacoes.filter(t => t.tipo === "compra");

  return (
    <AppShell title="Compras">
      <TransacoesPageClient tipo="compra" initialTransacoes={transacoes || []} />
    </AppShell>
  )
}
