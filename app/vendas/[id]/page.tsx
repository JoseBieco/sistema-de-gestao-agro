import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { TransacaoDetailClient } from "@/components/financial/transacao-detail-client";
import { notFound } from "next/navigation";

export default async function VendaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: transacao, error } = await supabase
    .from("transacoes")
    .select(
      `
      *,
      parceiro:parceiros(*),
      itens:itens_transacao(*),
      parcelas(*),
      animais_transacao(
        animal:animais(
          id,
          numero_brinco,
          nome,
          genero,
          raca:racas(nome)
        ),
        item:itens_transacao(valor_unitario, descricao)
      )
    `
    )
    .eq("id", id)
    .eq("tipo", "venda")
    .single();

  if (error || !transacao) {
    notFound();
  }

  return (
    <AppShell title="Detalhes da Venda">
      <TransacaoDetailClient transacao={transacao} tipo="venda" />
    </AppShell>
  );
}
