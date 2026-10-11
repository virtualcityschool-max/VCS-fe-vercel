import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  BookOpen,
  UserCheck,
  ClipboardCheck,
  Calendar,
  Clock,
  FileSpreadsheet,
  Video,
  Globe,
  Megaphone,
  Share2,
  Copy,
  Check,
  Plus,
  ExternalLink,
  Award,
  CheckCircle2,
  ArrowRight,
  Newspaper,
  Info,
  LineChart,
  FolderOpen,
  Star,
  Printer,
  Edit3,
  CheckCheck,
  X,
  Square,
  LogOut
} from "lucide-react";
import { PerformanceAnalyticsView } from "./PerformanceAnalyticsView";
import { AssignmentsQuizzesView } from "./AssignmentsQuizzesView";
import { TeachingResourcesView } from "./TeachingResourcesView";
import DigitalSessionClock from "../../common/DigitalSessionClock";
export const TeacherDashboard = ({
  activeTab,
  onSelectTab,
  sessions,
  courses,
  tasks,
  assignments,
  quizzes,
  upcomingSlots = [],
  attendance,
  attendanceRecords = [],
  timezone,
  onCycleTimezone,
  onOpenAnnouncementModal,
  onOpenNewSessionModal,
  onOpenGradeModal,
  onOpenCreateAssignmentModal,
  onOpenAdvancedQuizBuilderModal,
  onOpenReviewQuizModal,
  onEditQuiz,
  onDeleteQuiz,
  onEditAssignment,
  user,
  onStartSession,
  onEndSession,
  onLeaveAdminSession,
  referralCode,
}) => {
  const [sessionCategory, setSessionCategory] = useState("classes");
  const [taskFilter, setTaskFilter] = useState("all");
  const [quizFilter, setQuizFilter] = useState("all");
  const [copiedLink, setCopiedLink] = useState(false);
  const [launchedSessionId, setLaunchedSessionId] = useState(null);
  const navigate = useNavigate();
  const [attendanceCoursePick, setAttendanceCoursePick] = useState("");
  const selectedAttendanceCourse = attendanceCoursePick || courses[0]?.title || "";
  const setSelectedAttendanceCourse = setAttendanceCoursePick;
  const [selectedEvaluationCourse, setSelectedEvaluationCourse] = useState("all");
  const refCode = referralCode || user?.referral_code || null;
  const referralUrl = refCode ? `https://virtualcityschool.com/signup?ref=${refCode}` : "";
  const handleCopyReferral = () => {
    if (!referralUrl) return;
    navigator.clipboard?.writeText(referralUrl).catch(() => {
    });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };
  const filteredSessions = sessions.filter((s) => s.category === sessionCategory);
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "all") return true;
    return t.status === taskFilter;
  });
  const filteredQuizzes = quizzes.filter((q) => {
    if (quizFilter === "all") return true;
    return q.status === quizFilter;
  });
  const totalEnrolledStudents = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  const pendingCount = tasks.filter((t) => t.status !== "graded").length;
  const gradedCount = tasks.length - pendingCount;
  // Overall student attendance across all recorded classes (present = 1, late = 0.5)
  const studentAttendance = attendanceRecords.filter((r) => r.participant_role === "student" && r.status);
  const overallAttendanceRate = studentAttendance.length > 0
    ? Math.round(
        studentAttendance.reduce(
          (acc, r) => acc + (r.status === "present" || r.status === "attended" ? 1 : r.status === "late" ? 0.5 : 0),
          0
        ) / studentAttendance.length * 100
      )
    : null;
  const tzDetails = {
    AST: "Riyadh (AST)",
    PKT: "Karachi (PKT)",
    BST: "London (BST)"
  }[timezone];
  const quickToolbarButtons = [
    { id: "dashboard", icon: <LayoutGrid className="w-4 h-4" />, title: "Dashboard Overview" },
    { id: "courses", icon: <BookOpen className="w-4 h-4" />, title: "My Courses" },
    { id: "attendance", icon: <UserCheck className="w-4 h-4" />, title: "Attendance (Per Class)" },
    { id: "assignments_quizzes", icon: <ClipboardCheck className="w-4 h-4" />, title: "Assignments & Quizzes" },
    { id: "teaching_resources", icon: <FolderOpen className="w-4 h-4" />, title: "Teaching Resources & Desk" },
    { id: "evaluations", icon: <FileSpreadsheet className="w-4 h-4" />, title: "Evaluations & Gradebook" },
    { id: "analytics", icon: <LineChart className="w-4 h-4" />, title: "Performance Analytics" },
    { id: "planner", icon: <Calendar className="w-4 h-4" />, title: "Planner" },
    { id: "slots", icon: <Clock className="w-4 h-4" />, title: "Slots Management" },
    { id: "blogs", icon: <Newspaper className="w-4 h-4" />, title: "Blogs", href: "/blogs" },
    { id: "about", icon: <Info className="w-4 h-4" />, title: "About Us", href: "/about" }
  ];
  const renderCoursesView = () => <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
            CURRICULUM MANAGEMENT
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">My Assigned Courses ({courses.length})</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage course frameworks, syllabus milestones, student rosters, and upcoming live lectures.
          </p>
        </div>
        <button
          onClick={() => onSelectTab("dashboard")}
          className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
        >
          ← Back to Bento Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((course) => <div
    key={course.id}
    className="rounded-2xl bg-[#101424] border border-[#1E2540] hover:border-indigo-500/50 transition-all overflow-hidden flex flex-col justify-between"
  >
            <div className={`p-5 bg-gradient-to-br ${course.accentGradient} relative`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-black/50 text-[10px] font-mono font-bold text-white uppercase border border-white/10">
                  {course.code || "VCS-CRS"}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${course.published ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                  {course.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{course.category}</div>
              <h3 className="text-lg font-extrabold text-white mt-1">{course.title}</h3>
              <div className="text-xs text-slate-300 mt-1">{course.level}</div>
            </div>

            <div className="p-5 space-y-4">
              {course.description && <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {course.description}
                </p>}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#181F36] text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Enrolled Students</span>
                  <div className="text-white font-bold font-mono text-sm tabular-nums mt-0.5">
                    {course.enrolledCount} Learners
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Next Scheduled Class</span>
                  <div className="text-indigo-300 font-semibold text-xs mt-0.5 truncate">
                    {course.nextSessionTime}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Link
    to={`/teacher/courses/${course.id}`}
    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
  >
                    Open Course →
                  </Link>
                  <button
    onClick={() => onSelectTab("assignments_quizzes", { course: course.title })}
    className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
  >
                    Assessments
                  </button>
                </div>
                <button
    onClick={onOpenNewSessionModal}
    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600/30 transition-colors cursor-pointer"
  >
                  Schedule Class
                </button>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
  const renderAttendanceView = () => {
    const classStudents = attendance.filter((rec) => rec.course === selectedAttendanceCourse);
    const selectedCourseObj = courses.find((c) => c.title === selectedAttendanceCourse);
    const presentCount = classStudents.filter((s) => s.statusToday === "present" || s.statusToday === "attended").length;
    const lateCount = classStudents.filter((s) => s.statusToday === "late").length;
    const absentCount = classStudents.filter((s) => s.statusToday === "absent").length;
    const rated = classStudents.filter((s) => s.attendanceRate != null);
    const classRate = rated.length > 0 ? Math.round(rated.reduce((a, s) => a + s.attendanceRate, 0) / rated.length) : null;
    return <div className="space-y-6">
        {
      /* Top Header */
    }
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg">
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>PER-CLASS STUDENT REGISTER & ROLL CALL</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Class Attendance Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dedicated roll call for each course. Select a class below to review and mark attendance without mixing cohorts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/teacher/attendance"
              className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-semibold text-indigo-300 border border-indigo-500/30 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Open Full Attendance Matrix →</span>
            </Link>
            <button
              onClick={() => onSelectTab("dashboard")}
              className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
            >
              ← Back to Bento Dashboard
            </button>
          </div>
        </div>

        {
      /* Dedicated Class Selector Tabs (Never mixed up!) */
    }
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Select Class Roster:</span>
            <span className="text-[11px] font-normal text-slate-400">(Showing isolated student lists per class)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {courses.map((course) => {
      const studentsInCourse = attendance.filter((r) => r.course === course.title);
      const isSelected = selectedAttendanceCourse === course.title;
      return <button
        key={course.id}
        onClick={() => setSelectedAttendanceCourse(course.title)}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected ? "bg-[#151C36] border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/30" : "bg-[#101424] border-[#1E2540] hover:border-slate-700"}`}
      >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono font-bold text-indigo-300 border border-white/5">
                      {course.code || "VCS"}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      {studentsInCourse.length} Learners
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white leading-snug line-clamp-1">{course.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">{course.nextSessionTime}</div>
                </button>;
    })}
          </div>
        </div>

        {
      /* Active Class Metrics Summary & Quick Roll Call Suite */
    }
        <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A223B] pb-4">
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Currently Viewing Class:
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                {selectedAttendanceCourse}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {[selectedCourseObj?.category, `Average attendance: ${classRate != null ? `${classRate}%` : "—"}`].filter(Boolean).join(" · ")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled
                title="Roll call marking is recorded during live sessions"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700/50 text-xs font-semibold opacity-60 cursor-not-allowed"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Present (Live Class Only)</span>
              </button>
              <button
                type="button"
                disabled
                title="Roll call marking is recorded during live sessions"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700/50 text-xs font-semibold opacity-60 cursor-not-allowed"
              >
                <span>Mark All Late (Live Class Only)</span>
              </button>
            </div>
          </div>

          {
      /* 4 Stat Badges for this Class */
    }
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1A223B]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Enrolled</span>
              <div className="text-lg font-mono font-bold text-white mt-0.5">{classStudents.length} Students</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1A223B]">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Present Today</span>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{presentCount} Learners</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1A223B]">
              <span className="text-[10px] text-amber-400 font-semibold uppercase">Late Arrivals</span>
              <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">{lateCount} Learners</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0E1A] border border-[#1A223B]">
              <span className="text-[10px] text-rose-400 font-semibold uppercase">Absent</span>
              <div className="text-lg font-mono font-bold text-rose-400 mt-0.5">{absentCount} Learners</div>
            </div>
          </div>

          {
      /* Isolated Class Table */
    }
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1C233D] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-center">Attendance Rate</th>
                  <th className="py-3 px-4 text-right">Today's Roll Call Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161C33] text-xs">
                {classStudents.length === 0 && <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                      {courses.length === 0 ? "You have no courses assigned yet." : "No students are enrolled in this class yet."}
                    </td>
                  </tr>}
                {classStudents.map((rec) => <tr key={rec.id} className="hover:bg-[#14192E] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                        {rec.name.charAt(0)}
                      </div>
                      <span>{rec.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 tabular-nums">#{rec.rollNo}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{rec.lastSeen}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        {rec.attendanceRate != null ? `${rec.attendanceRate}%` : "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {rec.statusToday ? (
                        <span
                          className={`inline-block px-3 py-1 rounded-xl text-[11px] font-bold uppercase ${rec.statusToday === "present" || rec.statusToday === "attended" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm" : rec.statusToday === "late" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"}`}
                        >
                          {rec.statusToday}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-xs">—</span>
                      )}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>;
  };
  const renderPlannerView = () => <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
            FACULTY TIMETABLE & SCHEDULER
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Weekly Academic Planner ({timezone})</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate synchronous lectures, admin coordination meetings, and student slots.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
    onClick={() => onSelectTab("dashboard")}
    className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
  >
            ← Back to Bento Dashboard
          </button>
          <button
    onClick={onOpenNewSessionModal}
    className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
  >
            + Add Live Class
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((ses) => <div
    key={ses.id}
    className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540] flex flex-col justify-between space-y-3"
  >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {ses.category.replace("_", " ")}
                </span>
                <span className="font-mono text-slate-300 tabular-nums">{ses.timeAST}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{ses.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{ses.courseName} · {ses.duration}</p>
            </div>

            <div className="pt-3 border-t border-[#181F36] flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                {ses.meetLink}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {ses.attendeesCount}/{ses.maxAttendees} Enrolled
              </span>
            </div>
          </div>)}
      </div>
    </div>;
  const backButton = <button
      onClick={() => onSelectTab("dashboard")}
      className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
    >
      ← Back to Bento Dashboard
    </button>;
  const renderSlotsView = () => <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
            OFFICE HOURS & CONSULTATION WINDOWS
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">1-on-1 Tutoring Slots</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your booked slots are listed here. Open slots are set on the availability page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/teacher/availability"
            className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold transition-all shadow-md"
          >
            Manage Availability →
          </Link>
          {backButton}
        </div>
      </div>

      {upcomingSlots.length === 0 ? <div className="p-10 rounded-2xl bg-[#101424] border border-[#1E2540] text-center">
          <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <div className="text-sm font-bold text-white">No booked slots coming up</div>
          <p className="text-xs text-slate-400 mt-1">When a student books one of your slots it will appear here.</p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingSlots.map((slot) => <div
            key={slot.id}
            className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540] flex items-center justify-between gap-4"
          >
              <div>
                <div className="text-sm font-bold text-white">
                  {slot.date} · <span className="font-mono tabular-nums">{slot.start_time}–{slot.end_time}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Booked by {slot.student_name || slot.student_email || "a student"}
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${slot.can_join ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"}`}>
                {slot.can_join ? "Join now" : "Booked"}
              </span>
            </div>)}
        </div>}
    </div>;
  const renderEvaluationsView = () => {
    const courseTasks = tasks.filter(
      (t) => selectedEvaluationCourse === "all" || t.courseTitle === selectedEvaluationCourse
    );
    return <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg">
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>EVALUATIONS & GRADEBOOK</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Evaluations & Grading Queue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mark waiting submissions here. Student term evaluations are written on the evaluations page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/teacher/evaluations"
              className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold transition-all shadow-md"
            >
              Student Evaluations →
            </Link>
            {backButton}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Filter by Course:</span>
          <button
      onClick={() => setSelectedEvaluationCourse("all")}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${selectedEvaluationCourse === "all" ? "bg-indigo-600 text-white shadow-sm" : "bg-[#121628] text-slate-400 hover:text-white border border-[#1E2540]"}`}
    >
            All Courses
          </button>
          {courses.map((c) => <button
      key={c.id}
      onClick={() => setSelectedEvaluationCourse(c.title)}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${selectedEvaluationCourse === c.title ? "bg-indigo-600 text-white shadow-sm" : "bg-[#121628] text-slate-400 hover:text-white border border-[#1E2540]"}`}
    >
              {c.title}
            </button>)}
        </div>

        <div className="space-y-3">
          {courseTasks.length === 0 && <div className="p-10 rounded-2xl bg-[#101424] border border-[#1E2540] text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Nothing waiting to be marked</div>
            </div>}
          {courseTasks.map((task) => <div
      key={task.id}
      className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540] flex flex-wrap items-center justify-between gap-4"
    >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">{task.assignmentTitle}</div>
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-200">{task.studentName}</span>
                  <span>·</span>
                  <span>{task.courseTitle}</span>
                  {task.submittedAt && <><span>·</span><span>Submitted {task.submittedAt}</span></>}
                </div>
                {task.feedback && <div className="mt-2 text-xs text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    Feedback: “{task.feedback}”
                  </div>}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-white tabular-nums">
                    {task.status === "graded" ? `${task.awardedMarks} / ${task.maxMarks ?? "?"} Marks` : task.maxMarks != null ? `Out of ${task.maxMarks}` : ""}
                  </div>
                  <div className={`text-[10px] font-bold uppercase ${task.status === "graded" ? "text-emerald-400" : task.status === "overdue" ? "text-amber-400" : "text-indigo-400"}`}>
                    {task.status === "overdue" ? "late" : task.status}
                  </div>
                </div>
                <button
      onClick={() => onOpenGradeModal(task)}
      className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold transition-all cursor-pointer"
    >
                  {task.status === "graded" ? "Edit Marks" : "Mark"}
                </button>
              </div>
            </div>)}
        </div>
      </div>;
  };
  const renderBlogsView = () => <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
        <div>
          <h2 className="text-xl font-extrabold text-white">Blogs</h2>
          <p className="text-xs text-slate-400 mt-0.5">Articles published by Virtual City School.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/blogs" className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold">
            Open Blogs →
          </Link>
          {backButton}
        </div>
      </div>
    </div>;
  const renderAboutView = () => <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-cyan-400">
            INSTITUTIONAL PROFILE
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">About Virtual City School</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Accredited digital academy delivering Cambridge O & A Level qualifications and University Test Preparation.
          </p>
        </div>
        <button
    onClick={() => onSelectTab("dashboard")}
    className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
  >
          ← Back to Bento Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#101424] border border-[#1E2540] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Cambridge Curriculum Excellence</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Directly aligned with Cambridge Assessment International Education (CAIE) syllabus codes (0580, 9702, 9701).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#101424] border border-[#1E2540] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Global Cohort Presence</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Synchronous lectures delivered in AST (Riyadh), PKT (Karachi), and BST (London) timezones with full session recordings.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#101424] border border-[#1E2540] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Individualized Tutoring</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Faculty-led 1-on-1 portfolio evaluations, structured rubric grading, and continuous diagnostic checkpoint drills.
          </p>
        </div>
      </div>
    </div>;
  if (activeTab === "courses") return renderCoursesView();
  if (activeTab === "attendance") return renderAttendanceView();
  if (activeTab === "assignments_quizzes" || activeTab === "assessments" || activeTab === "assignments")
    return <AssignmentsQuizzesView
      courses={courses}
      assignments={assignments}
      quizzes={quizzes}
      onOpenCreateAssignmentModal={onOpenCreateAssignmentModal}
      onOpenAdvancedQuizBuilderModal={onOpenAdvancedQuizBuilderModal}
      onOpenReviewQuizModal={onOpenReviewQuizModal}
      onBackToDashboard={() => onSelectTab("dashboard")}
      timezone={timezone}
      onEditQuiz={onEditQuiz}
      onDeleteQuiz={onDeleteQuiz}
      onEditAssignment={onEditAssignment}
    />;
  if (activeTab === "teaching_resources")
    return <TeachingResourcesView
      courses={courses}
      onBackToDashboard={() => onSelectTab("dashboard")}
      timezone={timezone}
    />;
  if (activeTab === "analytics")
    return <PerformanceAnalyticsView
      courses={courses}
      quizzes={quizzes}
      attendance={attendance}
      attendanceRecords={attendanceRecords}
      assignments={assignments}
      onBackToDashboard={() => onSelectTab("dashboard")}
      timezone={timezone}
    />;
  if (activeTab === "planner") return renderPlannerView();
  if (activeTab === "slots") return renderSlotsView();
  if (activeTab === "evaluations") return renderEvaluationsView();
  if (activeTab === "blogs") return renderBlogsView();
  if (activeTab === "about") return renderAboutView();
  return <div className="max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {
    /* ================= LEFT COLUMN (4 COLS) ================= */
  }
        <div className="lg:col-span-4 space-y-5">
          {
    /* 1. Faculty Identity Card */
  }
          <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center text-lg font-extrabold text-white shadow-[0_0_25px_rgba(99,91,255,0.4)] shrink-0">
                {(user?.first_name ? `${user.first_name[0]}${(user.last_name || "")[0] || ""}` : (user?.username?.slice(0, 2) || "")).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold tracking-[0.14em] text-indigo-400 uppercase">
                  FACULTY WORKSPACE
                </div>
                <h1 className="text-xl font-extrabold text-white truncate mt-0.5 capitalize">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user?.display_name || user?.username || "")}
                </h1>
                <div className="text-xs text-slate-400 mt-0.5">
                  Teacher · {courses.length} {courses.length === 1 ? "course" : "courses"} · {totalEnrolledStudents} {totalEnrolledStudents === 1 ? "student" : "students"}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161B30] border border-[#242C4C] text-[11px] text-slate-200">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{tzDetails}</span>
                    <button
                      onClick={onCycleTimezone}
                      className="ml-1 text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-2 hover:underline cursor-pointer"
                    >
                      Switch
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1B223B] flex items-center justify-between gap-2">
              <div className="text-xs text-slate-400 truncate">
                {user?.email || ""}
              </div>
              <button
    onClick={onOpenAnnouncementModal}
    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold tracking-tight transition-all shadow-sm cursor-pointer whitespace-nowrap"
  >
                <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>POST ANNOUNCEMENT</span>
              </button>
            </div>
          </div>

          {
    /* 2. Upcoming Sessions Card */
  }
          <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Upcoming Sessions</h2>
                  <p className="text-[11px] text-slate-400">Google Meet · {timezone}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#161C30] border border-[#263052] text-[11px] font-semibold text-slate-300 tabular-nums">
                {filteredSessions.length} {filteredSessions.length === 1 ? "Session" : "Sessions"}
              </span>
            </div>

            {
    /* 3-Tab Segmented Control from Teacher Screenshot */
  }
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#0B0E1A] border border-[#1A2138] mb-4">
              <button
    onClick={() => setSessionCategory("admin_session")}
    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all truncate cursor-pointer ${sessionCategory === "admin_session" ? "bg-[#1D2540] text-white border border-indigo-500/40" : "text-slate-400 hover:text-slate-200"}`}
  >
                Admin Session
              </button>
              <button
    onClick={() => setSessionCategory("classes")}
    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 truncate cursor-pointer ${sessionCategory === "classes" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
  >
                <span>Classes</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/25 text-[10px] tabular-nums">
                  {sessions.filter((s) => s.category === "classes").length}
                </span>
              </button>
              <button
    onClick={() => setSessionCategory("reserved_slots")}
    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all truncate cursor-pointer ${sessionCategory === "reserved_slots" ? "bg-[#1D2540] text-white border border-indigo-500/40" : "text-slate-400 hover:text-slate-200"}`}
  >
                Reserved Slots
              </button>
            </div>

            {filteredSessions.length === 0 ? <div className="rounded-xl bg-[#0C0F1D] border border-[#192038] p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white">No sessions scheduled</div>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  You have no upcoming sessions in this view.
                </p>
                <button
    onClick={onOpenNewSessionModal}
    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
  >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Live Session</span>
                </button>
              </div> : <div className="space-y-2.5">
                {filteredSessions.map((ses) => {
    const isLaunched = launchedSessionId === ses.id;
    return <div
      key={ses.id}
      className="p-3.5 rounded-xl bg-[#0C0F1D] border border-[#1B223B] hover:border-indigo-500/40 transition-all"
    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white leading-snug">
                            {ses.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {ses.courseName} · <span className="font-mono tabular-nums">{ses.timeAST}</span> ({ses.duration})
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {ses.rawSession?.scheduled_at && (
                            <DigitalSessionClock
                              scheduledAt={ses.rawSession?.scheduled_at}
                              status={ses.status}
                              variant="inline"
                            />
                          )}
                          <span className="text-[11px] font-mono text-slate-300 tabular-nums">
                            {ses.attendeesCount}/{ses.maxAttendees}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-[#151B30]">
                        <span className="text-[11px] text-slate-400 truncate font-mono">
                          {ses.meetLink.replace("https://", "")}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* End Button: ONLY for regular live classes */}
                          {onEndSession && ses.category === "classes" && (ses.status === "live" || isLaunched) && (
                            <button
                              type="button"
                              onClick={() => onEndSession(ses)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 cursor-pointer"
                            >
                              <Square className="w-2.5 h-2.5 fill-current" />
                              <span>End</span>
                            </button>
                          )}
                          {/* Leave Button: ONLY for admin faculty sessions */}
                          {onLeaveAdminSession && ses.category === "admin_session" && (ses.status === "live" || isLaunched) && (
                            <button
                              type="button"
                              onClick={() => onLeaveAdminSession(ses)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
                            >
                              <LogOut className="w-2.5 h-2.5" />
                              <span>Leave</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              let ok = false;
                              if (onStartSession) {
                                ok = await onStartSession(ses);
                              } else if (ses.meetLink) {
                                window.open(ses.meetLink, "_blank", "noopener,noreferrer");
                                ok = true;
                              }
                              if (ok) {
                                setLaunchedSessionId(ses.id);
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${isLaunched ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
                          >
                            <span>{isLaunched ? "Room Active" : "Launch Meet"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>;
  })}
              </div>}

            <div className="mt-4 pt-3 border-t border-[#171D33] flex items-center justify-between text-xs">
              <button
    onClick={onOpenNewSessionModal}
    className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
  >
                <span>+ Schedule a Class</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
    onClick={() => onSelectTab("planner")}
    className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
  >
                <span>Faculty Planner</span>
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Invite & Refer Widget */}
          {refCode && (
            <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Invite & Refer</div>
                  <div className="text-[11px] text-slate-400">
                    Share your link, anyone who joins through it is credited to you.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A0D18] border border-[#1E2642] text-[11px] font-mono text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyReferral}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4E38E8] text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {
    /* ================= RIGHT COLUMN (8 COLS) ================= */
  }
        <div className="lg:col-span-8 space-y-5">
          {
    /* Top Quick-Action Icon Toolbar with direct links to all sub-menus */
  }
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E1220] border border-[#1C233D] rounded-2xl p-2.5">
            <div className="flex items-center gap-1.5">
              {quickToolbarButtons.map((btn) => <button
    key={btn.id}
    onClick={() => (btn.href ? navigate(btn.href) : onSelectTab(btn.id))}
    title={btn.title}
    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === btn.id ? "bg-gradient-to-br from-[#5B46F8] to-[#4C6EF5] text-white shadow-[0_0_15px_rgba(91,70,248,0.4)]" : "text-slate-400 hover:text-slate-200 hover:bg-[#161C30]"}`}
  >
                  {btn.icon}
                </button>)}
            </div>

            <div className="flex items-center gap-2">
              <button
    onClick={onOpenNewSessionModal}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer"
  >
                <Plus className="w-3.5 h-3.5" />
                <span>New Live Class</span>
              </button>
            </div>
          </div>

          {
    /* Split Row: Teaching Standing & Assessments */
  }
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {
    /* Teaching Standing */
  }
            <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Teaching Standing</h2>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  ACTIVE TERM
                </span>
              </div>

              <div className="my-5 flex items-center gap-5">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
    cx="50"
    cy="50"
    r="40"
    stroke="#1B223B"
    strokeWidth="8"
    fill="transparent"
  />
                    <circle
    cx="50"
    cy="50"
    r="40"
    stroke="#635BFF"
    strokeWidth="8"
    strokeDasharray={2 * Math.PI * 40}
    strokeDashoffset={2 * Math.PI * 40 * (1 - (tasks.length > 0 ? gradedCount / tasks.length : 1))}
    strokeLinecap="round"
    fill="transparent"
  />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-extrabold text-white tabular-nums">
                      {pendingCount}
                    </span>
                    <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                      TO MARK
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div
    onClick={() => onSelectTab("courses")}
    className="p-2.5 rounded-xl bg-[#0C0F1D] border border-[#1B223B] text-center hover:border-indigo-500/40 cursor-pointer transition-colors"
  >
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        ACTIVE COHORTS
                      </div>
                      <div className="text-base font-extrabold text-white mt-0.5 tabular-nums">
                        {courses.length}
                      </div>
                      <div className="text-[11px] text-indigo-400">View Courses →</div>
                    </div>
                    <div
    onClick={() => onSelectTab("attendance")}
    className="p-2.5 rounded-xl bg-[#0C0F1D] border border-[#1B223B] text-center hover:border-emerald-500/40 cursor-pointer transition-colors"
  >
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        ATTENDANCE
                      </div>
                      <div className="text-base font-extrabold text-emerald-400 mt-0.5 tabular-nums">
                        {overallAttendanceRate != null ? `${overallAttendanceRate}%` : "—"}
                      </div>
                      <div className="text-[11px] text-emerald-400">Roll Call →</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#181F36] flex items-center justify-between text-xs text-slate-400">
                <span>
                  Enrolled Learners: <strong className="text-white tabular-nums">{totalEnrolledStudents} active</strong>
                </span>
                <button
    onClick={() => onSelectTab("evaluations")}
    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
  >
                  Grade Queue →
                </button>
              </div>
            </div>

            {
    /* Assessments & Quizzes Card */
  }
            <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-sm font-bold text-white tabular-nums">
                    Assessments & Quizzes ({filteredQuizzes.length})
                  </h2>
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0E1A] border border-[#1A2138]">
                    {["all", "published", "scheduled", "closed"].map((tab) => <button
    key={tab}
    onClick={() => setQuizFilter(tab)}
    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${quizFilter === tab ? "bg-[#5B46F8] text-white" : "text-slate-400 hover:text-slate-200"}`}
  >
                        {tab}
                      </button>)}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredQuizzes.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No {quizFilter === "all" ? "" : quizFilter} quizzes found.
                    </div>
                  ) : (
                    filteredQuizzes.map((qz) => (
                      <div
                        key={qz.id}
                        onClick={() => onSelectTab("assignments_quizzes")}
                        className="p-3 rounded-xl bg-[#0C0F1D] border border-[#1B223B] hover:border-indigo-500/40 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{qz.title}</div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {qz.courseTitle} · {qz.submissionsCount || 0} submissions
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-xs font-extrabold text-white font-mono tabular-nums">
                            {qz.marks} Marks
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              qz.status === "published"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-700/40 text-slate-300"
                            }`}
                          >
                            {qz.status === "published" ? "LIVE" : qz.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-[#181F36] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Avg Score:{" "}
                  <strong className="text-slate-200 tabular-nums">
                    {(() => {
                      const scored = filteredQuizzes.filter((q) => typeof q.averageScore === "number");
                      if (scored.length === 0) return "—";
                      const avg = scored.reduce((acc, q) => acc + q.averageScore, 0) / scored.length;
                      return `${avg.toFixed(1)}%`;
                    })()}
                  </strong>
                </span>
                <button
    onClick={() => onSelectTab("assignments_quizzes")}
    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
  >
                  <span>Assignments & Quizzes Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {
    /* Task Center & Submissions */
  }
          <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white tabular-nums">
                    Task Center & Submissions ({filteredTasks.length})
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluate student scripts, assign rubric marks, or release written feedback.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0E1A] border border-[#1A2138]">
                {["all", "queued", "overdue", "graded"].map((st) => <button
    key={st}
    onClick={() => setTaskFilter(st)}
    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${taskFilter === st ? "bg-[#5B46F8] text-white" : "text-slate-400 hover:text-slate-200"}`}
  >
                    {{ queued: "waiting", overdue: "late", graded: "marked" }[st] || st}
                  </button>)}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredTasks.length === 0 && <div className="py-6 text-center text-xs text-slate-500">
                  {taskFilter === "all" ? "No submissions are waiting to be marked." : `No ${taskFilter} submissions.`}
                </div>}
              {filteredTasks.map((task) => <div
    key={task.id}
    className="p-3.5 rounded-xl bg-[#0C0F1D] border border-[#1B223B] hover:border-[#2C375E] flex flex-wrap items-center justify-between gap-4 transition-all"
  >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-white">{task.assignmentTitle}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-200 font-medium">{task.studentName}</span>
                      <span>·</span>
                      <span className="font-mono">{task.studentRoll}</span>
                      <span>·</span>
                      <span>{task.courseTitle}</span>
                      <span>·</span>
                      <span>Submitted {task.submittedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white tabular-nums">
                        {task.status === "graded" ? `${task.awardedMarks} / ${task.maxMarks ?? "?"} Marks` : task.maxMarks != null ? `Out of ${task.maxMarks}` : ""}
                      </div>
                      <div
    className={`text-[10px] font-semibold uppercase ${task.status === "graded" ? "text-emerald-400" : task.status === "overdue" ? "text-amber-400" : "text-indigo-400"}`}
  >
                        {task.status === "graded" ? "\u2713 Marked" : task.status === "overdue" ? "\u25CF Late" : "\u25CF Waiting"}
                      </div>
                    </div>

                    <button
    onClick={() => onOpenGradeModal(task)}
    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${task.status === "graded" ? "bg-[#171D33] hover:bg-[#202846] text-slate-200 border border-[#273154]" : "bg-[#5B46F8] hover:bg-[#4C38E6] text-white"}`}
  >
                      {task.status === "graded" ? "Edit Marks" : task.kind === "quiz" ? "Mark Quiz" : "Mark"}
                    </button>
                  </div>
                </div>)}
            </div>
          </div>

          {
    /* Academic Portfolio (4 Courses) */
  }
          <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white tabular-nums">
                    Academic Portfolio ({courses.length})
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Courses you teach
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
    onClick={() => onSelectTab("courses")}
    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
  >
                  <span>Open Full Courses Manager</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {courses.map((course) => <div
    key={course.id}
    onClick={() => onSelectTab("courses")}
    className="group rounded-2xl bg-[#0C0F1D] border border-[#1B233E] hover:border-indigo-500/50 overflow-hidden flex flex-col justify-between transition-all cursor-pointer"
  >
                  <div className={`h-28 bg-gradient-to-br ${course.accentGradient} p-3.5 flex flex-col justify-between`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-300 bg-black/40 px-2 py-0.5 rounded-md border border-emerald-400/30">
                        {course.published ? "PUBLISHED" : "DRAFT"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded-md">
                        {course.code}
                      </span>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold text-indigo-200/90 uppercase truncate">
                        {course.category}
                      </div>
                      <div className="text-xs font-extrabold text-white line-clamp-1 mt-0.5">
                        {course.title}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{course.enrolledCount} Enrolled</span>
                      <span>{course.nextSessionTime}</span>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
