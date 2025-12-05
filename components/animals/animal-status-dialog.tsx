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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Animal, StatusAnimal } from "@/lib/types/database"

interface AnimalStatusDialogProps {
  animal: Animal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AnimalStatusDialog({ animal, open, onOpenChange, onSuccess }: AnimalStatusDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StatusAnimal>("ativo")
  const [dataStatus, setDataStatus] = useState(new Date().toISOString().split("T")[0])
  const [motivo, setMotivo] = useState("")

  async function handleSubmit() {
    if (!animal) return
    setLoading(true)

    try {
      const updateData: any = {
        status,
        data_status: dataStatus,
      }

      if (status === "morto") {
        updateData.motivo_morte = motivo
      }

      const { error } = await supabase.from("animais").update(updateData).eq("id", animal.id)

      if (error) throw error

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Status do Animal</DialogTitle>
          <DialogDescription>Animal: {animal?.numero_brinco || animal?.nome || "Sem identificação"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Novo Status</Label>
            <Select value={status} onValueChange={(v: StatusAnimal) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
                <SelectItem value="morto">Morto</SelectItem>
                <SelectItem value="transferido">Transferido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" value={dataStatus} onChange={(e) => setDataStatus(e.target.value)} />
          </div>

          {status === "morto" && (
            <div className="space-y-2">
              <Label>Motivo/Causa</Label>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva o motivo ou causa da morte..."
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
