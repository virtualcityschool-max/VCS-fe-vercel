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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
              <img src="/assets/logo.png" alt="Virtual City School" className="w-40 h-40 object-contain cursor-pointer" onClick={() => handleNavigation("/")} />
            <p className="text-slate-400 text-sm mb-6 max-w-md">
              Next-generation learning platform connecting students with
              world-class teachers for live classes and on-demand mastery
              modules.
            </p>
            {/* <div className="flex gap-4">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
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
            <ul className="space-y-2">
             
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

        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Virtual City School. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
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
