
import { PrismaClient } from '@prisma/client';

async function testDatabaseConnection() {
  console.log('Attempting to connect to the database...');
  console.log(`DATABASE_URL from env: ${process.env.DATABASE_URL ? 'Loaded' : 'NOT LOADED'}`);

  if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  // It's good practice to not log the full URL in production,
  // but for this specific debugging purpose, we'll log parts of it.
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`Connecting to host: ${url.hostname}`);
    console.log(`Connecting to port: ${url.port}`);
    console.log(`Connecting with user: ${url.username}`);
    console.log(`Connecting to database: ${url.pathname}`);
    console.log(`Connection parameters: ${url.search}`);
  } catch (e) {
    console.error('Could not parse the DATABASE_URL. Please ensure it is a valid URL.');
    process.exit(1);
  }


  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Prisma client initialized. Sending a test query...');
    const result = await prisma.$queryRaw`SELECT 1 + 1 AS result;`;
    console.log('Database query successful!');
    console.log('Query result:', result);
    console.log('✅ Database connection is working correctly!');
  } catch (error) {
    console.error('❌ Failed to connect to the database or execute query.');
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

testDatabaseConnection();
