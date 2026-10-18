import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  Users,
  Award
} from "lucide-react";
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return <div className="bg-[#0B0E1B] border border-[#222C4A] rounded-xl p-3 shadow-2xl text-xs">
        <p className="font-bold text-white mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold text-white tabular-nums">
                {entry.value}
                {entry.unit || (entry.name.includes("%") || entry.name.toLowerCase().includes("score") || entry.name.toLowerCase().includes("attendance") ? "%" : "")}
              </span>
            </div>)}
        </div>
      </div>;
  }
  return null;
};
const isPresent = (s) => s === "present" || s === "attended";
const DIST_BUCKETS = [
  { name: "80–100%", min: 80, color: "#10B981" },
  { name: "60–79%", min: 60, color: "#6366F1" },
  { name: "40–59%", min: 40, color: "#F59E0B" },
  { name: "Below 40%", min: -1, color: "#EF4444" }
];
const weekStart = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
const EmptyChart = ({ text }) => <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center px-6">{text}</div>;

export const PerformanceAnalyticsView = ({
  courses,
  quizzes = [],
  attendance = [],
  attendanceRecords = [],
  assignments = [],
  onBackToDashboard,
  timezone
}) => {
  const [selectedCohort, setSelectedCohort] = useState("all");
  const inCohort = (title) => selectedCohort === "all" || title === selectedCohort;
  const cohortCourseIds = new Set(courses.filter((c) => inCohort(c.title)).map((c) => String(c.id)));

  const records = attendanceRecords.filter(
    (r) => r.participant_role === "student" && r.status && cohortCourseIds.has(String(r.course_id))
  );
  const avgAttendance = records.length
    ? Math.round(records.reduce((a, r) => a + (isPresent(r.status) ? 1 : r.status === "late" ? 0.5 : 0), 0) / records.length * 100)
    : null;

  // Weekly attendance for the last 8 weeks that had classes
  const weekMap = new Map();
  records.forEach((r) => {
    if (!r.scheduled_at) return;
    const wk = weekStart(r.scheduled_at).getTime();
    const w = weekMap.get(wk) || { total: 0, score: 0 };
    w.total += 1;
    w.score += isPresent(r.status) ? 1 : r.status === "late" ? 0.5 : 0;
    weekMap.set(wk, w);
  });
  const trend = [...weekMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .slice(-8)
    .map(([wk, w]) => ({
      week: new Date(wk).toLocaleDateString([], { day: "2-digit", month: "short" }),
      attendance: Math.round(w.score / w.total * 100)
    }));

  const cohortRows = attendance.filter((r) => inCohort(r.course) && r.attendanceRate != null);
  const bucketOf = (rate) => DIST_BUCKETS.findIndex((b) => rate >= b.min);
  const distribution = DIST_BUCKETS.map((b, i) => ({
    ...b,
    count: cohortRows.filter((r) => bucketOf(r.attendanceRate) === i).length
  }));
  const distTotal = distribution.reduce((a, b) => a + b.count, 0);

  const cohortQuizzes = quizzes.filter((q) => inCohort(q.courseTitle));
  const quizData = cohortQuizzes
    .filter((q) => typeof q.averageScore === "number")
    .map((q) => ({
      title: q.title,
      averageScorePct: Math.round(q.averageScore * 10) / 10,
      topScorePct: Math.round((q.topScore ?? 0) * 10) / 10
    }));
  const quizAvg = quizData.length ? quizData.reduce((a, q) => a + q.averageScorePct, 0) / quizData.length : null;
  const best = quizData.reduce((acc, q) => (!acc || q.averageScorePct > acc.averageScorePct ? q : acc), null);
  const markedSubmissions = cohortQuizzes.reduce((a, q) => a + (q.submissions || []).filter((s) => s.status === "reviewed").length, 0);

  const cohortStudents = courses.filter((c) => inCohort(c.title)).reduce((a, c) => a + (c.enrolledCount || 0), 0);
  const cohortAssignments = assignments.filter((a) => inCohort(a.courseTitle));
  const assignmentSubs = cohortAssignments.reduce((a, x) => a + (x.submissionsCount || 0), 0);

  return <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg">
        <div>
          <div className="text-xs font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>PERFORMANCE ANALYTICS</span>
            {timezone && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#1B223C] text-xs text-slate-300 font-mono border border-[#283256]">{timezone}</span>}
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Performance & Attendance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Built from your classes' real attendance records and quiz results.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
    value={selectedCohort}
    onChange={(e) => setSelectedCohort(e.target.value)}
    className="px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
  >
            <option value="all">All my courses ({courses.length})</option>
            {courses.map((c) => <option key={c.id} value={c.title}>
                {c.title}
              </option>)}
          </select>
          <button
    onClick={onBackToDashboard}
    className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
  >
            ← Back to Bento Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540]">
          <div className="text-xs text-slate-400">Average Attendance</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono tabular-nums">{avgAttendance != null ? `${avgAttendance}%` : "—"}</div>
          <div className="text-xs text-slate-400 mt-1">{records.length} student attendance records</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540]">
          <div className="text-xs text-slate-400">Quiz Average</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono tabular-nums">{quizAvg != null ? `${quizAvg.toFixed(1)}%` : "—"}</div>
          <div className="text-xs text-slate-400 mt-1">Across {quizData.length} marked {quizData.length === 1 ? "quiz" : "quizzes"}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540]">
          <div className="text-xs text-slate-400">Assignments</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono tabular-nums">{cohortAssignments.length}</div>
          <div className="text-xs text-slate-400 mt-1">{assignmentSubs} submissions received</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Enrolled Students</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono tabular-nums">{cohortStudents}</div>
          <div className="text-xs text-slate-400 mt-1">In {cohortCourseIds.size} {cohortCourseIds.size === 1 ? "course" : "courses"}</div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#101424] border border-[#1E2540] shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Weekly Attendance</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">Share of students present each week (late counts as half).</p>
        <div className="h-72 w-full">
          {trend.length === 0 ? <EmptyChart text="No attendance has been recorded for these classes yet." /> : <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" vertical={false} />
                <XAxis dataKey="week" stroke="#64748B" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                <YAxis stroke="#64748B" tick={{ fill: "#94A3B8", fontSize: 12 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="attendance" name="Attendance" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAttendance)" />
              </AreaChart>
            </ResponsiveContainer>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#101424] border border-[#1E2540] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Students by Attendance</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">How many students fall into each attendance band.</p>
            <div className="h-56 relative flex items-center justify-center">
              {distTotal === 0 ? <EmptyChart text="No attendance has been recorded yet." /> : <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />
                      <Pie data={distribution.filter((d) => d.count > 0)} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5}>
                        {distribution.filter((d) => d.count > 0).map((entry) => <Cell key={entry.name} fill={entry.color} stroke="#101424" strokeWidth={2} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-extrabold text-white font-mono tabular-nums">{distTotal}</span>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Students</span>
                  </div>
                </>}
            </div>
          </div>
          <div className="space-y-2.5 pt-3 border-t border-[#181F36]">
            {distribution.map((item) => <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white font-bold tabular-nums">{item.count}</span>
                  <span className="text-slate-500 tabular-nums">({distTotal ? Math.round(item.count / distTotal * 100) : 0}%)</span>
                </div>
              </div>)}
          </div>
        </div>

        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#101424] border border-[#1E2540] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Quiz Results</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Average and top score (%) for each quiz with marked submissions.</p>
            <div className="h-64 w-full">
              {quizData.length === 0 ? <EmptyChart text="No marked quiz submissions yet." /> : <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quizData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" vertical={false} />
                    <XAxis dataKey="title" stroke="#64748B" tick={{ fill: "#94A3B8", fontSize: 12 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis stroke="#64748B" tick={{ fill: "#94A3B8", fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="averageScorePct" name="Average Score (%)" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="topScorePct" name="Top Score (%)" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>}
            </div>
          </div>
          <div className="pt-3 border-t border-[#181F36] flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span>
              Highest average: <strong className="text-emerald-400">{best ? `${best.title} (${best.averageScorePct}%)` : "—"}</strong>
            </span>
            <span className="font-mono tabular-nums">{markedSubmissions} submissions marked</span>
          </div>
        </div>
      </div>
    </div>;
};
