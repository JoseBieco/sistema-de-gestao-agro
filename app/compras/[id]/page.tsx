import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

import { notFound } from "next/navigation";
import { TransacaoDetailClient } from "@/components/financial/transacao-detail-client";

export default async function CompraDetailPage({
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
    .eq("tipo", "compra")
    .single();

  if (error || !transacao) {
    notFound();
  }

  return (
    <AppShell title="Detalhes da Compra">
      <TransacaoDetailClient transacao={transacao} tipo="compra" />
    </AppShell>
  );
}
