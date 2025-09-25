import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Connection configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

function parseConnectionUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port,
      database: parsedUrl.pathname.replace('/', ''),
      username: parsedUrl.username,
      ssl: true
    };
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', error);
    throw error;
  }
}

function buildConnectionUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    const baseUrl = process.env.DATABASE_URL;
    const parsed = parseConnectionUrl(baseUrl);

    // Always use direct connection in production
    if (process.env.NODE_ENV === 'production') {
      const url = new URL(baseUrl);
      url.port = '5432'; // Direct connection port
      
      // Add required SSL and connection parameters with increased timeouts
      const params = new URLSearchParams({
        'sslmode': 'require',
        'connection_limit': '5',
        'pool_timeout': '60',
        'connect_timeout': '60',
        'max_retries': '3',
        'retry_interval': '5'
      });
      
      url.search = params.toString();
      logger.info('Using production database configuration with SSL and optimized connection pooling');
      return url.toString();
    }

    // Development configuration
    logger.info('Using development database configuration');
    return `${baseUrl}?pgbouncer=true`;
  } catch (error) {
    logger.error('Error building database connection URL:', error);
    throw error;
  }
}

// Create Prisma client with robust configuration and logging
const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: buildConnectionUrl(),
    },
  }
});

// Log all database events
prisma.$on('error', (e) => {
  logger.error('Prisma Client error:', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Client warning:', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma Client info:', e);
});

// Test database connection with retries
export async function testConnection(retries = MAX_RETRIES): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    
    if (retries > 0) {
      logger.info(`Retrying connection in ${RETRY_DELAY/1000} seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return testConnection(retries - 1);
    }
    
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