import React from "react";
import StatCard from "./StatCard";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Truncate long course names for axis labels
const truncate = (str, n = 12) =>
  str?.length > n ? str.slice(0, n) + "…" : str;

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
  },
  labelStyle: { color: "#e2e8f0" },
  itemStyle: { color: "#e2e8f0" },
};

const OverviewTab = ({ analytics, analyticsLoading, analyticsError }) => {
  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-slate-700 rounded w-20" />
                <div className="w-12 h-12 bg-slate-700 rounded-xl" />
              </div>
              <div className="h-8 bg-slate-700 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-6 bg-slate-700 rounded w-32 mb-4" />
              <div className="h-64 bg-slate-700 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-exclamation-triangle text-rose-400 text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Unable to Load Dashboard
        </h3>
        <p className="text-slate-400 text-center mb-6 max-w-md">
          {analyticsError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition flex items-center gap-2"
        >
          <i className="fas fa-redo"></i>
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  const revenueData = (analytics.revenue?.by_course || []).map((item) => ({
    name: truncate(item.course),
    fullName: item.course,
    Revenue: item.revenue,
    "Lost Revenue": item.lost_revenue,
  }));

  const enrollmentData = (analytics.enrollments?.by_course || []).map(
    (item) => ({
      name: truncate(item.course),
      fullName: item.course,
      Students: item.students,
    }),
  );

  const userPieData = [
    { name: "Students", value: analytics.users.students, color: "#10b981" },
    { name: "Teachers", value: analytics.users.teachers, color: "#8b5cf6" },
    { name: "Parents", value: analytics.users.parents, color: "#f59e0b" },
    { name: "Admins", value: analytics.users.admins, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={analytics.users.total}
          icon="fas fa-users"
          trend={12}
          color="indigo"
        />
        <StatCard
          label="Students"
          value={analytics.users.students}
          icon="fas fa-graduation-cap"
          trend={8}
          color="emerald"
        />
        <StatCard
          label="Total Courses"
          value={analytics.courses.total}
          icon="fas fa-book"
          trend={15}
          color="purple"
        />
        <StatCard
          label="Total Revenue"
          value={`PKR ${(analytics.revenue?.total || 0).toLocaleString()}`}
          icon="fas fa-chart-line"
          trend={23}
          color="amber"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          label="Teachers"
          value={analytics.users.teachers}
          icon="fas fa-chalkboard-teacher"
          color="blue"
        />
        <StatCard
          label="Parents"
          value={analytics.users.parents}
          icon="fas fa-user-friends"
          color="rose"
        />
        <StatCard
          label="Active Users"
          value={analytics.users.active}
          icon="fas fa-user-check"
          trend={5}
          color="emerald"
        />
        <StatCard
          label="Enrollments"
          value={analytics.enrollments.total}
          icon="fas fa-user-plus"
          trend={18}
          color="purple"
        />
      </div>

      {/* User Distribution + Course Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Pie */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-pie text-indigo-400 text-sm"></i>
            </div>
            User Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={userPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {userPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: "#94a3b8" }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Course Status Bar */}
        {/* <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-bar text-purple-400 text-sm"></i>
            </div>
            Course Status
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                {
                  name: "Published",
                  value: analytics.courses.published,
                  color: "#10b981",
                },
                {
                  name: "Draft",
                  value: analytics.courses.draft,
                  color: "#6b7280",
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {[{ color: "#10b981" }, { color: "#6b7280" }].map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      {/* Revenue by Course */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-coins text-amber-400 text-sm"></i>
            </div>
            Revenue by Course
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
              Earned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
              Lost
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-5 ml-11">
          Active enrollment revenue vs cancelled/lost revenue per course
        </p>

        {revenueData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <i className="fas fa-coins text-slate-500 text-lg"></i>
            </div>
            <p className="text-slate-400 text-sm">No revenue data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={revenueData}
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value, name) => [
                  `PKR ${value.toLocaleString()}`,
                  name,
                ]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.fullName || label
                }
              />
              <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="Lost Revenue"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Enrollments by Course */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-graduate text-indigo-400 text-sm"></i>
            </div>
            Enrollments by Course
          </h3>
          <span className="text-xs text-slate-400">
            {analytics.enrollments.active} active /{" "}
            {analytics.enrollments.cancelled} cancelled
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-5 ml-11">
          Number of active students enrolled per course
        </p>

        {enrollmentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <i className="fas fa-user-graduate text-slate-500 text-lg"></i>
            </div>
            <p className="text-slate-400 text-sm">
              No enrollment data available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={enrollmentData}
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#94a3b8"
                allowDecimals={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => [value, "Students"]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.fullName || label
                }
              />
              <Bar dataKey="Students" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
