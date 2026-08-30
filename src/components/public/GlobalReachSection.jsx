import { Link } from "react-router-dom";
import Reveal from "../ui/Reveal";

// Alphabetical by display name. Country pages exist for the first 4 markets
// (`to` set below); the rest don't have a dedicated page yet, so those tiles
// stay plain, unlinked divs exactly as before.
const COUNTRIES = [
  { code: "au", name: "Australia" },
  { code: "bh", name: "Bahrain" },
  { code: "ca", name: "Canada" },
  { code: "cn", name: "China" },
  { code: "kw", name: "Kuwait", to: "/online-school/kuwait" },
  { code: "my", name: "Malaysia" },
  { code: "om", name: "Oman" },
  { code: "pk", name: "Pakistan" },
  { code: "qa", name: "Qatar", to: "/online-school/qatar" },
  { code: "sa", name: "Saudi Arabia", to: "/online-school/saudi-arabia" },
  { code: "ae", name: "UAE", to: "/online-school/uae" },
  { code: "gb", name: "United Kingdom" },
  { code: "us", name: "United States" },
];

const GlobalReachSection = () => (
  <div className="pb-20 md:pb-28">
    <Reveal className="text-center max-w-2xl mx-auto mb-12">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">
        Global Community
      </p>
      <h2 className="text-3xl md:text-5xl font-black font-poppins tracking-tight text-white text-balance">
        Based in Saudi Arabia.{" "}
        <span className="text-gradient">Trusted by families across 13 countries.</span>
      </h2>
      <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed">
        A Saudi Arabia-based school with teachers from Pakistan and beyond — serving expatriate and local families across 13 countries, with dedicated pages for each community coming soon.
      </p>
    </Reveal>

    <Reveal delay={80}>
      <div className="grid grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))] gap-x-2.5 gap-y-4 lg:gap-2.5 max-w-2xl mx-auto">
        {COUNTRIES.map((country) => {
          const Tag = country.to ? Link : "div";
          return (
            <Tag key={country.code} to={country.to} className="group flex flex-col items-center text-center">
              <div className="w-full aspect-[3/2] rounded-md overflow-hidden border border-white/10 bg-slate-800 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105">
                <img
                  src={`/assets/flags/${country.code}.svg`}
                  alt={`${country.name} flag`}
                  className="w-full h-full object-cover block"
                />
              </div>
              <p className={`mt-1.5 text-[9px] lg:text-[9.5px] font-bold font-poppins leading-tight ${country.to ? "text-slate-300 group-hover:text-indigo-300" : "text-slate-400"} transition`}>
                {country.name}
              </p>
            </Tag>
          );
        })}
      </div>
    </Reveal>
  </div>
);

export default GlobalReachSection;
