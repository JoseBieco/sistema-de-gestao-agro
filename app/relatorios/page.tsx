import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { RelatoriosClient } from "@/components/reports/relatorios-client";
import { CotacoesBIClient } from "@/components/reports/cotacoes-bi";

import { obterCotacoesInteligentes } from "@/app/cotacoes/actions";

export default async function RelatoriosPage() {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(`${currentYear}-01-01`);
  const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

  // Auto-fetch/cache today's quotes from AgroDoc AI API before loading history
  await Promise.allSettled([
    obterCotacoesInteligentes("boi_gordo", "SP"),
    obterCotacoesInteligentes("milho", "SP"),
    obterCotacoesInteligentes("soja", "SP"),
  ]);

  const [animais, transacoes, vacinas, parcelas, cotacoes] = await Promise.all([
    prisma.animal.findMany({ include: { raca: true } }),
    prisma.transacao.findMany({
      where: {
        data_negociacao: { gte: startOfYear, lte: endOfYear },
      },
      include: { parceiro: true },
    }),
    prisma.agendaVacina.findMany({
      where: {
        data_prevista: { gte: startOfYear, lte: endOfYear },
      },
      include: { animal: true, tipo_vacina: true },
    }),
    prisma.parcela.findMany({
      where: {
        data_vencimento: { gte: startOfYear, lte: endOfYear },
      },
      include: { transacao: { include: { parceiro: true } } },
    }),
    prisma.cotacaoHistorica.findMany({
      orderBy: { data: "desc" },
      take: 100
    }),
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
