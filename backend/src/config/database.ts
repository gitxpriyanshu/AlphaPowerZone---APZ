import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
