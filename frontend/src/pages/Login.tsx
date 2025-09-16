import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { login } from '../store/slices/authSlice';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [hasInputActivity, setHasInputActivity] = useState(false);

  // Check if any input has content or is focused
  const checkInputActivity = () => {
    const hasContent = formData.email.length > 0 || formData.password.length > 0;
    const hasFocus = document.activeElement?.tagName === 'INPUT';
    setHasInputActivity(hasContent || hasFocus);
  };

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    // Check if user has selected an industry
    if (user.industry && user.industry.id) {
      // Redirect to appropriate dashboard based on industry
      const industryRoutes: Record<string, string> = {
        'Tour Management': '/tour',
        'Travel Services': '/travel', 
        'Logistics & Shipping': '/logistics',
        'Other Industries': '/profile'
      };
      
      const redirectPath = industryRoutes[user.industry.name] || '/profile';
      return <Navigate to={redirectPath} replace />;
    } else {
      // User hasn't selected industry yet, redirect to profile settings
      return <Navigate to="/profile" replace />;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
    } catch (err) {
      // Error is handled by the store
      console.error('Login failed:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Trigger activity check after state update
    setTimeout(checkInputActivity, 0);
  };

  const handleInputFocus = () => {
    setHasInputActivity(true);
  };

  const handleInputBlur = () => {
    // Check if there's still content when losing focus
    setTimeout(checkInputActivity, 0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-100 to-blue-100 px-2">
      <div className="flex w-full max-w-4xl mx-auto px-2">
        <div className="flex-1 flex items-center justify-center">
          <div className={`bg-white rounded-2xl shadow-xl px-4 sm:px-10 py-12 w-full max-w-md flex flex-col items-center form-card-focus ${hasInputActivity ? 'active' : ''}`}> 
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                {/* Outlined Lock Icon */}
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="8" rx="2" stroke="#fff" strokeWidth="2"/><path d="M9 10V7a3 3 0 1 1 6 0v3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="15" r="1" fill="#fff"/></svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Welcome back</h2>
            <p className="text-gray-500 mb-8 text-center">Sign in to your account</p>
            <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
                  {error}
                </div>
              )}
              <label className="text-gray-700 font-medium mb-1" htmlFor="email">Email address</label>
              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {/* Outlined Email Icon */}
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#888" strokeWidth="2"/><path d="M3 7l9 6 9-6" stroke="#888" strokeWidth="2"/></svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
              <label className="text-gray-700 font-medium mb-1" htmlFor="password">Password</label>
              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {/* Outlined Password Icon */}
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="8" rx="2" stroke="#888" strokeWidth="2"/><path d="M9 10V7a3 3 0 1 1 6 0v3" stroke="#888" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="15" r="1" fill="#888"/></svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowPassword((prev) => !prev)}>
                  {/* Outlined Eye Icon (open/closed) */}
                  {showPassword ? (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="7" ry="5" stroke="#888" strokeWidth="2"/><circle cx="12" cy="12" r="2" stroke="#888" strokeWidth="2"/><line x1="5" y1="19" x2="19" y2="5" stroke="#888" strokeWidth="2"/></svg>
                  ) : (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="7" ry="5" stroke="#888" strokeWidth="2"/><circle cx="12" cy="12" r="2" stroke="#888" strokeWidth="2"/></svg>
                  )}
                </span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg shadow-md hover:from-blue-600 hover:to-purple-600 transition"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <div className="mt-6 text-center text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 font-medium hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;