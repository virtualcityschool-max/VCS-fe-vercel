import React from "react";
import StatCard from "./StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 animate-pulse"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-slate-700 rounded-md" />
                <div className="h-2.5 bg-slate-700 rounded w-14" />
              </div>
              <div className="h-6 bg-slate-700 rounded w-10" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 animate-pulse"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-slate-700 rounded-md" />
                <div className="h-2.5 bg-slate-700 rounded w-14" />
              </div>
              <div className="h-6 bg-slate-700 rounded w-10" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
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

  const totalRevenue = analytics.revenue?.total || 0;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Row 1 — User stats (8 cards) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard
          label="Total Users"
          value={analytics.users.total}
          icon="fas fa-users"
          color="indigo"
          compact
        />
        <StatCard
          label="Admins"
          value={analytics.users.admins}
          icon="fas fa-user-shield"
          color="rose"
          compact
        />
        <StatCard
          label="Teachers"
          value={analytics.users.teachers}
          icon="fas fa-chalkboard-teacher"
          color="blue"
          compact
        />
        <StatCard
          label="Parents"
          value={analytics.users.parents}
          icon="fas fa-user-friends"
          color="purple"
          compact
        />
        <StatCard
          label="Students"
          value={analytics.users.students}
          icon="fas fa-graduation-cap"
          color="emerald"
          compact
        />
        <StatCard
          label="Active"
          value={analytics.users.active}
          icon="fas fa-user-check"
          color="emerald"
          compact
        />
        <StatCard
          label="Inactive"
          value={analytics.users.inactive}
          icon="fas fa-user-slash"
          color="amber"
          compact
        />
        {/* <StatCard
          label="Rejected"
          value={analytics.users.rejected ?? 0}
          icon="fas fa-user-times"
          color="rose"
          compact
        /> */}
      </div>

      {/* Row 2 — Course stats (2 cards) */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total Courses"
          value={analytics.courses.total}
          icon="fas fa-book"
          color="purple"
          compact
        />
        <StatCard
          label="Total Enrollments"
          value={analytics.enrollments.total}
          icon="fas fa-user-plus"
          color="amber"
          compact
        />
      </div>

      {/* Charts — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Course */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-coins text-amber-400 text-sm"></i>
              </div>
              Revenue by Course
            </h3>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Total Revenue</p>
              <p className="text-base font-bold text-amber-400">
                PKR {totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 ml-11 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
              Earned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
              Lost
            </span>
          </div>

          {revenueData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <i className="fas fa-coins text-slate-500 text-lg"></i>
              </div>
              <p className="text-slate-400 text-sm">No revenue data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={revenueData}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value, name) => [`PKR ${value.toLocaleString()}`, name]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.fullName || label
                  }
                />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lost Revenue" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Enrollments by Course */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
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
          <p className="text-xs text-slate-500 mb-4 ml-11">
            Active students enrolled per course
          </p>

          {enrollmentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <i className="fas fa-user-graduate text-slate-500 text-lg"></i>
              </div>
              <p className="text-slate-400 text-sm">No enrollment data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={enrollmentData}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 10 }} />
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
    </div>
  );
};

export default OverviewTab;
