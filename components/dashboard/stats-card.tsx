import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-red-500/10 text-red-600",
  info: "bg-blue-500/10 text-blue-600",
}

export function StatsCard({ title, value, description, icon: Icon, trend, variant = "default" }: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
              {trend && (
                <span className={cn("text-sm font-medium", trend.positive ? "text-emerald-600" : "text-red-600")}>
                  {trend.positive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className={cn("rounded-xl p-3", variantStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
