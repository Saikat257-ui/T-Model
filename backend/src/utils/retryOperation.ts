import { logger } from './logger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export async function retryOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Only retry on connection pool errors
      if (error instanceof PrismaClientKnownRequestError && 
          error.message.includes('connection pool')) {
        const delay = INITIAL_RETRY_DELAY * attempt;
        logger.warn(`${operationName} failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, {
          error: error.message,
          attempt,
          maxRetries
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If we've exhausted all retries
  logger.error(`${operationName} failed after ${maxRetries} attempts`, {
    error: lastError
  });
  throw lastError;
}