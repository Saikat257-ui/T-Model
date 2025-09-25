// import { PrismaClient } from '@prisma/client';
// import { logger } from './logger';

// // Connection configuration
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 5000; // 5 seconds

// function parseConnectionUrl() {
//   if (!process.env.DATABASE_URL) {
//     throw new Error('DATABASE_URL environment variable is not set');
//   }

//   try {
//     // Get the base URL without any query parameters
//     const baseUrl = process.env.DATABASE_URL.split('?')[0];
    
//     // Extract host and port information
//     const url = new URL(baseUrl);
//     const isProd = process.env.NODE_ENV === 'production';

//     // For production, we need to:
//     // 1. Use the direct connection (port 5432)
//     // 2. Enable SSL
//     // 3. Set appropriate timeouts
//     if (isProd) {
//       // Replace the port in the hostname
//       const hostParts = url.host.split(':');
//       const host = hostParts[0];
      
//       // Reconstruct the URL with direct port and explicit SSL configuration
//       return {
//         url: `${url.protocol}//${url.username}:${url.password}@${host}:5432${url.pathname}?schema=public&sslmode=require&connect_timeout=60`,
//         direct: true
//       };
//     }

//     // Development configuration uses connection pooling
//     return {
//       url: `${baseUrl}?pgbouncer=true`,
//       direct: false
//     };
//   } catch (error) {
//     logger.error('Failed to parse DATABASE_URL:', error);
//     throw error;
//   }
// }

// function buildConnectionUrl() {
//   if (!process.env.DATABASE_URL) {
//     throw new Error('DATABASE_URL environment variable is not set');
//   }

//   try {
//     const baseUrl = process.env.DATABASE_URL;
//     const parsed = parseConnectionUrl(baseUrl);

//     // Always use direct connection in production
//     if (process.env.NODE_ENV === 'production') {
//       const url = new URL(baseUrl);
//       url.port = '5432'; // Direct connection port
      
//       // Add required SSL and connection parameters with increased timeouts
//       const params = new URLSearchParams({
//         'sslmode': 'require',
//         'connection_limit': '5',
//         'pool_timeout': '60',
//         'connect_timeout': '60',
//         'max_retries': '3',
//         'retry_interval': '5'
//       });
      
//       url.search = params.toString();
//       logger.info('Using production database configuration with SSL and optimized connection pooling');
//       return url.toString();
//     }

//     // Development configuration
//     logger.info('Using development database configuration');
//     return `${baseUrl}?pgbouncer=true`;
//   } catch (error) {
//     logger.error('Error building database connection URL:', error);
//     throw error;
//   }
// }

// // Create Prisma client with robust configuration and logging
// const prisma = new PrismaClient({
//   log: [
//     { level: 'warn', emit: 'event' },
//     { level: 'info', emit: 'event' },
//     { level: 'error', emit: 'event' },
//   ],
//   errorFormat: 'pretty',
//   datasources: {
//     db: {
//       url: buildConnectionUrl(),
//     },
//   }
// });

// // Log all database events
// prisma.$on('error', (e) => {
//   logger.error('Prisma Client error:', e);
// });

// prisma.$on('warn', (e) => {
//   logger.warn('Prisma Client warning:', e);
// });

// prisma.$on('info', (e) => {
//   logger.info('Prisma Client info:', e);
// });

// // Test database connection with retries
// export async function testConnection(retries = MAX_RETRIES): Promise<boolean> {
//   try {
//     await prisma.$connect();
//     await prisma.$queryRaw`SELECT 1`;
//     logger.info('Database connection test successful');
//     return true;
//   } catch (error) {
//     logger.error('Database connection test failed:', error);
    
//     if (retries > 0) {
//       logger.info(`Retrying connection in ${RETRY_DELAY/1000} seconds... (${retries} attempts remaining)`);
//       await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
//       return testConnection(retries - 1);
//     }
    
//     return false;
//   }
// }

// // Handle graceful shutdown
// process.on('SIGINT', async () => {
//   await prisma.$disconnect();
//   process.exit();
// });

// process.on('SIGTERM', async () => {
//   await prisma.$disconnect();
//   process.exit();
// });

// export default prisma;








import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Connection configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

function getConnectionUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    const url = new URL(process.env.DATABASE_URL);
    const isProd = process.env.NODE_ENV === 'production';

    // For production with Supabase, we need to:
    // 1. Use pooler connection (port 6543)
    // 2. Enable SSL and set proper connection parameters
    if (isProd) {
      // Ensure we're using the pooler port
      url.port = '6543';
      
      // Set required SSL and connection parameters for Supabase
      url.searchParams.set('sslmode', 'require');
      url.searchParams.set('schema', 'public');
      url.searchParams.set('pgbouncer', 'true');
      url.searchParams.set('connection_limit', '5');
      url.searchParams.set('pool_timeout', '20');
      url.searchParams.set('connect_timeout', '10');
      
      logger.info('Using production configuration with connection pooling');
      return url.toString();
    }

    // Development configuration uses direct connection
    logger.info('Using development configuration with direct connection');
    url.searchParams.delete('pgbouncer');
    return url.toString();
  } catch (error) {
    logger.error('Failed to build connection URL:', error);
    throw error;
  }
}

// Create Prisma client
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
    await prisma.$disconnect(); // Ensure we start fresh
    await prisma.$connect();
    await prisma.$executeRaw`SELECT 1`; // Use executeRaw for better error handling
    logger.info('Database connection test successful');
    return true;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    logger.error('Database connection test failed:', { error: errorMessage, code: error?.code });
    
    // Specific handling for common errors
    if (error?.message?.includes('timeout')) {
      logger.warn('Connection timeout detected - this might be due to high load or network issues');
    }
    
    if (retries > 0) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1); // Exponential backoff
      logger.info(`Retrying connection in ${delay/1000} seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return testConnection(retries - 1);
    }
    
    logger.error('All connection attempts failed');
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