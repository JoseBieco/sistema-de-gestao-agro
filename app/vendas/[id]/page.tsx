import { AppShell } from "@/components/layout/app-shell";
import { TransacaoDetailClient } from "@/components/financial/transacao-detail-client";
import { notFound } from "next/navigation";
import { TransacaoService } from "@/src/core/services/TransacaoService";

interface TransacaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendaDetailPage({ params }: TransacaoPageProps) {
  const { id } = await params;
  const transacaoService = new TransacaoService();
  const transacao = await transacaoService.getTransacaoById(id);

  if (!transacao || transacao.tipo !== "venda") {
    notFound();
  }

  return (
    <AppShell title={`Detalhes da Venda - ${transacao.id.slice(0, 8)}`}>
      <TransacaoDetailClient transacao={transacao as any} tipo="venda" />
    </AppShell>
  );
}
