import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils/format"
import { Syringe, AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export async function PendingVaccines() {
  const hoje = new Date();
  
  const vacinas = await prisma.agendaVacina.findMany({
    where: { status: "pendente" },
    include: { animal: true, tipo_vacina: true },
    orderBy: { data_prevista: "asc" },
    take: 10
  });

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
            {vacinas.map((vaccine) => {
              const isAtrasada = new Date(vaccine.data_prevista) < hoje;
              return (
                <div
                  key={vaccine.id}
                  className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`rounded-lg p-2 ${isAtrasada ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}
                  >
                    {isAtrasada ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Syringe className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{vaccine.animal.brinco || vaccine.animal.nome}</p>
                    <p className="text-xs text-muted-foreground">{vaccine.tipo_vacina.nome}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={isAtrasada ? "destructive" : "secondary"}>
                      {isAtrasada ? "Atrasada" : "Pendente"}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(vaccine.data_prevista.toISOString())}</p>
                  </div>
                </div>
              );
            })}
            {vacinas.length === 0 && (
              <p className="text-sm text-center text-muted-foreground mt-4">Nenhuma vacina pendente.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
