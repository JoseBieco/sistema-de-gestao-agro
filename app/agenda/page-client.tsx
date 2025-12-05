"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VaccineApplicationDialog } from "@/components/vaccines/vaccine-application-dialog"
import { ApplyPendingDialog } from "@/components/vaccines/apply-pending-dialog"
import { formatDate, getStatusColor } from "@/lib/utils/format"
import { Plus, Syringe, AlertCircle, CheckCircle, Clock, Calendar } from "lucide-react"
import type { AgendaVacina, Animal, TipoVacina } from "@/lib/types/database"

type AgendaVacinaExtended = AgendaVacina & {
  animal?: Animal
  tipo_vacina?: TipoVacina
}

interface AgendaPageClientProps {
  initialAgenda: AgendaVacinaExtended[]
}

export function AgendaPageClient({ initialAgenda }: AgendaPageClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [agenda, setAgenda] = useState(initialAgenda)
  const [activeTab, setActiveTab] = useState("pendentes")
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false)
  const [applyPendingDialogOpen, setApplyPendingDialogOpen] = useState(false)
  const [selectedVaccine, setSelectedVaccine] = useState<AgendaVacinaExtended | null>(null)

  async function refreshAgenda() {
    const { data } = await supabase
      .from("agenda_vacinas")
      .select(`
        *,
        animal:animais(id, numero_brinco, nome, genero),
        tipo_vacina:tipos_vacina(id, nome, doses_por_ano, dias_entre_doses)
      `)
      .order("data_prevista", { ascending: true })

    if (data) {
      setAgenda(data)
    }
    router.refresh()
  }

  // Update status of overdue vaccines
  const today = new Date().toISOString().split("T")[0]
  const processedAgenda = agenda.map((v) => {
    if (v.status === "pendente" && v.data_prevista < today) {
      return { ...v, status: "atrasada" as const }
    }
    return v
  })

  const pendentes = processedAgenda.filter((v) => v.status === "pendente")
  const atrasadas = processedAgenda.filter((v) => v.status === "atrasada")
  const aplicadas = processedAgenda.filter((v) => v.status === "aplicada")

  const filteredAgenda = (() => {
    switch (activeTab) {
      case "pendentes":
        return pendentes
      case "atrasadas":
        return atrasadas
      case "aplicadas":
        return aplicadas
      default:
        return processedAgenda
    }
  })()

  function handleApplyPending(vaccine: AgendaVacinaExtended) {
    setSelectedVaccine(vaccine)
    setApplyPendingDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{agenda.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{pendentes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-red-500/10 p-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold">{atrasadas.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aplicadas</p>
              <p className="text-2xl font-bold">{aplicadas.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Agenda de Vacinação
          </CardTitle>
          <Button onClick={() => setApplicationDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Aplicação
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pendentes">Pendentes ({pendentes.length})</TabsTrigger>
              <TabsTrigger value="atrasadas">Atrasadas ({atrasadas.length})</TabsTrigger>
              <TabsTrigger value="aplicadas">Aplicadas ({aplicadas.length})</TabsTrigger>
              <TabsTrigger value="todas">Todas ({agenda.length})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Vacina</TableHead>
                    <TableHead>Dose</TableHead>
                    <TableHead>Data Prevista</TableHead>
                    <TableHead>Data Aplicação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgenda.length > 0 ? (
                    filteredAgenda.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <span className="font-medium">{v.animal?.numero_brinco || v.animal?.nome || "-"}</span>
                        </TableCell>
                        <TableCell>{v.tipo_vacina?.nome || "-"}</TableCell>
                        <TableCell>{v.dose_numero}ª dose</TableCell>
                        <TableCell>{formatDate(v.data_prevista)}</TableCell>
                        <TableCell>{v.data_aplicacao ? formatDate(v.data_aplicacao) : "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(v.status)}>
                            {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(v.status === "pendente" || v.status === "atrasada") && (
                            <Button variant="outline" size="sm" onClick={() => handleApplyPending(v)}>
                              Aplicar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhuma vacina encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <VaccineApplicationDialog
        open={applicationDialogOpen}
        onOpenChange={setApplicationDialogOpen}
        onSuccess={refreshAgenda}
      />

      <ApplyPendingDialog
        vaccine={selectedVaccine}
        open={applyPendingDialogOpen}
        onOpenChange={setApplyPendingDialogOpen}
        onSuccess={refreshAgenda}
      />
    </div>
  )
}
