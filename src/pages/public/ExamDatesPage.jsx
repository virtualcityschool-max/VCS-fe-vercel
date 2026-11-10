import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import { EXAM_SERIES, LAST_VERIFIED, SITE_URL } from "../../data/examDates";
import { COUNTRY_PAGES } from "../../data/countryLandingPages";
import {
  pickCurrentSeriesByType,
  getNextMilestone,
  pointDisplayLabel,
  buildExamEvents,
} from "../../utils/examTimeline";
import { upcomingSeries } from "../../utils/examSeason";
import { buildExamFaq } from "../../utils/examFaq";
import { TIMETABLE_SERIES_LABEL, TIMETABLE_ZONES, timetablePath } from "../../data/examTimetable";
import Reveal from "../../components/ui/Reveal";
import ExamTimeline from "../../components/public/ExamTimeline";
import ExamZoneCallout from "../../components/public/ExamZoneCallout";
import ExamDatesTable from "../../components/public/ExamDatesTable";

// One-line descriptors written for this page's exam-dates/deadlines intent
// specifically - not reused from the /online-school hub's pitch copy, to
// avoid duplicate content between the two pages.
const COUNTRY_DESCRIPTORS = {
  "saudi-arabia": "Cambridge O & A Level classes for Pakistani families across the Kingdom.",
  uae: "Cambridge deadlines explained for families juggling UAE school waitlists.",
  qatar: "A Cambridge pathway and clear deadlines for Pakistani families in Doha.",
  kuwait: "Cambridge O & A Level support for Kuwait's long-settled Pakistani community.",
  bahrain: "Cambridge O & A Level deadlines for Pakistani families in Manama and Isa Town.",
  oman: "Cambridge deadlines for Pakistani families across Muscat and beyond.",
};

const PAGE_URL = `${SITE_URL}/exam-dates`;

