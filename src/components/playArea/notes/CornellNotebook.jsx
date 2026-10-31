import { useState } from "react";
import { Link } from "react-router-dom";
import { STORE_KEY, REVISION_KEY, EXAMPLE_NOTE } from "../../../data/playArea/notes";
import { todayKey } from "../../../data/playArea/memory";

const read = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(v) ? v : fallback;
  } catch { return fallback; }
};
const write = (key, v) => {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private mode */ }
};
const newId = () => `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const blankRows = () => [{ cue: "", note: "" }, { cue: "", note: "" }, { cue: "", note: "" }];
const words = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Small checklist that nudges students towards good Cornell notes.
const checks = (n) => {
  const filled = n.rows.filter((r) => r.note.trim());
  return [
    { ok: Boolean(n.title.trim()), text: "Give the page a title" },
    { ok: filled.length >= 3, text: "Write at least 3 blocks of notes" },
    { ok: filled.length > 0 && filled.every((r) => r.cue.trim()), text: "Add a question for every block" },
    { ok: filled.some((r) => r.cue.trim().endsWith("?")), text: "Write cues as questions (end with ?)" },
    { ok: words(n.summary) >= 15, text: "Summary of 15+ words in your own words" },
  ];
};

const printNote = (n) => {
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = n.rows.filter((r) => r.cue.trim() || r.note.trim())
    .map((r) => `<tr><td class="cue">${esc(r.cue)}</td><td>${esc(r.note).replace(/\n/g, "<br>")}</td></tr>`).join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(n.title || "Cornell notes")}</title>
<style>body{font-family:-apple-system,"SF Pro Display",Arial,sans-serif;margin:32px;color:#111}h1{font-size:24px;margin:0 0 4px}
p.meta{color:#555;margin:0 0 16px;font-size:14px}table{width:100%;border-collapse:collapse}td{border:1px solid #999;padding:10px;vertical-align:top;font-size:15px}
td.cue{width:30%;font-weight:600;background:#f4f1ff}.sum{border:2px solid #6d28d9;margin-top:12px;padding:12px;font-size:15px}
.sum b{display:block;margin-bottom:4px;color:#6d28d9}.foot{margin-top:16px;font-size:12px;color:#777}</style></head><body>
<h1>${esc(n.title || "Cornell notes")}</h1><p class="meta">${esc(n.subject || "")} · ${esc(n.date)}</p>
<table><tr><td class="cue"><b>Questions</b></td><td><b>Notes</b></td></tr>${rows}</table>
<div class="sum"><b>Summary</b>${esc(n.summary).replace(/\n/g, "<br>")}</div>
<p class="foot">Made with VCS Smart Notes — virtualcityschool.com/mind-lab/smart-notes</p></body></html>`);
  w.document.close();
  w.focus();
  w.print();
};

// ------------------------------------------------------------- Test me ---

