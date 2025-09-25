import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 if statusCode is not set
  const statusCode = error.statusCode || 500;

  // Log error details with enhanced context
  logger.error('Error occurred:', {
    error: error.message,
    name: error.name,
    stack: error.stack,
    url: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip,
    statusCode,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name === 'PrismaClientInitializationError') {
    logger.error('Database connection error:', error);
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Database connection error'
    });
  }

  // In production, send safe error messages
  const clientMessage = process.env.NODE_ENV === 'production'
    ? statusCode === 500 ? 'Internal Server Error' : error.message
    : error.message;

  res.status(statusCode).json({
    error: clientMessage,
    status: 'error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      detail: error.message
    })
  });
};

export const createError = (statusCode: number, message: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};