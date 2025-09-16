import React from 'react';

interface Badge {
  id: string;
  name: string;
  description: string | null;
  category: string;
  industry: string | null;
  points: number;
  iconUrl?: string | null;
  isActive?: boolean;
}

interface UserBadge {
  id: string;
  badge: Badge;
  earnedAt: Date;
}

interface BadgeDisplayProps {
  earned: UserBadge[];
  available: Badge[];
  maxDisplay?: number;
  showUnlocked?: boolean;
  className?: string;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  earned = [],
  available = [],
  maxDisplay = 6,
  showUnlocked = true,
  className = ''
}) => {
  // Combine earned and available badges, prioritizing earned ones
  const displayBadges = [
    ...earned.map(ub => ({ ...ub.badge, isEarned: true, earnedAt: ub.earnedAt })),
    ...(showUnlocked ? available.filter(badge => 
      !earned.some(eb => eb.badge.id === badge.id)
    ).map(badge => ({ ...badge, isEarned: false })) : [])
  ].slice(0, maxDisplay);

  const getBadgeIcon = (badge: Badge & { isEarned?: boolean }) => {
    // Return appropriate icon based on badge category
    switch (badge.category) {
      case 'MILESTONE':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'ACHIEVEMENT':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'COMPLETION':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'REVENUE':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Badges</h3>
        <span className="text-sm text-gray-500">
          {earned.length} earned
        </span>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {displayBadges.map((badge, index) => (
          <div
            key={badge.id || index}
            className={`relative group flex flex-col items-center p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
              badge.isEarned 
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-sm' 
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            {/* Badge Icon */}
            <div className={`p-2 rounded-full mb-2 transition-colors duration-200 ${
              badge.isEarned 
                ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md' 
                : 'bg-gray-300 text-gray-500'
            }`}>
              {getBadgeIcon(badge)}
            </div>
            
            {/* Badge Name */}
            <h4 className={`text-xs font-medium text-center leading-tight ${
              badge.isEarned ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {badge.name}
            </h4>
            
            {/* Points */}
            <span className={`text-xs mt-1 ${
              badge.isEarned ? 'text-amber-600' : 'text-gray-400'
            }`}>
              {badge.points} pts
            </span>
            
            {/* Earned indicator */}
            {badge.isEarned && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
              {badge.description || badge.name}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        ))}
        
        {/* Show more indicator if there are more badges */}
        {(earned.length + available.length) > maxDisplay && (
          <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
            <div className="text-2xl text-gray-400 mb-1">+</div>
            <span className="text-xs text-gray-500 text-center">
              {(earned.length + available.length) - maxDisplay} more
            </span>
          </div>
        )}
      </div>
      
      {earned.length === 0 && available.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl text-gray-300 mb-2">🏆</div>
          <p className="text-gray-500">No badges available yet</p>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;