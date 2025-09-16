import dotenv from 'dotenv';
// Load environment variables first, before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import tourRoutes from './routes/tour';
import travelRoutes from './routes/travel';
import logisticsRoutes from './routes/logistics';
import filesRoutes from './routes/files';
import gamificationRoutes from './routes/gamification';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initializeStorage } from './utils/supabase';
import prisma from './utils/database';
import { initializeIndustries } from './utils/initializeIndustries';
import gamificationService from './services/gamificationService';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://your-production-domain.com',
        /\.onrender\.com$/  // Allow all onrender.com subdomains
      ] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV === 'development' ? '1000' : '100')),
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for development environment
    return process.env.NODE_ENV === 'development';
  }
});

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tour', tourRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/gamification', gamificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, async () => {
  logger.info(`T-Model Platform API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  
  // Initialize default industries
  const industriesInitialized = await initializeIndustries();
  if (industriesInitialized) {
    logger.info('Industries initialization completed successfully');
  } else {
    logger.warn('Failed to initialize industries');
  }
  
  // Initialize default badges
  await gamificationService.initializeBadges();
  logger.info('Badge initialization completed');
  
  // Initialize Supabase storage
  const storageInitialized = await initializeStorage();
  if (storageInitialized) {
    logger.info('Supabase storage initialized successfully');
  } else {
    logger.warn('Failed to initialize Supabase storage');
  }
});

export default app;