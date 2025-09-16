import React, { useEffect, useState } from 'react';
import Layout from '../shared/Layout';
import { logisticsAPI } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserProgress, fetchUserBadges, fetchAvailableBadges, fetchLeaderboard } from '../../store/slices/gamificationSlice';
import ProgressRing from '../gamification/ProgressRing';
import BadgeDisplay from '../gamification/BadgeDisplay';
import LeaderboardWidget from '../gamification/LeaderboardWidget';

const LogisticsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userProgress, userBadges, availableBadges, leaderboard, isLoading } = useAppSelector((state: any) => state.gamification);
  const { isAuthenticated, token } = useAppSelector((state: any) => state.auth);
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Debug logging
  console.log('LogisticsDashboard render:', {
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
        console.log('LogisticsDashboard: User not authenticated, skipping data fetch');
        return;
      }

      try {
        console.log('LogisticsDashboard: User authenticated, starting data fetch...');
        
        // Fetch gamification data first
        console.log('LogisticsDashboard: Fetching gamification data...');
        await dispatch(fetchUserProgress()).unwrap();
        await dispatch(fetchUserBadges()).unwrap(); 
        await dispatch(fetchAvailableBadges('logistics')).unwrap();
        await dispatch(fetchLeaderboard({ industry: 'logistics', period: 'WEEKLY' })).unwrap();
        console.log('LogisticsDashboard: Gamification data fetch completed');

        // Try to fetch other data, but don't let it fail the whole component
        try {
          const [analyticsData, shipmentsData, vehiclesData] = await Promise.all([
            logisticsAPI.getAnalytics().catch(err => {
              console.warn('LogisticsDashboard: Analytics API failed (non-critical):', err.message);
              return { analytics: null };
            }),
            logisticsAPI.getShipments().catch(err => {
              console.warn('LogisticsDashboard: Shipments API failed (non-critical):', err.message);
              return { shipments: [] };
            }),
            logisticsAPI.getVehicles().catch(err => {
              console.warn('LogisticsDashboard: Vehicles API failed (non-critical):', err.message);
              return { vehicles: [] };
            })
          ]);
          
          setAnalytics(analyticsData.analytics);
          setShipments((shipmentsData.shipments || []).slice(0, 5));
          setVehicles((vehiclesData.vehicles || []).slice(0, 5));
          console.log('LogisticsDashboard: All data loaded successfully');
        } catch (error) {
          console.warn('LogisticsDashboard: Some API calls failed, but gamification should work');
        }
        
      } catch (error) {
        console.error('Error fetching logistics data:', error);
      }
    };

    fetchData();
  }, [dispatch, isAuthenticated, token]);

  return (
    <Layout>
      <div className="bg-[#F8FCF9] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Logistics Management Dashboard</h1>
            <p className="text-gray-600 mt-2">Track shipments, manage fleet, and optimize routes</p>
          </div>
          
          {/* Gamification Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Progress Ring */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Logistics Progress</h3>
              <div className="flex flex-col items-center space-y-4">
                <ProgressRing
                  progress={userProgress?.completionRate || 0}
                  size={120}
                  label={`Level ${userProgress?.currentLevel || 1}`}
                  color="#F59E0B"
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
                Logistics Achievements
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
                title="Weekly Logistics Leaders"
                industry="logistics"
                period="WEEKLY"
                maxEntries={5}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-xl flex flex-col justify-between min-h-[150px] px-8 py-6">
              <div className="text-[#2D3748] font-semibold text-lg mb-4">Total Shipments</div>
              <div className="flex flex-row items-center justify-between flex-1">
                <div className="text-4xl font-bold text-logistics-600">{analytics?.totalShipments || 0}</div>
                <div className="bg-logistics-100 rounded-full w-16 h-16 flex items-center justify-center">
                  {/* ...existing icon... */}
                  <svg className="w-8 h-8 text-logistics-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-.293-.707L15 4.586A1 1 0 0014.414 4H14v3z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl flex flex-col justify-between min-h-[150px] px-8 py-6">
              <div className="text-[#2D3748] font-semibold text-lg mb-4">Fleet Vehicles</div>
              <div className="flex flex-row items-center justify-between flex-1">
                <div className="text-4xl font-bold text-logistics-600">{analytics?.totalVehicles || 0}</div>
                <div className="bg-logistics-100 rounded-full w-16 h-16 flex items-center justify-center">
                  {/* ...existing icon... */}
                  <svg className="w-8 h-8 text-logistics-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl flex flex-col justify-between min-h-[150px] px-8 py-6">
              <div className="text-[#2D3748] font-semibold text-lg mb-4">Delivered Today</div>
              <div className="flex flex-row items-center justify-between flex-1">
                <div className="text-4xl font-bold text-logistics-600">{analytics?.deliveredToday || 0}</div>
                <div className="bg-logistics-100 rounded-full w-16 h-16 flex items-center justify-center">
                  {/* ...existing icon... */}
                  <svg className="w-8 h-8 text-logistics-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl flex flex-col justify-between min-h-[150px] px-8 py-6">
              <div className="text-[#2D3748] font-semibold text-lg mb-4">In Transit</div>
              <div className="flex flex-row items-center justify-between flex-1">
                <div className="text-4xl font-bold text-logistics-600">{analytics?.shipmentsByStatus?.find((s: any) => s.status === 'in_transit')?._count || 0}</div>
                <div className="bg-logistics-100 rounded-full w-16 h-16 flex items-center justify-center">
                  {/* ...existing icon... */}
                  <svg className="w-8 h-8 text-logistics-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Shipments */}
          <div className="bg-white rounded-2xl shadow px-8 py-8 flex flex-col min-h-[270px]">
            <div className="font-semibold text-xl text-[#222] mb-6">Recent Shipments</div>
            <div className="flex flex-col items-center justify-center flex-1 bg-[#F8FAFC] rounded-xl py-10 shadow-inner">
              {shipments.length > 0 ? (
                <div className="space-y-4 w-full">
                  {shipments.map((shipment: any) => (
                    <div key={shipment.id} className="border border-gray-200 rounded-lg p-4 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{shipment.trackingNumber}</h4>
                          <p className="text-sm text-gray-600">
                            {shipment.origin?.city}  {shipment.destination?.city}
                          </p>
                          {shipment.estimatedDelivery && (
                            <p className="text-xs text-gray-500">
                              ETA: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            shipment.status === 'picked_up' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {shipment.status.replace('_', ' ')}
                          </span>
                          {shipment.weight && (
                            <p className="text-xs text-gray-500 mt-1">{shipment.weight} kg</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className="bg-logistics-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-logistics-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-.293-.707L15 4.586A1 1 0 0014.414 4H14v3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">No shipments yet</h4>
                  <p className="text-gray-600">Create your first shipment to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Fleet Vehicles */}
          <div className="bg-white rounded-2xl shadow px-8 py-8 flex flex-col min-h-[270px]">
            <div className="font-semibold text-xl text-[#222] mb-6">Fleet Vehicles</div>
            <div className="flex flex-col items-center justify-center flex-1 bg-[#F8FAFC] rounded-xl py-10 shadow-inner">
              {vehicles.length > 0 ? (
                <div className="space-y-4 w-full">
                  {vehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{vehicle.licensePlate}</h4>
                          <p className="text-sm text-gray-600 capitalize">{vehicle.vehicleType}</p>
                          {vehicle.capacity && (
                            <p className="text-xs text-gray-500">Capacity: {vehicle.capacity} tons</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vehicle.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className="bg-logistics-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-logistics-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">No vehicles registered</h4>
                  <p className="text-gray-600">Add vehicles to your fleet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
  <div className="mt-8 border border-gray-200 bg-[#F8FFFB] rounded-2xl shadow-sm p-6" style={{ boxShadow: '0 2px 8px 0 rgba(60, 100, 100, 0.08)' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center gap-2 bg-logistics-500 hover:bg-logistics-600 text-white px-4 py-3 rounded-lg font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Shipment
            </button>
            <button className="flex items-center justify-center gap-2 bg-logistics-100 hover:bg-logistics-200 text-logistics-700 px-4 py-3 rounded-lg font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Add Vehicle
            </button>
            <button className="flex items-center justify-center gap-2 bg-logistics-100 hover:bg-logistics-200 text-logistics-700 px-4 py-3 rounded-lg font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Optimize Routes
            </button>
            <button className="flex items-center justify-center gap-2 bg-logistics-100 hover:bg-logistics-200 text-logistics-700 px-4 py-3 rounded-lg font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Track Shipments
            </button>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default LogisticsDashboard;