import type { Parcela as PrismaParcela } from "@prisma/client";
import type { Transacao } from "./Transacao";

// valor é Decimal no schema, mas o Prisma Client (ver lib/prisma.ts)
// converte para number puro antes do dado sair da camada de acesso a dados.
type ParcelaBase = Omit<PrismaParcela, "valor"> & { valor: number };

export interface Parcela extends ParcelaBase {
  // Relations (populated only when explicitly included in the query)
  transacao?: Transacao;
}
