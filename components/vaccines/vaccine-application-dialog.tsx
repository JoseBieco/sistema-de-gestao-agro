"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { Animal, TipoVacina } from "@/lib/types/database";
import { toast } from "sonner";

interface VaccineApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedAnimals?: Animal[];
}

export function VaccineApplicationDialog({
  open,
  onOpenChange,
  onSuccess,
  preSelectedAnimals = [],
}: VaccineApplicationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tiposVacina, setTiposVacina] = useState<TipoVacina[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(
    preSelectedAnimals.map((a) => a.id)
  );
  const [formData, setFormData] = useState({
    tipo_vacina_id: "",
    data_aplicacao: new Date().toISOString().split("T")[0],
    observacoes: "",
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  async function loadData() {
    const { getTiposVacina } = await import("@/app/vacinas/actions");
    const { getAnimais } = await import("@/app/animais/actions");
    
    const [vacRes, animaisRes] = await Promise.all([
      getTiposVacina(),
      getAnimais()
    ]);

    if (vacRes) setTiposVacina(vacRes);
    if (animaisRes) {
      // Filtra apenas ativos
      setAnimais(animaisRes.filter((a: any) => a.status === "ativo"));
    }
  }

  async function handleSubmit() {
    if (!formData.tipo_vacina_id || selectedAnimals.length === 0) return;
    setLoading(true);

    try {
      const { applyVacinasEmLote } = await import("@/app/vacinas/actions");
      
      await applyVacinasEmLote({
        animais_ids: selectedAnimals,
        tipo_vacina_id: formData.tipo_vacina_id,
        data_aplicacao: formData.data_aplicacao,
        observacoes: formData.observacoes,
      });

      onSuccess();
      onOpenChange(false);
      setSelectedAnimals([]);
      setFormData({
        tipo_vacina_id: "",
        data_aplicacao: new Date().toISOString().split("T")[0],
        observacoes: "",
      });
      toast.success("Sucesso ao adicionar a vacina.");
    } catch (error) {
      toast.error("Erro ao registrar vacinas: : " + (error instanceof Error ? error.message : error));
      console.error("Erro ao registrar vacinas:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleAnimal(animalId: string) {
    setSelectedAnimals((prev) =>
      prev.includes(animalId)
        ? prev.filter((id) => id !== animalId)
        : [...prev, animalId]
    );
  }

  function selectAll() {
    const selectedVaccine = tiposVacina.find(
      (t) => t.id === formData.tipo_vacina_id
    );
    const filteredAnimals = selectedVaccine?.apenas_femeas
      ? animais.filter((a) => a.sexo === "F")
      : animais;
    setSelectedAnimals(filteredAnimals.map((a) => a.id));
  }

  const selectedVaccine = tiposVacina.find(
    (t) => t.id === formData.tipo_vacina_id
  );
  const filteredAnimals = selectedVaccine?.apenas_femeas
    ? animais.filter((a) => a.sexo === "F")
    : animais;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Aplicação de Vacina</DialogTitle>
          <DialogDescription>
            Selecione a vacina e os animais que receberam a aplicação
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de Vacina</Label>
              <Select
                value={formData.tipo_vacina_id}
                onValueChange={(v) =>
                  setFormData({ ...formData, tipo_vacina_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a vacina" />
                </SelectTrigger>
                <SelectContent>
                  {tiposVacina.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                      {tipo.obrigatoria && " (Obrigatória)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedVaccine && selectedVaccine.doses_por_ano > 1 && (
                <p className="text-xs text-muted-foreground">
                  Esta vacina requer {selectedVaccine.doses_por_ano} doses/ano.
                  Próxima dose será agendada automaticamente.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Data da Aplicação</Label>
              <Input
                type="date"
                value={formData.data_aplicacao}
                onChange={(e) =>
                  setFormData({ ...formData, data_aplicacao: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Animais ({selectedAnimals.length} selecionados)</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={selectAll}
              >
                Selecionar todos
              </Button>
            </div>
            <ScrollArea className="h-[200px] rounded-lg border p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredAnimals.map((animal) => (
                  <label
                    key={animal.id}
                    className="flex items-center gap-3 rounded-md border p-2 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedAnimals.includes(animal.id)}
                      onCheckedChange={() => toggleAnimal(animal.id)}
                    />
                    <span className="text-sm">
                      {animal.brinco ||
                        animal.nome ||
                        animal.id.slice(0, 8)}
                      <span className="text-muted-foreground ml-1">
                        ({animal.sexo === "M" ? "M" : "F"})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Informações adicionais sobre a aplicação..."
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
            disabled={
              loading ||
              !formData.tipo_vacina_id ||
              selectedAnimals.length === 0
            }
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar ({selectedAnimals.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
