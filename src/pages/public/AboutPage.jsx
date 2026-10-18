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

  // The "about" text comes from the admin as paragraphs; show each separately.
  const aboutParas = (data?.about || "").split(/\n+/).map((x) => x.trim()).filter(Boolean);

  const contacts = [
    data?.contact_whatsapp && { icon: "fab fa-whatsapp", label: "WhatsApp", value: data.contact_whatsapp, href: `https://wa.me/${data.contact_whatsapp.replace(/\D/g, "")}`, tone: "emerald", external: true },
    data?.contact_phone && { icon: "fas fa-phone", label: "Phone", value: data.contact_phone, href: `tel:${data.contact_phone}`, tone: "sky" },
    data?.contact_email && { icon: "fas fa-envelope", label: "Email", value: data.contact_email, href: `mailto:${data.contact_email}`, tone: "violet" },
    data?.contact_address && { icon: "fas fa-map-marker-alt", label: "Address", value: data.contact_address, tone: "amber" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Hero: words on the left, a photo on the right */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950">
        <div className="absolute -top-24 left-[5%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-32 right-[10%] w-96 h-96 bg-violet-500/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 py-14 md:py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/25 rounded-full text-cyan-300 text-xs font-bold uppercase tracking-widest mb-6">
              <i className="fas fa-school" /> About Virtual City School
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight">
              Geography should never decide who gets a{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">world-class education.</span>
            </h1>
            <p className="text-slate-300 text-lg mt-6 max-w-2xl leading-relaxed">
              That belief is the whole reason VCS exists. Here is our <strong className="text-cyan-300 font-semibold">vision</strong>, our <strong className="text-violet-300 font-semibold">mission</strong> and the story behind them.
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STATS.map((s, i) => (
                <div key={s.lbl} className={`rounded-2xl border p-4 ${["border-indigo-400/30 bg-indigo-500/10", "border-cyan-400/30 bg-cyan-500/10", "border-emerald-400/30 bg-emerald-500/10", "border-amber-400/30 bg-amber-500/10"][i % 4]}`}>
                  <div className={`text-xl md:text-2xl font-black ${["text-indigo-200", "text-cyan-200", "text-emerald-200", "text-amber-200"][i % 4]}`}>{s.num}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-1">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <figure className="relative">
            <img
              src="/images/about/students.webp"
              alt="Students studying together with laptops"
              width="1400"
              height="1000"
              className="w-full aspect-[7/5] object-cover rounded-3xl border border-white/10 shadow-2xl shadow-indigo-950/50"
            />
            <figcaption className="theme-keep absolute bottom-3 right-4 text-xs text-white/70">Photo: Unsplash</figcaption>
          </figure>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-14 md:py-20 space-y-14">
        {/* Vision & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Our Vision", icon: "fa-eye", text: data?.vision, fallback: "Our vision statement will appear here.", tone: "from-indigo-600/25 to-indigo-900/10 border-indigo-400/30", iconTone: "bg-indigo-500/20 text-indigo-200" },
            { title: "Our Mission", icon: "fa-bullseye", text: data?.mission, fallback: "Our mission statement will appear here.", tone: "from-violet-600/25 to-violet-900/10 border-violet-400/30", iconTone: "bg-violet-500/20 text-violet-200" },
          ].map((c) => (
            <div key={c.title} className={`rounded-3xl border bg-gradient-to-br ${c.tone} p-8`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${c.iconTone}`}>
                <i className={`fas ${c.icon} text-lg`} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">{c.title}</h2>
              <p className="text-slate-200 text-base md:text-lg leading-relaxed">{(c.text || c.fallback).trim()}</p>
            </div>
          ))}
        </section>

        {/* Our story, with a photo */}
        <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <figure className="relative order-2 lg:order-1">
            <img
              src="/images/about/online-class.webp"
              alt="A student in a live online class with classmates on screen"
              width="1400"
              height="1000"
              loading="lazy"
              className="w-full aspect-[7/5] object-cover rounded-3xl border border-white/10"
            />
            <figcaption className="theme-keep absolute bottom-3 right-4 text-xs text-white/70">Photo: Unsplash</figcaption>
          </figure>
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-3">
              <i className="fas fa-info-circle" /> Our story
            </span>
            <h2 className="text-2xl md:text-3xl font-black mb-5">About Virtual City School</h2>
            <div className="space-y-4">
              {(aboutParas.length ? aboutParas : ["Institutional description will appear here."]).map((p, i) => (
                <p key={i} className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl">{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black">Get in touch</h2>
          <p className="text-slate-300 text-base mt-2 mb-6">Reach the VCS team however works best for you.</p>
          {contacts.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contacts.map((c) => {
                const tone = {
                  emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
                  sky: "border-sky-400/30 bg-sky-500/10 text-sky-200",
                  violet: "border-violet-400/30 bg-violet-500/10 text-violet-200",
                  amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
                }[c.tone];
                const inner = (
                  <>
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-none ${tone}`}>
                      <i className={`${c.icon} text-lg`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{c.label}</div>
                      <div className="text-base text-white font-semibold break-words">{c.value}</div>
                    </div>
                  </>
                );
                const cls = "flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition";
                return c.href ? (
                  <a key={c.label} href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`${cls} hover:border-indigo-400/40 hover:bg-white/[0.06]`}>{inner}</a>
                ) : (
                  <div key={c.label} className={cls}>{inner}</div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-base">Contact details will appear here once configured.</p>
          )}
          {hasSocial && (
            <div className="flex flex-wrap gap-3 mt-6">
              {SOCIAL.filter((s) => data?.[s.key]).map(({ key, icon, label }) => (
                <a
                  key={key}
                  href={data[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-400/40 transition"
                >
                  <i className={`${icon} text-base`} />
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
