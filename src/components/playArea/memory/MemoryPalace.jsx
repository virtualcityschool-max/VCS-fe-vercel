import { useRef, useState } from "react";
import {
  WORD_LISTS, PALACE_ROUTE, PALACE_EXAMPLES, WORD_SECONDS, scoreRecall,
} from "../../../data/playArea/memory";
import { useTimers, shuffle } from "./utils";
import { GameOver, PrimaryButton, Stat, Status } from "./shared";

// Free recall: type words one by one, then press "I'm done".
const RecallBox = ({ onDone, cues }) => {
  const [words, setWords] = useState([]);
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const add = (e) => {
    e.preventDefault();
    const parts = text.split(/[\s,]+/).map((w) => w.trim()).filter(Boolean);
    if (parts.length) {
      setWords((ws) => [...ws, ...parts.filter((p) => !ws.some((w) => w.toLowerCase() === p.toLowerCase()))]);
    }
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div className={`grid gap-6 ${cues ? "lg:grid-cols-[1fr_320px]" : ""}`}>
      <div>
        <form onSubmit={add} className="flex gap-2 mb-4">
          <label htmlFor="recall-word" className="sr-only">Type a word you remember</label>
          <input
            id="recall-word"
            ref={inputRef}
            autoFocus
            autoComplete="off"
            autoCapitalize="none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a word, press Enter"
            className="flex-1 min-w-0 rounded-2xl border-2 border-emerald-400/50 focus:border-emerald-300 bg-white/5 text-white text-lg px-4 py-3 outline-none placeholder:text-slate-400"
          />
          <button type="submit" className="px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Add</button>
        </form>
        <div className="flex flex-wrap gap-2 min-h-[3rem] mb-6">
          {words.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWords((ws) => ws.filter((x) => x !== w))}
              className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-base text-white hover:border-rose-400"
              title="Remove"
            >
              {w} <i className="fas fa-xmark ml-1 text-xs text-slate-400" aria-hidden="true" />
            </button>
          ))}
          {!words.length && <p className="text-base text-slate-400">Your words will appear here. Any order is fine.</p>}
        </div>
        <PrimaryButton onClick={() => onDone(text.trim() ? [...words, text.trim()] : words)}>
          I'm done — check my words ({words.length})
        </PrimaryButton>
      </div>
      {cues && (
        <aside className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5">
          <p className="text-sm font-black uppercase tracking-widest text-amber-300 mb-3">Walk through your palace</p>
          <ol className="space-y-1.5 text-base text-slate-200 list-decimal list-inside">
            {PALACE_ROUTE.map((p) => <li key={p}>{p}</li>)}
          </ol>
        </aside>
      )}
    </div>
  );
};

const WordResult = ({ list, hit }) => (
  <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
    {list.map((w) => (
      <span
        key={w}
        className={`px-3 py-1.5 rounded-full text-base font-bold border ${
          hit.has(w) ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-200" : "bg-white/5 border-white/15 text-slate-400"
        }`}
      >
        {hit.has(w) ? "✓ " : ""}{w}
      </span>
    ))}
  </div>
);

