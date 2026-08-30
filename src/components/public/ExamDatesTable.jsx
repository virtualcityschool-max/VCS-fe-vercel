import { formatTime, getTimezoneAbbr } from "../../utils/validation";
import { isSeriesFinished, pointDisplayLabel } from "../../utils/examTimeline";
import { PHASE_LABELS } from "../../data/examDates";

const PHASE_ORDER = ["registration", "exam", "results"];

// Cambridge publishes results-release times in GMT/UTC. Converts to two
// reference zones for this audience using the app's existing timezone
// utilities (never reimplemented) - Gulf time covers Saudi Arabia, Qatar and
// Kuwait (all UTC+3); the UAE is called out separately since it's UTC+4.
function GulfTimeRow({ point }) {
  if (!point.time) {
    return point.timeSourceNote ? (
      <p className="text-slate-500 text-xs mt-1">{point.timeSourceNote}</p>
    ) : null;
  }
  const iso = `${point.date}T${point.time}:00Z`;
  const gulf = formatTime(iso, "Asia/Riyadh");
  const gulfAbbr = getTimezoneAbbr("Asia/Riyadh");
  const uk = formatTime(iso, "Europe/London");
  const ukAbbr = getTimezoneAbbr("Europe/London");

  return (
    <p className="text-slate-500 text-xs mt-1">
      {point.time} {point.timeZoneName} &middot; {gulf} {gulfAbbr} in Saudi Arabia/Qatar/Kuwait (UAE is one hour ahead) &middot; {uk} {ukAbbr} in the UK
    </p>
  );
}

function SeriesTable({ series }) {
  return (
    <div className="mb-10 last:mb-0">
      <h3 className="text-white font-black text-base sm:text-lg mb-3">{series.seriesLabel}</h3>
      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-white/5 text-left">
              <th scope="col" className="px-4 py-3 font-black text-slate-300 uppercase text-[11px] tracking-widest">Phase</th>
              <th scope="col" className="px-4 py-3 font-black text-slate-300 uppercase text-[11px] tracking-widest">Milestone</th>
              <th scope="col" className="px-4 py-3 font-black text-slate-300 uppercase text-[11px] tracking-widest">Date</th>
              <th scope="col" className="px-4 py-3 font-black text-slate-300 uppercase text-[11px] tracking-widest">Source</th>
            </tr>
          </thead>
          <tbody>
            {PHASE_ORDER.map((phaseKey) => {
              const phase = series[phaseKey];
              if (!phase) return null;
              return phase.points.map((point, i) => (
                <tr key={`${phaseKey}-${i}`} className="border-t border-white/5 align-top">
                  {i === 0 ? (
                    <td rowSpan={phase.points.length} className="px-4 py-3 text-slate-400 font-bold whitespace-nowrap">
                      {PHASE_LABELS[phaseKey]}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 text-slate-300">{point.label}</td>
                  <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                    {pointDisplayLabel(point)}
                    {point.familyNote && <p className="text-slate-500 text-xs mt-1 font-normal whitespace-normal max-w-xs">{point.familyNote}</p>}
                    {phaseKey === "results" && <GulfTimeRow point={point} />}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={point.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-white text-xs underline transition"
                    >
                      {point.sourceLabel}
                    </a>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Plain semantic tables with the exact, sourced dates for every series in
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
          <div key={series.id} className="mb-10 last:mb-0">
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
            <i className="fas fa-chevron-right text-[10px] transition-transform group-open:rotate-90" aria-hidden="true" />
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
