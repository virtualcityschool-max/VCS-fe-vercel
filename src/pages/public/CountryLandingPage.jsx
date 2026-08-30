import { useParams, Link, Navigate } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { formatTime, getTimezoneAbbr } from "../../utils/validation";
import {
  COUNTRY_PAGES,
  APPROX_FX,
  SITE_URL,
  getCountryBySlug,
} from "../../data/countryLandingPages";
import Reveal from "../../components/ui/Reveal";
import CountryFaqSection from "../../components/public/CountryFaqSection";
import CountryInlineImage from "../../components/public/CountryInlineImage";

// Two representative evening batch times, expressed as fixed-offset Pakistan
// Standard Time (+05:00, no DST) instants, then converted per-country via
// the app's existing timezone utilities - not hardcoded per country.
const PKT_ANCHOR_TIMES = ["16:00", "19:00"];

function pktAnchorIso(hhmm) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}T${hhmm}:00+05:00`;
}

const CountryLandingPage = () => {
  const { countrySlug } = useParams();
  const country = getCountryBySlug(countrySlug);

  const pageUrl = `${SITE_URL}/online-school/${countrySlug}`;

  const hreflangAlternates = country
    ? [
        ...COUNTRY_PAGES.map((c) => ({
          hreflang: `en-${c.flagCode}`,
          href: `${SITE_URL}/online-school/${c.slug}`,
        })),
        { hreflang: "x-default", href: `${SITE_URL}/online-school` },
      ]
    : undefined;

  useSeo(
    country
      ? {
          title: country.metaTitle,
          description: country.metaDescription,
          url: pageUrl,
          hreflangAlternates,
          jsonLd: [
            {
              "@type": "FAQPage",
              mainEntity: country.faq.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Online School", item: `${SITE_URL}/online-school` },
                { "@type": "ListItem", position: 3, name: country.countryName, item: pageUrl },
              ],
            },
          ],
        }
      : {},
  );

  if (!country) return <Navigate to="/online-school" replace />;

  const siblings = country.siblingSlugs
    .map((slug) => getCountryBySlug(slug))
    .filter(Boolean);

  const fx = APPROX_FX[country.currency];

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <article className="relative z-10 max-w-4xl mx-auto px-6 pt-12 md:pt-16 pb-24">
        {/* Breadcrumb - mirrors the BreadcrumbList JSON-LD above */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-8 flex-wrap">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/online-school" className="hover:text-white transition">Online School</Link>
          <span>/</span>
          <span className="text-slate-300">{country.countryName}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <img
              src={`/assets/flags/${country.flagCode}.svg`}
              alt={`${country.countryName} flag`}
              className="w-8 h-6 rounded-sm object-cover border border-white/10"
            />
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">
              {country.heroKicker}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white">
            {country.h1}
          </h1>
          <div className="mt-6 space-y-4">
            {country.intro.map((p, i) => (
              <p key={i} className="text-slate-400 text-base md:text-lg leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </header>

        {/* Local schooling landscape - skyline photo floats beside the text
            it illustrates, Wikipedia-style, rather than sitting in a hero
            block above the fold. */}
        <Reveal className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black font-poppins tracking-tight mb-5">
            {country.schoolingLandscape.heading}
          </h2>
          <CountryInlineImage image={country.images.skyline} countrySlug={country.slug} side="right" />
          <div className="space-y-4">
            {country.schoolingLandscape.paragraphs.map((p, i) => (
              <p key={i} className="text-slate-400 leading-relaxed">{p}</p>
            ))}
          </div>
          {/* schoolingLandscape.verifyNote is intentionally NOT rendered here -
              it's an internal fact-check flag for the VCS team, not visitor
              copy. See SEO-AUDIT-FE.md / the country-pages report for the
              compiled list of claims to verify before publish. */}
          <div className="clear-both" />
        </Reveal>

        {/* Why O/A Level */}
        <Reveal className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black font-poppins tracking-tight mb-5">
            {country.whyOALevel.heading}
          </h2>
          <CountryInlineImage image={country.images.study1} countrySlug={country.slug} side="left" />
          <div className="space-y-4">
            {country.whyOALevel.paragraphs.map((p, i) => (
              <p key={i} className="text-slate-400 leading-relaxed">{p}</p>
            ))}
          </div>
          <div className="clear-both" />
        </Reveal>

        {/* Class timing */}
        <Reveal className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black font-poppins tracking-tight mb-5 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
              <i className="fas fa-clock text-purple-400 text-sm" aria-hidden="true" />
            </div>
            Class Timing in {country.countryName}
          </h2>
          <p className="text-slate-400 leading-relaxed mb-5">
            Live batches are scheduled around Pakistan Standard Time (PKT) so a single teacher can teach students across every served country at once. Here's what our typical evening batch slots look like converted to {getTimezoneAbbr(country.timeZone)} ({country.countryName}):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PKT_ANCHOR_TIMES.map((hhmm) => {
              const iso = pktAnchorIso(hhmm);
              return (
                <div key={hhmm} className="bg-linear-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                    {formatTime(iso, "Asia/Karachi")} PKT batch
                  </p>
                  <p className="text-2xl font-black font-poppins text-white">
                    {formatTime(iso, country.timeZone)}{" "}
                    <span className="text-sm text-purple-300 font-bold">{getTimezoneAbbr(country.timeZone)}</span>
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-slate-500 text-xs leading-relaxed">
            Exact timing depends on the specific course and grade - message us on WhatsApp to confirm a schedule for your child's subjects.
          </p>
        </Reveal>

        {/* Pricing context */}
        <Reveal className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black font-poppins tracking-tight mb-5">
            Fees in {fx.label} vs. USD
          </h2>
          <p className="text-slate-400 leading-relaxed mb-3">
            Course fees are billed in USD through Gumroad - the same price every family pays regardless of country. As a rough sense of scale in local currency, 1 USD is approximately{" "}
            <span className="text-white font-bold">{fx.rate} {country.currency}</span> at long-standing Gulf exchange-rate levels.
          </p>
          <p className="text-amber-400/80 text-xs bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3 leading-relaxed mb-3">
            <i className="fas fa-triangle-exclamation mr-2" aria-hidden="true" />
            This is an approximate, illustrative exchange rate, not a live feed - please check the current rate for an exact figure. Actual per-course fees also vary by grade and subject.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-white text-xs font-black uppercase tracking-widest transition"
          >
            See current course fees <i className="fas fa-arrow-right text-[10px]" aria-hidden="true" />
          </Link>
        </Reveal>

        {/* Diaspora framing */}
        <Reveal className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black font-poppins tracking-tight mb-5">
            The Pakistani community in {country.countryName}
          </h2>
          <CountryInlineImage image={country.images.study2} countrySlug={country.slug} side="right" />
          <p className="text-slate-400 leading-relaxed">{country.diaspora}</p>
          <div className="clear-both" />
        </Reveal>

        {/* FAQ */}
        <CountryFaqSection
          items={country.faq}
          kicker={`FAQ - ${country.countryName}`}
          heading={`Questions from Families in ${country.countryName}`}
        />

        {/* Sibling + hub links */}
        <Reveal className="mt-16 pt-10 border-t border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-5">
            Also Serving
          </p>
          <div className="flex flex-wrap gap-3">
            {siblings.map((sib) => (
              <Link
                key={sib.slug}
                to={`/online-school/${sib.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:bg-indigo-500/10 transition text-sm font-semibold text-slate-300"
              >
                <img src={`/assets/flags/${sib.flagCode}.svg`} alt="" className="w-4 h-3 rounded-sm object-cover" />
                {sib.countryName}
              </Link>
            ))}
            <Link
              to="/online-school"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:bg-indigo-500/10 transition text-sm font-semibold text-slate-300"
            >
              All Countries <i className="fas fa-arrow-right text-[10px]" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </article>
    </main>
  );
};

export default CountryLandingPage;
