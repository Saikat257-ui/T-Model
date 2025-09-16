import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 UNAUTHORIZED ERROR - NOT AUTO-REDIRECTING:', {
        url: error.config?.url,
        method: error.config?.method,
        responseData: error.response?.data,
        currentToken: localStorage.getItem('token') ? 'EXISTS' : 'MISSING',
        currentPath: window.location.pathname
      });
      
      // Comment out auto-redirect temporarily to debug the real issue
      // localStorage.removeItem('token');
      // if (window.location.pathname !== '/login') {
      //   window.location.href = '/login';
      // }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    industryId?: string; // Make industryId optional
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getIndustries: async () => {
    const response = await api.get('/auth/industries');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },
};

// Tour API
export const tourAPI = {
  getPackages: async () => {
    const response = await api.get('/tour/packages');
    return response.data;
  },
  
  getBookings: async () => {
    const response = await api.get('/tour/bookings');
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/tour/analytics');
    return response.data;
  },

  // =============================================================================
  // FUTURE QUICK ACTIONS API METHODS - FOR DASHBOARD INTEGRATION
  // =============================================================================
  
  // Package Management (Create Package Quick Action)
  createPackage: async (packageData: any) => {
    const response = await api.post('/tour/packages', packageData);
    return response.data;
  },

  updatePackage: async (id: string, packageData: any) => {
    const response = await api.put(`/tour/packages/${id}`, packageData);
    return response.data;
  },

  deletePackage: async (id: string) => {
    const response = await api.delete(`/tour/packages/${id}`);
    return response.data;
  },

  // Guide Management (Manage Guides Quick Action)
  getGuides: async () => {
    const response = await api.get('/tour/guides');
    return response.data;
  },

  createGuide: async (guideData: any) => {
    const response = await api.post('/tour/guides', guideData);
    return response.data;
  },

  // Detailed Analytics (View Analytics Quick Action)
  getDetailedAnalytics: async () => {
    const response = await api.get('/tour/analytics/detailed');
    return response.data;
  },

  // Customer Support (Customer Support Quick Action)
  getSupportTickets: async () => {
    const response = await api.get('/tour/support/tickets');
    return response.data;
  },

  createSupportTicket: async (ticketData: any) => {
    const response = await api.post('/tour/support/tickets', ticketData);
    return response.data;
  },
  // End of future quick actions endpoints

  
};

// Travel API
export const travelAPI = {
  getBookings: async () => {
    const response = await api.get('/travel/bookings');
    return response.data;
  },
  
  getDocuments: async () => {
    const response = await api.get('/travel/documents');
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/travel/analytics');
    return response.data;
  },

  // =============================================================================
  // FUTURE QUICK ACTIONS API METHODS - FOR DASHBOARD INTEGRATION
  // =============================================================================
  
  // Flight & Hotel Booking (Book Flight & Book Hotel Quick Actions)
  bookFlight: async (flightData: any) => {
    const response = await api.post('/travel/bookings/flight', flightData);
    return response.data;
  },

  bookHotel: async (hotelData: any) => {
    const response = await api.post('/travel/bookings/hotel', hotelData);
    return response.data;
  },

  // Booking Management
  updateBooking: async (id: string, bookingData: any) => {
    const response = await api.put(`/travel/bookings/${id}`, bookingData);
    return response.data;
  },

  cancelBooking: async (id: string) => {
    const response = await api.delete(`/travel/bookings/${id}`);
    return response.data;
  },

  // Document Management (Upload Document Quick Action)
  uploadDocument: async (documentData: any) => {
    const response = await api.post('/travel/documents', documentData);
    return response.data;
  },

  updateDocument: async (id: string, documentData: any) => {
    const response = await api.put(`/travel/documents/${id}`, documentData);
    return response.data;
  },

  deleteDocument: async (id: string) => {
    const response = await api.delete(`/travel/documents/${id}`);
    return response.data;
  },

  // Itinerary Planning (Plan Itinerary Quick Action)
  createItinerary: async (itineraryData: any) => {
    const response = await api.post('/travel/itinerary', itineraryData);
    return response.data;
  },

  getItineraries: async () => {
    const response = await api.get('/travel/itinerary');
    return response.data;
  },

  // Search Functions (Future Integration)
  searchFlights: async (searchParams: any) => {
    const response = await api.get('/travel/search/flights', { params: searchParams });
    return response.data;
  },

  searchHotels: async (searchParams: any) => {
    const response = await api.get('/travel/search/hotels', { params: searchParams });
    return response.data;
  },
  // End of future quick actions endpoints


};

