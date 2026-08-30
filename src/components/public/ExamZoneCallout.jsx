import { ZONE_INFO } from "../../data/examDates";

// Deliberately does not say which zone any country/centre belongs to -
// sources disagree, the exam centre is what actually determines it, and a
// wrong zone can mean a missed exam. This only explains the concept and
// links to Cambridge's own zone tool.
const ExamZoneCallout = () => (
  <div className="mt-10 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-5 sm:px-7 sm:py-6">
    <div className="flex items-start gap-4">
      <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mt-0.5">
        <i className="fas fa-circle-info text-amber-400 text-sm" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-white font-black text-base sm:text-lg mb-2">
          The dates above are the same worldwide - your paper timetable isn't
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          The registration windows, exam windows and results dates shown on this page apply to every Cambridge candidate worldwide. What differs is the day and time of each individual paper: Cambridge publishes a separate timetable for each of six <span className="text-white font-semibold">administrative zones</span> every series, and your exam centre - not your nationality or country of residence - determines which zone applies to you.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          This is exactly where things go wrong for families in our audience: a Pakistani student sitting exams at a centre in the Gulf can be in a different zone, with a different paper timetable, than a cousin sitting the same subject at a centre in Pakistan - because the zone follows the centre's location, not the family's nationality. Always confirm your centre's zone and paper timetable with your school's exams officer before relying on any date beyond what's on this page.
        </p>
        <p className="text-slate-400 text-xs leading-relaxed mb-4 italic">
          "{ZONE_INFO.quote}"
        </p>
        <a
          href={ZONE_INFO.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-white text-xs font-black uppercase tracking-widest transition"
        >
          Find your zone on cambridgeinternational.org
          <i className="fas fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
        </a>
      </div>
    </div>
  </div>
);

export default ExamZoneCallout;
