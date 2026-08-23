// Maps a teacher's expertise/courses to one of five subject categories so the
// Teachers Directory can color-code cards consistently across avatar, tags,
// and filter chips. Falls back to a neutral theme when nothing matches.

const CATEGORY_KEYWORDS = [
  ["math", ["math", "algebra", "calculus"]],
  ["science", ["science", "biology", "chemistry", "physics", "environmental"]],
  ["cs", ["computer", "ict", "computing", "programming"]],
  ["humanities", ["english", "literature", "urdu", "history", "geography", "language"]],
  ["islamiyat", ["islam", "quran", "qur'an", "pakistan stud", "religious"]],
];

export const SUBJECT_THEMES = {
  math: {
    key: "math",
    label: "Mathematics",
    avatarGradient: "from-indigo-500 to-indigo-400",
    ring: "ring-4 ring-indigo-500/20",
    accentBar: "from-indigo-500 to-indigo-400",
    text: "text-indigo-300",
    tagBg: "bg-indigo-500/15",
    tagText: "text-indigo-300",
    tagBorder: "border-indigo-500/30",
    chipSwatch: "bg-indigo-500",
    chipActive: "bg-indigo-500/15 border-indigo-500 text-indigo-200",
  },
  science: {
    key: "science",
    label: "Science",
    avatarGradient: "from-emerald-500 to-emerald-400",
    ring: "ring-4 ring-emerald-500/20",
    accentBar: "from-emerald-500 to-emerald-400",
    text: "text-emerald-300",
    tagBg: "bg-emerald-500/15",
    tagText: "text-emerald-300",
    tagBorder: "border-emerald-500/30",
    chipSwatch: "bg-emerald-500",
    chipActive: "bg-emerald-500/15 border-emerald-500 text-emerald-200",
  },
  cs: {
    key: "cs",
    label: "Computer Science",
    avatarGradient: "from-cyan-500 to-cyan-400",
    ring: "ring-4 ring-cyan-500/20",
    accentBar: "from-cyan-500 to-cyan-400",
    text: "text-cyan-300",
    tagBg: "bg-cyan-500/15",
    tagText: "text-cyan-300",
    tagBorder: "border-cyan-500/30",
    chipSwatch: "bg-cyan-500",
    chipActive: "bg-cyan-500/15 border-cyan-500 text-cyan-200",
  },
  humanities: {
    key: "humanities",
    label: "English & Humanities",
    avatarGradient: "from-purple-500 to-purple-400",
    ring: "ring-4 ring-purple-500/20",
    accentBar: "from-purple-500 to-purple-400",
    text: "text-purple-300",
    tagBg: "bg-purple-500/15",
    tagText: "text-purple-300",
    tagBorder: "border-purple-500/30",
    chipSwatch: "bg-purple-500",
    chipActive: "bg-purple-500/15 border-purple-500 text-purple-200",
  },
  islamiyat: {
    key: "islamiyat",
    label: "Islamiyat & Studies",
    avatarGradient: "from-amber-500 to-amber-400",
    ring: "ring-4 ring-amber-500/20",
    accentBar: "from-amber-500 to-amber-400",
    text: "text-amber-300",
    tagBg: "bg-amber-500/15",
    tagText: "text-amber-300",
    tagBorder: "border-amber-500/30",
    chipSwatch: "bg-amber-500",
    chipActive: "bg-amber-500/15 border-amber-500 text-amber-200",
  },
  general: {
    key: "general",
    label: "General Tutor",
    avatarGradient: "from-indigo-500 to-indigo-700",
    ring: "ring-4 ring-slate-500/10",
    accentBar: "from-slate-600 to-slate-500",
    text: "text-slate-400",
    tagBg: "bg-slate-800",
    tagText: "text-slate-300",
    tagBorder: "border-slate-700",
    chipSwatch: "bg-slate-500",
    chipActive: "bg-slate-500/15 border-slate-400 text-slate-200",
  },
};

export const SUBJECT_CATEGORY_LIST = ["math", "science", "cs", "humanities", "islamiyat"];

function matchCategory(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return null;
}

export function getTeacherCategory(teacher) {
  if (!teacher) return "general";
  const fromExpertise = matchCategory(teacher.expertise);
  if (fromExpertise) return fromExpertise;

  for (const course of teacher.courses || []) {
    const fromCourse = matchCategory(course.course_name);
    if (fromCourse) return fromCourse;
  }

  return "general";
}

export function getTeacherTheme(teacher) {
  return SUBJECT_THEMES[getTeacherCategory(teacher)];
}
