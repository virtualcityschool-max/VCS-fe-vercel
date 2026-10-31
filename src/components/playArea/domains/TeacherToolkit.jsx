import { useState } from "react";
import { DOMAINS, DOMAIN_ORDER, LADDER, LEVELS, TEACHING, TRAITS } from "../../../data/playArea/domains";
import { ACCENT_CLASSES } from "../../../data/playArea/games";

const TOOLS = [
  { key: "objective", label: "Objective builder", icon: "fas fa-bullseye" },
  { key: "ladder", label: "Question ladder", icon: "fas fa-stairs" },
  { key: "character", label: "Character checklist", icon: "fas fa-clipboard-check" },
];

const PICK = {
  violet: "border-violet-400 bg-violet-500/20 text-white",
  amber: "border-amber-400 bg-amber-500/20 text-white",
  rose: "border-rose-400 bg-rose-500/20 text-white",
  indigo: "border-indigo-400 bg-indigo-500/20 text-white",
};
const IDLE = "border-white/15 text-slate-200 hover:border-white/40";
const LEVEL_TONES = ["bg-violet-500/15", "bg-violet-500/25", "bg-violet-500/35", "bg-violet-500/50", "bg-violet-500/65", "bg-violet-500/80"];
const TRAIT_TONES = ["bg-rose-500/20", "bg-rose-500/35", "bg-rose-500/50", "bg-rose-500/65", "bg-rose-500/80"];

const copy = async (text, done) => {
  try {
    await navigator.clipboard.writeText(text);
    done(true);
  } catch {
    done(false);
  }
};

const CopyButton = ({ text }) => {
  const [state, setState] = useState(null);
  return (
    <button
      type="button"
      onClick={() => copy(text, (ok) => setState(ok ? "Copied" : "Select and copy the text"))}
      className="px-4 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold transition"
    >
      <i className="far fa-copy mr-2" aria-hidden="true" />{state || "Copy"}
    </button>
  );
};

const Chips = ({ items, value, onChange, color, label }) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
    {items.map(([v, text]) => (
      <button
        key={v}
        type="button"
        aria-pressed={value === v}
        onClick={() => onChange(v)}
        className={`px-3.5 py-2 rounded-full border-2 text-sm font-bold transition ${value === v ? PICK[color] : IDLE}`}
      >
        {text}
      </button>
    ))}
  </div>
);

const Field = ({ label, children }) => (
  <div className="mb-5">
    <p className="text-sm font-bold text-slate-300 mb-2">{label}</p>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3 rounded-2xl border-2 border-white/15 bg-white/[0.04] text-base text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none";

const ObjectiveBuilder = () => {
  const [domain, setDomain] = useState("head");
  const [level, setLevel] = useState(3);
  const [verb, setVerb] = useState(0);
  const [topic, setTopic] = useState("the causes of the 1857 War of Independence");
  const d = DOMAINS[domain];
  const levels = LEVELS[domain].levels;
  const L = levels[Math.min(level, levels.length - 1)];
  const v = L.verbs[Math.min(verb, L.verbs.length - 1)];
  const t = TEACHING[domain][Math.min(level, levels.length - 1)];
  const a = ACCENT_CLASSES[d.color];
  const objective = `By the end of the lesson, students will be able to ${v} ${topic.trim() || "…"}.`;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <Field label="1. Domain">
          <Chips
            label="Domain"
            color={d.color}
            value={domain}
            onChange={(k) => { setDomain(k); setLevel(0); setVerb(0); }}
            items={DOMAIN_ORDER.map((k) => [k, `${DOMAINS[k].short} · ${DOMAINS[k].name}`])}
          />
        </Field>
        <Field label="2. Level">
          <Chips label="Level" color={d.color} value={Math.min(level, levels.length - 1)} onChange={(n) => { setLevel(n); setVerb(0); }} items={levels.map((l, n) => [n, `${n + 1}. ${l.name}`])} />
        </Field>
        <Field label="3. Action word">
          <Chips label="Action word" color={d.color} value={Math.min(verb, L.verbs.length - 1)} onChange={setVerb} items={L.verbs.map((w, n) => [n, w])} />
        </Field>
        <label className="block">
          <span className="block text-sm font-bold text-slate-300 mb-2">4. Topic or behaviour</span>
          <input className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. a titration, honesty in exams, Ohm's law" />
        </label>
      </div>

      <div className={`p-6 rounded-3xl border ${a.ring} ${a.bg} self-start`}>
        <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${a.text}`}>{d.short} · Level {Math.min(level, levels.length - 1) + 1}: {L.name}</p>
        <p className="text-xl md:text-2xl font-bold text-white leading-snug mb-5" aria-live="polite">{objective}</p>
        <dl className="space-y-3 mb-5">
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.04]">
            <dt className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-1">Activity idea</dt>
            <dd className="text-base text-slate-100">{t.activity}</dd>
          </div>
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.04]">
            <dt className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-1">How to check</dt>
            <dd className="text-base text-slate-100">{t.check}</dd>
          </div>
        </dl>
        <CopyButton text={objective} />
      </div>
    </div>
  );
};

const QuestionLadder = () => {
  const [topic, setTopic] = useState("the water cycle");
  const t = topic.trim() || "this topic";
  const qs = LADDER.map((f) => f(t));
  const names = LEVELS.head.levels.map((l) => l.name);
  return (
    <div>
      <label className="block mb-6 max-w-2xl">
        <span className="block text-sm font-bold text-slate-300 mb-2">Type any topic</span>
        <input className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. photosynthesis, the Lahore Resolution, simultaneous equations" />
      </label>
      <ol className="space-y-2 mb-5" aria-live="polite">
        {qs.map((q, n) => (
          <li key={names[n]} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-2xl ${LEVEL_TONES[n]}`} style={{ marginLeft: `min(${n * 1.25}rem, ${n * 3}%)` }}>
            <span className="shrink-0 sm:w-36 text-sm font-black uppercase tracking-wider text-white">{n + 1}. {names[n]}</span>
            <span className="text-base text-white">{q}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-slate-300 mb-4">Edit the wording to fit your class. Start low to build confidence, then climb.</p>
      <CopyButton text={qs.map((q, n) => `${n + 1}. ${names[n]}: ${q}`).join("\n")} />
    </div>
  );
};

