import React, { useEffect, useState } from "react";
import { aboutService } from "../../services/aboutService";
import { useSeo } from "../../hooks/useSeo";

const SOCIAL = [
  { key: "social_facebook", icon: "fab fa-facebook-f", label: "Facebook" },
  { key: "social_instagram", icon: "fab fa-instagram", label: "Instagram" },
  { key: "social_twitter", icon: "fab fa-x-twitter", label: "X" },
  { key: "social_linkedin", icon: "fab fa-linkedin-in", label: "LinkedIn" },
  { key: "social_youtube", icon: "fab fa-youtube", label: "YouTube" },
];

const STATS = [
  { num: "O · AS · A2", lbl: "Cambridge Levels" },
  { num: "Grade 5-12", lbl: "Full Curricula" },
  { num: "7", lbl: "Countries Served" },
  { num: "Live", lbl: "Interactive Classes" },
];

const AboutPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aboutService
      .get()
      .then(setData)
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  useSeo({
    title: "About Us",
    description:
      "Learn about Virtual City School's vision, mission and story - the online Cambridge school offering O Level, AS Level and A2 Level programmes alongside Grade 5-12 curricula, for students across the UAE, Saudi Arabia, Qatar and Pakistan.",
    url: typeof window !== "undefined" ? window.location.href : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-indigo-400 text-2xl" />
      </div>
    );
  }

  const hasSocial = SOCIAL.some((s) => data?.[s.key]);
  const hasContact =
    data?.contact_whatsapp ||
    data?.contact_phone ||
    data?.contact_email ||
    data?.contact_address;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.28),transparent_70%)]" />
        <div className="absolute -top-24 left-[6%] w-80 h-80 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-28 right-[8%] w-72 h-72 bg-violet-500/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 pt-20 sm:pt-24 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-black uppercase tracking-widest mb-6">
            <i className="fas fa-school text-[10px]" />
            Virtual City School
          </div>
          <h1
            className="italic font-semibold text-4xl sm:text-5xl md:text-6xl leading-tight text-white text-balance"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Geography should never decide who gets a{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              world-class education.
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mt-6">
            That belief is the whole reason VCS exists — here's the vision, mission and story behind it.
          </p>
        </div>
        <div className="relative flex flex-wrap justify-center max-w-3xl mx-auto pb-12 px-6">
          {STATS.map((s, i) => (
            <div
              key={s.lbl}
              className={`flex-1 min-w-[140px] px-6 ${i !== 0 ? "border-l border-white/10" : ""}`}
            >
              <div className="font-black text-xl sm:text-2xl text-white">{s.num}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                {s.lbl}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20 space-y-6">
        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative overflow-hidden bg-[#131c31]/60 backdrop-blur-xl border border-white/5 rounded-[20px] p-8">
            <div className="absolute w-52 h-52 bg-indigo-500 rounded-full blur-[60px] opacity-40 -top-14 -right-14 pointer-events-none" />
            <div className="relative w-12 h-12 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-300 mb-5">
              <i className="fas fa-eye text-lg" />
            </div>
            <h2 className="relative text-xl font-black text-white mb-3">Our Vision</h2>
            <p className="relative text-slate-400 text-sm leading-relaxed">
              {data?.vision || "Our vision statement will appear here."}
            </p>
          </div>
          <div className="relative overflow-hidden bg-[#131c31]/60 backdrop-blur-xl border border-white/5 rounded-[20px] p-8">
            <div className="absolute w-52 h-52 bg-violet-500 rounded-full blur-[60px] opacity-40 -top-14 -right-14 pointer-events-none" />
            <div className="relative w-12 h-12 bg-violet-500/15 border border-violet-500/30 rounded-2xl flex items-center justify-center text-violet-300 mb-5">
              <i className="fas fa-bullseye text-lg" />
            </div>
            <h2 className="relative text-xl font-black text-white mb-3">Our Mission</h2>
            <p className="relative text-slate-400 text-sm leading-relaxed">
              {data?.mission || "Our mission statement will appear here."}
            </p>
          </div>
        </div>
        {/* About + graphic */}
        <div className="bg-[#131c31]/60 backdrop-blur-xl border border-white/5 rounded-[20px] overflow-hidden grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 md:p-10">
            <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-300 mb-5">
              <i className="fas fa-info-circle text-lg" />
            </div>
            <h2 className="text-xl font-black text-white mb-3">About Virtual City School</h2>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
              {data?.about || "Institutional description will appear here."}
            </p>
          </div>
          <div
            className="relative min-h-[240px] border-t md:border-t-0 md:border-l border-white/5 flex items-center justify-center"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(99,102,241,0.14), transparent 70%), #0b1120",
            }}
          >
            <div className="relative w-40 h-40 sm:w-44 sm:h-44">
              <div className="absolute inset-0 rounded-full border border-indigo-400/35" />
              <div className="absolute inset-5 rounded-full border border-cyan-400/30" />
              <div className="absolute inset-10 rounded-full border border-violet-400/30" />
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.6)]" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              <div className="absolute bottom-3 left-4 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              <div className="absolute bottom-6 right-2 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        </div>
        {/* Contact */}
        <div>
          <div className="mb-7">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Get in Touch</h2>
            <p className="text-slate-400 text-sm mt-2">
              Reach the VCS team however works best for you.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.contact_whatsapp && (
              <a
                href={`https://wa.me/${data.contact_whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#131c31]/60 backdrop-blur-xl border border-white/5 rounded-[20px] p-5 hover:border-indigo-500/30 transition"
              >
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-300 flex-none">
                  <i className="fab fa-whatsapp text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">WhatsApp</p>
                  <p className="text-[13px] text-slate-200 font-semibold truncate">{data.contact_whatsapp}</p>
                </div>
              </a>
            )}
            {data?.contact_phone && (
              <a
                href={`tel:${data.contact_phone}`}
                className="flex items-center gap-3 bg-[#131c31]/60 backdrop-blur-xl border border-white/5 rounded-[20px] p-5 hover:border-indigo-500/30 transition"
              >
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-300 flex-none">
                  <i className="fas fa-phone text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Phone</p>
                  <p className="text-[13px] text-slate-200 font-semibold truncate">{data.contact_phone}</p>
                </div>
              </a>
            )}
            {data?.contact_email && (
              <a
                href={`mailto:${data.contact_email}`}
                className="flex items-center gap-3 bg-[#131c31]/60 backdrop-blur-xl border border-white/5 rounded-[20px] p-5 hover:border-indigo-500/30 transition"
              >
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-300 flex-none">
                  <i className="fas fa-envelope text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email</p>
                  <p className="text-[13px] text-slate-200 font-semibold truncate">{data.contact_email}</p>
                </div>
              </a>
            )}
            {data?.contact_address && (
              <div className="flex items-center gap-3 bg-[#131c31]/60 backdrop-blur-xl border border-white/5 rounded-[20px] p-5">
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-300 flex-none">
                  <i className="fas fa-map-marker-alt text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Address</p>
                  <p className="text-[13px] text-slate-200 font-semibold">{data.contact_address}</p>
                </div>
              </div>
            )}
            {!hasContact && (
              <p className="text-slate-500 text-sm col-span-full">
                Contact details will appear here once configured.
              </p>
            )}
          </div>
        </div>
        {/* Social */}
        {hasSocial && (
          <div className="flex justify-center gap-3 pt-4">
            {SOCIAL.filter((s) => data?.[s.key]).map(({ key, icon, label }) => (
              <a
                key={key}
                href={data[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-11 h-11 bg-[#131c31]/60 backdrop-blur-xl border border-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition"
              >
                <i className={`${icon} text-sm`} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutPage;
