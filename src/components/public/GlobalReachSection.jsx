import Reveal from "../ui/Reveal";

// Alphabetical by display name. Country pages don't exist yet - these are
// intentionally not links. Once a country page is built, give that entry a
// `to` field and wrap the tile in a <Link>.
const COUNTRIES = [
  { code: "au", name: "Australia" },
  { code: "bh", name: "Bahrain" },
  { code: "ca", name: "Canada" },
  { code: "cn", name: "China" },
  { code: "kw", name: "Kuwait" },
  { code: "my", name: "Malaysia" },
  { code: "om", name: "Oman" },
  { code: "pk", name: "Pakistan" },
  { code: "qa", name: "Qatar" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "ae", name: "UAE" },
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
        Wherever the diaspora calls home,{" "}
        <span className="text-gradient">we&rsquo;re already there</span>
      </h2>
      <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed">
        Serving Pakistani, Indian, and expatriate families across 13 countries — with dedicated pages for each community coming soon.
      </p>
    </Reveal>

    <Reveal delay={80}>
      <div className="grid grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))] gap-x-2 gap-y-3 lg:gap-2 max-w-4xl mx-auto">
        {COUNTRIES.map((country) => (
          <div key={country.code} className="group flex flex-col items-center text-center">
            <div className="w-full aspect-[3/2] rounded-md overflow-hidden border border-white/10 bg-slate-800 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105">
              <img
                src={`/assets/flags/${country.code}.svg`}
                alt={`${country.name} flag`}
                loading="lazy"
                className="w-full h-full object-cover block"
              />
            </div>
            <p className="mt-1.5 text-[9.5px] lg:text-[10.5px] font-bold font-poppins text-slate-400 leading-tight">
              {country.name}
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  </div>
);

export default GlobalReachSection;
