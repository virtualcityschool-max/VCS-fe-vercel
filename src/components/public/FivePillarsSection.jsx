import Reveal from "../ui/Reveal";

const PILLARS = [
  {
    key: "reach",
    label: "Reach",
    headline: "Learn from anywhere.",
    body: "Every city, every country, even remote compounds where good schools don't exist — if you have a connection, your child has a classroom.",
    photo: "/assets/pillars/reach.jpg",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9s1.3-6.3 3.8-9z" />
      </svg>
    ),
  },
  {
    key: "quality",
    label: "Quality",
    headline: "Real Cambridge, real teachers.",
    body: "Live, teacher-led classes in a globally recognised curriculum — not recorded videos or a screen full of strangers.",
    photo: "/assets/pillars/quality.jpg",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 9L12 4 2 9l10 5 10-5z" />
        <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
        <path d="M22 9v7" />
      </svg>
    ),
  },
  {
    key: "affordability",
    label: "Affordability",
    headline: "World-class, within reach.",
    body: "The education families dream of, at a fraction of private-school fees — with no waiting lists and no hidden charges.",
    photo: "/assets/pillars/affordability.jpg",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.6 15.5a2 2 0 0 0 0-3l-6-6a2 2 0 0 0-1.4-.6H5a2 2 0 0 0-2 2v8.1c0 .5.2 1 .6 1.4l6 6a2 2 0 0 0 3 0l8-8z" />
        <circle cx="8.5" cy="8.5" r="1.5" />
      </svg>
    ),
  },
  {
    key: "continuity",
    label: "Continuity",
    headline: "Moves with your family.",
    body: "A new posting, a move back to Pakistan, a transfer abroad — your child never loses a year. Their school comes with them.",
    photo: "/assets/pillars/continuity.jpg",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2.1l4 4-4 4" />
        <path d="M3 12.7V12a4 4 0 0 1 4-4h14" />
        <path d="M7 21.9l-4-4 4-4" />
        <path d="M21 11.3V12a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    key: "heritage",
    label: "Heritage",
    headline: "Rooted in who they are.",
    body: "Urdu, Islamiat and Pakistan Studies alongside Cambridge — so they never lose their language, faith, or connection to home.",
    photo: "/assets/pillars/heritage.jpg",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V9l7-5 7 5v12" />
        <path d="M9 21v-6h6v6" />
        <path d="M9 9h.01M12 9h.01M15 9h.01" />
      </svg>
    ),
  },
];

const PillarColumn = ({ pillar, delay = 0 }) => (
  <Reveal delay={delay} className="flex flex-col items-center px-1">
    <div className="relative mb-3">
      <img
        src={pillar.photo}
        alt={pillar.label}
        loading="lazy"
        className="w-[76px] h-[76px] rounded-full object-cover border-[3px] border-indigo-400/55 shadow-[0_0_0_4px_rgba(2,6,23,0.95),0_10px_26px_-6px_rgba(0,0,0,0.55)]"
      />
      <span className="absolute -bottom-0.5 -right-0.5 w-[26px] h-[26px] rounded-full bg-[#0b1220] border border-cyan-400/55 flex items-center justify-center text-cyan-400">
        <span className="w-[14px] h-[14px] block">{pillar.icon}</span>
      </span>
    </div>
    <div className="w-[74%] h-2 rounded-t-sm bg-gradient-to-r from-indigo-400/50 to-cyan-400/40 shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]" />
    <div className="w-[46%] h-4 relative bg-gradient-to-b from-white/5 via-indigo-400/5 to-white/4 border-x border-white/8" />
    <div className="w-[84%] h-2.5 rounded-b-sm bg-white/8 shadow-[0_-1px_0_rgba(255,255,255,0.1)_inset] mb-4" />
    <div className="text-center px-2">
      <p className="text-[9.5px] font-black tracking-[0.22em] uppercase text-cyan-400 mb-1.5">{pillar.label}</p>
      <h4 className="font-poppins text-[15px] font-black text-white mb-1.5 leading-snug">{pillar.headline}</h4>
      <p className="text-[11.5px] text-slate-400 leading-relaxed">{pillar.body}</p>
    </div>
  </Reveal>
);

/**
 * Homepage value-proposition section, styled as five architectural columns
 * (capital / fluted shaft / base) supporting a header beam — a literal take
 * on "pillars" rather than another generic feature-card grid.
 */
const FivePillarsSection = () => {
  const [p1, p2, p3, p4, p5] = PILLARS;

  return (
    <div className="mb-20 md:mb-28">
      {/* No extra top margin here - the parent <section> in PublicHome
          already provides py-20 md:py-32, so this sits right after that. */}
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center rounded-t-2xl rounded-b-sm px-8 py-8 sm:py-9 bg-gradient-to-b from-indigo-400/15 to-indigo-400/5 border border-indigo-400/25 border-b-[3px] border-b-indigo-400/40">
          <p className="text-[10px] font-black tracking-[0.32em] uppercase text-cyan-400 mb-2.5">
            Our Promise
          </p>
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-2.5 text-balance">
            The Five Pillars of Virtual City School
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Everything we do rests on five commitments to your family.
          </p>
        </Reveal>

        <div className="pt-6 grid grid-cols-2 sm:grid-cols-5 gap-x-2 gap-y-10 sm:gap-y-0">
          <PillarColumn pillar={p1} delay={0} />
          <PillarColumn pillar={p2} delay={80} />
          <PillarColumn pillar={p3} delay={160} />
          <PillarColumn pillar={p4} delay={240} />
          <div className="col-span-2 sm:col-span-1 flex justify-center">
            <div className="w-1/2 sm:w-full">
              <PillarColumn pillar={p5} delay={320} />
            </div>
          </div>
        </div>

        <div className="h-1.5 rounded bg-gradient-to-r from-indigo-400/25 to-cyan-400/20 mt-8" />
      </div>
    </div>
  );
};

export default FivePillarsSection;
