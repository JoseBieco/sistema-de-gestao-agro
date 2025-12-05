"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils/format"
import { Syringe, AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"

interface PendingVaccine {
  id: string
  animal: string
  vaccine: string
  dueDate: string
  status: "pendente" | "atrasada"
}

const pendingVaccines: PendingVaccine[] = [
  { id: "1", animal: "B-2024-001", vaccine: "Aftosa", dueDate: "2024-12-10", status: "atrasada" },
  { id: "2", animal: "B-2024-015", vaccine: "Raiva", dueDate: "2024-12-12", status: "pendente" },
  { id: "3", animal: "B-2024-022", vaccine: "Clostridiose", dueDate: "2024-12-15", status: "pendente" },
  { id: "4", animal: "B-2024-038", vaccine: "Aftosa", dueDate: "2024-12-08", status: "atrasada" },
]

export function PendingVaccines() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Vacinas Pendentes</CardTitle>
        <Link href="/agenda">
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todas
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="space-y-2 px-6 pb-6">
            {pendingVaccines.map((vaccine) => (
              <div
                key={vaccine.id}
                className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div
                  className={`rounded-lg p-2 ${vaccine.status === "atrasada" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}
                >
                  {vaccine.status === "atrasada" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Syringe className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{vaccine.animal}</p>
                  <p className="text-xs text-muted-foreground">{vaccine.vaccine}</p>
                </div>
                <div className="text-right">
                  <Badge variant={vaccine.status === "atrasada" ? "destructive" : "secondary"}>
                    {vaccine.status === "atrasada" ? "Atrasada" : "Pendente"}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(vaccine.dueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
