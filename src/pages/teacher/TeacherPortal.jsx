import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeacherDashboard,
  fetchMyCourses,
  fetchAssignments,
  createAssignment,
  startLiveSession,
  endLiveSession,
  createTeacherSession,
  fetchAllAttendance,
} from "../../store/slices/teacherSlice";
import { createAnnouncement } from "../../store/slices/announcementsSlice";
import { teacherService } from "../../services/teacherService";
import { adminTeacherSessionService } from "../../services/adminTeacherSessionService";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import { formatDate, formatTime } from "../../utils/validation";
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

const isSlotJoinable = (slot, tz) => {
  if (!slot?.date || !slot?.start_time) return true;
  const now = Date.now();
  const startUTC = tzToUTCMs(slot.date, slot.start_time, tz);
  const endUTC = tzToUTCMs(slot.date, slot.end_time || slot.start_time, tz);
  return now >= startUTC - 30 * 60 * 1000 && now <= endUTC + 30 * 60 * 1000;
};

const isSlotExpired = (slot, tz) => {
  if (!slot?.date || !slot?.end_time) return false;
  return Date.now() > tzToUTCMs(slot.date, slot.end_time, tz) + 30 * 60 * 1000;
};

const TeacherPortal = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { timezone: profileTimezone, toPayloadISO } = useDateFormatters();

  // Active Tab from URL search params (e.g. /teacher?tab=attendance)
  const activeTab = searchParams.get("tab") || "dashboard";

  const handleSelectTab = (tab) => {
    if (tab === "dashboard") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  // Redux Auth & Teacher State
  const { user, profile } = useSelector((state) => state.auth);
  const {
    dashboard,
    myCourses,
    assignments,
    allAttendance,
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

  // Stateful collections initialized clean with live API backing
  const [quizzes, setQuizzes] = useState([]);
  const [slots] = useState([]);
  const [resources, setResources] = useState([]);
  const [evaluations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Modals state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newSessionModalOpen, setNewSessionModalOpen] = useState(false);
  const [createAssignmentModalOpen, setCreateAssignmentModalOpen] = useState(false);
  const [advancedQuizBuilderModalOpen, setAdvancedQuizBuilderModalOpen] = useState(false);
  const [reviewingQuiz, setReviewingQuiz] = useState(null);
  const [gradingTask, setGradingTask] = useState(null);

  // Session Alert & Confirm Dialogs
  const [tooEarlyOpen, setTooEarlyOpen] = useState(false);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [endSessionConfirm, setEndSessionConfirm] = useState({ open: false, sessionId: null });
  const [leaveAdminConfirm, setLeaveAdminConfirm] = useState({ open: false, sessionId: null });

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchTeacherDashboard());
    dispatch(fetchMyCourses());
    dispatch(fetchAssignments());
    dispatch(fetchAllAttendance());
  }, [dispatch]);

  // Map Live Courses (Production clean: empty when no courses enrolled)
  const mappedCourses = useMemo(() => {
    if (Array.isArray(myCourses) && myCourses.length > 0) {
      return myCourses.map((c, idx) => ({
        id: String(c.id),
        title: c.title,
        code: c.category?.name || c.code || `VCS-${c.id}`,
        category: c.category?.name || "CURRICULUM",
        level: c.level?.name || c.level || "Standard Tier",
        enrolledCount: c.enrolled_count ?? c.students_count ?? 0,
        published: c.status === "published",
        progress: c.progress ?? 0,
        syllabusUnitsCompleted: c.syllabus_completed ?? null,
        syllabusTotalUnits: c.syllabus_total ?? null,
        nextSessionTime: c.next_session || "Scheduled Class",
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

  // Derived real attendance mapped into view shape (Findings R2-7, R3-1)
  const attendance = useMemo(() => {
    const base = Array.isArray(allAttendance) ? allAttendance : [];
    const studentRecords = base.filter((r) => r.participant_role === "student");
    if (studentRecords.length === 0) return [];

    const todayStr = (() => {
      try {
        return new Intl.DateTimeFormat("en-CA", { timeZone: profileTimezone || "Asia/Riyadh" }).format(new Date());
      } catch {
        return new Date().toISOString().split("T")[0];
      }
    })();
    const groups = new Map();

    studentRecords.forEach((r) => {
      const studentObj = typeof r.student === "object" ? r.student : {};
      const sIdRaw = r.student?.id ?? r.student_id ?? (typeof r.student !== "object" ? r.student : null) ?? r.rollNo;
      const sId = sIdRaw != null ? String(sIdRaw) : "";
      if (!sId) return;

      const sName =
        r.student_name ||
        (studentObj.first_name ? `${studentObj.first_name} ${studentObj.last_name || ""}`.trim() : null) ||
        studentObj.username ||
        r.name ||
        `Student #${sId}`;

      const cTitle =
        r.course_title ||
        r.course?.title ||
        (typeof r.course === "string" ? r.course : null) ||
        mappedCourses.find((c) => String(c.id) === String(r.course_id || r.course || r.session?.course_id || r.session?.course))?.title ||
        "Unassigned";

      const groupKey = `${cTitle}::${sId}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: `${cTitle}-${sId}`,
          course: cTitle,
          name: sName,
          rollNo: sId,
          records: [],
        });
      }
      groups.get(groupKey).records.push(r);
    });

    return Array.from(groups.values()).map((g) => {
      const records = g.records;
      const totalSessions = records.length;
      const presentCount = records.filter((r) => r.status === "present" || r.status === "attended").length;
      const lateCount = records.filter((r) => r.status === "late").length;

      const attendanceRate = totalSessions > 0
        ? Math.round(((presentCount + lateCount * 0.5) / totalSessions) * 100)
        : null;

      const todayRecord = records.find((r) => {
        const d = r.date || r.session_date || r.scheduled_at || r.created_at || r.joined_at;
        return d && typeof d === "string" && d.startsWith(todayStr);
      });
      const statusToday = todayRecord ? todayRecord.status : null;

      let mostRecentTime = 0;
      records.forEach((r) => {
        const ts = r.updated_at || r.joined_at || r.created_at || r.date;
        if (ts) {
          const ms = new Date(ts).getTime();
          if (ms > mostRecentTime) mostRecentTime = ms;
        }
      });
      const lastSeen = mostRecentTime > 0
        ? formatDate(new Date(mostRecentTime).toISOString(), profileTimezone)
        : "—";

      return {
        id: g.id,
        course: g.course,
        name: g.name,
        rollNo: g.rollNo,
        lastSeen,
        attendanceRate,
        statusToday,
      };
    });
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

  // Map Tasks / Submissions Needing Grading (Empty when queue is clean)
  const mappedTasks = useMemo(() => {
    const list = [];
    const pendingAssignments = dashboard?.recent_assessment_activity?.pending_assignment_grading || [];
    pendingAssignments.forEach((s) => {
      list.push({
        id: String(s.submission_id),
        studentName: s.student_name || "Student",
        studentRoll: `Submission #${s.submission_id}`,
        courseTitle: s.course_title || "Enrolled Course",
        assignmentTitle: s.assignment || "Class Assignment",
        submittedAt: s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "Recent",
        dueDate: "Active Queue",
        status: "queued",
        maxMarks: s.max_marks || 25,
        rubricCriterion: "Conceptual understanding and calculation accuracy",
        rawSubmission: s,
      });
    });

    const pendingQuizzes = dashboard?.recent_assessment_activity?.pending_quiz_grading || [];
    pendingQuizzes.forEach((qs) => {
      list.push({
        id: `qz-sub-${qs.submission_id}`,
        studentName: qs.student_name || "Student",
        studentRoll: `Quiz #${qs.submission_id}`,
        courseTitle: qs.course_title || "Enrolled Course",
        assignmentTitle: qs.quiz || "Interactive Quiz",
        submittedAt: qs.submitted_at ? new Date(qs.submitted_at).toLocaleDateString() : "Recent",
        dueDate: "Active Queue",
        status: "queued",
        maxMarks: qs.max_marks || 20,
        rubricCriterion: "Automated & short-answer evaluation",
        rawSubmission: qs,
      });
    });

    return list;
  }, [dashboard]);

  // Map Assignments (Empty when no assignments exist - Finding R3-6)
  const mappedAssignments = useMemo(() => {
    if (Array.isArray(assignments) && assignments.length > 0) {
      return assignments.map((a) => ({
        id: String(a.id),
        title: a.title,
        courseTitle: a.course_title || a.course?.title || "Enrolled Course",
        maxMarks: a.max_marks || 20,
        submissionMethod: a.submission_type || "file_upload",
        allowedFormats: ["PDF", "PNG", "DOCX"],
        launchDate: a.created_at ? formatDate(a.created_at, profileTimezone) : "Active",
        launchTime: a.created_at ? formatTime(a.created_at, profileTimezone) : "—",
        dueDate: a.due_date ? formatDate(a.due_date, profileTimezone) : "Upcoming",
        dueTime: a.due_date ? formatTime(a.due_date, profileTimezone) : "—",
        status: "published",
        submissionsCount: a.submissions_count || 0,
        gradedCount: a.graded_count || 0,
        description: a.description || "",
        rubricCriterion: "Evaluation rubric and criteria",
      }));
    }
    return [];
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
      const scheduledAt = raw?.scheduled_at;
      if (scheduledAt && isSessionExpired(scheduledAt)) {
        setSessionExpiredOpen(true);
        return false;
      }
      if (scheduledAt && !isWithinSessionWindow(scheduledAt)) {
        setTooEarlyOpen(true);
        return false;
      }
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
        const msg = extractApiErrorMessage(err);
        if (
          msg === "You cannot join before the scheduled time." ||
          msg === "You can join up to 30 minutes before the scheduled time."
        ) {
          setTooEarlyOpen(true);
        } else {
          showApiError(err);
        }
        return false;
      }
    }

    // 3. Regular Live Classes (Findings R2-1, R2-2)
    const scheduleAt = raw?.schedule_at;
    if (scheduleAt && isSessionExpired(scheduleAt)) {
      setSessionExpiredOpen(true);
      return false;
    }
    if (scheduleAt && !isWithinSessionWindow(scheduleAt)) {
      setTooEarlyOpen(true);
      return false;
    }

    const sessionId = raw?.id ?? raw?.session_id ?? session?.id;
    const fallbackLink = raw?.meeting_link || session?.meetLink;
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
        msg === "You can join up to 30 minutes before the scheduled time."
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

  // Create Assignment (Findings 7, 8)
  const handleCreateAssignment = async (data) => {
    try {
      const matchedCourse = mappedCourses.find((c) => c.title === data.courseTitle);
      const rawId = matchedCourse?.rawCourse?.id;
      const courseId = rawId ? Number(rawId) : null;

      if (!courseId || isNaN(courseId)) {
        toastManager.error("Please select a valid enrolled course for this assignment.");
        return;
      }

      // Convert dueDate + dueTime properly into ISO UTC datetime using profile timezone (Finding R2-8)
      const effectiveAssignmentTz = profileTimezone || TZ_IANA_MAP[currentTz] || "Asia/Riyadh";
      const dueUTCMs = tzToUTCMs(data.dueDate, data.dueTime, effectiveAssignmentTz);
      const dueISO = new Date(dueUTCMs).toISOString();

      await dispatch(
        createAssignment({
          title: data.title,
          description: data.description,
          course: courseId,
          max_marks: data.maxMarks,
          due_date: dueISO,
        })
      ).unwrap();
      toastManager.success("Assignment published to class");
      dispatch(fetchAssignments());
    } catch (err) {
      showApiError(err);
    }
  };

  // Create / Save Interactive Quiz (Findings 5, 8)
  const handleSaveQuiz = async (quizData) => {
    try {
      const matchedCourse = mappedCourses.find((c) => c.title === quizData.courseTitle);
      const rawId = matchedCourse?.rawCourse?.id;
      const courseId = rawId ? Number(rawId) : null;

      if (!courseId || isNaN(courseId)) {
        toastManager.error("Please select a valid enrolled course for this quiz.");
        return;
      }

      await teacherService.createQuiz({
        title: quizData.title,
        course: courseId,
        description: quizData.description,
        duration_minutes: quizData.durationMins,
        total_marks: quizData.questions.reduce((s, q) => s + (Number(q.marks) || 0), 0),
        questions: quizData.questions,
      });

      toastManager.success(`Interactive quiz "${quizData.title}" published!`);

      const newQuizItem = {
        id: `qz-${Date.now()}`,
        title: quizData.title,
        courseTitle: quizData.courseTitle,
        description: quizData.description,
        marks: quizData.questions.reduce((s, q) => s + (Number(q.marks) || 0), 0),
        questionsCount: quizData.questions.length,
        durationMins: quizData.durationMins,
        launchDateTime: quizData.launchDateTime,
        dueDateTime: quizData.dueDateTime,
        status: "published",
        submissionsCount: 0,
        averageScore: undefined,
        questions: quizData.questions,
        submissions: [],
      };
      setQuizzes((prev) => [newQuizItem, ...prev]);
    } catch (err) {
      showApiError(err);
    }
  };

  // Grade Quiz Submission (Finding 5)
  const handleSaveQuizMarking = async (quizId, submissionId, gradedAnswers, overallFeedback) => {
    try {
      await teacherService.gradeQuizSubmission(submissionId, gradedAnswers);
      toastManager.success("Quiz submission graded and feedback released!");

      setQuizzes((prev) =>
        prev.map((qz) => {
          if (qz.id !== quizId) return qz;
          return {
            ...qz,
            submissions: qz.submissions.map((sub) => {
              if (sub.id !== submissionId) return sub;
              const awardedTotal = gradedAnswers.reduce((a, b) => a + Number(b.scoreAwarded || 0), 0);
              return {
                ...sub,
                status: "reviewed",
                totalScore: awardedTotal,
                overallFeedback,
                answers: sub.answers.map((ans) => {
                  const g = gradedAnswers.find((x) => x.questionId === ans.questionId);
                  return g ? { ...ans, scoreAwarded: g.scoreAwarded, teacherComment: g.teacherComment } : ans;
                }),
              };
            }),
          };
        })
      );
    } catch (err) {
      showApiError(err);
    }
  };

  // Grade Task (Finding 5)
  const handleGradeTask = async (task, awardedMarks, feedback) => {
    try {
      if (!task.rawSubmission?.submission_id) {
        toastManager.error("Submission ID not found");
        return;
      }
      await teacherService.gradeSubmission(task.rawSubmission.submission_id, {
        marks: awardedMarks,
        feedback,
      });
      toastManager.success(`Grade (${awardedMarks}/${task.maxMarks}) recorded for ${task.studentName}`);
      dispatch(fetchTeacherDashboard());
    } catch (err) {
      showApiError(err);
    }
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

  // Resources Handlers (Finding R2-6)
  const handleAddResource = (r) => {
    const newRes = {
      ...r,
      id: `res-${Date.now()}`,
      uploadedAt: "Recently added",
    };
    setResources((prev) => [newRes, ...prev]);
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
        slots={slots}
        attendance={attendance}
        resources={resources}
        evaluations={evaluations}
        timezone={currentTz}
        onCycleTimezone={handleCycleTimezone}
        onOpenAnnouncementModal={() => setAnnouncementModalOpen(true)}
        onOpenNewSessionModal={() => setNewSessionModalOpen(true)}
        onOpenGradeModal={(task) => setGradingTask(task)}
        onOpenCreateAssignmentModal={() => setCreateAssignmentModalOpen(true)}
        onOpenAdvancedQuizBuilderModal={() => setAdvancedQuizBuilderModalOpen(true)}
        onOpenReviewQuizModal={(quiz, submission) => setReviewingQuiz({ quiz, submission })}
        onAddResource={handleAddResource}
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

      {/* Schedule Live Session Modal */}
      <ScheduleSessionModal
        isOpen={newSessionModalOpen}
        onClose={() => setNewSessionModalOpen(false)}
        courses={mappedCourses}
        onCreateSession={handleScheduleSession}
        timezone={profileTimezone}
      />

      {/* Create Assignment Modal (Quick Text Task + File Upload) */}
      <CreateAssignmentModal
        isOpen={createAssignmentModalOpen}
        onClose={() => setCreateAssignmentModalOpen(false)}
        courses={mappedCourses}
        onCreateAssignment={handleCreateAssignment}
      />

      {/* Advanced Interactive Quiz Builder (with CSV / JSON Bulk Import) */}
      <AdvancedQuizBuilderModal
        isOpen={advancedQuizBuilderModalOpen}
        onClose={() => setAdvancedQuizBuilderModalOpen(false)}
        courses={mappedCourses}
        onSaveQuiz={handleSaveQuiz}
      />

      {/* Review Quiz Submission Modal */}
      {reviewingQuiz && (
        <ReviewQuizModal
          isOpen={Boolean(reviewingQuiz)}
          quiz={reviewingQuiz.quiz}
          submission={reviewingQuiz.submission}
          onClose={() => setReviewingQuiz(null)}
          onSaveMarking={handleSaveQuizMarking}
        />
      )}

      {/* Grade Queued Task Modal */}
      {gradingTask && (
        <GradeTaskModal
          isOpen={Boolean(gradingTask)}
          onClose={() => setGradingTask(null)}
          task={gradingTask}
          onGradeSubmit={(taskId, marks, feedback) => {
            handleGradeTask(gradingTask, marks, feedback);
            setGradingTask(null);
          }}
        />
      )}

      {/* Session Window Confirmation Alerts */}
      <ConfirmDialog
        open={tooEarlyOpen}
        variant="primary"
        title="Too Early to Join"
        message="You can join up to 30 minutes before the scheduled class time."
        confirmLabel="Got it"
        cancelLabel={null}
        onConfirm={() => setTooEarlyOpen(false)}
        onCancel={() => setTooEarlyOpen(false)}
      />

      <ConfirmDialog
        open={sessionExpiredOpen}
        variant="warning"
        title="Session Time Has Passed"
        message="This session's scheduled window has ended. Please check the session calendar for upcoming classes."
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
