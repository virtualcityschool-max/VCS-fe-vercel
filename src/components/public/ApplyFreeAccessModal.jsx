import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCourses } from "../../store/slices/coursesSlice";
import { freeAccessService } from "../../services/freeAccessService";
import { useAuth } from "../../hooks/useAuth";
import { MultiSelect } from "../ui";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { COUNTRIES } from "../../utils/countries";

/**
 * Shared "Apply for Free Access" form. Used from the public landing page and
 * from the student portal. For a logged-in student the email is prefilled and
 * locked to their account address.
 */
const ApplyFreeAccessModal = ({ onClose, preselectedCourseIds = [] }) => {
  const dispatch = useDispatch();
  const { isLoggedIn, isStudent, email: authEmail, displayName } = useAuth();

  const coursesState = useSelector((s) => s.courses);
  const allCourses = coursesState?.courses || [];

  const lockEmail = isLoggedIn && isStudent && !!authEmail;

  const [form, setForm] = useState({
    full_name: lockEmail && displayName && displayName !== "User" ? displayName : "",
    email: lockEmail ? authEmail : "",
    country: "",
    occupation: "",
    eligibility_statement: "",
    goals_statement: "",
  });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [prefilled, setPrefilled] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Ensure the course list is available for the multi-select.
  useEffect(() => {
    if (!allCourses.length) dispatch(fetchAllCourses());
  }, [dispatch, allCourses.length]);

  // Only published courses can be applied for (defensive; API also filters).
  const courseOptions = useMemo(
    () => allCourses.filter((c) => !c.status || c.status === "published"),
    [allCourses],
  );

  // Pre-select the course the user launched this from (e.g. "Enroll Now" popup).
  // Runs once, after the course list loads; the user can still add/remove after.
  useEffect(() => {
    if (prefilled || !preselectedCourseIds.length || !courseOptions.length) return;
    const matches = courseOptions.filter((c) => preselectedCourseIds.includes(c.id));
    if (matches.length) {
      setSelectedCourses(matches);
      setPrefilled(true);
    }
  }, [courseOptions, preselectedCourseIds, prefilled]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address";
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.eligibility_statement.trim())
      e.eligibility_statement = "Please tell us why you're eligible";
    if (!form.goals_statement.trim())
      e.goals_statement = "Please share how this will help your goals";
    if (!selectedCourses.length) e.courses = "Select at least one course";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await freeAccessService.apply({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        country: form.country.trim(),
        occupation: form.occupation.trim() || undefined,
        eligibility_statement: form.eligibility_statement.trim(),
        goals_statement: form.goals_statement.trim(),
        course_ids: selectedCourses.map((c) => c.id),
      });
      toastManager.success("Application submitted!");
      setDone(true);
    } catch (err) {
      showApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "w-full bg-slate-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition";
  const border = (field) => (errors[field] ? "border-rose-500" : "border-slate-700");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        {done ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
              <i className="fas fa-check text-emerald-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Application received</h3>
            <p className="text-sm text-slate-400 mb-6">
              Thank you! Our admissions team will review your request and email you the
              outcome. If approved, your courses will appear in your enrolled courses.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between p-6 pb-3 sticky top-0 bg-slate-900 z-10 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Apply for Free Access</h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                  Learners who need financial assistance can request free access. Tell us a
                  little about yourself and the courses you'd like to study.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition ml-3"
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className={`${inputBase} ${border("full_name")}`}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-rose-400 mt-1">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={lockEmail}
                    placeholder="jane@example.com"
                    className={`${inputBase} ${border("email")} ${
                      lockEmail ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  />
                  {lockEmail && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Using your account email.
                    </p>
                  )}
                  {errors.email && (
                    <p className="text-xs text-rose-400 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Country <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className={`${inputBase} ${border("country")} ${
                      form.country ? "" : "text-slate-500"
                    }`}
                  >
                    <option value="" disabled>
                      Select country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="text-white bg-slate-800">
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-xs text-rose-400 mt-1">{errors.country}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Occupation{" "}
                    <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={form.occupation}
                    onChange={handleChange}
                    placeholder="Student, teacher, developer…"
                    className={`${inputBase} border-slate-700`}
                  />
                </div>

                <div>
                  <MultiSelect
                    label="Courses of Interest *"
                    options={courseOptions}
                    value={selectedCourses}
                    onChange={(v) => {
                      setSelectedCourses(v);
                      if (errors.courses) setErrors((p) => ({ ...p, courses: undefined }));
                    }}
                    displayField="title"
                    searchField="title"
                    placeholder="Select one or more courses"
                    searchPlaceholder="Search courses…"
                    loading={coursesState?.loading}
                    emptyMessage="No courses available"
                    error={errors.courses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    What makes you eligible for free access?{" "}
                    <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    name="eligibility_statement"
                    value={form.eligibility_statement}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Share your circumstances and why you need financial assistance…"
                    className={`${inputBase} ${border("eligibility_statement")} resize-none`}
                  />
                  {errors.eligibility_statement && (
                    <p className="text-xs text-rose-400 mt-1">
                      {errors.eligibility_statement}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    How will this course help you achieve your goals?{" "}
                    <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    name="goals_statement"
                    value={form.goals_statement}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about your goals and how these courses fit in…"
                    className={`${inputBase} ${border("goals_statement")} resize-none`}
                  />
                  {errors.goals_statement && (
                    <p className="text-xs text-rose-400 mt-1">{errors.goals_statement}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner fa-spin text-xs"></i> Submitting…
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplyFreeAccessModal;
