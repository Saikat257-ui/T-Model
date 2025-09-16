import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../../store/store';

interface IndustryRouteProps {
  children: React.ReactNode;
  allowedIndustries: string[];
}

const IndustryRoute: React.FC<IndustryRouteProps> = ({ children, allowedIndustries }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  console.log('IndustryRoute: Checking access', {
    userIndustry: user?.industry?.name,
    allowedIndustries,
    hasAccess: user?.industry && allowedIndustries.includes(user.industry.name)
  });

  if (!user?.industry) {
    console.log('IndustryRoute: No industry, redirecting to profile');
    return <Navigate to="/profile" replace />;
  }

  if (!allowedIndustries.includes(user.industry.name)) {
    console.log('IndustryRoute: Access denied for industry:', user.industry.name);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            This section is only available for {allowedIndustries.join(', ')} industry users.
          </p>
          <p className="text-sm text-gray-500">
            Your current industry: <strong>{user.industry.name}</strong>
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('IndustryRoute: Access granted, rendering children');
  return <>{children}</>;
};

export default IndustryRoute;