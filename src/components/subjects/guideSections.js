import {
  LayoutGrid, Heart, Sparkles, ListTree, GitCompare, FileText, MessageSquareText, Quote, Target,
  Award, FlaskConical, BookOpen, AlertTriangle, CalendarDays, Briefcase, Globe2, HelpCircle,
  GraduationCap, ExternalLink,
} from "lucide-react";

// Colours and section list for a subject guide (see src/data/subjectGuides).

export const ACCENT = {
  emerald: { text: "text-emerald-300", soft: "bg-emerald-500/10 border-emerald-500/25", dot: "bg-emerald-400" },
  violet: { text: "text-violet-300", soft: "bg-violet-500/10 border-violet-500/25", dot: "bg-violet-400" },
  sky: { text: "text-sky-300", soft: "bg-sky-500/10 border-sky-500/25", dot: "bg-sky-400" },
  amber: { text: "text-amber-300", soft: "bg-amber-500/10 border-amber-500/25", dot: "bg-amber-400" },
  rose: { text: "text-rose-300", soft: "bg-rose-500/10 border-rose-500/25", dot: "bg-rose-400" },
  lime: { text: "text-lime-300", soft: "bg-lime-500/10 border-lime-500/25", dot: "bg-lime-400" },
  cyan: { text: "text-cyan-300", soft: "bg-cyan-500/10 border-cyan-500/25", dot: "bg-cyan-400" },
};

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
