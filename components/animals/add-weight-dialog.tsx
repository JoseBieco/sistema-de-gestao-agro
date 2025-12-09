"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddWeightDialogProps {
  animalId: string;
  currentWeight?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddWeightDialog({
  animalId,
  currentWeight,
  open,
  onOpenChange,
  onSuccess,
}: AddWeightDialogProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    peso: "",
    data_pesagem: new Date().toISOString().split("T")[0],
    observacoes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.peso || !animalId) return;

    setLoading(true);
    const novoPeso = parseFloat(formData.peso);

    try {
      // 1. Inserir no histórico
      const { error: historyError } = await supabase
        .from("historico_pesagem")
        .insert({
          animal_id: animalId,
          peso: novoPeso,
          data_pesagem: formData.data_pesagem,
          observacoes: formData.observacoes,
        });

      if (historyError) throw historyError;

      // 2. Atualizar peso atual do animal se a data for recente ou igual a hoje
      // Lógica simples: sempre atualiza o peso atual para o último inserido
      const { error: updateError } = await supabase
        .from("animais")
        .update({ peso_atual: novoPeso })
        .eq("id", animalId);

      if (updateError) throw updateError;

      setFormData({
        peso: "",
        data_pesagem: new Date().toISOString().split("T")[0],
        observacoes: "",
      });

      onSuccess?.();
      onOpenChange(false);
      router.refresh();
      toast.success("Sucesso ao salvar pesagem.");
    } catch (error) {
      toast.error("Erro ao salvar pesagem: " + error);
      console.error("Erro ao salvar pesagem:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pesagem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.01"
                placeholder={currentWeight ? `${currentWeight}` : "0.00"}
                value={formData.peso}
                onChange={(e) =>
                  setFormData({ ...formData, peso: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data_pesagem}
                onChange={(e) =>
                  setFormData({ ...formData, data_pesagem: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Opcional..."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
