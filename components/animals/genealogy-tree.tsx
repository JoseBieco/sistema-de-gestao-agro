"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dna, User } from "lucide-react";
import type { Animal } from "@/lib/types/database";

// Definição de tipo recursivo para suportar avós
type AnimalComPais = Animal & {
  mae?: AnimalComPais | null;
  pai?: AnimalComPais | null;
  raca_nome?: string; // Para compatibilidade com a View
  mae_brinco?: string;
  mae_nome?: string;
  pai_brinco?: string;
  pai_nome?: string;
};

interface GenealogyTreeProps {
  animal: AnimalComPais;
  avos: {
    maternos?: { mae?: Animal | null; pai?: Animal | null };
    paternos?: { mae?: Animal | null; pai?: Animal | null };
  };
}

function AnimalNode({
  animal,
  role,
  emptyLabel = "Não informado",
  isRoot = false,
}: {
  animal?: Animal | null | { nome?: string; numero_brinco?: string };
  role: string;
  emptyLabel?: string;
  isRoot?: boolean;
}) {
  if (!animal) {
    return (
      <div className="flex flex-col items-center justify-center p-3 border rounded-lg border-dashed bg-muted/30 h-full min-h-[80px]">
        <span className="text-xs text-muted-foreground font-medium mb-1">
          {role}
        </span>
        <span className="text-xs text-muted-foreground">{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 border rounded-lg h-full min-h-[80px] text-center relative ${
        isRoot
          ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20"
          : "bg-card"
      }`}
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
        {role}
      </span>
      <span className="font-bold text-sm truncate w-full px-1">
        {animal.numero_brinco || "S/ Brinco"}
      </span>
      <span className="text-xs text-muted-foreground truncate w-full px-1">
        {animal.nome || "-"}
      </span>
      {/* Linhas de conexão (apenas visual) */}
      {!isRoot && (
        <div className="absolute -right-3 top-1/2 w-3 h-px bg-border hidden md:block" />
      )}
    </div>
  );
}

export function GenealogyTree({ animal, avos }: GenealogyTreeProps) {
  // Helpers para lidar com dados mistos (View vs Objeto Real)
  const maeDisplay =
    animal.mae ||
    (animal.mae_id
      ? { numero_brinco: animal.mae_brinco, nome: animal.mae_nome }
      : null);
  const paiDisplay =
    animal.pai ||
    (animal.pai_id
      ? { numero_brinco: animal.pai_brinco, nome: animal.pai_nome }
      : null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Dna className="h-5 w-5" />
          Árvore Genealógica Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 overflow-x-auto">
        <div className="min-w-[600px] flex gap-4 md:gap-8 justify-between">
          {/* Coluna 1: Avós (Paternos e Maternos) */}
          <div className="flex flex-col justify-around gap-4 w-1/3">
            <div className="flex flex-col gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100">
              <span className="text-xs text-center text-blue-700 font-medium mb-1">
                Avós Paternos
              </span>
              <AnimalNode animal={avos.paternos?.pai} role="Avô Paterno" />
              <AnimalNode animal={avos.paternos?.mae} role="Avó Paterna" />
            </div>

            <div className="flex flex-col gap-2 p-2 rounded-lg bg-pink-50/50 border border-pink-100">
              <span className="text-xs text-center text-pink-700 font-medium mb-1">
                Avós Maternos
              </span>
              <AnimalNode animal={avos.maternos?.pai} role="Avô Materno" />
              <AnimalNode animal={avos.maternos?.mae} role="Avó Materna" />
            </div>
          </div>

          {/* Coluna 2: Pais */}
          <div className="flex flex-col justify-around gap-4 w-1/3 relative">
            <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-border -ml-4 hidden md:block" />

            <div className="flex flex-col justify-center h-1/2">
              <div className="relative">
                {/* Linhas conectoras */}
                <div className="absolute -left-4 top-1/2 w-4 h-px bg-border hidden md:block" />
                <div className="absolute top-1/2 -right-4 w-4 h-px bg-border hidden md:block" />
                <AnimalNode animal={paiDisplay} role="Pai" />
              </div>
            </div>

            <div className="flex flex-col justify-center h-1/2">
              <div className="relative">
                {/* Linhas conectoras */}
                <div className="absolute -left-4 top-1/2 w-4 h-px bg-border hidden md:block" />
                <div className="absolute top-1/2 -right-4 w-4 h-px bg-border hidden md:block" />
                <AnimalNode animal={maeDisplay} role="Mãe" />
              </div>
            </div>
          </div>

          {/* Coluna 3: Animal (Raiz) */}
          <div className="flex flex-col justify-center w-1/3 relative">
            <div className="absolute left-0 top-1/4 bottom-3/4 w-px bg-border -ml-4 h-1/2 hidden md:block" />
            <div className="relative">
              <div className="absolute -left-4 top-1/2 w-4 h-px bg-border hidden md:block" />
              <AnimalNode animal={animal} role="Animal" isRoot={true} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
