import React, { useEffect, useState } from 'react';
import Layout from '../shared/Layout';
import { travelAPI } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserProgress, fetchUserBadges, fetchAvailableBadges, fetchLeaderboard } from '../../store/slices/gamificationSlice';
import ProgressRing from '../gamification/ProgressRing';
import BadgeDisplay from '../gamification/BadgeDisplay';
import LeaderboardWidget from '../gamification/LeaderboardWidget';

const TravelDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userProgress, userBadges, availableBadges, leaderboard, isLoading } = useAppSelector((state: any) => state.gamification);
  const { isAuthenticated, token } = useAppSelector((state: any) => state.auth);
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [documents, setDocuments] = useState<any[]>([]);

  // Debug logging
  console.log('TravelDashboard render:', {
    isAuthenticated,
    hasToken: !!token,
    availableBadgesCount: availableBadges?.length || 0,
    userBadgesCount: userBadges?.length || 0,
    gamificationLoading: isLoading
  });

  useEffect(() => {
    const fetchData = async () => {
      // Skip if user is not authenticated
      if (!isAuthenticated || !token) {
        console.log('TravelDashboard: User not authenticated, skipping data fetch');
        return;
      }

      try {
        console.log('TravelDashboard: User authenticated, starting data fetch...');
        
        // Fetch gamification data first
        console.log('TravelDashboard: Fetching gamification data...');
        await dispatch(fetchUserProgress()).unwrap();
        await dispatch(fetchUserBadges()).unwrap(); 
        await dispatch(fetchAvailableBadges('travel')).unwrap();
        await dispatch(fetchLeaderboard({ industry: 'travel', period: 'WEEKLY' })).unwrap();
        console.log('TravelDashboard: Gamification data fetch completed');

        // Try to fetch other data, but don't let it fail the whole component
        try {
          const [analyticsData, bookingsData, documentsData] = await Promise.all([
            travelAPI.getAnalytics().catch(err => {
              console.warn('TravelDashboard: Analytics API failed (non-critical):', err.message);
              return { analytics: null };
            }),
            travelAPI.getBookings().catch(err => {
              console.warn('TravelDashboard: Bookings API failed (non-critical):', err.message);
              return { bookings: [] };
            }),
            travelAPI.getDocuments().catch(err => {
              console.warn('TravelDashboard: Documents API failed (non-critical):', err.message);
              return { documents: [] };
            })
          ]);
          
          setAnalytics(analyticsData.analytics);
          setBookings((bookingsData.bookings || []).slice(0, 5));
          setDocuments((documentsData.documents || []).slice(0, 5));
          console.log('TravelDashboard: All data loaded successfully');
        } catch (error) {
          console.warn('TravelDashboard: Some API calls failed, but gamification should work');
        }
        
      } catch (error) {
        console.error('Error fetching travel data:', error);
      }
    };

    fetchData();
  }, [dispatch, isAuthenticated, token]);

  return (
    <Layout>
      <div className="bg-[#F8FCF9] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Travel Management Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage bookings, documents, and travel experiences</p>
          </div>
          
          {/* Gamification Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Progress Ring */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Progress</h3>
              <div className="flex flex-col items-center space-y-4">
                <ProgressRing
                  progress={userProgress?.completionRate || 0}
                  size={120}
                  label={`Level ${userProgress?.currentLevel || 1}`}
                  color="#3B82F6"
                />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userProgress?.totalPoints || 0}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
              </div>
            </div>

            {/* Badge Display */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Travel Achievements
                {isLoading && <span className="text-sm text-blue-500 ml-2">(Loading...)</span>}
              </h3>
              <div className="text-xs text-gray-500 mb-2">
                Debug: {availableBadges?.length || 0} available badges | {userBadges?.length || 0} earned badges
              </div>
              {!isAuthenticated ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="mb-2">🔐</div>
                  <div>Please log in to view your achievements</div>
                </div>
              ) : isLoading ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="mb-2">⏳</div>
                  <div>Loading your achievements...</div>
                </div>
              ) : (
                <BadgeDisplay
                  earned={userBadges || []}
                  available={availableBadges || []}
                  maxDisplay={4}
                  showUnlocked={true}
                />
              )}
            </div>

            {/* Leaderboard Widget */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <LeaderboardWidget
                entries={leaderboard || []}
                title="Weekly Travel Leaders"
                industry="travel"
                period="WEEKLY"
                maxEntries={5}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-xl flex flex-row items-center min-h-[150px] px-8 py-6">
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="text-[#2D3748] font-semibold text-base mb-1">Total Bookings</div>
                <div className="text-3xl font-bold mb-1">{analytics?.totalBookings || 0}</div>
                <div className="text-green-600 text-base font-medium">+0% this month</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="2" /><line x1="9" y1="12" x2="15" y2="12" strokeWidth="2" stroke="currentColor" /></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl flex flex-row items-center min-h-[150px] px-8 py-6">
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="text-[#2D3748] font-semibold text-base mb-1">Total Spent</div>
                <div className="text-3xl font-bold mb-1">${analytics?.totalSpent || 0}</div>
                <div className="text-green-600 text-base font-medium">+0% this month</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-green-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="2" /><path d="M12 8v4h2" strokeWidth="2" stroke="currentColor" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#22C55E">$</text></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl flex flex-row items-center min-h-[150px] px-8 py-6">
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="text-[#2D3748] font-semibold text-base mb-1">Documents</div>
                <div className="text-3xl font-bold mb-1">{documents.length}</div>
                <div className="text-green-600 text-base font-medium">+0% this month</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="8" width="12" height="8" rx="2" /><path d="M9 12h6" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow px-8 py-8 flex flex-col min-h-[270px]">
              <div className="font-semibold text-xl text-[#222] mb-6">Recent Bookings</div>
              <div className="flex flex-col items-center justify-center flex-1 bg-[#F8FAFC] rounded-xl py-10 shadow-inner">
                <div className="mb-4">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="12" y="16" width="40" height="32" rx="6" fill="#E5F6F0"/>
                    <rect x="20" y="24" width="24" height="3" rx="1.5" fill="#2563EB"/>
                    <rect x="20" y="31" width="16" height="3" rx="1.5" fill="#2563EB"/>
                    <rect x="20" y="38" width="12" height="3" rx="1.5" fill="#2563EB"/>
                    <circle cx="44" cy="44" r="8" fill="#A7F3D0"/>
                    <circle cx="44" cy="44" r="5" stroke="#2563EB" strokeWidth="2" fill="none"/>
                    <line x1="48" y1="48" x2="53" y2="53" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="font-bold text-xl mb-1 text-[#222]">No bookings yet</div>
                <div className="text-gray-500 text-base text-center">Bookings will appear here once you start booking</div>
              </div>
            </div>
            {/* Travel Documents */}
            <div className="bg-white rounded-2xl shadow px-8 py-8 flex flex-col min-h-[270px]">
              <div className="font-semibold text-xl text-[#222] mb-6">Travel Documents</div>
              <div className="flex flex-col items-center justify-center flex-1 bg-[#F8FAFC] rounded-xl py-10 shadow-inner">
                <div className="mb-4">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="12" y="16" width="40" height="32" rx="6" fill="#E5F6F0"/>
                    <rect x="20" y="24" width="24" height="3" rx="1.5" fill="#2563EB"/>
                    <rect x="20" y="31" width="16" height="3" rx="1.5" fill="#2563EB"/>
                    <rect x="20" y="38" width="12" height="3" rx="1.5" fill="#2563EB"/>
                    <circle cx="44" cy="44" r="8" fill="#A7F3D0"/>
                    <circle cx="44" cy="44" r="5" stroke="#2563EB" strokeWidth="2" fill="none"/>
                    <line x1="48" y1="48" x2="53" y2="53" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="font-bold text-xl mb-1 text-[#222]">No documents uploaded</div>
                <div className="text-gray-500 text-base text-center">Upload your travel documents for easy access</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold text-lg mb-4">Quick Actions</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="flex items-center justify-center gap-2 bg-[#D1FADF] text-green-700 px-4 py-3 rounded-lg font-medium hover:bg-[#A7F3D0] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="4" fill="#22C55E"/><path d="M10 6v8M6 10h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                Book Flight
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#E0F2FE] text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-[#BAE6FD] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="7" r="4" fill="#2563EB"/><rect x="4" y="13" width="12" height="5" rx="2.5" fill="#2563EB"/></svg>
                Book Hotel
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#DBEAFE] text-blue-900 px-4 py-3 rounded-lg font-medium hover:bg-[#BFDBFE] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20"><rect x="3" y="12" width="2" height="5" rx="1" fill="#2563EB"/><rect x="8" y="9" width="2" height="8" rx="1" fill="#2563EB"/><rect x="13" y="6" width="2" height="11" rx="1" fill="#2563EB"/></svg>
                Upload Document
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#F0FDFA] text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-[#CCFBF1] transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20"><rect x="2" y="6" width="16" height="10" rx="3" fill="#2563EB"/><rect x="6" y="10" width="8" height="2" rx="1" fill="#fff"/></svg>
                Plan Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TravelDashboard;