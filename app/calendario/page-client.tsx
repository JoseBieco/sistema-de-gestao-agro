"use client";

import { useState } from "react";
import type { TipoVacina } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Syringe, Coffee, Settings } from "lucide-react";
import Link from "next/link";

interface VacinasPageClientProps {
  initialTipos: TipoVacina[];
}

const MESES = [
  { num: 1, nome: "Janeiro" },
  { num: 2, nome: "Fevereiro" },
  { num: 3, nome: "Março" },
  { num: 4, nome: "Abril" },
  { num: 5, nome: "Maio" },
  { num: 6, nome: "Junho" },
  { num: 7, nome: "Julho" },
  { num: 8, nome: "Agosto" },
  { num: 9, nome: "Setembro" },
  { num: 10, nome: "Outubro" },
  { num: 11, nome: "Novembro" },
  { num: 12, nome: "Dezembro" },
];

export function VacinasPageClient({ initialTipos }: VacinasPageClientProps) {
  const currentMonthNum = new Date().getMonth() + 1; // 1-12
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8 text-green-600" />
            Calendário Sanitário
          </h2>
          <p className="text-muted-foreground mt-1">
            Planejamento anual de vacinas e manejos do rebanho.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/configuracoes">
            <Settings className="mr-2 h-4 w-4" />
            Configurar Vacinas
          </Link>
        </Button>
      </div>

      {initialTipos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Syringe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium">Nenhuma vacina cadastrada</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
              Para montar o seu calendário anual, você precisa primeiro cadastrar as vacinas e informar em quais meses elas serão aplicadas.
            </p>
            <Button asChild>
              <Link href="/configuracoes">Cadastrar Vacinas</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MESES.map((mes) => {
            const isCurrentMonth = mes.num === currentMonthNum;
            const vacinasNoMes = initialTipos.filter((t) => 
              t.meses_aplicacao?.includes(mes.num)
            );
            
            return (
              <Card 
                key={mes.num} 
                className={`flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md ${
                  isCurrentMonth 
                    ? "ring-2 ring-green-500 shadow-md transform scale-[1.02]" 
                    : "border-muted"
                }`}
              >
                <div className={`p-3 font-semibold text-center border-b ${
                  isCurrentMonth 
                    ? "bg-green-600 text-white" 
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                  {mes.nome}
                  {isCurrentMonth && <span className="ml-2 text-xs font-normal opacity-90">(Mês Atual)</span>}
                </div>
                
                <CardContent className="flex-1 p-4 flex flex-col gap-3 min-h-[140px]">
                  {vacinasNoMes.length > 0 ? (
                    vacinasNoMes.map((v) => (
                      <div key={v.id} className="flex items-start gap-2 bg-secondary/50 p-2 rounded-md border border-border/50">
                        <Syringe className={`h-4 w-4 mt-0.5 shrink-0 ${v.obrigatoria ? 'text-red-500' : 'text-blue-500'}`} />
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium leading-tight">{v.nome}</span>
                          <div className="flex flex-wrap gap-1">
                            {v.dose_unica && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400">Dose Única</Badge>
                            )}
                            {v.obrigatoria && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400">Obrigatória</Badge>
                            )}
                            {v.apenas_femeas && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400">Apenas Fêmeas</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-60">
                      <Coffee className="h-6 w-6 mb-2 opacity-50" />
                      <span className="text-xs text-center">Nenhum manejo<br/>neste mês</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
