import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define enums manually until Prisma client is regenerated
export enum BadgeCategory {
  MILESTONE = 'MILESTONE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  COMPLETION = 'COMPLETION',
  REVENUE = 'REVENUE',
  SPECIAL = 'SPECIAL'
}

export enum AchievementType {
  FIRST_ACTION = 'FIRST_ACTION',
  MILESTONE_REACHED = 'MILESTONE_REACHED',
  STREAK_ACHIEVED = 'STREAK_ACHIEVED',
  TARGET_MET = 'TARGET_MET',
  SPECIAL_EVENT = 'SPECIAL_EVENT'
}

export enum LeaderboardPeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

interface ProgressUpdate {
  userId: string;
  industry: string;
  actionType: string;
  metadata?: any;
}

interface BadgeEligibility {
  badgeId: string;
  isEligible: boolean;
  currentProgress?: number;
  requiredProgress?: number;
}

interface BadgeCriteria {
  actionType: string;
  requiredCount: number;
  industry?: string;
  metadata?: any;
}

class GamificationService {
  // Award badges based on user actions and criteria
  async checkAndAwardBadges(userId: string, actionType: string, industry: string, metadata?: any): Promise<string[]> {
    try {
      const awardedBadges: string[] = [];
      
      // Get all active badges for this industry and universal badges
      const availableBadges = await prisma.badge.findMany({
        where: {
          isActive: true,
          OR: [
            { industry: industry },
            { industry: null } // Universal badges
          ]
        }
      });

      // Check each badge's criteria
      for (const badge of availableBadges) {
        const criteria = badge.criteria as unknown as BadgeCriteria;
        
        // Skip if this badge is not for this action type
        if (criteria.actionType !== actionType) continue;

        // Check if user already has this badge
        const existingBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: userId,
              badgeId: badge.id
            }
          }
        });

        if (existingBadge) continue; // User already has this badge

        // Count user's actions of this type
        const actionCount = await this.getUserActionCount(userId, actionType, industry);
        
        // Check if user meets the criteria
        if (actionCount >= criteria.requiredCount) {
          // Award the badge
          await prisma.userBadge.create({
            data: {
              userId: userId,
              badgeId: badge.id
            }
          });

          // Create achievement record
          await prisma.achievement.create({
            data: {
              userId: userId,
              type: 'MILESTONE_REACHED',
              category: industry.toLowerCase(),
              description: `Earned badge: ${badge.name}`,
              points: badge.points,
              metadata: { badgeId: badge.id, actionType, count: actionCount }
            }
          });

          awardedBadges.push(badge.id);
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      return [];
    }
  }

  // Count user's specific actions
  private async getUserActionCount(userId: string, actionType: string, industry: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          tourPackages: true,
          travelBookings: true,
          shipments: true,
        }
      });

      if (!user) return 0;

      switch (actionType) {
        case 'TOUR_CREATED':
          return user.tourPackages.length;
        case 'BOOKING_CREATED':
          return user.travelBookings.length;
        case 'SHIPMENT_CREATED':
          return user.shipments.length;
        case 'PROFILE_COMPLETED':
          return (user.firstName && user.lastName && user.phone) ? 1 : 0;
        default:
          return 0;
      }
    } catch (error) {
      console.error('Error getting user action count:', error);
      return 0;
    }
  }

  // Initialize default badges for each industry
  async initializeBadges(): Promise<void> {
    try {
      const existingBadges = await prisma.badge.count();
      if (existingBadges > 0) return; // Badges already exist

      const defaultBadges = [
        // Tour Management Badges
        {
          name: 'Tour Explorer',
          description: 'Created your first tour package',
          category: 'MILESTONE' as const,
          industry: 'Tour Management',
          criteria: { actionType: 'TOUR_CREATED', requiredCount: 1 },
          points: 100,
          iconUrl: '/icons/tour-explorer.svg'
        },
        {
          name: 'Tour Master',
          description: 'Created 5 tour packages',
          category: 'ACHIEVEMENT' as const,
          industry: 'Tour Management',
          criteria: { actionType: 'TOUR_CREATED', requiredCount: 5 },
          points: 500,
          iconUrl: '/icons/tour-master.svg'
        },
        {
          name: 'Tour Legend',
          description: 'Created 25 tour packages',
          category: 'ACHIEVEMENT' as const,
          industry: 'Tour Management',
          criteria: { actionType: 'TOUR_CREATED', requiredCount: 25 },
          points: 2500,
          iconUrl: '/icons/tour-legend.svg'
        },
        
        // Travel Services Badges
        {
          name: 'Travel Agent',
          description: 'Made your first booking',
          category: 'MILESTONE' as const,
          industry: 'Travel Services',
          criteria: { actionType: 'BOOKING_CREATED', requiredCount: 1 },
          points: 100,
          iconUrl: '/icons/travel-agent.svg'
        },
        {
          name: 'Booking Pro',
          description: 'Made 10 bookings',
          category: 'ACHIEVEMENT' as const,
          industry: 'Travel Services',
          criteria: { actionType: 'BOOKING_CREATED', requiredCount: 10 },
          points: 1000,
          iconUrl: '/icons/booking-pro.svg'
        },
        
        // Logistics Badges
        {
          name: 'Logistics Starter',
          description: 'Created your first shipment',
          category: 'MILESTONE' as const,
          industry: 'Logistics & Shipping',
          criteria: { actionType: 'SHIPMENT_CREATED', requiredCount: 1 },
          points: 100,
          iconUrl: '/icons/logistics-starter.svg'
        },
        {
          name: 'Shipping Expert',
          description: 'Created 20 shipments',
          category: 'ACHIEVEMENT' as const,
          industry: 'Logistics & Shipping',
          criteria: { actionType: 'SHIPMENT_CREATED', requiredCount: 20 },
          points: 2000,
          iconUrl: '/icons/shipping-expert.svg'
        },
        
        // Universal Badges
        {
          name: 'Profile Complete',
          description: 'Completed your profile information',
          category: 'COMPLETION' as const,
          industry: null,
          criteria: { actionType: 'PROFILE_COMPLETED', requiredCount: 1 },
          points: 50,
          iconUrl: '/icons/profile-complete.svg'
        }
      ];

      await prisma.badge.createMany({
        data: defaultBadges,
        skipDuplicates: true
      });

      console.log(`✅ Created ${defaultBadges.length} default badges`);
    } catch (error) {
      console.error('Error initializing badges:', error);
    }
  }

  // Update user progress and check for new badges
  async updateProgress(update: ProgressUpdate): Promise<{achievements: any[], badges: string[]}> {
    try {
      // Update user's progress in the database
      await prisma.userProgress.upsert({
        where: {
          userId: update.userId
        },
        update: {
          totalPoints: { increment: 10 }, // Base points for any action
          updatedAt: new Date()
        },
        create: {
          userId: update.userId,
          totalPoints: 10,
          currentLevel: 1
        }
      });

      // Check and award badges
      const newBadges = await this.checkAndAwardBadges(
        update.userId, 
        update.actionType, 
        update.industry, 
        update.metadata
      );

      // Get recent achievements
      const achievements = await prisma.achievement.findMany({
        where: {
          userId: update.userId,
          achievedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { achievedAt: 'desc' },
        take: 5
      });

      return { achievements, badges: newBadges };
    } catch (error) {
      console.error('Error updating progress:', error);
      return { achievements: [], badges: [] };
    }
  }
  // Calculate user's overall progress based on industry
  async calculateProgress(userId: string, industry: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          tourPackages: true,
          travelBookings: true,
          shipments: true,
        }
      });

      if (!user) return 0;

      let progressPercentage = 0;

      switch (industry.toLowerCase()) {
        case 'tour management':
          progressPercentage = await this.calculateTourProgress(user);
          break;
        case 'travel services':
          progressPercentage = await this.calculateTravelProgress(user);
          break;
        case 'logistics & shipping':
          progressPercentage = await this.calculateLogisticsProgress(user);
          break;
        default:
          progressPercentage = 10; // Basic profile completion
      }

      return progressPercentage;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  }

  private async calculateTourProgress(user: any): Promise<number> {
    let progress = 0;
    
    // Profile completion (15%)
    if (user.firstName && user.lastName && user.phone) progress += 15;
    
    // First package created (30%)
    if (user.tourPackages.length > 0) progress += 30;
    
    // Multiple packages (20%)
    if (user.tourPackages.length >= 3) progress += 20;
    
    // Advanced features unlocked (35%)
    if (user.tourPackages.length >= 5) progress += 35;
    
    return Math.min(progress, 100);
  }

  private async calculateTravelProgress(user: any): Promise<number> {
    let progress = 0;
    
    // Profile completion (20%)
    if (user.firstName && user.lastName && user.phone) progress += 20;
    
    // First booking (35%)
    if (user.travelBookings.length > 0) progress += 35;
    
    // Multiple bookings (45%)
    if (user.travelBookings.length >= 3) progress += 45;
    
    return Math.min(progress, 100);
  }

  private async calculateLogisticsProgress(user: any): Promise<number> {
    let progress = 0;
    
    // Profile completion (20%)
    if (user.firstName && user.lastName && user.phone) progress += 20;
    
    // First shipment (40%)
    if (user.shipments.length > 0) progress += 40;
    
    // Multiple shipments (40%)
    if (user.shipments.length >= 5) progress += 40;
    
    return Math.min(progress, 100);
  }

  // Get user progress
  async getUserProgress(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          industry: true
        }
      });

      if (!user) return null;

      const progress = await this.calculateProgress(userId, user.industry?.name || '');
      
      return {
        userId,
        totalPoints: 0, // Will be implemented after migration
        currentLevel: 1,
        experiencePoints: 0,
        completionRate: progress,
        tourProgress: user.industry?.name === 'Tour Management' ? progress : 0,
        travelProgress: user.industry?.name === 'Travel Services' ? progress : 0,
        logisticsProgress: user.industry?.name === 'Logistics & Shipping' ? progress : 0,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          industry: user.industry
        }
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  // Get user's earned badges from database
  async getUserBadges(userId: string) {
    try {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: true
        },
        orderBy: { earnedAt: 'desc' }
      });

      return userBadges;
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  // Get available badges for user's industry from database
  async getAvailableBadges(industry: string) {
    try {
      const badges = await prisma.badge.findMany({
        where: {
          isActive: true,
          OR: [
            { industry: null }, // Universal badges
            { industry: industry } // Industry-specific badges
          ]
        },
        orderBy: [
          { points: 'asc' },
          { name: 'asc' }
        ]
      });

      return badges;
    } catch (error) {
      console.error('Error getting available badges:', error);
      return [];
    }
  }

  // Mock leaderboard data
  async getLeaderboard(industry: string, period: LeaderboardPeriod, limit: number = 10) {
    const mockData = [
      {
        id: '1',
        userId: 'user1',
        rank: 1,
        score: 950.5,
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        metadata: {
          completionRate: 95,
          totalPoints: 850
        }
      },
      {
        id: '2',
        userId: 'user2',
        rank: 2,
        score: 880.0,
        user: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
        },
        metadata: {
          completionRate: 88,
          totalPoints: 750
        }
      },
      {
        id: '3',
        userId: 'user3',
        rank: 3,
        score: 720.5,
        user: {
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike@example.com'
        },
        metadata: {
          completionRate: 72,
          totalPoints: 600
        }
      }
    ];

    return mockData.slice(0, limit);
  }

  // Process gamification update (main entry point)
  async processProgressUpdate(update: ProgressUpdate): Promise<void> {
    try {
      // For now, just calculate progress
      // Full implementation will come after database migration
      const progress = await this.calculateProgress(update.userId, update.industry);
      console.log(`Progress updated for user ${update.userId}: ${progress}%`);
      
      // TODO: Implement badge checking, achievement recording, leaderboard updates
      // after database migration is complete
    } catch (error) {
      console.error('Error processing progress update:', error);
    }
  }
}

export default new GamificationService();