// Type definitions for gamification responses
export interface Achievement {
  id: string;
  type: string;
  description: string;
  points: number;
  achievedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  iconUrl?: string;
}

export interface GamificationResult {
  achievements?: Achievement[];
  badges?: string[];
}

// Utility function to extract gamification data from API responses
export const extractGamificationData = (response: any): GamificationResult | null => {
  if (response.gamification) {
    return {
      achievements: response.gamification.achievements || [],
      badges: response.gamification.badges || []
    };
  }
  return null;
};

// Utility function to show gamification notifications
export const handleGamificationResponse = (
  response: any, 
  showGamificationCallback?: (result: GamificationResult) => void
) => {
  const gamificationData = extractGamificationData(response);
  if (gamificationData && showGamificationCallback) {
    showGamificationCallback(gamificationData);
  }
  return gamificationData;
};