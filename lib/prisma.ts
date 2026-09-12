import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma_v3: PrismaClient | undefined;
  pool_v3: Pool | undefined;
};

const pool = globalForPrisma.pool_v3 ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== "production") globalForPrisma.pool_v3 = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma_v3 ??
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v3 = prisma;

export default prisma;
