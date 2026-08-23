import React from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";
import { useDateFormatters, useDateFormat } from "../../hooks";
import TeacherSessionCard from "../sessions/TeacherSessionCard";
import { handleJoinSession } from "../../utils/helper/StartSession";
import { getDisplayName } from "../../utils/userDisplay";

// Icon/color per Recent Activity item kind
const ACTIVITY_STYLE = {
  approval: { icon: "fa-user-clock", bg: "bg-amber-500/15", text: "text-amber-400" },
  enrollment: { icon: "fa-user-graduate", bg: "bg-indigo-500/15", text: "text-indigo-400" },
  "free-access": { icon: "fa-hand-holding-heart", bg: "bg-purple-500/15", text: "text-purple-400" },
  "child-link": { icon: "fa-link", bg: "bg-emerald-500/15", text: "text-emerald-400" },
};

// ── Stat card with hover tooltip breakdown ───────────────────────────────────
const StatCardTip = ({ label, value, icon, color, items, onClick }) => {
  const colorClasses = {
    indigo:
      "from-indigo-500/20 to-indigo-600/20 border-indigo-500/20 text-indigo-400",
    emerald:
      "from-emerald-500/20 to-emerald-600/20 border-emerald-500/20 text-emerald-400",
    amber:
      "from-amber-500/20 to-amber-600/20 border-amber-500/20 text-amber-400",
    purple:
      "from-purple-500/20 to-purple-600/20 border-purple-500/20 text-purple-400",
    rose: "from-rose-500/20 to-rose-600/20 border-rose-500/20 text-rose-400",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-400",
    pink: "from-pink-500/20 to-pink-600/20 border-pink-500/20 text-pink-400",
  };
  return (
    <div className="relative group/tip">
      <div
        onClick={onClick}
        className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} rounded-xl px-4 py-4 border backdrop-blur-sm transition-all duration-300 group-hover/tip:scale-[1.02] group-hover/tip:shadow-lg ${onClick ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="absolute top-0 right-0 w-14 h-14 bg-white/5 rounded-full -mr-6 -mt-6" />
        <div className="relative z-10 flex items-center gap-2.5 mb-2.5">
          <div className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center flex-shrink-0">
            <i className={`${icon} text-sm`} />
          </div>
          <p className="text-[10px] uppercase tracking-wider opacity-80 leading-tight">
            {label}
          </p>
        </div>
        <h3 className="text-2xl font-bold leading-none">{value}</h3>
      </div>

      {/* Info icon and tooltip breakdown */}
      {items?.length > 0 && (
        <div className="absolute top-2.5 right-2.5 z-20 group/info">
          <i className="fas fa-info-circle text-sm opacity-40 group-hover/info:opacity-100 cursor-pointer transition-opacity" />
          <div className="pointer-events-auto absolute top-full right-0 mt-2 z-40 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible translate-y-[-4px] group-hover/info:translate-y-0 transition-all duration-200 min-w-[200px]">
            <div className="absolute bottom-full right-3 border-4 border-transparent border-b-slate-900/95" />
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
              <div className="max-h-[180px] overflow-y-auto custom-scrollbar p-3">
                {items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 py-1.5 first:pt-0 last:pb-0 border-b border-slate-700/30 last:border-0"
                  >
                    <span className="text-slate-400 text-xs whitespace-nowrap">
                      {item.label}
                    </span>
                    <span
                      className={`text-xs font-bold tabular-nums ${item.color || "text-white"}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const USER_FILTERS_BASE = { search: "", is_active: "", ordering: "-date_joined" };
const toUsersTab = (navigate, role = "") =>
  () => navigate("/admin/users", { state: { filters: { ...USER_FILTERS_BASE, role }, skipFetch: true } });


const OverviewTab = ({
  analytics,
  analyticsLoading,
  analyticsError,
  upcomingSessions = [],
  sessionsLoading = false,
  actionLoadingIds = new Set(),
  onStartSession,
  onEndSession,
  recentActivity = [],
}) => {
  const navigate = useNavigate();
  const { formatDate } = useDateFormatters();
  const { formatRelativeTime } = useDateFormat();
  const SessionsSection = (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-user-clock text-indigo-400 text-xs"></i>
          </div>
          Upcoming Tutor Meetings
        </h3>
        <button
          onClick={() => navigate("/admin/teacher-planner")}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
        >
          View all <i className="fas fa-arrow-right text-[10px]"></i>
        </button>
      </div>
      {sessionsLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : upcomingSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 bg-slate-900/40 border border-white/5 rounded-3xl">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <i className="fas fa-calendar-times text-slate-500 text-base"></i>
          </div>
          <p className="text-slate-400 text-sm">No meetings planned</p>
          <button
            onClick={() => navigate("/admin/teacher-planner")}
            className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            Schedule one →
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {upcomingSessions.map((session) => (
            <TeacherSessionCard
              key={session.id}
              session={session}
              isLoading={actionLoadingIds.has(session.id)}
              onStart={(s) => onStartSession?.(session)}
              onJoin={(s) => handleJoinSession(s.id, s.meeting_link, s.scheduled_at || s.scheduled_at)}
              onEnd={(s) => onEndSession?.(s.id)}
              subtitle={
                session.invited_teachers?.length > 0 ? (
                  <>
                    <i className="fas fa-users text-indigo-500/50" />
                    {session.invited_teachers.map((t) => getDisplayName(t)).join(", ")}
                  </>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );

  if (analyticsLoading) {
    return (
      <div className="space-y-4">
        {SessionsSection}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
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
      <div className="space-y-4">
        {SessionsSection}
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
      </div>
    );
  }

  if (!analytics) return <div className="space-y-4">{SessionsSection}</div>;

  const totalRevenue = analytics.revenue?.total || 0;

  // Merge revenue-by-course and enrollments-by-course (same source as the
  // old two separate charts) into one ranked list, top 6 by revenue.
  const courseMap = new Map();
  (analytics.revenue?.by_course || []).forEach((item) => {
    courseMap.set(item.course, { name: item.course, revenue: item.revenue || 0, students: 0 });
  });
  (analytics.enrollments?.by_course || []).forEach((item) => {
    const existing = courseMap.get(item.course);
    if (existing) existing.students = item.students || 0;
    else courseMap.set(item.course, { name: item.course, revenue: 0, students: item.students || 0 });
  });
  const topCourses = Array.from(courseMap.values())
    .sort((a, b) => b.revenue - a.revenue || b.students - a.students)
    .slice(0, 6);
  const totalRankedRevenue = topCourses.reduce((sum, c) => sum + c.revenue, 0);
  const rankMetricMax = Math.max(
    ...topCourses.map((c) => (totalRankedRevenue > 0 ? c.revenue : c.students)),
    1,
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Row 1 - User stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 stagger-children">
        <StatCardTip
          label="Total Users"
          value={analytics.users.total}
          icon="fas fa-users"
          color="indigo"
          onClick={toUsersTab(navigate)}
          items={[
            {
              label: "Active",
              value: analytics.users.active,
              color: "text-emerald-400",
            },
            {
              label: "Inactive",
              value: analytics.users.inactive,
              color: "text-amber-400",
            },
            {
              label: "Rejected",
              value: analytics.users.rejected ?? 0,
              color: "text-rose-400",
            },
          ]}
        />
        <StatCard
          label="Admins"
          value={analytics.users.admins}
          icon="fas fa-user-shield"
          color="rose"
          compact
          onClick={toUsersTab(navigate, "admin")}
        />
        <StatCard
          label="Tutors"
          value={analytics.users.teachers}
          icon="fas fa-chalkboard-teacher"
          color="pink"
          compact
          onClick={toUsersTab(navigate, "teacher")}
        />
        <StatCard
          label="Guardians"
          value={analytics.users.parents}
          icon="fas fa-user-friends"
          color="amber"
          compact
          onClick={toUsersTab(navigate, "parent")}
        />
        <StatCard
          label="Students"
          value={analytics.users.students}
          icon="fas fa-graduation-cap"
          color="emerald"
          compact
          onClick={toUsersTab(navigate, "student")}
        />
        <StatCardTip
          label="Total Courses"
          value={analytics.courses.total}
          icon="fas fa-book"
          color="purple"
          onClick={() => navigate("/admin/courses")}
          items={[
            {
              label: "Total Enrollments",
              value:
                analytics.enrollments.active +
                analytics.enrollments.cancelled +
                analytics.enrollments.pending +
                analytics.enrollments.rejected,
              color: "text-white",
            },
            {
              label: "Active",
              value: analytics.enrollments.active,
              color: "text-white",
            },
            {
              label: "Cancelled",
              value: analytics.enrollments.cancelled,
              color: "text-white",
            },
            {
              label: "Pending",
              value: analytics.enrollments.pending,
              color: "text-white",
            },
            {
              label: "Rejected",
              value: analytics.enrollments.rejected,
              color: "text-white",
            },
          ]}
        />
      </div>

      {SessionsSection}

      {/* Recent Activity + Top Courses - side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-bolt text-indigo-400 text-sm"></i>
            </div>
            Recent Activity
          </h3>
          <p className="text-xs text-slate-500 mb-4 ml-11">
            What's newly waiting on you, newest first
          </p>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <i className="fas fa-check text-slate-500 text-lg"></i>
              </div>
              <p className="text-slate-400 text-sm">All caught up - nothing new to review</p>
            </div>
          ) : (
            <div>
              {recentActivity.map((item) => {
                const style = ACTIVITY_STYLE[item.kind] || ACTIVITY_STYLE.approval;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 py-2.5 border-b border-slate-800/50 last:border-0"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${style.bg}`}>
                      <i className={`fas ${style.icon} ${style.text} text-[10px]`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-300 leading-snug">{item.text}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{formatRelativeTime(item.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Courses */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-ranking-star text-amber-400 text-sm"></i>
              </div>
              Top Courses
            </h3>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Total Revenue
              </p>
              <p className="text-base font-bold text-amber-400">
                ${totalRevenue.toLocaleString("en-US")} USD
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4 ml-11">
            Revenue and enrollment together, ranked
          </p>

          {topCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <i className="fas fa-book text-slate-500 text-lg"></i>
              </div>
              <p className="text-slate-400 text-sm">No course data available</p>
            </div>
          ) : (
            <div>
              {topCourses.map((course, i) => {
                const metric = totalRankedRevenue > 0 ? course.revenue : course.students;
                const pct = Math.max(Math.round((metric / rankMetricMax) * 100), 4);
                return (
                  <div
                    key={course.name}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-800/50 last:border-0"
                  >
                    <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white font-medium truncate">{course.name}</p>
                      <div className="h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-amber-400">
                        ${course.revenue.toLocaleString("en-US")}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {course.students} student{course.students === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
