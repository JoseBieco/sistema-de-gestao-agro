"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/format";
import {
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import type { Parcela, Transacao, Parceiro } from "@/lib/types/database";
import { ImageUpload } from "@/components/ui/image-upload";

type ParcelaExtended = Parcela & {
  transacao?: Transacao & {
    parceiro?: Parceiro;
  };
};

interface ParcelasPageClientProps {
  initialParcelas: ParcelaExtended[];
}

export function ParcelasPageClient({
  initialParcelas,
}: ParcelasPageClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [parcelas, setParcelas] = useState(initialParcelas);
  const [activeTab, setActiveTab] = useState("pendentes");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedParcela, setSelectedParcela] =
    useState<ParcelaExtended | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    data_pagamento: new Date().toISOString().split("T")[0],
    data_baixa_promissoria: "",
  });
  // Adicionar estado para imagem da promissória no modal de pagamento
  const [fotoPromissoria, setFotoPromissoria] = useState("");

  async function refreshParcelas() {
    const { data } = await supabase
      .from("parcelas")
      .select(
        `
        *,
        transacao:transacoes(
          id,
          tipo,
          parceiro:parceiros(id, nome)
        )
      `
      )
      .order("data_vencimento", { ascending: true });

    if (data) setParcelas(data);
    router.refresh();
  }

  function openPaymentDialog(parcela: ParcelaExtended) {
    setSelectedParcela(parcela);
    setPaymentData({
      data_pagamento: new Date().toISOString().split("T")[0],
      data_baixa_promissoria: "",
    });
    setFotoPromissoria(parcela.foto_promissoria_frente_url || ""); // Carrega se já existir
    setPaymentDialogOpen(true);
  }

  async function handlePayment() {
    if (!selectedParcela) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("parcelas")
        .update({
          status: "pago",
          data_pagamento: paymentData.data_pagamento,
          data_baixa_promissoria: paymentData.data_baixa_promissoria || null,
          foto_promissoria_frente_url: fotoPromissoria || null,
        })
        .eq("id", selectedParcela.id);

      if (error) throw error;

      // Check if all parcels are paid to finalize transaction
      const { data: allParcelas } = await supabase
        .from("parcelas")
        .select("status")
        .eq("transacao_id", selectedParcela.transacao_id);

      if (allParcelas?.every((p) => p.status === "pago")) {
        await supabase
          .from("transacoes")
          .update({ status: "finalizada" })
          .eq("id", selectedParcela.transacao_id);
      }

      await refreshParcelas();
      setPaymentDialogOpen(false);
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const processedParcelas = parcelas.map((p) => {
    if (p.status === "pendente" && p.data_vencimento < today) {
      return { ...p, status: "atrasado" as const };
    }
    return p;
  });

  const aReceber = processedParcelas.filter(
    (p) => p.transacao?.tipo === "venda" && p.status !== "pago"
  );
  const aPagar = processedParcelas.filter(
    (p) => p.transacao?.tipo === "compra" && p.status !== "pago"
  );
  const pendentes = processedParcelas.filter((p) => p.status === "pendente");
  const atrasadas = processedParcelas.filter((p) => p.status === "atrasado");
  const pagas = processedParcelas.filter((p) => p.status === "pago");

  const filteredParcelas = (() => {
    switch (activeTab) {
      case "pendentes":
        return pendentes;
      case "atrasadas":
        return atrasadas;
      case "pagas":
        return pagas;
      case "receber":
        return aReceber;
      case "pagar":
        return aPagar;
      default:
        return processedParcelas;
    }
  })();

  const stats = {
    totalReceber: aReceber.reduce((acc, p) => acc + p.valor, 0),
    totalPagar: aPagar.reduce((acc, p) => acc + p.valor, 0),
    atrasadas: atrasadas.length,
    pendentes: pendentes.length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">A Receber</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(stats.totalReceber)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-red-500/10 p-3">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">A Pagar</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(stats.totalPagar)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold">{stats.atrasadas}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{stats.pendentes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Controle de Parcelas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="pendentes">
                Pendentes ({pendentes.length})
              </TabsTrigger>
              <TabsTrigger value="atrasadas">
                Atrasadas ({atrasadas.length})
              </TabsTrigger>
              <TabsTrigger value="receber">
                A Receber ({aReceber.length})
              </TabsTrigger>
              <TabsTrigger value="pagar">A Pagar ({aPagar.length})</TabsTrigger>
              <TabsTrigger value="pagas">Pagas ({pagas.length})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParcelas.length > 0 ? (
                    filteredParcelas.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.transacao?.parceiro?.nome || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.transacao?.tipo === "venda"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {p.transacao?.tipo === "venda"
                              ? "Receber"
                              : "Pagar"}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.numero_parcela}ª</TableCell>
                        <TableCell>{formatDate(p.data_vencimento)}</TableCell>
                        <TableCell
                          className={
                            p.transacao?.tipo === "venda"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }
                        >
                          {formatCurrency(p.valor)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(p.status)}>
                            {p.status.charAt(0).toUpperCase() +
                              p.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.status !== "pago" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPaymentDialog(p)}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Baixar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nenhuma parcela encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <p className="text-sm">
                <span className="text-muted-foreground">Parceiro:</span>{" "}
                <span className="font-medium">
                  {selectedParcela?.transacao?.parceiro?.nome}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Parcela:</span>{" "}
                <span className="font-medium">
                  {selectedParcela?.numero_parcela}ª
                </span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Valor:</span>{" "}
                <span className="font-medium">
                  {formatCurrency(selectedParcela?.valor || 0)}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Data do Pagamento</Label>
              <Input
                type="date"
                value={paymentData.data_pagamento}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    data_pagamento: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Data da Baixa da Promissória (opcional)</Label>
              <Input
                type="date"
                value={paymentData.data_baixa_promissoria}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    data_baixa_promissoria: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Data em que a promissória física foi devolvida/recolhida
              </p>
            </div>
            {/* Campo de imagem */}
            <div className="pt-2">
              <ImageUpload
                label="Foto da Promissória (Recibo)"
                value={fotoPromissoria}
                onChange={(url) => setFotoPromissoria(url)}
                onRemove={() => setFotoPromissoria("")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handlePayment} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
