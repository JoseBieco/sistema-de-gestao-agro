import { AppShell } from "@/components/layout/app-shell";
import { TransacaoDetailClient } from "@/components/financial/transacao-detail-client";
import { notFound } from "next/navigation";
import { TransacaoService } from "@/src/core/services/TransacaoService";
import { ParceiroService } from "@/src/core/services/ParceiroService";

interface TransacaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendaDetailPage({ params }: TransacaoPageProps) {
  const { id } = await params;
  const transacaoService = new TransacaoService();
  const parceiroService = new ParceiroService();

  const [transacao, parceiros] = await Promise.all([
    transacaoService.getTransacaoById(id),
    parceiroService.getAllParceiros()
  ]);

  if (!transacao || transacao.tipo !== "venda") {
    notFound();
  }

  return (
    <AppShell title={`Detalhes da Venda - ${transacao.id.slice(0, 8)}`}>
      <TransacaoDetailClient transacao={transacao as any} tipo="venda" parceiros={parceiros as any} />
    </AppShell>
  );
}
