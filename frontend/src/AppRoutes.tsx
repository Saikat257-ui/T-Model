import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { checkAuthStatus } from './store/slices/authSlice';

// Shared components
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Industry-specific dashboards
import TourDashboard from './components/industries/TourDashboard';
import TravelDashboard from './components/industries/TravelDashboard';
import LogisticsDashboard from './components/industries/LogisticsDashboard';

// Route protection
import ProtectedRoute from './components/shared/ProtectedRoute';
import IndustryRoute from './components/shared/IndustryRoute';

// Helper function to get redirect path based on user's industry
const getDashboardRoute = (user: any) => {
  if (!user || !user.industry?.id) {
    return '/profile'; // No industry selected, go to profile
  }
  
  const industryRoutes: Record<string, string> = {
    'Tour Management': '/tour',
    'Travel Services': '/travel', 
    'Logistics & Shipping': '/logistics',
    'Other Industries': '/profile'
  };
  
  return industryRoutes[user.industry.name] || '/profile';
};

const AppRoutes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  console.log('AppRoutes render:', { isAuthenticated, isLoading, user: user ? { email: user.email, industry: user.industry } : null });

  useEffect(() => {
    // Only check auth status if there's a token but no user data
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, user]);

  // Show loading spinner during initial auth check or when explicitly loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardRoute(user)} replace />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to={getDashboardRoute(user)} replace />} 
      />

      {/* Protected routes */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* Dashboard routing based on industry */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } 
      />

      {/* Industry-specific routes */}
      <Route 
        path="/tour/*" 
        element={
          <ProtectedRoute>
            <IndustryRoute allowedIndustries={['Tour Management']}>
              <TourDashboard />
            </IndustryRoute>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/travel/*" 
        element={
          <ProtectedRoute>
            <IndustryRoute allowedIndustries={['Travel Services']}>
              <TravelDashboard />
            </IndustryRoute>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/logistics/*" 
        element={
          <ProtectedRoute>
            <IndustryRoute allowedIndustries={['Logistics & Shipping']}>
              <LogisticsDashboard />
            </IndustryRoute>
          </ProtectedRoute>
        } 
      />

      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to={getDashboardRoute(user)} replace /> : <Navigate to="/login" replace />
        } 
      />

      {/* 404 fallback */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600">Page not found</p>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

// Dashboard router that redirects based on user industry
const DashboardRouter: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  console.log('DashboardRouter:', { user: user ? { email: user.email, industry: user.industry } : null });

  if (!user?.industry) {
    console.log('No industry found, redirecting to profile');
    return <Navigate to="/profile" replace />;
  }

  const industryRoutes: Record<string, string> = {
    'Tour Management': '/tour',
    'Travel Services': '/travel', 
    'Logistics & Shipping': '/logistics',
    'Other Industries': '/other'
  };

  const redirectPath = industryRoutes[user.industry.name] || '/profile';
  console.log('Redirecting to:', redirectPath, 'for industry:', user.industry.name);
  return <Navigate to={redirectPath} replace />;
};

export default AppRoutes;