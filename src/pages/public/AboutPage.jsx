import React, { useEffect, useState } from "react";
import { aboutService } from "../../services/aboutService";
import { useSeo } from "../../hooks/useSeo";

const SOCIAL = [
  { key: "social_facebook",  icon: "fab fa-facebook-f",  label: "Facebook",  color: "hover:text-blue-500"   },
  { key: "social_instagram", icon: "fab fa-instagram",   label: "Instagram", color: "hover:text-pink-500"   },
  { key: "social_twitter",   icon: "fab fa-x-twitter",   label: "X",         color: "hover:text-slate-300"  },
  { key: "social_linkedin",  icon: "fab fa-linkedin-in", label: "LinkedIn",  color: "hover:text-blue-400"   },
  { key: "social_youtube",   icon: "fab fa-youtube",     label: "YouTube",   color: "hover:text-red-500"    },
];

const Section = ({ icon, title, children, accent = "indigo" }) => {
  const border = { indigo: "border-indigo-500/30", violet: "border-violet-500/30", emerald: "border-emerald-500/30" }[accent];
  const bg     = { indigo: "bg-indigo-500/10",     violet: "bg-violet-500/10",     emerald: "bg-emerald-500/10"     }[accent];
  const text   = { indigo: "text-indigo-400",      violet: "text-violet-400",      emerald: "text-emerald-400"      }[accent];
  return (
    <div className={`bg-slate-900/60 backdrop-blur-sm border ${border} rounded-2xl p-8`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${text}`}>
          <i className={`${icon} text-lg`} />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
};

const AboutPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aboutService.get()
      .then(setData)
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  useSeo({
      title: "About Us",
      description: "Learn about Virtual City School's vision, mission and story - the online Cambridge school offering O Level, AS Level and A2 Level programmes alongside Grade 5-12 curricula, for students across the UAE, Saudi Arabia, Qatar and Pakistan.",
      url: typeof window !== "undefined" ? window.location.href : undefined,
  });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-indigo-400 text-2xl" />
      </div>
    );
  }

  const hasSocial = SOCIAL.some(s => data?.[s.key]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
            <i className="fas fa-school text-[10px]" />
            Virtual City School
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            About Us
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Building the next generation of learners through world-class digital education.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-8">

        {/* Vision */}
        <Section icon="fas fa-eye" title="Our Vision" accent="indigo">
          <p className="text-slate-300 leading-relaxed text-[15px]">
            {data?.vision || "Our vision statement will appear here."}
          </p>
        </Section>

        {/* Mission */}
        <Section icon="fas fa-bullseye" title="Our Mission" accent="violet">
          <p className="text-slate-300 leading-relaxed text-[15px]">
            {data?.mission || "Our mission statement will appear here."}
          </p>
        </Section>

        {/* About */}
        <Section icon="fas fa-info-circle" title="About Virtual City School" accent="emerald">
          <p className="text-slate-300 leading-relaxed text-[15px] whitespace-pre-line">
            {data?.about || "Institutional description will appear here."}
          </p>
        </Section>

        {/* Contact */}
        <Section icon="fas fa-envelope" title="Contact Us" accent="indigo">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.contact_whatsapp && (
              <a
                href={`https://wa.me/${data.contact_whatsapp.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:border-green-500/40 group transition"
              >
                <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition">
                  <i className="fab fa-whatsapp text-lg" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">WhatsApp</p>
                  <p className="text-sm text-slate-200 font-semibold">{data.contact_whatsapp}</p>
                </div>
              </a>
            )}
            {data?.contact_phone && (
              <a
                href={`tel:${data.contact_phone}`}
                className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:border-indigo-500/40 group transition"
              >
                <div className="w-9 h-9 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition">
                  <i className="fas fa-phone text-sm" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Phone</p>
                  <p className="text-sm text-slate-200 font-semibold">{data.contact_phone}</p>
                </div>
              </a>
            )}
            {data?.contact_email && (
              <a
                href={`mailto:${data.contact_email}`}
                className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:border-indigo-500/40 group transition"
              >
                <div className="w-9 h-9 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition">
                  <i className="fas fa-envelope text-sm" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Email</p>
                  <p className="text-sm text-slate-200 font-semibold">{data.contact_email}</p>
                </div>
              </a>
            )}
            {data?.contact_address && (
              <div className="flex items-start gap-3 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
                <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <i className="fas fa-map-marker-alt text-sm" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Address</p>
                  <p className="text-sm text-slate-200 font-semibold whitespace-pre-line leading-relaxed">{data.contact_address}</p>
                </div>
              </div>
            )}
            {!data?.contact_whatsapp && !data?.contact_phone && !data?.contact_email && !data?.contact_address && (
              <p className="text-slate-500 text-sm col-span-2">Contact details will appear here once configured.</p>
            )}
          </div>
        </Section>

        {/* Social */}
        {hasSocial && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-8">
            <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2">
              <i className="fas fa-share-alt text-slate-400" />
              Follow Us
            </h2>
            <div className="flex flex-wrap gap-3">
              {SOCIAL.filter(s => data?.[s.key]).map(({ key, icon, label, color }) => (
                <a
                  key={key}
                  href={data[key]}
                  target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 ${color} text-sm font-semibold transition hover:border-slate-500`}
                >
                  <i className={`${icon} text-base`} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutPage;
