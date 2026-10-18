import {
  LayoutGrid, Heart, Sparkles, ListTree, GitCompare, FileText, MessageSquareText, Quote, Target,
  Award, FlaskConical, BookOpen, AlertTriangle, CalendarDays, Briefcase, Globe2, HelpCircle,
  GraduationCap, ExternalLink,
} from "lucide-react";

// Colours and section list for a subject guide (see src/data/subjectGuides).

// Per-subject accent. Full class names (not built from strings) so Tailwind keeps them.
export const ACCENT = {
  emerald: { text: "text-emerald-300", soft: "bg-emerald-500/10 border-emerald-500/25", dot: "bg-emerald-400", bar: "from-emerald-500 to-teal-300", glow: "from-emerald-600/25" },
  violet: { text: "text-violet-300", soft: "bg-violet-500/10 border-violet-500/25", dot: "bg-violet-400", bar: "from-violet-500 to-fuchsia-300", glow: "from-violet-600/25" },
  sky: { text: "text-sky-300", soft: "bg-sky-500/10 border-sky-500/25", dot: "bg-sky-400", bar: "from-sky-500 to-cyan-300", glow: "from-sky-600/25" },
  amber: { text: "text-amber-300", soft: "bg-amber-500/10 border-amber-500/25", dot: "bg-amber-400", bar: "from-amber-500 to-yellow-300", glow: "from-amber-600/25" },
  rose: { text: "text-rose-300", soft: "bg-rose-500/10 border-rose-500/25", dot: "bg-rose-400", bar: "from-rose-500 to-pink-300", glow: "from-rose-600/25" },
  lime: { text: "text-lime-300", soft: "bg-lime-500/10 border-lime-500/25", dot: "bg-lime-400", bar: "from-lime-500 to-green-300", glow: "from-lime-600/25" },
  cyan: { text: "text-cyan-300", soft: "bg-cyan-500/10 border-cyan-500/25", dot: "bg-cyan-400", bar: "from-cyan-500 to-sky-300", glow: "from-cyan-600/25" },
};

// A rotating palette for tiles and cards, so a grid isn't one colour.
export const TONES = [
  { card: "border-indigo-400/30 bg-indigo-500/10", top: "border-t-indigo-400", left: "border-l-indigo-400", text: "text-indigo-200", icon: "bg-indigo-500/20 text-indigo-200", bar: "from-indigo-500 to-violet-300" },
  { card: "border-cyan-400/30 bg-cyan-500/10", top: "border-t-cyan-400", left: "border-l-cyan-400", text: "text-cyan-200", icon: "bg-cyan-500/20 text-cyan-200", bar: "from-cyan-500 to-sky-300" },
  { card: "border-emerald-400/30 bg-emerald-500/10", top: "border-t-emerald-400", left: "border-l-emerald-400", text: "text-emerald-200", icon: "bg-emerald-500/20 text-emerald-200", bar: "from-emerald-500 to-teal-300" },
  { card: "border-amber-400/30 bg-amber-500/10", top: "border-t-amber-400", left: "border-l-amber-400", text: "text-amber-200", icon: "bg-amber-500/20 text-amber-200", bar: "from-amber-500 to-yellow-300" },
  { card: "border-rose-400/30 bg-rose-500/10", top: "border-t-rose-400", left: "border-l-rose-400", text: "text-rose-200", icon: "bg-rose-500/20 text-rose-200", bar: "from-rose-500 to-pink-300" },
  { card: "border-violet-400/30 bg-violet-500/10", top: "border-t-violet-400", left: "border-l-violet-400", text: "text-violet-200", icon: "bg-violet-500/20 text-violet-200", bar: "from-violet-500 to-fuchsia-300" },
  { card: "border-sky-400/30 bg-sky-500/10", top: "border-t-sky-400", left: "border-l-sky-400", text: "text-sky-200", icon: "bg-sky-500/20 text-sky-200", bar: "from-sky-500 to-cyan-300" },
  { card: "border-lime-400/30 bg-lime-500/10", top: "border-t-lime-400", left: "border-l-lime-400", text: "text-lime-200", icon: "bg-lime-500/20 text-lime-200", bar: "from-lime-500 to-green-300" },
];

// Photo at the top of each guide (public/images/subjects/<slug>.webp, from Unsplash).
export const guidePhoto = (slug) => `/images/subjects/${slug}.webp`;

// The guide's sections, numbered, leaving out any the guide has no content for
// (e.g. maths has no lab practical). `withVcs: false` drops the "Study it with
// us" card, for pages that already sell the class.
export const guideSections = (g, { withVcs = true } = {}) => {
  if (!g) return [];
  const s = [
    ["facts", "Quick facts", LayoutGrid, g.quickFacts],
    ["why", `Why study ${g.subject}?`, Heart, g.why],
    ["stories", "Why these topics?", Sparkles, g.stories],
    ["topics", "Topic map", ListTree, g.topics || g.topicGroups],
    ["compare", g.compareTitle || (g.level === "O Level" ? "O Level vs A Level" : "From O Level to A Level"), GitCompare, g.compare],
    ["exam", "Exam pattern", FileText, g.papers],
    ["questions", "Types of questions", MessageSquareText, g.questionTypes],
    ["command", "Command words", Quote, g.commandWords],
    ["aos", "What examiners reward", Target, g.aos],
    ["grades", "Grades", Award, g.grades],
    ["practical", g.practicalTitle || "Practical skills", FlaskConical, g.practical],
    ["books", "Books & resources", BookOpen, g.books],
    ["mistakes", "Common mistakes", AlertTriangle, g.mistakes],
    ["plan", "Study plan", CalendarDays, g.studyPlan],
    ["careers", "Where it can take you", Briefcase, g.careers],
    ["real", `${g.subject} in the real world`, Globe2, g.realWorld],
    ["faq", "Frequently asked questions", HelpCircle, g.faqs],
    ["vcs", "Study it with us", GraduationCap, true],
    ["sources", "Official sources", ExternalLink, g.sources],
  ].filter((x) => x[3]);
  return s.filter((x) => withVcs || x[0] !== "vcs").map(([id, title, icon], i) => ({ id, title, icon, n: i + 1 }));
};
