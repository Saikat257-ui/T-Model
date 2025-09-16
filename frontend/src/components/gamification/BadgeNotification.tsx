import React, { useState, useEffect } from 'react';
import ConfettiAnimation from './ConfettiAnimation';
import DefaultBadgeIcon from './DefaultBadgeIcon';

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  points: number;
}

interface Achievement {
  id: string;
  type: string;
  description: string;
  points: number;
  achievedAt: string;
}

interface BadgeNotificationProps {
  badges?: string[];
  achievements?: Achievement[];
  onClose?: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badges = [],
  achievements = [],
  onClose
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [badgeDetails, setBadgeDetails] = useState<Badge[]>([]);

  useEffect(() => {
    if (badges.length > 0 || achievements.length > 0) {
      setShowNotification(true);
      
      // Fetch badge details if we have new badges
      if (badges.length > 0) {
        fetchBadgeDetails();
      }

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges, achievements]);

  const fetchBadgeDetails = async () => {
    try {
      const response = await fetch('/api/gamification/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ badgeIds: badges })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBadgeDetails(data.badges || []);
      }
    } catch (error) {
      console.error('Error fetching badge details:', error);
    }
  };

  const handleClose = () => {
    setShowNotification(false);
    if (onClose) {
      onClose();
    }
  };

  if (!showNotification) return null;

  const hasNewContent = badges.length > 0 || achievements.length > 0;

  return (
    <>
      {hasNewContent && <ConfettiAnimation isActive={true} />}
      
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-400 overflow-hidden animate-slide-in-right">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">
                🎉 Congratulations!
              </h3>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* New Badges */}
            {badgeDetails.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  {badge.iconUrl ? (
                    <img 
                      src={badge.iconUrl} 
                      alt={badge.name}
                      className="w-8 h-8"
                    />
                  ) : (
                    <DefaultBadgeIcon category="ACHIEVEMENT" className="w-8 h-8 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{badge.name}</h4>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                  <p className="text-xs text-yellow-600 font-medium">+{badge.points} points</p>
                </div>
              </div>
            ))}

            {/* New Achievements */}
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{achievement.type}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-blue-600 font-medium">+{achievement.points} points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};