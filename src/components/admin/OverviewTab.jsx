import React from "react";
import StatCard from "./StatCard";
import {
  LineChart,
  Line,
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
  Legend,
  ResponsiveContainer,
} from "recharts";

const OverviewTab = ({
  analytics,
  analyticsLoading,
  analyticsError,
  enrollmentAnalytics,
  enrollmentAnalyticsLoading,
  enrollmentAnalyticsError,
}) => {
  // Extract chart data and courses from enrollment analytics
  const enrollmentChartData = enrollmentAnalytics?.chartData || [];
  const enrollmentCourses = enrollmentAnalytics?.courses || [];

  // Debug logging
  console.log("🔍 OverviewTab - enrollmentAnalytics:", enrollmentAnalytics);
  console.log("🔍 OverviewTab - enrollmentChartData:", enrollmentChartData);
  console.log("🔍 OverviewTab - enrollmentCourses:", enrollmentCourses);

  // Generate colors for courses
  const courseColors = [
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
    "#84cc16",
  ];

  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-slate-700 rounded w-20"></div>
                <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
              </div>
              <div className="h-8 bg-slate-700 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-32 mb-4"></div>
            <div className="h-64 bg-slate-700 rounded-xl"></div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-32 mb-4"></div>
            <div className="h-64 bg-slate-700 rounded-xl"></div>
          </div>
        </div>

        {/* Enrollment Chart Skeleton */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-40 mb-4"></div>
          <div className="h-80 bg-slate-700 rounded-xl"></div>
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
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
        >
          <i className="fas fa-redo"></i>
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

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
          label="Active Students"
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
          label="Revenue"
          value={`PKR ${analytics.revenue.estimated}`}
          icon="fas fa-chart-line"
          trend={23}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-pie text-indigo-400 text-sm"></i>
            </div>
            User Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Students",
                    value: analytics.users.students,
                    color: "#10b981",
                  },
                  {
                    name: "Teachers",
                    value: analytics.users.teachers,
                    color: "#8b5cf6",
                  },
                  {
                    name: "Parents",
                    value: analytics.users.parents,
                    color: "#f59e0b",
                  },
                  {
                    name: "Admins",
                    value: analytics.users.admins,
                    color: "#ef4444",
                  },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {[
                  {
                    name: "Students",
                    value: analytics.users.students,
                    color: "#10b981",
                  },
                  {
                    name: "Teachers",
                    value: analytics.users.teachers,
                    color: "#8b5cf6",
                  },
                  {
                    name: "Parents",
                    value: analytics.users.parents,
                    color: "#f59e0b",
                  },
                  {
                    name: "Admins",
                    value: analytics.users.admins,
                    color: "#ef4444",
                  },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend wrapperStyle={{ color: "#94a3b8" }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Course Status Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-bar text-purple-400 text-sm"></i>
            </div>
            Course Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
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
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {[
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
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats Grid */}
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

      {/* Enrollment Activity Chart */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-area text-emerald-400 text-sm"></i>
          </div>
          Enrollment Overview
        </h3>

        {enrollmentAnalyticsLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-sm">
              Loading enrollment data...
            </p>
          </div>
        ) : enrollmentAnalyticsError ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-exclamation-triangle text-rose-400 text-lg"></i>
            </div>
            <p className="text-slate-400 text-sm text-center">
              {enrollmentAnalyticsError}
            </p>
          </div>
        ) : enrollmentChartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-12 h-12 bg-slate-500/20 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-chart-area text-slate-400 text-lg"></i>
            </div>
            <p className="text-slate-400 text-sm text-center">
              No enrollment data available for the current year
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={enrollmentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend wrapperStyle={{ color: "#94a3b8" }} />
              {enrollmentCourses.map((course, index) => (
                <Area
                  key={course}
                  type="monotone"
                  dataKey={course}
                  stackId="1"
                  stroke={courseColors[index % courseColors.length]}
                  fill={courseColors[index % courseColors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
