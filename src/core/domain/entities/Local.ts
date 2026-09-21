import type { Local as PrismaLocal } from "@prisma/client";

// area_hectares é Decimal no schema, mas o Prisma Client (ver lib/prisma.ts)
// converte para number puro antes do dado sair da camada de acesso a dados.
export type Local = Omit<PrismaLocal, "area_hectares"> & {
  area_hectares: number | null;
};
