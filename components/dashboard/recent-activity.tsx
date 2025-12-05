import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils/format"
import { Beef, Syringe, DollarSign, ShoppingCart } from "lucide-react"

interface Activity {
  id: string
  type: "animal" | "vacina" | "compra" | "venda"
  title: string
  description: string
  date: string
}

const activities: Activity[] = [
  {
    id: "1",
    type: "animal",
    title: "Novo animal cadastrado",
    description: "Bezerro #B-2024-042 registrado",
    date: new Date().toISOString(),
  },
  {
    id: "2",
    type: "vacina",
    title: "Vacina aplicada",
    description: "Aftosa em 15 animais",
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    type: "compra",
    title: "Nova compra registrada",
    description: "30 bezerros de João Silva",
    date: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "4",
    type: "venda",
    title: "Venda finalizada",
    description: "20 garrotes vendidos",
    date: new Date(Date.now() - 259200000).toISOString(),
  },
]

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

export function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="space-y-1 px-6 pb-6">
            {activities.map((activity) => {
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
                  <time className="text-xs text-muted-foreground">{formatDate(activity.date)}</time>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
