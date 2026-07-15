import { PrismaClient } from "@prisma/client";

// Single PrismaClient across hot reloads in dev and across route handlers in
// prod. Connection pooling itself is handled by the database side (Supabase
// pgbouncer / pooled connection string) — see README → Environment.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
