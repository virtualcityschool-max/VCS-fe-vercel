import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useLocation } from "react-router-dom";
import { setAuthModal } from "../../store/slices/uiSlice";
import { useAuth, useNavigation } from "../../hooks";
import Button from "../ui/Button";
import UserProfileDropdown from "./UserProfileDropdown";

const Navbar = ({ variant = "default" }) => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useAuth();
  const { navigate, isActivePath } = useNavigation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAdminLoginMode = searchParams.get("adminLogin") === "true" || location.pathname.startsWith("/admin");

  const handleSetAuthModal = (modal) => dispatch(setAuthModal(modal));
  const handleLoginClick = () =>
    handleSetAuthModal(isAdminLoginMode ? { type: "login", adminMode: true } : "login");

  // Public variant (for PublicHome)
  if (variant === "public") {
    return (
      <nav className="relative z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-12">
            <div
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0"
              onClick={() => navigate("/")}
            >
              <img src="/assets/logo.png" alt="Virtual City School" className="w-8 h-8 sm:w-10 sm:h-10 object-contain transition-all" style={{width: "180px",height: "70px"}}/>
              {/* <span className="text-sm xs:text-lg sm:text-2xl font-black font-poppins tracking-tighter whitespace-nowrap">
                VirtualCitySchool
              </span> */}
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => navigate("/courses")}
                className="text-sm font-bold text-slate-400 hover:text-white transition"
              >
                Explore Courses
              </button>
              <button
                onClick={() => navigate("/teachers")}
                className="text-sm font-bold text-slate-400 hover:text-white transition"
              >
                Meet Our Tutors
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            {!isLoggedIn ? (
              <div id="nav-guest" className="flex items-center gap-3 sm:gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSetAuthModal("register")}
                  className="bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-900/30 active:scale-95 whitespace-nowrap"
                >
                  Register Now
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4 animate-fadeIn">
                <UserProfileDropdown />
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Default variant (for authenticated views)
  return (
    <nav className="w-full bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-4 sm:gap-10 overflow-hidden">
          <div
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-indigo-900/40 group-hover:rotate-12 transition-all">
              V
            </div>
            <span className="text-sm xs:text-lg sm:text-2xl font-black font-poppins tracking-tighter whitespace-nowrap">
              VirtualCitySchool
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto custom-scrollbar whitespace-nowrap py-2 no-scrollbar">
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/")}
                className={`text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer ${
                  isActivePath("/") ? "text-white" : ""
                }`}
              >
                Home
              </button>
            )}
            {/* {role === "student" && (
              <button
                onClick={() => navigate("/feed")}
                className={`text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer ${
                  isActivePath("/feed") ? "text-white" : ""
                }`}
              >
                Feed
              </button>
            )} */}
            {/* <button
              onClick={() => {
                if (role === "student") navigate("/student");
                if (role === "teacher") navigate("/teacher");
                if (role === "admin") navigate("/admin");
                if (role === "parent") navigate("/parent");
              }}
              className={`text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer ${
                isActivePath("/student") ||
                isActivePath("/teacher") ||
                isActivePath("/admin") ||
                isActivePath("/parent")
                  ? "text-white"
                  : ""
              }`}
            >
              Dashboard
            </button> */}
            {/* <button
              onClick={() => navigate("/teachers")}
              className={`text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer ${
                isActivePath("/teachers") ? "text-white" : ""
              }`}
            >
              Teachers
            </button>
            <button
              onClick={() => navigate("/courses")}
              className={`text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer ${
                isActivePath("/courses") ? "text-white" : ""
              }`}
            >
              Catalog
            </button> */}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-4">
          {/* Notification Bell */}
          {/* <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 group">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button> */}

          {/* User Profile Dropdown */}
          <UserProfileDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
