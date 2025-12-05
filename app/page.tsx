import { AppShell } from "@/components/layout/app-shell"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { PendingVaccines } from "@/components/dashboard/pending-vaccines"
import { FinancialSummary } from "@/components/dashboard/financial-summary"
import { HerdChart } from "@/components/dashboard/herd-chart"
import { Beef, Syringe, TrendingUp, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total do Rebanho"
            value={168}
            description="Animais ativos"
            icon={Beef}
            variant="success"
            trend={{ value: 12, positive: true }}
          />
          <StatsCard
            title="Vacinas Pendentes"
            value={23}
            description="Próximos 30 dias"
            icon={Syringe}
            variant="warning"
          />
          <StatsCard
            title="Vendas do Mês"
            value="R$ 45.000"
            description="20 animais vendidos"
            icon={TrendingUp}
            variant="info"
            trend={{ value: 8, positive: true }}
          />
          <StatsCard title="Alertas" value={5} description="Vacinas atrasadas" icon={AlertCircle} variant="danger" />
        </div>

        {/* Charts and Lists */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <HerdChart />
              <FinancialSummary />
            </div>
            <RecentActivity />
          </div>
          <div>
            <PendingVaccines />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
