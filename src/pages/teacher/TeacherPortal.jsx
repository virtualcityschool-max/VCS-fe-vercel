import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeacherDashboard,
  fetchMyCourses,
  fetchAssignments,
  fetchQuizzes,
  createAssignment,
  startLiveSession,
  endLiveSession,
  createTeacherSession,
  fetchAllAttendance,
  updateAssignment,
} from "../../store/slices/teacherSlice";
import { createAnnouncement } from "../../store/slices/announcementsSlice";
import { teacherService } from "../../services/teacherService";
import { adminTeacherSessionService } from "../../services/adminTeacherSessionService";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import { formatDate, formatTime, formatTimezoneISO } from "../../utils/validation";
import { toastManager } from "../../utils/toastManager";
import { showApiError, extractApiErrorMessage } from "../../utils/apiErrorHandler";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { isWithinSessionWindow, isSessionExpired } from "../../utils/helper/StartSession";

// Modernized AI Studio Teacher Components
import { TeacherDashboard as TeacherModernDashboard } from "../../components/teacher/modern/TeacherModernDashboard";
import {
  PostAnnouncementModal,
  ScheduleSessionModal,
  GradeTaskModal,
} from "../../components/teacher/modern/TeacherModals";
import {
  CreateAssignmentModal,
  AdvancedQuizBuilderModal,
} from "../../components/teacher/modern/AssignmentQuizModals";
import { ReviewQuizModal } from "../../components/teacher/modern/ReviewQuizModal";

// Top-level Unified Timezone Mapping (Finding R2-9)
const TZ_IANA_MAP = { AST: "Asia/Riyadh", PKT: "Asia/Karachi", BST: "Europe/London" };

// Helper: Convert a naive date + time string living in `tz` into UTC milliseconds
const tzToUTCMs = (dateStr, timeStr, tz) => {
  if (!dateStr) return Date.now();
  const tStr = timeStr ? (timeStr.length === 5 ? `${timeStr}:00` : timeStr) : "00:00:00";
  const naiveUTC = new Date(`${dateStr}T${tStr}Z`).getTime();
  if (!tz) return naiveUTC;
  try {
    const tzName = TZ_IANA_MAP[tz] || tz || "Asia/Riyadh";
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tzName,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date(naiveUTC));
    const g = (t) => parts.find((p) => p.type === t)?.value ?? "00";
    const h = g("hour") === "24" ? "00" : g("hour");
    const tzUTC = Date.parse(`${g("year")}-${g("month")}-${g("day")}T${h}:${g("minute")}:${g("second")}Z`);
    return naiveUTC + (naiveUTC - tzUTC);
  } catch {
    return naiveUTC;
  }
};

const isSlotJoinable = () => true;
const isSlotExpired = () => false;

