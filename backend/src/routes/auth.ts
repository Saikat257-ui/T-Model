import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import prisma from '../utils/database';
import { getIndustriesWithFallback } from '../utils/initializeIndustries';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  industryId: z.string().optional() // Make industry optional during registration
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Register endpoint
router.post('/register', async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      throw createError(400, 'User already exists with this email');
    }

    // Verify industry exists if provided
    let industry: any = null;
    if (validatedData.industryId) {
      industry = await prisma.industry.findUnique({
        where: { id: validatedData.industryId }
      });

      if (!industry) {
        throw createError(400, 'Invalid industry selected');
      }
    }

    // Hash password - lower rounds for development
    const saltRounds = process.env.NODE_ENV === 'development' ? 8 : 12;
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

    // Prepare user data
    const userData: any = {
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone,
    };

    // Only add industryId if provided
    if (validatedData.industryId) {
      userData.industryId = validatedData.industryId;
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
      include: {
        industry: true
      }
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: user.id
      }
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError(500, 'JWT_SECRET not configured');
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email } as any,
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        industry: user.industry || null
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { industry: true }
    });

    if (!user || !user.isActive) {
      throw createError(401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isPasswordValid) {
      throw createError(401, 'Invalid credentials');
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError(500, 'JWT_SECRET not configured');
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email } as any,
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    logger.info(`User logged in: ${user.email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        industry: user.industry
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(400, error.errors[0].message));
    }
    next(error);
  }
});

// Get available industries
router.get('/industries', async (req, res, next) => {
  try {
    const industries = await getIndustriesWithFallback();
    res.json({ industries });
  } catch (error) {
    next(error);
  }
});

export default router;