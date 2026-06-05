import React, { useEffect, useState } from "react";
import { aboutService } from "../../services/aboutService";
import { toastManager } from "../../utils/toastManager";

const BLANK = {
  vision: "", mission: "", about: "",
  contact_whatsapp: "", contact_phone: "", contact_email: "", contact_address: "",
  social_facebook: "", social_instagram: "", social_twitter: "",
  social_linkedin: "", social_youtube: "",
};

const Field = ({ label, name, value, onChange, multiline = false, type = "text", hint }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
    {multiline ? (
      <textarea
        name={name} value={value} onChange={onChange} rows={4}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none transition"
        placeholder={`Enter ${label.toLowerCase()}…`}
      />
    ) : (
      <input
        type={type} name={name} value={value} onChange={onChange}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
        placeholder={`Enter ${label.toLowerCase()}…`}
      />
    )}
    {hint && <p className="text-[10px] text-slate-600 mt-1">{hint}</p>}
  </div>
);

const AdminAboutPage = () => {
  const [form, setForm]       = useState(BLANK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    aboutService.get()
      .then(d => setForm({ ...BLANK, ...d }))
      .catch(() => toastManager.error("Failed to load About page data"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await aboutService.update(form);
      toastManager.success("About page updated successfully.");
    } catch {
      toastManager.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-600">
        <i className="fas fa-spinner fa-spin text-2xl" />
      </div>
    );
  }

  return (
    <div className="text-white space-y-10 pb-16 animate-fadeIn">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black font-poppins tracking-tight">About Us — CMS</h1>
        <p className="text-slate-500 text-sm mt-1">All fields here populate the public /about page. Changes are live immediately after saving.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Vision */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 text-xs">
              <i className="fas fa-eye" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Vision</h2>
          </div>
          <Field label="Vision Statement" name="vision" value={form.vision} onChange={handleChange} multiline />
        </div>

        {/* Mission */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-violet-500/10 rounded-lg flex items-center justify-center text-violet-400 text-xs">
              <i className="fas fa-bullseye" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Mission</h2>
          </div>
          <Field label="Mission Statement" name="mission" value={form.mission} onChange={handleChange} multiline />
        </div>

        {/* About — full width */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 text-xs">
              <i className="fas fa-info-circle" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">About VCS</h2>
          </div>
          <Field label="Institutional Description" name="about" value={form.about} onChange={handleChange} multiline />
        </div>

        {/* Contact */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 text-xs">
              <i className="fas fa-envelope" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Contact Details</h2>
          </div>
          <Field label="WhatsApp Number" name="contact_whatsapp" value={form.contact_whatsapp} onChange={handleChange} hint="Include country code, e.g. +971501234567" />
          <Field label="Phone Number" name="contact_phone" value={form.contact_phone} onChange={handleChange} />
          <Field label="Email Address" name="contact_email" value={form.contact_email} onChange={handleChange} type="email" />
          <Field label="Office Address" name="contact_address" value={form.contact_address} onChange={handleChange} multiline />
        </div>

        {/* Social */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-400 text-xs">
              <i className="fas fa-share-alt" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Social Media Links</h2>
          </div>
          {[
            { label: "Facebook URL",  name: "social_facebook"  },
            { label: "Instagram URL", name: "social_instagram" },
            { label: "X (Twitter) URL", name: "social_twitter"  },
            { label: "LinkedIn URL",  name: "social_linkedin"  },
            { label: "YouTube URL",   name: "social_youtube"   },
          ].map(({ label, name }) => (
            <Field key={name} label={label} name={name} value={form[name]} onChange={handleChange} type="url" hint="Full URL, e.g. https://instagram.com/vcs" />
          ))}
        </div>
      </div>

      {/* Save bottom */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-900/30 active:scale-95"
        >
          {saving ? <><i className="fas fa-spinner fa-spin text-xs" />Saving…</> : <><i className="fas fa-save text-xs" />Save All Changes</>}
        </button>
      </div>
    </div>
  );
};

export default AdminAboutPage;