const TeacherPortal = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { timezone: profileTimezone, toPayloadISO } = useDateFormatters();

  // Active Tab from URL search params (e.g. /teacher?tab=attendance)
  const activeTab = searchParams.get("tab") || "dashboard";

  const handleSelectTab = (tab, extra = {}) => {
    if (tab === "dashboard") {
      setSearchParams({});
    } else {
      setSearchParams({ tab, ...extra });
    }
  };

  // Redux Auth & Teacher State
  const { user, profile } = useSelector((state) => state.auth);
  const {
    dashboard,
    myCourses,
    assignments,
    allAttendance,
    quizzes: apiQuizzes,
  } = useSelector((state) => state.teachers);

  // Timezone Switcher state (display toggle)
  const [currentTz, setCurrentTz] = useState("AST");

  const handleCycleTimezone = () => {
    const order = ["AST", "PKT", "BST"];
    const next = order[(order.indexOf(currentTz) + 1) % order.length];
    setCurrentTz(next);
    toastManager.info(`Workspace timezone switched to ${next}`);
  };

  const activeTzId = TZ_IANA_MAP[currentTz] || "Asia/Riyadh";

  // Real data only — every list starts empty and is filled from the backend
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  // Submissions graded in this visit, shown as graded before the dashboard refetch lands
  const [gradedLocally, setGradedLocally] = useState({});

  // Modals state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newSessionModalOpen, setNewSessionModalOpen] = useState(false);
  const [createAssignmentModalOpen, setCreateAssignmentModalOpen] = useState(false);
  const [advancedQuizBuilderModalOpen, setAdvancedQuizBuilderModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [reviewingQuizSubmissionId, setReviewingQuizSubmissionId] = useState(null);
  const [gradingTask, setGradingTask] = useState(null);

  // Session Alert & Confirm Dialogs
  const [tooEarlyOpen, setTooEarlyOpen] = useState(false);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [endSessionConfirm, setEndSessionConfirm] = useState({ open: false, sessionId: null });
  const [leaveAdminConfirm, setLeaveAdminConfirm] = useState({ open: false, sessionId: null });

  const loadQuizSubmissions = () =>
    teacherService
      .getAllQuizSubmissions()
      .then((data) => setQuizSubmissions(Array.isArray(data) ? data : data?.results || []))
      .catch(() => setQuizSubmissions([]));

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchTeacherDashboard());
    dispatch(fetchMyCourses());
    dispatch(fetchAssignments());
    dispatch(fetchAllAttendance());
    dispatch(fetchQuizzes());
    loadQuizSubmissions();
  }, [dispatch]);

  // Map Live Courses (empty when the teacher has no courses)
  const mappedCourses = useMemo(() => {
    if (Array.isArray(myCourses) && myCourses.length > 0) {
      return myCourses.map((c, idx) => ({
        id: String(c.id),
        title: c.title,
        code: c.subject_code || c.category?.name || c.category || `VCS-${c.id}`,
        category: c.category?.name || c.category || "",
        level: c.level?.name || c.level || "",
        enrolledCount: c.total_enrolled ?? c.enrolled_students?.length ?? 0,
        enrolledStudents: Array.isArray(c.enrolled_students) ? c.enrolled_students : [],
        published: c.status === "published",
        nextSessionTime: c.upcoming_session ? "Class scheduled" : "No upcoming class",
        description: c.description || "",
        accentGradient:
          idx % 4 === 0
            ? "from-emerald-900/80 via-slate-900 to-indigo-950"
            : idx % 4 === 1
            ? "from-indigo-900/80 via-slate-900 to-slate-950"
            : idx % 4 === 2
            ? "from-violet-900/80 via-slate-900 to-slate-950"
            : "from-blue-900/80 via-slate-900 to-slate-950",
        rawCourse: c,
      }));
    }
    return [];
  }, [myCourses]);

  // Quizzes from /quizzes/ with their real submissions attached
  const quizzes = useMemo(() => {
    if (!Array.isArray(apiQuizzes)) return [];
    const fmt = (iso) =>
      iso ? `${formatDate(iso, profileTimezone)} · ${formatTime(iso, profileTimezone)}` : "";
    return apiQuizzes.map((q) => {
      const subs = quizSubmissions
        .filter((s) => String(s.quiz) === String(q.id))
        .map((s) => ({
          id: s.id,
          studentName: s.student_name || "Student",
          studentRoll: `Submission #${s.id}`,
          submittedAt: s.submitted_at ? fmt(s.submitted_at) : "",
          // backend "submitted" = written answers still waiting for the teacher
          status: s.status === "submitted" ? "submitted" : "reviewed",
          totalScore: Number(s.obtained_marks ?? 0),
          maxScore: s.total_marks_snapshot ?? q.total_marks ?? 0,
          percentage: typeof s.percentage === "number" ? s.percentage : null,
        }));
      const scored = subs.filter((s) => s.status === "reviewed" && s.percentage != null);
      const published = Boolean(q.is_published);
      const closed = Boolean(q.is_overdue);
      return {
        id: String(q.id),
        title: q.title,
        courseId: String(q.course_id || (typeof q.course === "object" ? q.course?.id : q.course) || ""),
        courseTitle:
          q.course_title ||
          (typeof q.course === "object" ? q.course?.title : null) ||
          mappedCourses.find((c) => String(c.id) === String(q.course))?.title ||
          "",
        description: q.description || "",
        marks: q.total_marks || 0,
        questionsCount: q.questions_count ?? q.questions?.length ?? 0,
        durationMinutes: q.duration_minutes ?? null,
        launchLabel: fmt(q.published_at),
        dueLabel: fmt(q.due_date),
        published_at: q.published_at,
        due_date: q.due_date,
        isLocked: Boolean(q.is_locked),
        status: !published ? "scheduled" : closed ? "closed" : "published",
        submissionsCount: q.submissions_count ?? subs.length,
        averageScore: scored.length
          ? scored.reduce((a, s) => a + s.percentage, 0) / scored.length
          : undefined,
        topScore: scored.length ? Math.max(...scored.map((s) => s.percentage)) : undefined,
        questions: (q.questions || []).map((ques) => ({
          id: String(ques.id || `q-${Math.random()}`),
          type: (ques.question_type || "").toLowerCase(),
          questionText: ques.question_text || "",
          marks: ques.max_marks || 0,
          options: (ques.options || []).map((opt) => (typeof opt === "string" ? opt : opt.option_text)),
          correctAnswer: (ques.options || []).find((opt) => typeof opt === "object" && opt.is_correct)?.option_text || "",
        })),
        submissions: subs,
        rawQuiz: q,
      };
    });
  }, [apiQuizzes, quizSubmissions, mappedCourses, profileTimezone]);

  // Per-class roster: every enrolled student of each course, enriched with their attendance records
  const attendance = useMemo(() => {
    const records = (Array.isArray(allAttendance) ? allAttendance : []).filter(
      (r) => r.participant_role === "student"
    );
    const todayStr = (() => {
      try {
        return new Intl.DateTimeFormat("en-CA", { timeZone: profileTimezone || undefined }).format(new Date());
      } catch {
        return new Date().toISOString().split("T")[0];
      }
    })();
    const dayOf = (iso) => {
      try {
        return new Intl.DateTimeFormat("en-CA", { timeZone: profileTimezone || undefined }).format(new Date(iso));
      } catch {
        return String(iso).slice(0, 10);
      }
    };

    const rows = [];
    mappedCourses.forEach((course) => {
      const courseRecords = records.filter((r) => String(r.course_id) === String(course.id));
      course.enrolledStudents.forEach((st) => {
        const mine = courseRecords.filter((r) => String(r.student) === String(st.id));
        const total = mine.length;
        const present = mine.filter((r) => r.status === "present" || r.status === "attended").length;
        const late = mine.filter((r) => r.status === "late").length;
        const today = mine.find((r) => r.scheduled_at && dayOf(r.scheduled_at) === todayStr);
        const latest = mine.reduce((acc, r) => {
          const ms = new Date(r.joined_at || r.scheduled_at || r.created_at || 0).getTime();
          return ms > acc ? ms : acc;
        }, 0);
        rows.push({
          id: `${course.id}-${st.id}`,
          course: course.title,
          courseId: course.id,
          name: st.username || st.email || `Student #${st.id}`,
          rollNo: mine.find((r) => r.student_roll_no != null)?.student_roll_no ?? st.id,
          lastSeen: latest > 0 ? formatDate(new Date(latest).toISOString(), profileTimezone) : "—",
          attendanceRate: total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : null,
          statusToday: today ? today.status : null,
        });
      });
    });
    return rows;
  }, [allAttendance, mappedCourses, profileTimezone]);

  // Map Live Sessions (Live classes + Admin sessions + Booked slots)
  const mappedSessions = useMemo(() => {
    const list = [];
    if (dashboard?.todays_schedule && dashboard.todays_schedule.length > 0) {
      dashboard.todays_schedule.forEach((s) => {
        list.push({
          id: String(s.id),
          title: s.title,
          courseName: s.course_title || "Live Class",
          category: "classes",
          timeAST: s.schedule_at
            ? new Date(s.schedule_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: activeTzId })
            : "Upcoming",
          duration: s.duration ? `${s.duration} min` : "—",
          meetLink: s.meeting_link || "",
          status: s.status === "live" ? "live" : "upcoming",
          attendeesCount: s.total_learners ?? 0,
          maxAttendees: s.max_learners || s.max_attendees || "—",
          instructor: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user?.username || "Tutor"),
          rawSession: { ...s, category: "classes" },
        });
      });
    }

    if (dashboard?.admin_sessions && dashboard.admin_sessions.length > 0) {
      dashboard.admin_sessions.forEach((s) => {
        list.push({
          id: `admin-${s.id}`,
          title: s.title,
          courseName: "Faculty Administration Board",
          category: "admin_session",
          timeAST: s.scheduled_at
            ? new Date(s.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: activeTzId })
            : "Scheduled",
          duration: s.duration ? `${s.duration} min` : "—",
          meetLink: s.meeting_link || "",
          status: s.status === "live" ? "live" : s.status === "completed" ? "completed" : "upcoming",
          attendeesCount: s.attendees_count ?? "—",
          maxAttendees: s.max_attendees ?? "—",
          instructor: "Academic Administration",
          rawSession: { ...s, category: "admin_session" },
        });
      });
    }

    if (dashboard?.upcoming_slots && dashboard.upcoming_slots.length > 0) {
      dashboard.upcoming_slots.forEach((s) => {
        list.push({
          id: `slot-${s.id}`,
          title: `1-on-1 Consultation: ${s.student_name || s.booked_by_name || "Learner"}`,
          courseName: "Office Hours & Consultation",
          category: "reserved_slots",
          timeAST: `${s.start_time} - ${s.end_time}`,
          duration: "30 min",
          meetLink: s.meeting_link || "",
          status: s.can_join ? "live" : "upcoming",
          attendeesCount: 1,
          maxAttendees: 1,
          instructor: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user?.username || "Tutor"),
          rawSession: { ...s, category: "reserved_slots" },
        });
      });
    }

    return list;
  }, [dashboard, user, activeTzId]);

  // Grading queue from the dashboard (assignment submissions + quizzes with written answers)
  const mappedTasks = useMemo(() => {
    const fmtDay = (iso) => (iso ? formatDate(iso, profileTimezone) : "");
    const list = [];
    const pendingAssignments = dashboard?.recent_assessment_activity?.pending_assignment_grading || [];
    pendingAssignments.forEach((s) => {
      const key = `asg-${s.submission_id}`;
      const done = gradedLocally[key];
      list.push({
        id: key,
        kind: "assignment",
        submissionId: s.submission_id,
        studentName: s.student_name || "Student",
        studentRoll: `Submission #${s.submission_id}`,
        courseTitle: s.course_title || "",
        assignmentTitle: s.assignment || "Assignment",
        submittedAt: fmtDay(s.submitted_at),
        dueDate: fmtDay(s.due_date),
        status: done ? "graded" : s.is_late ? "overdue" : "queued",
        awardedMarks: done?.score,
        feedback: done?.feedback,
        maxMarks: s.max_score ?? null,
        rawSubmission: s,
      });
    });

    const pendingQuizzes = dashboard?.recent_assessment_activity?.pending_quiz_grading || [];
    pendingQuizzes.forEach((qs) => {
      const key = `qz-${qs.submission_id}`;
      const done = gradedLocally[key];
      list.push({
        id: key,
        kind: "quiz",
        submissionId: qs.submission_id,
        studentName: qs.student_name || "Student",
        studentRoll: `Quiz submission #${qs.submission_id}`,
        courseTitle: qs.course_title || "",
        assignmentTitle: qs.quiz || "Quiz",
        submittedAt: fmtDay(qs.submitted_at),
        dueDate: fmtDay(qs.due_date),
        status: done ? "graded" : "queued",
        awardedMarks: done?.score,
        maxMarks: qs.max_score ?? null,
        rawSubmission: qs,
      });
    });
    return list;
  }, [dashboard, gradedLocally, profileTimezone]);

  // Assignments from /assignments/ (empty when the teacher has none)
  const mappedAssignments = useMemo(() => {
    if (!Array.isArray(assignments)) return [];
    return assignments.map((a) => ({
      id: String(a.id),
      title: a.title,
      course: a.course?.id || a.course,
      courseId: a.course?.id || a.course,
      courseTitle: a.course_title || a.course?.title || "",
      maxMarks: a.max_score ?? null,
      max_score: a.max_score ?? null,
      hasAttachment: Boolean(a.file_url),
      launchDate: a.created_at ? formatDate(a.created_at, profileTimezone) : "",
      launchTime: a.created_at ? formatTime(a.created_at, profileTimezone) : "",
      dueDate: a.due_date ? formatDate(a.due_date, profileTimezone) : "",
      dueTime: a.due_date ? formatTime(a.due_date, profileTimezone) : "",
      due_date: a.due_date,
      status: a.status || "published",
      isOverdue: Boolean(a.is_overdue),
      submissionsCount: a.submissions_count || 0,
      description: a.description || "",
      rawAssignment: a,
    }));
  }, [assignments, profileTimezone]);

  // Live Session Launch & Meet Handling
  const handleStartSession = async (session) => {
    const raw = session?.rawSession || session;
    const cat = session?.category || raw?.category;

    // 1. Reserved 1-on-1 Slots Routing (Findings R2-1, R2-3)
    if (cat === "reserved_slots") {
      const effectiveTz = profileTimezone || "Asia/Riyadh";
      if (isSlotExpired(raw, effectiveTz)) {
        setSessionExpiredOpen(true);
        return false;
      }
      if (!isSlotJoinable(raw, effectiveTz)) {
        setTooEarlyOpen(true);
        return false;
      }
      const link = raw?.meeting_link || session?.meetLink;
      if (link && link.startsWith("http")) {
        window.open(link, "_blank", "noopener,noreferrer");
        return true;
      }
      toastManager.error("No valid meeting link found for this slot");
      return false;
    }

    // 2. Admin / Faculty Meetings Routing (Findings R2-1, R2-2)
    if (cat === "admin_session") {
      const sessionId = raw?.id ?? raw?.session_id ?? session?.id;
      const isMobile = /Mobi|Android|iPad|iPhone|iPod/i.test(navigator.userAgent);
      const meetWin = isMobile ? null : window.open("", "_blank");
      try {
        const result = await adminTeacherSessionService.joinSession(sessionId);
        const meetingLink = result?.meeting_link || raw?.meeting_link || session?.meetLink;
        if (meetingLink && meetingLink.startsWith("http")) {
          if (meetWin) meetWin.location.href = meetingLink;
          else window.open(meetingLink, "_blank", "noopener,noreferrer");
          await dispatch(fetchTeacherDashboard()).unwrap();
          return true;
        } else {
          meetWin?.close();
          toastManager.error("No valid meeting link found");
          return false;
        }
      } catch (err) {
        meetWin?.close();
        showApiError(err);
        return false;
      }
    }

    // 3. Regular Live Classes (Findings R2-1, R2-2)
    const sessionId = raw?.id ?? raw?.session_id ?? session?.id;
    const fallbackLink = raw?.meeting_link || session?.meetLink;

    // Already live (e.g. teacher closed the Meet tab): rejoin without calling start again
    if (raw?.status === "live" || session?.status === "live") {
      if (fallbackLink && fallbackLink.startsWith("http")) {
        window.open(fallbackLink, "_blank", "noopener,noreferrer");
        return true;
      }
      toastManager.error("No valid meeting link found for this session");
      return false;
    }

    const isMobile = /Mobi|Android|iPad|iPhone|iPod/i.test(navigator.userAgent);
    const meetWin = isMobile ? null : window.open("", "_blank");

    try {
      const result = await dispatch(startLiveSession(sessionId)).unwrap();
      const meetingLink = result?.meeting_link || fallbackLink;

      if (meetingLink && meetingLink.startsWith("http")) {
        try {
          new URL(meetingLink);
          if (meetWin) meetWin.location.href = meetingLink;
          else window.open(meetingLink, "_blank", "noopener,noreferrer");
          await dispatch(fetchTeacherDashboard()).unwrap();
          return true;
        } catch {
          meetWin?.close();
          toastManager.error("Invalid meeting link format");
          return false;
        }
      } else {
        meetWin?.close();
        toastManager.error("No valid meeting link found for this session");
        return false;
      }
    } catch (err) {
      meetWin?.close();
      const msg = extractApiErrorMessage(err);
      if (
        msg === "You cannot join before the scheduled time." ||
        msg === "You can join up to 30 minutes before the scheduled time." ||
        msg.includes("up to 20 minutes before")
      ) {
        setTooEarlyOpen(true);
      } else {
        showApiError(err);
      }
      return false;
    }
  };

  // End Session Handling (Regular live classes ONLY - Finding R2-2)
  const handleEndSession = (session) => {
    const raw = session?.rawSession || session;
    const cat = session?.category || raw?.category;
    if (cat !== "classes") {
      return;
    }
    const scheduleAt = raw?.schedule_at;
    if (scheduleAt && isSessionExpired(scheduleAt)) {
      setSessionExpiredOpen(true);
      return;
    }
    const sessionId = raw?.id ?? raw?.session_id ?? session?.id;
    setEndSessionConfirm({ open: true, sessionId });
  };

  const confirmEndSession = async () => {
    const { sessionId } = endSessionConfirm;
    setEndSessionConfirm({ open: false, sessionId: null });
    try {
      await dispatch(endLiveSession(sessionId)).unwrap();
      toastManager.success("Session ended successfully");
      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      showApiError(err);
    }
  };

  // Leave Admin Session Handling (Admin meetings ONLY - Findings R2-1, R2-2)
  const handleLeaveAdminSession = (session) => {
    const raw = session?.rawSession || session;
    const cat = session?.category || raw?.category;
    if (cat !== "admin_session") {
      return;
    }
    const sessionId = raw?.id ?? raw?.session_id ?? session?.id;
    setLeaveAdminConfirm({ open: true, sessionId });
  };

  const confirmLeaveAdminSession = async () => {
    const { sessionId } = leaveAdminConfirm;
    setLeaveAdminConfirm({ open: false, sessionId: null });
    try {
      await adminTeacherSessionService.leaveSession(sessionId);
      toastManager.success("Left admin session successfully");
      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      showApiError(err);
    }
  };

  // Broadcast Announcement
  const handlePostAnnouncement = async (title, content, audience) => {
    try {
      const matchedCourse = mappedCourses.find((c) => c.title === audience);
      await dispatch(
        createAnnouncement({
          title,
          body: content,
          ...(matchedCourse?.rawCourse?.id ? { course_id: Number(matchedCourse.rawCourse.id) } : {}),
        })
      ).unwrap();
      setAnnouncements((prev) => [
        { id: Date.now(), title, content, audience, created_at: new Date().toISOString() },
        ...prev,
      ]);
      toastManager.success(`Announcement broadcasted to ${audience}`);
    } catch (err) {
      showApiError(err);
    }
  };

  // Create or Update Assignment — throws on failure so the form stays open with the error
  const handleSaveAssignment = async (data) => {
    const courseId = Number(data.courseId);
    if (!courseId) throw new Error("Please choose a course.");
    const effectiveTz = profileTimezone || TZ_IANA_MAP[currentTz] || "Asia/Riyadh";
    const dueISO = new Date(tzToUTCMs(data.dueDate, data.dueTime, effectiveTz)).toISOString();
    if (data.id) {
      await dispatch(
        updateAssignment({
          id: data.id,
          data: {
            title: data.title,
            description: data.description,
            course: courseId,
            max_score: data.maxMarks,
            due_date: dueISO,
            status: "published",
            ...(data.file ? { file: data.file } : {}),
          },
        })
      ).unwrap();
      toastManager.success(`Assignment "${data.title}" updated`);
    } else {
      await dispatch(
        createAssignment({
          title: data.title,
          description: data.description,
          course: courseId,
          max_score: data.maxMarks,
          due_date: dueISO,
          status: "published",
          ...(data.file ? { file: data.file } : {}),
        })
      ).unwrap();
      toastManager.success(`Assignment "${data.title}" published`);
    }
    dispatch(fetchAssignments());
  };

  // Create or Update Quiz — maps builder question types onto the backend's types
  const handleSaveQuiz = async (quizData) => {
    const courseId = Number(quizData.courseId);
    if (!courseId) throw new Error("Please choose a course.");

    const effectiveTz = profileTimezone || TZ_IANA_MAP[currentTz] || "Asia/Riyadh";
    const toISO = (local) => formatTimezoneISO(local, effectiveTz) || new Date(local).toISOString();
    const due_date = toISO(quizData.dueDateTime);

    if (quizData.id) {
      if (quizData.isLocked) {
        try {
          await teacherService.updateQuiz(quizData.id, {
            title: quizData.title.trim(),
            description: quizData.description?.trim() || "",
            due_date,
          });
        } catch (err) {
          throw new Error(extractApiErrorMessage(err) || "Could not update the quiz.");
        }
        toastManager.success(`Quiz "${quizData.title}" updated (deadline extended)`);
      } else {
        const published_at = quizData.launchDateTime ? toISO(quizData.launchDateTime) : new Date().toISOString();
        const questions = (quizData.questions || []).map((q) => {
          const text = (q.questionText || "").trim();
          const marks = Number(q.marks) || 1;
          if (q.type === "multiple_choice") {
            const correct = String(q.correctAnswer || "").trim();
            return {
              question_text: text,
              question_type: "SINGLE_CHOICE",
              max_marks: marks,
              options: (q.options || []).map((opt) => ({
                option_text: String(opt).trim(),
                is_correct: String(opt).trim() === correct,
              })),
            };
          }
          if (q.type === "yes_no") {
            const ans = String(q.correctAnswer || "").trim().toLowerCase();
            return {
              question_text: text,
              question_type: "SINGLE_CHOICE",
              max_marks: marks,
              options: [
                { option_text: "Yes", is_correct: ans === "yes" },
                { option_text: "No", is_correct: ans === "no" },
              ],
            };
          }
          return { question_text: text, question_type: "TEXT_FORMAT", max_marks: marks, options: [] };
        });

        const total_marks = questions.reduce((s, q) => s + q.max_marks, 0);
        try {
          await teacherService.updateQuiz(quizData.id, {
            title: quizData.title.trim(),
            course: courseId,
            description: quizData.description?.trim() || "",
            total_marks,
            duration_minutes: quizData.durationMinutes,
            published_at,
            due_date,
            questions,
          });
        } catch (err) {
          throw new Error(extractApiErrorMessage(err) || "Could not update the quiz.");
        }
        toastManager.success(`Quiz "${quizData.title}" updated`);
      }
    } else {
      const published_at = quizData.launchDateTime ? toISO(quizData.launchDateTime) : new Date().toISOString();
      const questions = (quizData.questions || []).map((q) => {
        const text = (q.questionText || "").trim();
        const marks = Number(q.marks) || 1;
        if (q.type === "multiple_choice") {
          const correct = String(q.correctAnswer || "").trim();
          return {
            question_text: text,
            question_type: "SINGLE_CHOICE",
            max_marks: marks,
            options: (q.options || []).map((opt) => ({
              option_text: String(opt).trim(),
              is_correct: String(opt).trim() === correct,
            })),
          };
        }
        if (q.type === "yes_no") {
          const ans = String(q.correctAnswer || "").trim().toLowerCase();
          return {
            question_text: text,
            question_type: "SINGLE_CHOICE",
            max_marks: marks,
            options: [
              { option_text: "Yes", is_correct: ans === "yes" },
              { option_text: "No", is_correct: ans === "no" },
            ],
          };
        }
        return { question_text: text, question_type: "TEXT_FORMAT", max_marks: marks, options: [] };
      });

      const total_marks = questions.reduce((s, q) => s + q.max_marks, 0);
      try {
        await teacherService.createQuiz({
          title: quizData.title.trim(),
          course: courseId,
          description: quizData.description?.trim() || "",
          total_marks,
          duration_minutes: quizData.durationMinutes,
          published_at,
          due_date,
          questions,
        });
      } catch (err) {
        throw new Error(extractApiErrorMessage(err) || "Could not publish the quiz.");
      }
      toastManager.success(`Quiz "${quizData.title}" published`);
    }
    dispatch(fetchQuizzes());
  };

  const handleDeleteQuiz = async (quizId, isLocked) => {
    if (isLocked) {
      toastManager.error("Cannot delete a quiz with student attempts or submissions.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }
    try {
      await teacherService.deleteQuiz(quizId);
      toastManager.success("Quiz deleted successfully");
      dispatch(fetchQuizzes());
    } catch (err) {
      toastManager.error(extractApiErrorMessage(err) || "Failed to delete quiz.");
    }
  };

  // After a quiz submission is marked: refresh lists, flip the dashboard row at once
  const handleQuizGraded = (submission) => {
    if (submission?.id) {
      setGradedLocally((prev) => ({
        ...prev,
        [`qz-${submission.id}`]: { score: Number(submission.obtained_marks ?? 0) },
      }));
    }
    loadQuizSubmissions();
    dispatch(fetchTeacherDashboard());
  };

  // Grade an assignment submission (POST, or PATCH when a grade already exists)
  const handleGradeTask = async (task, score, feedback, alreadyGraded) => {
    const payload = { score, feedback };
    if (alreadyGraded) {
      await teacherService.updateSubmissionGrade(task.submissionId, payload);
    } else {
      await teacherService.gradeSubmission(task.submissionId, payload);
    }
    setGradedLocally((prev) => ({ ...prev, [task.id]: { score, feedback } }));
    toastManager.success(`Marks (${score}/${task.maxMarks ?? "?"}) released to ${task.studentName}`);
    dispatch(fetchTeacherDashboard());
    dispatch(fetchAssignments());
  };

  // Schedule Session Handler (Findings R2-4, R3-2, R3-3, R3-5, R4-2)
  const handleScheduleSession = async (sessionData) => {
    try {
      const title = sessionData?.title?.trim() || "";
      if (!title) {
        toastManager.error("Please enter a session topic.");
        return false;
      }
      const courseName = sessionData?.courseName || "";
      const matchedCourse = mappedCourses.find((c) => c.title === courseName);
      if (!matchedCourse) {
        toastManager.error("Please select a valid enrolled course for this session.");
        return false;
      }
      const rawId = matchedCourse.rawCourse?.id;
      const courseId = rawId ? Number(rawId) : null;
      if (!courseId || isNaN(courseId)) {
        toastManager.error("Invalid course selected.");
        return false;
      }

      const dateStr = sessionData?.date;
      const timeStr = sessionData?.time;
      if (!dateStr || !timeStr) {
        toastManager.error("Please select both a date and time for the session.");
        return false;
      }

      let scheduledAtISO;
      if (toPayloadISO) {
        scheduledAtISO = toPayloadISO(`${dateStr}T${timeStr}`);
      } else {
        const effectiveTz = profileTimezone || "Asia/Riyadh";
        scheduledAtISO = new Date(tzToUTCMs(dateStr, timeStr, effectiveTz)).toISOString();
      }

      const payload = {
        title,
        course: courseId,
        scheduled_at: scheduledAtISO,
        is_recurring: false,
      };

      await dispatch(createTeacherSession(payload)).unwrap();
      toastManager.success(`Live session "${title}" created successfully`);
      dispatch(fetchTeacherDashboard());
      return true;
    } catch (err) {
      showApiError(err);
      return false;
    }
  };

  return (
    <div className="w-full">
      <TeacherModernDashboard
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        sessions={mappedSessions}
        courses={mappedCourses}
        tasks={mappedTasks}
        assignments={mappedAssignments}
        quizzes={quizzes}
        upcomingSlots={dashboard?.upcoming_slots || []}
        attendance={attendance}
        attendanceRecords={Array.isArray(allAttendance) ? allAttendance : []}
        timezone={currentTz}
        onCycleTimezone={handleCycleTimezone}
        onOpenAnnouncementModal={() => setAnnouncementModalOpen(true)}
        onOpenNewSessionModal={() => setNewSessionModalOpen(true)}
        onOpenGradeModal={(task) =>
          task.kind === "quiz" ? setReviewingQuizSubmissionId(task.submissionId) : setGradingTask(task)
        }
        onOpenCreateAssignmentModal={() => {
          setEditingAssignment(null);
          setCreateAssignmentModalOpen(true);
        }}
        onOpenAdvancedQuizBuilderModal={() => {
          setEditingQuiz(null);
          setAdvancedQuizBuilderModalOpen(true);
        }}
        onEditAssignment={(asg) => {
          setEditingAssignment(asg);
          setCreateAssignmentModalOpen(true);
        }}
        onEditQuiz={(quiz) => {
          setEditingQuiz(quiz);
          setAdvancedQuizBuilderModalOpen(true);
        }}
        onDeleteQuiz={handleDeleteQuiz}
        onOpenReviewQuizModal={(quiz, submission) => setReviewingQuizSubmissionId(submission?.id ?? null)}
        user={user}
        onStartSession={handleStartSession}
        onEndSession={handleEndSession}
        onLeaveAdminSession={handleLeaveAdminSession}
        referralCode={profile?.referral_code || user?.referral_code}
      />

      {/* Broadcast Announcement Modal */}
      <PostAnnouncementModal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        courses={mappedCourses}
        announcements={announcements}
        onPostAnnouncement={handlePostAnnouncement}
      />

      {/* Create / Edit Assignment Modal */}
      <CreateAssignmentModal
        isOpen={createAssignmentModalOpen}
        onClose={() => {
          setCreateAssignmentModalOpen(false);
          setEditingAssignment(null);
        }}
        courses={mappedCourses}
        initialAssignment={editingAssignment}
        onCreateAssignment={handleSaveAssignment}
      />

      {/* Advanced Interactive Quiz Builder */}
      <AdvancedQuizBuilderModal
        isOpen={advancedQuizBuilderModalOpen}
        onClose={() => {
          setAdvancedQuizBuilderModalOpen(false);
          setEditingQuiz(null);
        }}
        courses={mappedCourses}
        initialQuiz={editingQuiz}
        onSaveQuiz={handleSaveQuiz}
        timezone={profileTimezone || TZ_IANA_MAP[currentTz] || "Asia/Riyadh"}
      />

      {/* Review Quiz Submission Modal */}
      {reviewingQuizSubmissionId && (
        <ReviewQuizModal
          submissionId={reviewingQuizSubmissionId}
          onClose={() => setReviewingQuizSubmissionId(null)}
          onGraded={handleQuizGraded}
        />
      )}

      {/* Grade an assignment submission */}
      {gradingTask && (
        <GradeTaskModal
          task={gradingTask}
          onClose={() => setGradingTask(null)}
          onGradeSubmit={handleGradeTask}
        />
      )}

      {/* Session Window Confirmation Alerts */}
      <ConfirmDialog
        open={tooEarlyOpen}
        variant="primary"
        title="Too Early to Join"
        message="You can join up to 20 minutes before the scheduled class time."
        confirmLabel="Got it"
        cancelLabel={null}
        onConfirm={() => setTooEarlyOpen(false)}
        onCancel={() => setTooEarlyOpen(false)}
      />

      <ConfirmDialog
        open={sessionExpiredOpen}
        variant="warning"
        title="Session Time Has Passed"
        message="This session's scheduled window has ended (maximum duration is 90 minutes)."
        confirmLabel="Got it"
        cancelLabel={null}
        onConfirm={() => setSessionExpiredOpen(false)}
        onCancel={() => setSessionExpiredOpen(false)}
      />

      {/* End Live Class Confirmation */}
      <ConfirmDialog
        open={endSessionConfirm.open}
        variant="danger"
        title="Terminate Live Session?"
        message="This will immediately disconnect all active students and conclude the lecture."
        confirmLabel="End Session Now"
        cancelLabel="Keep Active"
        onConfirm={confirmEndSession}
        onCancel={() => setEndSessionConfirm({ open: false, sessionId: null })}
      />

      {/* Leave Admin Session Confirmation */}
      <ConfirmDialog
        open={leaveAdminConfirm.open}
        variant="warning"
        title="Leave Faculty Session?"
        message="Are you sure you want to leave this administrative faculty meeting?"
        confirmLabel="Leave Meeting"
        cancelLabel="Stay in Meeting"
        onConfirm={confirmLeaveAdminSession}
        onCancel={() => setLeaveAdminConfirm({ open: false, sessionId: null })}
      />
    </div>
  );
};

export default TeacherPortal;
