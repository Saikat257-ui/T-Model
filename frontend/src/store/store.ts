import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import tourSlice from './slices/tourSlice';
import travelSlice from './slices/travelSlice';
import logisticsSlice from './slices/logisticsSlice';
import gamificationSlice from './slices/gamificationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tour: tourSlice,
    travel: travelSlice,
    logistics: logisticsSlice,
    gamification: gamificationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;