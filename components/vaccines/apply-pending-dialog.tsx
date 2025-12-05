"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { AgendaVacina, TipoVacina } from "@/lib/types/database"

interface ApplyPendingDialogProps {
  vaccine: (AgendaVacina & { tipo_vacina?: TipoVacina }) | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ApplyPendingDialog({ vaccine, open, onOpenChange, onSuccess }: ApplyPendingDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [dataAplicacao, setDataAplicacao] = useState(new Date().toISOString().split("T")[0])
  const [observacoes, setObservacoes] = useState("")

  async function handleSubmit() {
    if (!vaccine) return
    setLoading(true)

    try {
      // Update current vaccine to applied
      const { error: updateError } = await supabase
        .from("agenda_vacinas")
        .update({
          data_aplicacao: dataAplicacao,
          status: "aplicada",
          observacoes: observacoes || vaccine.observacoes,
        })
        .eq("id", vaccine.id)

      if (updateError) throw updateError

      // If there are more doses needed, create next one
      const tipoVacina = vaccine.tipo_vacina
      if (tipoVacina && tipoVacina.doses_por_ano > vaccine.dose_numero) {
        const nextDate = new Date(dataAplicacao)
        nextDate.setDate(nextDate.getDate() + tipoVacina.dias_entre_doses)

        const { error: nextError } = await supabase.from("agenda_vacinas").insert({
          animal_id: vaccine.animal_id,
          tipo_vacina_id: vaccine.tipo_vacina_id,
          data_prevista: nextDate.toISOString().split("T")[0],
          status: "pendente",
          dose_numero: vaccine.dose_numero + 1,
          vacina_pai_id: vaccine.id,
        })

        if (nextError) throw nextError
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao aplicar vacina:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Aplicação</DialogTitle>
          <DialogDescription>
            {vaccine?.tipo_vacina?.nome} - Dose {vaccine?.dose_numero}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Data da Aplicação</Label>
            <Input type="date" value={dataAplicacao} onChange={(e) => setDataAplicacao(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Aplicação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
