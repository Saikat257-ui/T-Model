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

function getConnectionUrl(useDirectConnection = false) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    const url = new URL(process.env.DATABASE_URL);
    
    if (useDirectConnection) {
      // Convert pooler URL to direct connection URL
      // From: aws-1-ap-southeast-1.pooler.supabase.com:6543
      // To: db.zqjmkrjatrluvrrllyed.supabase.co:5432
      if (url.hostname.includes('pooler.supabase.com')) {
        url.hostname = 'db.zqjmkrjatrluvrrllyed.supabase.co';
      }
      url.port = '5432';
      url.search = '?sslmode=require';
      logger.info('Using production configuration with direct connection (fallback)');
    } else {
      // Default: use pooler connection
      const separator = url.search ? '&' : '?';
      url.search = url.search.includes('pgbouncer=true') 
        ? url.search 
        : `${url.search}${separator}pgbouncer=true&prepared_statements=false`;
      logger.info('Using production configuration with pooler connection');
    }
    
    return url.toString();
  }

  // Development configuration
  logger.info('Using development configuration');
  return process.env.DATABASE_URL;
}

// Create Prisma client with fallback connection strategy
let prisma: PrismaClient;
let usingDirectConnection = false;

function createPrismaClient(useDirectConnection = false) {
  const client = new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: getConnectionUrl(useDirectConnection)
      }
    }
  });

  // Set up event listeners
  client.$on('error', (e) => {
    logger.error('Prisma Client error:', e);
  });

  client.$on('warn', (e) => {
    logger.warn('Prisma Client warning:', e);
  });

  client.$on('info', (e) => {
    logger.info('Prisma Client info:', e);
  });

  return client;
}

// Start with pooler connection
prisma = createPrismaClient(false);

// Test database connection with fallback strategy
export async function testConnection(retries = MAX_RETRIES): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection test successful');
    return true;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    logger.error('Database connection test failed:', { error: errorMessage });
    
    // If using pooler connection and it fails, try direct connection
    if (!usingDirectConnection && process.env.NODE_ENV === 'production') {
      logger.info('Pooler connection failed, attempting direct connection fallback...');
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
      
      prisma = createPrismaClient(true);
      usingDirectConnection = true;
      
      try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        logger.info('Direct connection fallback successful');
        return true;
      } catch (fallbackError: any) {
        logger.error('Direct connection fallback also failed:', { error: fallbackError?.message });
      }
    }
    
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