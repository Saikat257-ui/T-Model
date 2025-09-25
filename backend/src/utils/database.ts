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

    if (isProd) {
      // For Render deployment, use direct connection (port 5432) with SSL
      // This avoids pooler connection issues on Render
      url.port = '5432';
      
      // Clear existing search params and set required ones
      url.search = '';
      url.searchParams.set('sslmode', 'require');
      url.searchParams.set('connect_timeout', '60');
      url.searchParams.set('pool_timeout', '60');
      url.searchParams.set('statement_timeout', '60000');
      
      logger.info('Using production configuration with direct connection');
      return url.toString();
    }

    // Development configuration
    logger.info('Using development configuration');
    return process.env.DATABASE_URL;
  } catch (error) {
    logger.error('Failed to build connection URL:', error);
    throw error;
  }
}

// Create Prisma client with connection pooling settings
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
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection test successful');
    return true;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    logger.error('Database connection test failed:', { error: errorMessage });
    
    if (retries > 0) {
      const delay = RETRY_DELAY + (MAX_RETRIES - retries) * 5000; // Progressive delay
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