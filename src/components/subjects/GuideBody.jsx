import { Link } from "react-router-dom";
import { FlaskConical, AlertTriangle, ExternalLink, ChevronRight, CheckCircle2 } from "lucide-react";
import { ACCENT } from "./guideSections";

// The body of a subject guide (see src/data/subjectGuides), shared by the
// guide page and the course page.

const Section = ({ id, n, icon, title, children }) => {
  const Icon = icon;
  return (
  <section id={id} className="scroll-mt-24 pt-10">
    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-bold text-white mb-5">
      <span className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </span>
      <span>
        <span className="text-slate-500 font-mono text-base mr-1.5">{n}.</span>
        {title}
      </span>
    </h2>
    {children}
  </section>
  );
};

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>{children}</div>
);

const Note = ({ children }) => <p className="mt-3 text-xs text-slate-500 leading-relaxed">{children}</p>;

const GuideBody = ({ g, sections }) => {
  const accent = ACCENT[g.accent] || ACCENT.violet;
  // Props for each <Section>: its id, number, icon and title.
  const has = (id) => sections.some((v) => v.id === id);
  const meta = (id) => { const x = sections.find((v) => v.id === id); return { id, n: x.n, icon: x.icon, title: x.title }; };
  return (
    <>
      {has("facts") && (
      <Section {...meta("facts")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {g.quickFacts.map((f) => (
            <Card key={f.label} className="p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">{f.label}</div>
              <div className={`text-lg font-bold ${accent.text}`}>{f.value}</div>
              <div className="text-xs text-slate-400 mt-1">{f.note}</div>
            </Card>
          ))}
        </div>
      </Section>
      )}

      {has("why") && (
      <Section {...meta("why")}>
        <Card>
          <p className="text-slate-300 mb-4">{g.why.intro}</p>
          <ul className="space-y-2.5">
            {g.why.points.map((p) => (
              <li key={p} className="flex gap-2.5 text-slate-200 text-sm leading-relaxed"><CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${accent.text}`} />{p}</li>
            ))}
          </ul>
          <Note>{g.why.source}</Note>
        </Card>
      </Section>
      )}

      {has("stories") && (
      <Section {...meta("stories")}>
        <div className="grid md:grid-cols-2 gap-4">
          {g.stories.map((s) => (
            <Card key={s.title}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 mb-1.5">{s.topics}</div>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{s.story}</p>
            </Card>
          ))}
        </div>
      </Section>
      )}

      {has("topics") && (
      <Section {...meta("topics")}>
        {g.topics && (
          <div className="grid md:grid-cols-2 gap-3">
            {g.topics.map((t) => (
              <Card key={t.n} className="p-4">
                <div className={`font-bold text-white text-sm ${t.parts?.length ? "mb-2" : ""}`}><span className="font-mono text-indigo-300 mr-2">{t.n}</span>{t.name}</div>
                {t.parts?.length > 0 && <ul className="text-xs text-slate-400 space-y-1">{t.parts.map((p, i) => <li key={p}>{t.n}.{i + 1} {p}</li>)}</ul>}
              </Card>
            ))}
          </div>
        )}
        {g.topicGroups && (
          <div className="space-y-6">
            {g.topicGroups.map((tg) => (
              <div key={tg.label}>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">{tg.label}</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {tg.groups.map((gr) => (
                    <Card key={gr.area} className="p-4">
                      <div className="font-bold text-white text-sm mb-2">{gr.area}</div>
                      <ul className="text-sm text-slate-300 space-y-1">{gr.topics.map(([num, name]) => <li key={num}><span className="font-mono text-indigo-300 mr-2">{num}</span>{name}</li>)}</ul>
                    </Card>
                  ))}
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
        <p className="text-slate-300 mb-4">{g.compare.intro}</p>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-white/[0.04] text-slate-400 text-xs uppercase tracking-wider">
              <tr><th className="text-left p-3">Idea</th><th className="text-left p-3">{g.compare.cols?.[0] || (g.level === "O Level" ? "At O Level (this course)" : "At O Level / IGCSE")}</th><th className="text-left p-3">{g.compare.cols?.[1] || (g.level === "O Level" ? "At AS & A Level" : "At AS & A Level (this course)")}</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {g.compare.rows.map((r) => (
                <tr key={r.idea}><td className="p-3 font-semibold text-white">{r.idea}</td><td className="p-3 text-slate-300">{r.here}</td><td className="p-3 text-slate-300">{r.next}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {g.sibling && <Link to={`/subjects/${g.sibling.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 hover:text-white">Read the {g.sibling.label} guide <ChevronRight className="w-4 h-4" /></Link>}
      </Section>
      )}

      {has("exam") && (
      <Section {...meta("exam")}>
        <div className="space-y-3">
          {g.papers.map((p) => (
            <Card key={p.name} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-[220px]">
                  <div className="font-bold text-white">{p.name}</div>
                  <div className="text-sm text-slate-400 mt-1">{p.what}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{p.who}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-bold font-mono ${accent.text}`}>{p.weight}</div>
                  <div className="text-xs text-slate-400">{p.time} · {p.marks} marks</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {g.routes && (
          <div className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Three ways to take it</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {g.routes.map((r) => <Card key={r.name} className="p-4"><div className="font-bold text-white text-sm mb-1">{r.name}</div><div className="text-xs text-slate-400">{r.detail}</div></Card>)}
            </div>
          </div>
        )}
        <Note>{g.papersNote}</Note>
      </Section>
      )}

      {has("questions") && (
      <Section {...meta("questions")}>
        <div className="space-y-3">
          {g.questionTypes.map((q) => (
            <Card key={q.type} className="p-4">
              <div className="font-bold text-white text-sm mb-2">{q.type}</div>
              <div className="text-sm text-slate-200 bg-black/30 border border-white/5 rounded-lg px-3 py-2 mb-2 italic">“{q.example}”</div>
              <div className="text-xs text-slate-400"><span className="text-slate-300 font-semibold">What it tests: </span>{q.testing}</div>
            </Card>
          ))}
        </div>
        <Note>{g.questionNote}</Note>
      </Section>
      )}

      {has("command") && (
      <Section {...meta("command")}>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-white/[0.04] text-slate-400 text-xs uppercase tracking-wider"><tr><th className="text-left p-3">Word</th><th className="text-left p-3">Cambridge meaning</th><th className="text-left p-3">What to do</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {g.commandWords.map((c) => <tr key={c.word}><td className={`p-3 font-bold ${accent.text}`}>{c.word}</td><td className="p-3 text-slate-300">{c.meaning}</td><td className="p-3 text-slate-400">{c.tip}</td></tr>)}
            </tbody>
          </table>
        </div>
        <Note>{g.commandSource}</Note>
      </Section>
      )}

      {has("aos") && (
      <Section {...meta("aos")}>
        <div className="space-y-3">
          {g.aos.map((a) => (
            <Card key={a.code} className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="font-bold text-white text-sm"><span className="font-mono text-indigo-300 mr-2">{a.code}</span>{a.name}</div>
                <div className={`font-mono font-bold ${accent.text}`}>{a.weight}%</div>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-2"><div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${a.bar ?? a.weight}%` }} /></div>
              <div className="text-xs text-slate-400">{a.plain}</div>
            </Card>
          ))}
        </div>
        <Note>{g.aoNote}</Note>
      </Section>
      )}

      {has("grades") && (
      <Section {...meta("grades")}>
        <Card>
          <p className="text-sm text-slate-300 mb-4">{g.grades.scale}</p>
          <h3 className="text-sm font-bold text-white mb-2">What it took in {g.grades.thresholds.series}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-xs uppercase tracking-wider"><tr><th className="text-left py-2">Grade</th><th className="text-left py-2">Marks out of {g.grades.thresholds.max}</th><th className="text-left py-2">Roughly</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {g.grades.thresholds.rows.map((r) => <tr key={r.grade}><td className={`py-2 font-bold ${accent.text}`}>{r.grade}</td><td className="py-2 font-mono text-slate-200">{r.range}</td><td className="py-2 text-slate-400">{r.pct}</td></tr>)}
              </tbody>
            </table>
          </div>
          <Note>{g.grades.thresholds.note}</Note>
          <p className="text-sm text-slate-300 mt-4">{g.grades.meaning}</p>
        </Card>
      </Section>
      )}

      {has("practical") && (
      <Section {...meta("practical")}>
        <Card>
          <ul className="space-y-2.5">{g.practical.map((p) => <li key={p} className="flex gap-2.5 text-sm text-slate-200"><FlaskConical className={`w-4 h-4 mt-0.5 shrink-0 ${accent.text}`} />{p}</li>)}</ul>
        </Card>
      </Section>
      )}

      {has("books") && (
      <Section {...meta("books")}>
        <div className="grid md:grid-cols-2 gap-3">
          {g.books.map((b) => <Card key={b.title} className="p-4"><div className="font-bold text-white text-sm">{b.title}</div><div className="text-xs text-indigo-300 mt-1">{b.by}</div><div className="text-xs text-slate-400 mt-2">{b.note}</div></Card>)}
        </div>
        <Note>{g.booksNote}</Note>
      </Section>
      )}

      {has("mistakes") && (
      <Section {...meta("mistakes")}>
        <Card>
          <ul className="space-y-2.5">{g.mistakes.map((m) => <li key={m} className="flex gap-2.5 text-sm text-slate-200"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-300" />{m}</li>)}</ul>
          <Note>{g.mistakesNote}</Note>
        </Card>
      </Section>
      )}

      {has("plan") && (
      <Section {...meta("plan")}>
        <ol className="relative border-l border-white/10 ml-2 space-y-4">
          {g.studyPlan.map((s) => (
            <li key={s.when} className="pl-5 relative">
              <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${accent.dot}`} />
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{s.when}</div>
              <div className="text-sm text-slate-200 mt-1">{s.what}</div>
            </li>
          ))}
        </ol>
        <Note>{g.studyNote}</Note>
      </Section>
      )}

      {has("careers") && (
      <Section {...meta("careers")}>
        <p className="text-slate-300 mb-4">{g.careers.intro}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {g.careers.paths.map((c) => <Card key={c.name} className="p-4"><div className="font-bold text-white text-sm">{c.name}</div><div className="text-xs text-slate-400 mt-1">{c.need}</div></Card>)}
        </div>
        <Note>Typical subject requirements — always check each university's own entry rules.</Note>
      </Section>
      )}

      {has("real") && (
      <Section {...meta("real")}>
        <div className="grid md:grid-cols-2 gap-4">
          {g.realWorld.map((r) => <Card key={r.title}><h3 className="font-bold text-white text-sm mb-2">{r.title}</h3><p className="text-sm text-slate-300 leading-relaxed">{r.text}</p></Card>)}
        </div>
      </Section>
      )}

      {has("faq") && (
      <Section {...meta("faq")}>
        <div className="space-y-2">
          {g.faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-semibold text-white text-sm">
                {f.q}<ChevronRight className="w-4 h-4 shrink-0 transition group-open:rotate-90" />
              </summary>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
      )}

      {has("vcs") && (
      <Section {...meta("vcs")}>
        <Card className="bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border-indigo-500/30">
          <p className="text-slate-200 mb-4">
            Live online classes with experienced Cambridge teachers, weekly quizzes and assignments in your portal, past-paper practice, and progress reports your parents can see.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/courses" className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white">Explore {g.subject} classes</Link>
            <Link to="/exam-dates" className="px-4 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-sm font-semibold text-slate-200">Cambridge exam dates</Link>
          </div>
        </Card>
      </Section>
      )}

      {has("sources") && (
      <Section {...meta("sources")}>
        <ul className="space-y-2">
          {g.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-white">
                <ExternalLink className="w-3.5 h-3.5" />{s.label}
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
