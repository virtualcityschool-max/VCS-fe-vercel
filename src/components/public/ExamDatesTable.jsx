import { formatTime, getTimezoneAbbr } from "../../utils/validation";
import { isSeriesFinished, pointDisplayLabel } from "../../utils/examTimeline";
import { PHASE_LABELS, PHASE_COLORS, SERIES_ACCENT_COLORS } from "../../data/examDates";

const PHASE_ORDER = ["registration", "exam", "results"];

// Cambridge publishes results-release times in GMT/UTC. Converts to two
// reference zones for this audience using the app's existing timezone
// utilities (never reimplemented) - Gulf time covers Saudi Arabia, Qatar and
// Kuwait (all UTC+3); the UAE is called out separately since it's UTC+4.
function GulfTimeNote({ point }) {
  if (!point.time) {
    return point.timeSourceNote ? <p className="text-xs text-slate-500 mt-1">{point.timeSourceNote}</p> : null;
  }
  const iso = `${point.date}T${point.time}:00Z`;
  const gulf = formatTime(iso, "Asia/Riyadh");
  const gulfAbbr = getTimezoneAbbr("Asia/Riyadh");
  const uk = formatTime(iso, "Europe/London");
  const ukAbbr = getTimezoneAbbr("Europe/London");

  return (
    <p className="text-xs text-slate-500 mt-1">
      {point.time} {point.timeZoneName} &middot; {gulf} {gulfAbbr} in Saudi Arabia/Qatar/Kuwait (UAE is one hour ahead) &middot; {uk} {ukAbbr} in the UK
    </p>
  );
}

function PhaseBadge({ phaseKey }) {
  const c = PHASE_COLORS[phaseKey];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${c.badgeBg} ${c.badgeBorder} ${c.badgeText} whitespace-nowrap`}>
      {PHASE_LABELS[phaseKey]}
    </span>
  );
}

function SourceLink({ point }) {
  return (
    <a
      href={point.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={point.sourceLabel}
      aria-label={point.sourceLabel}
      className="inline-flex items-center gap-1 text-indigo-400 hover:text-white text-xs font-bold transition"
    >
      Cambridge
      <i className="fas fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
    </a>
  );
}

function DateCell({ point, phaseKey }) {
  return (
    <>
      <p className="text-white font-semibold text-sm">{pointDisplayLabel(point)}</p>
      {point.familyNote && <p className="text-xs text-slate-500 mt-1">{point.familyNote}</p>}
      {phaseKey === "results" && <GulfTimeNote point={point} />}
    </>
  );
}

// Every milestone as a flat list of { phaseKey, point } - shared by both the
// desktop table and the mobile card stack so the two layouts never drift.
function flattenSeries(series) {
  const rows = [];
  for (const phaseKey of PHASE_ORDER) {
    const phase = series[phaseKey];
    if (!phase) continue;
    for (const point of phase.points) rows.push({ phaseKey, point });
  }
  return rows;
}

function SeriesTable({ series }) {
  const rows = flattenSeries(series);
  const accent = SERIES_ACCENT_COLORS[series.type];

  return (
    <div className="mb-8 last:mb-0">
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${accent.border}`}>
        <h3 className="text-white font-black text-base sm:text-lg">{series.seriesLabel}</h3>
      </div>

      {/* Desktop / tablet: a real table with fixed column widths so the
          Source column can never stretch row height out of proportion. */}
      <div className="hidden min-[700px]:block overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full text-sm border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "45%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr className="bg-white/5 text-left">
              <th scope="col" className="px-4 py-3 font-black text-slate-300 uppercase text-xs tracking-widest">Phase</th>
              <th scope="col" className="px-4 py-3 font-black text-slate-300 uppercase text-xs tracking-widest">Milestone</th>
              <th scope="col" className="px-4 py-3 font-black text-slate-300 uppercase text-xs tracking-widest">Date</th>
              <th scope="col" className="px-4 py-3 font-black text-slate-300 uppercase text-xs tracking-widest">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ phaseKey, point }, i) => (
              <tr key={i} className="border-t border-white/5 align-top">
                <td className="px-4 py-3"><PhaseBadge phaseKey={phaseKey} /></td>
                <td className="px-4 py-3 text-slate-300 text-sm">{point.label}</td>
                <td className="px-4 py-3"><DateCell point={point} phaseKey={phaseKey} /></td>
                <td className="px-4 py-3"><SourceLink point={point} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Below ~700px: one card per milestone - never a horizontally
          scrolling table on a phone. */}
      <div className="min-[700px]:hidden space-y-3">
        {rows.map(({ phaseKey, point }, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-[#141b2c]/70 p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <PhaseBadge phaseKey={phaseKey} />
              <SourceLink point={point} />
            </div>
            <p className="text-slate-300 text-sm mb-1">{point.label}</p>
            <DateCell point={point} phaseKey={phaseKey} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Plain semantic tables (real <table> from ~700px up, stacked cards below
 * it) with the exact, sourced dates for every series in
 * src/data/examDates.js - the precision layer under the timeline graphic,
 * and what search engines actually read as text.
 */
const ExamDatesTable = ({ allSeries, today }) => {
  const upcoming = allSeries.filter((s) => !isSeriesFinished(s, today));
  const past = allSeries.filter((s) => isSeriesFinished(s, today));

  return (
    <div>
      {upcoming.map((series) =>
        series.published === false ? (
          <div key={series.id} className="mb-8 last:mb-0">
            <h3 className="text-white font-black text-base sm:text-lg mb-3">{series.seriesLabel}</h3>
            <p className="text-slate-400 text-sm rounded-2xl border border-dashed border-white/10 px-5 py-4">
              {series.unpublishedNote}{" "}
              <a
                href={series.unpublishedSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-white underline transition"
              >
                Cambridge exams officers guide
              </a>
              .
            </p>
          </div>
        ) : (
          <SeriesTable key={series.id} series={series} />
        ),
      )}

      {past.length > 0 && (
        <details className="mt-4 group">
          <summary className="cursor-pointer text-slate-400 hover:text-white text-sm font-bold list-none flex items-center gap-2">
            <i className="fas fa-chevron-right text-xs transition-transform group-open:rotate-90" aria-hidden="true" />
            Past series (for reference)
          </summary>
          <div className="mt-6">
            {past.map((series) => (
              <SeriesTable key={series.id} series={series} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default ExamDatesTable;
