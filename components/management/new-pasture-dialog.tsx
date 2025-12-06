"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface NewPastureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewPastureDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewPastureDialogProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "pasto",
    area_hectares: "",
    capacidade_maxima: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("locais").insert({
        nome: formData.nome,
        tipo: formData.tipo,
        area_hectares: Number(formData.area_hectares) || 0,
        capacidade_maxima: Number(formData.capacidade_maxima) || 0,
      });

      if (error) throw error;

      onSuccess();
      onOpenChange(false);
      setFormData({
        nome: "",
        tipo: "pasto",
        area_hectares: "",
        capacidade_maxima: "",
      });
    } catch (error) {
      console.error("Erro ao criar local:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Local de Manejo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: Pasto do Fundo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(v) => setFormData({ ...formData, tipo: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pasto">Pasto</SelectItem>
                <SelectItem value="piquete">Piquete Rotacionado</SelectItem>
                <SelectItem value="curral">Curral</SelectItem>
                <SelectItem value="confinamento">Confinamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Área (ha)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.area_hectares}
                onChange={(e) =>
                  setFormData({ ...formData, area_hectares: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Capacidade (cabeças)</Label>
              <Input
                type="number"
                value={formData.capacidade_maxima}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacidade_maxima: e.target.value,
                  })
                }
              />
            </div>
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
