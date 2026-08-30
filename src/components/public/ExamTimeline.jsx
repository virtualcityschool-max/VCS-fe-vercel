import {
  axisRowLabel,
  getPhaseBounds,
  pointDisplayLabel,
  pointShortLabel,
  shortMonthName,
} from "../../utils/examTimeline";
import { SERIES_TYPE_LABELS, SERIES_ACCENT_COLORS, PHASE_COLORS, PHASE_LABELS } from "../../data/examDates";

// Layout is a fixed-unit coordinate system where 1 viewBox unit renders as
// ~1 real px on a narrow phone (the SVG is never wider than its container),
// which keeps the 12px text-size floor meaningful instead of shrinking with
// the viewport - see the effort's "never shrink text below 12px" constraint.
const VIEW_W = 328;
const ROW_H = 30;
const TOP_PAD = 10;
const BOTTOM_PAD = 14;
const AXIS_LABEL_X = 46;
const COL_X = { "may-june": 50, "oct-nov": 192 };
const COL_W = 134;
const MIN_BAR_H_1LINE = 24;
const MIN_BAR_H_2LINE = 42;
const CHAR_PX = 7; // heuristic bold-12px average character width, for fit checks

const PHASE_ORDER = ["registration", "exam", "results"];

const rowY = (pos) => TOP_PAD + pos * ROW_H;
const fitsInColumn = (text) => text.length * CHAR_PX <= COL_W - 16;

// Two short lines for registration/exam, one for results - always built from
// real point data (never a fabricated date) via pointShortLabel/shortMonthName.
function getBarLines(phaseKey, phase, bounds) {
  if (phaseKey === "registration") {
    const primary = phase.points.find((p) => p.primary) || bounds.startPoint;
    return ["Entries close", pointShortLabel(primary)];
  }
  if (phaseKey === "exam") {
    return ["Exams", `${pointShortLabel(bounds.startPoint)} – ${pointShortLabel(bounds.endPoint)}`];
  }
  const months = [...new Set(phase.points.map((p) => shortMonthName(p.date || p.anchorDate)))];
  return [`Results — ${months.join("–")}`];
}

