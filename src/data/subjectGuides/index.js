// Subject guides: one per Cambridge syllabus code, built from the official
// syllabus. To publish a new guide: add its file here AND its slug to
// SUBJECT_GUIDE_SLUGS in scripts/prerender.js and to scripts/generate-sitemap.js.
import chemistry5070 from "./chemistry-5070";
import chemistry9701 from "./chemistry-9701";
import physics5054 from "./physics-5054";
import physics9702 from "./physics-9702";
import biology5090 from "./biology-5090";
import biology9700 from "./biology-9700";
import mathematics4024 from "./mathematics-4024";
import additionalMathematics4037 from "./additional-mathematics-4037";
import mathematics9709 from "./mathematics-9709";
import english1123 from "./english-1123";
import english9093 from "./english-9093";
import computerScience2210 from "./computer-science-2210";
import computerScience9618 from "./computer-science-9618";
import islamiyat2058 from "./islamiyat-2058";
import pakistanStudies2059 from "./pakistan-studies-2059";
import urdu3248 from "./urdu-3248";
import urdu3247 from "./urdu-3247";
import urdu9866 from "./urdu-9866";

export const SUBJECT_GUIDES = [
  mathematics4024, additionalMathematics4037, physics5054, chemistry5070, biology5090,
  english1123, computerScience2210, islamiyat2058, pakistanStudies2059, urdu3247, urdu3248,
  mathematics9709, physics9702, chemistry9701, biology9700, english9093, computerScience9618, urdu9866,
];

export const guideBySlug = (slug) => SUBJECT_GUIDES.find((g) => g.slug === slug) || null;

// A course title such as "Chemistry — O Level (5070)" → the guide for 5070.
export const guideForCourseTitle = (title = "") => {
  const code = (String(title).match(/\b(\d{4})\b/) || [])[1];
  return code ? SUBJECT_GUIDES.find((g) => g.code === code || g.aliases?.includes(code)) || null : null;
};
