"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReproductionFormDialog } from "./reproduction-form-dialog";
import { Plus, Heart, Baby, CalendarClock, Edit } from "lucide-react"; // Import Edit
import { formatDate } from "@/lib/utils/format";
import { differenceInDays, parseISO } from "date-fns";
import type { Animal, CicloReprodutivo } from "@/lib/types/database";

interface ReproductionPageClientProps {
  ciclos: CicloReprodutivo[];
  femeas: Animal[];
  touros: Animal[];
}

export function ReproductionPageClient({
  ciclos: initialCiclos,
  femeas,
  touros,
}: ReproductionPageClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [ciclos, setCiclos] = useState(initialCiclos);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Novo estado para controlar quem está sendo editado
  const [selectedCiclo, setSelectedCiclo] = useState<CicloReprodutivo | null>(
    null
  );

  useEffect(() => {
    setCiclos(initialCiclos);
  }, [initialCiclos]);

  async function refreshData() {
    const { data } = await supabase
      .from("ciclos_reprodutivos")
      .select(
        `
        *,
        animal:animais!animal_id(id, nome, numero_brinco)
      `
      )
      .eq("ativo", true)
      .order("data_prevista_cio", { ascending: true });

    if (data) {
      setCiclos(data);
    }
    router.refresh();
  }

  // Função para abrir modal de CRIAÇÃO
  function handleNew() {
    setSelectedCiclo(null); // Limpa seleção anterior
    setDialogOpen(true);
  }

  // Função para abrir modal de EDIÇÃO
  function handleEdit(ciclo: CicloReprodutivo) {
    setSelectedCiclo(ciclo);
    setDialogOpen(true);
  }

  const prenhas = ciclos.filter(
    (c) => c.status === "prenha" || c.status === "aguardando_diagnostico"
  );
  const vazias = ciclos.filter(
    (c) => c.status === "vazia" || c.status === "lactacao"
  );

  function getDaysToDate(dateStr?: string) {
    if (!dateStr) return null;
    return differenceInDays(parseISO(dateStr), new Date());
  }

  function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
      prenha: "bg-emerald-100 text-emerald-800 border-emerald-200",
      vazia: "bg-slate-100 text-slate-800 border-slate-200",
      aguardando_diagnostico: "bg-amber-100 text-amber-800 border-amber-200",
      lactacao: "bg-blue-100 text-blue-800 border-blue-200",
    };
    const labels: Record<string, string> = {
      prenha: "Prenha",
      vazia: "Vazia / Aberta",
      aguardando_diagnostico: "Aguard. Diagnóstico",
      lactacao: "Em Lactação",
    };
    return (
      <Badge className={styles[status] || ""} variant="outline">
        {labels[status] || status}
      </Badge>
    );
  }

  // Componente de Card Reutilizável para evitar repetição
  const CicloCard = ({
    ciclo,
    diasRestantes,
    tipo,
  }: {
    ciclo: CicloReprodutivo;
    diasRestantes: number | null;
    tipo: "parto" | "cio";
  }) => {
    const isPerto =
      tipo === "cio" &&
      diasRestantes !== null &&
      diasRestantes <= 3 &&
      diasRestantes >= -1;

    return (
      <Card
        className={`border-l-4 ${
          tipo === "parto"
            ? "border-l-emerald-500"
            : isPerto
            ? "border-l-amber-500"
            : "border-l-slate-300"
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {ciclo.animal?.numero_brinco} - {ciclo.animal?.nome}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleEdit(ciclo)}
              >
                <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
              <StatusBadge status={ciclo.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {tipo === "parto" ? (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Coberta em: {formatDate(ciclo.data_cobertura!)}</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <Baby className="h-4 w-4 text-primary" />
                  <span>Previsão de Parto</span>
                </div>
                <p className="text-2xl font-bold pl-6">
                  {formatDate(ciclo.data_prevista_parto!)}
                </p>
                <p className="text-xs text-muted-foreground pl-6">
                  Faltam ~{diasRestantes} dias
                </p>
              </div>
            </>
          ) : (
            <>
              {ciclo.data_ultimo_parto && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Baby className="h-4 w-4" />
                  <span>
                    Último parto: {formatDate(ciclo.data_ultimo_parto)}
                  </span>
                </div>
              )}
              <div
                className={`p-3 rounded-lg space-y-1 ${
                  isPerto ? "bg-amber-50" : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <CalendarClock
                    className={`h-4 w-4 ${
                      isPerto ? "text-amber-600" : "text-slate-500"
                    }`}
                  />
                  <span>Estimativa de Cio</span>
                </div>
                <p
                  className={`text-2xl font-bold pl-6 ${
                    isPerto ? "text-amber-700" : ""
                  }`}
                >
                  {ciclo.data_prevista_cio
                    ? formatDate(ciclo.data_prevista_cio)
                    : "Não calculado"}
                </p>
                {diasRestantes !== null && (
                  <p className="text-xs text-muted-foreground pl-6">
                    {diasRestantes === 0
                      ? "HOJE!"
                      : diasRestantes > 0
                      ? `Em ${diasRestantes} dias`
                      : `Passou há ${Math.abs(diasRestantes)} dias`}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Gestão Reprodutiva
          </h2>
          <p className="text-muted-foreground">
            Acompanhe prenhes, cios e previsões de parto.
          </p>
        </div>
        <Button onClick={handleNew}>
          {" "}
          {/* Atualizado para handleNew */}
          <Plus className="mr-2 h-4 w-4" />
          Novo Ciclo
        </Button>
      </div>

      <Tabs defaultValue="prenhas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="prenhas">
            Gestantes ({prenhas.length})
          </TabsTrigger>
          <TabsTrigger value="vazias">Em Ciclo ({vazias.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="prenhas" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prenhas.map((ciclo) => (
              <CicloCard
                key={ciclo.id}
                ciclo={ciclo}
                diasRestantes={getDaysToDate(ciclo.data_prevista_parto)}
                tipo="parto"
              />
            ))}
            {prenhas.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                Nenhuma vaca gestante.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vazias" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vazias.map((ciclo) => (
              <CicloCard
                key={ciclo.id}
                ciclo={ciclo}
                diasRestantes={getDaysToDate(ciclo.data_prevista_cio)}
                tipo="cio"
              />
            ))}
            {vazias.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                Nenhum animal em ciclo.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ReproductionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshData}
        femeas={femeas}
        touros={touros}
        cicloToEdit={selectedCiclo} // Passa o ciclo selecionado
      />
    </div>
  );
}
