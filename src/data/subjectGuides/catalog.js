// Names and links of the subject guides, without their content — small enough
// for the site menu, footer and course cards on every page. Keep in step with
// SUBJECT_GUIDES in ./index.js (scripts/check-guide-catalog.mjs checks this at
// build time; `node scripts/check-guide-catalog.mjs --print` prints fresh rows).
export const GUIDE_CATALOG = [
  { slug: "mathematics-4024", subject: "Mathematics", level: "O Level", code: "4024" },
  { slug: "additional-mathematics-4037", subject: "Additional Mathematics", level: "O Level", code: "4037" },
  { slug: "physics-5054", subject: "Physics", level: "O Level", code: "5054" },
  { slug: "chemistry-5070", subject: "Chemistry", level: "O Level", code: "5070" },
  { slug: "biology-5090", subject: "Biology", level: "O Level", code: "5090" },
  { slug: "english-1123", subject: "English Language", level: "O Level", code: "1123" },
  { slug: "computer-science-2210", subject: "Computer Science", level: "O Level", code: "2210" },
  { slug: "islamiyat-2058", subject: "Islamiyat", level: "O Level", code: "2058" },
  { slug: "pakistan-studies-2059", subject: "Pakistan Studies", level: "O Level", code: "2059" },
  { slug: "urdu-3247", subject: "Urdu (First Language)", level: "O Level", code: "3247" },
  { slug: "urdu-3248", subject: "Urdu (Second Language)", level: "O Level", code: "3248" },
  { slug: "mathematics-9709", subject: "Mathematics", level: "AS & A Level", code: "9709" },
  { slug: "physics-9702", subject: "Physics", level: "AS & A Level", code: "9702" },
  { slug: "chemistry-9701", subject: "Chemistry", level: "AS & A Level", code: "9701" },
  { slug: "biology-9700", subject: "Biology", level: "AS & A Level", code: "9700" },
  { slug: "english-9093", subject: "English Language", level: "AS & A Level", code: "9093" },
  { slug: "computer-science-9618", subject: "Computer Science", level: "AS & A Level", code: "9618" },
  { slug: "urdu-9866", subject: "Urdu Language & Literature", level: "AS & A Level", code: "9866", aliases: ["9686"] },
];

const byCode = (code) =>
  code ? GUIDE_CATALOG.find((g) => g.code === code || g.aliases?.includes(code)) || null : null;
const codeIn = (text) => (String(text || "").match(/\b(\d{4})\b/) || [])[1];

// The guide for a course record (same rule as guideForCourse in ./index.js):
// the admin's syllabus code, else the subject's code, else the code in the title.
export const catalogGuideFor = (course) =>
  course
    ? byCode(codeIn(course.details?.syllabus_code)) || byCode(codeIn(course.subject_code)) || byCode(codeIn(course.title))
    : null;
