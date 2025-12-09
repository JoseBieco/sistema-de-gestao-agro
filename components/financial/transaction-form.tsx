"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/format";
import { Loader2, Save, X, Plus, Trash2 } from "lucide-react";
import type {
  Parceiro,
  Animal,
  TipoTransacao,
  FormaPagamento,
} from "@/lib/types/database";
import { ImageUpload } from "../ui/image-upload";
import { uploadFile } from "@/lib/utils/upload";
import { toast } from "sonner";

interface PriceGroup {
  id: string;
  valor_unitario: string;
  quantidade_animais: number;
  descricao: string;
  animais_ids: string[];
}

interface TransactionFormProps {
  tipo: TipoTransacao;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({
  tipo,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);

  const [formData, setFormData] = useState({
    parceiro_id: "",
    data_negociacao: new Date().toISOString().split("T")[0],
    qtd_parcelas: 1,
    forma_pagamento: "dinheiro" as FormaPagamento,
    observacoes: "",
  });

  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([
    {
      id: "1",
      valor_unitario: "",
      quantidade_animais: 0,
      descricao: "",
      animais_ids: [],
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  // Adicionar novos estados para as imagens
  const [gtaFile, setGtaFile] = useState<File | null>(null);
  const [notaFile, setNotaFile] = useState<File | null>(null);

  async function loadData() {
    const parceiroTipo = tipo === "compra" ? "vendedor" : "comprador";

    const [parceirosRes, animaisRes] = await Promise.all([
      supabase
        .from("parceiros")
        .select("*")
        .or(`tipo.eq.${parceiroTipo},tipo.eq.ambos`)
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("animais")
        .select("id, numero_brinco, nome, genero")
        .eq("status", tipo === "compra" ? "ativo" : "ativo")
        .order("numero_brinco"),
    ]);

    if (parceirosRes.data) setParceiros(parceirosRes.data);
    if (animaisRes.data) setAnimais(animaisRes.data);
  }

  function addPriceGroup() {
    setPriceGroups([
      ...priceGroups,
      {
        id: Date.now().toString(),
        valor_unitario: "",
        quantidade_animais: 0,
        descricao: "",
        animais_ids: [],
      },
    ]);
  }

  function removePriceGroup(id: string) {
    if (priceGroups.length > 1) {
      setPriceGroups(priceGroups.filter((g) => g.id !== id));
    }
  }

  function updatePriceGroup(id: string, field: keyof PriceGroup, value: any) {
    setPriceGroups(
      priceGroups.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  }

  function toggleAnimalInGroup(groupId: string, animalId: string) {
    setPriceGroups(
      priceGroups.map((g) => {
        if (g.id !== groupId) return g;
        const newIds = g.animais_ids.includes(animalId)
          ? g.animais_ids.filter((id) => id !== animalId)
          : [...g.animais_ids, animalId];
        return { ...g, animais_ids: newIds, quantidade_animais: newIds.length };
      })
    );
  }

  // Get all selected animal IDs across all groups
  const selectedAnimalIds = priceGroups.flatMap((g) => g.animais_ids);
  const availableAnimals = animais.filter(
    (a) => !selectedAnimalIds.includes(a.id)
  );

  const totalAnimais = priceGroups.reduce(
    (acc, g) => acc + g.quantidade_animais,
    0
  );
  const valorTotal = priceGroups.reduce(
    (acc, g) =>
      acc + Number.parseFloat(g.valor_unitario || "0") * g.quantidade_animais,
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totalAnimais === 0) return;
    setLoading(true);

    try {
      // Fazer upload se houverem arquivos
      let gtaUrl = null;
      let notaUrl = null;

      if (gtaFile) {
        gtaUrl = await uploadFile(gtaFile, "documentos");
      }

      if (notaFile) {
        notaUrl = await uploadFile(notaFile, "documentos");
      }

      // Create transaction
      const { data: transacao, error: transacaoError } = await supabase
        .from("transacoes")
        .insert({
          tipo,
          parceiro_id: formData.parceiro_id || null,
          data_negociacao: formData.data_negociacao,
          qtd_parcelas: formData.qtd_parcelas,
          forma_pagamento: formData.forma_pagamento,
          valor_total: valorTotal,
          observacoes: formData.observacoes,
          status: "pendente",
          gta_url: gtaUrl,
          nota_fiscal_url: notaUrl,
        })
        .select()
        .single();

      if (transacaoError) throw transacaoError;

      // Create price groups (itens_transacao)
      for (const group of priceGroups) {
        if (group.animais_ids.length === 0) continue;

        const { data: item, error: itemError } = await supabase
          .from("itens_transacao")
          .insert({
            transacao_id: transacao.id,
            valor_unitario: Number.parseFloat(group.valor_unitario || "0"),
            quantidade_animais: group.quantidade_animais,
            descricao: group.descricao,
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // Link animals to transaction
        for (const animalId of group.animais_ids) {
          const { error: linkError } = await supabase
            .from("animais_transacao")
            .insert({
              transacao_id: transacao.id,
              animal_id: animalId,
              item_transacao_id: item.id,
            });

          if (linkError) throw linkError;

          // Update animal status
          if (tipo === "compra") {
            await supabase
              .from("animais")
              .update({ compra_id: transacao.id, origem: "comprado" })
              .eq("id", animalId);
          } else {
            await supabase
              .from("animais")
              .update({
                venda_id: transacao.id,
                status: "vendido",
                data_status: formData.data_negociacao,
              })
              .eq("id", animalId);
          }
        }
      }

      // Generate installments
      const valorParcela = valorTotal / formData.qtd_parcelas;
      const dataBase = new Date(formData.data_negociacao);

      for (let i = 0; i < formData.qtd_parcelas; i++) {
        const dataVencimento = new Date(dataBase);
        dataVencimento.setDate(dataVencimento.getDate() + (i + 1) * 30);

        const { error: parcelaError } = await supabase.from("parcelas").insert({
          transacao_id: transacao.id,
          numero_parcela: i + 1,
          data_vencimento: dataVencimento.toISOString().split("T")[0],
          valor: valorParcela,
          status: "pendente",
        });

        if (parcelaError) throw parcelaError;
      }

      onSuccess?.();
      router.push(tipo === "compra" ? "/compras" : "/vendas");
      router.refresh();
      toast.success("Sucesso ao salvar a transação.");
    } catch (error) {
      toast.success("Erro ao salvar a transação: " + error);
      console.error("Erro ao salvar transação:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transaction Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Dados da {tipo === "compra" ? "Compra" : "Venda"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{tipo === "compra" ? "Vendedor" : "Comprador"}</Label>
              <Select
                value={formData.parceiro_id}
                onValueChange={(v) =>
                  setFormData({ ...formData, parceiro_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um parceiro" />
                </SelectTrigger>
                <SelectContent>
                  {parceiros.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data da Negociação</Label>
                <Input
                  type="date"
                  value={formData.data_negociacao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data_negociacao: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(v: FormaPagamento) =>
                    setFormData({ ...formData, forma_pagamento: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="promissoria">Promissória</SelectItem>
                    <SelectItem value="permuta">Permuta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Número de Parcelas</Label>
              <Input
                type="number"
                min={1}
                value={formData.qtd_parcelas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qtd_parcelas: Number.parseInt(e.target.value) || 1,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Parcelas de{" "}
                {formatCurrency(valorTotal / formData.qtd_parcelas || 0)} cada
              </p>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                placeholder="Informações adicionais..."
                rows={3}
              />
            </div>

            {/* Documentos */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUpload
                label={
                  tipo === "venda"
                    ? "Guia de Transporte (GTA)"
                    : "GTA (Opcional)"
                }
                // Não passamos initialUrl pois é criação nova
                onFileChange={(file) => setGtaFile(file)}
              />
              <ImageUpload
                label="Nota Fiscal / Recibo"
                onFileChange={(file) => setNotaFile(file)}
              />
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total de Animais:</span>
                <span className="font-medium">{totalAnimais}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Valor Total:</span>
                <span className="text-primary">
                  {formatCurrency(valorTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Groups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Grupos de Preço</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPriceGroup}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Grupo
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {priceGroups.map((group, index) => (
              <div key={group.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Grupo {index + 1}</span>
                  {priceGroups.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePriceGroup(group.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Valor Unitário (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={group.valor_unitario}
                      onChange={(e) =>
                        updatePriceGroup(
                          group.id,
                          "valor_unitario",
                          e.target.value
                        )
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descrição</Label>
                    <Input
                      value={group.descricao}
                      onChange={(e) =>
                        updatePriceGroup(group.id, "descricao", e.target.value)
                      }
                      placeholder="Ex: Bezerros desmamados"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    Animais ({group.animais_ids.length} selecionados)
                  </Label>
                  <ScrollArea className="h-[120px] rounded border p-2">
                    <div className="grid gap-1">
                      {/* Show selected animals first */}
                      {group.animais_ids.map((animalId) => {
                        const animal = animais.find((a) => a.id === animalId);
                        if (!animal) return null;
                        return (
                          <label
                            key={animal.id}
                            className="flex items-center gap-2 rounded p-1.5 cursor-pointer bg-primary/10"
                          >
                            <Checkbox
                              checked={true}
                              onCheckedChange={() =>
                                toggleAnimalInGroup(group.id, animal.id)
                              }
                            />
                            <span className="text-xs">
                              {animal.numero_brinco ||
                                animal.nome ||
                                animal.id.slice(0, 8)}
                            </span>
                          </label>
                        );
                      })}
                      {/* Show available animals */}
                      {availableAnimals.map((animal) => (
                        <label
                          key={animal.id}
                          className="flex items-center gap-2 rounded p-1.5 cursor-pointer hover:bg-muted"
                        >
                          <Checkbox
                            checked={false}
                            onCheckedChange={() =>
                              toggleAnimalInGroup(group.id, animal.id)
                            }
                          />
                          <span className="text-xs">
                            {animal.numero_brinco ||
                              animal.nome ||
                              animal.id.slice(0, 8)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="text-right text-sm text-muted-foreground">
                  Subtotal:{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(
                      Number.parseFloat(group.valor_unitario || "0") *
                        group.quantidade_animais
                    )}
                  </span>
                </div>
              </div>
            ))}
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
        <Button type="submit" disabled={loading || totalAnimais === 0}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Registrar {tipo === "compra" ? "Compra" : "Venda"}
        </Button>
      </div>
    </form>
  );
}