const CharacterChecklist = () => {
  const [trait, setTrait] = useState(TRAITS[0].key);
  const [seen, setSeen] = useState({});
  const [student, setStudent] = useState("");
  const T = TRAITS.find((x) => x.key === trait);
  const ticks = seen[trait] || [];
  const top = ticks.length ? Math.max(...ticks) : -1;
  const heart = LEVELS.heart.levels;
  const nextIdea = TEACHING.heart[Math.min(top + 1, heart.length - 1)];

  const toggle = (n) => {
    const set = new Set(ticks);
    if (set.has(n)) set.delete(n);
    else set.add(n);
    setSeen({ ...seen, [trait]: [...set] });
  };

  return (
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8">
      <div>
        <label className="block mb-5 max-w-md">
          <span className="block text-sm font-bold text-slate-300 mb-2">Student name (optional, stays on this screen)</span>
          <input className={inputCls} value={student} onChange={(e) => setStudent(e.target.value)} placeholder="e.g. Ayesha" />
        </label>
        <Field label="Trait">
          <Chips label="Trait" color="rose" value={trait} onChange={setTrait} items={TRAITS.map((x) => [x.key, x.name])} />
        </Field>
        <p className="text-sm font-bold text-slate-300 mb-2">Tick what you have seen over the last few weeks</p>
        <ul className="space-y-2">
          {T.signs.map((s, n) => (
            <li key={s}>
              <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${ticks.includes(n) ? "border-rose-400 bg-rose-500/15" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}>
                <input type="checkbox" checked={ticks.includes(n)} onChange={() => toggle(n)} className="mt-1 w-5 h-5 accent-rose-500 shrink-0" />
                <span className="text-base text-white">{s}<span className="block text-xs font-bold uppercase tracking-wider text-rose-300 mt-1">{heart[n].name}</span></span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 self-start" aria-live="polite">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-300 mb-2">
          <i className={`${T.icon} mr-2`} aria-hidden="true" />{T.name}{student.trim() && ` · ${student.trim()}`}
        </p>
        <div className="flex gap-1.5 mb-3" aria-hidden="true">
          {heart.map((h, n) => (
            <div key={h.name} className={`h-4 flex-1 rounded-full ${n <= top ? TRAIT_TONES[n] : "bg-white/10"}`} />
          ))}
        </div>
        <p className="text-2xl font-black text-white mb-1">{top < 0 ? "Not observed yet" : `Seen up to: ${heart[top].name}`}</p>
        <p className="text-base text-slate-200 mb-5">{top < 0 ? "Tick the behaviours you have actually seen." : heart[top].meaning}</p>
        {top < heart.length - 1 ? (
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.04] mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-1">Next step to try</p>
            <p className="text-base text-slate-100">{nextIdea.activity}</p>
          </div>
        ) : (
          <p className="text-base text-emerald-300 font-semibold mb-5">This is who they are. Tell them, and their parents, that you've noticed.</p>
        )}
        <p className="text-sm text-slate-300 mb-4">Use this to encourage and guide, not to give marks. Character grows over months, not in one lesson.</p>
        <button type="button" onClick={() => window.print()} className="px-4 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-sm font-bold transition">
          <i className="fas fa-print mr-2" aria-hidden="true" />Print
        </button>
      </div>
    </div>
  );
};

const TeacherToolkit = () => {
  const [tool, setTool] = useState("objective");
  return (
    <div className="p-5 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="flex flex-wrap gap-3 mb-8" role="tablist" aria-label="Teacher tools">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tool === t.key}
            onClick={() => setTool(t.key)}
            className={`px-4 py-2.5 rounded-full border-2 text-base font-bold transition ${tool === t.key ? PICK.indigo : IDLE}`}
          >
            <i className={`${t.icon} mr-2`} aria-hidden="true" />{t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tool === "objective" && <ObjectiveBuilder />}
        {tool === "ladder" && <QuestionLadder />}
        {tool === "character" && <CharacterChecklist />}
      </div>
    </div>
  );
};

export default TeacherToolkit;
