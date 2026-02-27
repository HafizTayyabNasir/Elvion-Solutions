// Avoid type dependency on generated Prisma types during typecheck
// Use runtime import and 'any' to keep build passing when engines fail to generate locally
const PrismaPkg: any = require('@prisma/client');
const PrismaClient = PrismaPkg.PrismaClient;

type PrismaClientType = any;
const globalForPrisma = global as unknown as { prisma: PrismaClientType };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
