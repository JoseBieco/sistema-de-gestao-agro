"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import {
  TIPOS_COTACAO,
  type CotacaoHistorica,
  type TipoCotacao,
} from "@/lib/types/database";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
} from "lucide-react";
import {
  format,
  subMonths,
  subDays,
  subYears,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface CotacoesBIProps {
  cotacoes: CotacaoHistorica[];
}

type PeriodoPreset = "7d" | "30d" | "90d" | "6m" | "1y" | "custom";

const PERIODO_OPTIONS: { value: PeriodoPreset; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "6m", label: "6 meses" },
  { value: "1y", label: "1 ano" },
  { value: "custom", label: "Personalizado" },
];

export function CotacoesBIClient({ cotacoes }: CotacoesBIProps) {
  // Encontrar a data mais recente nos dados ou usar hoje como fallback
  const ultimaDataDados = useMemo(() => {
    if (!cotacoes || cotacoes.length === 0) return new Date();
    // Ordena descrescente e pega a primeira
    const datas = cotacoes
      .map((c) => c.data)
      .sort()
      .reverse();
    return parseISO(datas[0]);
  }, [cotacoes]);

  const [selectedTipos, setSelectedTipos] = useState<TipoCotacao[]>([
    "boi_gordo",
  ]);
  const [periodoPreset, setPeriodoPreset] = useState<PeriodoPreset>("1y"); // Mudei padrão para 1 ano
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: format(subMonths(new Date(), 6), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  // Ajustar o cálculo do dateRange para usar 'ultimaDataDados' como âncora
  const dateRange = useMemo(() => {
    // Em vez de 'new Date()', usamos a última data encontrada nos dados
    const end = ultimaDataDados;
    let start: Date;

    switch (periodoPreset) {
      case "7d":
        start = subDays(end, 7);
        break;
      case "30d":
        start = subDays(end, 30);
        break;
      case "90d":
        start = subDays(end, 90);
        break;
      case "6m":
        start = subMonths(end, 6);
        break;
      case "1y":
        start = subYears(end, 1);
        break;
      case "custom":
        return {
          start: parseISO(customDateRange.start),
          end: parseISO(customDateRange.end),
        };
      default:
        start = subMonths(end, 6);
    }

    return { start, end };
  }, [periodoPreset, customDateRange, ultimaDataDados]); // Adicione ultimaDataDados na dependência

  // Filtrar cotações pelo período e tipos selecionados
  const filteredCotacoes = useMemo(() => {
    return cotacoes.filter((c) => {
      const dataCotacao = parseISO(c.data);
      const dentroDoIntervalo = isWithinInterval(dataCotacao, dateRange);
      const tipoSelecionado = selectedTipos.includes(c.tipo as TipoCotacao);
      return dentroDoIntervalo && tipoSelecionado;
    });
  }, [cotacoes, dateRange, selectedTipos]);

  // Preparar dados para o gráfico (agrupa por data)
  const chartData = useMemo(() => {
    const dataMap = new Map<string, Record<string, number | string>>();

    filteredCotacoes.forEach((c) => {
      const dateKey = c.data;
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { date: dateKey });
      }
      const entry = dataMap.get(dateKey)!;
      entry[c.tipo] = c.valor;
    });

    return Array.from(dataMap.values()).sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
  }, [filteredCotacoes]);

  // Calcular estatísticas por tipo
  const estatisticas = useMemo(() => {
    const stats: Record<
      TipoCotacao,
      {
        atual: number;
        anterior: number;
        variacao: number;
        variacaoPercent: number;
        min: number;
        max: number;
        media: number;
      }
    > = {} as Record<
      TipoCotacao,
      {
        atual: number;
        anterior: number;
        variacao: number;
        variacaoPercent: number;
        min: number;
        max: number;
        media: number;
      }
    >;

    selectedTipos.forEach((tipo) => {
      const cotacoesTipo = filteredCotacoes
        .filter((c) => c.tipo === tipo)
        .sort((a, b) => a.data.localeCompare(b.data));

      if (cotacoesTipo.length > 0) {
        const valores = cotacoesTipo.map((c) => c.valor);
        const atual = valores[valores.length - 1];
        const anterior =
          valores.length > 1 ? valores[valores.length - 2] : atual;
        const variacao = atual - anterior;
        const variacaoPercent = anterior > 0 ? (variacao / anterior) * 100 : 0;

        stats[tipo] = {
          atual,
          anterior,
          variacao,
          variacaoPercent,
          min: Math.min(...valores),
          max: Math.max(...valores),
          media: valores.reduce((a, b) => a + b, 0) / valores.length,
        };
      }
    });

    return stats;
  }, [filteredCotacoes, selectedTipos]);

  // Toggle tipo selecionado
  const toggleTipo = (tipo: TipoCotacao) => {
    setSelectedTipos((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  // Tipos disponíveis (baseado nas cotações existentes)
  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set(cotacoes.map((c) => c.tipo));
    return Array.from(tipos) as TipoCotacao[];
  }, [cotacoes]);

  // Custom tooltip para o gráfico
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { dataKey: string; value: number; color: string }[];
    label?: string;
  }) => {
    if (!active || !payload || !label) return null;

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[180px]">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {format(parseISO(label), "dd MMM yyyy", { locale: ptBR })}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry) => {
            const tipoConfig = TIPOS_COTACAO[entry.dataKey as TipoCotacao];
            return (
              <div
                key={entry.dataKey}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">
                    {tipoConfig?.label || entry.dataKey}
                  </span>
                </div>
                <span className="font-medium text-sm">
                  {formatCurrency(entry.value)}
                  {tipoConfig?.unidade === "@" ? "/@" : "/cab"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Análise de Cotações de Mercado
              </CardTitle>
              <CardDescription>
                Compare preços históricos e identifique tendências do mercado
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Seleção de tipos */}
            <div className="flex-1">
              <Label className="text-sm font-medium mb-3 block">
                Tipos de Cotação
              </Label>
              <div className="flex flex-wrap gap-2">
                {tiposDisponiveis.map((tipo) => {
                  const config = TIPOS_COTACAO[tipo];
                  const isSelected = selectedTipos.includes(tipo);
                  return (
                    <button
                      key={tipo}
                      onClick={() => toggleTipo(tipo)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: config?.cor || "#888" }}
                      />
                      <span
                        className={cn("text-sm", isSelected && "font-medium")}
                      >
                        {config?.label || tipo}
                      </span>
                      {isSelected && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          {config?.unidade === "@" ? "@" : "cab"}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de período */}
            <div className="lg:w-[300px]">
              <Label className="text-sm font-medium mb-3 block">Período</Label>
              <div className="flex flex-wrap gap-2">
                {PERIODO_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      periodoPreset === option.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setPeriodoPreset(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              {periodoPreset === "custom" && (
                <div className="flex gap-2 mt-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">De</Label>
                    <Input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) =>
                        setCustomDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Até</Label>
                    <Input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) =>
                        setCustomDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de estatísticas */}
      {selectedTipos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {selectedTipos.map((tipo) => {
            const config = TIPOS_COTACAO[tipo];
            const stats = estatisticas[tipo];
            if (!stats) return null;

            const isPositive = stats.variacaoPercent > 0;
            const isNeutral = stats.variacaoPercent === 0;

            return (
              <Card key={tipo} className="relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: config?.cor }}
                />
                <CardContent className="p-4 pl-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {config?.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {config?.unidade === "@" ? "/@" : "/cab"}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(stats.atual)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {isNeutral ? (
                          <Minus className="h-3 w-3 text-muted-foreground" />
                        ) : isPositive ? (
                          <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                        )}
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isNeutral
                              ? "text-muted-foreground"
                              : isPositive
                              ? "text-emerald-600"
                              : "text-red-600"
                          )}
                        >
                          {isPositive ? "+" : ""}
                          {stats.variacaoPercent.toFixed(2)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          vs anterior
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Mín: {formatCurrency(stats.min)}</p>
                      <p>Máx: {formatCurrency(stats.max)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Gráfico principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolução de Preços</CardTitle>
          <CardDescription>
            {format(dateRange.start, "dd/MM/yyyy", { locale: ptBR })} -{" "}
            {format(dateRange.end, "dd/MM/yyyy", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum dado disponível para o período selecionado</p>
                <p className="text-sm">
                  Selecione outros tipos ou ajuste o período
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      format(parseISO(value), "dd/MM", { locale: ptBR })
                    }
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `R$ ${value.toLocaleString("pt-BR")}`
                    }
                    domain={["dataMin", "dataMax"]}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) =>
                      TIPOS_COTACAO[value as TipoCotacao]?.label || value
                    }
                  />
                  {selectedTipos.map((tipo) => (
                    <Line
                      key={tipo}
                      type="monotone"
                      dataKey={tipo}
                      stroke={TIPOS_COTACAO[tipo]?.cor || "#888"}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de dados */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Históricos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Data</th>
                    {selectedTipos.map((tipo) => (
                      <th
                        key={tipo}
                        className="text-right py-3 px-2 font-medium"
                      >
                        <div className="flex items-center justify-end gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: TIPOS_COTACAO[tipo]?.cor,
                            }}
                          />
                          {TIPOS_COTACAO[tipo]?.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData
                    .slice()
                    .reverse()
                    .slice(0, 12)
                    .map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          {format(parseISO(String(row.date)), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </td>
                        {selectedTipos.map((tipo) => (
                          <td
                            key={tipo}
                            className="text-right py-3 px-2 font-medium"
                          >
                            {row[tipo] !== undefined
                              ? `${formatCurrency(Number(row[tipo]))}${
                                  TIPOS_COTACAO[tipo]?.unidade === "@"
                                    ? "/@"
                                    : "/cab"
                                }`
                              : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
