import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, ArrowDown, Dna } from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Link from "next/link";

// Tipagem Forte e Exportada
export interface FamilyMember {
  id: string;
  numero_brinco: string;
  nome: string | null;
  genero?: string; // Opcional, útil para cores se disponível
}

interface GenealogyTreeProps {
  animal: FamilyMember;
  pai: FamilyMember | null;
  mae: FamilyMember | null;
  filhos: FamilyMember[];
}

export function GenealogyTree({
  animal,
  pai,
  mae,
  filhos,
}: GenealogyTreeProps) {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Dna className="h-5 w-5" />
          Árvore Genealógica Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex min-w-max items-center justify-center p-8">
            {/* --- COLUNA 1: PAIS (Esquerda) --- */}
            <div className="flex flex-col justify-center gap-6">
              <div className="relative flex items-center">
                <FamilyCard member={pai} role="Pai" />
                {/* Linha saindo do Pai */}
                <div className="absolute -right-8 top-1/2 h-px w-8 bg-border" />
                {/* Conector vertical superior (metade) */}
                <div className="absolute -right-8 top-1/2 h-[calc(50%+12px)] w-px bg-border translate-y-1/2" />
              </div>

              <div className="relative flex items-center">
                <FamilyCard member={mae} role="Mãe" />
                {/* Linha saindo da Mãe */}
                <div className="absolute -right-8 top-1/2 h-px w-8 bg-border" />
                {/* Conector vertical inferior (metade) - Ajuste para conectar com o de cima */}
                <div className="absolute -right-8 bottom-1/2 h-[calc(50%+12px)] w-px bg-border -translate-y-1/2" />
              </div>
            </div>

            {/* --- CONEXÃO PAIS -> ANIMAL --- */}
            {/* O conector vertical dos pais se junta aqui em uma única linha horizontal */}
            <div className="flex w-16 items-center justify-center">
              <div className="h-px w-full bg-border" />
            </div>

            {/* --- COLUNA 2: ANIMAL (Centro) --- */}
            <div className="relative z-10 mx-2">
              <div className="rounded-xl border-2 border-primary bg-primary/5 p-1 shadow-lg ring-4 ring-background">
                <div className="flex w-48 flex-col items-center gap-2 rounded-lg bg-background p-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="w-full overflow-hidden">
                    <p
                      className="truncate text-sm font-bold text-primary"
                      title={animal.numero_brinco}
                    >
                      {animal.numero_brinco}
                    </p>
                    <p
                      className="truncate text-lg font-bold"
                      title={animal.nome || ""}
                    >
                      {animal.nome || "Sem Nome"}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1 w-full justify-center"
                    >
                      Selecionado
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* --- CONEXÃO ANIMAL -> FILHOS --- */}
            {filhos.length > 0 ? (
              <>
                <div className="flex w-16 items-center justify-center">
                  <div className="h-px w-full bg-border" />
                </div>

                {/* --- COLUNA 3: FILHOS (Direita) --- */}
                <div className="relative flex flex-col justify-center gap-3">
                  {/* Linha vertical que conecta todos os filhos */}
                  {filhos.length > 1 && (
                    <div
                      className="absolute -left-8 top-6 bottom-6 w-px bg-border"
                      // top-6 e bottom-6 compensam a metade da altura do primeiro e último card para a linha não sobrar
                    />
                  )}

                  {filhos.map((filho) => (
                    <div key={filho.id} className="relative flex items-center">
                      {/* Linha horizontal entrando no filho */}
                      <div className="absolute -left-8 top-1/2 h-px w-8 bg-border" />
                      <FamilyCard member={filho} role="Filho(a)" small />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Espaço vazio para balancear se não tiver filhos
              <div className="w-16 opacity-0" />
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Sub-componente para os Cards (Melhora organização e reutilização)
function FamilyCard({
  member,
  role,
  small = false,
}: {
  member: FamilyMember | null;
  role: string;
  small?: boolean;
}) {
  const commonClasses = `group relative flex items-center gap-3 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 ${
    small ? "h-20 w-40 p-3" : "h-24 w-48 p-4"
  }`;

  // Se não existir membro (Ex: pai desconhecido), renderiza apenas a div estática
  if (!member) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border border-dashed bg-background/50 text-center text-muted-foreground ${
          small ? "h-20 w-40" : "h-24 w-48"
        }`}
      >
        <span className="text-[10px] font-bold uppercase text-muted-foreground/50">
          {role}
        </span>
        <span className="text-xs">Não informado</span>
      </div>
    );
  }

  // Se existir, envolve em Link para navegação
  return (
    <Link
      href={`/animais/${member.id}`}
      className={commonClasses}
      title={`Ver detalhes de ${member.numero_brinco}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <User className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary/70">
          {role}
        </span>
        <p className="truncate font-mono font-bold text-sm group-hover:text-primary">
          {member.numero_brinco}
        </p>
        <p
          className="truncate text-xs text-muted-foreground"
          title={member.nome || ""}
        >
          {member.nome || "-"}
        </p>
      </div>
    </Link>
  );
}
