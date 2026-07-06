import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfile, profileUpdated } from "../../store/slices/authSlice";
import { fetchCategories } from "../../store/slices/coursesSlice";
import { authService } from "../../services/authService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { useFieldErrors } from "../../hooks";
import { validatePhone, normalizePhone, formatPhoneDisplay } from "../../utils/validation";
import PhoneInput from "../../components/ui/PhoneInput";
import FilterSelect from "../../components/ui/FilterSelect";
import { getStorageUrl } from "../../utils/storageUrl";
import DistinctionsEditor from "../../components/admin/DistinctionsEditor";
import { getDisplayName } from "../../utils/userDisplay";

// ── Tiny helpers ──────────────────────────────────────────────────────────────

const ROLE_LABEL = {
  admin: "Administrator",
  teacher: "Tutor",
  student: "Student",
  parent: "Guardian",
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

// ── Timezone options ─────────────────────────────────────────────────────────

const TIMEZONES = [
  { label: "Auto-Detected",              value: "" },
  { label: "Saudi Arabia — AST", value: "Asia/Riyadh" },
  { label: "UAE / Dubai — GST",  value: "Asia/Dubai" },
  { label: "Pakistan — PKT",     value: "Asia/Karachi" },
  { label: "London",          value: "Europe/London" },
  { label: "New York",        value: "America/New_York" },
  { label: "France",          value: "Europe/Paris" },
  { label: "Russia",          value: "Europe/Moscow" },
  { label: "Australia",       value: "Australia/Sydney" },
  { label: "Antarctica",      value: "Antarctica/McMurdo" },
  { label: "Canada",          value: "America/Toronto" },
  { label: "Denmark",         value: "Europe/Copenhagen" },
  { label: "New Zealand",     value: "Pacific/Auckland" },
];

// ── Role field configs ────────────────────────────────────────────────────────

const FIELDS = {
  teacher: [
    { key: "bio",              label: "Bio",               icon: "align-left",    type: "textarea",  placeholder: "Tell students about yourself…" },
    { key: "qualification",    label: "Qualification",     icon: "graduation-cap", type: "text",     placeholder: "e.g. MSc Computer Science, PhD Physics" },
    { key: "expertise",        label: "Expertise",         icon: "star",          type: "text",      placeholder: "e.g. Mathematics, Physics" },
    { key: "experience_years", label: "Years of Experience", icon: "briefcase",   type: "number",    placeholder: "0", required: true },
    { key: "linkedin",         label: "LinkedIn URL",      icon: "linkedin",      type: "url",       placeholder: "https://linkedin.com/in/…" },
    { key: "phone",            label: "Phone",             icon: "phone",         type: "tel",       placeholder: "+1-800-5551234" },
  ],
  student: [
    { key: "grade_level",   label: "Grade Level",   icon: "graduation-cap", type: "select" },
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
  const { categories } = useSelector((s) => s.courses);

  const avatarInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({});
  const [avatarUploading, setAvatarUploading] = useState(false);

  const {
    errors,
    setErrors,
    clearFieldError,
    clearAllErrors,
    getFieldError,
  } = useFieldErrors({});

  // ── Fetch full profile ──────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCategories());
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
  }, [dispatch]);

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
    const initial = {
      timezone: data?.timezone ?? "",
      first_name: data?.first_name ?? "",
      last_name: data?.last_name ?? "",
    };
    fields.forEach(({ key, type }) => {
      const val = rp[key] ?? "";
      initial[key] = type === "tel" && val ? normalizePhone(val) : val;
    });
    if (role === "teacher") {
      initial.distinctions = rp.distinctions ?? [];
    }
    setForm(initial);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Validation
    const newErrors = {};
    if (role !== "admin") {
      if (!form.first_name?.trim()) newErrors.first_name = "First name is required";
      if (!form.last_name?.trim()) newErrors.last_name = "Last name is required";
    }
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
      // Always save account-level fields
      const accountPayload = { timezone: form.timezone || "" };
      if (role !== "admin") {
        accountPayload.first_name = form.first_name.trim();
        accountPayload.last_name = form.last_name.trim();
      }
      await authService.updateProfile(accountPayload);

      // Save role-specific fields (not applicable for admin)
      if (role !== "admin") {
        const payload = {};
        (FIELDS[role] || []).forEach(({ key, type }) => {
          let val = form[key];
          if (type === "tel" && val) val = normalizePhone(val);
          if (val === "" || val === null || val === undefined) {
            payload[key] = "";
          } else {
            payload[key] = type === "number" ? Number(val) : val;
          }
        });
        if (role === "teacher") {
          payload.distinctions = form.distinctions ?? [];
        }
        await authService.updateRoleProfile(role, payload);
      }
      toastManager.success("Profile updated successfully");
      setEditing(false);
      clearAllErrors();
      // re-fetch to reflect saved state and sync Redux store immediately
      const fresh = await authService.getMe();
      setProfile(fresh);
      initForm(fresh);
      dispatch(profileUpdated(fresh));
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    setAvatarUploading(true);
    try {
      await authService.updateProfile(fd);
      const fresh = await authService.getMe();
      setProfile(fresh);
      dispatch(profileUpdated(fresh));
      toastManager.success("Profile photo updated");
    } catch (err) {
      showApiError(err);
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const displayName = getDisplayName(authProfile) || username;
  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const roleProfile = getRoleProfile(profile);
  const fields = FIELDS[role] || [];

  // Resolve grade_level to a category ID (handles legacy name strings too)
  const gradeLevelId = useMemo(() => {
    const raw = String(form.grade_level ?? "");
    if (!raw || !categories.length) return raw;
    if (categories.some((c) => String(c.id) === raw)) return raw;
    const byName = categories.find((c) => c.name === raw);
    return byName ? String(byName.id) : raw;
  }, [form.grade_level, categories]);

  const gradeLevelName = useMemo(() => {
    const match = categories.find((c) => String(c.id) === gradeLevelId);
    return match ? match.name : (roleProfile?.grade_level ?? null);
  }, [gradeLevelId, categories, roleProfile]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-12 pt-16 lg:pt-12">
        <div className="max-w-2xl mx-auto animate-pulse space-y-6">
          <div className="h-40 bg-slate-800 rounded-3xl" />
          <div className="h-80 bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 pt-16 lg:pt-12">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Header card ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 lg:p-8">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 overflow-hidden">
                {profile?.avatar ? (
                  <img src={getStorageUrl(profile.avatar)} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-black">{initials}</span>
                )}
              </div>

              <>
                  {/* Upload overlay — spinner while uploading, camera on hover */}
                  <button
                    type="button"
                    onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                    className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1 transition-opacity
                      ${avatarUploading
                        ? "bg-black/70 opacity-100 cursor-wait"
                        : "bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer"}`}
                  >
                    {avatarUploading
                      ? <i className="fas fa-spinner fa-spin text-white text-xl" />
                      : <i className="fas fa-camera text-white text-lg" />}
                    <span className="text-white text-[9px] font-black uppercase tracking-widest">
                      {avatarUploading ? "Uploading…" : "Change"}
                    </span>
                  </button>

                  {/* Small edit badge — visible when in editing mode */}
                  {editing && !avatarUploading && (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 border-2 border-slate-900 flex items-center justify-center transition-colors shadow-lg"
                    >
                      <i className="fas fa-pen text-white text-[8px]" />
                    </button>
                  )}

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
              </>
            </div>

            {/* Info + Edit button */}
            <div className="flex-1 min-w-0 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-black font-poppins text-white truncate">
                    {getDisplayName(profile) || displayName}
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

              {/* Edit toggle */}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="self-start flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition active:scale-95"
                >
                  <i className="fas fa-pen text-xs" />
                  Edit
                </button>
              )}
            </div>
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

        {/* ── Role profile fields + Timezone ───────────────────────────────── */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Profile Details
          </h2>

          {role !== "admin" && (
            <>
              <Field label="First Name" icon="user">
                <div required>
                  {editing ? (
                    <input
                      type="text"
                      placeholder="First Name"
                      value={form.first_name || ""}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, first_name: e.target.value }));
                        clearFieldError("first_name");
                      }}
                      className={`${inputCls} ${errors.first_name ? "border-red-500 ring-1 ring-red-500/20" : ""}`}
                    />
                  ) : (
                    <div className={readCls}>
                      {profile?.first_name || <span className="text-slate-600 italic">Not set</span>}
                    </div>
                  )}
                  {editing && errors.first_name && (
                    <p className="mt-1.5 text-[11px] text-red-400 font-medium flex items-center gap-1.5">
                      <i className="fas fa-exclamation-circle" />
                      {getFieldError("first_name")}
                    </p>
                  )}
                </div>
              </Field>

              <Field label="Last Name" icon="user">
                <div required>
                  {editing ? (
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={form.last_name || ""}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, last_name: e.target.value }));
                        clearFieldError("last_name");
                      }}
                      className={`${inputCls} ${errors.last_name ? "border-red-500 ring-1 ring-red-500/20" : ""}`}
                    />
                  ) : (
                    <div className={readCls}>
                      {profile?.last_name || <span className="text-slate-600 italic">Not set</span>}
                    </div>
                  )}
                  {editing && errors.last_name && (
                    <p className="mt-1.5 text-[11px] text-red-400 font-medium flex items-center gap-1.5">
                      <i className="fas fa-exclamation-circle" />
                      {getFieldError("last_name")}
                    </p>
                  )}
                </div>
              </Field>
            </>
          )}

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
                ) : type === "select" ? (
                  <FilterSelect
                    value={key === "grade_level" ? gradeLevelId : (form[key] || "")}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, [key]: e.target.value }));
                      clearFieldError(key);
                    }}
                    placeholder="Select level"
                    className={errors[key] ? "border-red-500" : ""}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                    ))}
                  </FilterSelect>
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
                  {type === "tel" && roleProfile[key]
                    ? formatPhoneDisplay(roleProfile[key])
                    : type === "select" && key === "grade_level"
                    ? (gradeLevelName ?? <span className="text-slate-600 italic">Not set</span>)
                    : (roleProfile[key] ?? <span className="text-slate-600 italic">Not set</span>)}
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

          {/* Timezone — shown for all roles */}
          <Field label="Timezone" icon="globe">
            <div>
              {editing ? (
                <FilterSelect
                  value={form.timezone || ""}
                  onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                  placeholder="Select timezone..."
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.value ? `${tz.label}: ${tz.value}` : `${Intl.DateTimeFormat().resolvedOptions().timeZone} (Browser)`}
                    </option>
                  ))}
                </FilterSelect>
              ) : (
                <div className={readCls}>
                  {(() => {
                    const match = TIMEZONES.find((t) => t.value === (profile?.timezone ?? ""));
                    return match?.value
                      ? `${match.label}: ${match.value}`
                      : `${Intl.DateTimeFormat().resolvedOptions().timeZone} (Browser)`;
                  })()}
                </div>
              )}
            </div>
          </Field>

          {/* Achievements & Distinctions — teachers only, inside profile card */}
          {role === "teacher" && (
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                <i className="fas fa-award text-slate-600" />
                Achievements &amp; Distinctions
              </label>
              {editing ? (
                <DistinctionsEditor
                  distinctions={form.distinctions ?? []}
                  onChange={(d) => setForm((p) => ({ ...p, distinctions: d }))}
                />
              ) : (roleProfile?.distinctions?.length ?? 0) === 0 ? (
                <p className="text-slate-600 text-sm italic">No distinctions listed.</p>
              ) : (
                <ul className="space-y-3">
                  {roleProfile.distinctions.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-award text-xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white leading-snug">{d.title}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{d.org}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Action buttons */}
          {editing && (
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition active:scale-95"
              >
                <i className="fas fa-xmark text-xs" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 active:scale-95"
              >
                {saving ? (
                  <><i className="fas fa-spinner fa-spin text-xs" /><span className="hidden sm:inline">Saving…</span></>
                ) : (
                  <><i className="fas fa-check text-xs" /><span className="hidden sm:inline">Save Changes</span></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Assigned courses — teachers only */}
        {role === "teacher" && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
              Assigned Courses
            </h2>
            {(profile?.assigned_courses?.filter((c) => c.status !== "draft").length ?? 0) === 0 ? (
              <p className="text-slate-600 text-sm italic">No courses assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {profile.assigned_courses.filter((c) => c.status !== "draft").map((course) => (
                  <div key={course.id} className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-800 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{course.course_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500">
                          {course.enrolled_students} student{course.enrolled_students === 1 ? "" : "s"}
                        </p>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          course.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : course.status === "completed"
                            ? "bg-slate-500/10 text-slate-400 border-slate-600/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        course.is_paid
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      }`}>
                        {course.is_paid ? "Paid" : "Free"}
                      </span>
                      {course.is_paid && (
                        <span className="text-xs font-semibold text-slate-300 mt-0.5">
                          ${parseFloat(course.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
