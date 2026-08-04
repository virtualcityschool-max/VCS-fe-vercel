import React, { useState } from "react";
import { toastManager } from "../../utils/toastManager";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { setAuthModal } from "../../store/slices/uiSlice";
import {
  loginUser,
  registerUser,
  clearAuthError,
  verifyOtp,
  resendOtp,
} from "../../store/slices/authSlice";
import { fetchCategories } from "../../store/slices/coursesSlice";
import { authService } from "../../services/authService";
import { normalizeApiError } from "../../utils/errorHandler";
import { useFieldErrors } from "../../hooks";
import { showApiError } from "../../utils/apiErrorHandler";
import {
  captureReferralCode,
  getStoredReferralCode,
  clearStoredReferralCode,
} from "../../utils/referral";
import { FilterSelect } from "../ui";

// Guardians identify a child by roll number (digits) or by the email the child
// registered with — same two forms the parent portal accepts after signup.
const isChildEmail  = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isChildRollNo = (v) => /^\d+$/.test(v);

const AuthModals = () => {
  const [activeRoleTab, setActiveRoleTab] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationStep, setRegistrationStep] = useState("form"); // form | otp | success
  const [otp, setOtp] = useState("");

  // Use useFieldErrors hook for consistent error management
  const {
    errors: loginErrors,
    formError: loginFormError,
    setErrors: setLoginErrors,
    handleApiError: handleLoginApiError,
    clearFieldError: clearLoginFieldError,
    clearAllErrors: clearAllLoginErrors,
  } = useFieldErrors({});

  const {
    errors: registrationErrors,
    formError: registrationFormError,
    setErrors: setRegistrationErrors,
    handleApiError: handleRegistrationApiError,
    clearFieldError: clearRegistrationFieldError,
    clearAllErrors: clearAllRegistrationErrors,
  } = useFieldErrors({});

  const [otpError, setOtpError] = useState("");

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Forgot Password state
  const [fpStep, setFpStep] = useState("idle"); // idle | request | verify | reset | success
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpResendLoading, setFpResendLoading] = useState(false);
  const [fpError, setFpError] = useState("");

  // Registration form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  // Guardian-only: the children this guardian is asking to follow.
  // { type: "roll_no" | "email", value: string }
  const [childInput, setChildInput] = useState("");
  const [childEntries, setChildEntries] = useState([]);

  const dispatch = useDispatch();
  const { authModal, enrollmentIntent } = useSelector((state) => state.ui);
  const { isLoading, resendOtpLoading, isInitialized, isLoggedIn } = useSelector((state) => state.auth);
  const { categories, categoriesLoading } = useSelector((state) => state.courses);
  const [logoutCounter, setLogoutCounter] = useState(0);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const isOpen = authModal.type;
  const intendedRole = authModal.intendedRole;
  const adminMode = authModal.adminMode;

  // Comprehensive reset function
  const resetAllStates = () => {
    // Reset form inputs
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setConfirmPassword("");
    setRole("");
    setGradeLevel("");
    setChildInput("");
    setChildEntries([]);

    // Reset role tab to default
    setActiveRoleTab("student");

    // Reset error states using the new hooks
    clearAllLoginErrors();
    clearAllRegistrationErrors();
    setOtpError("");

    // Reset OTP states
    setRegistrationStep("form");
    setOtp("");

    // Reset password visibility states
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);

    // Reset forgot password flow
    setFpStep("idle");
    setFpEmail("");
    setFpOtp("");
    setFpNewPassword("");
    setFpConfirmPassword("");
    setFpLoading(false);
    setFpResendLoading(false);
    setFpError("");

    // Clear Redux auth error
    dispatch(clearAuthError());
  };

  const onClose = () => {
    resetAllStates();
    dispatch(setAuthModal(null));
  };

  const resetLoginKey = () => {
    setLogoutCounter(prev => prev + 1);
  };

  // Reset the login form key whenever the user logs out so autofill suggestions are cleared
  const prevLoggedInRef = React.useRef(isLoggedIn);
  const justLoggedOutRef = React.useRef(false);
  React.useEffect(() => {
    if (prevLoggedInRef.current && !isLoggedIn) {
      resetLoginKey();
      justLoggedOutRef.current = true;
    }
    prevLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  // Auto-open admin login modal when URL has ?adminLogin=true (only when not already logged in)
  // Skip if the user just logged out - ProtectedRoute transiently redirects to /?adminLogin=true
  // before navigate("/") cleans the URL, which would otherwise reopen the admin modal.
  React.useEffect(() => {
    if (justLoggedOutRef.current) {
      justLoggedOutRef.current = false;
      return;
    }
    if (!isOpen && isInitialized && !isLoggedIn && searchParams.get("adminLogin") === "true") {
      dispatch(setAuthModal({ type: "login", adminMode: true }));
    }
  }, [searchParams, isOpen, isInitialized, isLoggedIn, dispatch]);

  // Referral link entry point: capture ?ref=CODE into sessionStorage, and when
  // someone lands on /signup (or /?ref=…) auto-open the register form so the
  // referral flow starts immediately. No-op for already-logged-in users. Opens
  // once per visit - closing the modal must not re-trigger it (the ref resets
  // when the user navigates away from the signup entry point).
  const signupPromptedRef = React.useRef(false);
  React.useEffect(() => {
    const hasRef = !!searchParams.get("ref");
    if (hasRef) captureReferralCode(searchParams);

    const wantsSignup = location.pathname === "/signup" || hasRef;
    if (!wantsSignup) {
      signupPromptedRef.current = false;
      return;
    }
    if (!signupPromptedRef.current && !isOpen && isInitialized && !isLoggedIn) {
      signupPromptedRef.current = true;
      dispatch(setAuthModal({ type: "register" }));
    }
  }, [searchParams, location.pathname, isOpen, isInitialized, isLoggedIn, dispatch]);

  React.useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setConfirmPassword("");
      setRole("");
      setGradeLevel("");
      setChildInput("");
      setChildEntries([]);
      setRegistrationStep("form");
      setOtp("");
      setShowLoginPassword(false);
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);
      clearAllLoginErrors();
      clearAllRegistrationErrors();
      setOtpError("");
      dispatch(clearAuthError());
      setFpStep("idle");
      setFpEmail("");
      setFpOtp("");
      setFpNewPassword("");
      setFpConfirmPassword("");
      setFpLoading(false);
      setFpResendLoading(false);
      setFpError("");

      const urlRole = searchParams.get("role");
      if (adminMode) {
        setActiveRoleTab("admin");
      } else if (intendedRole) {
        setActiveRoleTab(intendedRole);
      } else if (urlRole && ["student", "teacher", "parent"].includes(urlRole)) {
        setActiveRoleTab(urlRole);
      } else {
        setActiveRoleTab("student");
      }

      dispatch(fetchCategories());
    }
  }, [
    isOpen,
    adminMode,
    intendedRole,
    searchParams,
    dispatch,
    clearAllLoginErrors,
    clearAllRegistrationErrors,
  ]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    // Clear previous errors
    clearAllLoginErrors();

    // Basic validation
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setLoginErrors(newErrors);
      return;
    }

    try {
      const user = await dispatch(
        loginUser({
          email,
          password,
          role: activeRoleTab,
        }),
      ).unwrap();

      // Navigate to role dashboard after successful login
      const userRole = user.role || activeRoleTab;
      switch (userRole) {
        case "admin":
          navigate("/admin/overview", { replace: true });
          break;
        case "student": {
          const hireIntentId = sessionStorage.getItem("vcs_hire_intent");
          if (hireIntentId) {
            // DO NOT clear sessionStorage here - TeacherProfile.jsx reads and clears it
            navigate(`/teachers/${hireIntentId}`, { replace: true });
          } else if (enrollmentIntent) {
            navigate(`/courses/${enrollmentIntent.courseId}`, { replace: true });
          } else {
            navigate("/student", { replace: true });
          }
          break;
        }
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
      // Use the global error handler
      const normalizedError = handleLoginApiError(err, toastManager.error);

      // Only show toast for general errors, not field/form validation errors
      if (normalizedError.type === "general") {
        toastManager.error(normalizedError.message);
      }
    }
  };

  // Adds whatever is typed in the child field to the list. Returns the new
  // list so submit can accept a value the guardian never clicked "Add" on.
  const addChildEntry = (raw = childInput, { silent = false } = {}) => {
    const val = (raw || "").trim();
    if (!val) {
      if (!silent) toastManager.error("Enter your child's roll number or email");
      return childEntries;
    }

    let entry;
    if (isChildRollNo(val)) {
      entry = { type: "roll_no", value: String(parseInt(val, 10)) };
    } else if (isChildEmail(val)) {
      entry = { type: "email", value: val.toLowerCase() };
    } else {
      toastManager.error("Enter a valid roll number or email address");
      return childEntries;
    }

    if (childEntries.some((c) => c.type === entry.type && c.value === entry.value)) {
      toastManager.error(
        entry.type === "roll_no"
          ? "This roll number is already added"
          : "This email is already added",
      );
      return childEntries;
    }

    const next = [...childEntries, entry];
    setChildEntries(next);
    setChildInput("");
    clearRegistrationFieldError("student_roll_nos");
    clearRegistrationFieldError("student_emails");
    clearRegistrationFieldError("children");
    return next;
  };

  const removeChildEntry = (idx) =>
    setChildEntries((prev) => prev.filter((_, i) => i !== idx));

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    // Clear previous errors
    clearAllRegistrationErrors();

    // Basic validation
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!firstName) newErrors.first_name = "First name is required";
    else if (firstName.length < 2)
      newErrors.first_name = "First name must be at least 2 characters";

    if (!lastName) newErrors.last_name = "Last name is required";
    else if (lastName.length < 2)
      newErrors.last_name = "Last name must be at least 2 characters";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!role) newErrors.role = "Please select a role";

    if (role === "student" && !gradeLevel) newErrors.gradeLevel = "Please select a course level";

    // Guardians must name at least one child so the admin can review who the
    // request is for. A value left in the input counts - no need to press Add.
    let children = childEntries;
    if (role === "parent") {
      if (childInput.trim()) {
        children = addChildEntry(childInput);
      }
      if (children.length === 0) {
        newErrors.children =
          "Add at least one child by roll number or email";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setRegistrationErrors(newErrors);
      return;
    }

    try {
      const registerPayload = {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        confirmPassword,
        role,
      };
      if (role === "student" && gradeLevel) {
        registerPayload.grade_level = gradeLevel;
      }
      if (role === "parent") {
        registerPayload.student_roll_nos = children
          .filter((c) => c.type === "roll_no")
          .map((c) => parseInt(c.value, 10));
        registerPayload.student_emails = children
          .filter((c) => c.type === "email")
          .map((c) => c.value);
      }
      const refCode = getStoredReferralCode();
      if (refCode) {
        registerPayload.referral_code = refCode;
      }
      await dispatch(registerUser(registerPayload)).unwrap();

      // Move to OTP step - email is already in component state
      setRegistrationStep("otp");
    } catch (err) {
      // Use global error handler
      const normalizedError = handleRegistrationApiError(
        err,
        toastManager.error,
      );

      // Only show toast for general errors, not field/form validation errors
      if (normalizedError.type === "general") {
        toastManager.error(normalizedError.message);
      }
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toastManager.error("Email is required to resend OTP");
      return;
    }

    try {
      await dispatch(resendOtp(email)).unwrap();
      toastManager.success("OTP resent to your email");
    } catch (err) {
      console.error("Resend OTP failed:", err);

      // Use global error handler
      const normalizedError = normalizeApiError(err);

      // Show error as toast for resend OTP
      toastManager.error(normalizedError.message);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setOtpError("OTP is required");
      return;
    }

    setOtpError("");

    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();

      // Referral (if any) is now linked server-side - drop the captured code.
      clearStoredReferralCode();

      toastManager.success(
        "Verification successful. Your account is pending admin approval - you can login once approved."
      );

      // Update URL with role for persistence
      setSearchParams((prev) => {
        prev.set("role", role);
        return prev;
      });

      // Automatically switch to login modal with the registered role pre-selected
      dispatch(setAuthModal({ type: "login", intendedRole: role }));

      // Reset registration step for next time
      setRegistrationStep("form");
    } catch (err) {
      showApiError(err)
      console.error("OTP verification failed:", err);

      // // Use global error handler
      // const normalizedError = normalizeApiError(err);

      // // For OTP errors, always show them inline (not as toast)
      // if (normalizedError.type === "field" || normalizedError.type === "form") {
      //   setOtpError(normalizedError.message);
      // } else {
      //   // General errors can be shown as toast
      //   toastManager.error(normalizedError.message);
      //   setOtpError("Verification failed. Please try again.");
      // }
    }
  };

  const handleFpRequestOtp = async (e) => {
    e.preventDefault();
    if (!fpEmail.trim()) { setFpError("Email is required"); return; }
    setFpError("");
    setFpLoading(true);
    try {
      await authService.forgotPasswordRequestOtp(fpEmail.trim());
      setFpStep("verify");
    } catch (err) {
      showApiError(err);
    } finally {
      setFpLoading(false);
    }
  };

  const handleFpResendOtp = async () => {
    if (!fpEmail.trim()) return;
    setFpResendLoading(true);
    setFpError("");
    try {
      await authService.forgotPasswordRequestOtp(fpEmail.trim());
      toastManager.success("Reset code resent to your email");
      setFpOtp("");
    } catch (err) {
      showApiError(err);
    } finally {
      setFpResendLoading(false);
    }
  };

  const handleFpVerifyOtp = async (e) => {
    e.preventDefault();
    if (!fpOtp.trim()) { setFpError("OTP is required"); return; }
    setFpError("");
    setFpLoading(true);
    try {
      await authService.forgotPasswordVerifyOtp(fpEmail.trim(), fpOtp.trim());
      setFpStep("reset");
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.otp?.[0] || err?.message || "Invalid OTP";
      setFpError(msg);
    } finally {
      setFpLoading(false);
    }
  };

  const handleFpReset = async (e) => {
    e.preventDefault();
    if (!fpNewPassword) { setFpError("New password is required"); return; }
    if (fpNewPassword !== fpConfirmPassword) { setFpError("Passwords do not match"); return; }
    setFpError("");
    setFpLoading(true);
    try {
      await authService.forgotPasswordReset(fpEmail.trim(), fpNewPassword, fpConfirmPassword);
      setFpStep("success");
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.detail || typeof data?.new_password === 'string' ? data.new_password : data?.new_password?.[0] || data?.confirm_password?.[0] || err?.message || "Failed to reset password";
      setFpError(msg);
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`bg-slate-900 border border-white/10 w-full ${isOpen === "register" && registrationStep === "form" ? "max-w-3xl" : "max-w-md"} rounded-[2.5rem] shadow-2xl overflow-hidden glass relative flex flex-col max-h-[90vh] animate-scaleIn`} key={`login-session-${logoutCounter}`}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 text-slate-500 hover:text-white transition"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {isOpen === "login" ? (
          <div className="p-6 sm:p-8 relative overflow-y-auto flex-1 scrollbar-hide">
            <div className="flex flex-col items-center mb-6">
              <img src="/assets/logo.png" alt="Virtual City School" className="h-12 sm:h-14 object-contain mb-4" />
              <h2 className="text-xl sm:text-2xl font-black font-poppins text-white text-center uppercase tracking-[0.15em]">
                {adminMode ? "Admin Login" : "Secure Login"}
              </h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">
                {adminMode ? "Admin portal access only" : "Access your learning terminal"}
              </p>
            </div>

            {!adminMode && (
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 mb-6">
                {[
                  { value: "student", label: "Student" },
                  { value: "teacher", label: "Tutor"   },
                  { value: "parent",  label: "Guardian" },
                ].map(({ value: roleOption, label: roleLabel }) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => {
                      setEmail("");
                      setPassword("");
                      setShowLoginPassword(false);
                      clearAllLoginErrors();
                      dispatch(clearAuthError());
                      setActiveRoleTab(roleOption);
                      setSearchParams((prev) => {
                        prev.set("role", roleOption);
                        return prev;
                      });
                    }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeRoleTab === roleOption
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {roleLabel}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
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
                  autoComplete="off"
                  value={email}
                  onChange={(e) => {
                    toastManager.dismiss();
                    setEmail(e.target.value);
                    clearLoginFieldError("email");
                    dispatch(clearAuthError());
                  }}
                  placeholder="e.g. user@email.com"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                />
                {loginErrors.email && (
                  <p className="text-red-500 text-xs mt-2 animate-shake">
                    {loginErrors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="login-password"
                    className="text-[10px] font-black uppercase text-slate-500 tracking-widest block"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setFpStep("request"); setFpEmail(email); setFpError(""); }}
                    className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition tracking-widest"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    name="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      toastManager.dismiss();
                      setPassword(e.target.value);
                      clearLoginFieldError("password");
                      dispatch(clearAuthError());
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-3.5 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
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
                {loginErrors.password && (
                  <p className="text-red-500 text-xs mt-2 animate-shake">
                    {Array.isArray(loginErrors.password)
                      ? loginErrors.password[0]
                      : loginErrors.password}
                  </p>
                )}
              </div>

              {loginFormError && (
                <p className="text-red-500 text-xs font-bold animate-shake text-center">
                  {loginFormError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "LOGIN"
                )}
              </button>

              <div className="text-center mt-6">
                <p className="text-slate-500 text-xs">
                  Don't have an account with any role?{" "}
                  <button
                    type="button"
                    onClick={() => dispatch(setAuthModal({ type: "register" }))}
                    className="text-indigo-400 hover:text-indigo-300 font-bold transition"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>

            {fpStep !== "idle" && (
              <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] flex flex-col p-6 sm:p-8 z-10 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => { setFpStep("idle"); setFpError(""); setFpOtp(""); setFpNewPassword(""); setFpConfirmPassword(""); }}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-xs mb-6 transition"
                >
                  <i className="fas fa-arrow-left text-[10px]" />
                  Back to Login
                </button>

                {fpStep === "request" && (
                  <form onSubmit={handleFpRequestOtp} className="space-y-5 flex-1">
                    <div className="text-center mb-6 flex flex-col items-center">
                      <img src="/assets/logo.png" alt="Virtual City School" className="h-10 sm:h-12 object-contain mb-8" />
                      <h2 className="text-xl font-black font-poppins text-white mb-1">Forgot Password</h2>
                      <p className="text-slate-400 text-xs">Enter your email to receive a reset code</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Email</label>
                      <input
                        type="email"
                        value={fpEmail}
                        onChange={(e) => { setFpEmail(e.target.value); setFpError(""); }}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                      />
                    </div>
                    {fpError && <p className="text-red-500 text-xs animate-shake">{fpError}</p>}
                    <button
                      type="submit"
                      disabled={fpLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white py-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2"
                    >
                      {fpLoading && <i className="fas fa-circle-notch fa-spin" />}
                      {fpLoading ? "Sending…" : "Send Reset Code"}
                    </button>
                  </form>
                )}

                {fpStep === "verify" && (
                  <form onSubmit={handleFpVerifyOtp} className="space-y-5 flex-1">
                    <div className="text-center mb-6 flex flex-col items-center">
                      <img src="/assets/logo.png" alt="Virtual City School" className="h-10 sm:h-12 object-contain mb-8" />
                      <h2 className="text-xl font-black font-poppins text-white mb-1">Check Your Email</h2>
                      <p className="text-slate-400 text-xs">Enter the 6-digit code sent to <strong className="text-slate-300">{fpEmail}</strong></p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block text-center">Reset Code</label>
                      <input
                        type="text"
                        value={fpOtp}
                        onChange={(e) => { setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setFpError(""); }}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-center text-2xl font-mono"
                      />
                    </div>
                    {fpError && <p className="text-red-500 text-xs animate-shake text-center">{fpError}</p>}
                    <button
                      type="submit"
                      disabled={fpLoading || fpOtp.length !== 6}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white py-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2"
                    >
                      {fpLoading && <i className="fas fa-circle-notch fa-spin" />}
                      {fpLoading ? "Verifying…" : "Verify Code"}
                    </button>

                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-slate-400 font-medium">
                        Didn't receive code?{" "}
                        <button
                          type="button"
                          onClick={handleFpResendOtp}
                          disabled={fpResendLoading}
                          className="text-indigo-400 font-black hover:text-indigo-300 ml-1 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
                        >
                          {fpResendLoading ? (
                            <i className="fas fa-circle-notch fa-spin" />
                          ) : (
                            "Resend OTP"
                          )}
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {fpStep === "reset" && (
                  <form onSubmit={handleFpReset} className="space-y-5 flex-1">
                    <div className="text-center mb-6 flex flex-col items-center">
                      <img src="/assets/logo.png" alt="Virtual City School" className="h-10 sm:h-12 object-contain mb-8" />
                      <div className="w-16 h-16 bg-amber-500/20 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-4">
                        <i className="fas fa-key text-amber-400" />
                      </div>
                      <h2 className="text-xl font-black font-poppins text-white mb-1">New Password</h2>
                      <p className="text-slate-400 text-xs">Choose a strong password for your account</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={fpNewPassword}
                          onChange={(e) => { setFpNewPassword(e.target.value); setFpError(""); }}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition" tabIndex="-1">
                          <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmNewPassword ? "text" : "password"}
                          value={fpConfirmPassword}
                          onChange={(e) => { setFpConfirmPassword(e.target.value); setFpError(""); }}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                        />
                        <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition" tabIndex="-1">
                          <i className={`fas ${showConfirmNewPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                        </button>
                      </div>
                    </div>
                    {fpError && <p className="text-red-500 text-xs animate-shake">{fpError}</p>}
                    <button
                      type="submit"
                      disabled={fpLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white py-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2"
                    >
                      {fpLoading && <i className="fas fa-circle-notch fa-spin" />}
                      {fpLoading ? "Resetting…" : "Reset Password"}
                    </button>
                  </form>
                )}

                {fpStep === "success" && (
                  <div className="flex flex-col items-center justify-center flex-1 text-center animate-fadeIn">
                    <img src="/assets/logo.png" alt="Virtual City School" className="h-10 sm:h-12 object-contain mb-8" />
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-2xl mb-6">
                      <i className="fas fa-check-circle text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-black font-poppins text-white mb-2">Password Reset!</h2>
                    <p className="text-slate-400 text-sm mb-8">Your password has been updated. You can now log in.</p>
                    <button
                      type="button"
                      onClick={() => { setFpStep("idle"); setFpEmail(""); setFpOtp(""); setFpNewPassword(""); setFpConfirmPassword(""); setFpError(""); }}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition"
                    >
                      Back to Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-10 overflow-y-auto flex-1">
            {registrationStep === "form" && (
              <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex flex-col items-center mb-8">
                  <img src="/assets/logo.png" alt="Virtual City School" className="h-12 sm:h-14 object-contain mb-6" />
                  <h2 className="text-xl sm:text-2xl font-black font-poppins text-white text-center uppercase tracking-[0.15em]">
                    Create Account
                  </h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                    Join the Virtual City School terminal
                  </p>
                </div>
                
                {/* Add all other form fields (first/last name, password, confirmPassword, role) */}
                <div>
                  <label
                    htmlFor="register-first-name"
                    className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                  >
                    First Name
                  </label>
                  <input
                    id="register-first-name"
                    name="register-first-name"
                    type="text"
                    autoComplete="off"
                    value={firstName}
                    onChange={(e) => {
                      toastManager.dismiss();
                      setFirstName(e.target.value);
                      clearRegistrationFieldError("first_name");
                      dispatch(clearAuthError());
                    }}
                    placeholder="John"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                  />
                  {registrationErrors.first_name && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {Array.isArray(registrationErrors.first_name)
                        ? registrationErrors.first_name[0]
                        : registrationErrors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="register-last-name"
                    className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                  >
                    Last Name
                  </label>
                  <input
                    id="register-last-name"
                    name="register-last-name"
                    type="text"
                    autoComplete="off"
                    value={lastName}
                    onChange={(e) => {
                      toastManager.dismiss();
                      setLastName(e.target.value);
                      clearRegistrationFieldError("last_name");
                      dispatch(clearAuthError());
                    }}
                    placeholder="Doe"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                  />
                  {registrationErrors.last_name && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {Array.isArray(registrationErrors.last_name)
                        ? registrationErrors.last_name[0]
                        : registrationErrors.last_name}
                    </p>
                  )}
                </div>

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
                    autoComplete="off"
                    value={email}
                    onChange={(e) => {
                      toastManager.dismiss();
                      setEmail(e.target.value);
                      clearRegistrationFieldError("email");
                      dispatch(clearAuthError());
                    }}
                    placeholder="example@example.com"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                  />
                  {registrationErrors.email && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {Array.isArray(registrationErrors.email)
                        ? registrationErrors.email[0]
                        : registrationErrors.email}
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
                  <FilterSelect
                    id="register-role"
                    value={role}
                    onChange={(e) => {
                      toastManager.dismiss();
                      setRole(e.target.value);
                      setGradeLevel("");
                      // Child links only apply to guardians
                      if (e.target.value !== "parent") {
                        setChildInput("");
                        setChildEntries([]);
                      }
                      clearRegistrationFieldError("role");
                      clearRegistrationFieldError("children");
                      dispatch(clearAuthError());
                    }}
                    placeholder="Select Role"
                    className="w-full !bg-slate-950 !border-white/5 !rounded-2xl !px-6 !py-4 focus:ring-2 focus:ring-indigo-500 text-white text-sm"
                  >
                    <option value="teacher">Tutor</option>
                    <option value="student">Student</option>
                    <option value="parent">Guardian</option>
                  </FilterSelect>
                  {registrationErrors.role && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {Array.isArray(registrationErrors.role)
                        ? registrationErrors.role[0]
                        : registrationErrors.role}
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
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        toastManager.dismiss();
                        setPassword(e.target.value);
                        clearRegistrationFieldError("password");
                        dispatch(clearAuthError());
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
                  {registrationErrors.password && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {Array.isArray(registrationErrors.password)
                        ? registrationErrors.password[0]
                        : registrationErrors.password}
                    </p>
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
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        toastManager.dismiss();
                        setConfirmPassword(e.target.value);
                        clearRegistrationFieldError("confirmPassword");
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
                  {registrationErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-2 animate-shake">
                      {Array.isArray(registrationErrors.confirmPassword)
                        ? registrationErrors.confirmPassword[0]
                        : registrationErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Password Strength Indicator - Full Width */}
                {password && (
                  <div className="md:col-span-2 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-3 font-medium">
                      Password must contain:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                      <div
                        className={`flex items-center gap-2 text-xs ${password.length >= 8 ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${password.length >= 8 ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        At least 8 characters
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(password) ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${/[A-Z]/.test(password) ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        One uppercase letter
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs ${/[a-z]/.test(password) ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${/[a-z]/.test(password) ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        One lowercase letter
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs ${/[0-9]/.test(password) ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${/[0-9]/.test(password) ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        One number
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs ${/[!@#$%^&*()_+=[\]{};':"|,.<>/?]/.test(password) ? "text-green-400" : "text-slate-500"}`}
                      >
                        <i
                          className={`fas ${/[!@#$%^&*()_+=[\]{};':"|,.<>/?]/.test(password) ? "fa-check-circle" : "fa-circle"} text-[8px]`}
                        ></i>
                        One special character
                      </div>
                    </div>
                  </div>
                )}

                {role === "student" && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">
                      Grade Level <span className="text-red-500">*</span>
                    </label>
                    <FilterSelect
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      placeholder={categoriesLoading ? "Loading levels…" : "Select course level"}
                      disabled={categoriesLoading}
                      className="w-full !bg-slate-950 !border-white/5 !rounded-2xl !px-6 !py-4 focus:ring-2 focus:ring-indigo-500 text-white text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                      ))}
                    </FilterSelect>
                    {registrationErrors.gradeLevel && (
                      <p className="text-red-500 text-xs mt-2 animate-shake">
                        {Array.isArray(registrationErrors.gradeLevel)
                          ? registrationErrors.gradeLevel[0]
                          : registrationErrors.gradeLevel}
                      </p>
                    )}
                  </div>
                )}

                {role === "parent" && (
                  <div className="md:col-span-2 bg-slate-950/60 border border-white/5 rounded-2xl p-5">
                    <label
                      htmlFor="register-child"
                      className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block"
                    >
                      Your Child's Roll Number or Email <span className="text-red-500">*</span>
                    </label>
                    <p className="text-slate-500 text-[11px] mb-3 leading-relaxed">
                      Add each child you want access to. Ask your child for the
                      roll number or the email they registered with. The
                      administrator reviews these before approving your account.
                    </p>

                    <div className="flex gap-2">
                      <input
                        id="register-child"
                        name="register-child"
                        type="text"
                        autoComplete="off"
                        value={childInput}
                        onChange={(e) => {
                          toastManager.dismiss();
                          setChildInput(e.target.value);
                          clearRegistrationFieldError("children");
                          clearRegistrationFieldError("student_roll_nos");
                          clearRegistrationFieldError("student_emails");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addChildEntry();
                          }
                        }}
                        placeholder="e.g. 42  or  student@email.com"
                        className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => addChildEntry()}
                        className="px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 shrink-0"
                      >
                        <i className="fas fa-plus text-[10px]"></i>
                        Add
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="w-4 h-4 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                          <i className="fas fa-hashtag text-indigo-400 text-[8px]"></i>
                        </span>
                        Numbers are read as a roll number
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="w-4 h-4 rounded bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                          <i className="fas fa-at text-emerald-400 text-[8px]"></i>
                        </span>
                        Anything with @ is read as an email
                      </span>
                    </div>

                    {childEntries.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                          Children to link
                          <span className="ml-2 text-slate-600 font-bold normal-case tracking-normal">
                            {childEntries.length} added
                          </span>
                        </p>
                        {childEntries.map((entry, idx) => (
                          <div
                            key={`${entry.type}-${entry.value}`}
                            className="flex items-center justify-between bg-slate-900/70 border border-white/5 rounded-xl px-4 py-2.5"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  entry.type === "roll_no"
                                    ? "bg-indigo-600/20 border border-indigo-500/30"
                                    : "bg-emerald-600/20 border border-emerald-500/30"
                                }`}
                              >
                                <i
                                  className={`fas text-[10px] ${
                                    entry.type === "roll_no"
                                      ? "fa-hashtag text-indigo-400"
                                      : "fa-at text-emerald-400"
                                  }`}
                                ></i>
                              </div>
                              <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {entry.value}
                                </p>
                                <p
                                  className={`text-[9px] uppercase tracking-widest font-black ${
                                    entry.type === "roll_no"
                                      ? "text-indigo-500"
                                      : "text-emerald-500"
                                  }`}
                                >
                                  {entry.type === "roll_no" ? "Roll Number" : "Email"}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeChildEntry(idx)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                              title="Remove"
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {[
                      registrationErrors.children,
                      registrationErrors.student_roll_nos,
                      registrationErrors.student_emails,
                    ]
                      .filter(Boolean)
                      .map((err, i) => (
                        <p key={i} className="text-red-500 text-xs mt-2 animate-shake">
                          {Array.isArray(err) ? err[0] : err}
                        </p>
                      ))}
                  </div>
                )}

                {registrationFormError && (
                  <div className="md:col-span-2">
                    <p className="text-red-500 text-xs font-bold animate-shake text-center">
                      {registrationFormError}
                    </p>
                  </div>
                )}
 
                <div className="md:col-span-2">
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
                      <div className="flex items-center justify-center gap-2">
                        <i className="fas fa-circle-notch fa-spin"></i>
                        <span>Registering...</span>
                      </div>
                    ) : (
                      "REGISTER NOW"
                    )}
                  </button>
                </div>

                <div className="md:col-span-2 text-center mt-4">
                  <p className="text-slate-500 text-xs">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => dispatch(setAuthModal({ type: "login" }))}
                      className="text-indigo-400 hover:text-indigo-300 font-bold transition"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            )}

            {registrationStep === "otp" && (
              <form onSubmit={handleOtpVerification} className="space-y-5">
                <div className="text-center mb-8 flex flex-col items-center">
                  <img src="/assets/logo.png" alt="Virtual City School" className="h-10 sm:h-12 object-contain mb-8" />
                  <h2 className="text-xl font-black font-poppins text-white mb-2">
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
                  className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold ${
                    isLoading || otp.length !== 6
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "hover:bg-indigo-500"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <i className="fas fa-circle-notch fa-spin"></i>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <div className="text-center">
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    Didn't receive code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendOtpLoading}
                      className={`text-indigo-400 font-black hover:text-indigo-300 ml-1 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed`}
                    >
                      {resendOtpLoading ? (
                        <i className="fas fa-circle-notch fa-spin"></i>
                      ) : (
                        "Resend OTP"
                      )}
                    </button>
                  </p>
                </div>
              </form>
            )}

            {registrationStep === "success" && (
              <div className="text-center py-10 animate-fadeIn flex flex-col items-center">
                <img src="/assets/logo.png" alt="Virtual City School" className="h-10 sm:h-12 object-contain mb-10" />
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-6">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2 className="text-2xl font-black font-poppins text-white mb-4">
                  Registration Successful!
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Your account has been verified and is pending admin approval. You will be notified via email once approved.
                </p>
                {/* <button
                  onClick={() => {
                    // Close the modal completely - user can then click Login normally
                    onClose();
                  }}
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition"
                >
                  {activeRoleTab=="student"?"Go to Login" :""}
                </button> */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModals;
