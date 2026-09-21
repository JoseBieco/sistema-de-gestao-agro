import type { Transacao as PrismaTransacao } from "@prisma/client";
import type { Parceiro } from "./Parceiro";
import type { Animal } from "./Animal";
import type { Parcela } from "./Parcela";

// valor_total/desconto_carcaca são Decimal no schema, mas o Prisma Client
// (ver lib/prisma.ts) converte para number puro antes do dado sair da
// camada de acesso a dados.
type TransacaoBase = Omit<PrismaTransacao, "valor_total" | "desconto_carcaca"> & {
  valor_total: number;
  desconto_carcaca: number | null;
};

export interface Transacao extends TransacaoBase {
  // Relations (populated only when explicitly included in the query)
  parceiro?: Parceiro | null;
  parcelas?: Parcela[];
  animais?: Animal[];
}
