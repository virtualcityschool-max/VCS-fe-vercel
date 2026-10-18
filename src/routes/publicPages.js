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
];

// The page for a path, preloaded by src/main.jsx before the first render.
export const preloadPublicPage = (pathname) => {
  const hit = PUBLIC_PAGES.find(([re]) => re.test(pathname));
  return hit ? hit[1].preload() : Promise.resolve();
};
