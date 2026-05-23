import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authModal: { type: null, intendedRole: null, adminMode: false },
  enrollmentIntent: null, // { courseId: string, courseTitle: string }
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setAuthModal: (state, action) => {
      if (typeof action.payload === "string" || action.payload === null) {
        state.authModal = { type: action.payload, intendedRole: null, adminMode: false };
      } else {
        state.authModal = {
          type: action.payload.type,
          intendedRole: action.payload.intendedRole || null,
          adminMode: action.payload.adminMode || false,
        };
      }
    },
    setEnrollmentIntent: (state, action) => {
      state.enrollmentIntent = action.payload;
    },
  },
});

export const { setAuthModal, setEnrollmentIntent } = uiSlice.actions;

export default uiSlice.reducer;
