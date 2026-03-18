import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuthModal } from "../../store/slices/uiSlice";
import { logoutUser } from "../../store/slices/authSlice";
import { ROLES, ROUTES } from "../../constants";

const Navbar = ({ variant = "default" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logoutUser());
  };

  const handleSetAuthModal = (modal) => dispatch(setAuthModal(modal));

  const getAvatarUrl = () => {
    if (auth.role === ROLES.TEACHER) return "https://i.pravatar.cc/150?u=elena";
    if (auth.role === ROLES.ADMIN) return "https://i.pravatar.cc/150?u=admin";
    if (auth.role === ROLES.PARENT) return "https://i.pravatar.cc/150?u=parent";
    return "https://i.pravatar.cc/150?u=sarah_j";
  };

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

  const isActivePath = (path) => location.pathname === path;

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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-indigo-900/40 group-hover:rotate-12 transition-all">
                V
              </div>
              <span className="text-[10px] xs:text-base sm:text-xl font-black font-poppins tracking-tighter whitespace-nowrap">
                VirtualCitySchool
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => navigate("/courses")}
                className="text-sm font-bold text-slate-400 hover:text-white transition"
              >
                Browse Courses
              </button>
              <button
                onClick={() => navigate("/instructors")}
                className="text-sm font-bold text-slate-400 hover:text-white transition"
              >
                Find Tutors
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            {!auth.isLoggedIn ? (
              <div id="nav-guest" className="flex items-center gap-3 sm:gap-6">
                <button
                  onClick={() => handleSetAuthModal("login")}
                  className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition whitespace-nowrap"
                >
                  Login
                </button>
                <button
                  onClick={() => handleSetAuthModal("register")}
                  className="bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-900/30 transition active:scale-95 whitespace-nowrap"
                >
                  Register Now
                </button>
              </div>
            ) : (
              <div
                id="nav-user"
                className="flex items-center gap-6 animate-fadeIn"
              >
                <div
                  className="flex items-center gap-4 group cursor-pointer"
                  onClick={() => {
                    if (auth.role === ROLES.STUDENT)
                      navigate(ROUTES.PROTECTED.STUDENT);
                    if (auth.role === ROLES.TEACHER)
                      navigate(ROUTES.PROTECTED.TEACHER);
                    if (auth.role === ROLES.ADMIN)
                      navigate(ROUTES.PROTECTED.ADMIN);
                    if (auth.role === ROLES.PARENT)
                      navigate(ROUTES.PROTECTED.PARENT);
                  }}
                >
                  <div className="text-right">
                    <p className="text-sm font-black font-poppins text-white leading-none mb-1">
                      {auth.username}
                    </p>
                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest leading-none">
                      {getRoleLabel()}
                    </p>
                  </div>
                  <img
                    src={getAvatarUrl()}
                    className="w-10 h-10 rounded-xl border-2 border-white/10 group-hover:border-indigo-500 transition duration-500 shadow-xl"
                    alt="User Avatar"
                  />
                </div>
                <div className="w-px h-8 bg-white/10 mx-2"></div>
                <button
                  onClick={onLogout}
                  className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition"
                >
                  Sign Out
                </button>
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
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white group-hover:rotate-12 transition">
              V
            </div>
            <span className="font-black text-[10px] sm:text-sm tracking-tighter whitespace-nowrap">
              VirtualCitySchool
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto custom-scrollbar whitespace-nowrap py-2 no-scrollbar">
            <button
              onClick={() => navigate("/")}
              className={`text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer ${
                isActivePath("/") ? "text-white" : ""
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate("/feed")}
              className={`text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer ${
                isActivePath("/feed") ? "text-white" : ""
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => {
                if (auth.role === "student") navigate("/student");
                if (auth.role === "teacher") navigate("/teacher");
                if (auth.role === "admin") navigate("/admin");
                if (auth.role === "parent") navigate("/parent");
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
            </button>
            <button
              onClick={() => navigate("/instructors")}
              className={`text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer ${
                isActivePath("/instructors") ? "text-white" : ""
              }`}
            >
              Instructors
            </button>
            <button
              onClick={() => navigate("/courses")}
              className={`text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer ${
                isActivePath("/courses") ? "text-white" : ""
              }`}
            >
              Catalog
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-5 shrink-0 ml-4">
          <button className="relative text-slate-400 hover:text-white transition text-base sm:text-lg">
            <i className="far fa-bell"></i>
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <button className="relative text-slate-400 hover:text-white transition text-base sm:text-lg">
            <i className="fas fa-th-large"></i>
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <button
            onClick={onLogout}
            className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
