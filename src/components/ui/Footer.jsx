import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { GUIDE_CATALOG } from "../../data/subjectGuides/catalog";

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
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 text-center">
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

      <div className="relative max-w-[1920px] mx-auto px-6 sm:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-12">

          {/* Brand - left */}
          <div className="max-w-sm">
            <img
              src="/assets/logo1.webp"
              loading="lazy"
              alt="Virtual City School"
              className="theme-logo w-40 h-28 object-contain cursor-pointer -ml-2 mb-1 hover:opacity-90 transition-opacity"
              onClick={() => handleNavigation("/")}
            />
            <p className="text-slate-400 text-sm leading-relaxed">
              Live, teacher-led Cambridge O Level and A Level classes for
              Pakistani families across the Gulf and beyond.
            </p>
            <div className="flex items-center gap-1 mt-3 -ml-2.5">
              <a
                href="https://www.facebook.com/virtualcityschool"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition"
                aria-label="Virtual City School on Facebook"
              >
                <i className="fab fa-facebook-f text-base" aria-hidden="true"></i>
              </a>
              <a
                href="https://www.instagram.com/virtualcityschool/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition"
                aria-label="Virtual City School on Instagram"
              >
                <i className="fab fa-instagram text-base" aria-hidden="true"></i>
              </a>
              <a
                href="https://www.youtube.com/@VirtualCitySchool"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition"
                aria-label="Virtual City School on YouTube"
              >
                <i className="fab fa-youtube text-base" aria-hidden="true"></i>
              </a>
              <a
                href="https://www.tiktok.com/@virtual.city.schoo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition"
                aria-label="Virtual City School on TikTok"
              >
                {/* TikTok is not in the site's icon font subset, so the logo is drawn inline */}
                <svg viewBox="0 0 448 512" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3v178.8A162.6 162.6 0 1 1 185 188.3v89.9a74.6 74.6 0 1 0 52.2 71.2V0h88a121.2 121.2 0 0 0 1.9 22.2A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
                </svg>
              </a>
              <a
                href="https://wa.me/966556687417"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition"
                aria-label="Message Virtual City School on WhatsApp"
              >
                <i className="fab fa-whatsapp text-base" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          {/* Links (real <a> links so search engines can follow them) */}
          <div className="flex flex-wrap gap-x-16 gap-y-10 items-start">
            {/* Quick Links */}
            <div>
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/courses" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Explore Courses</Link>
                </li>
                <li>
                  <Link to="/subjects" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Subject Guides</Link>
                </li>
                <li>
                  <Link to="/teachers" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Meet Our Tutors</Link>
                </li>
                <li>
                  <Link to="/online-o-level" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Online O Level</Link>
                </li>
                <li>
                  <Link to="/online-a-level" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Online A Level</Link>
                </li>
                <li>
                  <Link to="/exam-dates" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Exam Dates & Deadlines</Link>
                </li>
                <li>
                  <Link to="/private-candidate" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Private Candidate Registration</Link>
                </li>
                <li>
                  <Link to="/download" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Get the App</Link>
                </li>
                <li>
                  <Link to="/mind-lab" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Mind Lab: Tests & Brain Games</Link>
                </li>
                <li>
                  <Link to="/online-school" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Online School by Country</Link>
                </li>
                {isLoggedIn && (
                  <>
                    <li>
                      <Link to="/feed" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Student Feed</Link>
                    </li>
                    <li>
                      <Link to="/classroom" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Classroom</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Subject guides, by level */}
            {["O Level", "AS & A Level"].map((lvl) => (
              <div key={lvl}>
                <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">
                  {lvl} guides
                </h3>
                <ul className="space-y-2.5">
                  {GUIDE_CATALOG.filter((g) => g.level === lvl).map((g) => (
                    <li key={g.slug}>
                      <Link to={`/subjects/${g.slug}`} onClick={() => window.scrollTo(0, 0)} className={footerLink}>
                        {g.subject} {g.code}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Support */}
            <div>
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">
                Support
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className={footerLink}>Terms of Service</Link>
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
              <Link to="/about" onClick={() => window.scrollTo(0, 0)} className="text-slate-400 hover:text-white cursor-pointer transition text-sm">About</Link>
              <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)} className="text-slate-400 hover:text-white cursor-pointer transition text-sm">Privacy</Link>
              <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="text-slate-400 hover:text-white cursor-pointer transition text-sm">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
