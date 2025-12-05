"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

interface AnimalFormProps {
  animal?: Animal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AnimalForm({ animal, onSuccess, onCancel }: AnimalFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [racas, setRacas] = useState<Raca[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);

  const [formData, setFormData] = useState({
    numero_brinco: animal?.numero_brinco || "",
    nome: animal?.nome || "",
    genero: animal?.genero || ("M" as Genero),
    data_nascimento: animal?.data_nascimento || "",
    peso_nascimento: animal?.peso_nascimento?.toString() || "",
    origem: animal?.origem || ("nascido" as OrigemAnimal),
    raca_id: animal?.raca_id || "default_raca_id",
    mae_id: animal?.mae_id || "default_mae_id",
    pai_id: animal?.pai_id || "default_pai_id",
    vacina_brucelose: animal?.vacina_brucelose || false,
    data_brucelose: animal?.data_brucelose || "",
    observacoes: animal?.observacoes || "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [racasRes, animaisRes] = await Promise.all([
      supabase.from("racas").select("*").order("nome"),
      supabase
        .from("animais")
        .select("id, numero_brinco, nome, genero")
        .eq("status", "ativo"),
    ]);

    if (racasRes.data) setRacas(racasRes.data);
    if (animaisRes.data) setAnimais(animaisRes.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Função auxiliar para limpar IDs inválidos/defaults
      const cleanId = (value: string) => {
        if (!value || value.startsWith("default_")) return null;
        return value;
      };

      const data = {
        ...formData,
        peso_nascimento: formData.peso_nascimento
          ? Number.parseFloat(formData.peso_nascimento)
          : null,
        raca_id: cleanId(formData.raca_id),
        mae_id: cleanId(formData.mae_id),
        pai_id: cleanId(formData.pai_id),
        data_nascimento: formData.data_nascimento || null,
        data_brucelose: formData.data_brucelose || null,
      };

      if (animal?.id) {
        const { error } = await supabase
          .from("animais")
          .update(data)
          .eq("id", animal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("animais")
          .insert({ ...data, status: "ativo" });
        if (error) throw error;
      }

      onSuccess?.();
      router.push("/animais");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar animal:", error);
    } finally {
      setLoading(false);
    }
  }

  const femeas = animais.filter((a) => a.genero === "F" && a.id !== animal?.id);
  const machos = animais.filter((a) => a.genero === "M" && a.id !== animal?.id);

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
                <Label htmlFor="numero_brinco">Número do Brinco</Label>
                <Input
                  id="numero_brinco"
                  value={formData.numero_brinco}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_brinco: e.target.value })
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
                <Label htmlFor="genero">Gênero</Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value: Genero) =>
                    setFormData({ ...formData, genero: value })
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
                  <SelectValue placeholder="Selecione a mãe (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default_mae_id">Não informado</SelectItem>
                  {femeas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.numero_brinco || a.nome || a.id.slice(0, 8)}
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
                  <SelectValue placeholder="Selecione o pai (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default_pai_id">Não informado</SelectItem>
                  {machos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.numero_brinco || a.nome || a.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brucelose - Only for females */}
            {formData.genero === "F" && (
              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="vacina_brucelose"
                      className="text-sm font-medium"
                    >
                      Vacina de Brucelose
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Obrigatória para fêmeas de 3 a 8 meses
                    </p>
                  </div>
                  <Switch
                    id="vacina_brucelose"
                    checked={formData.vacina_brucelose}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, vacina_brucelose: checked })
                    }
                  />
                </div>
                {formData.vacina_brucelose && (
                  <div className="space-y-2">
                    <Label htmlFor="data_brucelose">Data da Vacinação</Label>
                    <Input
                      id="data_brucelose"
                      type="date"
                      value={formData.data_brucelose}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_brucelose: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}

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
