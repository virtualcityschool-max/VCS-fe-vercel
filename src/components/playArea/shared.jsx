import { shareLink as memoryShare } from "../../data/playArea/memory";

export const Stat = ({ label, value, color = "text-white" }) => (
  <div className="px-3 sm:px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] text-center min-w-[84px] sm:min-w-[96px]">
    <div className={`text-xl md:text-2xl font-black ${color}`}>{value}</div>
    <div className="text-xs font-bold uppercase tracking-wider text-slate-300">{label}</div>
  </div>
);

export const PrimaryButton = ({ children, onClick, className = "", ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-6 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition disabled:opacity-50 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const GhostButton = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-slate-100 text-base font-bold transition"
  >
    {children}
  </button>
);

// Shown when a game ends: score, personal best, what most people score, share.
export const GameOver = ({ title, score, unit, best, isNewBest, note, shareText, shareLink = memoryShare, onAgain, onExit, children }) => (
  <div className="text-center py-6 md:py-10">
    {isNewBest && (
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-black uppercase tracking-widest mb-4 animate-bounce">
        <i className="fas fa-trophy" aria-hidden="true" /> New personal best!
      </div>
    )}
    <p className="text-base font-bold text-slate-300 mb-1">{title}</p>
    <p className="text-5xl md:text-7xl font-black text-white mb-1">{score}</p>
    <p className="text-lg font-bold text-cyan-300 mb-4">{unit}</p>
    {best != null && <p className="text-base text-slate-200 mb-2">Your best: <strong className="text-white">{best} {unit}</strong></p>}
    {note && <p className="text-base text-slate-300 max-w-xl mx-auto mb-6">{note}</p>}
    {children}
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      <PrimaryButton onClick={onAgain}>
        <i className="fas fa-rotate-right mr-2" aria-hidden="true" /> Play again
      </PrimaryButton>
      <a
        href={shareLink(shareText)}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold transition"
      >
        <i className="fab fa-whatsapp mr-2" aria-hidden="true" /> Share score
      </a>
      <GhostButton onClick={onExit}>All games</GhostButton>
    </div>
  </div>
);

// Small status line above the board ("Watch…", "Your turn", "Correct!").
export const Status = ({ tone = "info", children }) => {
  const cls = {
    info: "text-cyan-300",
    go: "text-emerald-300",
    bad: "text-rose-300",
    good: "text-amber-300",
  }[tone];
  return (
    <p className={`text-lg md:text-xl font-black text-center min-h-[2rem] ${cls}`} role="status" aria-live="polite">
      {children}
    </p>
  );
};
