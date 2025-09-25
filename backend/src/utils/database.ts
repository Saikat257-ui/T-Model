import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Connection configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

function getConnectionUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    // Render PostgreSQL configuration
    const url = process.env.DATABASE_URL;
    logger.info('Using Render PostgreSQL database');
    return url;
  }

  // Development configuration
  logger.info('Using development configuration');
  return process.env.DATABASE_URL;
}

// Create Prisma client with direct connection
const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: getConnectionUrl()
    }
  }
});

// Set up event listeners
prisma.$on('error', (e) => {
  logger.error('Prisma Client error:', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Client warning:', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma Client info:', e);
});

// Test database connection
export async function testConnection(retries = MAX_RETRIES): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection test successful');
    return true;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    logger.error('Database connection test failed:', { error: errorMessage });
    
    if (retries > 0) {
      const delay = RETRY_DELAY + (MAX_RETRIES - retries) * 2000;
      logger.info(`Retrying connection in ${delay/1000} seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return testConnection(retries - 1);
    }
    
    logger.error('All connection attempts failed');
    logger.error('[SERVER STARTUP] Failed to establish database connection after multiple retries');
    logger.error('[SERVER STARTUP] Server will continue running but database operations will fail');
    return false;
  }
}

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