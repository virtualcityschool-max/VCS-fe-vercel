// Cambridge O Level / IGCSE / AS & A Level exam dates and deadlines.
//
// ============================================================================
// HOW TO UPDATE THIS FILE (no component code needs to change)
// ============================================================================
// 1. Every date below was copied verbatim from a Cambridge International key
//    dates document. When Cambridge publishes a new series or revises a
//    date, edit the matching point's `date` (and bump LAST_VERIFIED at the
//    top) - the timeline graphic, the table and the "next milestone" status
//    line all recompute automatically from this data.
// 2. NEVER invent or carry-forward a date. If Cambridge only gives a vague
//    month (e.g. "Late September"), set `exact: false` and fill in
//    `displayDate` with Cambridge's own wording - that exact text is what
//    gets shown everywhere. `anchorDate` in that case is ONLY used to
//    position the bar in the graphic; it is never rendered as text anywhere.
// 3. Every point needs a `sourceUrl` pointing at the actual Cambridge
//    document the date came from.
// 4. To add the next series (e.g. November 2027) once Cambridge publishes
//    it: copy one of the `published: true` series objects below, fill in
//    the real dates, and add it to EXAM_SERIES. The page always shows the
//    soonest not-yet-finished "May/June" series and the soonest not-yet-
//    finished "Oct/Nov" series - older ones stay in the data (and in the
//    table, for search visibility) but drop out of the timeline graphic.
// ============================================================================

export const SITE_URL = "https://virtualcityschool.com";

// Bump this to today's date every time you check/edit anything below.
// Shown on the page as "Last verified".
export const LAST_VERIFIED = "2026-08-30";

// Cambridge source documents referenced below. Keeping these as named
// constants means a URL only needs updating in one place if Cambridge moves
// a file.
const SOURCES = {
  JUNE_2026_KEY_DATES:
    "https://www.cambridgeinternational.org/Images/746005-key-dates-for-june-2026-series-international-.pdf",
  NOV_2026_KEY_DATES:
    "https://www.cambridgeinternational.org/Images/746006-key-dates-for-november-2026-series-international-.pdf",
  RESULTS_TIME_HELP_ARTICLE:
    "https://help.cambridgeinternational.org/hc/en-gb/articles/29567611785234-When-will-June-2026-results-be-released",
  EXAMS_OFFICERS_GUIDE: "https://www.cambridgeinternational.org/examsofficersguide",
  ADMIN_ZONE_TOOL: "https://www.cambridgeinternational.org/adminzone",
};

// Column headings on the timeline graphic, and the grouping used in the
// table. Cambridge runs these two series worldwide every year.
export const SERIES_TYPE_LABELS = {
  "may-june": "May/June series",
  "oct-nov": "Oct/Nov series",
};

// One accent colour per SERIES (column identity) - cyan/indigo, the same
// pairing used on the homepage hero badge and country pages (matches the
// site's .text-gradient too). Bars themselves are coloured by PHASE, not by
// series - see PHASE_COLORS below - so series identity here is carried by
// column position, this header colour, and the underline border, not hue.
export const SERIES_ACCENT_COLORS = {
  "may-june": {
    text: "text-cyan-300",
    accentText: "text-cyan-400",
    border: "border-cyan-400/50",
  },
  "oct-nov": {
    text: "text-indigo-300",
    accentText: "text-indigo-400",
    border: "border-indigo-400/50",
  },
};

// One colour per PHASE, reused consistently across both series' columns in
// the timeline and every row in the table, so colour actually encodes
// meaning (which phase) instead of decorating. All three are already used
// elsewhere on the site (amber on the zone callout/FAQ kicker, rose in
// testimonials/badges, emerald on the WhatsApp button) - no new hues.
export const PHASE_COLORS = {
  registration: {
    text: "text-amber-300",
    accentText: "text-amber-400",
    bar: "fill-amber-500/85",
    barMuted: "fill-amber-500/30",
    dot: "bg-amber-400",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-400/40",
    badgeText: "text-amber-300",
  },
  exam: {
    text: "text-rose-300",
    accentText: "text-rose-400",
    bar: "fill-rose-500/85",
    barMuted: "fill-rose-500/30",
    dot: "bg-rose-400",
    badgeBg: "bg-rose-500/15",
    badgeBorder: "border-rose-400/40",
    badgeText: "text-rose-300",
  },
  results: {
    text: "text-emerald-300",
    accentText: "text-emerald-400",
    bar: "fill-emerald-500/85",
    barMuted: "fill-emerald-500/30",
    dot: "bg-emerald-400",
    badgeBg: "bg-emerald-500/15",
    badgeBorder: "border-emerald-400/40",
    badgeText: "text-emerald-300",
  },
};

