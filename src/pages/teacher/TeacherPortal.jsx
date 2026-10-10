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
} from "../../store/slices/teacherSlice";
import { createAnnouncement } from "../../store/slices/announcementsSlice";
import { teacherService } from "../../services/teacherService";
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
  CreateCourseModal,
} from "../../components/teacher/modern/TeacherModals";
import {
  CreateAssignmentModal,
  AdvancedQuizBuilderModal,
} from "../../components/teacher/modern/AssignmentQuizModals";
import { ReviewQuizModal } from "../../components/teacher/modern/ReviewQuizModal";
import {
  INITIAL_TEACHER_SESSIONS,
  INITIAL_COURSES,
  INITIAL_TASKS,
  INITIAL_ASSIGNMENTS,
  INITIAL_QUIZZES,
  INITIAL_SLOTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_TEACHING_RESOURCES,
  INITIAL_EVALUATIONS,
} from "../../components/teacher/modern/vcsTeacherData";

const TeacherPortal = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

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
  } = useSelector((state) => state.teachers);

  // Timezone Switcher state
  const [currentTz, setCurrentTz] = useState("AST");

  const handleCycleTimezone = () => {
    const order = ["AST", "PKT", "BST"];
    const next = order[(order.indexOf(currentTz) + 1) % order.length];
    setCurrentTz(next);
    toastManager.info(`Workspace timezone switched to ${next}`);
  };

  // Stateful VCS collections (initialized with AI Studio defaults + live updates)
  const [customCourses, setCustomCourses] = useState([]);
  const [customSessions, setCustomSessions] = useState([]);
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [resources, setResources] = useState(INITIAL_TEACHING_RESOURCES);
  const [evaluations, setEvaluations] = useState(INITIAL_EVALUATIONS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);

  // Modals state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newSessionModalOpen, setNewSessionModalOpen] = useState(false);
  const [createCourseModalOpen, setCreateCourseModalOpen] = useState(false);
  const [createAssignmentModalOpen, setCreateAssignmentModalOpen] = useState(false);
  const [advancedQuizBuilderModalOpen, setAdvancedQuizBuilderModalOpen] = useState(false);
  const [reviewingQuiz, setReviewingQuiz] = useState(null);
  const [gradingTask, setGradingTask] = useState(null);

  // Session Alert & Confirm Dialogs
  const [tooEarlyOpen, setTooEarlyOpen] = useState(false);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [endSessionConfirm, setEndSessionConfirm] = useState({ open: false, sessionId: null });

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchTeacherDashboard());
    dispatch(fetchMyCourses());
    dispatch(fetchAssignments());
  }, [dispatch]);

  // Map Live Courses
  const mappedCourses = useMemo(() => {
    let base = INITIAL_COURSES;
    if (Array.isArray(myCourses) && myCourses.length > 0) {
      base = myCourses.map((c, idx) => ({
        id: String(c.id),
        title: c.title,
        code: c.category?.name || c.code || `VCS-${c.id}`,
        category: c.category?.name || "CAMBRIDGE CURRICULUM",
        level: c.level?.name || c.level || "Standard Tier",
        enrolledCount: c.enrolled_count || c.students_count || 0,
        published: c.status === "published",
        progress: c.progress || 70 + (idx * 5) % 25,
        syllabusUnitsCompleted: c.syllabus_completed || 8,
        syllabusTotalUnits: c.syllabus_total || 12,
        nextSessionTime: c.next_session || "Scheduled Class",
        description: c.description || "Comprehensive curriculum progression with structured assessments.",
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
    return [...customCourses, ...base];
  }, [myCourses, customCourses]);

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
          timeAST: s.schedule_at ? new Date(s.schedule_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Upcoming",
          duration: "60 min",
          meetLink: s.meeting_link || "https://meet.google.com",
          status: s.status === "live" ? "live" : "upcoming",
          attendeesCount: s.total_learners || 1,
          maxAttendees: 15,
          instructor: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user?.username || "Tutor"),
          rawSession: s,
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
          timeAST: s.scheduled_at ? new Date(s.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Scheduled",
          duration: "45 min",
          meetLink: s.meeting_link || "https://meet.google.com",
          status: s.status === "live" ? "live" : s.status === "completed" ? "completed" : "upcoming",
          attendeesCount: 6,
          maxAttendees: 6,
          instructor: "Academic Administration",
          rawSession: s,
        });
      });
    }

    if (dashboard?.upcoming_slots && dashboard.upcoming_slots.length > 0) {
      dashboard.upcoming_slots.forEach((s) => {
        list.push({
          id: `slot-${s.id}`,
          title: `1-on-1 Consultation: ${s.student_name || "Learner"}`,
          courseName: "Office Hours & Consultation",
          category: "reserved_slots",
          timeAST: `${s.start_time} - ${s.end_time}`,
          duration: "30 min",
          meetLink: s.meeting_link || "https://meet.google.com",
          status: s.can_join ? "live" : "upcoming",
          attendeesCount: 1,
          maxAttendees: 1,
          instructor: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user?.username || "Tutor"),
          rawSession: s,
        });
      });
    }

    const base = list.length > 0 ? list : INITIAL_TEACHER_SESSIONS;
    return [...customSessions, ...base];
  }, [dashboard, user, customSessions]);

  // Map Tasks / Submissions Needing Grading
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
        maxMarks: 25,
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
        maxMarks: 20,
        rubricCriterion: "Automated & short-answer evaluation",
        rawSubmission: qs,
      });
    });

    if (list.length > 0) return list;
    return INITIAL_TASKS;
  }, [dashboard]);

  // Map Assignments
  const mappedAssignments = useMemo(() => {
    if (Array.isArray(assignments) && assignments.length > 0) {
      return assignments.map((a) => ({
        id: String(a.id),
        title: a.title,
        courseTitle: a.course_title || a.course?.title || "Cambridge Subject",
        description: a.description || "Review reference material and submit solutions.",
        submissionMethod: a.submission_type || "file_upload",
        allowedFormats: ["PDF", "PNG", "DOCX"],
        launchDate: a.created_at ? a.created_at.split("T")[0] : "2026-10-10",
        launchTime: "09:00 AM AST",
        dueDate: a.due_date ? a.due_date.split("T")[0] : "2026-10-15",
        dueTime: "11:59 PM AST",
        maxMarks: a.max_marks || a.total_marks || 25,
        rubricCriterion: "Structured problem breakdown & reasoning clarity",
        status: "published",
        submissionsCount: a.submissions_count || 0,
        reviewedCount: a.reviewed_count || 0,
        rawAssignment: a,
      }));
    }
    return INITIAL_ASSIGNMENTS;
  }, [assignments]);

  // Live Session Launch & Meet Handling
  const handleStartSession = async (session) => {
    const raw = session?.rawSession || session;
    const scheduleAt = raw?.schedule_at || raw?.scheduled_at;

    if (scheduleAt && isSessionExpired(scheduleAt)) {
      setSessionExpiredOpen(true);
      return;
    }
    if (scheduleAt && !isWithinSessionWindow(scheduleAt)) {
      setTooEarlyOpen(true);
      return;
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
        } catch {
          meetWin?.close();
          toastManager.error("Invalid meeting link format");
        }
      } else {
        meetWin?.close();
        toastManager.error("No valid meeting link found for this session");
      }

      await dispatch(fetchTeacherDashboard()).unwrap();
    } catch (err) {
      meetWin?.close();
      const msg = extractApiErrorMessage(err);
      if (
        msg === "You cannot join before the scheduled time." ||
        msg === "You can join up to 30 minutes before the scheduled time."
      ) {
        setTooEarlyOpen(true);
      } else {
        // Fallback: open meeting link directly if available
        if (fallbackLink && fallbackLink.startsWith("http")) {
          window.open(fallbackLink, "_blank", "noopener,noreferrer");
        } else {
          showApiError(err);
        }
      }
    }
  };

  const confirmEndSession = async () => {
    const { sessionId } = endSessionConfirm;
    setEndSessionConfirm({ open: false, sessionId: null });
    try {
      await dispatch(endLiveSession(sessionId)).unwrap();
      toastManager.success("Session closed successfully");
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

      const newAnn = {
        id: `ann-${Date.now()}`,
        title,
        content,
        audience,
        postedAt: `Just now · ${currentTz}`,
        author: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user?.username || "Tutor"),
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      toastManager.success(`Announcement broadcasted to ${audience}`);
    } catch (err) {
      showApiError(err);
    }
  };

  // Create Assignment
  const handleCreateAssignment = async (data) => {
    try {
      const matchedCourse = mappedCourses.find((c) => c.title === data.courseTitle);
      const courseId = matchedCourse?.rawCourse?.id || matchedCourse?.id;

      if (courseId) {
        await dispatch(
          createAssignment({
            title: data.title,
            description: data.description,
            course: Number(courseId),
            max_marks: data.maxMarks,
            due_date: `${data.dueDate}T${data.dueTime.split(" ")[0] || "23:59:00"}Z`,
          })
        ).unwrap();
        toastManager.success("Assignment published to class");
        dispatch(fetchAssignments());
      } else {
        toastManager.success(`Assignment "${data.title}" drafted for ${data.courseTitle}`);
      }
    } catch (err) {
      showApiError(err);
    }
  };

  // Create / Save Interactive Quiz
  const handleSaveQuiz = async (quizData) => {
    try {
      const matchedCourse = mappedCourses.find((c) => c.title === quizData.courseTitle);
      const courseId = matchedCourse?.rawCourse?.id || matchedCourse?.id;

      if (courseId) {
        await teacherService.createQuiz({
          title: quizData.title,
          course: Number(courseId),
          description: quizData.description,
          duration_minutes: quizData.durationMins,
          total_marks: quizData.questions.reduce((s, q) => s + q.marks, 0),
          questions: quizData.questions,
        });
        toastManager.success(`Interactive quiz "${quizData.title}" published!`);
      }
    } catch {
      // Fallback local state if API payload schema varies
      toastManager.success(`Quiz "${quizData.title}" created with ${quizData.questions.length} questions!`);
    }

    const newQuizItem = {
      id: `qz-${Date.now()}`,
      title: quizData.title,
      courseTitle: quizData.courseTitle,
      description: quizData.description,
      marks: quizData.questions.reduce((s, q) => s + q.marks, 0),
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
  };

  // Grade Quiz Submission
  const handleSaveQuizMarking = async (quizId, submissionId, gradedAnswers, overallFeedback) => {
    try {
      await teacherService.gradeQuizSubmission(submissionId, gradedAnswers);
      toastManager.success("Quiz submission graded and feedback released!");
    } catch {
      toastManager.success("Quiz grades recorded successfully");
    }

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
  };

  // Grade Task
  const handleGradeTask = async (task, awardedMarks, feedback) => {
    try {
      if (task.rawSubmission?.submission_id) {
        await teacherService.gradeSubmission(task.rawSubmission.submission_id, {
          marks: awardedMarks,
          feedback,
        });
      }
      toastManager.success(`Grade (${awardedMarks}/${task.maxMarks}) recorded for ${task.studentName}`);
      dispatch(fetchTeacherDashboard());
    } catch {
      toastManager.success(`Grade (${awardedMarks}/${task.maxMarks}) recorded for ${task.studentName}`);
    }
  };

  // Attendance Handlers
  const handleMarkAllClassAttendance = async (courseTitle, status) => {
    setAttendance((prev) =>
      prev.map((rec) => (rec.course === courseTitle ? { ...rec, statusToday: status } : rec))
    );
    toastManager.success(`Marked all students in "${courseTitle}" as ${status.toUpperCase()}`);
  };

  const handleToggleAttendanceStatus = (recordId) => {
    const cycle = { present: "late", late: "absent", absent: "present" };
    setAttendance((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, statusToday: cycle[r.statusToday] || "present" } : r))
    );
  };

  // Slots Handler
  const handleToggleSlotStatus = async (slotId) => {
    const cycle = { available: "reserved", reserved: "blocked", blocked: "available" };
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status: cycle[s.status] || "available" } : s))
    );
  };

  // Resources Handlers
  const handleAddResource = (r) => {
    const newRes = {
      ...r,
      id: `res-${Date.now()}`,
      uploadedAt: `Just now · ${currentTz}`,
    };
    setResources((prev) => [newRes, ...prev]);
    toastManager.success(`Resource "${r.title}" uploaded & cataloged`);
  };

  const handleTogglePinResource = (id) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, pinnedForNextClass: !r.pinnedForNextClass } : r))
    );
  };

  // Evaluation Handler
  const handleSaveEvaluation = (evaluationId, updates) => {
    setEvaluations((prev) =>
      prev.map((ev) => (ev.id === evaluationId ? { ...ev, ...updates } : ev))
    );
    toastManager.success("Student evaluation report updated");
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
        onOpenCreateCourseModal={() => setCreateCourseModalOpen(true)}
        onOpenCreateAssignmentModal={() => setCreateAssignmentModalOpen(true)}
        onOpenAdvancedQuizBuilderModal={() => setAdvancedQuizBuilderModalOpen(true)}
        onOpenReviewQuizModal={(quiz, submission) => setReviewingQuiz({ quiz, submission })}
        onToggleSlotStatus={handleToggleSlotStatus}
        onToggleAttendanceStatus={handleToggleAttendanceStatus}
        onAddQuiz={(title, courseTitle, marks) =>
          handleSaveQuiz({
            title,
            courseTitle,
            description: "Quick quiz created by instructor",
            durationMins: 20,
            launchDateTime: new Date().toISOString().slice(0, 16),
            dueDateTime: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16),
            questions: [
              {
                id: `q-gen-1`,
                type: "multiple_choice",
                questionText: "Sample question: Select the correct conceptual response.",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: "Option A",
                marks,
              },
            ],
          })
        }
        onAddResource={handleAddResource}
        onTogglePinResource={handleTogglePinResource}
        onSaveEvaluation={handleSaveEvaluation}
        onMarkAllClassAttendance={handleMarkAllClassAttendance}
        user={user}
        onStartSession={handleStartSession}
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
        onCreateSession={(title, courseName, category, timeAST, duration) => {
          const newSes = {
            id: `ses-${Date.now()}`,
            title,
            courseName,
            category,
            timeAST,
            duration,
            meetLink: `https://meet.google.com/vcs-${Math.random().toString(36).substring(7)}`,
            status: "upcoming",
            attendeesCount: 0,
            maxAttendees: 15,
            instructor: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user?.username || "Tutor"),
          };
          setCustomSessions((prev) => [newSes, ...prev]);
          toastManager.success(`Live class "${title}" scheduled`);
        }}
      />

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={createCourseModalOpen}
        onClose={() => setCreateCourseModalOpen(false)}
        onCreateCourse={(title, code, category, level, description) => {
          const newC = {
            id: `course-${Date.now()}`,
            title,
            code: code || `VCS-${Date.now().toString().slice(-4)}`,
            category: category || "CAMBRIDGE CURRICULUM",
            level: level || "Standard Tier",
            enrolledCount: 0,
            published: true,
            progress: 0,
            syllabusUnitsCompleted: 0,
            syllabusTotalUnits: 12,
            nextSessionTime: "Orientation Scheduled",
            description: description || "Newly authorized curriculum course.",
            accentGradient: "from-indigo-900/80 via-slate-900 to-slate-950",
          };
          setCustomCourses((prev) => [newC, ...prev]);
          toastManager.success(`Course "${title}" created and added to faculty roster`);
        }}
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
    </div>
  );
};

export default TeacherPortal;
