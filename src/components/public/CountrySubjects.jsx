import { Link } from "react-router-dom";
import { GUIDE_CATALOG, guideForCode } from "../../data/subjectGuides/catalog";
import COURSE_INDEX from "../../data/courseIndex.json";
import Reveal from "../ui/Reveal";

// "Popular subjects and courses" on each country page: every subject guide,
// with links to that subject's live classes (main page of each class batch).
const LEVELS = [
  { level: "O Level", tone: "border-t-emerald-400/70", chip: "text-emerald-300" },
  { level: "AS & A Level", tone: "border-t-violet-400/70", chip: "text-violet-300" },
];

const classLabel = (course, guideLevel) =>
  course.stage === "AS" ? "AS class" : course.stage === "A2" ? "A2 class" : guideLevel === "O Level" ? "O Level class" : "Class";

const coursesFor = (slug) =>
  COURSE_INDEX.filter((c) => !c.canonical && c.code && guideForCode(c.code)?.slug === slug);

const CountrySubjects = ({ countryName }) => (
  <Reveal className="mb-12">
    <h2 className="text-2xl md:text-3xl font-black font-poppins tracking-tight mb-3">
      Popular subjects and courses for families in {countryName}
    </h2>
    <p className="text-slate-300 text-base leading-relaxed max-w-3xl mb-6">
      Read the guide to see what each Cambridge subject covers and how it is examined, then join a live class.
    </p>
    <div className="grid lg:grid-cols-2 gap-5">
      {LEVELS.map(({ level, tone, chip }) => (
        <div key={level} className={`rounded-2xl border border-white/10 border-t-4 ${tone} bg-white/[0.03] p-5`}>
          <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${chip}`}>{level}</h3>
          <ul className="divide-y divide-white/5">
            {GUIDE_CATALOG.filter((g) => g.level === level).map((g) => {
              const classes = coursesFor(g.slug);
              return (
                <li key={g.slug} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
                  <Link to={`/subjects/${g.slug}`} className="text-base font-semibold text-white hover:text-indigo-300 transition">
                    {g.subject} <span className="text-slate-400 font-normal">{g.code}</span>
                  </Link>
                  {classes.length > 0 && (
                    <span className="flex flex-wrap gap-2">
                      {classes.map((c) => (
                        <Link key={c.id} to={`/courses/${c.id}`} title={c.title} className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-500/10 border border-indigo-400/30 text-indigo-200 hover:text-white hover:bg-indigo-500/20 transition">
                          {classLabel(c, g.level)}
                        </Link>
                      ))}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
      <Link to="/courses" className="text-indigo-300 hover:text-white text-sm font-black uppercase tracking-widest transition">All courses →</Link>
      <Link to="/subjects" className="text-indigo-300 hover:text-white text-sm font-black uppercase tracking-widest transition">All subject guides →</Link>
    </div>
  </Reveal>
);

export default CountrySubjects;