export const PHASE_LABELS = {
  registration: "Registration",
  exam: "Exams",
  results: "Results",
};

// ============================================================================
// THE EXAM SERIES DATA
// ============================================================================
// `examYear` anchors the timeline's month axis (see src/utils/examTimeline.js)
// - it should be the calendar year that most of the series' activity falls
// in. A results date that lands in January of examYear+1 is what puts a bar
// in the timeline's 13th "January" row.
//
// Every `points` entry:
//   label        - exact wording shown in the table and (space permitting)
//                  the graphic
//   date         - "YYYY-MM-DD", Cambridge's exact published day, or null
//   exact        - true if `date` is a real Cambridge-published day
//   displayDate  - required when exact is false - Cambridge's own wording
//                  ("Late September 2026"), shown instead of a fabricated day
//   anchorDate   - "YYYY-MM-DD" always present; equals `date` when exact,
//                  otherwise a documented visual-only estimate used purely
//                  to size/position the bar - never rendered as text
//   time         - "HH:MM" 24h, only when Cambridge publishes a release time
//   timeZoneName - the zone that `time` is expressed in (e.g. "GMT")
//   sourceUrl    - the Cambridge document the date came from
//   sourceLabel  - human-readable label for that link
//   familyNote   - optional caveat shown under the date, for anything a
//                  family could misread (e.g. a centre-vs-Cambridge deadline)
//   highlight    - true if this point should be eligible to appear in the
//                  page's live "next milestone" status line
//   primary      - true on the one point per registration phase that should
//                  be used as the short "Entries close" headline date in the
//                  timeline graphic (Cambridge's real final-entries cutoff,
//                  not a late/retake extension)
//   shortDisplay - only needed on an `exact: false` point - a compact form
//                  of displayDate for the timeline graphic's narrow bars,
//                  e.g. displayDate "Late September 2026" -> "late Sep"

