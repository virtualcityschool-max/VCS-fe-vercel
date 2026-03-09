import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  role: null,
  username: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { role, username } = action.payload;
      state.isLoggedIn = true;
      state.role = role;
      state.username = username;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.role = null;
      state.username = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
