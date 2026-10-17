// Subject guides: one per Cambridge syllabus code, built from the official
// syllabus. Add a new guide file here to publish it at /subjects/<slug>.
import chemistry5070 from "./chemistry-5070";
import chemistry9701 from "./chemistry-9701";

export const SUBJECT_GUIDES = [chemistry5070, chemistry9701];

export const guideBySlug = (slug) => SUBJECT_GUIDES.find((g) => g.slug === slug) || null;

// A course title such as "Chemistry — O Level (5070)" → the guide for 5070.
export const guideForCourseTitle = (title = "") => {
  const code = (String(title).match(/\b(\d{4})\b/) || [])[1];
  return code ? SUBJECT_GUIDES.find((g) => g.code === code) || null : null;
};
