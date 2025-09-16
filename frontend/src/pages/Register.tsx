import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { register } from '../store/slices/authSlice';

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasInputActivity, setHasInputActivity] = useState(false);

  // Check if any input has content or is focused
  const checkInputActivity = () => {
    const hasContent = formData.firstName.length > 0 || 
                      formData.lastName.length > 0 || 
                      formData.email.length > 0 || 
                      formData.password.length > 0 || 
                      formData.confirmPassword.length > 0 || 
                      formData.phone.length > 0;
    const hasFocus = document.activeElement?.tagName === 'INPUT';
    setHasInputActivity(hasContent || hasFocus);
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/profile" state={{ fromRegistration: true }} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    
    try {
      await dispatch(register(registerData)).unwrap();
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`bg-white rounded-2xl shadow-xl px-10 py-12 w-full max-w-md flex flex-col items-center form-card-focus ${hasInputActivity ? 'active' : ''}`}>
        {/* App Icon */}
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-blue-500">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path fill="#fff" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Create account</h2>
        <p className="text-gray-500 mb-8 text-center">Create your account to get started</p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
              {error}
            </div>
          )}

          {/* Full Name Field */}
          <div>
            <label className="text-gray-700 font-medium mb-1 block" htmlFor="fullName">First name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path fill="#888" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
          </div>

          {/* Last Name Field (keeping the lastName field for backend compatibility) */}
          {/* {formData.lastName !== undefined && (
            <div className="hidden">
              <input
                name="lastName"
                type="text"
                className="hidden"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
          )} */}

          <div>
            <label className="text-gray-700 font-medium mb-1 block" htmlFor="fullName">Last name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path fill="#888" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
          </div>

          {/* Email Address Field */}
          <div>
            <label className="text-gray-700 font-medium mb-1 block" htmlFor="email">Email address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#888" strokeWidth="2"/>
                  <path d="M3 7l9 6 9-6" stroke="#888" strokeWidth="2"/>
                </svg>
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
          </div>

          {/* Phone Field */}
          <div>
            <label className="text-gray-700 font-medium mb-1 block" htmlFor="phone">Phone number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path fill="#888" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011-.27 11.36 11.36 0 003.58.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.58 3.58 1 1 0 01-.27 1l-2.2 2.21z"/>
                </svg>
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-gray-700 font-medium mb-1 block" htmlFor="password">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <rect x="6" y="10" width="12" height="8" rx="2" stroke="#888" strokeWidth="2"/>
                  <path d="M9 10V7a3 3 0 1 1 6 0v3" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="15" r="1" fill="#888"/>
                </svg>
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
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="12" rx="7" ry="5" stroke="#888" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="2" stroke="#888" strokeWidth="2"/>
                    <line x1="5" y1="19" x2="19" y2="5" stroke="#888" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="12" rx="7" ry="5" stroke="#888" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="2" stroke="#888" strokeWidth="2"/>
                  </svg>
                )}
              </span>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="text-gray-700 font-medium mb-1 block" htmlFor="confirmPassword">Confirm password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <rect x="6" y="10" width="12" height="8" rx="2" stroke="#888" strokeWidth="2"/>
                  <path d="M9 10V7a3 3 0 1 1 6 0v3" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="15" r="1" fill="#888"/>
                </svg>
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="12" rx="7" ry="5" stroke="#888" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="2" stroke="#888" strokeWidth="2"/>
                    <line x1="5" y1="19" x2="19" y2="5" stroke="#888" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="12" rx="7" ry="5" stroke="#888" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="2" stroke="#888" strokeWidth="2"/>
                  </svg>
                )}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full py-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold text-lg shadow-md hover:from-green-600 hover:to-blue-600 transition disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-blue-500 font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;