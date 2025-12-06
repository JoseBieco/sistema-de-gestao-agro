"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ShoppingCart,
  TrendingUp,
  User,
  Calendar,
  CreditCard,
  FileText,
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
} from "lucide-react";
import type {
  TipoTransacao,
  Parcela,
  Parceiro,
  ItemTransacao,
  Animal,
  Raca,
} from "@/lib/types/database";

interface AnimaisTransacaoExtended {
  animal: Animal & { raca?: Raca };
  item?: ItemTransacao;
}

interface TransacaoExtended {
  id: string;
  tipo: TipoTransacao;
  data_negociacao: string;
  qtd_parcelas: number;
  forma_pagamento?: string;
  valor_total: number;
  nota_fiscal_url?: string;
  gta_url?: string;
  observacoes?: string;
  status: string;
  parceiro?: Parceiro;
  itens?: ItemTransacao[];
  parcelas?: Parcela[];
  animais_transacao?: AnimaisTransacaoExtended[];
}

interface TransacaoDetailClientProps {
  transacao: TransacaoExtended;
  tipo: TipoTransacao;
}

export function TransacaoDetailClient({
  transacao,
  tipo,
}: TransacaoDetailClientProps) {
  const [parcelas, setParcelas] = useState(transacao.parcelas || []);
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCompra = tipo === "compra";
  const Icon = isCompra ? ShoppingCart : TrendingUp;

  const stats = {
    totalParcelas: parcelas.length,
    parcelasPagas: parcelas.filter((p) => p.status === "pago").length,
    valorPago: parcelas
      .filter((p) => p.status === "pago")
      .reduce((acc, p) => acc + p.valor, 0),
    valorPendente: parcelas
      .filter((p) => p.status !== "pago")
      .reduce((acc, p) => acc + p.valor, 0),
  };

  const animais =
    transacao.animais_transacao?.map((at) => ({
      ...at.animal,
      valor: at.item?.valor_unitario,
      descricao: at.item?.descricao,
    })) || [];

  async function handleUpdateParcela(data: {
    status: string;
    data_pagamento?: string;
    data_baixa_promissoria?: string;
    observacoes?: string;
  }) {
    if (!selectedParcela) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("parcelas")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedParcela.id);

    if (!error) {
      setParcelas((prev) =>
        prev.map((p) => (p.id === selectedParcela.id ? { ...p, ...data } : p))
      );
      setDialogOpen(false);
      setSelectedParcela(null);
    }

    setLoading(false);
  }

  function getParcelaStatusIcon(status: string) {
    switch (status) {
      case "pago":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "atrasado":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={isCompra ? "/compras" : "/vendas"}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Icon
                className={`h-6 w-6 ${
                  isCompra ? "text-red-600" : "text-emerald-600"
                }`}
              />
              <h1 className="text-2xl font-bold">
                {isCompra ? "Compra" : "Venda"} #{transacao.id.slice(0, 8)}
              </h1>
              <Badge className={getStatusColor(transacao.status)}>
                {transacao.status.charAt(0).toUpperCase() +
                  transacao.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Registrada em {formatDate(transacao.data_negociacao)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div
              className={`rounded-lg p-3 ${
                isCompra ? "bg-red-500/10" : "bg-emerald-500/10"
              }`}
            >
              <CreditCard
                className={`h-5 w-5 ${
                  isCompra ? "text-red-600" : "text-emerald-600"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p
                className={`text-xl font-bold ${
                  isCompra ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatCurrency(transacao.valor_total)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Pago</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(stats.valorPago)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Pendente</p>
              <p className="text-xl font-bold text-amber-600">
                {formatCurrency(stats.valorPendente)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Animais</p>
              <p className="text-xl font-bold">{animais.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parceiro e Detalhes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isCompra ? "Vendedor" : "Comprador"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">
                    {transacao.parceiro?.nome || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-medium">
                    {transacao.parceiro?.documento || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">
                    {transacao.parceiro?.telefone || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {transacao.parceiro?.email || "Não informado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes da Transação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes da Transação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data da Negociação
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(transacao.data_negociacao)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Forma de Pagamento
                  </p>
                  <p className="font-medium capitalize">
                    {transacao.forma_pagamento?.replace("_", " ") ||
                      "Não informada"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parcelas</p>
                  <p className="font-medium">
                    {stats.parcelasPagas}/{stats.totalParcelas} pagas
                  </p>
                </div>
              </div>

              {transacao.observacoes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Observações
                    </p>
                    <p className="text-sm">{transacao.observacoes}</p>
                  </div>
                </>
              )}

              {/* Documentos */}
              <Separator className="my-4" />
              <div className="flex gap-4">
                {transacao.nota_fiscal_url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={transacao.nota_fiscal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Nota Fiscal
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <FileText className="mr-2 h-4 w-4" />
                    Nota Fiscal não anexada
                  </Button>
                )}
                {transacao.gta_url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={transacao.gta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Ver GTA
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <Truck className="mr-2 h-4 w-4" />
                    GTA não anexada
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Animais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Animais ({animais.length})
              </CardTitle>
              <CardDescription>
                Lista de animais vinculados a esta{" "}
                {isCompra ? "compra" : "venda"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brinco</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Gênero</TableHead>
                    <TableHead>Raça</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animais.length > 0 ? (
                    animais.map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell className="font-mono">
                          {animal.numero_brinco || "-"}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/animais/${animal.id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {animal.nome || "Sem nome"}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              animal.genero === "M" ? "default" : "secondary"
                            }
                          >
                            {animal.genero === "M" ? "Macho" : "Fêmea"}
                          </Badge>
                        </TableCell>
                        <TableCell>{animal.raca?.nome || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {animal.descricao || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {animal.valor ? formatCurrency(animal.valor) : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nenhum animal vinculado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Parcelas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Parcelas
              </CardTitle>
              <CardDescription>
                Controle de pagamento e promissórias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {parcelas.length > 0 ? (
                parcelas.map((parcela) => (
                  <div
                    key={parcela.id}
                    className={`p-4 rounded-lg border ${
                      parcela.status === "pago"
                        ? "bg-emerald-50 border-emerald-200"
                        : parcela.status === "atrasado"
                        ? "bg-red-50 border-red-200"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getParcelaStatusIcon(parcela.status)}
                        <span className="font-medium">
                          Parcela {parcela.numero_parcela}/{stats.totalParcelas}
                        </span>
                      </div>
                      <Badge className={getStatusColor(parcela.status)}>
                        {parcela.status.charAt(0).toUpperCase() +
                          parcela.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor:</span>
                        <span className="font-medium">
                          {formatCurrency(parcela.valor)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Vencimento:
                        </span>
                        <span>{formatDate(parcela.data_vencimento)}</span>
                      </div>
                      {parcela.data_pagamento && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Pago em:</span>
                          <span>{formatDate(parcela.data_pagamento)}</span>
                        </div>
                      )}
                      {parcela.data_baixa_promissoria && (
                        <div className="flex justify-between text-blue-700">
                          <span>Promissória devolvida:</span>
                          <span>
                            {formatDate(parcela.data_baixa_promissoria)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setSelectedParcela(parcela);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      {parcela.foto_promissoria_frente_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={parcela.foto_promissoria_frente_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma parcela registrada
                </p>
              )}
            </CardContent>
          </Card>

          {/* Resumo Itens */}
          {transacao.itens && transacao.itens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Grupos de Preço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {transacao.itens.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {item.descricao || `Grupo ${index + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantidade_animais} animais x{" "}
                        {formatCurrency(item.valor_unitario)}
                      </p>
                    </div>
                    <p className="font-bold">
                      {formatCurrency(
                        item.quantidade_animais * item.valor_unitario
                      )}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium">Total</span>
                  <span
                    className={`text-lg font-bold ${
                      isCompra ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {formatCurrency(transacao.valor_total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog Editar Parcela */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar Parcela {selectedParcela?.numero_parcela}
            </DialogTitle>
            <DialogDescription>
              Atualize o status de pagamento e informações da promissória
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateParcela({
                status: formData.get("status") as string,
                data_pagamento:
                  (formData.get("data_pagamento") as string) || undefined,
                data_baixa_promissoria:
                  (formData.get("data_baixa_promissoria") as string) ||
                  undefined,
                observacoes:
                  (formData.get("observacoes") as string) || undefined,
              });
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={selectedParcela?.status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_pagamento">Data do Pagamento</Label>
                <Input
                  id="data_pagamento"
                  name="data_pagamento"
                  type="date"
                  defaultValue={selectedParcela?.data_pagamento?.split("T")[0]}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_baixa_promissoria">
                Data da Devolução da Promissória
              </Label>
              <Input
                id="data_baixa_promissoria"
                name="data_baixa_promissoria"
                type="date"
                defaultValue={
                  selectedParcela?.data_baixa_promissoria?.split("T")[0]
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                defaultValue={selectedParcela?.observacoes}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
