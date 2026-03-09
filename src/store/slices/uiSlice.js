import { createSlice } from "@reduxjs/toolkit";
import { AppView } from "../../types";

const initialState = {
  currentView: AppView.PUBLIC_HOME,
  authModal: { type: null, intendedRole: null },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setView: (state, action) => {
      state.currentView = action.payload;
    },
    setAuthModal: (state, action) => {
      if (typeof action.payload === "string" || action.payload === null) {
        state.authModal = { type: action.payload, intendedRole: null };
      } else {
        state.authModal = { 
          type: action.payload.type, 
          intendedRole: action.payload.intendedRole || null 
        };
      }
    },
  },
});

export const { setView, setAuthModal } = uiSlice.actions;

export const navigateTo = (view) => (dispatch, getState) => {
  const { auth } = getState();
  
  const protectedViewRoles = {
    [AppView.ADMIN]: "admin",
    [AppView.STUDENT]: "student",
    [AppView.TEACHER]: "teacher",
    [AppView.PARENT]: "parent",
    [AppView.CLASSROOM]: "student",
    [AppView.FEED]: "student",
    [AppView.INTERNAL_STUDENT_PROFILE]: "teacher",
  };

  const intendedRole = protectedViewRoles[view];

  if (intendedRole && !auth.isLoggedIn) {
    dispatch(setAuthModal({ type: "login", intendedRole }));
    return;
  }

  dispatch(setView(view));
  window.scrollTo(0, 0);
};

export default uiSlice.reducer;
