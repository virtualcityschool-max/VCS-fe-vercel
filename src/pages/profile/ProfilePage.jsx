import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfile } from "../../store/slices/authSlice";
import { authService } from "../../services/authService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { useFieldErrors } from "../../hooks";
import { validatePhone } from "../../utils/validation";
import PhoneInput from "../../components/ui/PhoneInput";

// ── Tiny helpers ──────────────────────────────────────────────────────────────

const ROLE_LABEL = {
  admin: "Administrator",
  teacher: "Instructor",
  student: "Student",
  parent: "Parent",
};

const ROLE_COLOR = {
  admin: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  teacher: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  student: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  parent: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const Field = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
      <i className={`fas fa-${icon} text-slate-600`} />
      {label}
      {children.props?.required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition";
const readCls  = "w-full px-4 py-3 bg-slate-800/30 border border-slate-700/40 rounded-xl text-slate-300 text-sm";

// ── Role field configs ────────────────────────────────────────────────────────

const FIELDS = {
  teacher: [
    { key: "bio",              label: "Bio",               icon: "align-left",    type: "textarea",  placeholder: "Tell students about yourself…" },
    { key: "expertise",        label: "Expertise",         icon: "star",          type: "text",      placeholder: "e.g. Mathematics, Physics" },
    { key: "experience_years", label: "Years of Experience", icon: "briefcase",   type: "number",    placeholder: "0", required: true },
    { key: "linkedin",         label: "LinkedIn URL",      icon: "linkedin",      type: "url",       placeholder: "https://linkedin.com/in/…" },
    { key: "phone",            label: "Phone",             icon: "phone",         type: "tel",       placeholder: "+1-800-5551234" },
  ],
  student: [
    { key: "grade_level",   label: "Grade Level",   icon: "graduation-cap", type: "text", placeholder: "e.g. Grade 8, A-Level" },
    { key: "phone",         label: "Phone",         icon: "phone",          type: "tel",  placeholder: "+1-800-5551234" },
    { key: "date_of_birth", label: "Date of Birth", icon: "calendar-alt",   type: "date", placeholder: "", required: true },
  ],
  parent: [
    { key: "phone",   label: "Phone",   icon: "phone",         type: "tel",  placeholder: "+1-800-5551234" },
    { key: "address", label: "Address", icon: "map-marker-alt", type: "text", placeholder: "Street, City, Country" },
  ],
};

// ── Main page ─────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { role, profile: authProfile, username } = useSelector((s) => s.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({});

  const {
    errors,
    setErrors,
    clearFieldError,
    clearAllErrors,
    getFieldError,
  } = useFieldErrors({});

  // ── Fetch full profile ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await authService.getMe();
        setProfile(data);
        initForm(data);
      } catch {
        toastManager.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getRoleProfile = (data) => {
    if (!data) return {};
    if (role === "teacher") return data.teacher_profile || {};
    if (role === "student") return data.student_profile || {};
    if (role === "parent")  return data.parent_profile  || {};
    return {};
  };

  const initForm = (data) => {
    const rp = getRoleProfile(data);
    const fields = FIELDS[role] || [];
    const initial = {};
    fields.forEach(({ key }) => { initial[key] = rp[key] ?? ""; });
    setForm(initial);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Validation
    const newErrors = {};
    if (role === "teacher" && (form.experience_years === "" || form.experience_years === null)) {
      newErrors.experience_years = "Experience years is required";
    }
    if (role === "student" && (form.date_of_birth === "" || form.date_of_birth === null)) {
      newErrors.date_of_birth = "Date of birth is required";
    } else if (form.date_of_birth && new Date(form.date_of_birth) > new Date()) {
      newErrors.date_of_birth = "Date of birth cannot be in the future";
    }
    if (form.phone !== undefined) {
      const phoneResult = validatePhone(form.phone);
      if (!phoneResult.isValid) newErrors.phone = phoneResult.error;
    }
    if (form.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(form.linkedin)) {
      newErrors.linkedin = "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toastManager.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);
    try {
      const payload = {};
      (FIELDS[role] || []).forEach(({ key, type }) => {
        const val = form[key];
        // Ensure empty values are sent as '' as requested
        if (val === "" || val === null || val === undefined) {
          payload[key] = "";
        } else {
          payload[key] = type === "number" ? Number(val) : val;
        }
      });
      await authService.updateRoleProfile(role, payload);
      toastManager.success("Profile updated successfully");
      setEditing(false);
      clearAllErrors();
      // re-fetch to reflect saved state
      const fresh = await authService.getMe();
      setProfile(fresh);
      initForm(fresh);
      dispatch(fetchUserProfile());
    } catch (err) {
      if (err.originalError?.response?.data?.details) {
        setErrors(err.originalError.response.data.details);
      } else {
        showApiError(err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    initForm(profile);
    setEditing(false);
    clearAllErrors();
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const initials = username
    ? username.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const roleProfile = getRoleProfile(profile);
  const fields = FIELDS[role] || [];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-10">
        <div className="max-w-2xl mx-auto animate-pulse space-y-6">
          <div className="h-40 bg-slate-800 rounded-3xl" />
          <div className="h-80 bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 lg:p-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Header card ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-indigo-500/20">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-white text-2xl font-black">{initials}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-black font-poppins text-white truncate">
                  {profile?.username || username}
                </h1>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${ROLE_COLOR[role]}`}>
                  {ROLE_LABEL[role]}
                </span>
              </div>
              <p className="text-slate-400 text-sm truncate">{profile?.email}</p>
              {profile?.date_joined && (
                <p className="text-slate-600 text-xs mt-1">
                  Joined {new Date(profile.date_joined).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>

            {/* Edit / Save toggle */}
            {fields.length > 0 && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition active:scale-95"
              >
                <i className="fas fa-pen text-xs" />
                Edit
              </button>
            )}
          </div>

          {/* Teacher rating pill */}
          {/* {role === "teacher" && roleProfile?.rating && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <i className="fas fa-star text-amber-400 text-xs" />
              <span className="text-amber-300 text-xs font-semibold">
                Rating: {Number(roleProfile.rating).toFixed(1)}
              </span>
            </div>
          )} */}
        </div>

        {/* ── Role profile fields ───────────────────────────────────────────── */}
        {fields.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Profile Details
            </h2>

            {fields.map(({ key, label, icon, type, placeholder, required }) => (
              <Field key={key} label={label} icon={icon}>
                <div required={required}>
                {editing ? (
                  type === "textarea" ? (
                    <textarea
                      rows={4}
                      placeholder={placeholder}
                      value={form[key] || ""}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, [key]: e.target.value }));
                        clearFieldError(key);
                      }}
                      className={`${inputCls} ${errors[key] ? "border-red-500 ring-1 ring-red-500/20" : ""}`}
                    />
                  ) : type === "tel" ? (
                    <PhoneInput
                      value={form[key] || ""}
                      onChange={(val) => {
                        setForm((p) => ({ ...p, [key]: val }));
                        clearFieldError(key);
                      }}
                      error={errors[key]}
                    />
                  ) : (
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key] || ""}
                      max={type === "date" ? new Date().toISOString().split("T")[0] : undefined}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, [key]: e.target.value }));
                        clearFieldError(key);
                      }}
                      className={`${inputCls} ${errors[key] ? "border-red-500 ring-1 ring-red-500/20" : ""}`}
                    />
                  )
                ) : (
                  <div className={readCls}>
                    {roleProfile[key] ?? <span className="text-slate-600 italic">Not set</span>}
                  </div>
                )}
                {editing && errors[key] && type !== "tel" && (
                  <p className="mt-1.5 text-[11px] text-red-400 font-medium flex items-center gap-1.5">
                    <i className="fas fa-exclamation-circle" />
                    {getFieldError(key)}
                  </p>
                )}
                </div>
              </Field>
            ))}

            {/* Action buttons */}
            {editing && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 active:scale-95"
                >
                  {saving ? (
                    <><i className="fas fa-spinner fa-spin mr-2" />Saving…</>
                  ) : (
                    <><i className="fas fa-check mr-2" />Save Changes</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Admin — read-only note */}
        {role === "admin" && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-center text-slate-500 text-sm">
            <i className="fas fa-shield-alt text-slate-600 text-2xl mb-3 block" />
            Administrator accounts are managed by the system.
          </div>
        )}

        {/* Account info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
            Account Info
          </h2>
          {[
            { icon: "envelope", label: "Email",    value: profile?.email },
            { icon: "user",     label: "Username", value: profile?.username },
            { icon: "id-badge", label: "User ID",  value: `#${profile?.id}` },
            { icon: "circle",   label: "Status",   value: profile?.is_active ? "Active" : "Inactive",
              valueClass: profile?.is_active ? "text-emerald-400" : "text-red-400" },
          ].map(({ icon, label, value, valueClass }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
              <span className="flex items-center gap-2 text-slate-400 text-sm">
                <i className={`fas fa-${icon} text-slate-600 text-xs w-4 text-center`} />
                {label}
              </span>
              <span className={`text-sm font-medium ${valueClass || "text-white"}`}>{value || "—"}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