const ExamDatesPage = () => {
  const today = new Date();
  const seriesByType = pickCurrentSeriesByType(EXAM_SERIES, today);
  const nextMilestone = getNextMilestone(EXAM_SERIES, today);
  const events = buildExamEvents(EXAM_SERIES, SITE_URL);
  // The next two series by date (e.g. "Oct/Nov 2026 & May/June 2027"), so the
  // title always matches what students are searching for.
  const [s1, s2] = upcomingSeries(today);
  // The year people search for ("o level exam dates 2027"): the next May/June.
  const searchYear = [s1, s2].find((s) => s.type === "may-june").year;
  const faq = buildExamFaq(EXAM_SERIES, today);

  useSeo({
    // Worded like the searches in Search Console (Nov 2026): "o level exam dates
    // 2027", "registration deadline", "results 2027", "date sheet".
    title: `O Level & A Level Exam Dates ${searchYear} – Registration Deadlines & Results Day`,
    description: `Cambridge O Level, IGCSE and A Level exam dates for ${s1.label} and ${s2.label}: registration deadlines, retakes, results days and where to find your zone's timetable (date sheet), from Cambridge's own documents.`,
    url: PAGE_URL,
    jsonLd: [
      ...events,
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Exam Dates & Deadlines", item: PAGE_URL },
        ],
      },
    ],
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <article className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-slate-300">Exam Dates & Deadlines</span>
        </nav>

        <header className="mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-5">
            Cambridge Key Dates
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white mb-6">
            O Level & A Level Exam Dates <span className="text-gradient">{s1.label} & {s2.label}</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl">
            Entry deadlines, exam periods and results days for Cambridge O Level, IGCSE and International AS & A Level - sourced directly from Cambridge International, for Pakistani families across Saudi Arabia, the UAE, Qatar, Kuwait, Bahrain and Oman.
          </p>
        </header>

        {/* 1. Status line */}
        <Reveal className="mb-10">
          <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-5 py-4 flex items-start gap-3">
            <i className="fas fa-bell text-indigo-400 text-sm mt-0.5" aria-hidden="true" />
            <p className="text-sm text-slate-200">
              {nextMilestone ? (
                <>
                  <span className="font-black text-white">Next milestone: </span>
                  {nextMilestone.point.label} -{" "}
                  <span className="font-bold text-indigo-300">{pointDisplayLabel(nextMilestone.point)}</span>
                  {" "}({nextMilestone.series.seriesLabel})
                </>
              ) : (
                "No further Cambridge milestones are currently published - check back after the next series is announced."
              )}
            </p>
          </div>
        </Reveal>

        {/* 2. Vertical timeline */}
        <Reveal className="mb-10">
          <ExamTimeline seriesByType={seriesByType} today={today} />
        </Reveal>

        {/* 3. Administrative zone callout */}
        <Reveal>
          <ExamZoneCallout />
        </Reveal>
        {/* 3b. Paper-by-paper timetables, one page per zone */}
        <section id="june-2027-timetables" aria-labelledby="tt-heading" className="mt-16">
          <Reveal className="mb-6">
            <h2 id="tt-heading" className="text-xl md:text-2xl font-black font-poppins tracking-tight text-white mb-1">
              {TIMETABLE_SERIES_LABEL} timetable (date sheet) by zone
            </h2>
            <p className="text-slate-300 text-sm">
              Every O Level, IGCSE, AS and A Level paper with its date and morning or afternoon session, from Cambridge's final timetable. Pick the zone your exam centre gives you.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TIMETABLE_ZONES.map((z) => (
              <Link
                key={z}
                to={timetablePath(z)}
                className="group rounded-2xl border border-white/5 border-t-4 border-t-cyan-400/60 bg-[#1a2235]/60 hover:border-indigo-400/40 transition p-5"
              >
                <span className="block text-xs font-black uppercase tracking-widest text-cyan-300 mb-1">June 2027</span>
                <span className="block text-2xl font-black text-white group-hover:text-indigo-300 transition">Zone {z}</span>
                <span className="block text-sm text-slate-400 mt-1">{z === 3 ? "Also the UK" : "Paper by paper"}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Country cards */}
        <Reveal className="mt-16 mb-4">
          <h2 className="text-xl md:text-2xl font-black font-poppins tracking-tight text-white mb-1">
            Cambridge Schooling by Country
          </h2>
          <p className="text-slate-500 text-sm">
            Deadlines are the same everywhere - what differs country to country is the schooling landscape itself.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {COUNTRY_PAGES.map((c) => (
            <Reveal key={c.slug}>
              <Link
                to={`/online-school/${c.slug}`}
                className="group flex items-center gap-4 h-full bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-indigo-400/40 transition p-5"
              >
                <img
                  src={`/assets/flags/${c.flagCode}.svg`}
                  alt={`${c.countryName} flag`}
                  className="w-11 h-8 rounded-sm object-cover border border-white/10 shrink-0"
                />
                <div>
                  <h3 className="text-base font-black font-poppins text-white group-hover:text-indigo-300 transition">
                    {c.countryName}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mt-1">
                    {COUNTRY_DESCRIPTORS[c.slug]}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* 5. Exact dates table */}
        <Reveal className="mb-6">
          <h2 className="text-xl md:text-2xl font-black font-poppins tracking-tight text-white mb-1">
            Exact Dates
          </h2>
          <p className="text-slate-500 text-sm">
            Every date below links back to the Cambridge document it came from.
          </p>
        </Reveal>
        <Reveal>
          <ExamDatesTable allSeries={EXAM_SERIES} today={today} />
        </Reveal>

        {/* 6. Questions people search for, answered from the same data */}
        <section aria-labelledby="exam-faq" className="mt-16">
          <Reveal className="mb-6">
            <h2 id="exam-faq" className="text-xl md:text-2xl font-black font-poppins tracking-tight text-white mb-1">
              Registration deadlines, retakes, results and date sheets
            </h2>
            <p className="text-slate-400 text-sm">The questions families ask us most, answered from the dates above.</p>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {faq.map((f) => (
              <Reveal key={f.q}>
                <div className="h-full rounded-2xl border border-white/5 border-l-4 border-l-amber-400/60 bg-[#1a2235]/60 p-5">
                  <h3 className="text-lg font-black font-poppins text-white mb-2">{f.q}</h3>
                  <p className="text-slate-200 text-base leading-relaxed max-w-3xl">{f.a}</p>
                  {f.link && (
                    <Link to={f.link.to} className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-indigo-300 hover:text-white transition">
                      {f.link.label} <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                    </Link>
                  )}
                  {f.href && (
                    <a href={f.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-indigo-300 hover:text-white transition">
                      {f.hrefLabel} <i className="fas fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
        <p className="text-slate-600 text-sm mt-10 pt-6 border-t border-white/5">
          Last verified against cambridgeinternational.org on {LAST_VERIFIED}. Registration deadlines shown are Cambridge's cutoff for your school to submit entries, not necessarily your own school's internal deadline - always confirm with your exams officer.
        </p>
      </article>
    </main>
  );
};

export default ExamDatesPage;
