import { Fragment } from "react";
import { Link } from "react-router-dom";
import {
  FlaskConical, AlertTriangle, ExternalLink, ChevronRight, CheckCircle2, BookOpen, Briefcase,
  Globe2, Lightbulb, Clock, FileText,
} from "lucide-react";
import { ACCENT, TONES } from "./guideSections";
import { COUNTRY_LIST } from "../../data/countryList";

// The body of a subject guide (see src/data/subjectGuides), shared by the
// guide page and the course page. Visual by design (DESIGN.md): coloured tiles,
// bars for weightings and grade boundaries, a timeline for the study plan, and
// key numbers highlighted in the subject's colour.

const Section = ({ id, n, icon, title, children }) => {
  const Icon = icon;
  return (
    <section id={id} className="scroll-mt-24 pt-12">
      <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-white mb-6">
        <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-200 shrink-0">
          <Icon className="w-5 h-5" />
        </span>
        <span>
          {n != null && <span className="text-indigo-300/70 font-mono text-lg mr-2">{n}.</span>}
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
};

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 ${className}`}>{children}</div>
);

const Note = ({ children }) => (children ? <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-4xl">{children}</p> : null);

// Highlight the key facts inside a sentence: percentages, marks, hours, papers, A*.
const KEY = /(\d+(?:\.\d+)?\s?%|\b\d+(?:[–-]\d+)?\s(?:hours?|marks?|minutes?|papers?|questions?|topics?)\b|\bPapers? \d+(?:\s?(?:and|&|or)\s?\d+)?\b|\bA\*)/g;
const hl = (text, cls) => {
  if (typeof text !== "string") return text;
  const parts = text.split(KEY);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className={`${cls} font-semibold`}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
};

// A paper's share of the full qualification, for its bar: "15.5% of A Level"
// wins over the AS share; otherwise the first percentage; else nothing.
const paperShare = (weight = "") => {
  const al = String(weight).match(/(\d+(?:\.\d+)?)%\s*of A Level/);
  if (al) return Number(al[1]);
  const pc = String(weight).match(/(\d+(?:\.\d+)?)\s*%/);
  return pc ? Number(pc[1]) : null;
};

// The first number in a grade's "roughly" column, for its bar.
const gradePct = (pct = "") => {
  const m = String(pct).match(/(\d+(?:\.\d+)?)/);
  return m ? Math.min(100, Number(m[1])) : null;
};

// Grade colours from top to bottom.
const GRADE_BARS = ["from-emerald-400 to-teal-300", "from-lime-400 to-emerald-300", "from-sky-400 to-cyan-300", "from-indigo-400 to-sky-300", "from-violet-400 to-indigo-300", "from-amber-400 to-orange-300", "from-rose-400 to-pink-300"];

// `courses`: this school's published courses for the syllabus, listed in
// "Study it with us" so a reader can go straight to one and enrol.
const GuideBody = ({ g, sections, courses = [] }) => {
  const accent = ACCENT[g.accent] || ACCENT.violet;
  const hi = (t) => hl(t, accent.text);
  // Props for each <Section>: its id, number, icon and title.
  const has = (id) => sections.some((v) => v.id === id);
  const meta = (id) => { const x = sections.find((v) => v.id === id); return { id, n: x.n, icon: x.icon, title: x.title }; };
  return (
    <>
      {has("facts") && (
      <Section {...meta("facts")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {g.quickFacts.map((f, i) => {
            const t = TONES[i % TONES.length];
            return (
              <div key={f.label} className={`rounded-2xl border p-5 ${t.card}`}>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-2">{f.label}</div>
                <div className={`text-2xl font-black leading-tight ${t.text}`}>{f.value}</div>
                <div className="text-sm text-slate-300 mt-2 leading-snug">{f.note}</div>
              </div>
            );
          })}
        </div>
      </Section>
      )}

      {has("why") && (
      <Section {...meta("why")}>
        <p className="text-lg text-slate-200 mb-5 max-w-4xl leading-relaxed">{g.why.intro}</p>
        <ul className="grid md:grid-cols-2 gap-3">
          {g.why.points.map((p, i) => {
            const t = TONES[i % TONES.length];
            return (
              <li key={p} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-base text-slate-100 leading-relaxed">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.icon}`}><CheckCircle2 className="w-4 h-4" /></span>
                <span>{hi(p)}</span>
              </li>
            );
          })}
        </ul>
        <Note>{g.why.source}</Note>
      </Section>
      )}

      {has("stories") && (
      <Section {...meta("stories")}>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {g.stories.map((s, i) => {
            const t = TONES[i % TONES.length];
            return (
              <div key={s.title} className={`rounded-2xl border-t-4 border border-white/10 bg-white/[0.04] p-5 ${t.top}`}>
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${t.text}`}>{s.topics}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-base text-slate-300 leading-relaxed">{hi(s.story)}</p>
              </div>
            );
          })}
        </div>
      </Section>
      )}

      {has("topics") && (
      <Section {...meta("topics")}>
        {g.topics && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {g.topics.map((tp, i) => {
              const t = TONES[i % TONES.length];
              return (
                <div key={tp.n} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className={`flex items-start gap-3 font-bold text-white text-base ${tp.parts?.length ? "mb-3" : ""}`}>
                    <span className={`min-w-8 h-8 px-1.5 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${t.icon}`}>{tp.n}</span>
                    <span className="pt-1">{tp.name}</span>
                  </div>
                  {tp.parts?.length > 0 && (
                    <ul className="text-sm text-slate-300 space-y-1.5 pl-11">
                      {tp.parts.map((p, j) => <li key={p}><span className="text-slate-500 font-mono mr-1.5">{tp.n}.{j + 1}</span>{p}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {g.topicGroups && (
          <div className="space-y-8">
            {g.topicGroups.map((tg) => (
              <div key={tg.label}>
                <h3 className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full border ${accent.soft} ${accent.text}`}>{tg.label}</h3>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {tg.groups.map((gr, i) => {
                    const t = TONES[i % TONES.length];
                    return (
                      <div key={gr.area} className={`rounded-2xl border p-4 ${t.card}`}>
                        <div className={`font-bold text-base mb-3 ${t.text}`}>{gr.area}</div>
                        <ul className="text-sm text-slate-200 space-y-1.5">{gr.topics.map(([num, name]) => <li key={num}><span className="font-mono text-slate-400 mr-2">{num}</span>{name}</li>)}</ul>
                      </div>
                    );
                  })}
                </div>
                <Note>{tg.note}</Note>
              </div>
            ))}
          </div>
        )}
      </Section>
      )}

      {has("compare") && (
      <Section {...meta("compare")}>
        <p className="text-lg text-slate-200 mb-5 max-w-4xl leading-relaxed">{g.compare.intro}</p>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-base min-w-[620px]">
            <thead className="bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-slate-100 text-sm uppercase tracking-wider">
              <tr>
                <th className="text-left p-4">Idea</th>
                <th className="text-left p-4">{g.compare.cols?.[0] || (g.level === "O Level" ? "At O Level (this course)" : "At O Level / IGCSE")}</th>
                <th className="text-left p-4">{g.compare.cols?.[1] || (g.level === "O Level" ? "At AS & A Level" : "At AS & A Level (this course)")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {g.compare.rows.map((r, i) => (
                <tr key={r.idea} className={i % 2 ? "bg-white/[0.02]" : ""}>
                  <td className={`p-4 font-semibold ${accent.text}`}>{r.idea}</td>
                  <td className="p-4 text-slate-200">{r.here}</td>
                  <td className="p-4 text-slate-200">{r.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {g.sibling && <Link to={`/subjects/${g.sibling.slug}`} className="mt-4 inline-flex items-center gap-1 text-base font-semibold text-indigo-300 hover:text-white">Read the {g.sibling.label} guide <ChevronRight className="w-4 h-4" /></Link>}
      </Section>
      )}

      {has("exam") && (
      <Section {...meta("exam")}>
        <div className="grid lg:grid-cols-2 gap-4">
          {g.papers.map((p, i) => {
            const t = TONES[i % TONES.length];
            const share = paperShare(p.weight);
            return (
              <div key={p.name} className={`rounded-2xl border p-5 ${t.card}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.icon}`}><FileText className="w-5 h-5" /></span>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-lg leading-snug">{p.name}</div>
                      <div className="text-sm text-slate-300 mt-0.5">{p.who}</div>
                    </div>
                  </div>
                  <div className={`text-right font-black text-xl ${t.text}`}>{p.weight}</div>
                </div>
                <p className="text-base text-slate-200 mt-3 leading-relaxed">{hi(p.what)}</p>
                <div className="flex flex-wrap gap-2 mt-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 border border-white/10 px-3 py-1 text-slate-100"><Clock className="w-3.5 h-3.5" /> {p.time}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 border border-white/10 px-3 py-1 text-slate-100">{p.marks} marks</span>
                </div>
                {share != null && (
                  <div className="mt-4" aria-hidden="true">
                    <div className="h-2.5 rounded-full bg-black/30 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${t.bar}`} style={{ width: `${Math.min(100, share)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {g.routes && (
          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-3">Three ways to take it</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {g.routes.map((r, i) => <div key={r.name} className={`rounded-2xl border p-4 ${TONES[(i + 2) % TONES.length].card}`}><div className="font-bold text-white text-base mb-1">{r.name}</div><div className="text-sm text-slate-200">{r.detail}</div></div>)}
            </div>
          </div>
        )}
        <Note>{g.papersNote}</Note>
      </Section>
      )}

      {has("questions") && (
      <Section {...meta("questions")}>
        <div className="grid lg:grid-cols-2 gap-4">
          {g.questionTypes.map((q, i) => {
            const t = TONES[i % TONES.length];
            return (
              <Card key={q.type}>
                <div className={`inline-block text-sm font-bold px-3 py-1 rounded-full mb-3 ${t.icon}`}>{q.type}</div>
                <blockquote className={`text-base text-white bg-black/30 border-l-4 rounded-r-xl px-4 py-3 mb-3 italic ${t.left}`}>“{q.example}”</blockquote>
                <div className="text-sm text-slate-300"><span className="text-slate-100 font-semibold">What it tests: </span>{q.testing}</div>
              </Card>
            );
          })}
        </div>
        <Note>{g.questionNote}</Note>
      </Section>
      )}

      {has("command") && (
      <Section {...meta("command")}>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-base min-w-[620px]">
            <thead className="bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-slate-100 text-sm uppercase tracking-wider"><tr><th className="text-left p-4">Word</th><th className="text-left p-4">Cambridge meaning</th><th className="text-left p-4">What to do</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {g.commandWords.map((c, i) => (
                <tr key={c.word} className={i % 2 ? "bg-white/[0.02]" : ""}>
                  <td className="p-4"><span className={`inline-block font-bold px-3 py-1 rounded-lg ${TONES[i % TONES.length].icon}`}>{c.word}</span></td>
                  <td className="p-4 text-slate-200">{c.meaning}</td>
                  <td className="p-4 text-slate-300">{c.tip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>{g.commandSource}</Note>
      </Section>
      )}

      {has("aos") && (
      <Section {...meta("aos")}>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {g.aos.map((a, i) => {
            const t = TONES[i % TONES.length];
            return (
              <div key={a.code} className={`rounded-2xl border p-5 ${t.card}`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="font-bold text-white text-base"><span className={`font-mono mr-2 ${t.text}`}>{a.code}</span>{a.name}</div>
                  <div className={`font-black text-2xl ${t.text}`}>{a.weight}%</div>
                </div>
                <div className="h-3 rounded-full bg-black/30 overflow-hidden mb-3"><div className={`h-full rounded-full bg-gradient-to-r ${t.bar}`} style={{ width: `${a.bar ?? a.weight}%` }} /></div>
                <div className="text-sm text-slate-200">{a.plain}</div>
              </div>
            );
          })}
        </div>
        <Note>{g.aoNote}</Note>
      </Section>
      )}

      {has("grades") && (
      <Section {...meta("grades")}>
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          <Card>
            <h3 className="text-lg font-bold text-white mb-1">What it took in {g.grades.thresholds.series}</h3>
            <p className="text-sm text-slate-300 mb-5">Minimum marks out of {g.grades.thresholds.max} for each grade.</p>
            <div className="space-y-3">
              {g.grades.thresholds.rows.map((r, i) => {
                const pct = gradePct(r.pct);
                return (
                  <div key={r.grade} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3">
                    <div className={`text-xl font-black ${i === 0 ? accent.text : "text-white"}`}>{r.grade}</div>
                    <div className="h-7 rounded-lg bg-black/30 overflow-hidden">
                      {pct != null && (
                        <div className={`h-full rounded-lg bg-gradient-to-r ${GRADE_BARS[i % GRADE_BARS.length]} flex items-center justify-end pr-2`} style={{ width: `${pct}%` }}>
                          <span className="text-xs font-bold text-slate-950">{r.pct}</span>
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-base text-slate-100 w-20 text-right">{r.range}</div>
                  </div>
                );
              })}
            </div>
            <Note>{g.grades.thresholds.note}</Note>
          </Card>
          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${accent.soft}`}>
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${accent.text}`}>The grade scale</div>
              <p className="text-base text-slate-100 leading-relaxed">{g.grades.scale}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-2">What a good grade means</div>
              <p className="text-base text-slate-200 leading-relaxed">{g.grades.meaning}</p>
            </div>
          </div>
        </div>
      </Section>
      )}

      {has("practical") && (
      <Section {...meta("practical")}>
        <ul className="grid md:grid-cols-2 gap-3">
          {g.practical.map((p, i) => (
            <li key={p} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-base text-slate-100">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TONES[i % TONES.length].icon}`}><FlaskConical className="w-4 h-4" /></span>
              <span>{hi(p)}</span>
            </li>
          ))}
        </ul>
      </Section>
      )}

      {has("books") && (
      <Section {...meta("books")}>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {g.books.map((b, i) => {
            const t = TONES[i % TONES.length];
            return (
              <div key={b.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className={`w-12 h-16 rounded-lg flex items-center justify-center shrink-0 ${t.icon}`}><BookOpen className="w-6 h-6" /></span>
                <div className="min-w-0">
                  <div className="font-bold text-white text-base">{b.title}</div>
                  <div className={`text-sm mt-1 ${t.text}`}>{b.by}</div>
                  <div className="text-sm text-slate-300 mt-2">{b.note}</div>
                </div>
              </div>
            );
          })}
        </div>
        <Note>{g.booksNote}</Note>
      </Section>
      )}

      {has("mistakes") && (
      <Section {...meta("mistakes")}>
        <ul className="grid md:grid-cols-2 gap-3">
          {g.mistakes.map((m) => (
            <li key={m} className="flex gap-3 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-base text-slate-100">
              <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-rose-500/20 text-rose-200"><AlertTriangle className="w-4 h-4" /></span>
              <span>{hi(m)}</span>
            </li>
          ))}
        </ul>
        <Note>{g.mistakesNote}</Note>
      </Section>
      )}

      {has("plan") && (
      <Section {...meta("plan")}>
        <ol className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {g.studyPlan.map((s, i) => {
            const t = TONES[i % TONES.length];
            return (
              <li key={s.when} className={`relative rounded-2xl border p-5 ${t.card}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black ${t.icon}`}>{i + 1}</span>
                  <span className={`text-sm font-bold uppercase tracking-widest ${t.text}`}>{s.when}</span>
                </div>
                <p className="text-base text-slate-100 leading-relaxed">{hi(s.what)}</p>
              </li>
            );
          })}
        </ol>
        <Note>{g.studyNote}</Note>
      </Section>
      )}

      {has("careers") && (
      <Section {...meta("careers")}>
        <p className="text-lg text-slate-200 mb-5 max-w-4xl leading-relaxed">{g.careers.intro}</p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {g.careers.paths.map((c, i) => {
            const t = TONES[i % TONES.length];
            return (
              <div key={c.name} className={`rounded-2xl border p-5 ${t.card}`}>
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${t.icon}`}><Briefcase className="w-5 h-5" /></span>
                <div className="font-bold text-white text-base">{c.name}</div>
                <div className="text-sm text-slate-200 mt-1">{c.need}</div>
              </div>
            );
          })}
        </div>
        <Note>Typical subject requirements — always check each university's own entry rules.</Note>
      </Section>
      )}

      {has("real") && (
      <Section {...meta("real")}>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {g.realWorld.map((r, i) => {
            const t = TONES[(i + 1) % TONES.length];
            return (
              <div key={r.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${t.icon}`}>{i % 2 ? <Lightbulb className="w-5 h-5" /> : <Globe2 className="w-5 h-5" />}</span>
                <h3 className="font-bold text-white text-lg mb-2">{r.title}</h3>
                <p className="text-base text-slate-300 leading-relaxed">{hi(r.text)}</p>
              </div>
            );
          })}
        </div>
      </Section>
      )}

      {has("faq") && (
      <Section {...meta("faq")}>
        <div className="grid lg:grid-cols-2 gap-3 items-start">
          {g.faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 open:border-indigo-400/40 open:bg-indigo-500/10">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-semibold text-white text-base">
                {f.q}<ChevronRight className="w-5 h-5 shrink-0 text-indigo-300 transition group-open:rotate-90" />
              </summary>
              <p className="text-base text-slate-200 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
      )}

      {has("vcs") && (
      <Section {...meta("vcs")}>
        <div className="rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-600/25 to-violet-600/10 p-6 md:p-8">
          <p className="text-lg text-slate-100 mb-6 max-w-4xl leading-relaxed">
            Live online classes with experienced Cambridge teachers, weekly quizzes and assignments in your portal, past-paper practice, and progress reports your parents can see.
          </p>
          {courses.length > 0 && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {courses.map((c) => (
                <Link key={c.id} to={`/courses/${c.id}`} className="group rounded-2xl border border-white/10 bg-black/25 hover:border-indigo-400/50 hover:bg-indigo-500/10 p-5 transition">
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-300">{c.level}</div>
                  <div className="font-bold text-white text-lg mt-1">{c.title}</div>
                  <div className="text-sm text-slate-300 mt-1">{[c.teacher && `with ${c.teacher}`, c.price].filter(Boolean).join(" · ")}</div>
                  <span className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-indigo-200 group-hover:text-white">See classes and enrol <ChevronRight className="w-4 h-4" /></span>
                </Link>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Link to="/courses" className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-base font-bold text-white">{courses.length ? "All courses" : `Explore ${g.subject} classes`}</Link>
            <Link to="/exam-dates" className="px-5 py-3 rounded-xl border border-white/20 hover:border-white/40 text-base font-semibold text-slate-100">Cambridge exam dates</Link>
          </div>
        </div>
        <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-500/[0.06] p-6 md:p-8">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-2"><Globe2 className="w-5 h-5 text-cyan-300" /> Taking {g.subject} where you live</h3>
          <p className="text-base text-slate-200 mb-5 max-w-4xl leading-relaxed">
            Families in 13 countries study {g.subject} {g.code} with us live online, at class times that suit their time zone. See how it works in your country:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {COUNTRY_LIST.map((c) => (
              <Link key={c.slug} to={`/online-school/${c.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-sm font-semibold text-slate-200 hover:text-white transition">
                <img src={`/assets/flags/${c.flagCode}.svg`} alt="" width="16" height="12" loading="lazy" className="w-4 h-3 rounded-sm object-cover" />{c.name}
              </Link>
            ))}
            <Link to="/online-school" className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold text-cyan-200 hover:text-white">All countries <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </Section>
      )}

      {has("sources") && (
      <Section {...meta("sources")}>
        <ul className="grid md:grid-cols-2 gap-3">
          {g.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-indigo-400/40 p-4 text-base text-indigo-200 hover:text-white">
                <ExternalLink className="w-4 h-4 mt-1 shrink-0" />{s.label}
              </a>
            </li>
          ))}
        </ul>
        <Note>
          Cambridge says its syllabuses and specimen materials are the final authority on the content and structure of its exams. Always check you are using the syllabus for the year you sit the exam.
        </Note>
      </Section>
      )}
    </>
  );
};

export default GuideBody;
