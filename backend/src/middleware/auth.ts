import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import prisma from '../utils/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    industryId: string | null;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify user still exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true
      },
      include: {
        industry: true
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid token or user not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      industryId: user.industryId
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireIndustry = (allowedIndustries: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await prisma.user.findFirst({
        where: { id: req.user.id },
        include: { industry: true }
      });

      if (!user || !user.industry || !allowedIndustries.includes(user.industry.name)) {
        res.status(403).json({ 
          error: 'Access denied for your industry type',
          requiredIndustries: allowedIndustries
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Industry authorization error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};