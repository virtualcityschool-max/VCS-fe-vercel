import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Footer = ({ variant = "full" }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const handleNavigation = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  if (variant === "minimal") {
    return (
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Virtual City School. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  const footerLink =
    "text-slate-400 hover:text-white hover:translate-x-0.5 transition-all duration-200 cursor-pointer text-sm text-left inline-flex items-center gap-2 group";

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/80 overflow-hidden">
      {/* Ambient accent glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute bottom-[-40%] left-[10%] w-[40%] h-[80%] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">

          {/* Brand - left */}
          <div className="max-w-sm">
            <img
              src="/assets/logo1.png"
              alt="Virtual City School"
              className="w-40 h-28 object-contain cursor-pointer -ml-2 mb-1 hover:opacity-90 transition-opacity"
              onClick={() => handleNavigation("/")}
            />
            <p className="text-slate-400 text-sm leading-relaxed">
              Next-generation learning platform connecting students with
              world-class tutors for live classes and on-demand mastery modules.
            </p>
          </div>

          {/* Quick Links + Support - grouped on the right, side by side */}
          <div className="flex gap-16 shrink-0 items-start md:items-end">
            {/* Quick Links */}
            <div>
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => handleNavigation("/courses")}
                    className={footerLink}
                  >
                    Explore Courses
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/teachers")}
                    className={footerLink}
                  >
                    Meet Our Tutors
                  </button>
                </li>
                {isLoggedIn && (
                  <>
                    <li>
                      <button
                        onClick={() => handleNavigation("/feed")}
                        className={footerLink}
                      >
                        Student Feed
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavigation("/classroom")}
                        className={footerLink}
                      >
                        Classroom
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">
                Support
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => handleNavigation("/privacy-policy")}
                    className={footerLink}
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/terms")}
                    className={footerLink}
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Virtual City School. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button
                onClick={() => handleNavigation("/about")}
                className="text-slate-400 hover:text-white cursor-pointer transition text-sm"
              >
                About
              </button>
              <button
                onClick={() => handleNavigation("/privacy-policy")}
                className="text-slate-400 hover:text-white cursor-pointer transition text-sm"
              >
                Privacy
              </button>
              <button
                onClick={() => handleNavigation("/terms")}
                className="text-slate-400 hover:text-white cursor-pointer transition text-sm"
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
