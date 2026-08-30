import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { COUNTRY_PAGES, SITE_URL } from "../../data/countryLandingPages";
import Reveal from "../../components/ui/Reveal";

const HOOK_LINES = {
  "saudi-arabia":
    "Based in the Kingdom - built for families in Riyadh, Jeddah, Dammam and the smaller cities with no Cambridge school nearby at all.",
  uae: "For families on a KHDA waitlist, or commuting from Sharjah/Ajman for a Dubai school seat.",
  qatar: "A Cambridge option for Doha's smaller, competitive private-school market.",
  kuwait: "A schooling option that isn't tied to one licensed private-school seat.",
};

const OnlineSchoolHub = () => {
  useSeo({
    title: "Online Cambridge School by Country",
    description:
      "Country-specific guides for Pakistani families choosing an online Cambridge O Level or A Level school in Saudi Arabia, the UAE, Qatar and Kuwait.",
    url: `${SITE_URL}/online-school`,
    jsonLd: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Online School", item: `${SITE_URL}/online-school` },
      ],
    },
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <article className="relative z-10 max-w-4xl mx-auto px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-slate-300">Online School</span>
        </nav>

        <header className="mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-5">
            Gulf's Premier Online School
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
            Online Cambridge O Level & A Level School, by Country
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl">
            Every Gulf country has a different Pakistani-family schooling situation - different school options, different waiting lists, different costs, different local university pathways. Pick your country below for the specifics, not a generic pitch.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {COUNTRY_PAGES.map((c) => (
            <Reveal key={c.slug}>
              <Link
                to={`/online-school/${c.slug}`}
                className="group flex flex-col h-full bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-indigo-400/40 transition p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={`/assets/flags/${c.flagCode}.svg`}
                    alt={`${c.countryName} flag`}
                    className="w-9 h-6 rounded-sm object-cover border border-white/10"
                  />
                  <h2 className="text-lg font-black font-poppins text-white group-hover:text-indigo-300 transition">
                    {c.countryName}
                  </h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">
                  {HOOK_LINES[c.slug]}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-indigo-400 group-hover:text-white text-[11px] font-black uppercase tracking-widest transition">
                  Read the {c.countryName} guide <i className="fas fa-arrow-right text-[10px]" aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 pt-10 border-t border-white/5">
          <p className="text-slate-500 text-sm leading-relaxed">
            More countries are being added over time. If your country isn't listed yet, the general{" "}
            <Link to="/" className="text-indigo-400 hover:text-white transition">Virtual City School homepage</Link>{" "}
            and <Link to="/courses" className="text-indigo-400 hover:text-white transition">course catalog</Link> still apply to you.
          </p>
        </Reveal>
      </article>
    </main>
  );
};

export default OnlineSchoolHub;