const MemoryPalace = ({ best, onResult, onExit }) => {
  const { later, clearAll } = useTimers();
  const [phase, setPhase] = useState("intro"); // intro | study1 | recall1 | result1 | lesson | study2 | recall2 | done
  const [lists, setLists] = useState([]);
  const [idx, setIdx] = useState(0);
  const [hit1, setHit1] = useState(new Set());
  const [hit2, setHit2] = useState(new Set());
  const [isNewBest, setIsNewBest] = useState(false);

  const study = (which, list) => {
    setIdx(0);
    setPhase(which);
    list.forEach((_, i) => later(() => setIdx(i), i * WORD_SECONDS * 1000));
    later(() => setPhase(which === "study1" ? "recall1" : "recall2"), list.length * WORD_SECONDS * 1000);
  };

  const start = () => {
    clearAll();
    const ls = shuffle(WORD_LISTS).slice(0, 2);
    setLists(ls);
    setHit1(new Set());
    setHit2(new Set());
    study("study1", ls[0]);
  };

  const list = phase === "study2" || phase === "recall2" ? lists[1] : lists[0];

  if (phase === "intro") {
    return (
      <div className="text-center py-4 max-w-2xl mx-auto">
        <p className="text-lg text-slate-200 mb-4">
          You'll see <strong className="text-emerald-300 font-semibold">15 words</strong>, one every {WORD_SECONDS} seconds. Then write down as many as you remember.
        </p>
        <p className="text-base text-slate-300 mb-8">
          After that we'll teach you a trick used by memory champions — and you'll try a new list to see the difference. It takes about 6 minutes.
        </p>
        <PrimaryButton onClick={start}>
          <i className="fas fa-play mr-2" aria-hidden="true" /> Start round 1
        </PrimaryButton>
      </div>
    );
  }

  if (phase === "study1" || phase === "study2") {
    const withPlace = phase === "study2";
    return (
      <div>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
          <Stat label="Round" value={withPlace ? "2" : "1"} color="text-emerald-300" />
          <Stat label="Word" value={`${idx + 1}/15`} color="text-cyan-300" />
        </div>
        <Status tone="info">{withPlace ? "Picture each word at its place — make it big, funny or moving!" : "Remember these words…"}</Status>
        <div className="flex flex-col items-center justify-center h-56 md:h-64 my-4 text-center">
          {withPlace && (
            <p className="text-lg md:text-xl font-bold text-amber-300 mb-3">
              <i className="fas fa-location-dot mr-2" aria-hidden="true" />
              {idx + 1}. {PALACE_ROUTE[idx]}
            </p>
          )}
          <p key={idx} className="text-5xl md:text-7xl font-black text-white capitalize">{list[idx]}</p>
        </div>
        <div className="h-2 max-w-md mx-auto rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${((idx + 1) / 15) * 100}%` }} />
        </div>
      </div>
    );
  }

  if (phase === "recall1" || phase === "recall2") {
    const second = phase === "recall2";
    return (
      <div>
        <Status tone="go">{second ? "Walk through your palace and write each word you placed." : "Type every word you remember."}</Status>
        <div className="mt-6">
          <RecallBox
            key={phase}
            cues={second}
            onDone={(answers) => {
              const hit = scoreRecall(answers, list);
              if (second) {
                setHit2(hit);
                setIsNewBest(onResult(hit1.size, hit.size));
                setPhase("done");
              } else {
                setHit1(hit);
                setPhase("result1");
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (phase === "result1") {
    return (
      <div className="text-center py-4">
        <p className="text-base font-bold text-slate-300">Round 1</p>
        <p className="text-6xl md:text-7xl font-black text-white">{hit1.size}<span className="text-3xl text-slate-400"> / 15</span></p>
        <p className="text-lg font-bold text-cyan-300 mb-6">words remembered</p>
        <WordResult list={lists[0]} hit={hit1} />
        <p className="text-base text-slate-200 max-w-xl mx-auto mt-8 mb-6">
          Most people remember about 5 to 8 words this way. Now let's learn how memory champions remember long lists.
        </p>
        <PrimaryButton onClick={() => setPhase("lesson")}>
          Learn the trick <i className="fas fa-arrow-right ml-2" aria-hidden="true" />
        </PrimaryButton>
      </div>
    );
  }

  if (phase === "lesson") {
    return (
      <div className="py-2">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <span className="inline-flex px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-[0.2em] mb-4">
              The memory palace
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4">A 2,500-year-old trick</h3>
            <p className="text-base text-slate-200 leading-relaxed mb-4">
              An old Greek story says the poet <strong className="text-amber-300 font-semibold">Simonides</strong> left a banquet just before the roof fell in. He could name every guest by remembering where each one had been sitting. He realised that our brains are brilliant at remembering <em>places</em>.
            </p>
            <p className="text-base text-slate-200 leading-relaxed mb-4">So: put each word at a place in a home you know well, and make it a crazy picture.</p>
            <ol className="space-y-3 text-base text-slate-200">
              <li className="flex gap-3"><span className="w-7 h-7 shrink-0 rounded-full bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center">1</span> Imagine walking through your home: gate, door, shoe rack, sofa…</li>
              <li className="flex gap-3"><span className="w-7 h-7 shrink-0 rounded-full bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center">2</span> At each place, picture the word — huge, funny, moving or noisy.</li>
              <li className="flex gap-3"><span className="w-7 h-7 shrink-0 rounded-full bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center">3</span> To remember, just walk through again and "see" what's at each place.</li>
            </ol>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-black uppercase tracking-widest text-slate-300">For example</p>
            {PALACE_EXAMPLES.map(([place, word, scene]) => (
              <div key={place} className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                <p className="text-sm font-bold text-amber-300"><i className="fas fa-location-dot mr-2" aria-hidden="true" />{place} → <span className="capitalize">{word}</span></p>
                <p className="text-base text-slate-200">{scene}</p>
              </div>
            ))}
            <p className="text-base text-slate-300">The sillier the picture, the better it sticks.</p>
          </div>
        </div>
        <div className="text-center mt-8">
          <PrimaryButton onClick={() => study("study2", lists[1])}>
            <i className="fas fa-play mr-2" aria-hidden="true" /> Try it — round 2 (new words)
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // done
  const gain = hit2.size - hit1.size;
  return (
    <GameOver
      title="With the memory palace you remembered"
      score={`${hit2.size} / 15`}
      unit="words"
      best={Math.max(best || 0, hit2.size)}
      isNewBest={isNewBest}
      note={
        gain > 0
          ? `That's ${gain} more than round 1. Imagine using this for formulas, dates and definitions!`
          : "The trick gets stronger with practice — memory champions trained for weeks. Try again tomorrow with the same home route."
      }
      shareText={`I remembered ${hit2.size} of 15 words with the memory palace trick (${hit1.size} without it) on the VCS Memory Challenge!`}
      onAgain={start}
      onExit={onExit}
    >
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
        {[["Before the trick", hit1.size, "bg-slate-400"], ["With the palace", hit2.size, "bg-emerald-400"]].map(([label, v, bar]) => (
          <div key={label} className="flex flex-col items-center">
            <div className="h-36 w-16 rounded-xl bg-white/10 flex items-end overflow-hidden">
              <div className={`w-full ${bar} rounded-xl transition-all duration-700`} style={{ height: `${(v / 15) * 100}%` }} />
            </div>
            <p className="text-2xl font-black text-white mt-2">{v}</p>
            <p className="text-sm font-bold text-slate-300">{label}</p>
          </div>
        ))}
      </div>
      <WordResult list={lists[1]} hit={hit2} />
    </GameOver>
  );
};

export default MemoryPalace;
