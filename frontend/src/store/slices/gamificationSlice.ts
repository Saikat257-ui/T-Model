import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface UserProgress {
  userId: string;
  totalPoints: number;
  currentLevel: number;
  experiencePoints: number;
  completionRate: number;
  tourProgress: number;
  travelProgress: number;
  logisticsProgress: number;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    industry: {
      id: string;
      name: string;
    } | null;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  category: string;
  industry: string | null;
  points: number;
  iconUrl?: string | null;
  isActive?: boolean;
}

export interface UserBadge {
  id: string;
  badge: Badge;
  earnedAt: Date;
}

export interface Achievement {
  id: string;
  type: string;
  category: string;
  description: string;
  points: number;
  achievedAt: Date;
  metadata?: any;
}

export interface LeaderboardEntry {
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

export interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  completionRate: number;
  badgesEarned: number;
  experiencePoints: number;
}

interface GamificationState {
  userProgress: UserProgress | null;
  userBadges: UserBadge[];
  availableBadges: Badge[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  stats: GamificationStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GamificationState = {
  userProgress: null,
  userBadges: [],
  availableBadges: [],
  achievements: [],
  leaderboard: [],
  stats: null,
  isLoading: false,
  error: null,
};

// API base URL
const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/gamification`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Async thunks
export const fetchUserProgress = createAsyncThunk(
  'gamification/fetchUserProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/progress`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user progress');
      }
      
      const data = await response.json();
      return data.progress;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchUserBadges = createAsyncThunk(
  'gamification/fetchUserBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/badges`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user badges');
      }
      
      const data = await response.json();
      return data.badges;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchAvailableBadges = createAsyncThunk(
  'gamification/fetchAvailableBadges',
  async (industry: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/badges/available?industry=${encodeURIComponent(industry)}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch available badges');
      }
      
      const data = await response.json();
      return data.badges;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async ({ industry, period = 'MONTHLY', limit = 10 }: { industry: string; period?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        industry,
        period,
        limit: limit.toString(),
      });
      
      const response = await fetch(`${API_BASE}/leaderboard?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      return data.leaderboard;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchAchievements = createAsyncThunk(
  'gamification/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/achievements`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch achievements');
      }
      
      const data = await response.json();
      return data.achievements;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchGamificationStats = createAsyncThunk(
  'gamification/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/stats`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch gamification stats');
      }
      
      const data = await response.json();
      return data.stats;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateProgress = createAsyncThunk(
  'gamification/updateProgress',
  async ({ industry, actionType, metadata }: { industry: string; actionType: string; metadata?: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/progress/update`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          industry,
          actionType,
          metadata,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update progress');
      }
      
      const data = await response.json();
      return data.progress;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Gamification slice
const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetGamification: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action: PayloadAction<UserProgress>) => {
        state.isLoading = false;
        state.userProgress = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch user badges
      .addCase(fetchUserBadges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBadges.fulfilled, (state, action: PayloadAction<UserBadge[]>) => {
        state.isLoading = false;
        state.userBadges = action.payload;
        state.error = null;
      })
      .addCase(fetchUserBadges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch available badges
      .addCase(fetchAvailableBadges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableBadges.fulfilled, (state, action: PayloadAction<Badge[]>) => {
        state.isLoading = false;
        state.availableBadges = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableBadges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action: PayloadAction<LeaderboardEntry[]>) => {
        state.isLoading = false;
        state.leaderboard = action.payload;
        state.error = null;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch achievements
      .addCase(fetchAchievements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action: PayloadAction<Achievement[]>) => {
        state.isLoading = false;
        state.achievements = action.payload;
        state.error = null;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch stats
      .addCase(fetchGamificationStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGamificationStats.fulfilled, (state, action: PayloadAction<GamificationStats>) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchGamificationStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update progress
      .addCase(updateProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProgress.fulfilled, (state, action: PayloadAction<UserProgress>) => {
        state.isLoading = false;
        state.userProgress = action.payload;
        state.error = null;
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetGamification } = gamificationSlice.actions;
export default gamificationSlice.reducer;