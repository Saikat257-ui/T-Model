import { createSlice } from '@reduxjs/toolkit';

interface TravelState {
  bookings: any[];
  documents: any[];
  analytics: any;
  loading: boolean;
  error: string | null;
}

const initialState: TravelState = {
  bookings: [],
  documents: [],
  analytics: null,
  loading: false,
  error: null,
};

const travelSlice = createSlice({
  name: 'travel',
  initialState,
  reducers: {
    // Placeholder reducers for travel industry
  },
});

export default travelSlice.reducer;