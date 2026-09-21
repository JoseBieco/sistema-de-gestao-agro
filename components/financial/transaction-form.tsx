"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Save, X, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { getTransactionFormData } from "@/app/transacoes/form-actions";
import { createTransacao } from "@/app/transacoes/actions";
import { SaleGroupsEditor } from "./sale-groups-editor";


export function TransactionForm({
  tipo,
  onSuccess,
  onCancel,
}: {
  tipo: "compra" | "venda";
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [animais, setAnimais] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    parceiro_id: "",
    data_negociacao: new Date().toISOString().split("T")[0],
    qtd_parcelas: 1,
    forma_pagamento: "dinheiro",
    observacoes: "",
    valor_total: 0,
    desconto_carcaca: 50,
  });

  const [animaisSelecionados, setAnimaisSelecionados] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupsSummary, setGroupsSummary] = useState("");
  const [groupsData, setGroupsData] = useState<any[]>([]);

  useEffect(() => {
    getTransactionFormData(tipo).then(res => {
      setParceiros(res.parceiros);
      setAnimais(res.animais);
      setFormData(f => ({ ...f, desconto_carcaca: res.desconto_carcaca ?? 50 }));
    }).catch(console.error);
  }, [tipo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createTransacao({
        ...formData,
        tipo,
        animais_ids: animaisSelecionados,
        grupos_data: groupsData,
        observacoes: groupsSummary ? `${formData.observacoes ? formData.observacoes + '\n\n' : ''}${groupsSummary}` : formData.observacoes,
      });

      onSuccess?.();
      router.push(tipo === "compra" ? "/compras" : "/vendas");
      toast.success("Sucesso ao salvar a transação.");
    } catch (error) {
      toast.error("Erro ao salvar a transação.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const toggleAnimal = (id: string) => {
    setAnimaisSelecionados(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const filteredAnimais = animais.filter(animal => {
    const term = searchTerm.toLowerCase();
    return !term || animal.brinco?.toLowerCase().includes(term) || animal.nome?.toLowerCase().includes(term);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
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
                onValueChange={(v) => setFormData({ ...formData, parceiro_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um parceiro" />
                </SelectTrigger>
                <SelectContent>
                  {parceiros.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
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
                  onChange={(e) => setFormData({ ...formData, data_negociacao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_total === 0 ? "" : formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Número de Parcelas</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.qtd_parcelas}
                  onChange={(e) => setFormData({ ...formData, qtd_parcelas: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Animais Relacionados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SaleGroupsEditor 
              animaisDisponiveis={animais}
              tipo={tipo}
              descontoCarcacaInicial={formData.desconto_carcaca}
              onDescontoCarcacaChange={(val) => setFormData(f => ({ ...f, desconto_carcaca: val }))}
              onGroupsChange={(ids, summary, data) => {
                setAnimaisSelecionados(ids);
                setGroupsSummary(summary);
                setGroupsData(data);
              }}
              onTotalCalculated={(total) => setFormData(f => ({ ...f, valor_total: total }))}
            />
          </CardContent>
        </Card>
      </div>

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
          Registrar {tipo === "compra" ? "Compra" : "Venda"}
        </Button>
      </div>
    </form>
  );
}
