import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useLocation } from "react-router-dom";
import { setAuthModal } from "../../store/slices/uiSlice";
import { useAuth, useNavigation } from "../../hooks";
import Button from "../ui/Button";
import UserProfileDropdown from "./UserProfileDropdown";

const PUBLIC_LINKS = [
  { label: "Home", path: "/" },
  { label: "Explore Courses", path: "/courses" },
  { label: "Meet Our Tutors", path: "/teachers" },
  { label: "Blog", path: "/blogs" },
  { label: "About Us", path: "/about" },
];

const Navbar = ({ variant = "default", hideLogo = false }) => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useAuth();
  const { navigate, isActivePath } = useNavigation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 12,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdminLoginMode =
    searchParams.get("adminLogin") === "true" ||
    location.pathname.startsWith("/admin");

  const handleSetAuthModal = (modal) => dispatch(setAuthModal(modal));
  const handleLoginClick = () =>
    handleSetAuthModal(
      isAdminLoginMode ? { type: "login", adminMode: true } : "login",
    );

  // Elevate the public navbar once the page scrolls
  useEffect(() => {
    if (variant !== "public") return;
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  // Public variant (for PublicHome)
  if (variant === "public") {
    return (
      <nav
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-lg shadow-black/20"
            : "border-white/5 bg-slate-950/50 backdrop-blur-xl"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-12">
            {!hideLogo && (
              <div
                className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0"
                onClick={() => goTo("/")}
              >
                <img
                  src="/assets/logo.png"
                  alt="Virtual City School"
                  className="h-12 w-[110px] sm:h-[70px] sm:w-[180px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            )}
            <div className="hidden lg:flex items-center gap-8">
              {PUBLIC_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => goTo(link.path)}
                  className={`nav-link font-medium text-xs sm:text-sm transition cursor-pointer ${
                    isActivePath(link.path)
                      ? "text-white nav-link-active"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {!isLoggedIn ? (
              <div id="nav-guest" className="flex items-center gap-1.5 sm:gap-5">
                <Button variant="ghost" size="sm" onClick={handleLoginClick}>
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSetAuthModal("register")}
                  className="btn-glow text-white px-3 sm:px-7 py-2 sm:py-3 rounded-xl font-bold text-[11px] sm:text-sm whitespace-nowrap border-0"
                >
                  Register<span className="hidden sm:inline">&nbsp;Now</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4 animate-fadeIn">
                <UserProfileDropdown />
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"} text-base transition-transform duration-200`} />
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-2xl animate-slideDown">
            <div className="px-4 py-4 space-y-1">
              {PUBLIC_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => goTo(link.path)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActivePath(link.path)
                      ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                      : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Default variant (for authenticated views)
  return (
    <nav className="w-full bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-4 sm:gap-10 overflow-hidden">
          <div
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-indigo-900/40 group-hover:rotate-12 group-hover:scale-105 transition-all duration-300">
              V
            </div>
            <span className="text-sm xs:text-lg sm:text-2xl font-black font-poppins tracking-tighter whitespace-nowrap">
              VirtualCitySchool
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto custom-scrollbar whitespace-nowrap py-2 no-scrollbar">
            <button
              onClick={() => navigate("/")}
              className={`nav-link font-medium text-xs sm:text-sm transition cursor-pointer ${
                isActivePath("/") ? "text-white nav-link-active" : "text-slate-400 hover:text-white"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate("/about")}
              className={`nav-link font-medium text-xs sm:text-sm transition cursor-pointer ${
                isActivePath("/about") ? "text-white nav-link-active" : "text-slate-400 hover:text-white"
              }`}
            >
              About Us
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-4">
          <UserProfileDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
