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
  Award,
  CheckCircle2
} from "lucide-react";
const ENGAGEMENT_TREND_DATA = [
  { week: "W1 (Sep 08)", liveAttendance: 88, quizParticipation: 75, resourceViews: 140 },
  { week: "W2 (Sep 15)", liveAttendance: 92, quizParticipation: 82, resourceViews: 195 },
  { week: "W3 (Sep 22)", liveAttendance: 85, quizParticipation: 80, resourceViews: 210 },
  { week: "W4 (Sep 29)", liveAttendance: 94, quizParticipation: 89, resourceViews: 260 },
  { week: "W5 (Oct 06)", liveAttendance: 96, quizParticipation: 92, resourceViews: 310 },
  { week: "Current (W6)", liveAttendance: 95, quizParticipation: 94, resourceViews: 345 }
];
const PROGRESS_DISTRIBUTION_DATA = [
  { name: "80\u2013100% Advanced", count: 9, percentage: 43, color: "#10B981" },
  { name: "60\u201379% On Track", count: 7, percentage: 33, color: "#6366F1" },
  { name: "40\u201359% Moderate", count: 3, percentage: 14, color: "#F59E0B" },
  { name: "<40% Attention Needed", count: 2, percentage: 10, color: "#EF4444" }
];
const QUIZ_PERFORMANCE_DATA = [
  {
    title: "General Knowledge Diagnostic",
    course: "University Prep",
    averageScorePct: 85,
    topScorePct: 100,
    passingBenchmark: 70,
    submissions: 18
  },
  {
    title: "Thermal Physics & Gases",
    course: "O/A Level Physics",
    averageScorePct: 86,
    topScorePct: 95,
    passingBenchmark: 65,
    submissions: 24
  },
  {
    title: "Calculus Timed Drill",
    course: "IGCSE Mathematics",
    averageScorePct: 78.5,
    topScorePct: 93,
    passingBenchmark: 65,
    submissions: 16
  },
  {
    title: "Kinematics Vectors Checkpoint",
    course: "O/A Level Physics",
    averageScorePct: 91.2,
    topScorePct: 100,
    passingBenchmark: 70,
    submissions: 21
  },
  {
    title: "Classical Arabic Nahw Rules",
    course: "Arabic & Tajweed",
    averageScorePct: 88,
    topScorePct: 98,
    passingBenchmark: 60,
    submissions: 14
  }
];
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
export const PerformanceAnalyticsView = ({
  courses,
  quizzes,
  onBackToDashboard,
  timezone
}) => {
  const [selectedCohort, setSelectedCohort] = useState("all");
  const [timeRange, setTimeRange] = useState("term");
  return <div className="space-y-6">
      {
    /* Top Banner & Control Deck */
  }
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>LEARNING ANALYTICS ENGINE</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Performance & Engagement Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic telemetry across live lecture attendance, syllabus pacing, and cohort diagnostic test outcomes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {
    /* Cohort Selector */
  }
          <select
    value={selectedCohort}
    onChange={(e) => setSelectedCohort(e.target.value)}
    className="px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
  >
            <option value="all">All Cohorts (4 Active Courses)</option>
            {courses.map((c) => <option key={c.id} value={c.title}>
                {c.title}
              </option>)}
          </select>

          {
    /* Timeframe Selector */
  }
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0E1A] border border-[#1A2138]">
            {["30d", "term", "all"].map((r) => <button
    key={r}
    onClick={() => setTimeRange(r)}
    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${timeRange === r ? "bg-[#5B46F8] text-white" : "text-slate-400 hover:text-slate-200"}`}
  >
                {r === "30d" ? "Last 30 Days" : r === "term" ? "Term 2025\u201326" : "Full Year"}
              </button>)}
          </div>

          <button
    onClick={onBackToDashboard}
    className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
  >
            ← Back to Bento Dashboard
          </button>
        </div>
      </div>

      {
    /* KPI Cards Strip */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Attendance</span>
            <span className="text-emerald-400 font-bold font-mono">+4.2%</span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono tabular-nums">94.8%</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Consistently nominal in {timezone}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cohort Quiz Average</span>
            <span className="text-indigo-400 font-bold font-mono">+6.8%</span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono tabular-nums">85.7%</div>
          <div className="text-[11px] text-slate-400 mt-1">Across {quizzes?.length || 5} timed diagnostic checks</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Syllabus Completion</span>
            <span className="text-emerald-400 font-bold font-mono">Paced</span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono tabular-nums">68.7%</div>
          <div className="text-[11px] text-slate-400 mt-1">36 of 51 syllabus modules delivered</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Student Cohort</span>
            <span className="text-cyan-400 font-bold font-mono">21 Active</span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono tabular-nums">100%</div>
          <div className="text-[11px] text-slate-400 mt-1">Tuition in good academic standing</div>
        </div>
      </div>

      {
    /* Row 1: Course Engagement Trends (Recharts Area Chart) */
  }
      <div className="p-5 rounded-2xl bg-[#101424] border border-[#1E2540] shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Course Engagement & Pacing Trends</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Weekly synchronous attendance rate, diagnostic quiz participation, and lesson resource activity.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Live Attendance (%)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Quiz Participation (%)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Resource Views</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ENGAGEMENT_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" vertical={false} />
              <XAxis dataKey="week" stroke="#64748B" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fill: "#94A3B8", fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
    type="monotone"
    dataKey="liveAttendance"
    name="Live Attendance"
    stroke="#10B981"
    strokeWidth={2.5}
    fillOpacity={1}
    fill="url(#colorAttendance)"
  />
              <Area
    type="monotone"
    dataKey="quizParticipation"
    name="Quiz Participation"
    stroke="#6366F1"
    strokeWidth={2.5}
    fillOpacity={1}
    fill="url(#colorQuizzes)"
  />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {
    /* Row 2: Two-Column Split (Student Progress Distribution + Quiz Average Performance) */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {
    /* Left: Student Progress Distribution (Recharts Pie & Horizontal Bars) */
  }
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#101424] border border-[#1E2540] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Student Progress Distribution</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown of total enrolled cohort by syllabus milestones and assignment submission pace.
            </p>

            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
    data={PROGRESS_DISTRIBUTION_DATA}
    dataKey="count"
    nameKey="name"
    cx="50%"
    cy="50%"
    innerRadius={55}
    outerRadius={80}
    paddingAngle={5}
  >
                    {PROGRESS_DISTRIBUTION_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="#101424" strokeWidth={2} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-white font-mono tabular-nums">21</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Learners</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[#181F36]">
            {PROGRESS_DISTRIBUTION_DATA.map((item) => <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white font-bold tabular-nums">{item.count}</span>
                  <span className="text-slate-500 tabular-nums">({item.percentage}%)</span>
                </div>
              </div>)}
          </div>
        </div>

        {
    /* Right: Quiz Average Performance (Recharts Bar Chart) */
  }
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#101424] border border-[#1E2540] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Quiz Average Performance</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Benchmark: 65% Passing
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Comparison of cohort average score (%) versus top achieved marks across published diagnostic tests.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={QUIZ_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2642" vertical={false} />
                  <XAxis
    dataKey="title"
    stroke="#64748B"
    tick={{ fill: "#94A3B8", fontSize: 10 }}
    interval={0}
    angle={-15}
    textAnchor="end"
  />
                  <YAxis stroke="#64748B" tick={{ fill: "#94A3B8", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
    dataKey="averageScorePct"
    name="Cohort Average Score (%)"
    fill="#6366F1"
    radius={[6, 6, 0, 0]}
  />
                  <Bar
    dataKey="topScorePct"
    name="Top Cohort Score (%)"
    fill="#10B981"
    radius={[6, 6, 0, 0]}
  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#181F36] flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span>
              Highest Scoring Test: <strong className="text-emerald-400">Kinematics Vectors Checkpoint (91.2%)</strong>
            </span>
            <span className="font-mono tabular-nums">93 Total Submissions Evaluated</span>
          </div>
        </div>
      </div>
    </div>;
};
