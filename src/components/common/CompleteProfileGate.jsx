import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import { fetchUserProfile, logoutUser } from "../../store/slices/authSlice";
import { COUNTRIES, DIAL_CODES, joinPhone } from "../../utils/countries";
import { toastManager } from "../../utils/toastManager";

// Accounts created before contact details became compulsory are asked for
// them once, after logging in: students need their WhatsApp, country and a
// guardian with a number; teachers and parents need their WhatsApp.
const PROFILE_KEY = { student: "student_profile", teacher: "teacher_profile", parent: "parent_profile" };

const blank = (v) => !String(v ?? "").trim();

const splitPhone = (digits) => {
  const d = String(digits || "").replace(/[^\d]/g, "");
  const dial = DIAL_CODES.map((c) => c.dial).sort((a, b) => b.length - a.length).find((x) => d.startsWith(x));
  return dial ? { dial, number: d.slice(dial.length) } : { dial: "966", number: d };
};

const inputCls =
  "w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm";
const labelCls = "text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 block";

const CompleteProfileGate = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, role, profile } = useSelector((s) => s.auth);
  const key = PROFILE_KEY[role];
  const p = (profile && key && profile[key]) || null;
  const known = !!(profile && key && key in profile);

  // The stored login may predate the full profile; fetch it once.
  useEffect(() => {
    if (isLoggedIn && key && profile && !(key in profile)) dispatch(fetchUserProfile());
  }, [isLoggedIn, key, profile, dispatch]);

  const missing = useMemo(() => {
    if (!known) return [];
    const m = [];
    if (blank(p?.phone)) m.push("phone");
    if (role === "student") {
      if (blank(p?.country)) m.push("country");
      if (blank(p?.guardian_name)) m.push("guardian_name");
      if (blank(p?.guardian_phone)) m.push("guardian_phone");
    }
    return m;
  }, [known, p, role]);

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!missing.length || form) return;
    const ph = splitPhone(p?.phone);
    const gph = splitPhone(p?.guardian_phone);
    const c = COUNTRIES.find((x) => x.name === p?.country);
    setForm({
      country: p?.country || "Saudi Arabia",
      dial: p?.phone ? ph.dial : c?.dial || "966",
      phone: ph.number,
      guardian_name: p?.guardian_name || "",
      guardian_relationship: p?.guardian_relationship || "parent",
      gdial: p?.guardian_phone ? gph.dial : c?.dial || "966",
      guardian_phone: gph.number,
    });
  }, [missing, p, form]);

  if (!isLoggedIn || !key || !missing.length || !form) return null;

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const save = async (e) => {
    e.preventDefault();
    const er = {};
    if (!joinPhone(form.dial, form.phone)) er.phone = "Your WhatsApp number is required";
    if (role === "student") {
      if (!form.country) er.country = "Country is required";
      if (!form.guardian_name.trim()) er.guardian_name = "Guardian name is required";
      if (!joinPhone(form.gdial, form.guardian_phone)) er.guardian_phone = "Guardian WhatsApp number is required";
    }
    if (Object.keys(er).length) return setErrors(er);
    setSaving(true);
    try {
      const body = { phone: joinPhone(form.dial, form.phone) };
      if (role === "student") {
        Object.assign(body, {
          country: form.country,
          guardian_name: form.guardian_name.trim(),
          guardian_relationship: form.guardian_relationship,
          guardian_phone: joinPhone(form.gdial, form.guardian_phone),
        });
      }
      await axiosInstance.patch(`/auth/me/profile/${role}/`, body);
      await dispatch(fetchUserProfile());
      toastManager.success("Thank you, your details are saved.");
    } catch (err) {
      const d = err?.response?.data?.details || err?.response?.data || {};
      const fieldErrors = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]));
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: "Could not save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const dialSelect = (k) => (
    <select value={form[k]} onChange={set(k)} className={`${inputCls} !w-[105px] shrink-0`}>
      {DIAL_CODES.map((c) => (
        <option key={c.dial} value={c.dial}>+{c.dial}</option>
      ))}
    </select>
  );
  const err = (k) => errors[k] && <p className="text-red-400 text-xs mt-1.5">{errors[k]}</p>;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <form onSubmit={save} className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 text-white shadow-2xl">
        <div>
          <h2 className="text-xl font-black">Complete your details</h2>
          <p className="text-slate-400 text-sm mt-1">
            {role === "student"
              ? "The school needs a WhatsApp number for you and your guardian for class reminders and progress updates."
              : "The school needs your WhatsApp number for class reminders and updates."}
          </p>
        </div>

        {role === "student" && (
          <div>
            <label className={labelCls}>Country *</label>
            <select
              value={form.country}
              onChange={(e) => {
                const c = COUNTRIES.find((x) => x.name === e.target.value);
                setForm((f) => ({ ...f, country: e.target.value, ...(c ? { dial: c.dial, gdial: c.dial } : {}) }));
              }}
              className={inputCls}
            >
              {COUNTRIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            {err("country")}
          </div>
        )}

        <div>
          <label className={labelCls}>{role === "student" ? "Your" : "Your"} WhatsApp number *</label>
          <div className="flex gap-2">
            {dialSelect("dial")}
            <input type="tel" inputMode="numeric" value={form.phone} onChange={set("phone")} placeholder="50 123 4567" className={inputCls} />
          </div>
          {err("phone")}
        </div>

        {role === "student" && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Guardian name *</label>
                <input value={form.guardian_name} onChange={set("guardian_name")} placeholder="Parent or guardian" className={inputCls} />
                {err("guardian_name")}
              </div>
              <div>
                <label className={labelCls}>Relationship</label>
                <select value={form.guardian_relationship} onChange={set("guardian_relationship")} className={inputCls}>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="relative">Relative</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Guardian WhatsApp number *</label>
              <div className="flex gap-2">
                {dialSelect("gdial")}
                <input type="tel" inputMode="numeric" value={form.guardian_phone} onChange={set("guardian_phone")} placeholder="50 123 4567" className={inputCls} />
              </div>
              {err("guardian_phone")}
            </div>
          </div>
        )}

        {errors.form && <p className="text-red-400 text-sm">{errors.form}</p>}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button type="button" onClick={() => dispatch(logoutUser())} className="text-slate-400 hover:text-white text-sm">
            Log out
          </button>
          <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl">
            {saving ? "Saving…" : "Save and continue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompleteProfileGate;
