import { PrismaClient } from '@prisma/client';

console.log(`[database.ts] DATABASE_URL is ${process.env.DATABASE_URL ? 'LOADED' : 'NOT LOADED'}`);

// Create a single instance of Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.NODE_ENV === 'production' 
        ? process.env.DATABASE_URL?.replace(':6543', ':5432') // Use direct connection in production
        : `${process.env.DATABASE_URL}?pgbouncer=true`,      // Use connection pooling in development
    },
  },
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit();
});

export default prisma;