export const EXAM_SERIES = [
  {
    id: "june-2026",
    type: "may-june",
    seriesLabel: "May/June 2026 series",
    examYear: 2026,
    published: true,
    registration: {
      points: [
        {
          label: "Final entries deadline (school submits to Cambridge)",
          date: "2026-02-21",
          exact: true,
          anchorDate: "2026-02-21",
          primary: true,
          sourceUrl: SOURCES.JUNE_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for June 2026 series (PDF)",
          familyNote:
            "This is Cambridge's cutoff for your school to submit its entries - not necessarily your own school's internal deadline, which is often earlier. Confirm the real cut-off with your exams officer.",
          highlight: true,
        },
        {
          label: "Late entries deadline",
          date: "2026-04-17",
          exact: true,
          anchorDate: "2026-04-17",
          sourceUrl: SOURCES.JUNE_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for June 2026 series (PDF)",
          highlight: true,
        },
      ],
    },
    exam: {
      points: [
        {
          label: "Start of timetabled exam period",
          date: "2026-04-23",
          exact: true,
          anchorDate: "2026-04-23",
          sourceUrl: SOURCES.JUNE_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for June 2026 series (PDF)",
          highlight: true,
        },
        {
          label: "End of timetabled exam period",
          date: "2026-06-09",
          exact: true,
          anchorDate: "2026-06-09",
          sourceUrl: SOURCES.JUNE_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for June 2026 series (PDF)",
          highlight: true,
        },
      ],
    },
    results: {
      points: [
        {
          label: "Results released - Cambridge International AS & A Level",
          date: "2026-08-11",
          exact: true,
          anchorDate: "2026-08-11",
          time: "05:00",
          timeZoneName: "GMT",
          sourceUrl: SOURCES.JUNE_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for June 2026 series (PDF)",
          timeSourceUrl: SOURCES.RESULTS_TIME_HELP_ARTICLE,
          timeSourceLabel: "Cambridge help centre: When will June 2026 results be released?",
          highlight: true,
        },
        {
          label: "Results released - Cambridge IGCSE & O Level",
          date: "2026-08-18",
          exact: true,
          anchorDate: "2026-08-18",
          time: "05:00",
          timeZoneName: "GMT",
          sourceUrl: SOURCES.JUNE_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for June 2026 series (PDF)",
          timeSourceUrl: SOURCES.RESULTS_TIME_HELP_ARTICLE,
          timeSourceLabel: "Cambridge help centre: When will June 2026 results be released?",
          highlight: true,
        },
      ],
    },
  },

  {
    id: "nov-2026",
    type: "oct-nov",
    seriesLabel: "October/November 2026 series",
    examYear: 2026,
    published: true,
    registration: {
      points: [
        {
          label: "Final entries deadline (school submits to Cambridge)",
          date: "2026-08-16",
          exact: true,
          anchorDate: "2026-08-16",
          primary: true,
          sourceUrl: SOURCES.NOV_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for November 2026 series (PDF)",
          familyNote:
            "This is Cambridge's cutoff for your school to submit its entries - not necessarily your own school's internal deadline, which is often earlier. Confirm the real cut-off with your exams officer.",
          highlight: true,
        },
        {
          label: "Retake entries deadline (June 2026 retakes only)",
          date: "2026-09-21",
          exact: true,
          anchorDate: "2026-09-21",
          sourceUrl: SOURCES.NOV_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for November 2026 series (PDF)",
          familyNote: "Only applies if you're retaking a paper you sat in the June 2026 series.",
          highlight: true,
        },
        {
          label: "Late entries deadline",
          date: "2026-09-21",
          exact: true,
          anchorDate: "2026-09-21",
          sourceUrl: SOURCES.NOV_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for November 2026 series (PDF)",
          highlight: true,
        },
      ],
    },
    exam: {
      // Cambridge's own key-dates document gives only "Late September" and
      // "Mid-November" for this series - no exact day. Do not invent one.
      points: [
        {
          label: "Start of timetabled exam period",
          date: null,
          exact: false,
          displayDate: "Late September 2026",
          shortDisplay: "late Sep",
          anchorDate: "2026-09-26",
          sourceUrl: SOURCES.NOV_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for November 2026 series (PDF)",
          highlight: true,
        },
        {
          label: "End of timetabled exam period",
          date: null,
          exact: false,
          displayDate: "Mid-November 2026",
          shortDisplay: "mid Nov",
          anchorDate: "2026-11-15",
          sourceUrl: SOURCES.NOV_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for November 2026 series (PDF)",
          highlight: true,
        },
      ],
    },
    results: {
      points: [
        {
          label: "Results released - Cambridge International AS & A Level",
          date: "2027-01-07",
          exact: true,
          anchorDate: "2027-01-07",
          time: null,
          timeZoneName: null,
          timeSourceNote:
            "Cambridge has not yet published an exact release time for this date - only the day is confirmed so far.",
          sourceUrl: SOURCES.NOV_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for November 2026 series (PDF)",
          highlight: true,
        },
        {
          label: "Results released - Cambridge IGCSE & O Level",
          date: "2027-01-14",
          exact: true,
          anchorDate: "2027-01-14",
          time: null,
          timeZoneName: null,
          timeSourceNote:
            "Cambridge has not yet published an exact release time for this date - only the day is confirmed so far.",
          sourceUrl: SOURCES.NOV_2026_KEY_DATES,
          sourceLabel: "Cambridge: Key dates for November 2026 series (PDF)",
          highlight: true,
        },
      ],
    },
  },

  {
    id: "june-2027",
    type: "may-june",
    seriesLabel: "May/June 2027 series",
    examYear: 2027,
    // Cambridge has not published a key dates document for this series yet.
    // Do not fill in registration/exam/results below with guesses or with
    // last year's dates - leave them null until a real source exists.
    published: false,
    unpublishedNote:
      "Cambridge has not yet published entry, exam or results dates for this series. Check Cambridge's exams officers guide directly, or check back here closer to the time.",
    unpublishedSourceUrl: SOURCES.EXAMS_OFFICERS_GUIDE,
    registration: null,
    exam: null,
    results: null,
  },
];

// Administrative zone explainer content - confirmed directly on
// cambridgeinternational.org. Deliberately does not map any country to a
// zone: the candidate's exam centre determines the zone, sources disagree,
// and a wrong zone can mean a missed exam.
export const ZONE_INFO = {
  quote:
    "Each location is allocated to one of six administrative zones. This helps us maintain exam security, and manage the timetabling of our exams.",
  sourceUrl: SOURCES.ADMIN_ZONE_TOOL,
  sourceLabel: "Cambridge International: administrative zone tool",
};
