"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/format";
import {
  FileText,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Printer,
  BarChart3,
  Syringe,
  CreditCard,
  Users,
} from "lucide-react";
import type {
  Animal,
  Raca,
  Transacao,
  Parceiro,
  AgendaVacina,
  TipoVacina,
  Parcela,
} from "@/lib/types/database";

interface RelatoriosClientProps {
  animais: (Animal & { raca?: Raca })[];
  transacoes: (Transacao & { parceiro?: Parceiro })[];
  vacinas: (AgendaVacina & { animal?: Animal; tipo_vacina?: TipoVacina })[];
  parcelas: (Parcela & { transacao?: Transacao & { parceiro?: Parceiro } })[];
}

export function RelatoriosClient({
  animais,
  transacoes,
  vacinas,
  parcelas,
}: RelatoriosClientProps) {
  const [periodo, setPeriodo] = useState("anual");

  // Estatísticas do Rebanho
  const rebanhoStats = {
    total: animais.length,
    ativos: animais.filter((a) => a.status === "ativo").length,
    machos: animais.filter((a) => a.genero === "M" && a.status === "ativo")
      .length,
    femeas: animais.filter((a) => a.genero === "F" && a.status === "ativo")
      .length,
    nascidos: animais.filter((a) => a.origem === "nascido").length,
    comprados: animais.filter((a) => a.origem === "comprado").length,
    vendidos: animais.filter((a) => a.status === "vendido").length,
    mortos: animais.filter((a) => a.status === "morto").length,
  };

  // Estatísticas por Raça
  const racaStats = animais
    .filter((a) => a.status === "ativo")
    .reduce((acc, animal) => {
      const raca = animal.raca?.nome || "Sem raça";
      acc[raca] = (acc[raca] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Estatísticas Financeiras
  const financeiroStats = {
    compras: transacoes.filter((t) => t.tipo === "compra"),
    vendas: transacoes.filter((t) => t.tipo === "venda"),
    totalCompras: transacoes
      .filter((t) => t.tipo === "compra")
      .reduce((acc, t) => acc + t.valor_total, 0),
    totalVendas: transacoes
      .filter((t) => t.tipo === "venda")
      .reduce((acc, t) => acc + t.valor_total, 0),
  };

  const saldo = financeiroStats.totalVendas - financeiroStats.totalCompras;

  // Estatísticas de Vacinas
  const vacinaStats = {
    total: vacinas.length,
    aplicadas: vacinas.filter((v) => v.status === "aplicada").length,
    pendentes: vacinas.filter((v) => v.status === "pendente").length,
    atrasadas: vacinas.filter((v) => v.status === "atrasada").length,
  };

  // Estatísticas de Parcelas
  const parcelaStats = {
    aReceber: parcelas.filter(
      (p) => p.transacao?.tipo === "venda" && p.status !== "pago"
    ),
    aPagar: parcelas.filter(
      (p) => p.transacao?.tipo === "compra" && p.status !== "pago"
    ),
    valorAReceber: parcelas
      .filter((p) => p.transacao?.tipo === "venda" && p.status !== "pago")
      .reduce((acc, p) => acc + p.valor, 0),
    valorAPagar: parcelas
      .filter((p) => p.transacao?.tipo === "compra" && p.status !== "pago")
      .reduce((acc, p) => acc + p.valor, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Relatórios e Análises</h2>
          <p className="text-sm text-muted-foreground">
            Visualize dados consolidados do seu rebanho e finanças
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Este Mês</SelectItem>
              <SelectItem value="trimestral">Trimestre</SelectItem>
              <SelectItem value="anual">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rebanho" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="rebanho" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Rebanho</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="sanitario" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            <span className="hidden sm:inline">Sanitário</span>
          </TabsTrigger>
          <TabsTrigger value="parcelas" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Parcelas</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba Rebanho */}
        <TabsContent value="rebanho" className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total Cadastrado
                  </p>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">{rebanhoStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    Ativo
                  </Badge>
                </div>
                <p className="text-2xl font-bold mt-2 text-emerald-600">
                  {rebanhoStats.ativos}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Machos</p>
                  <Badge>M</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">{rebanhoStats.machos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Fêmeas</p>
                  <Badge variant="secondary">F</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">{rebanhoStats.femeas}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Composição por Raça */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Composição por Raça
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(racaStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([raca, count]) => {
                      const percentage = (
                        (count / rebanhoStats.ativos) *
                        100
                      ).toFixed(1);
                      return (
                        <div key={raca}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{raca}</span>
                            <span className="font-medium">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Movimentação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Movimentação do Rebanho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">Entradas</p>
                        <p className="text-xs text-muted-foreground">
                          Nascidos + Comprados
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-emerald-600">
                      +{rebanhoStats.nascidos + rebanhoStats.comprados}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Saídas</p>
                        <p className="text-xs text-muted-foreground">
                          Vendidos + Mortos
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-red-600">
                      -{rebanhoStats.vendidos + rebanhoStats.mortos}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Financeiro */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Compras</p>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-xl font-bold mt-2 text-red-600">
                  {formatCurrency(financeiroStats.totalCompras)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {financeiroStats.compras.length} transações
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Vendas</p>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-xl font-bold mt-2 text-emerald-600">
                  {formatCurrency(financeiroStats.totalVendas)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {financeiroStats.vendas.length} transações
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  {saldo >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <p
                  className={`text-xl font-bold mt-2 ${
                    saldo >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(saldo)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold mt-2">
                  {formatCurrency(
                    transacoes.length > 0
                      ? (financeiroStats.totalCompras +
                          financeiroStats.totalVendas) /
                          transacoes.length
                      : 0
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Últimas Transações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Últimas Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacoes.slice(0, 10).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{formatDate(t.data_negociacao)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.tipo === "compra" ? "destructive" : "default"
                          }
                        >
                          {t.tipo === "compra" ? "Compra" : "Venda"}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.parceiro?.nome || "-"}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          t.tipo === "compra"
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {t.tipo === "compra" ? "-" : "+"}
                        {formatCurrency(t.valor_total)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(t.status)}>
                          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Sanitário */}
        <TabsContent value="sanitario" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Vacinas</p>
                  <Syringe className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">{vacinaStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Aplicadas</p>
                  <Badge className="bg-emerald-100 text-emerald-800">OK</Badge>
                </div>
                <p className="text-2xl font-bold mt-2 text-emerald-600">
                  {vacinaStats.aplicadas}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <Badge className="bg-amber-100 text-amber-800">
                    Aguardando
                  </Badge>
                </div>
                <p className="text-2xl font-bold mt-2 text-amber-600">
                  {vacinaStats.pendentes}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Atrasadas</p>
                  <Badge className="bg-red-100 text-red-800">Atenção</Badge>
                </div>
                <p className="text-2xl font-bold mt-2 text-red-600">
                  {vacinaStats.atrasadas}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Próximas Vacinas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agenda de Vacinação
              </CardTitle>
              <CardDescription>
                Próximas vacinas pendentes e atrasadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Vacina</TableHead>
                    <TableHead>Data Prevista</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacinas
                    .filter((v) => v.status !== "aplicada")
                    .slice(0, 10)
                    .map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">
                          {v.animal?.nome || v.animal?.numero_brinco || "-"}
                        </TableCell>
                        <TableCell>{v.tipo_vacina?.nome || "-"}</TableCell>
                        <TableCell>{formatDate(v.data_prevista)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(v.status)}>
                            {v.status.charAt(0).toUpperCase() +
                              v.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Parcelas */}
        <TabsContent value="parcelas" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">A Receber</p>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-xl font-bold mt-2 text-emerald-600">
                  {formatCurrency(parcelaStats.valorAReceber)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {parcelaStats.aReceber.length} parcelas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">A Pagar</p>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-xl font-bold mt-2 text-red-600">
                  {formatCurrency(parcelaStats.valorAPagar)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {parcelaStats.aPagar.length} parcelas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Saldo Projetado
                  </p>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <p
                  className={`text-xl font-bold mt-2 ${
                    parcelaStats.valorAReceber - parcelaStats.valorAPagar >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    parcelaStats.valorAReceber - parcelaStats.valorAPagar
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total Parcelas
                  </p>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mt-2">{parcelas.length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* A Receber */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                  Contas a Receber
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parcelaStats.aReceber.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          {p.transacao?.parceiro?.nome || "Cliente"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Venc: {formatDate(p.data_vencimento)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {formatCurrency(p.valor)}
                        </p>
                        <Badge
                          className={getStatusColor(p.status)}
                          variant="outline"
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {parcelaStats.aReceber.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma parcela a receber
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* A Pagar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Contas a Pagar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parcelaStats.aPagar.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          {p.transacao?.parceiro?.nome || "Fornecedor"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Venc: {formatDate(p.data_vencimento)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {formatCurrency(p.valor)}
                        </p>
                        <Badge
                          className={getStatusColor(p.status)}
                          variant="outline"
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {parcelaStats.aPagar.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma parcela a pagar
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
