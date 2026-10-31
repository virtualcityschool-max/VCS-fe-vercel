import { CATEGORIES, optionsFor } from "../../../data/playArea/teasers";
import { ACCENT_CLASSES } from "../../../data/playArea/games";

const LETTERS = ["A", "B", "C", "D"];

// One multiple-choice puzzle with a hint and an explanation after answering.
const PuzzleCard = ({ puzzle, picked, hinted, onPick, onHint, label, children }) => {
  const cat = CATEGORIES[puzzle.cat];
  const a = ACCENT_CLASSES[cat.color];
  const answered = picked !== undefined;
  const right = picked === puzzle.a;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${a.bg} ${a.text}`}>
          <i className={cat.icon} aria-hidden="true" /> {cat.name}
        </span>
        {label && <span className="text-sm font-bold text-slate-300">{label}</span>}
      </div>
      <p className="text-xl md:text-2xl font-bold text-white leading-snug mb-6 whitespace-pre-line">{puzzle.q}</p>

      <div className="grid sm:grid-cols-2 gap-3 mb-5" role="group" aria-label="Answer choices">
        {optionsFor(puzzle).map((opt, i) => {
          const isRight = opt === puzzle.a;
          const isPicked = opt === picked;
          let cls = "border-white/15 bg-white/[0.04] hover:border-violet-400 hover:bg-violet-500/10 text-white";
          if (answered) {
            if (isRight) cls = "border-emerald-400 bg-emerald-500/15 text-white";
            else if (isPicked) cls = "border-rose-400 bg-rose-500/15 text-white";
            else cls = "border-white/10 bg-white/[0.02] text-slate-400";
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={answered}
              onClick={() => onPick(opt)}
              className={`flex items-center gap-3 text-left px-4 py-3.5 rounded-2xl border-2 text-base md:text-lg font-semibold transition ${cls}`}
            >
              <span className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-sm font-black">
                {answered && isRight ? <i className="fas fa-check text-emerald-300" aria-hidden="true" /> : answered && isPicked ? <i className="fas fa-xmark text-rose-300" aria-hidden="true" /> : LETTERS[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {!answered && (
        hinted ? (
          <p className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-base text-amber-200">
            <i className="fas fa-lightbulb mr-2 text-amber-300" aria-hidden="true" />{puzzle.hint}
          </p>
        ) : (
          <button type="button" onClick={onHint} className="text-base font-bold text-amber-300 hover:text-white">
            <i className="fas fa-lightbulb mr-2" aria-hidden="true" />Need a hint?
          </button>
        )
      )}

      {answered && (
        <div className={`p-5 rounded-2xl border ${right ? "border-emerald-500/40 bg-emerald-500/10" : "border-rose-500/40 bg-rose-500/10"}`} role="status">
          <p className={`text-lg font-black mb-1 ${right ? "text-emerald-300" : "text-rose-300"}`}>
            {right ? "Correct! 🎉" : `Not quite — the answer is ${puzzle.a}.`}
          </p>
          <p className="text-base text-slate-200 leading-relaxed">{puzzle.why}</p>
        </div>
      )}
      {children}
    </div>
  );
};

export default PuzzleCard;