// Logistics API
export const logisticsAPI = {
  getShipments: async () => {
    const response = await api.get('/logistics/shipments');
    return response.data;
  },
  
  getVehicles: async () => {
    const response = await api.get('/logistics/vehicles');
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/logistics/analytics');
    return response.data;
  },

  // =============================================================================
  // FUTURE QUICK ACTIONS API METHODS - FOR DASHBOARD INTEGRATION
  // =============================================================================
  
  // Shipment Management (Create Shipment Quick Action)
  createShipment: async (shipmentData: any) => {
    const response = await api.post('/logistics/shipments', shipmentData);
    return response.data;
  },

  updateShipment: async (id: string, shipmentData: any) => {
    const response = await api.put(`/logistics/shipments/${id}`, shipmentData);
    return response.data;
  },

  deleteShipment: async (id: string) => {
    const response = await api.delete(`/logistics/shipments/${id}`);
    return response.data;
  },

  // Vehicle Management (Add Vehicle Quick Action)
  addVehicle: async (vehicleData: any) => {
    const response = await api.post('/logistics/vehicles', vehicleData);
    return response.data;
  },

  updateVehicle: async (id: string, vehicleData: any) => {
    const response = await api.put(`/logistics/vehicles/${id}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (id: string) => {
    const response = await api.delete(`/logistics/vehicles/${id}`);
    return response.data;
  },

  // Route Optimization (Optimize Routes Quick Action)
  optimizeRoutes: async (optimizationData: any) => {
    const response = await api.post('/logistics/routes/optimize', optimizationData);
    return response.data;
  },

  getRouteSuggestions: async () => {
    const response = await api.get('/logistics/routes/suggestions');
    return response.data;
  },

  // Shipment Tracking (Track Shipments Quick Action)
  trackShipment: async (id: string) => {
    const response = await api.get(`/logistics/shipments/${id}/tracking`);
    return response.data;
  },

  addTrackingUpdate: async (id: string, trackingData: any) => {
    const response = await api.post(`/logistics/shipments/${id}/tracking`, trackingData);
    return response.data;
  },

  bulkTrackShipments: async (shipmentIds: string[]) => {
    const response = await api.post('/logistics/shipments/tracking/bulk', { shipmentIds });
    return response.data;
  },

  // Fleet Management
  getFleetStatus: async () => {
    const response = await api.get('/logistics/fleet/status');
    return response.data;
  },
  // End of future quick actions endpoints


};

// Gamification API
export const gamificationAPI = {
  getUserProgress: async () => {
    const response = await api.get('/gamification/progress');
    return response.data;
  },

  getUserBadges: async () => {
    const response = await api.get('/gamification/badges');
    return response.data;
  },

  getAvailableBadges: async (industry: string) => {
    const response = await api.get(`/gamification/badges/available?industry=${encodeURIComponent(industry)}`);
    return response.data;
  },

  getLeaderboard: async (industry: string, period: string = 'MONTHLY', limit: number = 10) => {
    const response = await api.get(`/gamification/leaderboard?industry=${encodeURIComponent(industry)}&period=${period}&limit=${limit}`);
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/gamification/achievements');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/gamification/stats');
    return response.data;
  },

  updateProgress: async (industry: string, actionType: string, metadata?: any) => {
    const response = await api.post('/gamification/progress/update', {
      industry,
      actionType,
      metadata
    });
    return response.data;
  },
};

export default api;