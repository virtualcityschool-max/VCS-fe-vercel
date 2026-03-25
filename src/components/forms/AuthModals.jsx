import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthModal } from "../../store/slices/uiSlice";
import {
  loginUser,
  registerUser,
  clearAuthError,
  verifyOtp,
  resendOtp,
} from "../../store/slices/authSlice";
import { useNavigation } from "../../hooks";

const emptyErrors = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  role: "",
};

const AuthModals = () => {
  const [activeRoleTab, setActiveRoleTab] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(emptyErrors);
  const [backendErrors, setBackendErrors] = useState({});
  const [registrationStep, setRegistrationStep] = useState("form"); // form | sending | otp | success
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [otpError, setOtpError] = useState("");

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration form state
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  const dispatch = useDispatch();
  const { authModal } = useSelector((state) => state.ui);
  const {
    isLoading,
    resendOtpLoading,
    error: authError,
  } = useSelector((state) => state.auth);
  const { goToDashboard } = useNavigation();
  const navigate = useNavigate();

  const isOpen = authModal.type;
  const intendedRole = authModal.intendedRole;

  const hasLocalErrors = Object.values(error).some((value) => value !== "");

  // Comprehensive reset function
  const resetAllStates = () => {
    // Reset form inputs
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
    setRole("");

    // Reset role tab to default
    setActiveRoleTab("student");

    // Reset error states
    setError({ ...emptyErrors });
    setBackendErrors({});
    setOtpError("");

    // Reset OTP states
    setRegistrationStep("form");
    setOtp("");
    setUserId(null);

    // Reset password visibility states
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);

    // Clear Redux auth error
    dispatch(clearAuthError());
  };

  const onClose = () => {
    resetAllStates();
    dispatch(setAuthModal(null));
  };

  React.useEffect(() => {
    if (isOpen && intendedRole) {
      // Only set the intended role, don't reset everything
      setActiveRoleTab(intendedRole);
    }

    if (isOpen) {
      // Clear backend errors and Redux error when opening
      setBackendErrors({});
      dispatch(clearAuthError());
    }
  }, [isOpen, intendedRole, dispatch]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const newErrors = { ...emptyErrors };

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    const hasErrors = Object.values(newErrors).some((value) => value);

    if (hasErrors) {
      setError(newErrors);
      return;
    }

    setError({ ...emptyErrors });

    try {
      const user = await dispatch(
        loginUser({
          email,
          password,
          role: activeRoleTab,
        }),
      ).unwrap();

      // Navigate to role dashboard after successful login
      // Use the role from the login response instead of Redux state to avoid timing issues
      const userRole = user.role || activeRoleTab;
      switch (userRole) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "student":
          navigate("/student", { replace: true });
          break;
        case "teacher":
          navigate("/teacher", { replace: true });
          break;
        case "parent":
          navigate("/parent", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }

      // Close modal after a small delay to allow navigation to start
      setTimeout(() => {
        onClose(); // This will reset all states automatically
      }, 50);
    } catch (err) {
      // Show toast for login errors
      if (typeof err === "object" && err !== null) {
        Object.entries(err).forEach(([field, messages]) => {
          const errorText = Array.isArray(messages)
            ? messages.join(", ")
            : messages;
          toast.error(`${field}: ${errorText}`);
        });
      } else {
        toast.error(err || "Login failed");
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const newErrors = { ...emptyErrors };

    // Email validation
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    // Username validation
    if (!username) newErrors.username = "Username is required";
    else if (username.length < 3)
      newErrors.username = "Username must be at least 3 characters";

    // Password validation
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    // Confirm password validation
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    // Role validation
    if (!role) newErrors.role = "Please select a role";

    const hasErrors = Object.values(newErrors).some((value) => value);

    if (hasErrors) {
      setError(newErrors);
      return;
    }

    setError({ ...emptyErrors });

    try {
      const response = await dispatch(
        registerUser({
          email,
          username,
          password,
          confirmPassword,
          role,
        }),
      ).unwrap();

      // Move to OTP step instead of showing success
      setRegistrationStep("otp");
      console.log("Registration Response:", response);

      // Extract userId with better debugging - backend should return user_id as number
      // Based on API spec, successful registration returns user_id
      const extractedUserId =
        response.user_id || response.user?.id || response.id || response.userId;

      console.log(
        "Extracted userId:",
        extractedUserId,
        "from response:",
        response,
      );
      console.log("Available response keys:", Object.keys(response));

      if (!extractedUserId) {
        console.error(
          "No userId found in registration response. Response structure:",
          response,
        );
        setOtpError(
          "Registration succeeded but no user ID received. Please try registering again.",
        );
        setRegistrationStep("form");
        return;
      }

      setUserId(extractedUserId);
      // Don't clear form fields yet
    } catch (err) {
      // Error is already in Redux state, handle field errors here
      console.log("Registration error details:", err);

      if (typeof err === "object" && err !== null) {
        // Handle field-specific errors
        if (err.field) {
          // Set field-specific error
          setError({
            [err.field]: err.error,
          });
        } else {
          // Set general backend errors
          setBackendErrors(err);
        }

        // Show toast for non-field errors
        if (!err.field) {
          Object.entries(err).forEach(([field, messages]) => {
            const errorText = Array.isArray(messages)
              ? messages.join(", ")
              : messages;
            toast.error(errorText);
          });
        }
      } else {
        toast.error(err || "Registration failed. Please try again.");
      }
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email is required to resend OTP");
      return;
    }

    try {
      await dispatch(resendOtp(email)).unwrap();
      toast.success("OTP resent to your email");
    } catch (err) {
      console.error("Resend OTP failed:", err);

      if (typeof err === "object" && err !== null) {
        toast.error(err.error || err.message || "Failed to resend OTP");
      } else {
        toast.error(err || "Failed to resend OTP");
      }
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setOtpError("OTP is required");
      return;
    }

    // Validate userId exists before attempting OTP verification
    if (!userId) {
      setOtpError("User session expired. Please register again.");
      console.error("OTP verification attempted without userId");
      // Reset to registration form
      setTimeout(() => {
        setRegistrationStep("form");
        setOtpError("");
      }, 2000);
      return;
    }

    setOtpError("");

    try {
      await dispatch(verifyOtp({ userId, otp })).unwrap();

      // Registration successful - show success state
      setRegistrationStep("success");
    } catch (err) {
      console.error("OTP verification failed:", err);

      if (typeof err === "object" && err !== null) {
        // Handle 500 errors specifically
        if (err.status === 500) {
          setOtpError(`${err.error || "Server error"} ${err.suggestion || ""}`);
        } else {
          setOtpError(err.error || err.message || "OTP verification failed");
        }
      } else {
        setOtpError("OTP verification failed. Please try again.");
      }
    }
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
              {["student", "teacher", "parent", "admin"].map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => {
                    // Reset form states but keep the selected role
                    setEmail("");
                    setPassword("");
                    setShowLoginPassword(false);
                    setError({ ...emptyErrors });
                    setBackendErrors({});
                    dispatch(clearAuthError());
                    // Set the new role
                    setActiveRoleTab(roleOption);
                  }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeRoleTab === roleOption
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {roleOption}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  name="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    toast.dismiss();
                    setEmail(e.target.value);
                    setError((prev) => ({ ...prev, email: "" }));
                    dispatch(clearAuthError());
                  }}
                  placeholder="e.g. user@email.com"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                />
                {error.email && (
                  <p className="text-red-500 text-xs mt-2 animate-shake">
                    {error.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      toast.dismiss();
                      setPassword(e.target.value);
                      setError((prev) => ({ ...prev, password: "" }));
                      dispatch(clearAuthError());
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    tabIndex="-1"
                  >
                    <i
                      className={`fas ${showLoginPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}
                    ></i>
                  </button>
                </div>
                {error.password && (
                  <p className="text-red-500 text-xs mt-2 animate-shake">
                    {error.password}
                  </p>
                )}
                {backendErrors.password && (
                  <div className="text-red-500 text-xs mt-2 space-y-1">
                    {Array.isArray(backendErrors.password) ? (
                      backendErrors.password.map((msg, idx) => (
                        <p key={idx} className="animate-shake">
                          {msg}
                        </p>
                      ))
                    ) : (
                      <p className="animate-shake">{backendErrors.password}</p>
                    )}
                  </div>
                )}
              </div>

              {authError && !hasLocalErrors && (
                <p className="text-red-500 text-xs font-bold animate-shake text-center">
                  {typeof authError === "string"
                    ? authError
                    : "Registration failed"}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    Authenticating...
                  </>
                ) : (
                  "LOGIN"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 sm:p-10">
            {registrationStep === "form" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                {/* Your existing registration form fields */}
                <div>
                  <label
                    htmlFor="register-email"
                    className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                  >
                    Email
                  </label>
                  <input
                    id="register-email"
                    name="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      toast.dismiss();
                      setEmail(e.target.value);
                      setError((prev) => ({ ...prev, email: "" }));
                      dispatch(clearAuthError());
                      setBackendErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }}
                    placeholder="example@example.com"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                  />
                  {error.email && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {error.email}
                    </p>
                  )}
                  {backendErrors.email && (
                    <div className="text-red-500 text-xs mt-2 space-y-1">
                      {Array.isArray(backendErrors.email) ? (
                        backendErrors.email.map((msg, idx) => (
                          <p key={idx} className="animate-shake">
                            {msg}
                          </p>
                        ))
                      ) : (
                        <p className="animate-shake">{backendErrors.email}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Add all other form fields (username, password, confirmPassword, role) */}
                <div>
                  <label
                    htmlFor="register-username"
                    className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                  >
                    Username
                  </label>
                  <input
                    id="register-username"
                    name="register-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      toast.dismiss();
                      setUsername(e.target.value);
                      setError((prev) => ({ ...prev, username: "" }));
                      dispatch(clearAuthError());
                    }}
                    placeholder="JohnDoe"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                  />
                  {error.username && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {error.username}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="register-password"
                    className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      name="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        toast.dismiss();
                        setPassword(e.target.value);
                        setError((prev) => ({ ...prev, password: "" }));
                        dispatch(clearAuthError());
                        setBackendErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                      }}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterPassword(!showRegisterPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      tabIndex="-1"
                    >
                      <i
                        className={`fas ${showRegisterPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}
                      ></i>
                    </button>
                  </div>
                  {error.password && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {error.password}
                    </p>
                  )}
                  {backendErrors.password && (
                    <div className="text-red-500 text-xs mt-2 space-y-1">
                      {Array.isArray(backendErrors.password) ? (
                        backendErrors.password.map((msg, idx) => (
                          <p key={idx} className="animate-shake">
                            {msg}
                          </p>
                        ))
                      ) : (
                        <p className="animate-shake">
                          {backendErrors.password}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      name="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        toast.dismiss();
                        setConfirmPassword(e.target.value);
                        setError((prev) => ({
                          ...prev,
                          confirmPassword: "",
                        }));
                        dispatch(clearAuthError());
                      }}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      tabIndex="-1"
                    >
                      <i
                        className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}
                      ></i>
                    </button>
                  </div>
                  {error.confirmPassword && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {error.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="register-role"
                    className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                  >
                    Role
                  </label>
                  <select
                    id="register-role"
                    name="register-role"
                    value={role}
                    onChange={(e) => {
                      toast.dismiss();
                      setRole(e.target.value);
                      setError((prev) => ({ ...prev, role: "" }));
                      dispatch(clearAuthError());
                    }}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                  </select>
                  {error.role && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {error.role}
                    </p>
                  )}
                </div>

                {authError && !hasLocalErrors && (
                  <p className="text-red-500 text-xs font-bold animate-shake text-center">
                    {typeof authError === "string"
                      ? authError
                      : "Registration failed"}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold ${
                    isLoading
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "hover:bg-indigo-500"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i>
                      Registering...
                    </>
                  ) : (
                    "REGISTER NOW"
                  )}
                </button>
              </form>
            )}

            {registrationStep === "otp" && (
              <form onSubmit={handleOtpVerification} className="space-y-5">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
                    <i className="fas fa-envelope-open-text"></i>
                  </div>
                  <h2 className="text-2xl font-black font-poppins text-white mb-4">
                    Check Your Email
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    We've sent a 6-digit verification code to{" "}
                    <strong>{email}</strong>
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="otp-input"
                    className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block text-center"
                  >
                    Enter OTP Code
                  </label>
                  <input
                    id="otp-input"
                    name="otp-input"
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setOtpError("");
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-center text-2xl font-mono"
                  />
                  {otpError && (
                    <p className="text-red-500 text-xs mt-2 animate-shake text-center">
                      {otpError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className={`w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold ${
                    isLoading || otp.length !== 6
                      ? "bg-emerald-400 cursor-not-allowed"
                      : "hover:bg-emerald-500"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i>
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendOtpLoading}
                    className={`text-sm transition ${
                      resendOtpLoading
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {resendOtpLoading ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin mr-2"></i>
                        Sending...
                      </>
                    ) : (
                      "Didn't receive code? Resend OTP"
                    )}
                  </button>
                </div>
              </form>
            )}

            {registrationStep === "success" && (
              <div className="text-center py-10 animate-fadeIn">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2 className="text-2xl font-black font-poppins text-white mb-4">
                  Registration Successful!
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Your account has been created and verified successfully.
                </p>
                <button
                  onClick={() => {
                    // Close the modal completely - user can then click Login normally
                    onClose();
                  }}
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition"
                >
                  Go to Login
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
