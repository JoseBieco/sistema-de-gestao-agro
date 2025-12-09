"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ArrowRight } from "lucide-react";
import type { Animal, Local } from "@/lib/types/database";
import { toast } from "sonner";

interface MoveAnimalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  locais: Local[];
  animais: Animal[];
  defaultOriginId?: string | null; // Se abrirmos o modal a partir de um pasto específico
}

export function MoveAnimalsDialog({
  open,
  onOpenChange,
  onSuccess,
  locais,
  animais,
  defaultOriginId,
}: MoveAnimalsDialogProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [originId, setOriginId] = useState<string>(defaultOriginId || "all");
  const [destinationId, setDestinationId] = useState<string>("");
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [motivo, setMotivo] = useState("");

  // Filtrar animais baseados na origem selecionada
  const filteredAnimals = animais.filter((a) => {
    if (originId === "all") return true;
    if (originId === "sem_local") return !a.local_id;
    return a.local_id === originId;
  });

  // Resetar seleção quando mudar origem
  useEffect(() => {
    setSelectedAnimals([]);
  }, [originId]);

  // Atualizar origem se a prop mudar
  useEffect(() => {
    if (defaultOriginId) setOriginId(defaultOriginId);
  }, [defaultOriginId]);

  function toggleAnimal(id: string) {
    setSelectedAnimals((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selectedAnimals.length === filteredAnimals.length) {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals(filteredAnimals.map((a) => a.id));
    }
  }

  async function handleSubmit() {
    if (!destinationId || selectedAnimals.length === 0) return;
    setLoading(true);

    try {
      const records = selectedAnimals.map((animalId) => {
        const animal = animais.find((a) => a.id === animalId);
        return {
          animal_id: animalId,
          local_origem_id: animal?.local_id || null,
          local_destino_id: destinationId,
          data_movimentacao: date,
          motivo: motivo || "Movimentação de rotina",
        };
      });

      // 1. Registrar histórico
      const { error: historyError } = await supabase
        .from("historico_movimentacao")
        .insert(records);

      if (historyError) throw historyError;

      // 2. Atualizar animais
      const { error: updateError } = await supabase
        .from("animais")
        .update({ local_id: destinationId })
        .in("id", selectedAnimals);

      if (updateError) throw updateError;

      onSuccess();
      onOpenChange(false);
      setSelectedAnimals([]);
      setDestinationId("");
      toast.success("Sucesso ao movimentar os animais.");
    } catch (error) {
      toast.error("Erro na movimentação: " + error);
      console.error("Erro na movimentação:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Movimentação de Lote</DialogTitle>
          <DialogDescription>
            Selecione a origem, o destino e os animais a serem movidos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={originId} onValueChange={setOriginId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os locais</SelectItem>
                  <SelectItem value="sem_local">Sem local definido</SelectItem>
                  {locais.map((local) => (
                    <SelectItem key={local.id} value={local.id}>
                      {local.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground mb-2" />
              <div className="space-y-2 flex-1">
                <Label>Destino</Label>
                <Select value={destinationId} onValueChange={setDestinationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {locais
                      .filter((l) => l.id !== originId)
                      .map((local) => (
                        <SelectItem key={local.id} value={local.id}>
                          {local.nome} ({local.tipo})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo (Opcional)</Label>
              <Input
                placeholder="Ex: Rotação de pasto"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Animais Disponíveis ({filteredAnimals.length})</Label>
              <Button
                variant="link"
                size="sm"
                onClick={toggleAll}
                className="h-auto p-0"
              >
                {selectedAnimals.length === filteredAnimals.length
                  ? "Desmarcar todos"
                  : "Selecionar todos"}
              </Button>
            </div>

            <ScrollArea className="h-[200px] border rounded-md p-2">
              {filteredAnimals.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum animal encontrado na origem selecionada.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredAnimals.map((animal) => (
                    <div
                      key={animal.id}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={animal.id}
                        checked={selectedAnimals.includes(animal.id)}
                        onCheckedChange={() => toggleAnimal(animal.id)}
                      />
                      <label
                        htmlFor={animal.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {animal.numero_brinco || "S/ Brinco"}
                        <span className="text-muted-foreground ml-1 font-normal">
                          - {animal.nome || "Sem nome"}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <p className="text-xs text-muted-foreground text-right">
              {selectedAnimals.length} animais selecionados
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !destinationId || selectedAnimals.length === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Movimentação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
