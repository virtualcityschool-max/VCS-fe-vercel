import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseById } from "../../store/slices/coursesSlice";
import {
  enrollInCourseNormal,
  enrollInCoursePrivate,
  unenrollFromCourse,
  fetchStudentDashboard,
} from "../../store/slices/studentDashboardSlice";
import {
  Button,
  Card,
  LoadingSpinner,
  ErrorMessage,
} from "../../components/ui";
import BreadcrumbNavigation from "../../components/ui/BreadcrumbNavigation";
import BackButton from "../../components/ui/BackButton";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { useSubmissionGuard } from "../../utils/requestDeduplicator";
import { useNumberFormat, useTextFormat } from "../../hooks/useFormat";
import { getCourseImage } from "../../utils/courseImageUtils";
import { setAuthModal, setEnrollmentIntent } from "../../store/slices/uiSlice";
import EnrollmentTypeModal from "../../components/courses/EnrollmentTypeModal";
import ApplyFreeAccessModal from "../../components/public/ApplyFreeAccessModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getStorageUrl } from "../../utils/storageUrl";
import FileViewerModal from "../../components/common/FileViewerModal";
import { studentService } from "../../services/studentService";
import { getDisplayName, plainText } from "../../utils/userDisplay";
import { courseStage, isThinCourse, stageGuide } from "../../data/courseRules";
import COURSE_INDEX from "../../data/courseIndex.json";
import CourseOutline from "../../components/courses/CourseOutline";
import { outlineBlocks } from "../../utils/outlineBlocks";
import { useSeo } from "../../hooks/useSeo";
import { catalogGuideFor } from "../../data/subjectGuides/catalog";
import { loadGuide } from "../../data/subjectGuides/load";
import GuideBody from "../../components/subjects/GuideBody";
import { guideSections } from "../../components/subjects/guideSections";
import { useActiveSection, useFollowingBox } from "../../hooks/useFollowingBox";
import { useWhatsappNumber } from "../../hooks/useWhatsappNumber";
import { sizedImage, fallbackToOriginal } from "../../utils/imageCdn";

// The syllabus essentials shown on a course page. The rest of the guide (why
// study it, question types, books, study plan, careers, FAQs) stays on its own
// /subjects page, so Google doesn't see the same long text on several pages.
const COURSE_GUIDE_SECTIONS = ["facts", "topics", "exam", "grades"];

// Static class names so Tailwind keeps them.
const SECTION_COLORS = {
  blue: "bg-blue-500/20 text-blue-400",
  purple: "bg-purple-500/20 text-purple-400",
  amber: "bg-amber-500/20 text-amber-400",
  teal: "bg-teal-500/20 text-teal-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  indigo: "bg-indigo-500/20 text-indigo-400",
};

