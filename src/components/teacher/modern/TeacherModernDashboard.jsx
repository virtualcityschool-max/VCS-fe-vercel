import { useState } from "react";
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
  X
} from "lucide-react";
import {
  INITIAL_BLOGS
} from "./vcsTeacherData";
import { PerformanceAnalyticsView } from "./PerformanceAnalyticsView";
import { AssignmentsQuizzesView } from "./AssignmentsQuizzesView";
import { TeachingResourcesView } from "./TeachingResourcesView";
export const TeacherDashboard = ({
  activeTab,
  onSelectTab,
  sessions,
  courses,
  tasks,
  assignments,
  quizzes,
  slots,
  attendance,
  resources,
  evaluations,
  timezone,
  onCycleTimezone,
  onOpenAnnouncementModal,
  onOpenNewSessionModal,
  onOpenGradeModal,
  onOpenCreateCourseModal,
  onOpenCreateAssignmentModal,
  onOpenAdvancedQuizBuilderModal,
  onOpenReviewQuizModal,
  onToggleSlotStatus,
  onToggleAttendanceStatus,
  onAddResource,
  onTogglePinResource,
  onSaveEvaluation,
  onMarkAllClassAttendance,
  user,
  onStartSession,
  referralCode,
}) => {
  const [sessionCategory, setSessionCategory] = useState("classes");
  const [showDemoEmptySessions, setShowDemoEmptySessions] = useState(false);
  const [taskFilter, setTaskFilter] = useState("all");
  const [quizFilter, setQuizFilter] = useState("all");
  const [copiedLink, setCopiedLink] = useState(false);
  const [launchedSessionId, setLaunchedSessionId] = useState(null);
  const [blogs] = useState(INITIAL_BLOGS);
  const [selectedAttendanceCourse, setSelectedAttendanceCourse] = useState(
    courses[0]?.title || "Cambridge O & A Level Physics"
  );
  const [selectedEvaluationCourse, setSelectedEvaluationCourse] = useState(
    courses[0]?.title || "Cambridge O & A Level Physics"
  );
  const [evaluationTab, setEvaluationTab] = useState("rubrics_reports");
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [viewingReportCard, setViewingReportCard] = useState(null);
  const refCode = referralCode || user?.referral_code || "aamirwaqas670";
  const referralUrl = `https://virtualcityschool.com/signup?ref=${refCode}`;
  const handleCopyReferral = () => {
    navigator.clipboard?.writeText(referralUrl).catch(() => {
    });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };
  const filteredSessions = showDemoEmptySessions ? [] : sessions.filter((s) => s.category === sessionCategory);
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "all") return true;
    return t.status === taskFilter;
  });
  const filteredQuizzes = quizzes.filter((q) => {
    if (quizFilter === "all") return true;
    return q.status === quizFilter;
  });
  const totalEnrolledStudents = courses.reduce((acc, c) => acc + c.enrolledCount, 0);
  const gradedCount = tasks.filter((t) => t.status === "graded").length;
  const completionRate = tasks.length > 0 ? Math.round(gradedCount / tasks.length * 100) : 100;
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
    { id: "blogs", icon: <Newspaper className="w-4 h-4" />, title: "Blogs" },
    { id: "about", icon: <Info className="w-4 h-4" />, title: "About Us" }
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
        <div className="flex items-center gap-3">
          <button
    onClick={() => onSelectTab("dashboard")}
    className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
  >
            ← Back to Bento Dashboard
          </button>
          <button
    onClick={onOpenCreateCourseModal}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
  >
            <Plus className="w-4 h-4" />
            <span>Launch New Course</span>
          </button>
        </div>
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
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-400/30">
                  Active Term
                </span>
              </div>
              <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{course.category}</div>
              <h3 className="text-lg font-extrabold text-white mt-1">{course.title}</h3>
              <div className="text-xs text-slate-300 mt-1">{course.level}</div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {course.description || "Comprehensive curriculum progression with structured assessments."}
              </p>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Syllabus Progress</span>
                  <span className="font-mono font-bold text-indigo-400 tabular-nums">
                    {course.progress}% ({course.syllabusUnitsCompleted}/{course.syllabusTotalUnits} Units)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181F36] overflow-hidden">
                  <div
    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
    style={{ width: `${course.progress}%` }}
  />
                </div>
              </div>

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
                <button
    onClick={() => onSelectTab("assignments_quizzes")}
    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
  >
                  View Course Assessments →
                </button>
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
    const presentCount = classStudents.filter((s) => s.statusToday === "present").length;
    const lateCount = classStudents.filter((s) => s.statusToday === "late").length;
    const absentCount = classStudents.filter((s) => s.statusToday === "absent").length;
    const classRate = classStudents.length > 0 ? Math.round((presentCount + lateCount * 0.5) / classStudents.length * 100) : 100;
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
          <button
      onClick={() => onSelectTab("dashboard")}
      className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
    >
            ← Back to Bento Dashboard
          </button>
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
                {selectedCourseObj?.category} · Next Scheduled: {selectedCourseObj?.nextSessionTime} · Roll Call Turnout: {classRate}%
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
      onClick={() => onMarkAllClassAttendance(selectedAttendanceCourse, "present")}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
    >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>
              <button
      onClick={() => onMarkAllClassAttendance(selectedAttendanceCourse, "late")}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
    >
                <span>Mark All Late</span>
              </button>
              <button
      onClick={() => alert(`Attendance report exported for ${selectedAttendanceCourse} (${classStudents.length} students)`)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-slate-300 border border-[#273154] text-xs font-semibold cursor-pointer"
    >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Roll</span>
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
                  <th className="py-3 px-4 text-center">Semester Rate</th>
                  <th className="py-3 px-4 text-right">Today's Roll Call Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161C33] text-xs">
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
                        {rec.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
      onClick={() => onToggleAttendanceStatus(rec.id)}
      title="Click to toggle status (Present / Late / Absent)"
      className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${rec.statusToday === "present" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm" : rec.statusToday === "late" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"}`}
    >
                        {rec.statusToday} ▾
                      </button>
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
  const renderSlotsView = () => <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
            OFFICE HOURS & CONSULTATION WINDOWS
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">1-on-1 Tutoring Slots Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any slot badge to toggle availability between Available, Reserved, and Blocked.
          </p>
        </div>
        <button
    onClick={() => onSelectTab("dashboard")}
    className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
  >
          ← Back to Bento Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot) => <div
    key={slot.id}
    className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540] flex items-center justify-between gap-4"
  >
            <div>
              <div className="text-sm font-bold text-white">
                {slot.day} · <span className="font-mono tabular-nums">{slot.timeRangeAST}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {slot.bookedByStudent ? `Booked by ${slot.bookedByStudent} \u2014 ${slot.courseTopic}` : slot.status === "available" ? "Open for student 1-on-1 booking" : "Blocked for faculty prep work"}
              </div>
            </div>
            <button
    onClick={() => onToggleSlotStatus(slot.id)}
    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${slot.status === "available" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : slot.status === "reserved" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
  >
              {slot.status}
            </button>
          </div>)}
      </div>
    </div>;
  const renderEvaluationsView = () => {
    const courseEvaluations = evaluations.filter(
      (ev) => selectedEvaluationCourse === "all" || ev.courseTitle === selectedEvaluationCourse
    );
    const courseTasks = tasks.filter(
      (t) => selectedEvaluationCourse === "all" || t.courseTitle === selectedEvaluationCourse
    );
    return <div className="space-y-6">
        {
      /* Top Header Banner */
    }
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg">
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ACADEMIC EVALUATIONS & COMPETENCY GRADEBOOK</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Evaluations & Student Progress Reports
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive Cambridge competency rubrics, term assessment reports, qualitative faculty remarks, and printable student evaluation cards.
            </p>
          </div>
          <button
      onClick={() => onSelectTab("dashboard")}
      className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
    >
            ← Back to Bento Dashboard
          </button>
        </div>

        {
      /* Course Filter Tabs */
    }
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

        {
      /* Sub-Tabs: Competency Reports vs Homework Grading Queue */
    }
        <div className="flex items-center gap-2 border-b border-[#1E2642] pb-2">
          <button
      onClick={() => setEvaluationTab("rubrics_reports")}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${evaluationTab === "rubrics_reports" ? "bg-[#161D38] text-white border border-indigo-500/40 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
    >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Student Term Evaluations ({courseEvaluations.length})</span>
          </button>
          <button
      onClick={() => setEvaluationTab("homework_queue")}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${evaluationTab === "homework_queue" ? "bg-[#161D38] text-white border border-indigo-500/40 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
    >
            <ClipboardCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Homework Grading Queue ({courseTasks.length})</span>
          </button>
        </div>

        {
      /* TAB 1: FORMAL STUDENT EVALUATION CARDS */
    }
        {evaluationTab === "rubrics_reports" && <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courseEvaluations.map((ev) => <div
      key={ev.id}
      className="rounded-2xl bg-[#101424] border border-[#1E2540] hover:border-indigo-500/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-lg"
    >
                <div>
                  {
      /* Student Header */
    }
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                        {ev.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{ev.studentName}</h4>
                          <span className="font-mono text-[11px] text-slate-400">({ev.studentRoll})</span>
                        </div>
                        <div className="text-xs text-indigo-400 font-semibold mt-0.5">{ev.courseTitle}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                        <span>Grade {ev.overallGrade}</span>
                        <span>·</span>
                        <span>{ev.overallScore}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">{ev.term}</div>
                    </div>
                  </div>

                  {
      /* Cambridge Criteria Gauges */
    }
                  <div className="mt-4 p-3.5 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Cambridge Rubric Competency Breakdown:
                    </span>
                    <div className="space-y-2 text-xs">
                      {ev.criteria.map((c, i) => <div key={i}>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-slate-300 font-medium">{c.name}</span>
                            <span className="font-mono font-bold text-indigo-300">{c.score}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#161D36] overflow-hidden">
                            <div
      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
      style={{ width: `${c.score}%` }}
    />
                          </div>
                        </div>)}
                    </div>
                  </div>

                  {
      /* Faculty Written Remarks */
    }
                  <div className="mt-3.5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-indigo-300 mr-1.5">Teacher Appraisal:</span>
                    “{ev.teacherRemarks}”
                  </div>

                  {
      /* Strengths & Growth Areas */
    }
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {ev.strengths.map((str, sIdx) => <span
      key={sIdx}
      className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold"
    >
                        ✓ {str}
                      </span>)}
                    {ev.growthAreas.map((gr, gIdx) => <span
      key={gIdx}
      className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold"
    >
                        ↗ {gr}
                      </span>)}
                  </div>
                </div>

                {
      /* Bottom Actions */
    }
                <div className="pt-3 border-t border-[#181F36] flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Conduct: <strong className="text-emerald-400">{ev.conduct}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
      onClick={() => setViewingReportCard(ev)}
      className="px-3 py-1.5 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer inline-flex items-center gap-1.5"
    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Card</span>
                    </button>
                    <button
      onClick={() => setEditingEvaluation(ev)}
      className="px-3 py-1.5 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-xs font-bold text-white transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Rubric</span>
                    </button>
                  </div>
                </div>
              </div>)}
          </div>}

        {
      /* TAB 2: HOMEWORK / TASK GRADING QUEUE */
    }
        {evaluationTab === "homework_queue" && <div className="space-y-3">
            {courseTasks.map((task) => <div
      key={task.id}
      className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540] flex flex-wrap items-center justify-between gap-4"
    >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">{task.assignmentTitle}</div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-200">{task.studentName}</span>
                    <span>·</span>
                    <span className="font-mono">{task.studentRoll}</span>
                    <span>·</span>
                    <span>{task.courseTitle}</span>
                    <span>·</span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                  {task.feedback && <div className="mt-2 text-xs text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      Faculty Feedback: “{task.feedback}”
                    </div>}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-white tabular-nums">
                      {task.status === "graded" ? `${task.awardedMarks} / ${task.maxMarks} Marks` : `Max ${task.maxMarks} Marks`}
                    </div>
                    <div
      className={`text-[10px] font-bold uppercase ${task.status === "graded" ? "text-emerald-400" : task.status === "overdue" ? "text-amber-400" : "text-indigo-400"}`}
    >
                      {task.status}
                    </div>
                  </div>
                  <button
      onClick={() => onOpenGradeModal(task)}
      className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold transition-all cursor-pointer"
    >
                    {task.status === "graded" ? "Edit Evaluation" : "Score Rubric"}
                  </button>
                </div>
              </div>)}
          </div>}

        {
      /* ------------------------------------------------------------------ */
    }
        {
      /*           MODAL: EDIT STUDENT EVALUATION & RUBRIC SCORES           */
    }
        {
      /* ------------------------------------------------------------------ */
    }
        {editingEvaluation && <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-xl bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden my-6">
              <div className="px-6 py-4 border-b border-[#1C233D] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Edit Evaluation: {editingEvaluation.studentName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {editingEvaluation.courseTitle} · {editingEvaluation.studentRoll}
                    </p>
                  </div>
                </div>
                <button
      onClick={() => setEditingEvaluation(null)}
      className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
    >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {
      /* Overall Grade & Score */
    }
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Overall Letter Grade
                    </label>
                    <select
      value={editingEvaluation.overallGrade}
      onChange={(e) => setEditingEvaluation({ ...editingEvaluation, overallGrade: e.target.value })}
      className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
    >
                      <option value="A*">A* (Distinction)</option>
                      <option value="A">A (Excellent)</option>
                      <option value="B">B (Commendable)</option>
                      <option value="C">C (Satisfactory)</option>
                      <option value="D">D (Needs Improvement)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Composite Term Score (%)
                    </label>
                    <input
      type="number"
      min={0}
      max={100}
      value={editingEvaluation.overallScore}
      onChange={(e) => setEditingEvaluation({
        ...editingEvaluation,
        overallScore: Number(e.target.value)
      })}
      className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs font-mono font-bold text-white tabular-nums"
    />
                  </div>
                </div>

                {
      /* Criteria Score Sliders */
    }
                <div className="space-y-3 p-4 rounded-xl bg-[#0B0E1A] border border-[#1A223B]">
                  <span className="text-xs font-bold text-white">Adjust Competency Scores:</span>
                  {editingEvaluation.criteria.map((c, idx) => <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{c.name}</span>
                        <span className="font-mono font-bold text-indigo-400">{c.score}%</span>
                      </div>
                      <input
      type="range"
      min={40}
      max={100}
      value={c.score}
      onChange={(e) => {
        const newScore = Number(e.target.value);
        const updated = [...editingEvaluation.criteria];
        updated[idx] = { ...updated[idx], score: newScore };
        setEditingEvaluation({ ...editingEvaluation, criteria: updated });
      }}
      className="w-full accent-indigo-500"
    />
                    </div>)}
                </div>

                {
      /* Written Remarks */
    }
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Faculty Qualitative Remarks
                  </label>
                  <textarea
      rows={3}
      value={editingEvaluation.teacherRemarks}
      onChange={(e) => setEditingEvaluation({
        ...editingEvaluation,
        teacherRemarks: e.target.value
      })}
      className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white"
    />
                </div>

                {
      /* Conduct Rating */
    }
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Conduct & Classroom Effort
                  </label>
                  <div className="flex items-center gap-2">
                    {["Outstanding", "Good", "Needs Attention"].map((lvl) => <button
      type="button"
      key={lvl}
      onClick={() => setEditingEvaluation({ ...editingEvaluation, conduct: lvl })}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${editingEvaluation.conduct === lvl ? "bg-indigo-600 text-white" : "bg-[#12162A] text-slate-400 border border-[#1E2642]"}`}
    >
                        {lvl}
                      </button>)}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C233D]">
                  <button
      type="button"
      onClick={() => setEditingEvaluation(null)}
      className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
    >
                    Cancel
                  </button>
                  <button
      type="button"
      onClick={() => {
        onSaveEvaluation(editingEvaluation.id, editingEvaluation);
        setEditingEvaluation(null);
      }}
      className="px-5 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-xs font-bold text-white shadow-lg cursor-pointer"
    >
                    Save Evaluation
                  </button>
                </div>
              </div>
            </div>
          </div>}

        {
      /* ------------------------------------------------------------------ */
    }
        {
      /*           MODAL: VIEW / PRINT OFFICIAL REPORT CARD                 */
    }
        {
      /* ------------------------------------------------------------------ */
    }
        {viewingReportCard && <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#0E1222] border border-[#273256] rounded-2xl shadow-2xl overflow-hidden my-6">
              <div className="px-6 py-4 border-b border-[#1C233D] flex items-center justify-between bg-[#12162B]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Official Academic Evaluation Card
                    </h3>
                    <p className="text-xs text-slate-400">Virtual City School · Term 2026 Appraisal</p>
                  </div>
                </div>
                <button
      onClick={() => setViewingReportCard(null)}
      className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
    >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 bg-[#0E1222] text-slate-100">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                      VIRTUAL CITY SCHOOL
                    </div>
                    <h2 className="text-xl font-extrabold text-white mt-1">Student Performance Transcript</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{viewingReportCard.term}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      {viewingReportCard.overallGrade}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-300">
                      {viewingReportCard.overallScore}% Aggregate
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Learner Name:</span>
                    <div className="text-white font-bold text-sm mt-0.5">{viewingReportCard.studentName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Roll Identification:</span>
                    <div className="text-white font-bold text-sm font-mono mt-0.5">{viewingReportCard.studentRoll}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Curriculum Course:</span>
                    <div className="text-white font-bold mt-0.5">{viewingReportCard.courseTitle}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Faculty Conduct Appraisal:</span>
                    <div className="text-emerald-400 font-bold mt-0.5">{viewingReportCard.conduct}</div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Competency Rubric Assessment:
                  </div>
                  <div className="space-y-2">
                    {viewingReportCard.criteria.map((cr, idx) => <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-slate-300">{cr.name}</span>
                        <span className="font-mono font-bold text-indigo-300">{cr.score} / {cr.maxScore}</span>
                      </div>)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141A33] border border-[#222B4D] space-y-1">
                  <div className="text-xs font-bold text-indigo-300">Dean of Academics & Tutor Commentary:</div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    “{viewingReportCard.teacherRemarks}”
                  </p>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-[#1C233D] flex items-center justify-between bg-[#12162B]">
                <span className="text-xs text-slate-400 font-mono">Issued by: Aamir Waqas · Senior Tutor</span>
                <button
      onClick={() => {
        alert("Print dialog initiated. Progress card ready for PDF download.");
      }}
      className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-xs font-bold text-white cursor-pointer inline-flex items-center gap-1.5"
    >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download / Print Transcript</span>
                </button>
              </div>
            </div>
          </div>}
      </div>;
  };
  const renderBlogsView = () => <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
            ACADEMIC INSIGHTS & ARTICLES
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Faculty Academic Blogs ({blogs.length})</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Published advice, exam blueprints, and pedagogical articles for Virtual City School candidates.
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
        {blogs.map((b) => <div
    key={b.id}
    className="p-5 rounded-2xl bg-[#101424] border border-[#1E2540] flex flex-col justify-between space-y-4"
  >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{b.category}</span>
                <span>{b.readTime}</span>
              </div>
              <h3 className="text-base font-bold text-white leading-snug">{b.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{b.snippet}</p>
            </div>

            <div className="pt-3 border-t border-[#181F36] flex items-center justify-between text-xs text-slate-400">
              <span>{b.author}</span>
              <span className="font-mono tabular-nums">{b.views} reads</span>
            </div>
          </div>)}
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
    />;
  if (activeTab === "teaching_resources")
    return <TeachingResourcesView
      courses={courses}
      resources={resources}
      onAddResource={onAddResource}
      onTogglePinResource={onTogglePinResource}
      onBackToDashboard={() => onSelectTab("dashboard")}
      timezone={timezone}
    />;
  if (activeTab === "analytics")
    return <PerformanceAnalyticsView
      courses={courses}
      quizzes={quizzes}
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
                {(user?.first_name ? `${user.first_name[0]}${(user.last_name || "")[0] || ""}` : (user?.username?.slice(0, 2) || "AW")).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold tracking-[0.14em] text-indigo-400 uppercase">
                  FACULTY WORKSPACE
                </div>
                <h1 className="text-xl font-extrabold text-white truncate mt-0.5 capitalize">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : (user?.username || user?.display_name || "aamir waqas")}
                </h1>
                <div className="text-xs text-slate-400 mt-0.5">
                  Senior Tutor · Term 2025–26
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

                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stipend: Verified ($1,450.00)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1B223B] flex items-center justify-between gap-2">
              <div className="text-xs text-slate-400">
                Faculty ID: <span className="font-mono font-semibold text-slate-200 tabular-nums">VCS-T{user?.id || "04"}</span>
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
              <button
    onClick={() => setShowDemoEmptySessions(!showDemoEmptySessions)}
    title="Toggle populated vs empty state"
    className="px-2.5 py-1 rounded-lg bg-[#161C30] hover:bg-[#1E2640] border border-[#263052] text-[11px] font-semibold text-slate-300 tabular-nums transition-colors cursor-pointer"
  >
                {filteredSessions.length} {filteredSessions.length === 1 ? "Session" : "Sessions"}
              </button>
            </div>

            {
    /* 3-Tab Segmented Control from Teacher Screenshot */
  }
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#0B0E1A] border border-[#1A2138] mb-4">
              <button
    onClick={() => {
      setSessionCategory("admin_session");
      setShowDemoEmptySessions(false);
    }}
    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all truncate cursor-pointer ${sessionCategory === "admin_session" ? "bg-[#1D2540] text-white border border-indigo-500/40" : "text-slate-400 hover:text-slate-200"}`}
  >
                Admin Session
              </button>
              <button
    onClick={() => {
      setSessionCategory("classes");
      setShowDemoEmptySessions(false);
    }}
    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 truncate cursor-pointer ${sessionCategory === "classes" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
  >
                <span>Classes</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/25 text-[10px] tabular-nums">
                  {sessions.filter((s) => s.category === "classes").length}
                </span>
              </button>
              <button
    onClick={() => {
      setSessionCategory("reserved_slots");
      setShowDemoEmptySessions(false);
    }}
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
                        <span className="text-[11px] font-mono text-slate-300 tabular-nums shrink-0">
                          {ses.attendeesCount}/{ses.maxAttendees}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-[#151B30]">
                        <span className="text-[11px] text-slate-400 truncate font-mono">
                          {ses.meetLink.replace("https://", "")}
                        </span>
                        <button
                          onClick={() => {
                            if (onStartSession && ses.rawSession) {
                              onStartSession(ses.rawSession);
                            } else if (onStartSession) {
                              onStartSession(ses);
                            } else if (ses.meetLink) {
                              window.open(ses.meetLink, "_blank", "noopener,noreferrer");
                            }
                            setLaunchedSessionId(isLaunched ? null : ses.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${isLaunched ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
                        >
                          <span>{isLaunched ? "Room Active" : "Launch Meet"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>;
  })}
              </div>}

            <div className="mt-4 pt-3 border-t border-[#171D33] flex items-center justify-between text-xs">
              <button
    onClick={onOpenNewSessionModal}
    className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
  >
                <span>+ Host Instant Class</span>
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

          {
    /* 3. Invite & Refer Widget */
  }
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
                {copiedLink ? <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </> : <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>}
              </button>
            </div>
          </div>
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
    onClick={() => onSelectTab(btn.id)}
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
              <button
    onClick={() => onSelectTab("dashboard")}
    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#161C30] border border-[#263052] text-xs font-semibold text-slate-200"
  >
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                <span>Faculty Overview</span>
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
    strokeDashoffset={2 * Math.PI * 40 * (1 - completionRate / 100)}
    strokeLinecap="round"
    fill="transparent"
  />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-extrabold text-white tabular-nums">
                      {completionRate}%
                    </span>
                    <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                      GRADED
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Rubric Evaluations</span>
                      <span className="font-mono font-bold text-indigo-400 tabular-nums">
                        {gradedCount} / {tasks.length}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#192038] overflow-hidden">
                      <div
    className="h-full bg-indigo-500 rounded-full transition-all"
    style={{ width: `${completionRate}%` }}
  />
                    </div>
                  </div>

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
                        95%
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
                    {["all", "published", "pending"].map((tab) => <button
    key={tab}
    onClick={() => setQuizFilter(tab)}
    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${quizFilter === tab ? "bg-[#5B46F8] text-white" : "text-slate-400 hover:text-slate-200"}`}
  >
                        {tab}
                      </button>)}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredQuizzes.map((qz) => <div
    key={qz.id}
    onClick={() => onSelectTab("assignments_quizzes")}
    className="p-3 rounded-xl bg-[#0C0F1D] border border-[#1B223B] hover:border-indigo-500/40 flex items-center justify-between gap-3 cursor-pointer transition-all"
  >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{qz.title}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {qz.courseTitle} · {qz.submissionsCount} submissions
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-extrabold text-white font-mono tabular-nums">
                          {qz.marks} Marks
                        </span>
                        <span
    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${qz.status === "published" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-slate-700/40 text-slate-300"}`}
  >
                          {qz.status === "published" ? "LIVE" : "DRAFT"}
                        </span>
                      </div>
                    </div>)}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-[#181F36] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Avg Score: <strong className="text-slate-200 tabular-nums">86.4%</strong>
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
                    {st}
                  </button>)}
              </div>
            </div>

            <div className="space-y-2.5">
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
                        {task.status === "graded" ? `${task.awardedMarks} / ${task.maxMarks} Marks` : `Max ${task.maxMarks} Marks`}
                      </div>
                      <div
    className={`text-[10px] font-semibold uppercase ${task.status === "graded" ? "text-emerald-400" : task.status === "overdue" ? "text-amber-400" : "text-indigo-400"}`}
  >
                        {task.status === "graded" ? "\u2713 Evaluated" : "\u25CF Queued"}
                      </div>
                    </div>

                    <button
    onClick={() => onOpenGradeModal(task)}
    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${task.status === "graded" ? "bg-[#171D33] hover:bg-[#202846] text-slate-200 border border-[#273154]" : "bg-[#5B46F8] hover:bg-[#4C38E6] text-white"}`}
  >
                      {task.status === "graded" ? "Edit Grade" : "Evaluate Rubric"}
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
                  Published curriculum frameworks and syllabus completion progress
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
                        PUBLISHED
                      </span>
                      <span className="text-[10px] font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded-md tabular-nums">
                        {course.progress}%
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
                      <span className="font-mono">{course.syllabusUnitsCompleted}/{course.syllabusTotalUnits} Units</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#171E35] overflow-hidden">
                      <div
    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
    style={{ width: `${course.progress}%` }}
  />
                    </div>
                  </div>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