const TestMe = ({ note, onExit }) => {
  const all = note.rows.filter((r) => r.cue.trim() && r.note.trim());
  const [queue, setQueue] = useState(all);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [missed, setMissed] = useState([]);
  const [knew, setKnew] = useState(0);

  if (!all.length) {
    return (
      <div className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 text-center">
        <p className="text-lg font-bold text-amber-200 mb-3">Add at least one question with notes first.</p>
        <button type="button" onClick={onExit} className="px-5 py-3 rounded-full bg-violet-600 text-white font-bold">Back to my notes</button>
      </div>
    );
  }

  if (i >= queue.length) {
    return (
      <div className="p-6 md:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 text-center" role="status">
        <p className="text-5xl font-black text-white mb-1">{knew} / {queue.length}</p>
        <p className="text-lg font-bold text-emerald-300 mb-4">{missed.length ? "Good work — now look again at the ones you missed." : "You knew them all! Test yourself again in a few days."}</p>
        {missed.length > 0 && (
          <ul className="max-w-xl mx-auto text-left space-y-2 mb-5">
            {missed.map((r) => (
              <li key={r.cue} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-base font-bold text-violet-200">{r.cue}</p>
                <p className="text-base text-slate-200">{r.note}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {missed.length > 0 && (
            <button type="button" onClick={() => { setQueue(missed); setMissed([]); setKnew(0); setI(0); setShown(false); }} className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">
              Test me on the ones I missed
            </button>
          )}
          <button type="button" onClick={onExit} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold">Back to my notes</button>
        </div>
      </div>
    );
  }

  const r = queue[i];
  return (
    <div className="p-6 md:p-8 rounded-3xl border border-violet-500/30 bg-violet-500/5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-300">Question {i + 1} of {queue.length}</p>
        <button type="button" onClick={onExit} className="text-sm font-bold text-cyan-300 hover:text-white"><i className="fas fa-xmark mr-1.5" aria-hidden="true" />Stop</button>
      </div>
      <p className="text-2xl md:text-3xl font-black text-white mb-6">{r.cue}</p>
      {!shown ? (
        <>
          <p className="text-base text-slate-300 mb-4">Say or write your answer first. Then check.</p>
          <button type="button" onClick={() => setShown(true)} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">
            <i className="fas fa-eye mr-2" aria-hidden="true" />Show my notes
          </button>
        </>
      ) : (
        <>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-lg text-slate-100 mb-5 whitespace-pre-line">{r.note}</div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => { setKnew(knew + 1); setI(i + 1); setShown(false); }} className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold">
              <i className="fas fa-check mr-2" aria-hidden="true" />I knew it
            </button>
            <button type="button" onClick={() => { setMissed([...missed, r]); setI(i + 1); setShown(false); }} className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-base font-bold">
              <i className="fas fa-rotate mr-2" aria-hidden="true" />Not yet
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ------------------------------------------------------------ Notebook ---

const CornellNotebook = () => {
  const [notes, setNotes] = useState(() => read(STORE_KEY, []));
  const [currentId, setCurrentId] = useState(() => read(STORE_KEY, [])[0]?.id || null);
  const [mode, setMode] = useState("edit");
  const [planned, setPlanned] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const note = notes.find((n) => n.id === currentId);

  const save = (next) => {
    setNotes(next);
    write(STORE_KEY, next);
  };
  const create = (base) => {
    const n = { id: newId(), title: "", subject: "", date: todayKey(), rows: blankRows(), summary: "", ...base };
    save([n, ...notes]);
    setCurrentId(n.id);
    setMode("edit");
    setPlanned(null);
  };
  const edit = (patch) => save(notes.map((n) => (n.id === currentId ? { ...n, ...patch } : n)));
  const editRow = (i, patch) => edit({ rows: note.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

  const addToPlan = () => {
    const plan = read(REVISION_KEY, []);
    const id = `note-${note.id}`;
    const name = `${note.title || "Untitled notes"}${note.subject ? ` (${note.subject})` : ""}`;
    if (!plan.some((t) => t.id === id)) write(REVISION_KEY, [{ id, name, learned: note.date, exam: null, done: [] }, ...plan]);
    setPlanned(note.id);
  };

  if (!note) {
    return (
      <div className="p-8 rounded-3xl border border-dashed border-white/20 text-center">
        <i className="fas fa-book-open text-4xl text-violet-300 mb-4" aria-hidden="true" />
        <p className="text-lg font-bold text-white mb-2">Your Cornell notebook</p>
        <p className="text-base text-slate-300 mb-6 max-w-lg mx-auto">Write notes with questions beside them. Then press "Test me" and your notes become a quiz. Saved on this device.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => create()} className="px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">
            <i className="fas fa-plus mr-2" aria-hidden="true" />Start a new page
          </button>
          <button type="button" onClick={() => create({ ...EXAMPLE_NOTE, rows: EXAMPLE_NOTE.rows.map((r) => ({ ...r })) })} className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold">
            Open the example (Photosynthesis)
          </button>
        </div>
      </div>
    );
  }

  const list = checks(note);
  const passed = list.filter((c) => c.ok).length;

  return (
    <div className="grid xl:grid-cols-[260px_1fr] gap-6">
      <aside className="space-y-2">
        <button type="button" onClick={() => create()} className="w-full px-4 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">
          <i className="fas fa-plus mr-2" aria-hidden="true" />New page
        </button>
        <ul className="flex xl:flex-col gap-2 overflow-x-auto pb-1">
          {notes.map((n) => (
            <li key={n.id} className="shrink-0">
              <button
                type="button"
                onClick={() => { setCurrentId(n.id); setMode("edit"); setPlanned(null); setConfirmDelete(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-2xl border transition ${n.id === currentId ? "border-violet-400 bg-violet-500/15" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}
              >
                <span className="block text-base font-bold text-white truncate max-w-[200px]">{n.title || "Untitled"}</span>
                <span className="block text-xs text-slate-400">{n.subject || "No subject"} · {n.date}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div>
        {mode === "test" ? (
          <TestMe key={note.id} note={note} onExit={() => setMode("edit")} />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
            <div className="grid sm:grid-cols-[1fr_200px_170px] gap-3 mb-5">
              <label className="block">
                <span className="sr-only">Title</span>
                <input value={note.title} onChange={(e) => edit({ title: e.target.value })} placeholder="Title, e.g. Photosynthesis" className="w-full rounded-xl border border-white/15 bg-white/5 text-white text-lg font-bold px-4 py-3 outline-none focus:border-violet-400 placeholder:text-slate-400" />
              </label>
              <label className="block">
                <span className="sr-only">Subject</span>
                <input value={note.subject} onChange={(e) => edit({ subject: e.target.value })} placeholder="Subject" className="w-full rounded-xl border border-white/15 bg-white/5 text-white text-base px-4 py-3 outline-none focus:border-violet-400 placeholder:text-slate-400" />
              </label>
              <label className="block">
                <span className="sr-only">Date learned</span>
                <input type="date" value={note.date} max={todayKey()} onChange={(e) => edit({ date: e.target.value || todayKey() })} className="w-full rounded-xl border border-white/15 bg-white/5 text-white text-base px-4 py-3 outline-none focus:border-violet-400" />
              </label>
            </div>

            <div className="hidden sm:grid grid-cols-[minmax(0,2fr)_minmax(0,5fr)_40px] gap-3 mb-2 text-xs font-black uppercase tracking-wider">
              <span className="text-violet-300">Questions / key words</span>
              <span className="text-slate-300">Notes</span>
              <span />
            </div>
            <div className="space-y-3">
              {note.rows.map((r, i) => (
                <div key={i} className="grid sm:grid-cols-[minmax(0,2fr)_minmax(0,5fr)_40px] gap-2 sm:gap-3 p-3 sm:p-0 rounded-2xl sm:rounded-none border sm:border-0 border-white/10">
                  <label className="block">
                    <span className="sm:sr-only text-xs font-black uppercase tracking-wider text-violet-300">Question</span>
                    <textarea rows={3} value={r.cue} onChange={(e) => editRow(i, { cue: e.target.value })} placeholder="e.g. What limits the rate?" className="w-full rounded-xl border border-violet-500/30 bg-violet-500/5 text-violet-100 text-base font-semibold px-3 py-2.5 outline-none focus:border-violet-400 placeholder:text-slate-400 resize-y" />
                  </label>
                  <label className="block">
                    <span className="sm:sr-only text-xs font-black uppercase tracking-wider text-slate-300">Notes</span>
                    <textarea rows={3} value={r.note} onChange={(e) => editRow(i, { note: e.target.value })} placeholder="Short notes in your own words" className="w-full rounded-xl border border-white/15 bg-white/5 text-white text-base px-3 py-2.5 outline-none focus:border-violet-400 placeholder:text-slate-400 resize-y" />
                  </label>
                  <button
                    type="button"
                    onClick={() => edit({ rows: note.rows.length > 1 ? note.rows.filter((_, j) => j !== i) : blankRows().slice(0, 1) })}
                    aria-label={`Remove row ${i + 1}`}
                    className="h-10 sm:mt-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10"
                  >
                    <i className="fas fa-trash-can" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => edit({ rows: [...note.rows, { cue: "", note: "" }] })} className="mt-3 text-base font-bold text-violet-300 hover:text-white">
              <i className="fas fa-plus mr-1.5" aria-hidden="true" />Add a row
            </button>

            <label className="block mt-5">
              <span className="flex justify-between text-xs font-black uppercase tracking-wider text-violet-300 mb-1">
                <span>Summary — the whole page in 2–3 sentences</span>
                <span className="text-slate-400 normal-case tracking-normal font-bold">{words(note.summary)} words</span>
              </span>
              <textarea rows={3} value={note.summary} onChange={(e) => edit({ summary: e.target.value })} placeholder="Close your notes and explain the topic in your own words." className="w-full rounded-xl border-2 border-violet-500/40 bg-violet-500/5 text-white text-base px-3 py-2.5 outline-none focus:border-violet-400 placeholder:text-slate-400 resize-y" />
            </label>

            <div className="mt-6 grid lg:grid-cols-[1fr_auto] gap-5 items-start">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                <p className="text-sm font-black text-white mb-2">Notes check: {passed} / {list.length}</p>
                <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
                  {list.map((c) => (
                    <li key={c.text} className={`text-sm ${c.ok ? "text-emerald-300" : "text-slate-400"}`}>
                      <i className={`fas ${c.ok ? "fa-circle-check" : "fa-circle"} mr-1.5`} aria-hidden="true" />{c.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <button type="button" onClick={() => setMode("test")} className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold">
                  <i className="fas fa-graduation-cap mr-2" aria-hidden="true" />Test me
                </button>
                <button type="button" onClick={addToPlan} className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold">
                  <i className="fas fa-calendar-plus mr-2" aria-hidden="true" />Add to revision plan
                </button>
                <button type="button" onClick={() => printNote(note)} className="px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold">
                  <i className="fas fa-print mr-2" aria-hidden="true" />Print / PDF
                </button>
                {confirmDelete ? (
                  <span className="flex gap-2">
                    <button type="button" onClick={() => { const rest = notes.filter((n) => n.id !== currentId); save(rest); setCurrentId(rest[0]?.id || null); setConfirmDelete(false); }} className="px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-bold">Delete page</button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-full border border-white/20 text-slate-200 text-sm font-bold">Keep</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(true)} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-rose-300">
                    <i className="fas fa-trash-can mr-1.5" aria-hidden="true" />Delete this page
                  </button>
                )}
              </div>
            </div>
            {planned === note.id && (
              <p className="mt-4 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-base text-emerald-100" role="status">
                <i className="fas fa-circle-check mr-2" aria-hidden="true" />Added! Your review days are in the{" "}
                <Link to="/mind-lab/smart-revision#planner" className="font-bold underline underline-offset-4">Smart Revision planner</Link>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CornellNotebook;
