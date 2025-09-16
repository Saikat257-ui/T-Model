import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { z } from 'zod';
import prisma from '../utils/database';
import gamificationService from '../services/gamificationService';

const router = express.Router();

// Update profile schema
const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  industryId: z.string().optional(),
  avatar: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional()
});

// Get user profile
router.get('/profile', authenticateToken, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        industry: true,
        profile: true
      }
    });

    if (!user) {
      throw createError(404, 'User not found');
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        industry: user.industry,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: any, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    
    // Update user basic info
    const updateData: any = {};
    if (validatedData.firstName) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName) updateData.lastName = validatedData.lastName;
    if (validatedData.phone) updateData.phone = validatedData.phone;
    if (validatedData.industryId) {
      // Verify industry exists
      const industry = await prisma.industry.findUnique({
        where: { id: validatedData.industryId }
      });
      if (!industry) {
        throw createError(400, 'Invalid industry selected');
      }
      updateData.industryId = validatedData.industryId;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { industry: true }
    });

    // Update profile settings
    const profileData: any = {};
    if (validatedData.avatar) profileData.avatar = validatedData.avatar;
    if (validatedData.timezone) profileData.timezone = validatedData.timezone;
    if (validatedData.language) profileData.language = validatedData.language;

    if (Object.keys(profileData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: req.user.id },
        update: profileData,
        create: {
          userId: req.user.id,
          ...profileData
        }
      });
    }

    // Check if profile is now complete and award badge
    let gamificationResult: any = null;
    if (user.firstName && user.lastName && user.phone && user.industryId) {
      gamificationResult = await gamificationService.updateProgress({
        userId: req.user.id,
        industry: user.industry?.name || 'General',
        actionType: 'PROFILE_COMPLETED',
        metadata: { profileComplete: true }
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        industry: user.industry
      },
      gamification: gamificationResult
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(400, error.errors[0].message));
    }
    next(error);
  }
});

export default router;