const CourseSection = ({ id, icon, color, title, children }) => (
  <section id={id} className="scroll-mt-24 mb-10">
    <h2 className="text-xl md:text-2xl font-bold font-poppins mb-5 flex items-center gap-3">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${SECTION_COLORS[color]}`}>
        <i className={`fas ${icon} text-sm`}></i>
      </span>
      {title}
    </h2>
    {children}
  </section>
);

// Questions parents ask, answered from this course's own data only. A question
// is left out when we don't hold the answer.
const syllabusAnswer = ({ title, guide, stage, level }) => {
  if (guide) {
    const base = `It follows the Cambridge International ${guide.level} ${guide.subject} syllabus (${guide.code}).`;
    if (stage === "AS") return `${base} This course is the AS Level year, the first half of the full A Level.`;
    if (stage === "A2") return `${base} This course is the A2 year, the second half of the full A Level.`;
    return base;
  }
  const grade = (title.match(/\b(?:grade|class)\s*(\d{1,2})\b/i) || title.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s*grade\b/i) || [])[1];
  const forGrade = grade ? ` for Grade ${grade}` : "";
  if (/federal board/i.test(title)) return `It follows the Federal Board (FBISE) syllabus${forGrade}.`;
  if (/oxford/i.test(title)) return `It follows the Oxford curriculum${forGrade}.`;
  if (/cambridge/i.test(title)) return `It follows the Cambridge curriculum${forGrade}.`;
  if (/igcse/i.test(title) || /igcse/i.test(level || "")) {
    const code = (title.match(/\b(0\d{3})\b/) || [])[1];
    if (code) return `It follows the Cambridge IGCSE syllabus ${code}.`;
  }
  return null;
};

const courseFaqs = ({ title, teacher, price, details, guide, stage, level }) => {
  const when = [details.class_days, details.class_time].filter(Boolean).join(", ");
  return [
    teacher && {
      q: `Who teaches ${title}?`,
      a: `${teacher} teaches this course. Their tutor page shows their experience and the other courses they teach.`,
    },
    price && { q: `How much does ${title} cost?`, a: `The fee is ${price}.` },
    {
      q: "When are the classes?",
      a: when
        ? `Classes are on ${when}${details.class_length ? `, and each class lasts ${details.class_length}` : ""}.`
        : "Class days and times are set for each group of students. Message us on WhatsApp and we will tell you the current timetable.",
    },
    syllabusAnswer({ title, guide, stage, level }) && { q: "Which syllabus does it follow?", a: syllabusAnswer({ title, guide, stage, level }) },
    {
      q: "How do I join?",
      a: `Create a free account, open this page and press Enrol${price ? ", then pay the monthly fee" : ""}. If you have a question first, message us on WhatsApp.`,
    },
  ].filter(Boolean);
};

const CourseDetails = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [freeAccessOpen, setFreeAccessOpen] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [unenrollConfirm, setUnenrollConfirm] = useState({ open: false });
  const submissionGuard = useSubmissionGuard();
  // Get auth state from Redux store
  const auth = useSelector((state) => state.auth);

  // Get course data from Redux store
  const {
    currentCourse: course,
    isLoading,
    error,
  } = useSelector((state) => state.courses);

  // Get student dashboard state for enrollment tracking
  const { enrollingCourseIds, unenrollingCourseIds, enrolledCourses } =
    useSelector((state) => state.studentDashboard);

  const { enrollmentIntent } = useSelector((state) => state.ui);

  // Formatting hooks
  const { formatCurrency } = useNumberFormat();
  const { capitalize, truncate } = useTextFormat();
  const whatsappNumber = useWhatsappNumber();

  // Fetch course details on component mount
  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
    }

    // Fetch student dashboard if user is logged in as student
    if (auth.isLoggedIn && auth.role === "student") {
      dispatch(fetchStudentDashboard());
    }
  }, [dispatch, courseId, auth.isLoggedIn, auth.role]);

  // Reset image error when course changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageError(false);
  }, [courseId]);



  // Normalize course data for safe rendering
  const normalizedCourse = React.useMemo(() => {
    if (!course) return null;

    // CMS titles occasionally carry runs of stray whitespace (e.g. tabs
    // pasted in from a spreadsheet) that otherwise land verbatim in the
    // <title> tag, meta description and JSON-LD - collapse them before the
    // title is used anywhere visitor- or crawler-facing.
    const title = (course.title || "Untitled Course").replace(/\s+/g, " ").trim();

    // Cambridge syllabus codes are the trailing 4 digits of a course title,
    // either bare ("Chemistry O Levels 5070") or parenthesized ("Biology
    // IGCSE I (0610)"). Federal Board and non-Cambridge courses don't carry
    // one, so this is best-effort and null when absent - never invented.
    const syllabusMatch = title.match(/\(?(\d{4})\)?$/);
    const syllabusCode = syllabusMatch ? syllabusMatch[1] : null;

    // Some course records have no real description on file and just echo
    // the title back (e.g. description: "Biology 0620" for a course named
    // "Biology 0620") - that's indistinguishable from "not written yet," so
    // treat it the same as missing rather than showing a duplicate of the
    // title as if it were content, both on the page and in Course schema.
    const hasRealDescription =
      course.description && course.description.trim().toLowerCase() !== title.trim().toLowerCase();

    return {
      id: course.id || courseId,
      title,
      syllabusCode,
      description: hasRealDescription
        ? course.description
        : "Full course description coming soon - message us on WhatsApp for the syllabus and schedule.",
      thumbnail: course.thumbnail,
      category: (typeof course.category === "object" && course.category !== null ? course.category.name : course.category) || "general",
      price: course.price || "0.00",
      status: course.status || "draft",
      instructor_id: course.instructor_id,
      instructor: course.instructor || null,
      schedule: course.schedule,
      created_at: course.created_at,
      updated_at: course.updated_at,
      outline: course.outline || null,
      attachment: course.attachment || null,
      has_session: course.has_session ?? true,
      enrollment_status: course.enrollment_status,
      is_paid: course.is_paid ?? false,
      gumroad_product_permalink: course.gumroad_product_permalink || null,
      details: course.details && typeof course.details === "object" ? course.details : {},
    };
  }, [course, courseId]);

  // The Cambridge subject guide for this course: the syllabus code the admin
  // set on the course first, else the code in its title.
  // Which guide (from the small catalogue), then that guide's content only.
  const guideSlug = normalizedCourse ? catalogGuideFor({ ...course, details: normalizedCourse.details })?.slug || null : null;
  const [loadedGuide, setLoadedGuide] = useState(null);
  useEffect(() => {
    let live = true;
    loadGuide(guideSlug).then((g) => { if (live) setLoadedGuide(g); });
    return () => { live = false; };
  }, [guideSlug]);
  const fullGuide = loadedGuide && loadedGuide.slug === guideSlug ? loadedGuide : null;
  // AS and A2 courses of one subject show their own year's topics and papers.
  const stage = normalizedCourse ? courseStage(course) : null;
  const guide = React.useMemo(() => stageGuide(fullGuide, stage), [fullGuide, stage]);
  const guideSecs = React.useMemo(
    () => guideSections(guide, { withVcs: false })
      .filter((x) => COURSE_GUIDE_SECTIONS.includes(x.id))
      .map((x) => ({
        ...x,
        n: null,
        title: stage && x.id === "topics" ? `${stage} topics` : stage && x.id === "exam" ? `${stage} exam papers` : x.title,
      })),
    [guide, stage],
  );

  // Other published courses (list made at build time by generate-sitemap.js).
  const thisId = Number(normalizedCourse?.id);
  const indexRow = COURSE_INDEX.find((x) => x.id === thisId) || null;
  const canonicalId = indexRow?.canonical || null;
  const stageSibling = indexRow?.stage && indexRow.code
    ? COURSE_INDEX.find((x) => x.code === indexRow.code && x.stage && x.stage !== indexRow.stage && !x.canonical) || null
    : null;
  const teacherOther = indexRow?.teacher
    ? COURSE_INDEX.filter((x) => x.teacher === indexRow.teacher && x.id !== thisId && !x.canonical).slice(0, 6)
    : [];
  const related = indexRow
    ? COURSE_INDEX.filter((x) => x.level === indexRow.level && x.id !== thisId && x.id !== canonicalId && !x.canonical && !teacherOther.some((t) => t.id === x.id)).slice(0, 8)
    : [];
  const outlineHtml = guideSlug ? null : normalizedCourse?.outline || null;
  const outline = React.useMemo(() => outlineBlocks(outlineHtml), [outlineHtml]);

  // Side menu: follows the page down and highlights the section being read.
  const [active, setActive] = useState("course-about");
  const menuSlotRef = React.useRef(null);
  const menuBoxRef = React.useRef(null);
  const gridRef = React.useRef(null);
  const contentRef = React.useRef(null);
  useFollowingBox(menuSlotRef, menuBoxRef, gridRef, `${normalizedCourse?.id}-${guide?.slug}`);
  useActiveSection("#course-content section[id]", `${normalizedCourse?.id}-${guide?.slug}`, setActive);

  const courseUrl = typeof window !== "undefined" ? window.location.href : undefined;

  // Per-course meta description built from real fields only - previously
  // identical boilerplate for every course ("Enroll in X - a live online
  // Cambridge course..."), which reads as duplicate/thin content across
  // 100+ course pages. Deliberately has no exam-session date: the course
  // API carries no such field (Cambridge exam sessions live only on the
  // general /exam-dates page), and inventing one here would be exactly the
  // kind of unverified claim flagged elsewhere on this site.
  // Per-course search snippet from real fields only (teacher, class times set
  // by the admin, the Cambridge syllabus facts), so no two course pages read
  // the same. Never invents a date or a claim the data doesn't carry.
  const seoDetails = normalizedCourse?.details || {};
  const seoTeacher = normalizedCourse ? getDisplayName(normalizedCourse.instructor) : null;
  const seoPapers = guide?.quickFacts?.find((f) => f.label === "Exams you sit")?.value;
  const metaDescription = normalizedCourse
    ? [
        `${normalizedCourse.title}: live online ${guide ? `Cambridge ${guide.level} ` : ""}classes${seoTeacher ? ` with ${seoTeacher}` : ""} at Virtual City School.`,
        seoDetails.class_days || seoDetails.class_time
          ? `Classes ${[seoDetails.class_days, seoDetails.class_time].filter(Boolean).join(", ")}.`
          : null,
        guide ? `Syllabus ${guide.code}${seoPapers ? `, ${seoPapers}` : ""} — exam pattern, topics${guide.grades ? " and grade boundaries" : ""} explained.` : (normalizedCourse.syllabusCode ? `Cambridge syllabus ${normalizedCourse.syllabusCode}.` : null),
        Number(normalizedCourse.price) > 0
          ? `${formatCurrency(Number(normalizedCourse.price))} per month.`
          : null,
      ]
        .filter(Boolean)
        .join(" ")
    : undefined;

  const faqs = normalizedCourse ? courseFaqs({
    title: normalizedCourse.title,
    teacher: seoTeacher,
    price: Number(normalizedCourse.price) > 0 ? `${formatCurrency(Number(normalizedCourse.price))} per month` : null,
    details: seoDetails,
    guide,
    stage,
    level: normalizedCourse.category,
  }) : [];

  useSeo({
      title: normalizedCourse ? `${normalizedCourse.title} — Live Online Classes | Virtual City School` : undefined,
      description: metaDescription,
      url: courseUrl,
      canonical: canonicalId ? `https://virtualcityschool.com/courses/${canonicalId}` : undefined,
      // Under ~50 words of its own and no subject guide: kept out of Google
      // until the admin writes a description or outline (courseRules.js).
      noindex: Boolean(normalizedCourse) && normalizedCourse.status === "published" && isThinCourse(course, Boolean(guideSlug)),
      jsonLd: normalizedCourse
        ? [
            {
              "@type": "Course",
              name: normalizedCourse.title,
              description: normalizedCourse.description,
              url: courseUrl,
              provider: {
                "@type": "EducationalOrganization",
                name: "Virtual City School",
                sameAs: "https://virtualcityschool.com",
              },
              // Real data only - the instructor is whoever's actually assigned,
              // and this is a live-taught, paid-per-course offering, not a
              // free/self-paced one, so hasCourseInstance/offers reflect what's
              // actually true rather than filling in placeholder values.
              ...(getDisplayName(normalizedCourse.instructor)
                ? { instructor: { "@type": "Person", name: getDisplayName(normalizedCourse.instructor) } }
                : {}),
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                courseWorkload: "Live, instructor-led",
              },
              offers: {
                "@type": "Offer",
                price: normalizedCourse.price,
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: courseUrl,
              },
            },
            ...(faqs.length
              ? [{
                  "@type": "FAQPage",
                  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
                }]
              : []),
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://virtualcityschool.com" },
                { "@type": "ListItem", position: 2, name: "Courses", item: "https://virtualcityschool.com/courses" },
                { "@type": "ListItem", position: 3, name: normalizedCourse.title, item: courseUrl },
              ],
            },
          ]
        : undefined,
  });
  
  // Check if course is enrolled
  const isCourseEnrolled = (courseData) => {
    if (!courseData || !auth.isLoggedIn || auth.role !== "student") {
      return false;
    }

    // Check if enrolledCourses contains this course
    if (enrolledCourses && Array.isArray(enrolledCourses)) {
      return enrolledCourses.some((enrolled) => enrolled.id === courseData.id);
    }

    return false;
  };


  // Handle course enrollment - always show confirmation modal first
  const handleEnrollCourse = async () => {
    if (!auth.isLoggedIn) {
      dispatch(setAuthModal("login"));
      return;
    }

    if (auth.role !== "student") {
      toastManager.error("Only students can enroll in courses");
      return;
    }

    setEnrollmentModalOpen(true);
  };

  // Called when student confirms on paid modal - redirect to Gumroad
  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const data = await studentService.initiateCheckout(normalizedCourse.id);
      window.location.href = data.checkout_url;
    } catch (error) {
      showApiError(error);
      setIsCheckingOut(false);
    }
  };

  // Handle post-login enrollment intent
  useEffect(() => {
    if (auth.isLoggedIn && auth.role === "student" && enrollmentIntent && normalizedCourse) {
      if (enrollmentIntent.courseId === normalizedCourse.id) {
        // Automatically open enrollment modal
        handleEnrollCourse();
        // Clear intent
        dispatch(setEnrollmentIntent(null));
      }
    }
  }, [auth.isLoggedIn, auth.role, enrollmentIntent, normalizedCourse, dispatch]);

  // Handle enrollment type selection
  const handleEnrollmentTypeSelect = async (type) => {
    if (!normalizedCourse) return;

    const courseId = normalizedCourse.id;
    const courseTitle = normalizedCourse.title;

    await submissionGuard.guard(async () => {
      try {
        let response;

        if (type === "normal") {
          response = await dispatch(enrollInCourseNormal(courseId)).unwrap();
        } 
        else if (type === "private") {
          const instructorId =
            normalizedCourse.instructor?.id || normalizedCourse.instructor_id;
          if (!instructorId) {
            toastManager.error(
              "Private enrollment not available - no instructor assigned",
            );
            return;
          }
          response = await dispatch(
            enrollInCoursePrivate({
              courseId,
              teacherId: instructorId,
            }),
          ).unwrap();
        }

        // Show success message (use backend message if available)
        const successMessage =
          response?.message || `Successfully made enrollment request for ${courseTitle}`;
        toastManager.success(successMessage);

        // Close modal
        setEnrollmentModalOpen(false);
        setPaymentSubmitted(false);

        // Refresh course data to update enrollment status
        dispatch(fetchCourseById(courseId));

        // Refresh student dashboard to sync enrollment state
        if (auth.role === "student") {
          dispatch(fetchStudentDashboard());
        }
      } catch (error) {
        showApiError(error);
      }
    });
  };
  const callPrivateEnrollmentCall = async (slot) => {
    if (!slot || !normalizedCourse) return;

    const courseId = normalizedCourse.id;
    const courseTitle = normalizedCourse.title;

    await submissionGuard.guard(async () => {
      try {
        const instructorId =
          normalizedCourse.instructor?.id || normalizedCourse.instructor_id;
        if (!instructorId) {
          toastManager.error(
            "Private enrollment not available - no instructor assigned",
          );
          return;
        }

        const response = await dispatch(
          enrollInCoursePrivate({
            courseId,
            teacherId: instructorId,
            preferred_slots: [{ days: slot.days, time: slot.time }],
          }),
        ).unwrap();

        const successMessage =
          response?.message || `Successfully made enrollment request for ${courseTitle}`;
        toastManager.success(successMessage);

        setEnrollmentModalOpen(false);
        setPaymentSubmitted(false);

        dispatch(fetchCourseById(courseId));

        if (auth.role === "student") {
          dispatch(fetchStudentDashboard());
        }
      } catch (error) {
        showApiError(error);
      }
    });
  };

  // Close enrollment modal
  const closeEnrollmentModal = () => {
    setEnrollmentModalOpen(false);
    setPaymentSubmitted(false);
  };

  // Handle course unenrollment
  const handleUnenrollCourse = (courseData) => {
    if (!auth.isLoggedIn) {
      dispatch(setAuthModal("login"));
      return;
    }

    if (auth.role !== "student") {
      toastManager.error("Only students can unenroll from courses");
      return;
    }

    setUnenrollConfirm({ open: true, courseData });
  };

  const confirmUnenrollCourse = async () => {
    const { courseData } = unenrollConfirm;
    setUnenrollConfirm({ open: false });

    await submissionGuard.guard(async () => {
      try {
        await dispatch(unenrollFromCourse(courseData.id)).unwrap();
        toastManager.success(`Successfully unenrolled from ${courseData.title}`);

        dispatch(fetchCourseById(courseData.id));
        dispatch(fetchStudentDashboard());
      } catch (error) {
        showApiError(error);
      }
    });
  };

  // Handle image error
  const handleImageError = (e) => {
    // If the image fails to load, try the fallback
    if (normalizedCourse.thumbnail) {
      // If we were trying to load the thumbnail and it failed, use the fallback
      e.target.src = `https://picsum.photos/seed/course_${normalizedCourse.id || 0}/800/450`;
    } else {
      // If even the fallback fails, show a placeholder
      setImageError(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-20 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-blue-500/20">
                  <i className="fas fa-spinner text-blue-400 text-3xl animate-spin"></i>
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-blue-600/20 rounded-full animate-ping mx-auto"></div>
              </div>
              <p className="text-white text-xl font-medium mb-2">
                Loading course details...
              </p>
              <p className="text-slate-400 text-sm">
                Please wait while we prepare your content
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-20 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-red-500/20">
                <i className="fas fa-exclamation-triangle text-red-400 text-3xl"></i>
              </div>
              <h2 className="text-white text-2xl font-bold mb-4">
                Unable to load course
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                {typeof error === "string"
                  ? error
                  : "Failed to load course details"}
              </p>
              <Link to="/courses">
                <Button variant="outline" size="lg" className="group">
                  <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
                  Back to Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Course not found state
  if (!normalizedCourse) {
    return (
      <section className="min-h-screen bg-[#0f172a] text-white font-inter relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-slate-600/10 blur-[120px] rounded-full animate-pulse"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-20 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-slate-500/20">
                <i className="fas fa-book text-slate-400 text-3xl"></i>
              </div>
              <h2 className="text-white text-2xl font-bold mb-4">
                Course Not Found
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/courses">
                <Button variant="outline" size="lg" className="group">
                  <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
                  Back to Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const details = normalizedCourse.details;
  const quickFact = (...labels) => guide?.quickFacts?.find((f) => labels.includes(f.label))?.value || null;
  const syllabusCode = details.syllabus_code || guide?.code || normalizedCourse.syllabusCode;
  const examBoard = details.exam_board || (guide ? "Cambridge International" : null);
  const examSession = details.exam_session || quickFact("Exam sessions", "Exam session");
  const teacherId = normalizedCourse.instructor?.id || normalizedCourse.instructor_id;
  const teacherName = getDisplayName(normalizedCourse.instructor);

  // Facts about the classes themselves, all set by the admin on the course.
  const classFacts = [
    { label: "Class days", value: details.class_days },
    { label: "Class time", value: details.class_time },
    { label: "Each class", value: details.class_length },
    { label: "Classes per week", value: details.classes_per_week },
    { label: "Starts", value: details.start_date },
    { label: "Course length", value: details.duration },
    { label: "Exam session", value: details.exam_session },
  ].filter((f) => f.value);

  const includes = details.includes?.length
    ? details.includes
    : [
        "Live online classes with your teacher",
        "Quizzes and assignments in your student portal",
        "Marks and feedback from your teacher",
        "Progress your parents can follow",
      ];

  const glance = [
    { icon: "fa-layer-group", label: "Level", value: normalizedCourse.category },
    { icon: "fa-book", label: "Syllabus", value: [examBoard, syllabusCode].filter(Boolean).join(" · ") || null },
    { icon: "fa-chalkboard-teacher", label: "Teacher", value: teacherName, to: teacherId ? `/teachers/${teacherId}` : null },
    { icon: "fa-calendar-alt", label: "Class days", value: details.class_days },
    { icon: "fa-clock", label: "Class time", value: details.class_time },
    { icon: "fa-hourglass-half", label: "Each class", value: details.class_length },
    { icon: "fa-play-circle", label: "Starts", value: details.start_date },
    { icon: "fa-pen-nib", label: "Exam session", value: examSession },
    { icon: "fa-file-alt", label: "Exam papers", value: quickFact("Exams you sit") },
    { icon: "fa-award", label: "Grades", value: quickFact("Grades") },
    { icon: "fa-video", label: "Format", value: "Live online classes" },
  ].filter((f) => f.value);

  const feeText = Number(normalizedCourse.price) > 0 ? `${formatCurrency(Number(normalizedCourse.price), "USD")} per month` : null;
  const feeFacts = [
    feeText && { label: "Fee", value: feeText },
    { label: "Format", value: "Live online classes" },
    ...classFacts,
  ].filter(Boolean);
  const instructor = normalizedCourse.instructor;
  const teacherExpertise = plainText(instructor?.expertise || "").replace(/\s+/g, " ").trim();
  const firstGuidePapers = guide?.papers?.map((p) => String(p.name || "").split(" — ")[0]).filter(Boolean) || [];

  // The side menu: this course first, then the subject guide in four groups.
  const menu = [
    {
      label: "This course",
      items: [
        { id: "course-about", label: "About" },
        outline.length > 0 && { id: "course-topics", label: "Topics covered" },
        { id: "course-classes", label: "Fees and classes" },
        teacherName && { id: "course-teacher", label: "Your teacher" },
        details.learning_outcomes?.length > 0 && { id: "course-learn", label: "What you will learn" },
        details.who_for && { id: "course-who", label: "Who it is for" },
        { id: "course-includes", label: "What is included" },
        normalizedCourse.attachment && { id: "course-attachment", label: "Course material" },
        faqs.length > 0 && { id: "course-faq", label: "Questions" },
        (related.length > 0 || stageSibling) && { id: "course-more", label: "Related courses" },
      ].filter(Boolean),
    },
    { label: "The syllabus", items: guideSecs.map((x) => ({ id: x.id, label: x.title })) },
  ].filter((grp) => grp.items.length);

  const enrolled = isCourseEnrolled(normalizedCourse);
  const isEnrolling = enrollingCourseIds.includes(normalizedCourse.id);
  const isUnenrolling = unenrollingCourseIds.includes(normalizedCourse.id);
  const isPending = normalizedCourse.enrollment_status === "pending";
  const isRejected = normalizedCourse.enrollment_status === "rejected";
  const noSessions = !normalizedCourse.has_session;

  return (
    <section className="min-h-screen bg-[#0f172a] text-white font-inter relative overflow-hidden animate-fadeIn">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-teal-600/5 blur-[100px] rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 pb-5 relative z-10">
        <BreadcrumbNavigation
          items={[
            { label: "Home", to: "/", icon: "fas fa-home" },
            { label: "Courses", to: "/courses" },
            { label: truncate(normalizedCourse.title, 25) },
          ]}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-20 relative z-10">
        {/* Header: picture, title, key facts, price and enrol */}
        <header className="rounded-[1.5rem] border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-5 md:p-6 flex flex-col lg:flex-row gap-6">
          {/* Thumbnails are designed artwork (2400×1260) with words on them: show them whole. */}
          <div className="relative w-full lg:w-[380px] aspect-[40/21] self-start shrink-0 rounded-2xl overflow-hidden bg-slate-900">
            {imageError || !getCourseImage(normalizedCourse) ? (
              <div className="w-full h-full bg-slate-800" />
            ) : (
              <img src={sizedImage(getCourseImage(normalizedCourse), 960)} alt={normalizedCourse.title || "Course"} className="absolute inset-0 w-full h-full object-contain" onError={(e) => { if (e.currentTarget.dataset.fallback !== "1") fallbackToOriginal(getCourseImage(normalizedCourse))(e); else handleImageError(e); }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Only staff can open an unpublished course; tell them it isn't public. */}
            {normalizedCourse.status !== "published" && (
              <span className="mb-3 inline-flex items-center gap-2 bg-slate-600/20 text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-500/30">
                <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                {capitalize(normalizedCourse.status)} · not on the website
              </span>
            )}
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 mb-2">
              {[normalizedCourse.category, syllabusCode && `${examBoard ? "Cambridge " : ""}${syllabusCode}`].filter(Boolean).join(" · ")}
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-poppins leading-tight text-white">{normalizedCourse.title}</h1>
            {guide?.tagline && <p className="mt-3 text-slate-300 leading-relaxed max-w-3xl">{guide.tagline}</p>}
            <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
              {glance.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <i className={`fas ${f.icon} text-indigo-400`}></i>{f.label}
                  </dt>
                  <dd className="text-sm font-semibold text-white mt-0.5">
                    {f.to ? <Link to={f.to} className="hover:text-indigo-300">{f.value}</Link> : f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:w-72 shrink-0 lg:border-l lg:border-slate-700/50 lg:pl-6 flex flex-col justify-center">
            <div className="text-center mb-4">
              <div className="text-3xl font-black bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {formatCurrency(parseFloat(normalizedCourse.price) || 0, "USD")}
              </div>
              <p className="text-slate-400 text-sm mt-1 font-medium">per month</p>
            </div>
                {/* CTA Button */}
                {auth.isLoggedIn && auth.role === "student" ? (
                  <div className={`relative ${isRejected ? "group/tooltip" : ""}`}>
                    <button
                      onClick={() =>
                        enrolled
                          ? handleUnenrollCourse(normalizedCourse)
                          : !isPending && !isRejected && handleEnrollCourse()
                      }
                      disabled={isEnrolling || isUnenrolling || isPending || isRejected || isCheckingOut}
                      className={`w-full py-3.5 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 ${
                        enrolled
                          ? isUnenrolling
                            ? "bg-red-600/50 text-red-400 cursor-not-allowed"
                            : "bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600 hover:text-white"
                          : isRejected
                            ? "bg-rose-600/10 border border-rose-500/20 text-rose-400 cursor-not-allowed"
                            : isPending
                              ? "bg-amber-600/10 border border-amber-500/20 text-amber-400 cursor-not-allowed"
                              : isEnrolling || isCheckingOut
                                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                                : "bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] text-white"
                      }`}
                    >
                      {enrolled
                        ? isUnenrolling
                          ? "Unenrolling..."
                          : "Unenroll"
                        : isRejected
                          ? "Request Rejected"
                          : isPending
                            ? "Approval Pending"
                            : isCheckingOut
                              ? <><i className="fas fa-spinner fa-spin mr-1" />Opening Checkout...</>
                              : isEnrolling
                                ? "Enrolling..."
                                : normalizedCourse?.is_paid
                                  ? <><i className="fas fa-lock-open mr-1.5" />Pay & Enroll</>
                                  : "Enroll Now"}
                    </button>
                    {isRejected && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-2 bg-slate-800 border border-rose-500/30 text-white text-xs font-medium rounded-lg text-center max-w-[220px] opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 shadow-xl z-10">
                        <i className="fas fa-lock text-rose-400 mr-1.5"></i>
                        Your enrollment request was rejected. Please contact school administration.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></div>
                      </div>
                    )}
                    {/* {noSessions && !enrolled && !isRejected && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 shadow-xl z-10">
                        No sessions available for this course
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-700"></div>
                      </div>
                    )} */}
                  </div>
                ) : auth.isLoggedIn ? (
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-2">
                      Only students can enroll in courses
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500/50 hover:text-white cursor-not-allowed opacity-75"
                      disabled
                    >
                      Enrollment Restricted
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full border-0 shadow-lg transition-all duration-300 group bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
                      onClick={() => {
                        dispatch(setEnrollmentIntent({
                          courseId: normalizedCourse.id,
                          courseTitle: normalizedCourse.title
                        }));
                        dispatch(setAuthModal("login"));
                      }}
                    >
                      <i className="fas fa-sign-in-alt mr-2 group-hover:translate-x-1 transition-transform"></i>
                      Login to Enroll
                    </Button>
                    {/* {noSessions && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 shadow-xl z-10">
                        No sessions available for this course
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-700"></div>
                      </div>
                    )} */}
                  </div>
                )}

                {/* WhatsApp CTA - a lower-friction way to reach out than the
                    login/account wall above, for a visitor who just wants
                    to ask about the course first. Never replaces or gates
                    the enroll flow itself. */}
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Hi! I'd like to ask about "${normalizedCourse.title}" at Virtual City School.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-[0.15em] hover:bg-emerald-600 hover:text-white hover:border-transparent transition-all active:scale-95"
                >
                  <i className="fab fa-whatsapp text-base"></i>
                  Ask on WhatsApp
                </a>
                {guide && (
                  <Link
                    to={`/subjects/${guide.slug}`}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 text-indigo-200 font-bold text-sm hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all"
                  >
                    <i className="fas fa-book-open"></i>
                    {guide.subject} subject guide
                  </Link>
                )}

          </div>
        </header>

        {/* Phone: the menu as a scrollable strip */}
        <div className="lg:hidden mt-6 -mx-4 px-4 py-2 border-y border-white/5 bg-[#0f172a]/95">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {menu.flatMap((grp) => grp.items).map((x) => (
              <a key={x.id} href={`#${x.id}`} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${active === x.id ? "bg-indigo-500/20 border-indigo-400/50 text-white" : "border-white/10 text-slate-400"}`}>
                {x.label}
              </a>
            ))}
          </div>
        </div>

        <div ref={gridRef} className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
          {/* Side menu, grouped */}
          <aside ref={menuSlotRef} className="hidden lg:block">
            <nav ref={menuBoxRef} aria-label="On this page" className="z-10 rounded-2xl border border-white/10 bg-[#0a1024]/95 backdrop-blur p-3 overflow-y-auto">
              {menu.map((grp) => (
                <div key={grp.label} className="mb-3 last:mb-0">
                  <div className="px-2.5 pt-1 pb-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">{grp.label}</div>
                  <ol className="space-y-0.5">
                    {grp.items.map((x) => (
                      <li key={x.id}>
                        <a href={`#${x.id}`} className={`block px-2.5 py-1.5 rounded-lg text-sm truncate transition ${active === x.id ? "bg-indigo-500/15 text-white border border-indigo-500/30" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
                          {x.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              {guide && (
                <Link to={`/subjects/${guide.slug}`} className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2.5 text-sm font-semibold text-indigo-200 hover:text-white">
                  Full subject guide <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              )}
            </nav>
          </aside>

          <div ref={contentRef} id="course-content" className="min-w-0">
            <CourseSection id="course-about" icon="fa-info-circle" color="blue" title="About this course">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{normalizedCourse.description}</p>
              {guide && stage && (
                <p className="mt-4 max-w-3xl text-base text-slate-200 leading-relaxed rounded-xl border-l-4 border-l-indigo-400 bg-indigo-500/10 px-4 py-3">
                  This is the <strong className="text-indigo-200 font-semibold">{stage === "AS" ? "AS Level year" : "A2 year"}</strong> of Cambridge {guide.subject} {guide.code}
                  {stage === "AS" ? ", the first half of the full A Level" : ", the second half of the full A Level"}
                  {firstGuidePapers.length > 0 ? `: ${firstGuidePapers.join(", ")}` : ""}.
                  {stageSibling && (
                    <> {stage === "AS" ? "The next year is taught in " : "The AS Level year is taught in "}
                      <Link to={`/courses/${stageSibling.id}`} className="text-indigo-300 font-semibold hover:text-white underline underline-offset-2">{stageSibling.title}</Link>.
                    </>
                  )}
                </p>
              )}
            </CourseSection>

            {outline.length > 0 && (
              <CourseSection id="course-topics" icon="fa-list-alt" color="indigo" title="Topics covered">
                <CourseOutline blocks={outline} />
              </CourseSection>
            )}

            <CourseSection id="course-classes" icon="fa-calendar-alt" color="purple" title="Fees and classes">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {feeFacts.map((f, i) => (
                  <div key={f.label} className={`rounded-xl p-4 border border-white/10 border-t-4 bg-white/[0.03] ${["border-t-cyan-400", "border-t-emerald-400", "border-t-violet-400", "border-t-amber-400"][i % 4]}`}>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{f.label}</div>
                    <div className="text-white font-semibold">{f.value}</div>
                  </div>
                ))}
              </div>
              {classFacts.length === 0 && (
                <p className="mt-4 text-base text-slate-300 max-w-3xl">
                  Class days and times are set for each group of students.{" "}
                  <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! What is the timetable for "${normalizedCourse.title}"?`)}`} target="_blank" rel="noopener noreferrer" className="text-emerald-300 font-semibold hover:text-white">Ask us on WhatsApp</a> for the current timetable.
                </p>
              )}
            </CourseSection>

            {teacherName && (
              <CourseSection id="course-teacher" icon="fa-chalkboard-teacher" color="teal" title="Your teacher">
                <div className="rounded-2xl border border-teal-400/25 bg-teal-500/10 p-5 flex flex-col sm:flex-row gap-5 sm:items-center">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center text-2xl font-bold text-teal-200">
                    {teacherName.charAt(0)}
                    {instructor?.avatar && (
                      <img
                        src={sizedImage(getStorageUrl(instructor.avatar), 128)}
                        onError={(e) => {
                          // Resized copy failed → try the original; that failed too → show the initial.
                          const img = e.currentTarget;
                          if (!img.dataset.tried) {
                            img.dataset.tried = "1";
                            const before = img.src;
                            fallbackToOriginal(getStorageUrl(instructor.avatar))(e);
                            if (img.src !== before) return;
                          }
                          img.style.display = "none";
                        }}
                        alt={teacherName} width="64" height="64" loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-white">{teacherName}</div>
                    {teacherExpertise && <p className="text-base text-slate-200 mt-1">Teaches {teacherExpertise}</p>}
                    {teacherOther.length > 0 && (
                      <p className="text-sm text-slate-300 mt-2">
                        Also teaches:{" "}
                        {teacherOther.map((x, i) => (
                          <React.Fragment key={x.id}>{i > 0 && ", "}<Link to={`/courses/${x.id}`} className="text-teal-200 hover:text-white">{x.title}</Link></React.Fragment>
                        ))}
                      </p>
                    )}
                  </div>
                  {teacherId && (
                    <Link to={`/teachers/${teacherId}`} className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-400/40 text-teal-100 text-sm font-semibold hover:bg-teal-600 hover:text-white hover:border-transparent transition">
                      Tutor profile <i className="fas fa-arrow-right text-xs" />
                    </Link>
                  )}
                </div>
              </CourseSection>
            )}

            {details.learning_outcomes?.length > 0 && (
              <CourseSection id="course-learn" icon="fa-lightbulb" color="amber" title="What you will learn">
                <ul className="grid md:grid-cols-2 gap-x-6 gap-y-2.5">
                  {details.learning_outcomes.map((x) => (
                    <li key={x} className="flex gap-3 text-slate-200"><i className="fas fa-check text-emerald-400 mt-1 text-sm"></i>{x}</li>
                  ))}
                </ul>
              </CourseSection>
            )}

            {details.who_for && (
              <CourseSection id="course-who" icon="fa-user-graduate" color="teal" title="Who this course is for">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{details.who_for}</p>
              </CourseSection>
            )}

            <CourseSection id="course-includes" icon="fa-gift" color="emerald" title="What is included">
              <ul className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {includes.map((x) => (
                  <li key={x} className="flex gap-3 rounded-xl p-4 bg-white/[0.03] border border-white/10 text-slate-200 text-sm"><i className="fas fa-check-circle text-emerald-400 mt-0.5"></i>{x}</li>
                ))}
              </ul>
            </CourseSection>

            {normalizedCourse.attachment && (
              <CourseSection id="course-attachment" icon="fa-paperclip" color="amber" title="Course material">
                <button
                  onClick={() => setViewerUrl(getStorageUrl(normalizedCourse.attachment))}
                  className="inline-flex items-center gap-4 px-5 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-indigo-500/30 rounded-2xl text-white text-sm font-medium transition"
                >
                  <i className="fas fa-eye text-indigo-400"></i> Preview course material
                </button>
              </CourseSection>
            )}

            {faqs.length > 0 && (
              <CourseSection id="course-faq" icon="fa-question-circle" color="amber" title="Questions parents ask">
                <div className="grid md:grid-cols-2 gap-3">
                  {faqs.map((f) => (
                    <div key={f.q} className="rounded-xl p-5 bg-amber-500/[0.06] border border-amber-400/20">
                      <h3 className="text-base font-bold text-amber-100 mb-1.5">{f.q}</h3>
                      <p className="text-base text-slate-200 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </CourseSection>
            )}

            {(related.length > 0 || stageSibling) && (
              <CourseSection id="course-more" icon="fa-th-large" color="blue" title={`More ${normalizedCourse.category} courses`}>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {[...(stageSibling && !related.some((r) => r.id === stageSibling.id) ? [stageSibling] : []), ...related].slice(0, 8).map((x) => (
                    <Link key={x.id} to={`/courses/${x.id}`} className="rounded-xl p-4 bg-white/[0.03] border border-white/10 hover:border-indigo-400/50 hover:bg-white/[0.06] transition text-base font-semibold text-slate-100 hover:text-white">
                      {x.title}
                    </Link>
                  ))}
                </div>
              </CourseSection>
            )}

            {/* The full Cambridge subject guide for this syllabus */}
            {guide && (
              <div className="mt-4 pt-8 border-t border-slate-700/50">
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">The syllabus</div>
                <h2 className="text-2xl md:text-3xl font-black font-poppins text-white">{guide.title}</h2>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                  <i className="fas fa-check-circle"></i> Checked against the official Cambridge syllabus for exams in {guide.syllabusYears}
                </p>
                {guide.notice && (
                  <p className="mt-3 text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 leading-relaxed">{guide.notice}</p>
                )}
                <GuideBody g={guide} sections={guideSecs} />
                <Link to={`/subjects/${guide.slug}`} className="mt-10 block rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 to-violet-600/10 p-6 hover:border-indigo-400/60 transition">
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">Full subject guide</div>
                  <div className="text-lg font-bold text-white">Everything about {guide.title}</div>
                  <p className="text-sm text-slate-300 mt-2">Why study it, types of questions, command words, what examiners reward, books, common mistakes, a study plan, careers and FAQs.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-200">Read the guide <i className="fas fa-arrow-right text-xs"></i></span>
                </Link>
              </div>
            )}

            <div className="mt-12 flex flex-wrap gap-3">
              <BackButton to="/courses" label="Back to Courses" variant="ghost" />
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Type Modal */}
      <EnrollmentTypeModal
        isOpen={enrollmentModalOpen}
        course={normalizedCourse}
        isPaid={normalizedCourse?.is_paid || false}
        isLoading={normalizedCourse?.is_paid ? isCheckingOut : isEnrolling}
        onConfirm={normalizedCourse?.is_paid ? handleCheckout : () => handleEnrollmentTypeSelect("normal")}
        onClose={closeEnrollmentModal}
        onApplyFreeAccess={
          normalizedCourse
            ? () => {
                closeEnrollmentModal();
                setFreeAccessOpen(true);
              }
            : undefined
        }
      />

      {freeAccessOpen && (
        <ApplyFreeAccessModal
          preselectedCourseIds={normalizedCourse ? [normalizedCourse.id] : []}
          onClose={() => {
            setFreeAccessOpen(false);
            // Refetch so the enroll button reflects the new "Approval Pending" state.
            if (courseId) dispatch(fetchCourseById(courseId));
          }}
        />
      )}
      {viewerUrl && (
        <FileViewerModal filePath={viewerUrl} handleClose={() => setViewerUrl(null)} />
      )}

      <ConfirmDialog
        open={unenrollConfirm.open}
        variant="danger"
        title="Unenroll from Course"
        message={`Are you sure you want to unenroll from "${unenrollConfirm.courseData?.title}"?`}
        confirmLabel="Yes, Unenroll"
        cancelLabel="Keep Enrolled"
        loading={unenrollingCourseIds.includes(unenrollConfirm.courseData?.id)}
        onConfirm={confirmUnenrollCourse}
        onCancel={() => setUnenrollConfirm({ open: false })}
      />
    </section>
  );
};

export default CourseDetails;
