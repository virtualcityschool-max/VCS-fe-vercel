import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { setAuthModal } from "../../store/slices/uiSlice";
import { useAuth, useNavigation } from "../../hooks";
import Button from "../ui/Button";
import UserProfileDropdown from "./UserProfileDropdown";
import TopBar from "./TopBar";
import { GUIDE_CATALOG } from "../../data/subjectGuides/catalog";
import ThemeToggle from "../common/ThemeToggle";
import { useMocksCatalog } from "../../hooks/useMocksCatalog";

const PUBLIC_LINKS = [
  { label: "Home", path: "/" },
  { label: "Explore Courses", path: "/courses" },
  // A separate app behind the /mocks rewrite: a full page load, not a router link.
  { label: "Mock Exams", path: "/mocks", external: true, mocks: true },
  { label: "Subject Guides", path: "/subjects", guides: true },
  { label: "Meet Our Tutors", path: "/teachers" },
  { label: "Mind Lab", path: "/mind-lab" },
  { label: "Blog", path: "/blogs" },
  { label: "About Us", path: "/about" },
];

const GUIDE_LEVELS = ["O Level", "AS & A Level"];

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
  const mocksMenu = useMocksCatalog();
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

  // Public variant (for PublicHome and site header)
  if (variant === "public") {
    return (
      <>
        {!hideLogo && <TopBar />}
        <nav
          className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
            scrolled
              ? "border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-lg shadow-black/20"
              : "border-white/5 bg-slate-950/50 backdrop-blur-xl"
          }`}
        >
          <div className={`relative max-w-[1440px] mx-auto px-4 sm:px-6 flex justify-between items-center ${
            hideLogo ? "h-14 sm:h-16" : "h-20"
          }`}>
            <div className="flex items-center gap-4 sm:gap-12">
              {!hideLogo && (
                <div
                  className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0"
                  onClick={() => goTo("/")}
                >
                  <img
                    src="/assets/logo.webp"
                    width="180"
                    height="68"
                    alt="Virtual City School"
                    className="theme-logo h-12 w-[110px] sm:h-[70px] sm:w-[180px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              {!hideLogo && (
                <div className="hidden xl:flex items-center gap-5 2xl:gap-8">
                  {/* Real links (not buttons) so search engines can follow them. */}
                  {PUBLIC_LINKS.map((link) => {
                    const active = link.guides ? location.pathname.startsWith("/subjects") : isActivePath(link.path);
                    const navClass = `nav-link font-medium text-xs sm:text-sm whitespace-nowrap transition ${
                      active ? "text-white nav-link-active" : "text-slate-400 hover:text-white"
                    }`;
                    if (link.mocks) return <MocksMenu key={link.path} link={link} navClass={navClass} menu={mocksMenu} />;
                    if (link.external) return <a key={link.path} href={link.path} className={navClass}>{link.label}</a>;
                    const a = (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`nav-link font-medium text-xs sm:text-sm whitespace-nowrap transition ${
                          active ? "text-white nav-link-active" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {link.label}
                        {link.guides && <i className="fas fa-chevron-down text-xs ml-1.5 opacity-70" />}
                      </Link>
                    );
                    if (!link.guides) return a;
                    return (
                      <div key={link.path} className="relative group">
                        {a}
                        {/* Every guide, by level, on hover or keyboard focus */}
                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50">
                          <div className="w-[560px] rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40 p-5 grid grid-cols-2 gap-6">
                            {GUIDE_LEVELS.map((lvl) => (
                              <div key={lvl}>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{lvl}</div>
                                <ul className="space-y-0.5">
                                  {GUIDE_CATALOG.filter((g) => g.level === lvl).map((g) => (
                                    <li key={g.slug}>
                                      <Link to={`/subjects/${g.slug}`} className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5">
                                        <span>{g.subject}</span><span className="font-mono text-xs text-slate-500">{g.code}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            <Link to="/subjects" className="col-span-2 text-center text-sm font-semibold text-indigo-300 hover:text-white border-t border-white/10 pt-3">
                              All subject guides
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 ml-auto">
              <ThemeToggle className="sm:w-10 sm:h-10" />
              {!isLoggedIn ? (
                <div id="nav-guest" className="flex items-center gap-1.5 sm:gap-5">
                  <Button variant="outline" size="sm" onClick={handleLoginClick}>
                    Log in
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSetAuthModal("register")}
                    className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-none px-3 sm:px-7 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap border-0"
                  >
                    Get started
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4 animate-fadeIn">
                  <UserProfileDropdown />
                </div>
              )}

              {/* Mobile menu toggle for public navigation */}
              {!hideLogo && (
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="xl:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileOpen}
                >
                  <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"} text-base transition-transform duration-200`} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu panel for public navigation */}
          {!hideLogo && mobileOpen && (
            <div className="xl:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-2xl animate-slideDown">
              <div className="px-4 py-4 space-y-1">
                {PUBLIC_LINKS.map((link) => link.external ? (
                  <a
                    key={link.path}
                    href={link.path}
                    className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      (link.guides ? location.pathname.startsWith("/subjects") : isActivePath(link.path))
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </>
    );
  }

  // Default variant (for authenticated views)
  return (
    <nav className="w-full bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
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

// "Mock Exams" with its subject dropdown (like Subject Guides): every subject, which papers are live, read from the
// Mock Exams app. The panel spans the menu's full width; the item fills the bar's height so the pointer can reach it.
function MocksMenu({ link, navClass, menu }) {
  const groups = menu.data?.groups ?? [];
  return (
    <div className="group/mocks h-20 flex items-center" onMouseEnter={menu.load} onFocus={menu.load}>
      <a href={link.path} className={`${navClass} inline-flex items-center`}>
        {link.label}
        <i className="fas fa-chevron-down text-xs ml-1.5 opacity-70" aria-hidden="true" />
      </a>
      <div className="invisible opacity-0 group-hover/mocks:visible group-hover/mocks:opacity-100 group-focus-within/mocks:visible group-focus-within/mocks:opacity-100 transition absolute inset-x-4 sm:inset-x-6 top-full z-50">
        <div className="rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40 overflow-hidden">
          {groups.length === 0 ? (
            <p className="p-6 text-sm text-slate-300">Loading subjects…</p>
          ) : (
            <div className="grid grid-cols-5 gap-6 p-6">
              {groups.map((g) => (
                <div key={g.label} className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{g.label}</div>
                  <ul className="space-y-0.5">
                    {g.exams.map((e) => (
                      <li key={e.href}>
                        <a href={e.href} className="block px-2 py-1.5 rounded-lg hover:bg-white/5 group/item">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-200 group-hover/item:text-white">{e.name}</span>
                            {e.live ? (
                              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />Live</span>
                            ) : (
                              <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold text-slate-400">Soon</span>
                            )}
                          </span>
                          <span className="block text-xs text-slate-400 mt-0.5">{e.body}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.03] px-6 py-3">
            <p className="text-sm text-slate-300">Official Cambridge past papers as timed mocks, <strong className="text-emerald-300 font-semibold">marked by VCS teachers</strong>. VCS students pay half.</p>
            <a href={menu.data?.allHref || "/mocks/exams"} className="text-sm font-semibold text-indigo-300 hover:text-white">All subjects →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
