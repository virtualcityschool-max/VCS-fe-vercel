import { useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import {
  readSky, SIGNS, CONSTELLATIONS, IAU_BOUNDARIES, PTOLEMY_KIND, SOURCES,
} from "../../data/playArea/zodiac";

const SITE_URL = "https://virtualcityschool.com";
const PAGE_URL = `${SITE_URL}/play-area/star-signs`;
const SIGN_ORDER = Object.keys(SIGNS);

// ---------------------------------------------------------------- Wheel ----
// Three rings by the Sun's ecliptic longitude: Western (outer), Vedic
// (middle, shifted by the ayanamsa) and the IAU constellations (inner,
// unequal). 0° (March equinox) at 9 o'clock, increasing anticlockwise.

const C = 170;
const pt = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [C - r * Math.cos(a), C + r * Math.sin(a)];
};
const sector = (r1, r2, a1, a2) => {
  const span = ((a2 - a1) % 360 + 360) % 360;
  const large = span > 180 ? 1 : 0;
  const [x1, y1] = pt(r2, a1);
  const [x2, y2] = pt(r2, a1 + span);
  const [x3, y3] = pt(r1, a1 + span);
  const [x4, y4] = pt(r1, a1);
  // Anticlockwise on screen = sweep flag 0 for the outer arc.
  return `M${x1},${y1} A${r2},${r2} 0 ${large} 0 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 ${large} 1 ${x4},${y4} Z`;
};
const mid = (a1, a2) => a1 + ((((a2 - a1) % 360) + 360) % 360) / 2;
const span = (a1, a2) => (((a2 - a1) % 360) + 360) % 360;
// Plain text zodiac glyphs (not emoji).
const GLYPH_FONT = { fontFamily: "'Apple Symbols','Segoe UI Symbol','Noto Sans Symbols','DejaVu Sans',sans-serif" };

