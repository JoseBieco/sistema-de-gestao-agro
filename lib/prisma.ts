import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma_v2: PrismaClient | undefined;
  pool_v2: Pool | undefined;
};

const pool = globalForPrisma.pool_v2 ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== "production") globalForPrisma.pool_v2 = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma_v2 ??
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma;

export default prisma;
