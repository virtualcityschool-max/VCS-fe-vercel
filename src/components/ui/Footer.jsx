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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Virtual City School. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">

          {/* Brand — left */}
          <div className="max-w-sm">
            <img
              src="/assets/logo1.png"
              alt="Virtual City School"
              className="w-40 h-28 object-contain cursor-pointer -ml-2 mb-1"
              onClick={() => handleNavigation("/")}
            />
            <p className="text-slate-400 text-sm leading-relaxed">
              Next-generation learning platform connecting students with
              world-class teachers for live classes and on-demand mastery modules.
            </p>
          </div>

          {/* Quick Links + Support — grouped on the right, side by side */}
          <div className="flex gap-16 shrink-0 items-end">
            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => handleNavigation("/courses")}
                    className="text-slate-400 hover:text-white transition cursor-pointer text-sm"
                  >
                    Browse Courses
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/teachers")}
                    className="text-slate-400 hover:text-white cursor-pointer transition text-sm"
                  >
                    Find Teachers
                  </button>
                </li>
                {isLoggedIn && (
                  <>
                    <li>
                      <button
                        onClick={() => handleNavigation("/feed")}
                        className="text-slate-400 hover:text-white cursor-pointer transition text-sm"
                      >
                        Student Feed
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavigation("/classroom")}
                        className="text-slate-400 hover:text-white cursor-pointer transition text-sm"
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
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => handleNavigation("/privacy-policy")}
                    className="text-slate-400 hover:text-white cursor-pointer transition text-sm text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/terms")}
                    className="text-slate-400 hover:text-white cursor-pointer transition text-sm text-left"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Virtual City School. All rights reserved.
            </p>
            <div className="flex gap-6">
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
