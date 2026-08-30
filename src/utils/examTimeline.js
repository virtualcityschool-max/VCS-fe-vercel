// Pure computation helpers for the exam dates page. Kept separate from
// src/data/examDates.js so that file can stay data-only and editable via the
// GitHub web UI without anyone needing to touch logic.

const DAY_MS = 24 * 60 * 60 * 1000;

const toUtcDate = (isoDate) => new Date(`${isoDate}T00:00:00Z`);

// Continuous position on a 13-row Jan-Dec-Jan axis, e.g. "2026-08-16" with
// anchorYear 2026 -> ~7.5 (partway through the 8th row, August). A January
// date that falls in anchorYear + 1 lands in row 12 (the 13th row) instead
// of wrapping back to row 0, per the "results land in January of the next
// year" requirement.
export function monthAxisPosition(isoDate, anchorYear) {
  const d = toUtcDate(isoDate);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const frac = (day - 1) / daysInMonth;
  const row = m === 0 && y > anchorYear ? 12 : m;
  return row + frac;
}

export const AXIS_ROW_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
  "January",
];

const pointDate = (point) => point.date || point.anchorDate;

// The date/time text that should actually be rendered for a point - never a
// fabricated exact day for an `exact: false` point.
export function pointDisplayLabel(point) {
  return point.exact === false ? point.displayDate : formatIsoDate(point.date);
}

export function formatIsoDate(isoDate) {
  if (!isoDate) return "";
  return toUtcDate(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Start/end position (in axis rows) + earliest/latest point for a phase
// (registration | exam | results), derived from its points so the graphic
// never needs a separately-maintained window field that could drift from
// the points list.
export function getPhaseBounds(phase, anchorYear) {
  if (!phase || !phase.points?.length) return null;
  let startPoint = phase.points[0];
  let endPoint = phase.points[0];
  for (const p of phase.points) {
    if (pointDate(p) < pointDate(startPoint)) startPoint = p;
    if (pointDate(p) > pointDate(endPoint)) endPoint = p;
  }
  return {
    startPoint,
    endPoint,
    startPos: monthAxisPosition(pointDate(startPoint), anchorYear),
    endPos: monthAxisPosition(pointDate(endPoint), anchorYear),
  };
}

// A series is "finished" once its last known point is in the past. Series
// with no exam/results data yet (published: false) are never "finished".
export function isSeriesFinished(series, today) {
  const phases = [series.results, series.exam, series.registration].filter(Boolean);
  if (!phases.length) return false;
  const last = phases[0].points.reduce(
    (latest, p) => (pointDate(p) > pointDate(latest) ? p : latest),
    phases[0].points[0],
  );
  return toUtcDate(pointDate(last)).getTime() + DAY_MS <= today.getTime();
}

// Picks the one series per type ("may-june" | "oct-nov") the timeline
// graphic should show: the soonest one that isn't finished yet, so a fully-
// past series (e.g. June 2026, once August's results are out) automatically
// drops out in favour of the next occurrence - even an unpublished/TBC one -
// rather than leading the page with something that already happened.
export function pickCurrentSeriesByType(allSeries, today) {
  const result = {};
  for (const type of Object.keys({ "may-june": 0, "oct-nov": 0 })) {
    const candidates = allSeries
      .filter((s) => s.type === type)
      .sort((a, b) => a.examYear - b.examYear);
    const notFinished = candidates.find((s) => !isSeriesFinished(s, today));
    result[type] = notFinished || candidates[candidates.length - 1] || null;
  }
  return result;
}

// The single nearest future family-facing milestone across all series, for
// the page's live status line. Uses each point's real date when exact, or
// its documented anchor date when Cambridge has only given a vague month
// (the anchor is used purely for sorting - the rendered text always uses
// pointDisplayLabel, never the anchor itself).
export function getNextMilestone(allSeries, today) {
  const candidates = [];
  for (const series of allSeries) {
    for (const phaseKey of ["registration", "exam", "results"]) {
      const phase = series[phaseKey];
      if (!phase) continue;
      for (const point of phase.points) {
        if (!point.highlight) continue;
        const d = toUtcDate(pointDate(point));
        if (d.getTime() >= today.getTime()) {
          candidates.push({ point, series, phaseKey, sortTime: d.getTime() });
        }
      }
    }
  }
  candidates.sort((a, b) => a.sortTime - b.sortTime);
  return candidates[0] || null;
}

// schema.org Event entries for structured data - one per point that has a
// Cambridge-confirmed exact date. Approximate ("Late September") and
// unpublished points are deliberately excluded: structured data should be
// more conservative than page prose, never less.
export function buildExamEvents(allSeries, siteUrl) {
  const events = [];
  for (const series of allSeries) {
    for (const phaseKey of ["registration", "exam", "results"]) {
      const phase = series[phaseKey];
      if (!phase) continue;
      for (const point of phase.points) {
        if (!point.exact || !point.date) continue;
        const startDate = point.time ? `${point.date}T${point.time}:00Z` : point.date;
        events.push({
          "@type": "Event",
          name: `${series.seriesLabel}: ${point.label}`,
          startDate,
          endDate: startDate,
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          description: point.label,
          url: `${siteUrl}/exam-dates`,
          organizer: {
            "@type": "Organization",
            name: "Cambridge International Education",
            url: "https://www.cambridgeinternational.org",
          },
        });
      }
    }
  }
  return events;
}
