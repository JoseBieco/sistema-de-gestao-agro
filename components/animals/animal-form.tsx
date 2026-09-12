"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, X } from "lucide-react";
import type { Animal, Raca, Genero, OrigemAnimal } from "@/lib/types/database";
import { differenceInMonths, parseISO } from "date-fns";
import { toast } from "sonner";

import { getRacas } from "@/app/racas/actions";
import { getAnimais, createAnimal, updateAnimal } from "@/app/animais/actions";

interface AnimalFormProps {
  animal?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AnimalForm({ animal, onSuccess, onCancel }: AnimalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [racas, setRacas] = useState<Raca[]>([]);
  const [animais, setAnimais] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    brinco: animal?.brinco || animal?.brinco || "",
    nome: animal?.nome || "",
    sexo: animal?.sexo || animal?.sexo || "M",
    data_nascimento: animal?.data_nascimento ? animal.data_nascimento.toISOString().split('T')[0] : "",
    peso_nascimento: animal?.peso_nascimento?.toString() || "",
    origem: animal?.origem || "nascido",
    raca_id: animal?.raca_id || "default_raca_id",
    mae_id: animal?.mae_id || "default_mae_id",
    pai_id: animal?.pai_id || "default_pai_id",
    observacoes: animal?.observacoes || "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [racasRes, animaisRes] = await Promise.all([
      getRacas(),
      getAnimais()
    ]);

    if (racasRes) setRacas(racasRes);
    if (animaisRes) {
      setAnimais(animaisRes.filter((a: any) => a.status !== "morto" && a.status !== "vendido"));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanId = (value: string) => {
        if (!value || value.startsWith("default_")) return null;
        return value;
      };

      const data = {
        brinco: formData.brinco,
        nome: formData.nome,
        sexo: formData.sexo,
        origem: formData.origem,
        observacoes: formData.observacoes,
        peso_nascimento: formData.peso_nascimento
          ? Number.parseFloat(formData.peso_nascimento)
          : null,
        raca_id: cleanId(formData.raca_id),
        mae_id: cleanId(formData.mae_id),
        pai_id: cleanId(formData.pai_id),
        data_nascimento: formData.data_nascimento ? new Date(formData.data_nascimento) : null,
      };

      if (animal?.id) {
        const res = await updateAnimal(animal.id, data);
        if (res?.error) {
          toast.error("Erro: " + res.error);
          return;
        }
      } else {
        const res = await createAnimal({ ...data, status: "ATIVO" });
        if (res?.error) {
          toast.error("Erro: " + res.error);
          return;
        }
      }

      onSuccess?.();
      toast.success("Animal salvo com sucesso!");
      router.push("/animais");
      router.refresh();
    } catch (error: any) {
      console.error("Erro interno:", error);
      toast.error("Erro ao salvar animal: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  }

  // Lógica de Filtro Inteligente ---

  // Função para verificar se um potencial pai/mãe tem idade compatível
  const isIdadeCompativel = (candidato: Animal) => {
    // Não pode ser ele mesmo
    if (candidato.id === animal?.id) return false;

    // Se o animal sendo criado tem data de nascimento, o pai/mãe deve ser mais velho
    if (formData.data_nascimento && candidato.data_nascimento) {
      return (
        new Date(candidato.data_nascimento) < new Date(formData.data_nascimento)
      );
    }

    // Se não tem data para comparar, assumimos idade mínima reprodutiva (ex: 12 meses)
    if (candidato.data_nascimento) {
      const idadeMeses = differenceInMonths(
        new Date(),
        parseISO(candidato.data_nascimento)
      );
      return idadeMeses >= 12; // Mínimo 12 meses para aparecer na lista
    }

    // Se não tem data de nascimento cadastrada, mostramos na lista (pode ser animal antigo comprado)
    return true;
  };

  const femeas = animais.filter(
    (a) => a.sexo === "F" && isIdadeCompativel(a)
  );
  const machos = animais.filter(
    (a) => a.sexo === "M" && isIdadeCompativel(a)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identificação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brinco">Número do Brinco</Label>
                <Input
                  id="brinco"
                  value={formData.brinco}
                  onChange={(e) =>
                    setFormData({ ...formData, brinco: e.target.value })
                  }
                  placeholder="Ex: B-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome (opcional)</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Mimosa"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sexo">Gênero</Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value: Genero) =>
                    setFormData({ ...formData, sexo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Macho</SelectItem>
                    <SelectItem value="F">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Select
                  value={formData.origem}
                  onValueChange={(value: OrigemAnimal) =>
                    setFormData({ ...formData, origem: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nascido">Nascido na Fazenda</SelectItem>
                    <SelectItem value="comprado">Comprado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data_nascimento: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso_nascimento">Peso ao Nascer (kg)</Label>
                <Input
                  id="peso_nascimento"
                  type="number"
                  step="0.1"
                  value={formData.peso_nascimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      peso_nascimento: e.target.value,
                    })
                  }
                  placeholder="Ex: 35.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="raca_id">Raça</Label>
              <Select
                value={formData.raca_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, raca_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma raça" />
                </SelectTrigger>
                <SelectContent>
                  {racas.map((raca) => (
                    <SelectItem key={raca.id} value={raca.id}>
                      {raca.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Genealogia e Sanitário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Genealogia e Sanitário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mae_id">Mãe</Label>
              <Select
                value={formData.mae_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, mae_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a mãe (fêmeas reprodutoras)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default_mae_id">Não informado</SelectItem>
                  {femeas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.brinco || a.nome}
                      {a.data_nascimento &&
                        ` (${new Date(a.data_nascimento).getFullYear()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pai_id">Pai</Label>
              <Select
                value={formData.pai_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, pai_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o pai (touros)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default_pai_id">Não informado</SelectItem>
                  {machos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.brinco || a.nome}
                      {a.data_nascimento &&
                        ` (${new Date(a.data_nascimento).getFullYear()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                placeholder="Informações adicionais sobre o animal..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.back())}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {animal ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
