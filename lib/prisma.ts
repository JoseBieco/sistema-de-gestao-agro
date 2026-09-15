import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

/**
 * Converte recursivamente qualquer Prisma.Decimal (usado nos campos
 * monetários/de peso/quantidade do schema — ver prisma/schema.prisma) para
 * number puro, antes do resultado sair da camada de acesso a dados.
 *
 * Isso evita que um valor Decimal (um objeto especial do decimal.js, não um
 * number comum) vaze para o resto do app: operadores aritméticos (+ - * /),
 * `.toFixed()` e a serialização de Server Component -> Client Component do
 * Next.js não lidam corretamente com esse tipo. Convertendo uma única vez
 * aqui, o resto do código continua trabalhando com number como sempre
 * trabalhou — só o armazenamento no Postgres passa a ser exato (numeric),
 * em vez de ponto flutuante (float8).
 */
function convertDecimals<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (value instanceof Prisma.Decimal) {
    return value.toNumber() as unknown as T;
  }
  if (value instanceof Date) return value;
  if (Array.isArray(value)) {
    return value.map((item) => convertDecimals(item)) as unknown as T;
  }
  if (typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      (value as Record<string, unknown>)[key] = convertDecimals(
        (value as Record<string, unknown>)[key]
      );
    }
    return value;
  }
  return value;
}

function createPrismaClient() {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const result = await query(args);
          return convertDecimals(result);
        },
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma_v3: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma_v3 ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v3 = prisma;

export default prisma;
