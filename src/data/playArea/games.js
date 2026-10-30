// Play Area catalogue. `group`: "students" (learn about yourself) or "jobs"
// (for qualified students applying for jobs). Add a new test or puzzle here: `path` set = live card,
// no `path` = "Coming soon" card.
export const PLAY_AREA_GAMES = [
  {
    slug: "personality-test",
    group: "students",
    path: "/play-area/personality-test",
    title: "Personality Test",
    blurb: "100 quick statements reveal your personality profile, your study style, and the subjects and careers that may suit you.",
    icon: "fas fa-user-astronaut",
    accent: "violet",
    meta: ["100 questions", "About 12 minutes", "Free report"],
  },
  {
    slug: "workplace-assessment",
    group: "jobs",
    path: "/play-area/workplace-assessment",
    title: "Workplace Personality Assessment",
    blurb: "A pre-interview assessment built on research-tested IPIP questions. Professional report on your work style, strengths and interview questions — with a teacher-candidate version.",
    icon: "fas fa-user-tie",
    accent: "indigo",
    meta: ["100 statements", "About 15 minutes", "For job seekers & teachers"],
  },
  {
    slug: "memory-challenge",
    group: "students",
    title: "Memory Challenge",
    blurb: "Remember patterns, numbers and words — and watch your memory grow stronger every round.",
    icon: "fas fa-brain",
    accent: "cyan",
    meta: ["Coming soon"],
  },
  {
    slug: "brain-teasers",
    group: "students",
    title: "Brain Teasers",
    blurb: "Logic puzzles and riddles to stretch your thinking and sharpen problem solving.",
    icon: "fas fa-puzzle-piece",
    accent: "amber",
    meta: ["Coming soon"],
  },
  {
    slug: "career-interests",
    group: "students",
    title: "Career Interest Finder",
    blurb: "Find out which kinds of work excite you most and which A Level subjects lead there.",
    icon: "fas fa-compass",
    accent: "emerald",
    meta: ["Coming soon"],
  },
];

// Tailwind needs full class names in source, so accents map to fixed classes.
export const ACCENT_CLASSES = {
  violet: { ring: "border-violet-500/30", bg: "bg-violet-500/10", icon: "bg-violet-500/15 text-violet-300", text: "text-violet-300", bar: "bg-violet-500" },
  cyan: { ring: "border-cyan-500/30", bg: "bg-cyan-500/10", icon: "bg-cyan-500/15 text-cyan-300", text: "text-cyan-300", bar: "bg-cyan-500" },
  amber: { ring: "border-amber-500/30", bg: "bg-amber-500/10", icon: "bg-amber-500/15 text-amber-300", text: "text-amber-300", bar: "bg-amber-500" },
  emerald: { ring: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: "bg-emerald-500/15 text-emerald-300", text: "text-emerald-300", bar: "bg-emerald-500" },
  indigo: { ring: "border-indigo-500/30", bg: "bg-indigo-500/10", icon: "bg-indigo-500/15 text-indigo-300", text: "text-indigo-300", bar: "bg-indigo-500" },
  rose: { ring: "border-rose-500/30", bg: "bg-rose-500/10", icon: "bg-rose-500/15 text-rose-300", text: "text-rose-300", bar: "bg-rose-500" },
};
