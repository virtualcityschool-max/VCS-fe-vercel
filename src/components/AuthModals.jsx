import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAuthModal } from "../store/slices/uiSlice";
import { loginSuccess } from "../store/slices/authSlice";
import { setView } from "../store/slices/uiSlice";
import { AppView } from "../types";

const AuthModals = () => {
  const [activeRoleTab, setActiveRoleTab] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const dispatch = useDispatch();
  const { authModal } = useSelector((state) => state.ui);
  const isOpen = authModal.type;
  const intendedRole = authModal.intendedRole;
  
  const onClose = () => dispatch(setAuthModal(null));

  React.useEffect(() => {
    if (isOpen && intendedRole) {
      setActiveRoleTab(intendedRole);
    }
  }, [isOpen, intendedRole]);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const valid =
      username.toLowerCase() === activeRoleTab &&
      password.toLowerCase() === activeRoleTab;

    if (valid) {
      const names = {
        student: "Sarah Khan",
        teacher: "Dr. Elena Petrova",
        admin: "Root Admin",
        parent: "Mr. Khan",
      };

      dispatch(
        loginSuccess({
          role: activeRoleTab,
          username: names[activeRoleTab] || "User",
        })
      );

      // Role-based redirects
      if (activeRoleTab === "student") {
        dispatch(setView(AppView.FEED));
      } else if (activeRoleTab === "teacher") {
        dispatch(setView(AppView.TEACHER));
      } else if (activeRoleTab === "admin") {
        dispatch(setView(AppView.ADMIN));
      } else if (activeRoleTab === "parent") {
        dispatch(setView(AppView.PARENT));
      }

      onClose();
      setUsername("");
      setPassword("");
    } else {
      setError("Invalid Credentials. Please try again.");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setRegistrationSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden glass relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {isOpen === "login" ? (
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-black font-poppins text-white mb-2 text-center">
              Secure Login
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-8 text-center">
              Access your VirtualCitySchool terminal.
            </p>

            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 mb-8">
              {["student", "teacher", "parent", "admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setActiveRoleTab(role);
                    setError("");
                  }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeRoleTab === role
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`e.g. ${activeRoleTab}`}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                />
              </div>
              {error && (
                <p className="text-red-500 text-xs font-bold animate-shake text-center">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
              >
                Launch VirtualCity Terminal
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 sm:p-10">
            {registrationSuccess ? (
              <div className="text-center py-10 animate-fadeIn">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2 className="text-2xl font-black font-poppins text-white mb-4">
                  Registration Submitted!
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Your application to join VirtualCitySchool is now under
                  review.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition"
                >
                  Return to Home
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl sm:text-3xl font-black font-poppins text-white mb-2 text-center">
                  Join the Academy
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mb-8 text-center">
                  Apply for enrollment at VirtualCitySchool.
                </p>
                <button
                  type="button"
                  onClick={() => setRegistrationSuccess(true)}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModals;
