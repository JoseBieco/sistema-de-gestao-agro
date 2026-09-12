import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils/format"
import { Beef, Syringe, DollarSign, ShoppingCart } from "lucide-react"
import { prisma } from "@/lib/prisma"

interface Activity {
  id: string
  type: "animal" | "vacina" | "compra" | "venda"
  title: string
  description: string
  date: Date
}

const iconMap = {
  animal: Beef,
  vacina: Syringe,
  compra: ShoppingCart,
  venda: DollarSign,
}

const colorMap = {
  animal: "bg-emerald-500/10 text-emerald-600",
  vacina: "bg-blue-500/10 text-blue-600",
  compra: "bg-amber-500/10 text-amber-600",
  venda: "bg-primary/10 text-primary",
}

export async function RecentActivity() {
  const [animais, transacoes, vacinas] = await Promise.all([
    prisma.animal.findMany({ orderBy: { created_at: "desc" }, take: 4 }),
    prisma.transacao.findMany({ orderBy: { data_negociacao: "desc" }, take: 4 }),
    prisma.agendaVacina.findMany({ 
      where: { status: "concluida" }, 
      orderBy: { data_aplicacao: "desc" }, 
      take: 4,
      include: { animal: true, tipo_vacina: true }
    })
  ]);

  const activities: Activity[] = [];

  animais.forEach(a => {
    activities.push({
      id: `an_${a.id}`,
      type: "animal",
      title: "Novo animal cadastrado",
      description: `Brinco ${a.brinco || a.nome}`,
      date: a.created_at
    });
  });

  transacoes.forEach(t => {
    activities.push({
      id: `tr_${t.id}`,
      type: t.tipo as "compra" | "venda",
      title: t.tipo === "compra" ? "Nova compra registrada" : "Venda finalizada",
      description: `Valor: R$ ${t.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      date: t.data_negociacao
    });
  });

  vacinas.forEach(v => {
    if (v.data_aplicacao) {
      activities.push({
        id: `vc_${v.id}`,
        type: "vacina",
        title: "Vacina aplicada",
        description: `${v.tipo_vacina.nome} em ${v.animal.brinco || v.animal.nome}`,
        date: v.data_aplicacao
      });
    }
  });

  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentActivities = activities.slice(0, 8);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="space-y-1 px-6 pb-6">
            {recentActivities.map((activity) => {
              const Icon = iconMap[activity.type]
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div className={`rounded-lg p-2 ${colorMap[activity.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <time className="text-xs text-muted-foreground">{formatDate(activity.date.toISOString())}</time>
                </div>
              )
            })}
            {recentActivities.length === 0 && (
              <p className="text-sm text-center text-muted-foreground mt-4">Nenhuma atividade recente.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
