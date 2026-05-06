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

// ── Stat card with hover tooltip breakdown ───────────────────────────────────
const StatCardTip = ({ label, value, icon, color, items }) => {
  const colorClasses = {
    indigo: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/20 to-amber-600/20 border-amber-500/20 text-amber-400",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/20 text-purple-400",
    rose: "from-rose-500/20 to-rose-600/20 border-rose-500/20 text-rose-400",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-400",
    pink: "from-pink-500/20 to-pink-600/20 border-pink-500/20 text-pink-400"
  };
  return (
    <div className="relative">
      <div className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} rounded-xl px-4 py-4 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default`}>
        <div className="absolute top-0 right-0 w-14 h-14 bg-white/5 rounded-full -mr-6 -mt-6" />
        <div className="relative z-10 flex items-center gap-2.5 mb-2.5">
          <div className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center flex-shrink-0">
            <i className={`${icon} text-sm`} />
          </div>
          <p className="text-[10px] uppercase tracking-wider opacity-80 leading-tight">{label}</p>
        </div>
        <h3 className="text-2xl font-bold leading-none">{value}</h3>
      </div>

      {/* Info icon lives outside overflow-hidden so the tooltip isn't clipped */}
      {items?.length > 0 && (
        <div className="group/tip absolute top-2.5 right-2.5 z-20">
          <i className="fas fa-info-circle text-sm opacity-50 hover:opacity-100 cursor-pointer transition-opacity" />
          <div className="pointer-events-none absolute top-full right-0 mt-2 z-30 opacity-0 group-hover/tip:opacity-100 translate-y-[-4px] group-hover/tip:translate-y-0 transition-all duration-150 min-w-[160px]">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3">
              {items.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-1 first:pt-0 last:pb-0">
                  <span className="text-slate-400 text-xs whitespace-nowrap">{item.label}</span>
                  <span className={`text-xs font-bold tabular-nums ${item.color || "text-white"}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="absolute bottom-full right-3 border-4 border-transparent border-b-slate-700" />
          </div>
        </div>
      )}
    </div>
  );
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
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
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
      {/* Row 1 — User stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCardTip
          label="Total Users"
          value={analytics.users.total}
          icon="fas fa-users"
          color="indigo"
          items={[
            { label: "Active",   value: analytics.users.active,            color: "text-emerald-400" },
            { label: "Inactive", value: analytics.users.inactive,          color: "text-amber-400"   },
            { label: "Rejected", value: analytics.users.rejected ?? 0,     color: "text-rose-400"    },
          ]}
        />
        <StatCard label="Admins"    value={analytics.users.admins}    icon="fas fa-user-shield"         color="rose"    compact />
        <StatCard label="Teachers"  value={analytics.users.teachers}  icon="fas fa-chalkboard-teacher"  color="pink"    compact />
        <StatCard label="Parents"   value={analytics.users.parents}   icon="fas fa-user-friends"        color="amber"  compact />
        <StatCard label="Students"  value={analytics.users.students}  icon="fas fa-graduation-cap"      color="emerald" compact />
        <StatCardTip
          label="Total Courses"
          value={analytics.courses.total}
          icon="fas fa-book"
          color="purple"
          items={[
            { label: "Total Enrollments", value: analytics.enrollments.total, color: "text-white" },
            ...(analytics.enrollments?.by_course || []).map((c) => ({
              label: c.course?.length > 20 ? c.course.slice(0, 20) + "…" : c.course,
              value: c.students,
              color: "text-indigo-400",
            })),
          ]}
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
          {/* <div className="flex items-center gap-4 text-xs text-slate-400 ml-11 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
              Earned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
              Lost
            </span>
          </div> */}

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
                <XAxis interval={0} hide={true} dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                />
                <Tooltip
                  {...tooltipStyle}
                  cursor={false}
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
                <XAxis interval={0} hide={true} dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  {...tooltipStyle}
                  cursor={false}
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
