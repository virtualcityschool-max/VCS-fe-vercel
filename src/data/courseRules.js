// Search rules for course pages, shared by the course page (CourseDetails.jsx)
// and the sitemap (scripts/generate-sitemap.js), so both always agree.
//
// 1. Thin pages: a course with under THIN_WORDS words of its own text (title
//    aside) and no Cambridge subject guide is marked noindex and left out of
//    the sitemap. It comes back by itself once the admin writes a description
//    or outline.
// 2. Class batches: "Chemistry IGCSE 1 (0620)" and "Chemistry IGCSE 2 (0620)"
//    are the same course taught to two groups. The page with the most text is
//    the main one; the others point their canonical at it and stay out of the
//    sitemap.
// 3. AS / A2: the AS and A2 pages of one subject show different topics and
//    papers (see stageGuide), and link to each other.

export const THIN_WORDS = 50;

const textOf = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&[a-z]+;/g, " ");

const wordCount = (s) => (String(s || "").match(/[\p{L}\p{N}]+/gu) || []).length;

export const cleanTitle = (t) => String(t || "").replace(/\s+/g, " ").trim();

// Words the course page shows that are this course's own: description,
// outline and the admin's course page details.
export const ownWords = (course) => {
  if (!course) return 0;
  const title = cleanTitle(course.title).toLowerCase();
  const desc = cleanTitle(textOf(course.description));
  const details = course.details && typeof course.details === "object"
    ? Object.values(course.details).flat().filter((v) => typeof v === "string").join(" ")
    : "";
  return (desc.toLowerCase() === title ? 0 : wordCount(desc)) + wordCount(textOf(course.outline)) + wordCount(details);
};

export const isThinCourse = (course, hasGuide) => !hasGuide && ownWords(course) < THIN_WORDS;

// "AS" or "A2" for split A Level courses, else null.
export const courseStage = (course) => {
  const title = cleanTitle(course?.title);
  const cat = String((course?.category && typeof course.category === "object" ? course.category.name : course?.category) || "");
  if (/\bA2\b/i.test(title) || /^A2\b/i.test(cat)) return "A2";
  if (/\bAS\b/.test(title) || /^AS\b/i.test(cat)) return "AS";
  return null;
};

const levelName = (c) => String((c?.category && typeof c.category === "object" ? c.category.name : c?.category) || "");

// Same course, different batch: same title once the batch marker
// ("1", "2", "I", "II", "Batch B") is taken out, and the same level.
export const batchKey = (course) =>
  [
    levelName(course).toLowerCase(),
    cleanTitle(course?.title)
      .toLowerCase()
      .replace(/\bbatch\s*[a-z0-9]+\b/g, " ")
      .replace(/\b(i{1,3}|iv|[1-4])\b(?=\s*(\(|$|\d{4}))/g, " ")
      .replace(/[^\p{L}\p{N}]+/gu, ""),
  ].join("|");

// Small list of all published courses, for the course page's links and rules.
// `rows` are course records from the public API.
export const buildCourseIndex = (rows) => {
  const items = rows
    .filter((c) => c && c.id != null && (c.status == null || c.status === "published"))
    .map((c) => ({
      id: c.id,
      title: cleanTitle(c.title),
      level: levelName(c),
      code: (String(c.subject_code || "").match(/\d{4}/) || String(c.title || "").match(/\b\d{4}\b/) || [null])[0],
      stage: courseStage(c),
      teacher: c.instructor?.id ?? null,
      words: ownWords(c),
      key: batchKey(c),
    }));
  // The main page of each batch group: most text, then lowest id.
  const main = {};
  for (const x of items) {
    const m = main[x.key];
    if (!m || x.words > m.words || (x.words === m.words && x.id < m.id)) main[x.key] = x;
  }
  return items
    .sort((a, b) => a.id - b.id)
    .map(({ key, ...x }) => ({ ...x, canonical: main[key].id === x.id ? null : main[key].id }));
};

// Course page view of a split A Level guide: the AS page shows the AS topics
// and papers, the A2 page the A Level ones. Falls back to the whole guide
// where the guide isn't split that way (e.g. Maths 9709 by Pure/Applied).
export const stageGuide = (guide, stage) => {
  if (!guide || !stage) return guide;
  const isAS = stage === "AS";
  const groups = (guide.topicGroups || []).filter((tg) => (isAS ? /^AS\b/ : /^A Level\b/).test(tg.label || ""));
  const papers = (guide.papers || []).filter((p) => {
    const who = String(p.who || "");
    return isAS ? /AS|Everyone/i.test(who) : /A Level/i.test(who) && !/^AS & A Level$|AS only|Everyone/i.test(who);
  });
  return {
    ...guide,
    topicGroups: groups.length ? groups : guide.topicGroups,
    papers: papers.length ? papers : guide.papers,
  };
};
