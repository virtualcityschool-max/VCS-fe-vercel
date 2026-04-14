import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authModal: { type: null, intendedRole: null },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setAuthModal: (state, action) => {
      if (typeof action.payload === "string" || action.payload === null) {
        state.authModal = { type: action.payload, intendedRole: null };
      } else {
        state.authModal = {
          type: action.payload.type,
          intendedRole: action.payload.intendedRole || null,
        };
      }
    },
  },
});

export const { setAuthModal } = uiSlice.actions;

export default uiSlice.reducer;
