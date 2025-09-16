import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-gray-900">T-Model Platform</div>
            
            {/* Industry Badge */}
            {user?.industry && (
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg flex items-center space-x-2 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 cursor-pointer border border-opacity-20 border-white mx-1 sm:mx-2">
                  {/* Industry Icon */}
                  <div className="w-4 h-4">
                    {user.industry.name === 'Tour Management' && (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    )}
                    {user.industry.name === 'Travel Services' && (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 16v-2l-8-5V5.5c0-.83-.67-1.5-1.5-1.5S10 4.67 10 5.5V9l-8 5v2l8-2.5V17l-2 1.5V20l3.5-1 3.5 1v-1.5L13 17v-3.5l8 2.5z"/>
                      </svg>
                    )}
                    {user.industry.name === 'Logistics & Shipping' && (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                      </svg>
                    )}
                    {user.industry.name === 'Other Industries' && (
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                  </div>
                  <span>{user.industry.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {user?.firstName ? user.firstName[0] : user?.email?.[0] || 'U'}
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg z-50 border">
                <div className="px-4 pt-4 pb-2 border-b">
                  <div className="font-semibold text-lg text-gray-900">{user?.firstName || 'User'}</div>
                  <div className="text-sm text-gray-600">{user?.email}</div>
                </div>
                <div className="py-2">
                  <button
                    className="w-full flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 focus:outline-none"
                    onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                  >
                    <span className="mr-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </span>
                    Profile
                  </button>
                  <button
                    className="w-full flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 focus:outline-none"
                    onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                  >
                    <span className="mr-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    Settings
                  </button>
                </div>
                <div className="border-t px-4 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center text-red-600 hover:bg-red-50 px-0 py-2 font-medium focus:outline-none"
                  >
                    <span className="mr-3">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0V5a3 3 0 016 0v1" /></svg>
                    </span>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;