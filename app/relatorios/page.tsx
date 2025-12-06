import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { RelatoriosClient } from "@/components/reports/relatorios-client";
import { CotacoesBIClient } from "@/components/reports/cotacoes-bi";

export default async function RelatoriosPage() {
  const supabase = await createClient();

  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;

  const [
    { data: animais },
    { data: transacoes },
    { data: vacinas },
    { data: parcelas },
    { data: cotacoes },
  ] = await Promise.all([
    supabase.from("animais").select("*, raca:racas(nome)"),
    supabase
      .from("transacoes")
      .select("*, parceiro:parceiros(nome)")
      .gte("data_negociacao", startOfYear)
      .lte("data_negociacao", endOfYear),
    supabase
      .from("agenda_vacinas")
      .select(
        "*, animal:animais(numero_brinco, nome), tipo_vacina:tipos_vacina(nome)"
      )
      .gte("data_prevista", startOfYear)
      .lte("data_prevista", endOfYear),
    supabase
      .from("parcelas")
      .select("*, transacao:transacoes(tipo, parceiro:parceiros(nome))")
      .gte("data_vencimento", startOfYear)
      .lte("data_vencimento", endOfYear),
    supabase
      .from("cotacoes_historicas")
      .select("*")
      .order("data", { ascending: false }),
  ]);

  return (
    <AppShell title="Relatórios">
      <RelatoriosClient
        animais={animais || []}
        transacoes={transacoes || []}
        vacinas={vacinas || []}
        parcelas={parcelas || []}
      />
      <div className="mt-8">
        <CotacoesBIClient cotacoes={cotacoes || []} />
      </div>
    </AppShell>
  );
}
