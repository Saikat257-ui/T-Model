import { createSlice } from '@reduxjs/toolkit';

interface TourState {
  packages: any[];
  bookings: any[];
  analytics: any;
  loading: boolean;
  error: string | null;
}

const initialState: TourState = {
  packages: [],
  bookings: [],
  analytics: null,
  loading: false,
  error: null,
};

const tourSlice = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    // Placeholder reducers for tour industry
  },
});

export default tourSlice.reducer;