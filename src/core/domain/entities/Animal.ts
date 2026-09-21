import type { Animal as PrismaAnimal, Raca as PrismaRaca } from "@prisma/client";
import type { Local } from "./Local";

export type Raca = PrismaRaca;

// O Prisma Client (ver lib/prisma.ts) converte automaticamente os campos
// Decimal do banco para number puro antes de qualquer dado sair da camada
// de acesso a dados — então, apesar do tipo gerado pelo Prisma marcar estes
// campos como Decimal, em tempo de execução eles sempre são number.
type AnimalBase = Omit<PrismaAnimal, "peso_nascimento" | "peso_atual" | "valor_compra"> & {
  peso_nascimento: number | null;
  peso_atual: number | null;
  valor_compra: number | null;
};

export interface Animal extends AnimalBase {
  // Relations (populated only when explicitly included in the query)
  raca?: Raca;
  mae?: Animal | null;
  pai?: Animal | null;
  local?: Local | null;
}
