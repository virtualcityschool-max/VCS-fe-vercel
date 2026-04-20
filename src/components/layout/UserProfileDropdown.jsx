import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../store/slices/authSlice";
import { ROLES, ROUTES } from "../../constants";
import { toastManager } from "../../utils/toastManager";

const UserProfileDropdown = ({ dropUp = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const getRoleLabel = () => {
    switch (auth.role) {
      case ROLES.ADMIN:
        return "Administrator";
      case ROLES.TEACHER:
        return "Instructor";
      case ROLES.STUDENT:
        return "Student";
      case ROLES.PARENT:
        return "Parent";
      default:
        return "User";
    }
  };

  const getInitials = () => {
    if (auth.username) {
      return auth.username
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  const handleSignOut = async () => {
    setIsDropdownOpen(false);

    const toastId = toastManager.loading("Signing out...");

    try {
      const result = await dispatch(logoutUser()).unwrap();
      toastManager.dismiss(toastId);

      // Show appropriate message based on backend logout success
      if (result.backendLogoutSuccess) {
        toastManager.success("Logged out successfully");
      } else {
        toastManager.info("Logged out locally (backend unavailable)");
      }

      // Always navigate to home regardless of backend success
      navigate("/");
    } catch (error) {
      toastManager.dismiss(toastId);
      // Even if dispatch fails, try to navigate to home
      toastManager.error("Error signing out. Redirecting to home...");
      setTimeout(() => navigate("/"), 1000);
    }
  };

  const handleDashboard = () => {
    setIsDropdownOpen(false);
    if (auth.role === ROLES.STUDENT) navigate(ROUTES.PROTECTED.STUDENT);
    if (auth.role === ROLES.TEACHER) navigate(ROUTES.PROTECTED.TEACHER);
    if (auth.role === ROLES.ADMIN) navigate(ROUTES.PROTECTED.ADMIN);
    if (auth.role === ROLES.PARENT) navigate(ROUTES.PROTECTED.PARENT);
  };

  const handleProfile = () => {
    setIsDropdownOpen(false);
    // Navigate to profile page when implemented
    toastManager.success("Profile page coming soon!");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-all duration-200 group ${dropUp ? "w-full" : ""}`}
        aria-label="User menu"
        aria-expanded={isDropdownOpen}
      >
        {/* User Info */}
        <div className={`${dropUp ? "text-left flex-1" : "text-right hidden sm:block"}`}>
          <p className="text-sm font-semibold text-white leading-none mb-1">
            {auth.username || "User"}
          </p>
          <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider leading-none">
            {getRoleLabel()}
          </p>
        </div>

        {/* Circular Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 p-0.5 group-hover:from-indigo-400 group-hover:to-purple-500 transition-all duration-200 shadow-lg group-hover:shadow-indigo-500/25">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
              {auth.user?.avatar ? (
                <img
                  src={auth.user.avatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {getInitials()}
                </span>
              )}
            </div>
          </div>
          {/* Status Indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className={`absolute ${dropUp ? "bottom-full mb-2 left-0" : "right-0 mt-2"} w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[200] animate-fadeIn`}>
          {/* User Info Header */}
          <div className="p-4 border-b border-slate-700 bg-linear-to-r from-slate-800 to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  {auth.user?.avatar ? (
                    <img
                      src={auth.user.avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {getInitials()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {auth.username || "User"}
                </p>
                <p className="text-xs text-slate-400">{auth.user?.email}</p>
                <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mt-1">
                  {getRoleLabel()}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleDashboard}
              className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 flex items-center gap-3"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => { setIsDropdownOpen(false); navigate("/teachers"); }}
              className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 flex items-center gap-3"
            >
              <i className="fas fa-user-graduate"></i>
              Teachers
            </button>
            <button
              onClick={() => { setIsDropdownOpen(false); navigate("/courses"); }}
              className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 flex items-center gap-3"
            >
              <i className="fas fa-book-open"></i>
              Courses
            </button>
            <button
              onClick={handleProfile}
              className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 flex items-center gap-3"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </button>

            <div className="border-t border-slate-700 my-2"></div>

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150 flex items-center gap-3"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