const Wheel = ({ sky }) => {
  const iau = IAU_BOUNDARIES.map(([b, key], i) => {
    const next = IAU_BOUNDARIES[(i + 1) % IAU_BOUNDARIES.length][0];
    return { key, a1: b + sky.iauOffset, a2: next + sky.iauOffset };
  });
  const [sx, sy] = pt(160, sky.longitude);
  const [ex, ey] = pt(52, sky.longitude);
  return (
    <svg viewBox="0 0 340 340" className="w-full max-w-[460px] mx-auto" role="img" aria-label="Zodiac wheel showing the Western sign, the Vedic sign and the real constellation behind the Sun on your birthday">
      {SIGN_ORDER.map((k, i) => {
        const on = sky.western === k;
        const [tx, ty] = pt(140, i * 30 + 15);
        return (
          <g key={`w-${k}`}>
            <path d={sector(122, 158, i * 30, i * 30 + 30)} className={on ? "fill-violet-500/70 stroke-violet-300" : "fill-violet-500/15 stroke-violet-400/40"} strokeWidth="1" />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" className={on ? "fill-white" : "fill-violet-200"} fontSize="17" style={GLYPH_FONT}>{SIGNS[k].symbol}</text>
          </g>
        );
      })}
      {SIGN_ORDER.map((k, i) => {
        const on = sky.vedic === k;
        const a1 = i * 30 + sky.ayanamsa;
        const [tx, ty] = pt(104, a1 + 15);
        return (
          <g key={`v-${k}`}>
            <path d={sector(86, 120, a1, a1 + 30)} className={on ? "fill-amber-500/70 stroke-amber-300" : "fill-amber-500/15 stroke-amber-400/40"} strokeWidth="1" />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" className={on ? "fill-white" : "fill-amber-200"} fontSize="15" style={GLYPH_FONT}>{SIGNS[k].symbol}</text>
          </g>
        );
      })}
      {iau.map(({ key, a1, a2 }) => {
        const on = sky.iau === key;
        const [tx, ty] = pt(69, mid(a1, a2));
        return (
          <g key={`i-${key}`}>
            <path d={sector(50, 84, a1, a2)} className={on ? "fill-cyan-500/70 stroke-cyan-300" : "fill-cyan-500/15 stroke-cyan-400/40"} strokeWidth="1" />
            {span(a1, a2) >= 10 && (
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" className={on ? "fill-white" : "fill-cyan-200"} fontSize="9" fontWeight="700">{CONSTELLATIONS[key].abbr}</text>
            )}
          </g>
        );
      })}
      <line x1={ex} y1={ey} x2={sx} y2={sy} className="stroke-white" strokeWidth="2" />
      <circle cx={sx} cy={sy} r="9" className="fill-amber-300 stroke-amber-100" strokeWidth="2" />
      {/* Always-dark centre (keeps its colours in day mode). */}
      <g className="theme-keep">
        <circle cx={C} cy={C} r="46" fill="#0f172a" />
        <text x={C} y={C - 8} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">Earth</text>
        <text x={C} y={C + 8} textAnchor="middle" fill="#cbd5e1" fontSize="9">you are here</text>
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- Page -----

const fmt = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const Card = ({ tone, label, title, sub, children }) => {
  const t = {
    violet: "border-violet-500/40 bg-violet-500/[0.07] text-violet-300",
    amber: "border-amber-500/40 bg-amber-500/[0.07] text-amber-300",
    cyan: "border-cyan-500/40 bg-cyan-500/[0.07] text-cyan-300",
  }[tone];
  return (
    <div className={`p-6 rounded-3xl border-t-4 border ${t}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em] mb-3">{label}</p>
      <p className="text-3xl md:text-4xl font-black text-white mb-1">{title}</p>
      <p className="text-base text-slate-200 mb-3">{sub}</p>
      <div className="text-sm text-slate-300 leading-relaxed">{children}</div>
    </div>
  );
};

const StarSigns = () => {
  useSeo({
    title: "Star Signs: Western, Vedic and the Real Sky — Free Zodiac Explorer",
    description:
      "Enter your birthday to see your Western star sign (Ptolemy's Tetrabiblos), your Vedic Rashi, and the real IAU constellation the Sun was in — with star facts, history and the science behind the zodiac.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Play Area", item: `${SITE_URL}/play-area` },
          { "@type": "ListItem", position: 3, name: "Star Signs", item: PAGE_URL },
        ],
      },
    ],
  });

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState("");
  const [shown, setShown] = useState(null);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= "1900-01-01" && date <= today;
  const sky = shown ? readSky(shown) : null;
  const w = sky && SIGNS[sky.western];
  const v = sky && SIGNS[sky.vedic];
  const c = sky && CONSTELLATIONS[sky.iau];

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    setShown(date);
    setTimeout(() => document.getElementById("your-stars")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-violet-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-10 md:pt-14 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/play-area" className="hover:text-white transition">Play Area</Link>
          <span>/</span>
          <span className="text-slate-200">Star Signs</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-[0.2em] mb-5">
              Play Area · Star Signs
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
              What were the stars doing <span className="text-gradient">on your birthday?</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-8">
              One birthday, three answers. See your sign in the <strong className="text-violet-300 font-semibold">Western tradition</strong> (from Ptolemy, 2nd century AD), in the <strong className="text-amber-300 font-semibold">Vedic tradition</strong> of South Asia, and in the <strong className="text-cyan-300 font-semibold">real sky</strong> as astronomers map it today — and find out why they disagree.
            </p>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 sm:items-end max-w-xl">
              <label className="block flex-1">
                <span className="block text-sm font-semibold text-slate-200 mb-1.5">Your date of birth</span>
                <input
                  type="date"
                  value={date}
                  min="1900-01-01"
                  max={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-base text-white focus:outline-none focus:border-cyan-400 [color-scheme:dark]"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={!valid}
                className="px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold transition"
              >
                Show my stars <i className="fas fa-star ml-2" aria-hidden="true" />
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-3">Your birthday is used only on this page and is not saved or sent anywhere.</p>
          </div>
          <figure>
            <img
              src="/images/play-area/night-sky.webp"
              alt="A person standing under the Milky Way in a starry night sky"
              width="1400"
              height="933"
              className="w-full aspect-[3/2] object-cover rounded-3xl border border-white/10"
            />
            <figcaption className="mt-2 text-xs text-slate-400">Photo: Unsplash</figcaption>
          </figure>
        </div>

        {sky && (
          <section id="your-stars" aria-labelledby="stars-heading" className="scroll-mt-28 mb-16">
            <h2 id="stars-heading" className="text-2xl md:text-3xl font-black font-poppins text-white mb-2">Your stars on {fmt(shown)}</h2>
            <p className="text-base text-slate-300 mb-6">The same moment, read three different ways.</p>

            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <Card tone="violet" label="Western tradition" title={<><span style={GLYPH_FONT}>{w.symbol}</span> {w.name}</>} sub={`${w.meaning} · ${w.dates}`}>
                Measured from the March equinox, in twelve equal signs. Used by most horoscopes in newspapers and apps.
                {sky.cusp.western && <span className="block mt-2 text-amber-300 font-semibold">Born on the cusp: depending on the hour of birth, the sign next door may apply.</span>}
              </Card>
              <Card tone="amber" label="Vedic tradition (Jyotisha)" title={<><span style={GLYPH_FONT}>{v.symbol}</span> {v.rashi}</>} sub={`${v.name} · “${v.rashiMeaning}” · ${v.vedicDates}`}>
                Measured from the fixed stars, so it sits about {Math.round(sky.ayanamsa)}° (around 24 days) behind the Western sign.
                {sky.cusp.vedic && <span className="block mt-2 text-amber-300 font-semibold">Born on the cusp: depending on the hour of birth, the Rashi next door may apply.</span>}
              </Card>
              <Card tone="cyan" label="The real sky (IAU astronomy)" title={c.name} sub={`${c.meaning} · Sun here about ${c.sunDates}`}>
                The constellation the Sun was actually in front of, using the official International Astronomical Union boundaries.
                {sky.cusp.iau && <span className="block mt-2 text-amber-300 font-semibold">The Sun was right on a constellation border that day.</span>}
              </Card>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center mb-10 p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
              <div>
                <Wheel sky={sky} />
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-bold">
                  <span className="text-violet-300"><span className="inline-block w-3 h-3 rounded-sm bg-violet-500/70 mr-1.5 align-middle" />Western (outer)</span>
                  <span className="text-amber-300"><span className="inline-block w-3 h-3 rounded-sm bg-amber-500/70 mr-1.5 align-middle" />Vedic (middle)</span>
                  <span className="text-cyan-300"><span className="inline-block w-3 h-3 rounded-sm bg-cyan-500/70 mr-1.5 align-middle" />Real constellations (inner)</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-4">Why three different answers?</h3>
                <ul className="space-y-4 text-base text-slate-200 leading-relaxed">
                  <li><strong className="text-violet-300 font-semibold">The Earth wobbles like a spinning top.</strong> Over about 25,800 years its axis traces a slow circle, so the stars appear to drift by about 1° every 72 years. This is called <em>precession</em>.</li>
                  <li><strong className="text-amber-300 font-semibold">Vedic astrology follows the stars;</strong> Western astrology follows the seasons. They lined up around 1,700 years ago and have drifted about 24° apart since.</li>
                  <li><strong className="text-cyan-300 font-semibold">Real constellations are not equal.</strong> Virgo is huge (about 44 days), Scorpius tiny (about 7 days), and the Sun also crosses a 13th constellation, Ophiuchus. The white line on the wheel points from Earth to where the Sun was on your birthday.</li>
                </ul>
              </div>
            </div>

            {/* Real sky */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <article className="lg:col-span-2 p-6 md:p-8 rounded-3xl border-t-4 border border-cyan-500/30 bg-cyan-500/[0.05]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Your constellation in the real sky</p>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4">{c.name} <span className="text-slate-300 text-lg font-semibold">({c.abbr}) · {c.meaning}</span></h3>
                <p className="text-base text-slate-200 leading-relaxed mb-5 max-w-3xl">{c.fact}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    ["Brightest star", c.star.name],
                    ["Brightness", `magnitude ${c.star.mag}`],
                    ["Distance", `about ${c.star.ly} light-years`],
                  ].map(([k, val]) => (
                    <div key={k} className="p-4 rounded-2xl border border-white/10 bg-white/[0.04]">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1">{k}</div>
                      <div className="text-base font-bold text-white">{val}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-300 mt-4"><strong className="text-cyan-300 font-semibold">Name:</strong> {c.star.origin}. The light you see from {c.star.name} left it about {c.star.ly} years ago.</p>
              </article>
              <article className="p-6 md:p-8 rounded-3xl border-t-4 border border-emerald-500/30 bg-emerald-500/[0.05]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 bg-emerald-500/15 text-emerald-300"><i className="fas fa-binoculars" aria-hidden="true" /></div>
                <h3 className="text-lg font-bold text-white mb-2">When can you see it?</h3>
                <p className="text-base text-slate-200 leading-relaxed">
                  Not on your birthday! The Sun is in front of {c.name} then, so it is lost in daylight. Look for it in the evening sky around <strong className="text-emerald-300 font-semibold">{c.see}</strong>, when Earth has moved to the other side of the Sun.
                </p>
              </article>
            </div>

            {/* Ptolemy + Vedic */}
            <div className="grid md:grid-cols-2 gap-6">
              <article className="p-6 md:p-8 rounded-3xl border-t-4 border border-violet-500/30 bg-violet-500/[0.05]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300 mb-2">In Ptolemy's Tetrabiblos (2nd century AD)</p>
                <h3 className="text-2xl font-black text-white mb-4"><span style={GLYPH_FONT}>{w.symbol}</span> {w.name}</h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base mb-4">
                  <dt className="text-slate-300">Ruling planet</dt><dd className="text-white font-semibold">{w.ruler}</dd>
                  <dt className="text-slate-300">Kind of sign</dt><dd className="text-white font-semibold">{w.kind} <span className="text-slate-300 font-normal">— {PTOLEMY_KIND[w.kind]}</span></dd>
                  <dt className="text-slate-300">Gender</dt><dd className="text-white font-semibold">{w.gender}</dd>
                  <dt className="text-slate-300">Element</dt><dd className="text-white font-semibold">{w.element} <span className="text-slate-300 font-normal">(later tradition)</span></dd>
                </dl>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Claudius Ptolemy worked in Alexandria, Egypt, around 150 AD. His <em>Tetrabiblos</em> (“four books”) is the oldest surviving textbook of Western astrology, written after his great astronomy book, the <em>Almagest</em>. Through Arabic translations it shaped astrology for over 1,400 years.
                </p>
              </article>
              <article className="p-6 md:p-8 rounded-3xl border-t-4 border border-amber-500/30 bg-amber-500/[0.05]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300 mb-2">In the Vedic tradition (Jyotisha)</p>
                <h3 className="text-2xl font-black text-white mb-4"><span style={GLYPH_FONT}>{v.symbol}</span> {v.rashi} <span className="text-slate-300 text-lg font-semibold">({v.name})</span></h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base mb-4">
                  <dt className="text-slate-300">Rashi meaning</dt><dd className="text-white font-semibold">“{v.rashiMeaning}” (Sanskrit)</dd>
                  <dt className="text-slate-300">Lord (graha)</dt><dd className="text-white font-semibold">{v.lord}</dd>
                  <dt className="text-slate-300">Sun's dates</dt><dd className="text-white font-semibold">{v.vedicDates}</dd>
                  <dt className="text-slate-300">Ayanamsa</dt><dd className="text-white font-semibold">{sky.ayanamsa.toFixed(1)}° <span className="text-slate-300 font-normal">(Lahiri) in your birth year</span></dd>
                </dl>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Jyotisha, the astrology of South Asia, measures the signs from the fixed stars (the <em>sidereal</em> zodiac). The gap from the Western signs is the <em>ayanamsa</em>, which grows by about 1° every 72 years. The Sun entering Makara (around 14 January) is celebrated as Makar Sankranti.
                </p>
              </article>
            </div>
          </section>
        )}

        {/* Always shown: heritage, science, sources */}
        <section aria-labelledby="heritage-heading" className="grid lg:grid-cols-2 gap-6 mb-6">
          <article className="p-6 md:p-8 rounded-3xl border-t-4 border border-emerald-500/30 bg-emerald-500/[0.05]">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 bg-emerald-500/15 text-emerald-300"><i className="fas fa-book-open" aria-hidden="true" /></div>
            <h2 id="heritage-heading" className="text-xl md:text-2xl font-black text-white mb-3">The stars speak Arabic</h2>
            <p className="text-base text-slate-200 leading-relaxed mb-3">
              Around <strong className="text-emerald-300 font-semibold">964 AD</strong>, the Persian astronomer <strong className="text-emerald-300 font-semibold">Abd al-Rahman al-Sufi</strong> wrote the <em>Book of Fixed Stars</em>, carefully measuring the stars and recording their Arabic names. Through Latin translations, those names reached Europe — and are still the official names today.
            </p>
            <p className="text-base text-slate-200 leading-relaxed">
              Aldebaran (<em>al-dabarān</em>, the follower), Deneb Algedi (<em>dhanab al-jady</em>, tail of the goat), Rasalhague (<em>ra's al-ḥawwā'</em>), Sadalsuud and Zubeneschamali are all Arabic. Today's leaders in science stand on the shoulders of these scholars.
            </p>
          </article>
          <article className="p-6 md:p-8 rounded-3xl border-t-4 border border-indigo-500/30 bg-indigo-500/[0.05]">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 bg-indigo-500/15 text-indigo-300"><i className="fas fa-flask" aria-hidden="true" /></div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-3">Astronomy or astrology?</h2>
            <p className="text-base text-slate-200 leading-relaxed mb-3">
              <strong className="text-indigo-300 font-semibold">Astronomy</strong> is the science of stars and planets — it predicts eclipses to the second and lands spacecraft on Mars. <strong className="text-indigo-300 font-semibold">Astrology</strong> is the belief that their positions shape our lives and personalities.
            </p>
            <p className="text-base text-slate-200 leading-relaxed">
              Scientists have tested astrology. In a famous double-blind study published in <em>Nature</em> in 1985, astrologers could not match birth charts to people's personality profiles any better than chance. Many faiths, including Islam, also discourage fortune-telling. So enjoy this page for its <strong className="text-indigo-300 font-semibold">history, culture and science</strong> — and use the Play Area's personality tests to learn about yourself.
            </p>
          </article>
        </section>

        <section className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
          <h2 className="text-lg font-bold text-white mb-3"><i className="fas fa-circle-check text-emerald-300 mr-2" aria-hidden="true" />Sources</h2>
          <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-300">
            {SOURCES.map(([k, val]) => <li key={k}><strong className="text-slate-200">{k}:</strong> {val}</li>)}
          </ul>
          <p className="text-sm text-slate-300 mt-4">The Sun's position is calculated for midday on your birthday and checked against professional astronomy software for every day from 1950 to 2030.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/play-area" className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold transition">More tests and puzzles</Link>
            <Link to="/play-area/personality-test" className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition">Take the Personality Test</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StarSigns;
