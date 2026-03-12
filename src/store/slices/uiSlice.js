import { createSlice } from "@reduxjs/toolkit";
import { AppView } from "../../types";
import toast from "react-hot-toast";

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
  
  const viewPermissions = {
    // Dedicated Dashboards
    [AppView.ADMIN]: ["admin"],
    [AppView.STUDENT]: ["student"],
    [AppView.TEACHER]: ["teacher"],
    [AppView.PARENT]: ["parent"],
    [AppView.FEED]: ["student"],
    // S-Risk Profile (Teacher Internal)
    [AppView.INTERNAL_STUDENT_PROFILE]: ["teacher", "admin"],
    
    // Matrix: Browse Courses -> Yes for all (Student is primary actor)
    [AppView.MARKETPLACE]: ["student", "teacher", "admin", "parent"],
    
    // Matrix: Join Classroom -> Admin (Monitor), Student (View), Teacher (Host). Parent = No
    [AppView.CLASSROOM]: ["student", "teacher", "admin"],
    
    // Matrix: Browse Tutors -> Admin, Student, Parent (Teacher = No)
    [AppView.INSTRUCTORS_DIRECTORY]: ["student", "parent", "admin"],
  };

  const allowedRoles = viewPermissions[view];

  // If the view is protected (exists in the mapping)
  if (allowedRoles) {
    if (!auth.isLoggedIn) {
      // Focus the login modal on the primary role for the view
      const intendedRole = allowedRoles[0];
      dispatch(setAuthModal({ type: "login", intendedRole }));
      return;
    }

    // RBAC Check: Logged in, but role is not in the allowed list
    if (!allowedRoles.includes(auth.role)) {
      // Find the primary role required for this view to pre-select in the modal
      const intendedRole = allowedRoles[0];
      
      toast.error(`Please log in as a ${intendedRole} to access this area.`);
      
      // Open the login modal allowing them to switch accounts.
      // Note: We DO NOT dispatch logout or setView here. 
      // This means they stay on their current page safely if they cancel the modal!
      dispatch(setAuthModal({ type: "login", intendedRole }));
      return;
    }
  }

  dispatch(setView(view));
  window.scrollTo(0, 0);
};

export default uiSlice.reducer;

