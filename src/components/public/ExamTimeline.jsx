import {
  AXIS_ROW_LABELS,
  getPhaseBounds,
  isSeriesFinished,
  pointDisplayLabel,
} from "../../utils/examTimeline";
import { SERIES_TYPE_LABELS, SERIES_TYPE_COLORS } from "../../data/examDates";

// Layout is a fixed-unit coordinate system where 1 viewBox unit renders as
// ~1 real px on a narrow phone (the SVG is never wider than its container),
// which keeps the 12px text-size floor meaningful instead of shrinking with
// the viewport - see the effort's "never shrink text below 12px" constraint.
const VIEW_W = 310;
const ROW_H = 28;
const TOP_PAD = 10;
const BOTTOM_PAD = 14;
const AXIS_LABEL_X = 60;
const COL_X = { "may-june": 64, "oct-nov": 184 };
const COL_W = 70;
const OUTSIDE_OFFSET = 6;
const MIN_BAR_H = 7;
const INSIDE_LABEL_MIN_H = 20;

const GRAPHIC_PHASE_LABELS = { registration: "Entries", exam: "Exams", results: "Results" };
const PHASE_ORDER = ["registration", "exam", "results"];

const rowY = (pos) => TOP_PAD + pos * ROW_H;

function PhaseBar({ series, phaseKey, colX, colors, finished }) {
  const bounds = getPhaseBounds(series[phaseKey], series.examYear);
  if (!bounds) return null;

  const rawY1 = rowY(bounds.startPos);
  const rawY2 = rowY(bounds.endPos);
  const mid = (rawY1 + rawY2) / 2;
  const rawH = rawY2 - rawY1;
  const h = Math.max(rawH, MIN_BAR_H);
  const y = rawH < MIN_BAR_H ? mid - h / 2 : rawY1;

  const insideFits = h >= INSIDE_LABEL_MIN_H;
  const label = GRAPHIC_PHASE_LABELS[phaseKey];
  const barFill = finished ? colors.barPast : colors.bar;
  const textFill = finished ? "fill-slate-400" : "fill-white";

  return (
    <g>
      <rect x={colX} y={y} width={COL_W} height={h} rx={5} className={barFill} />
      {insideFits ? (
        <text
          x={colX + COL_W / 2}
          y={y + h / 2 + 4}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          className={textFill}
        >
          {label}
        </text>
      ) : (
        <>
          <line
            x1={colX + COL_W}
            y1={mid}
            x2={colX + COL_W + OUTSIDE_OFFSET - 2}
            y2={mid}
            className={finished ? "stroke-slate-600" : "stroke-slate-400"}
            strokeWidth="1"
          />
          <text
            x={colX + COL_W + OUTSIDE_OFFSET}
            y={mid + 4}
            textAnchor="start"
            fontSize="12"
            fontWeight="700"
            className={finished ? "fill-slate-500" : "fill-slate-300"}
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}

function describeSeries(series) {
  if (!series) return "not yet added to this page";
  if (series.published === false) return `${series.seriesLabel}: not yet published by Cambridge`;
  const parts = PHASE_ORDER.map((key) => {
    const phase = series[key];
    if (!phase) return null;
    const points = phase.points
      .map((p) => `${p.label}: ${pointDisplayLabel(p)}`)
      .join("; ");
    return `${GRAPHIC_PHASE_LABELS[key]} - ${points}`;
  }).filter(Boolean);
  return `${series.seriesLabel}. ${parts.join(". ")}.`;
}

/**
 * Vertical exam-dates timeline: a 13-row January-to-January month axis with
 * two colour-coded bar columns (May/June series, Oct/Nov series), each
 * showing a registration, exam and results bar sized directly from
 * src/data/examDates.js. Renders as a single accessible SVG with real
 * <title>/<desc> text - every date is also present as plain text in the
 * table lower on the page.
 */
const ExamTimeline = ({ seriesByType, today }) => {
  const totalHeight = TOP_PAD + 13 * ROW_H + BOTTOM_PAD;

  const titleText = "Cambridge exam series timeline: registration, exams and results";
  const descText = ["may-june", "oct-nov"]
    .map((type) => describeSeries(seriesByType[type]))
    .join(" ");

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 pl-[19%] mb-3">
        {["may-june", "oct-nov"].map((type) => {
          const series = seriesByType[type];
          const colors = SERIES_TYPE_COLORS[type];
          return (
            <div key={type} className="text-center">
              <h3 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${colors.accentText}`}>
                {SERIES_TYPE_LABELS[type]}
              </h3>
              {series && (
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{series.seriesLabel}</p>
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

        {AXIS_ROW_LABELS.map((name, i) => (
          <g key={i}>
            <text
              x={AXIS_LABEL_X}
              y={rowY(i) + ROW_H / 2 + 4}
              textAnchor="end"
              fontSize="12"
              className="fill-slate-500"
            >
              {name}
              {i === 12 ? " *" : ""}
            </text>
            <line
              x1={AXIS_LABEL_X + 4}
              y1={rowY(i)}
              x2={VIEW_W}
              y2={rowY(i)}
              className="stroke-white/5"
              strokeWidth="1"
            />
          </g>
        ))}

        {["may-june", "oct-nov"].map((type) => {
          const series = seriesByType[type];
          if (!series || series.published === false) return null;
          const finished = isSeriesFinished(series, today);
          const colors = SERIES_TYPE_COLORS[type];
          return (
            <g key={type}>
              {PHASE_ORDER.map((phaseKey) => (
                <PhaseBar
                  key={phaseKey}
                  series={series}
                  phaseKey={phaseKey}
                  colX={COL_X[type]}
                  colors={colors}
                  finished={finished}
                />
              ))}
            </g>
          );
        })}
      </svg>

      <p className="text-[11px] text-slate-500 mt-2">* the following January - results for the Oct/Nov series arrive after the calendar year turns over.</p>

      {["may-june", "oct-nov"].map((type) => {
        const series = seriesByType[type];
        if (!series || series.published !== false) return null;
        return (
          <p key={type} className="text-xs text-slate-500 mt-2">
            <span className={`font-bold ${SERIES_TYPE_COLORS[type].accentText}`}>{SERIES_TYPE_LABELS[type]}:</span>{" "}
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
        );
      })}
    </div>
  );
};

export default ExamTimeline;
