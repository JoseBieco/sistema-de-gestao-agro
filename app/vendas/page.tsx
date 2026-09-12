import { AppShell } from "@/components/layout/app-shell"
import { TransacoesPageClient } from "@/components/financial/transacoes-page-client"
import { TransacaoService } from "@/src/core/services/TransacaoService"

export default async function VendasPage() {
  const transacaoService = new TransacaoService();
  const allTransacoes = await transacaoService.getAllTransacoes();
  
  // Filtrar apenas tipo venda
  const transacoes = allTransacoes.filter(t => t.tipo === "venda");

  return (
    <AppShell title="Vendas">
      <TransacoesPageClient tipo="venda" initialTransacoes={transacoes || []} />
    </AppShell>
  )
}
