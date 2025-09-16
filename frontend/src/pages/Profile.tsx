import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { updateProfile, logout, checkAuthStatus } from '../store/slices/authSlice';

interface Industry {
  id: string;
  name: string;
  description?: string;
}

const Profile: React.FC = () => {
  console.log('🔥 Profile component starting to render...');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industriesLoading, setIndustriesLoading] = useState(true);
  const [industriesError, setIndustriesError] = useState<string>('');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    industryId: '',
  });

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIndustriesLoading(true);
        setIndustriesError('');
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/industries`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch industries: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle the response format { industries: [...] }
        if (data && Array.isArray(data.industries)) {
          setIndustries(data.industries);
        } else if (Array.isArray(data)) {
          setIndustries(data);
        } else {
          console.error('Unexpected industries response format:', data);
          setIndustriesError('Invalid data format received from server');
          setIndustries([]);
        }
      } catch (error) {
        console.error('Failed to load industries:', error);
        setIndustriesError(error instanceof Error ? error.message : 'Failed to load industries');
        setIndustries([]);
      } finally {
        setIndustriesLoading(false);
      }
    };

    fetchIndustries();
    
    // Ensure user data is fresh when component mounts
    const token = localStorage.getItem('token');
    if (token && (!user || !user.phone)) {
      console.log('Profile: Refreshing user data to ensure all fields are loaded');
      dispatch(checkAuthStatus());
    }
  }, [dispatch, user]);

  // Separate useEffect for user data to ensure it updates whenever user changes
  useEffect(() => {
    if (user) {
      console.log('Profile: Updating form data with user:', user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        industryId: user.industry?.id || '',
      });
      
      // Detect first-time setup: user has no industry selected OR came from registration
      const isNewUser = !user.industry || location.state?.fromRegistration;
      setIsFirstTimeSetup(isNewUser);
      console.log('Profile: First time setup detected:', isNewUser);
    }
  }, [user, user?.phone, user?.firstName, user?.lastName, user?.industry?.id, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.industryId) {
      alert('Please select an industry to continue');
      return;
    }

    console.log('Profile: Updating profile with industry:', formData.industryId);
    
    try {
      await dispatch(updateProfile(formData)).unwrap();
      console.log('Profile: Update successful');
      
      // Find the selected industry to determine the route
      const selectedIndustry = industries.find(ind => ind.id === formData.industryId);
      if (selectedIndustry) {
        const industryRoutes: Record<string, string> = {
          'Tour Management': '/tour',
          'Travel Services': '/travel', 
          'Logistics & Shipping': '/logistics',
          'Other Industries': '/profile'
        };
        
        const redirectPath = industryRoutes[selectedIndustry.name] || '/profile';
        console.log('Profile: Redirecting to:', redirectPath);
        
        // Wait for Redux state to update, then navigate
        setTimeout(() => {
          navigate(redirectPath);
        }, 200);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Profile: Update failed:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Wait for user data to be fully loaded before making redirect decisions
  if (!user && isLoading) {
    console.log('Profile: User data loading...');
    return <div>Loading user data...</div>;
  }

  // Only redirect to dashboard during initial flow (from login/register)
  // Allow explicit navigation to Profile page even with industry selected
  // This could be enhanced further by checking navigation history or using a query param

  console.log('Profile component rendering:', { 
    user: user ? { email: user.email, industry: user.industry } : null, 
    industries: industries.length, 
    industriesLoading, 
    industriesError,
    pathname: window.location.pathname
  });

  console.log('🎯 About to render Profile JSX...');

  const handleLogout = () => {
    dispatch(logout());
  };

  // Beautiful Profile page with industry selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-6 px-2 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto px-2">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isFirstTimeSetup ? 'Welcome! Complete Your Profile' : 'Profile Settings'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isFirstTimeSetup 
              ? 'Please complete your profile information and select your industry to get started with your personalized dashboard.'
              : 'Customize your account and select your industry to get started with the perfect dashboard experience.'
            }
          </p>
        </div>

        {/* First-time setup message */}
        {isFirstTimeSetup && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎉 One-Time Profile Setup
                </h3>
                <div className="text-gray-700 space-y-2">
                  <p className="font-medium">
                    Welcome to T-Model Platform! This profile setup page will only appear <span className="text-blue-600 font-semibold">once during your account creation</span>.
                  </p>
                  <p>
                    After you complete this setup and select your industry, future logins will take you directly to your chosen dashboard. You can always return to update your profile settings from the navigation menu.
                  </p>
                  <div className="flex items-center mt-3 p-3 bg-white/70 rounded-lg border border-blue-100">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Next login → Go directly to your personalized dashboard
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-4 py-8 sm:px-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Personal Information Section */}
              <div>
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                      <p className="text-gray-600">Update your personal details</p>
                    </div>
                  </div>
                  
                  {/* User Info Card - Moved to top right */}
                  {user && (
                    <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/50 self-end sm:self-auto">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                        {user.firstName ? user.firstName[0] : user.email?.[0] || 'U'}
                      </div>
                      <div className="text-left mr-3">
                        <div className="font-semibold text-gray-900 text-sm">{user.firstName || 'User'} {user.lastName || ''}</div>
                        <div className="text-xs text-gray-600">{user.email}</div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="ml-2 flex items-center justify-center bg-gradient-to-br from-pink-500 to-red-400 text-white rounded-full hover:scale-110 transition-all duration-200 w-9 h-9"
                        title="Logout"
                        aria-label="Logout"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0V5a3 3 0 016 0v1" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="pl-10 block w-full border border-gray-300 rounded-xl bg-white py-3 px-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all shadow-sm"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="pl-10 block w-full border border-gray-300 rounded-xl bg-white py-3 px-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all shadow-sm"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 block w-full border border-gray-300 rounded-xl bg-white py-3 px-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all shadow-sm"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Industry Selection Section */}
              <div>
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Industry Selection</h3>
                    <p className="text-gray-600">Choose your business focus</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="industry" className="block text-sm font-semibold text-gray-700">
                    Select Your Industry
                  </label>
                  
                  {industriesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="ml-2 text-gray-600">Loading industries...</span>
                    </div>
                  ) : industriesError ? (
                    <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex">
                        <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold">Error loading industries</h4>
                          <p className="text-sm">{industriesError}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <select
                        name="industryId"
                        id="industry"
                        value={formData.industryId}
                        onChange={handleChange}
                        className="pl-10 block w-full border border-gray-300 rounded-xl bg-white py-3 px-4 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-all shadow-sm appearance-none"
                        required
                      >
                        <option value="" disabled>Select your industry...</option>
                        {industries.map((industry) => (
                          <option key={industry.id} value={industry.id}>
                            {industry.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isLoading || !formData.industryId || industriesLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Profile...
                    </div>
                  ) : isFirstTimeSetup ? (
                    'Complete Setup & Continue'
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;