"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddWeightDialog } from "./add-weight-dialog";
import { formatDate } from "@/lib/utils/format";
import { Plus, Scale, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { HistoricoPesagem } from "@/lib/types/database";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeightHistoryProps {
  animalId: string;
  history: HistoricoPesagem[];
  currentWeight?: number | null;
}

export function WeightHistory({
  animalId,
  history,
  currentWeight,
}: WeightHistoryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Ordenar histórico por data (mais antigo primeiro para o gráfico)
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(a.data_pesagem).getTime() - new Date(b.data_pesagem).getTime()
  );

  // Calcular GMD e preparar dados para tabela (mais recente primeiro)
  const tableData = sortedHistory
    .map((record, index) => {
      let gmd = 0;
      if (index > 0) {
        const prevRecord = sortedHistory[index - 1];
        const weightDiff = record.peso - prevRecord.peso;
        const daysDiff = differenceInDays(
          parseISO(record.data_pesagem),
          parseISO(prevRecord.data_pesagem)
        );

        if (daysDiff > 0) {
          gmd = weightDiff / daysDiff; // kg por dia
        }
      }
      return { ...record, gmd };
    })
    .reverse(); // Inverter para a tabela mostrar o mais recente no topo

  // Dados para o gráfico
  const chartData = sortedHistory.map((h) => ({
    date: format(parseISO(h.data_pesagem), "dd/MM/yy"),
    fullDate: format(parseISO(h.data_pesagem), "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    }),
    weight: h.peso,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Controle de Peso
          </CardTitle>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Pesagem
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Gráfico */}
            <div className="lg:col-span-2 h-[300px] w-full min-w-0">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      unit="kg"
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      labelFormatter={(label, payload) =>
                        payload[0]?.payload.fullDate
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm border rounded-lg bg-muted/10">
                  Adicione pelo menos 2 pesagens para ver o gráfico
                </div>
              )}
            </div>

            {/* Resumo Rápido */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Peso Atual</p>
                <p className="text-3xl font-bold text-primary">
                  {currentWeight ? `${currentWeight} kg` : "-"}
                </p>
              </div>

              {tableData.length > 0 && tableData[0].gmd !== 0 && (
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm text-muted-foreground">Último GMD</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {tableData[0].gmd.toFixed(3)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      kg/dia
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tabela */}
          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead>GMD (kg/dia)</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length > 0 ? (
                  tableData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.data_pesagem)}</TableCell>
                      <TableCell className="font-medium">
                        {record.peso}
                      </TableCell>
                      <TableCell>
                        {record.gmd > 0 ? (
                          <span className="text-emerald-600 font-medium">
                            +{record.gmd.toFixed(3)}
                          </span>
                        ) : record.gmd < 0 ? (
                          <span className="text-red-600 font-medium">
                            {record.gmd.toFixed(3)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {record.observacoes || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Nenhuma pesagem registrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddWeightDialog
        animalId={animalId}
        currentWeight={currentWeight}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
