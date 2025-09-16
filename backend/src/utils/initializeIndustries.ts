import prisma from './database';
import { logger } from './logger';

// Default industries data
const DEFAULT_INDUSTRIES = [
  {
    id: 'tour-management',
    name: 'Tour Management',
    description: 'Tourism and tour operations management',
    isActive: true
  },
  {
    id: 'travel-services',
    name: 'Travel Services',
    description: 'Travel booking and related services',
    isActive: true
  },
  {
    id: 'logistics-shipping',
    name: 'Logistics & Shipping',
    description: 'Logistics and shipping operations',
    isActive: true
  },
  {
    id: 'other-industries',
    name: 'Other Industries',
    description: 'Other business sectors and industries',
    isActive: true
  }
];

/**
 * Ensures that default industries exist in the database
 * This runs automatically on app startup to prevent empty dropdowns
 */
export const initializeIndustries = async (): Promise<boolean> => {
  try {
    // Check if industries already exist
    const existingCount = await prisma.industry.count();
    
    if (existingCount > 0) {
      logger.info(`Industries already exist (${existingCount} found)`);
      return true;
    }

    // Create default industries
    logger.info('No industries found, creating default industries...');
    
    await prisma.industry.createMany({
      data: DEFAULT_INDUSTRIES,
      skipDuplicates: true // Prevents errors if some already exist
    });

    logger.info(`✅ Successfully created ${DEFAULT_INDUSTRIES.length} default industries`);
    return true;

  } catch (error) {
    logger.error('❌ Failed to initialize industries:', error);
    return false;
  }
};

/**
 * Gets all active industries, ensuring they exist first
 * This provides a fallback if industries are missing
 */
export const getIndustriesWithFallback = async () => {
  try {
    // First ensure industries exist
    await initializeIndustries();
    
    // Then fetch them
    const industries = await prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return industries;
  } catch (error) {
    logger.error('Failed to get industries:', error);
    throw error;
  }
};