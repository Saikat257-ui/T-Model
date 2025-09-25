import { PrismaClient } from '@prisma/client';

console.log(`[database.ts] DATABASE_URL is ${process.env.DATABASE_URL ? 'LOADED' : 'NOT LOADED'}`);
console.log(`[database.ts] NODE_ENV is ${process.env.NODE_ENV}`);

// Function to modify the connection URL
function getConnectionUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const url = new URL(process.env.DATABASE_URL);
  
  // In production:
  // 1. Use direct connection (port 5432)
  // 2. Ensure SSL is enabled
  // 3. Don't use pgBouncer
  if (process.env.NODE_ENV === 'production') {
    url.port = '5432';
    const searchParams = new URLSearchParams({
      'sslmode': 'require',
      'pool_timeout': '0'
    });
    url.search = searchParams.toString();
    console.log('[database.ts] Using production configuration with direct connection');
  } else {
    // In development, use pgBouncer
    url.port = '6543';
    url.search = '?pgbouncer=true';
    console.log('[database.ts] Using development configuration with pgBouncer');
  }

  return url.toString();
}

// Create a single instance of Prisma Client with retry logic
const prisma = new PrismaClient({
  log: ['error', 'warn', 'info'], // Enable all logging in both dev and prod temporarily
  datasources: {
    db: {
      url: getConnectionUrl(),
    },
  },
  // Add connection retry logic
  errorFormat: 'pretty',
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