import { AppShell } from "@/components/layout/app-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PendingVaccines } from "@/components/dashboard/pending-vaccines";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { HerdChart } from "@/components/dashboard/herd-chart";
import { Beef, Syringe, TrendingUp, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const hoje = new Date();
  const startOfMonth = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const next30Days = new Date(hoje);
  next30Days.setDate(next30Days.getDate() + 30);

  // Total do Rebanho
  const totalRebanho = await prisma.animal.count({
    where: { status: "ATIVO" },
  });

  // Vendas do Mês
  const vendasMesData = await prisma.transacao.aggregate({
    _sum: { valor_total: true },
    where: {
      tipo: "venda",
      data_negociacao: { gte: startOfMonth },
    },
  });
  const vendasMes = vendasMesData._sum.valor_total || 0;

  // Vacinas Pendentes (Próximos 30 dias)
  const vacinasPendentes = await prisma.agendaVacina.count({
    where: {
      data_prevista: { gte: hoje, lte: next30Days },
      status: "pendente",
    },
  });

  // Alertas (Vacinas Atrasadas)
  const alertas = await prisma.agendaVacina.count({
    where: {
      data_prevista: { lt: hoje },
      status: "pendente",
    },
  });

  // Dados Financeiros (do ano atual)
  const startOfYear = new Date(hoje.getFullYear(), 0, 1);
  const transacoesAno = await prisma.transacao.findMany({
    where: { data_negociacao: { gte: startOfYear } },
    include: { parcelas: true },
  });

  let receitas = 0;
  let despesas = 0;
  let aReceber = 0;
  let aPagar = 0;

  transacoesAno.forEach((t) => {
    if (t.tipo === "venda") receitas += t.valor_total;
    if (t.tipo === "compra") despesas += t.valor_total;

    t.parcelas.forEach((p) => {
      if (p.status === "pendente" || p.status === "atrasado") {
        if (t.tipo === "venda") aReceber += p.valor;
        if (t.tipo === "compra") aPagar += p.valor;
      }
    });
  });

  const financialData = {
    receitas,
    despesas,
    saldo: receitas - despesas,
    aReceber,
    aPagar,
  };

  // 6. Dados do Rebanho
  const animaisAtivos = await prisma.animal.findMany({
    where: { status: "ATIVO" },
    select: { sexo: true, data_nascimento: true },
  });

  let bezerros = 0;
  let novilhos = 0;
  let vacas = 0;
  let touros = 0;

  animaisAtivos.forEach((a) => {
    // Se não tiver data de nascimento, assumimos que é adulto (idade > 36 meses) para fins de gráfico
    const idadeMeses = a.data_nascimento
      ? (hoje.getTime() - a.data_nascimento.getTime()) / (1000 * 60 * 60 * 24 * 30)
      : 999;

    if (idadeMeses <= 12) {
      bezerros++;
    } else if (a.sexo === "M") {
      if (idadeMeses <= 36) novilhos++;
      else touros++;
    } else if (a.sexo === "F") {
      if (idadeMeses <= 36) novilhos++;
      else vacas++;
    }
  });

  const herdData = [
    { name: "Bezerros(as)", value: bezerros, color: "#22c55e" },
    { name: "Novilhos(as)", value: novilhos, color: "#3b82f6" },
    { name: "Vacas", value: vacas, color: "#f59e0b" },
    { name: "Touros", value: touros, color: "#8b5cf6" },
  ].filter((item) => item.value > 0);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total do Rebanho"
            value={totalRebanho}
            description="Animais ativos"
            icon={Beef}
            variant="success"
          />
          <StatsCard
            title="Vacinas Pendentes"
            value={vacinasPendentes}
            description="Próximos 30 dias"
            icon={Syringe}
            variant="warning"
          />
          <StatsCard
            title="Vendas do Mês"
            value={`R$ ${vendasMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            description="Faturamento bruto"
            icon={TrendingUp}
            variant="info"
          />
          <StatsCard
            title="Alertas"
            value={alertas}
            description="Vacinas atrasadas"
            icon={AlertCircle}
            variant="danger"
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <HerdChart data={herdData} />
              <FinancialSummary financialData={financialData} />
            </div>
            <RecentActivity />
          </div>
          <div>
            <PendingVaccines />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
