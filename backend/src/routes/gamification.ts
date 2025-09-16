import express from 'express';
import { authenticateToken } from '../middleware/auth';
import gamificationService, { LeaderboardPeriod } from '../services/gamificationService';

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    industryId: string | null;
  };
}

const router = express.Router();

// Get user's gamification progress
router.get('/progress', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const progress = await gamificationService.getUserProgress(userId);
    
    if (!progress) {
      return res.status(404).json({ error: 'User progress not found' });
    }

    res.json({ 
      success: true, 
      progress 
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ 
      error: 'Failed to get user progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's badges
router.get('/badges', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const badges = await gamificationService.getUserBadges(userId);
    
    res.json({ 
      success: true, 
      badges 
    });
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({ 
      error: 'Failed to get user badges',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available badges for user's industry
router.get('/badges/available', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const industry = req.query.industry as string;
    if (!industry) {
      return res.status(400).json({ error: 'Industry parameter is required' });
    }

    const badges = await gamificationService.getAvailableBadges(industry);
    
    res.json({ 
      success: true, 
      badges 
    });
  } catch (error) {
    console.error('Error getting available badges:', error);
    res.status(500).json({ 
      error: 'Failed to get available badges',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get leaderboard for industry
router.get('/leaderboard', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const industry = req.query.industry as string;
    const period = req.query.period as LeaderboardPeriod || LeaderboardPeriod.MONTHLY;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!industry) {
      return res.status(400).json({ error: 'Industry parameter is required' });
    }

    // Validate period
    if (!Object.values(LeaderboardPeriod).includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Must be WEEKLY, MONTHLY, QUARTERLY, or YEARLY' });
    }

    const leaderboard = await gamificationService.getLeaderboard(industry, period, limit);
    
    res.json({ 
      success: true, 
      leaderboard,
      industry,
      period,
      limit
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ 
      error: 'Failed to get leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user progress (called after user actions)
router.post('/progress/update', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { industry, actionType, metadata } = req.body;

    if (!industry || !actionType) {
      return res.status(400).json({ error: 'Industry and actionType are required' });
    }

    await gamificationService.processProgressUpdate({
      userId,
      industry,
      actionType,
      metadata
    });

    // Get updated progress
    const updatedProgress = await gamificationService.getUserProgress(userId);

    res.json({ 
      success: true, 
      message: 'Progress updated successfully',
      progress: updatedProgress
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ 
      error: 'Failed to update progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's achievements
router.get('/achievements', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Mock achievements for now
    const achievements = [
      {
        id: '1',
        type: 'MILESTONE_REACHED',
        category: 'profile',
        description: 'Profile completed successfully!',
        points: 25,
        achievedAt: new Date(),
        metadata: { completionRate: 100 }
      }
    ];
    
    res.json({ 
      success: true, 
      achievements 
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ 
      error: 'Failed to get achievements',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get gamification stats overview
router.get('/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [progress, badges] = await Promise.all([
      gamificationService.getUserProgress(userId),
      gamificationService.getUserBadges(userId)
    ]);

    const stats = {
      totalPoints: progress?.totalPoints || 0,
      currentLevel: progress?.currentLevel || 1,
      completionRate: progress?.completionRate || 0,
      badgesEarned: badges.length,
      experiencePoints: progress?.experiencePoints || 0
    };

    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error('Error getting gamification stats:', error);
    res.status(500).json({ 
      error: 'Failed to get gamification stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;