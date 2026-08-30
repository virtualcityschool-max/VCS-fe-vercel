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
};

const PAGE_URL = `${SITE_URL}/exam-dates`;

const ExamDatesPage = () => {
  const today = new Date();
  const seriesByType = pickCurrentSeriesByType(EXAM_SERIES, today);
  const nextMilestone = getNextMilestone(EXAM_SERIES, today);
  const events = buildExamEvents(EXAM_SERIES, SITE_URL);

  useSeo({
    title: "Cambridge O Level & A Level Exam Dates and Deadlines",
    description:
      "O Level results dates, A Level exam registration deadlines and IGCSE results release dates for Cambridge students in Saudi Arabia, the UAE, Qatar and Kuwait - sourced directly from Cambridge International.",
    url: PAGE_URL,
    jsonLd: [
      ...events,
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

      <article className="relative z-10 max-w-4xl mx-auto px-6 pt-12 md:pt-16 pb-24">
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
            Cambridge O Level & A Level <span className="text-gradient">Exam Dates and Deadlines</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl">
            Registration deadlines, exam windows and results release dates for Cambridge IGCSE, O Level and International AS & A Level - sourced directly from Cambridge International, for Pakistani families across Saudi Arabia, the UAE, Qatar and Kuwait.
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
                  <p className="text-slate-400 text-xs leading-relaxed mt-1">
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

        <p className="text-slate-600 text-xs mt-10 pt-6 border-t border-white/5">
          Last verified against cambridgeinternational.org on {LAST_VERIFIED}. Registration deadlines shown are Cambridge's cutoff for your school to submit entries, not necessarily your own school's internal deadline - always confirm with your exams officer.
        </p>
      </article>
    </main>
  );
};

export default ExamDatesPage;
