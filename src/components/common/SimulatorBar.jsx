import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAuthModal } from "../../store/slices/uiSlice";
import { toastManager } from "../../utils/toastManager";

const SimulatorBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isLoggedIn, role } = useSelector((state) => state.auth);

  const buttons = [
    { id: "/", label: "Public Home", icon: "fa-home", public: true },
    { id: "/admin", label: "Admin", icon: "fa-user-shield", roles: ["admin"] },
    {
      id: "/student",
      label: "Student",
      icon: "fa-user-graduate",
      roles: ["student"],
    },
    {
      id: "/teacher",
      label: "Tutor",
      icon: "fa-chalkboard-teacher",
      roles: ["teacher"],
    },
    {
      id: "/parent",
      label: "Guardian",
      icon: "fa-user-friends",
      roles: ["parent"],
    },
    // {
    //   id: "/classroom",
    //   label: "Classroom",
    //   icon: "fa-video",
    //   roles: ["student", "teacher", "admin"],
    // },
    {
      id: "/teacher/123",
      label: "T-Profile",
      icon: "fa-id-card",
      public: true,
    },
    {
      id: "/student/456",
      label: "S-Risk",
      icon: "fa-exclamation-triangle",
      roles: ["teacher"],
    },
  ];

  // Filter buttons based on authentication status and role
  const getVisibleButtons = () => {
    if (!isLoggedIn) {
      // Show only public buttons when not logged in, but hide specific items
      return buttons.filter((button) => {
        // Hide Classroom, T-Profile, and S-Risk for logged-out users
        const hiddenWhenLoggedOut = [
          "/classroom",
          "/teacher/123",
          "/student/456",
        ];
        return !hiddenWhenLoggedOut.includes(button.id);
      });
    }

    // When logged in, only show buttons that are public (except Public Home) or match the user's role
    return buttons.filter((button) => {
      // Hide Public Home for logged-in users
      if (button.id === "/") return false;

      // Show public buttons (except Public Home which is handled above)
      if (button.public) return true;

      // Show buttons that match the user's role
      if (button.roles && button.roles.includes(role)) return true;

      // Hide buttons that don't match the user's role
      return false;
    });
  };

  const handleNavigation = (button) => {
    if (button.roles && !isLoggedIn) {
      const intendedRole = button.roles[0];
      dispatch(setAuthModal({ type: "login", intendedRole }));
      return;
    }

    if (button.roles && isLoggedIn && !button.roles.includes(role)) {
      const intendedRole = button.roles[0];
      toastManager.error(
        `Please log in as a ${intendedRole} to access this area.`,
      );
      dispatch(setAuthModal({ type: "login", intendedRole }));
      return;
    }

    navigate(button.id);
    window.scrollTo(0, 0);
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-60 flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-black/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 max-w-[95vw] overflow-x-auto no-scrollbar scroll-smooth">
      <div className="hidden sm:block text-[10px] text-white/50 absolute -top-4 left-4 font-bold uppercase tracking-widest whitespace-nowrap">
        Global Simulator Bar
      </div>

      {getVisibleButtons().map((btn) => (
        <button
          key={btn.id}
          onClick={() => handleNavigation(btn)}
          className={`shrink-0 flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
            location.pathname === btn.id
              ? "bg-indigo-600 text-white scale-105"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
          title={btn.label}
        >
          <i className={`fas ${btn.icon}`}></i>
          <span className="hidden md:inline">{btn.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SimulatorBar;
