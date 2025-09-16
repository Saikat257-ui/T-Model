import React from 'react';

interface LeaderboardEntry {
  id: string;
  userId: string;
  rank: number;
  score: number;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  metadata?: {
    completionRate: number;
    totalPoints: number;
  };
}

interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[];
  title?: string;
  industry?: string;
  period?: string;
  currentUserId?: string;
  maxEntries?: number;
  className?: string;
}

const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  entries = [],
  title = "Leaderboard",
  industry,
  period = "This Month",
  currentUserId,
  maxEntries = 5,
  className = ''
}) => {
  const displayEntries = entries.slice(0, maxEntries);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            1
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-yellow-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            3
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {rank}
          </div>
        );
    }
  };

  const getDisplayName = (user: LeaderboardEntry['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.email.split('@')[0]; // Use email username as fallback
  };

  const getTrophyIcon = (rank: number) => {
    if (rank <= 3) {
      return (
        <svg className={`w-4 h-4 ${
          rank === 1 ? 'text-yellow-500' : 
          rank === 2 ? 'text-gray-400' : 
          'text-amber-600'
        }`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {title}
          </h3>
          <p className="text-sm text-gray-500">
            {industry && `${industry} • `}{period}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Top {maxEntries}</div>
        </div>
      </div>

      {/* Leaderboard entries */}
      <div className="space-y-3">
        {displayEntries.length > 0 ? (
          displayEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                entry.userId === currentUserId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium truncate ${
                    entry.userId === currentUserId ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {getDisplayName(entry.user)}
                  </h4>
                  {getTrophyIcon(entry.rank)}
                  {entry.userId === currentUserId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
                {entry.metadata && (
                  <p className="text-xs text-gray-500">
                    {entry.metadata.completionRate}% complete • {entry.metadata.totalPoints} points
                  </p>
                )}
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-right">
                <div className={`font-semibold ${
                  entry.userId === currentUserId ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {Math.round(entry.score)}
                </div>
                <div className="text-xs text-gray-500">score</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl text-gray-300 mb-2">🏆</div>
            <p className="text-gray-500">No leaderboard data available</p>
          </div>
        )}
      </div>

      {entries.length > maxEntries && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
            View full leaderboard ({entries.length} total)
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaderboardWidget;