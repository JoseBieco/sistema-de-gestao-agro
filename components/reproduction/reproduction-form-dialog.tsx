"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, CalendarHeart, Baby } from "lucide-react";
import { calcularPrevisoes } from "@/lib/utils/reproduction";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import type { Animal, CicloReprodutivo } from "@/lib/types/database";

interface ReproductionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  femeas: Animal[];
  touros: Animal[];
  cicloToEdit?: CicloReprodutivo | null; // Nova prop para edição
}

export function ReproductionFormDialog({
  open,
  onOpenChange,
  onSuccess,
  femeas,
  touros,
  cicloToEdit,
}: ReproductionFormDialogProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    animal_id: "",
    data_ultimo_parto: "",
    data_ultimo_cio: "",
    data_cobertura: "",
    touro_id: "",
    tipo_cobertura: "monta_natural",
    observacoes: "",
  });

  const [previsoes, setPrevisoes] = useState<any>(null);

  // Effect: Carregar dados ao abrir para edição ou limpar para novo cadastro
  useEffect(() => {
    if (open) {
      if (cicloToEdit) {
        // Modo Edição: Preenche com dados existentes
        setFormData({
          animal_id: cicloToEdit.animal_id,
          data_ultimo_parto: cicloToEdit.data_ultimo_parto || "",
          data_ultimo_cio: cicloToEdit.data_ultimo_cio || "",
          data_cobertura: cicloToEdit.data_cobertura || "",
          touro_id: cicloToEdit.touro_id || "",
          tipo_cobertura: cicloToEdit.tipo_cobertura || "monta_natural",
          observacoes: cicloToEdit.observacoes || "",
        });
      } else {
        // Modo Criação: Reseta o formulário
        setFormData({
          animal_id: "",
          data_ultimo_parto: "",
          data_ultimo_cio: "",
          data_cobertura: "",
          touro_id: "",
          tipo_cobertura: "monta_natural",
          observacoes: "",
        });
      }
    }
  }, [open, cicloToEdit]);

  // Recalcular previsões quando datas mudam (funciona para Edição e Criação)
  useEffect(() => {
    const prev = calcularPrevisoes({
      data_ultimo_parto: formData.data_ultimo_parto || undefined,
      data_ultimo_cio: formData.data_ultimo_cio || undefined,
      data_cobertura: formData.data_cobertura || undefined,
    });
    setPrevisoes(prev);
  }, [
    formData.data_ultimo_parto,
    formData.data_ultimo_cio,
    formData.data_cobertura,
  ]);

  async function handleSubmit() {
    if (!formData.animal_id) return;
    setLoading(true);

    try {
      // Objeto com os dados comuns
      const payload = {
        animal_id: formData.animal_id,
        data_ultimo_parto: formData.data_ultimo_parto || null,
        data_ultimo_cio: formData.data_ultimo_cio || null,
        data_cobertura: formData.data_cobertura || null,
        touro_id: formData.touro_id || null,
        tipo_cobertura: formData.tipo_cobertura,
        // As previsões são sempre recalculadas ao salvar
        data_prevista_parto: previsoes.data_prevista_parto,
        data_prevista_cio: previsoes.data_prevista_cio,
        data_diagnostico_gestacao: previsoes.data_diagnostico,
        status: previsoes.status_sugerido,
        observacoes: formData.observacoes,
        ativo: true,
      };

      if (cicloToEdit) {
        // --- MODO EDIÇÃO (UPDATE) ---
        const { error } = await supabase
          .from("ciclos_reprodutivos")
          .update(payload)
          .eq("id", cicloToEdit.id);

        if (error) throw error;
        toast.success("Ciclo atualizado com sucesso!");
      } else {
        // --- MODO CRIAÇÃO (INSERT) ---
        // Desativa ciclos anteriores apenas se for novo
        await supabase
          .from("ciclos_reprodutivos")
          .update({ ativo: false })
          .eq("animal_id", formData.animal_id);

        const { error } = await supabase
          .from("ciclos_reprodutivos")
          .insert(payload);

        if (error) throw error;
        toast.success("Novo acompanhamento iniciado!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar dados reprodutivos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {cicloToEdit
              ? "Editar Ciclo Reprodutivo"
              : "Novo Acompanhamento Reprodutivo"}
          </DialogTitle>
          <DialogDescription>
            {cicloToEdit
              ? "Atualize as datas para recalcular as previsões automaticamente."
              : "Preencha os dados iniciais para gerar as estimativas."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label>Matriz (Vaca)</Label>
            {/* Se estiver editando, bloqueamos a troca da vaca para evitar confusão de histórico */}
            <Select
              value={formData.animal_id}
              onValueChange={(v) => setFormData({ ...formData, animal_id: v })}
              disabled={!!cicloToEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Buscar vaca..." />
              </SelectTrigger>
              <SelectContent>
                {femeas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.numero_brinco} - {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ... Restante dos campos do formulário (Parto, Cio, Cobertura, etc) igual ao anterior ... */}
          {/* Pode copiar exatamente o mesmo miolo do formulário anterior aqui */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Último Parto</Label>
              <Input
                type="date"
                value={formData.data_ultimo_parto}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data_ultimo_parto: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Último Cio</Label>
              <Input
                type="date"
                value={formData.data_ultimo_cio}
                onChange={(e) =>
                  setFormData({ ...formData, data_ultimo_cio: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Data Cobertura</Label>
              <Input
                type="date"
                value={formData.data_cobertura}
                onChange={(e) =>
                  setFormData({ ...formData, data_cobertura: e.target.value })
                }
              />
            </div>
          </div>

          {formData.data_cobertura && (
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-md">
              <div className="space-y-2">
                <Label>Touro</Label>
                <Select
                  value={formData.touro_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, touro_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {touros.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome} ({a.numero_brinco})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.tipo_cobertura}
                  onValueChange={(v: any) =>
                    setFormData({ ...formData, tipo_cobertura: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monta_natural">Monta Natural</SelectItem>
                    <SelectItem value="inseminacao">
                      Inseminação Artificial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {previsoes && (
            <div className="grid gap-3">
              {previsoes.data_prevista_parto && (
                <Alert variant="success">
                  <Baby className="h-4 w-4" />
                  <AlertTitle>
                    Estimativa: {formatDate(previsoes.data_prevista_parto)}
                  </AlertTitle>
                  <AlertDescription>
                    Previsão de parto recalculada automaticamente.
                  </AlertDescription>
                </Alert>
              )}
              {previsoes.data_prevista_cio &&
                !previsoes.data_prevista_parto && (
                  <Alert variant="info">
                    <CalendarHeart className="h-4 w-4" />
                    <AlertTitle>
                      Próximo Cio: {formatDate(previsoes.data_prevista_cio)}
                    </AlertTitle>
                  </Alert>
                )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.animal_id}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cicloToEdit ? "Salvar Alterações" : "Iniciar Acompanhamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
