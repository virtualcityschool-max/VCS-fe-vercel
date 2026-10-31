import { lazyPage } from "./lazyPage";

// Public pages other than the home page are separate downloads (home page
// speed); src/main.jsx preloads the current one before the first render.
export const Marketplace = lazyPage(() => import("../pages/public/Marketplace"));
export const CourseDetails = lazyPage(() => import("../pages/public/CourseDetails"));
export const Blogs = lazyPage(() => import("../pages/public/Blogs"));
export const BlogDetails = lazyPage(() => import("../pages/public/BlogDetails"));
export const TeachersDirectory = lazyPage(() => import("../pages/public/TeachersDirectory"));
export const TeacherProfile = lazyPage(() => import("../pages/public/TeacherProfile"));
export const PrivacyPolicy = lazyPage(() => import("../pages/public/PrivacyPolicy"));
export const TermsAndConditions = lazyPage(() => import("../pages/public/TermsAndConditions"));
export const AboutPage = lazyPage(() => import("../pages/public/AboutPage"));
export const OnlineSchoolHub = lazyPage(() => import("../pages/public/OnlineSchoolHub"));
export const CountryLandingPage = lazyPage(() => import("../pages/public/CountryLandingPage"));
export const ExamDatesPage = lazyPage(() => import("../pages/public/ExamDatesPage"));
export const SubjectGuidePage = lazyPage(() => import("../pages/public/SubjectGuidePage"));
export const SubjectGuidesIndex = lazyPage(() => import("../pages/public/SubjectGuidePage"), "SubjectGuidesIndex");
export const PlayArea = lazyPage(() => import("../pages/public/PlayArea"));
export const PersonalityTest = lazyPage(() => import("../pages/public/PersonalityTest"));
export const WorkplaceAssessment = lazyPage(() => import("../pages/public/WorkplaceAssessment"));
export const StarSigns = lazyPage(() => import("../pages/public/StarSigns"));
export const MemoryChallenge = lazyPage(() => import("../pages/public/MemoryChallenge"));
export const BrainTeasers = lazyPage(() => import("../pages/public/BrainTeasers"));
export const SmartRevision = lazyPage(() => import("../pages/public/SmartRevision"));
export const SmartNotes = lazyPage(() => import("../pages/public/SmartNotes"));

// For src/main.jsx: the page component for a public path, to preload.
export const PUBLIC_PAGES = [
  [/^\/courses\/?$/, Marketplace],
  [/^\/courses\/[^/]+\/?$/, CourseDetails],
  [/^\/blogs\/?$/, Blogs],
  [/^\/blogs\/[^/]+\/?$/, BlogDetails],
  [/^\/teachers\/?$/, TeachersDirectory],
  [/^\/teachers\/[^/]+\/?$/, TeacherProfile],
  [/^\/privacy-policy\/?$/, PrivacyPolicy],
  [/^\/terms\/?$/, TermsAndConditions],
  [/^\/about\/?$/, AboutPage],
  [/^\/online-school\/?$/, OnlineSchoolHub],
  [/^\/online-school\/[^/]+\/?$/, CountryLandingPage],
  [/^\/exam-dates\/?$/, ExamDatesPage],
  [/^\/subjects\/?$/, SubjectGuidesIndex],
  [/^\/subjects\/[^/]+\/?$/, SubjectGuidePage],
  [/^\/mind-lab\/?$/, PlayArea],
  [/^\/mind-lab\/personality-test\/?$/, PersonalityTest],
  [/^\/mind-lab\/workplace-assessment\/?$/, WorkplaceAssessment],
  [/^\/mind-lab\/star-signs\/?$/, StarSigns],
  [/^\/mind-lab\/memory-challenge\/?$/, MemoryChallenge],
  [/^\/mind-lab\/brain-teasers\/?$/, BrainTeasers],
  [/^\/mind-lab\/smart-revision\/?$/, SmartRevision],
  [/^\/mind-lab\/smart-notes\/?$/, SmartNotes],
];

// The page for a path, preloaded by src/main.jsx before the first render.
export const preloadPublicPage = (pathname) => {
  const hit = PUBLIC_PAGES.find(([re]) => re.test(pathname));
  return hit ? hit[1].preload() : Promise.resolve();
};
