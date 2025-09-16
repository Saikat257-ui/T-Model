import { useState, useCallback } from 'react';

interface Achievement {
  id: string;
  type: string;
  description: string;
  points: number;
  achievedAt: string;
}

interface GamificationResult {
  achievements?: Achievement[];
  badges?: string[];
}

export const useGamification = () => {
  const [notification, setNotification] = useState<GamificationResult | null>(null);

  const showGamificationResult = useCallback((result: GamificationResult) => {
    if (result && (result.badges?.length || result.achievements?.length)) {
      setNotification(result);
    }
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showGamificationResult,
    hideNotification
  };
};