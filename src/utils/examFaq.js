// Questions for the /exam-dates page, phrased the way people search Google
// (Search Console, Nov 2026: "o level registration deadline", "o level retake
// registration", "o level results 2027", "o level date sheet 2027 pakistan").
// Every answer is built from src/data/examDates.js, so it never states a date
// Cambridge hasn't published, and it updates itself when that file changes.
import { isSeriesFinished, pointDisplayLabel } from "./examTimeline";

const points = (series, phase) => series?.[phase]?.points || [];
const find = (series, phase, re) => points(series, phase).find((p) => re.test(p.label));

export function buildExamFaq(allSeries, today = new Date()) {
  const upcoming = allSeries.filter((s) => !isSeriesFinished(s, today));
  const published = allSeries.filter((s) => s.published !== false);
  const lastOfType = (type) => [...published].reverse().find((s) => s.type === type);

  // 1. Registration deadlines
  const reg = upcoming.map((s) => {
    if (s.published === false) {
      const prev = lastOfType(s.type);
      const prevFinal = find(prev, "registration", /^Final entries/i);
      return `${s.seriesLabel}: Cambridge hasn't published the entry deadlines yet${prevFinal ? ` (for the ${prev.seriesLabel} the final entries deadline was ${pointDisplayLabel(prevFinal)})` : ""}.`;
    }
    const final = find(s, "registration", /^Final entries/i);
    const late = find(s, "registration", /^Late entries/i);
    return `${s.seriesLabel}: final entries ${final ? pointDisplayLabel(final) : "-"}${late ? `, late entries ${pointDisplayLabel(late)}` : ""}.`;
  });

  // 2. Retakes (the Oct/Nov series)
  const nov = lastOfType("oct-nov");
  const retake = find(nov, "registration", /retake/i);

  // 3. Results days
  const res = [];
  for (const s of upcoming) {
    for (const p of points(s, "results")) res.push(`${p.label.replace(/^Results released - /, "")} (${s.seriesLabel.replace(/ series$/, "")}): ${pointDisplayLabel(p)}`);
    for (const a of s.announced || []) if (/^Results/i.test(a.label)) res.push(`${a.label.replace(/^Results released - /, "")} (${s.seriesLabel.replace(/ series$/, "")}): ${a.displayDate}, announced by Cambridge`);
  }

  // 4. Zone timetables
  const ttSeries = allSeries.find((s) => s.announced?.some((a) => /timetable/i.test(a.label)));
  const tt = ttSeries?.announced.find((a) => /timetable/i.test(a.label));

  return [
    {
      q: "When is the O Level and A Level registration deadline?",
      a: `${reg.join(" ")} These are Cambridge's deadlines for schools and exam centres to submit entries; your school or the British Council (for private candidates) sets its own registration dates, often earlier, so register as soon as it opens.`,
      link: { to: "/private-candidate", label: "Registering as a private candidate" },
    },
    {
      q: "Can I retake O Level or A Level in October/November?",
      a: `Yes. Cambridge runs an October/November series every year as well as May/June, so a subject can be retaken about five months later.${retake ? ` For the ${nov.seriesLabel}, the ${retake.label.replace(/^Retake/, "retake")} was ${pointDisplayLabel(retake)}.` : ""} Some subjects and components are only offered in certain series, so check with your exam centre before planning a retake.`,
    },
    {
      q: "When are the O Level and A Level results released?",
      a: res.length
        ? `${res.join("; ")}.${res.some((r) => r.endsWith("announced by Cambridge")) ? " Cambridge says all other results dates stay as they were." : ""}`
        : "Cambridge publishes results dates in each series' key dates document; they are added here as soon as they appear.",
    },
    {
      q: "Where is the O Level date sheet (exam timetable) for Pakistan and the Gulf?",
      a: `Cambridge publishes one exam timetable for each of its six administrative zones, with every paper's date and morning/afternoon session. Your exam centre (your school or the British Council) decides which zone you sit in, so ask them first, then use that zone's timetable from Cambridge's exam timetables page.${ttSeries ? ` The ${ttSeries.seriesLabel.replace(/ series$/, "")} timetables are already published.` : ""}`,
      href: tt?.sourceUrl || "https://www.cambridgeinternational.org/exam-administration/cambridge-exams-officers-guide/phase-1-preparation/timetabling-exams/exam-timetables/",
      hrefLabel: "Cambridge exam timetables",
    },
  ];
}
