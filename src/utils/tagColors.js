/**
 * Colour palette for student labels. Tailwind can't build class names at
 * runtime, so every colour has to appear here as a literal string. The keys
 * must stay in sync with StudentTag.COLOR_CHOICES on the backend.
 */
export const TAG_STYLES = {
  indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  rose: "bg-rose-500/15 text-rose-300 border-rose-400/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  purple: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  slate: "bg-slate-500/15 text-slate-300 border-slate-400/30",
};

export const TAG_DOTS = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  purple: "bg-purple-500",
  slate: "bg-slate-500",
};

export const TAG_COLORS = Object.keys(TAG_DOTS);

export const tagStyleFor = (color) => TAG_STYLES[color] || TAG_STYLES.indigo;