function PhaseBar({ series, phaseKey, colX, muted }) {
  const bounds = getPhaseBounds(series[phaseKey], series.examYear);
  if (!bounds) return null;
  const colors = PHASE_COLORS[phaseKey];

  const lines = getBarLines(phaseKey, series[phaseKey], bounds);
  const allFit = lines.every(fitsInColumn);
  const minH = lines.length > 1 ? MIN_BAR_H_2LINE : MIN_BAR_H_1LINE;

  const rawY1 = rowY(bounds.startPos);
  const rawY2 = rowY(bounds.endPos);
  const mid = (rawY1 + rawY2) / 2;
  const h = Math.max(rawY2 - rawY1, minH);
  const y = rawY2 - rawY1 < minH ? mid - h / 2 : rawY1;

  const barFill = muted ? colors.barMuted : colors.bar;
  const textFill = muted ? "fill-slate-300" : "fill-white";
  const textAnchor = allFit ? "middle" : "start";
  const textX = allFit ? colX + COL_W / 2 : colX + 8;

  const lineStartY = y + h / 2 - ((lines.length - 1) * 7);
  const tooltip = `${PHASE_LABELS[phaseKey]}: ${series[phaseKey].points.map((p) => `${p.label} - ${pointDisplayLabel(p)}`).join("; ")}`;

  return (
    <g>
      <title>{tooltip}</title>
      <rect x={colX} y={y} width={COL_W} height={h} rx={7} className={barFill} />
      {lines.map((line, i) => (
        <text
          key={i}
          x={textX}
          y={lineStartY + i * 14 + 4}
          textAnchor={textAnchor}
          fontSize="12"
          fontWeight="700"
          className={textFill}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function describeSeries(entry) {
  const { series, mode } = entry;
  if (!series) return "not yet added to this page";
  if (mode === "completed") {
    return `${series.seriesLabel} (completed, shown for reference). ${PHASE_ORDER.map((key) => {
      const phase = series[key];
      if (!phase) return null;
      return `${PHASE_LABELS[key]} - ${phase.points.map((p) => `${p.label}: ${pointDisplayLabel(p)}`).join("; ")}`;
    })
      .filter(Boolean)
      .join(". ")}.`;
  }
  const parts = PHASE_ORDER.map((key) => {
    const phase = series[key];
    if (!phase) return null;
    const points = phase.points.map((p) => `${p.label}: ${pointDisplayLabel(p)}`).join("; ");
    return `${PHASE_LABELS[key]} - ${points}`;
  }).filter(Boolean);
  return `${series.seriesLabel}. ${parts.join(". ")}.`;
}

/**
 * Vertical exam-dates timeline: a 13-row Jan-to-next-January month axis
 * (each row explicitly year-labelled) with two colour-coded bar columns
 * (May/June series, Oct/Nov series). Colour encodes PHASE (registration =
 * amber, exam = rose, results = emerald) consistently in both columns; the
 * two series are told apart by column position and header accent colour
 * instead. A column with no currently-active published series shows its
 * most recently completed occurrence, muted, rather than sitting empty.
 * Renders as a single accessible SVG with real <title>/<desc> text - every
 * date is also present as plain text in the table lower on the page.
 */
const ExamTimeline = ({ seriesByType }) => {
  const totalHeight = TOP_PAD + 13 * ROW_H + BOTTOM_PAD;
  const referenceYear =
    seriesByType["oct-nov"]?.series?.examYear ?? seriesByType["may-june"]?.series?.examYear ?? new Date().getFullYear();

  const titleText = "Cambridge exam series timeline: registration, exams and results";
  const descText = ["may-june", "oct-nov"].map((type) => describeSeries(seriesByType[type])).join(" ");

  return (
    <div className="rounded-2xl border border-white/5 bg-[#1a2235]/60 backdrop-blur-xl p-5 sm:p-7">
      <div className="h-1 w-16 rounded-full mb-5" style={{ background: "linear-gradient(92deg, #818cf8 0%, #22d3ee 100%)" }} />

      {/* Legend - colour maps to phase, consistently across both columns */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-300 mb-6">
        {PHASE_ORDER.map((key) => (
          <span key={key} className="inline-flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${PHASE_COLORS[key].dot}`} aria-hidden="true" />
            {PHASE_LABELS[key]}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pl-[15%] mb-4">
        {["may-june", "oct-nov"].map((type) => {
          const entry = seriesByType[type];
          const accent = SERIES_ACCENT_COLORS[type];
          return (
            <div key={type} className={`text-center pb-2 border-b-2 ${accent.border}`}>
              <h3 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${accent.accentText}`}>
                {SERIES_TYPE_LABELS[type]}
              </h3>
              {entry.series && (
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  {entry.mode === "completed" ? (
                    <>
                      <span className="text-slate-400 font-semibold">{entry.series.seriesLabel} (completed)</span>
                      {entry.nextUnpublished && (
                        <> &mdash; {entry.nextUnpublished.examYear} dates not yet published</>
                      )}
                    </>
                  ) : (
                    entry.series.seriesLabel
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <svg
        role="img"
        viewBox={`0 0 ${VIEW_W} ${totalHeight}`}
        width="100%"
        height="auto"
        preserveAspectRatio="xMinYMin meet"
      >
        <title>{titleText}</title>
        <desc>{descText}</desc>

        {/* Distinct band behind the trailing "next year" row so it never
            reads as happening before the exams. */}
        <rect x={0} y={rowY(12)} width={VIEW_W} height={ROW_H} className="fill-indigo-500/10" />

        {Array.from({ length: 13 }, (_, i) => (
          <g key={i}>
            <text
              x={AXIS_LABEL_X}
              y={rowY(i) + ROW_H / 2 + 4}
              textAnchor="end"
              fontSize="12"
              fontWeight={i === 12 ? "800" : "400"}
              className={i === 12 ? "fill-indigo-300" : "fill-slate-500"}
            >
              {axisRowLabel(i, referenceYear)}
            </text>
            <line x1={AXIS_LABEL_X + 4} y1={rowY(i)} x2={VIEW_W} y2={rowY(i)} className="stroke-white/5" strokeWidth="1" />
          </g>
        ))}

        {["may-june", "oct-nov"].map((type) => {
          const entry = seriesByType[type];
          if (!entry.series || entry.mode === "none") return null;
          return (
            <g key={type}>
              {PHASE_ORDER.map((phaseKey) => (
                <PhaseBar
                  key={phaseKey}
                  series={entry.series}
                  phaseKey={phaseKey}
                  colX={COL_X[type]}
                  muted={entry.mode === "completed"}
                />
              ))}
            </g>
          );
        })}
      </svg>

      <p className="text-xs text-slate-500 mt-3">
        <span className="text-indigo-300 font-bold">Jan '{String(referenceYear + 1).slice(-2)}</span> (highlighted row) is
        the following calendar year - Oct/Nov results always arrive after the year turns over.
      </p>
    </div>
  );
};

export default ExamTimeline;
