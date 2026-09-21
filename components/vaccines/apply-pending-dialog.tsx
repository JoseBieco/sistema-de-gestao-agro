"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { AgendaVacina, TipoVacina } from "@/lib/types/database";
import { toast } from "sonner";

interface ApplyPendingDialogProps {
  vaccine: (AgendaVacina & { tipo_vacina?: TipoVacina }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApplyPendingDialog({
  vaccine,
  open,
  onOpenChange,
  onSuccess,
}: ApplyPendingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dataAplicacao, setDataAplicacao] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [observacoes, setObservacoes] = useState("");

  async function handleSubmit() {
    if (!vaccine) return;
    setLoading(true);

    try {
      const { applyPendingVacina } = await import("@/app/vacinas/actions");
      
      await applyPendingVacina({
        agenda_id: vaccine.id,
        data_aplicacao: dataAplicacao,
        observacoes: observacoes || vaccine.observacoes || "",
      });

      onSuccess();
      onOpenChange(false);
      toast.success("Sucesso ao aplicar a vacina.");
    } catch (error) {
      toast.error("Erro ao aplicar vacina: : " + (error instanceof Error ? error.message : error));
      console.error("Erro ao aplicar vacina:", error);
    } finally {
      setLoading(false);
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
            <Input
              type="date"
              value={dataAplicacao}
              onChange={(e) => setDataAplicacao(e.target.value)}
            />
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
  );
}
