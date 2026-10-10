import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { adminService } from "../../../services/adminService";
import { approveUser, actionEnrollment } from "../../../store/slices/approvalsSlice";
import { fetchPendingChildLinks } from "../../../store/slices/childLinksSlice";
import { fetchCourses, fetchEnrollments } from "../../../store/slices/adminSlice";
import { QUICK_ADD } from "../shell/adminNav";
import { departmentOf } from "../ui/departments";
import { useAdminSignals } from "../shell/adminSignalsContext";
import { getDisplayName } from "../../../utils/userDisplay";
import { toastManager } from "../../../utils/toastManager";
import { showApiError } from "../../../utils/apiErrorHandler";
import ConfirmDialog from "../../common/ConfirmDialog";

const ROLE_LABEL = { student: "Student", teacher: "Teacher", parent: "Parent", admin: "Admin" };
const CARD = "bg-[#121831] border border-[#1E294B] rounded-2xl";
const BTN_PRIMARY = "h-9 px-3.5 rounded-lg bg-[#6D5BFF] hover:bg-[#5B47FB] text-white text-xs font-semibold transition inline-flex items-center justify-center";
const BTN_APPROVE = "h-9 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition inline-flex items-center justify-center disabled:opacity-50";
const BTN_GHOST = "h-9 px-3 rounded-lg border border-[#2A3766] text-slate-200 hover:bg-white/5 text-xs font-semibold transition inline-flex items-center justify-center";

const asList = (data) => (Array.isArray(data) ? data : data?.results || data?.data || []);

// "YYYY-MM-DD" for a date as seen in the admin's timezone.
const dayKey = (date, timeZone) =>
  date.toLocaleDateString("en-CA", timeZone ? { timeZone } : undefined);

const greetingFor = (hour) => (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

const Count = ({ n, tone }) => (
  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${tone}`}>{n}</span>
);

const ActionCard = ({ title, count, tone, children, footer }) => (
  <article className="bg-[#182042] border border-[#2A3766] rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <h3 className="flex-1 text-sm font-bold text-white">{title}</h3>
      <Count n={count} tone={tone} />
    </div>
    <div className="flex flex-col gap-2 flex-1">{children}</div>
    {footer && <div className="flex flex-wrap gap-2 pt-1">{footer}</div>}
  </article>
);

const StatusPillLite = ({ tone, children }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${tone === "live" ? "bg-sky-950/60 text-sky-400 border-sky-800/60" : "bg-slate-800/80 text-slate-400 border-slate-700/60"}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {children}
  </span>
);

const AdminDashboard = ({ analytics, analyticsError, teacherMeetings, recentActivity, formatRelativeTime }) => {
  const dispatch = useDispatch();
  const signals = useAdminSignals();
  const profile = useSelector((s) => s.auth.profile);
  const courses = useSelector((s) => s.admin.courses.data);
  const timeZone = profile?.timezone || undefined;

  const [now, setNow] = useState(() => new Date());
  const [attendance, setAttendance] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const navigate = useNavigate();
  const enrollments = useSelector((s) => s.admin.enrollments.data);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Subjects are needed for the "no teacher" card; skip if already loaded.
  useEffect(() => {
    if (!courses || courses.length === 0) dispatch(fetchCourses());
    if (!enrollments || enrollments.length === 0) dispatch(fetchEnrollments());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // This week's student attendance: absences and classes held today.
  useEffect(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
    adminService
      .getAttendance({ participant_role: "student", from: dayKey(weekStart, timeZone), to: dayKey(today, timeZone) })
      .then((d) => setAttendance(asList(d)))
      .catch(() => setAttendance([]));
  }, [timeZone]);

  const todayKey = dayKey(now, timeZone);
  const hour = Number(now.toLocaleString("en-US", { hour: "numeric", hour12: false, ...(timeZone ? { timeZone } : {}) }));

  const liveIds = useMemo(
    () => new Set((signals?.liveSessions || []).map((s) => s.id)),
    [signals?.liveSessions],
  );

  const { absentees, heldToday } = useMemo(() => {
    const rows = attendance || [];
    const absences = new Map();
    const sessions = new Map();
    rows.forEach((r) => {
      if (r.status === "absent" && r.student) {
        const cur = absences.get(r.student) || { id: r.student, name: r.student_name, n: 0 };
        cur.n += 1;
        absences.set(r.student, cur);
      }
      // Classes still running are listed under LIVE NOW instead.
      if (r.scheduled_at && !liveIds.has(r.session) && dayKey(new Date(r.scheduled_at), timeZone) === todayKey) {
        const s = sessions.get(r.session) || { id: r.session, title: r.session_title, at: r.scheduled_at, total: 0, present: 0 };
        s.total += 1;
        if (r.status === "present" || r.status === "late") s.present += 1;
        sessions.set(r.session, s);
      }
    });
    return {
      absentees: [...absences.values()].filter((a) => a.n >= 2).sort((a, b) => b.n - a.n),
      heldToday: [...sessions.values()].sort((a, b) => new Date(b.at) - new Date(a.at)),
    };
  }, [attendance, timeZone, todayKey, liveIds]);

  // Share of this week's marked student attendances that were present or late.
  const attendanceRate = useMemo(() => {
    const marked = (attendance || []).filter((r) => ["present", "late", "absent"].includes(r.status));
    if (!marked.length) return null;
    return Math.round((marked.filter((r) => r.status !== "absent").length / marked.length) * 1000) / 10;
  }, [attendance]);

  // New enrollments per month (last 6 months) and the monthly fees they added.
  const growth = useMemo(() => {
    const months = [];
    const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    for (let i = 0; i < 6; i += 1) {
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString("en-US", { month: "short" }), enrollments: 0, fees: 0 });
      d.setMonth(d.getMonth() + 1);
    }
    (enrollments || []).forEach((e) => {
      if (!e.enrolled_at) return;
      const t = new Date(e.enrolled_at);
      const m = months.find((x) => x.key === `${t.getFullYear()}-${t.getMonth()}`);
      if (!m) return;
      m.enrollments += 1;
      if (e.course?.is_paid) m.fees += parseFloat(e.course?.price) || 0;
    });
    return months;
  }, [enrollments, now]);

  const engagedTeacherCount = useMemo(
    () => new Set((courses || []).map((c) => c.instructor?.id || c.instructor_id).filter(Boolean)).size,
    [courses],
  );

  if (!signals) return null;
  const { pendingApprovals, pendingChildLinks, pendingEnrollments, pendingFreeAccess, expiring, unassigned, liveSessions, coursesLoaded } = signals;
  const requestsCount = pendingEnrollments.length + pendingFreeAccess.length;
  const approvalsCount = pendingApprovals.length + pendingChildLinks.length;
  const actionCount =
    approvalsCount + requestsCount + expiring.length + (coursesLoaded ? unassigned.length : 0) + absentees.length;

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", ...(timeZone ? { timeZone } : {}) });

  const runConfirm = async () => {
    const c = confirm;
    setConfirm(null);
    if (!c) return;
    setBusyId(c.key);
    try {
      if (c.kind === "user") {
        const { result } = await dispatch(approveUser({ userId: c.id })).unwrap();
        dispatch(fetchPendingChildLinks());
        toastManager.success(result?.message || `${c.name} approved`);
      } else {
        await dispatch(actionEnrollment({ enrollmentId: c.id, action: "approve" })).unwrap();
        toastManager.success("Enrollment approved");
      }
    } catch (err) {
      showApiError(err);
    } finally {
      setBusyId(null);
    }
  };

  // Headline numbers straight from /admin/dashboard/ (no invented trends).
  const u = analytics?.users || {};
  const enrolledStudents = new Set((enrollments || []).filter((e) => e.status === "active").map((e) => e.student?.id)).size;
  const kpis = analytics
    ? [
        { label: "Students", badge: null, info: true, value: u.students ?? 0, sub: `${enrolledStudents || "—"} enrolled · ${u.parents ?? 0} parents`, tone: "text-slate-400" },
        { label: "Faculty & Teachers", badge: `${engagedTeacherCount} engaged`, value: u.teachers ?? 0, sub: `${Math.max((u.teachers ?? 0) - engagedTeacherCount, 0)} in the standby pool`, tone: "text-slate-400" },
        { label: "Monthly fees", badge: "USD", value: `$${(analytics.revenue?.total || 0).toLocaleString("en-US")}`, sub: `${analytics.enrollments?.active ?? 0} active enrollments`, tone: "text-slate-400" },
        { label: "Attendance rate", badge: "This week", value: attendanceRate === null ? "—" : `${attendanceRate}%`, sub: `${absentees.length} student${absentees.length === 1 ? "" : "s"} missed 2+ classes`, tone: absentees.length ? "text-amber-300" : "text-emerald-400" },
      ]
    : [];
  const feeByCourse = new Map((analytics?.revenue?.by_course || []).map((c) => [c.course, c.revenue || 0]));
  const topSubjects = (analytics?.enrollments?.by_course || [])
    .slice()
    .sort((a, b) => b.students - a.students)
    .slice(0, 5)
    .map((c) => ({ name: c.course, value: c.students, fees: feeByCourse.get(c.course) || 0, dept: departmentOf(c.course) }));

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Greeting card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#232D52] bg-gradient-to-r from-[#121831] via-[#10152c] to-[#121831] shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {greetingFor(hour)}, {profile?.first_name || getDisplayName(profile) || "Admin"}
              <i className="fas fa-wand-magic-sparkles text-indigo-400 text-base" aria-hidden="true" />
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-medium">
              {liveSessions.length ? `${liveSessions.length} class${liveSessions.length === 1 ? "" : "es"} live` : "Live School Ops"}
            </span>
          </div>
          <p className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 tabular-nums">
            <span>{now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric", ...(timeZone ? { timeZone } : {}) })}</span>
            <span>·</span>
            <i className="fas fa-clock text-indigo-400 text-[11px]" aria-hidden="true" />
            <span>{fmtTime(now)}</span>
            {timeZone && <><span>·</span><span className="text-indigo-300 font-semibold">{timeZone}</span></>}
          </p>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setQuickOpen((o) => !o)} aria-expanded={quickOpen} className="flex items-center gap-2 h-10 px-4 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-lg shadow-indigo-600/30">
            <i className="fas fa-plus" aria-hidden="true" /> Quick add <i className="fas fa-chevron-down text-[10px] opacity-80" aria-hidden="true" />
          </button>
          {quickOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#232D52] bg-[#121831] p-1.5 shadow-2xl z-40 text-xs">
              {QUICK_ADD.map((q) => (
                <button key={q.label} type="button" onClick={() => { setQuickOpen(false); navigate(q.to); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left">
                  <i className={`fas ${q.icon} w-4 text-indigo-300`} aria-hidden="true" /> {q.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Center */}
      <section className={`${CARD} p-5 flex flex-col gap-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-white">Needs your action</h2>
          {actionCount > 0 && <Count n={`${actionCount} items`} tone="bg-amber-500/15 text-amber-300" />}
        </div>

        {actionCount === 0 ? (
          <p className="py-6 text-center text-slate-400 text-sm">All caught up ✓ Nothing is waiting for you.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
            {approvalsCount > 0 && (
              <ActionCard
                title="Pending approvals"
                count={approvalsCount}
                tone="bg-red-600 text-white"
                footer={<Link to="/admin/approvals" className={BTN_GHOST}>All approvals →</Link>}
              >
                {pendingApprovals.slice(0, 4).map((user) => {
                  // Parents asking to link children are reviewed on the
                  // Approvals page, where those links are decided too.
                  const needsReview = (user.requested_children || []).length > 0;
                  const name = getDisplayName(user) || user.email;
                  return (
                    <div key={user.id} className="flex items-center gap-2 text-[13px]">
                      <span className="flex-1 min-w-0 truncate text-slate-200">
                        {name} <span className="text-slate-400">· {ROLE_LABEL[user.role] || user.role}</span>
                      </span>
                      {needsReview ? (
                        <Link to="/admin/approvals" className={BTN_GHOST}>Review</Link>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === `u${user.id}`}
                          onClick={() => setConfirm({ kind: "user", id: user.id, key: `u${user.id}`, name })}
                          className={BTN_APPROVE}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  );
                })}
                {pendingChildLinks.length > 0 && (
                  <p className="text-xs text-slate-400">{pendingChildLinks.length} parent-child link request{pendingChildLinks.length === 1 ? "" : "s"}</p>
                )}
              </ActionCard>
            )}

            {requestsCount > 0 && (
              <ActionCard
                title="Enrollment and free-access requests"
                count={requestsCount}
                tone="bg-amber-400 text-amber-950"
                footer={<Link to="/admin/approvals" className={BTN_GHOST}>Open requests →</Link>}
              >
                {pendingEnrollments.slice(0, 3).map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-[13px]">
                    <span className="flex-1 min-w-0 truncate text-slate-200">
                      {e.student_name || "Student"} <span className="text-slate-400">→ {e.course_title || "subject"}</span>
                    </span>
                    <button
                      type="button"
                      disabled={busyId === `e${e.id}`}
                      onClick={() => setConfirm({ kind: "enrollment", id: e.id, key: `e${e.id}`, name: `${e.student_name || "this student"} in ${e.course_title || "this subject"}` })}
                      className={BTN_APPROVE}
                    >
                      Approve
                    </button>
                  </div>
                ))}
                {pendingFreeAccess.length > 0 && (
                  <p className="text-xs text-slate-400">{pendingFreeAccess.length} free-access application{pendingFreeAccess.length === 1 ? "" : "s"}</p>
                )}
              </ActionCard>
            )}

            {expiring.length > 0 && (
              <ActionCard
                title="Fees ending within 7 days"
                count={expiring.length}
                tone="bg-amber-400 text-amber-950"
                footer={<Link to="/admin/subscriptions" className={BTN_PRIMARY}>Open subscriptions</Link>}
              >
                {expiring.slice(0, 4).map((r) => (
                  <div key={r.enrollment_id} className="text-[13px] text-slate-200 flex gap-2">
                    <span className="flex-1 min-w-0 truncate">
                      {r.student?.name} <span className="text-slate-400">· {r.course?.title}</span>
                    </span>
                    <span className="text-amber-300 tabular-nums whitespace-nowrap">
                      {r.days_remaining <= 0 ? "today" : `${r.days_remaining}d`}
                    </span>
                  </div>
                ))}
              </ActionCard>
            )}

            {coursesLoaded && unassigned.length > 0 && (
              <ActionCard
                title="Published subjects with no teacher"
                count={unassigned.length}
                tone="bg-amber-400 text-amber-950"
                footer={<Link to="/admin/teacher-allocations" className={BTN_PRIMARY}>Assign teachers</Link>}
              >
                {unassigned.slice(0, 4).map((c) => (
                  <p key={c.id} className="text-[13px] text-slate-200 truncate">{c.title}</p>
                ))}
              </ActionCard>
            )}

            {absentees.length > 0 && (
              <ActionCard
                title="Absent 2+ times this week"
                count={absentees.length}
                tone="bg-blue-600 text-white"
                footer={<Link to="/admin/attendance" className={BTN_PRIMARY}>Attendance</Link>}
              >
                {absentees.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex gap-2 text-[13px] text-slate-200">
                    <Link to={`/admin/users/${a.id}`} className="flex-1 min-w-0 truncate hover:text-white">{a.name || "Student"}</Link>
                    <span className="text-blue-300 tabular-nums">{a.n} missed</span>
                  </div>
                ))}
              </ActionCard>
            )}
          </div>
        )}
      </section>

      {/* Headline numbers */}
      {analyticsError ? (
        <p className={`${CARD} p-4 text-sm text-red-300`}>Couldn't load the headline numbers. Refresh to try again.</p>
      ) : (
        <section aria-label="Headline numbers" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {(kpis.length ? kpis : [0, 1, 2, 3]).map((k, i) =>
            k.label ? (
              <div key={k.label} className="p-4 rounded-2xl border border-[#232D52] bg-[#121831] shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{k.label}</span>
                  {k.info ? (
                    <button type="button" onClick={() => setBreakdownOpen((o) => !o)} aria-label="Show all accounts by role" className="text-slate-500 hover:text-slate-300">
                      <i className="fas fa-circle-info" aria-hidden="true" />
                    </button>
                  ) : (
                    k.badge && <span className="text-[10px] text-indigo-300">{k.badge}</span>
                  )}
                </div>
                <div className="mt-2 text-2xl font-bold tabular-nums text-slate-100">{k.value}</div>
                <div className={`mt-1.5 text-xs ${k.tone}`}>{k.sub}</div>
              </div>
            ) : (
              <div key={i} className={`${CARD} h-[104px] animate-pulse`} />
            ),
          )}
        </section>
      )}
      {breakdownOpen && analytics && (
        <div className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428] text-xs flex flex-wrap items-center justify-between gap-2 text-slate-300">
          <span>
            <b className="text-white">All accounts: </b>
            {u.admins ?? 0} admins · {u.teachers ?? 0} teachers ({engagedTeacherCount} engaged) · {u.students ?? 0} students · {u.parents ?? 0} parents = {u.total ?? 0} approved accounts
            {u.inactive ? ` · ${u.inactive} deactivated` : ""}
          </span>
          <button type="button" onClick={() => setBreakdownOpen(false)} className="text-slate-400 hover:text-white underline">Dismiss</button>
        </div>
      )}

      {/* Classes today */}
      <section className={`${CARD} p-5 flex flex-col gap-3`}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-white">Today's class schedule</h2>
          {timeZone && <span className="text-xs text-slate-400">({timeZone})</span>}
          <span className="text-xs text-slate-400">View only. Opening a Meet link changes nothing.</span>
          <Link to="/admin/sessions" className="ml-auto text-xs text-indigo-300 hover:text-indigo-200">Timetable →</Link>
        </div>

        {liveSessions.map((s) => (
          <div key={s.id} className="p-3.5 rounded-xl border border-emerald-900 bg-emerald-950/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-center min-w-[70px] py-1 px-2 rounded-lg bg-slate-800/80 text-xs border border-slate-700 tabular-nums">
                <div className="font-bold text-slate-200">{s.scheduled_at ? fmtTime(s.scheduled_at) : "—"}</div>
                <div className="text-[10px] text-emerald-300">running</div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-100 truncate">{s.course_title || s.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-x-2">
                  <span style={{ color: departmentOf(s.course_title || s.title || "").hex }}>{departmentOf(s.course_title || s.title || "").name}</span>
                  <span>·</span>
                  <span className={s.teacher_name ? "text-slate-300" : "text-amber-400 font-semibold"}>{s.teacher_name || "No teacher"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <StatusPillLite tone="live">Live</StatusPillLite>
              {s.meeting_link && (
                <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 h-8 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">
                  <i className="fas fa-video" aria-hidden="true" /> Open Meet
                </a>
              )}
            </div>
          </div>
        ))}

        {heldToday.map((s) => (
          <div key={s.id} className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-center min-w-[70px] py-1 px-2 rounded-lg bg-slate-800/80 text-xs border border-slate-700 tabular-nums">
                <div className="font-bold text-slate-200">{fmtTime(s.at)}</div>
                <div className="text-[10px] text-slate-400">held</div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-100 truncate">{s.title}</div>
                <div className="text-[11px] mt-0.5" style={{ color: departmentOf(s.title || "").hex }}>{departmentOf(s.title || "").name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400 tabular-nums">{s.present}/{s.total} attended</span>
              <StatusPillLite tone="ended">Ended</StatusPillLite>
            </div>
          </div>
        ))}

        {attendance !== null && liveSessions.length === 0 && heldToday.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No classes live or held yet today.</p>
        )}

        <div className="pt-2 border-t border-[#1E294B]">{teacherMeetings}</div>
      </section>

      {/* Top subjects + growth chart */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <section className={`${CARD} p-5 flex flex-col`}>
          <div className="flex items-center pb-3 border-b border-[#1E2648]">
            <h2 className="flex-1 text-sm font-bold text-slate-100"><i className="fas fa-book-open text-indigo-400 mr-2" aria-hidden="true" />Top enrolled subjects</h2>
            <Link to="/admin/courses" className="text-xs text-indigo-300 hover:text-indigo-200">Catalogue →</Link>
          </div>
          <div className="mt-4 space-y-3.5 flex-1">
            {topSubjects.length === 0 && <p className="text-sm text-slate-400">No enrollments yet.</p>}
            {topSubjects.map((t, i) => (
              <div key={t.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500 font-bold tabular-nums">0{i + 1}.</span>
                    <span className="font-bold text-slate-200 truncate" title={t.name}>{t.name}</span>
                  </span>
                  <span className="flex items-center gap-3 tabular-nums whitespace-nowrap">
                    <span className="font-semibold text-slate-300">{t.value} students</span>
                    {t.fees > 0 && <span className="text-emerald-400 font-bold">${t.fees.toLocaleString("en-US")}/mo</span>}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.max((t.value / (topSubjects[0]?.value || 1)) * 100, 3)}%`, backgroundColor: t.dept.hex }} />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t border-[#1E2648] flex items-center justify-between text-xs text-slate-400">
            <span>{analytics?.courses?.total ?? "—"} subjects in the catalogue</span>
            <span className="font-semibold text-slate-300">{analytics?.courses?.published ?? "—"} published</span>
          </div>
        </section>

        <section className={`${CARD} p-5 flex flex-col`}>
          <div className="flex items-center pb-3 border-b border-[#1E2648]">
            <h2 className="flex-1 text-sm font-bold text-slate-100"><i className="fas fa-chart-column text-emerald-400 mr-2" aria-hidden="true" />New enrollments (last 6 months)</h2>
            <span className="text-xs font-bold text-emerald-400">+ monthly fees</span>
          </div>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2648" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(109,91,255,0.08)" }}
                  contentStyle={{ backgroundColor: "#0E1428", borderColor: "#232D52", borderRadius: 12, color: "#F8FAFC", fontSize: 12 }}
                  formatter={(val, _name, item) => [`${val} new · $${(item?.payload?.fees || 0).toLocaleString("en-US")}/mo added`, "Enrollments"]}
                />
                <Bar dataKey="enrollments" fill="#6D5BFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-4 mt-2 border-t border-[#1E2648] flex items-center justify-between text-xs text-slate-400">
            <span>
              This month: <b className="text-slate-200">{growth[5]?.enrollments ?? 0}</b> new · <b className="text-emerald-400">${(growth[5]?.fees || 0).toLocaleString("en-US")}/mo</b>
            </span>
            <Link to="/admin/enrollments" className="text-indigo-300 hover:text-indigo-200 font-semibold">Enrollments →</Link>
          </div>
        </section>
      </div>

      {/* Recent activity */}
      <section className={`${CARD} p-5 flex flex-col gap-1`}>
        <h2 className="text-sm font-bold text-slate-100 mb-2"><i className="fas fa-clock-rotate-left text-indigo-400 mr-2" aria-hidden="true" />Recent operations log</h2>
        {recentActivity.length === 0 ? (
          <p className="py-4 text-sm text-slate-400">Nothing new waiting on you.</p>
        ) : (
          recentActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-2.5 border-b border-[#1E294B] last:border-0 text-[13px]">
              <span className="flex-1 text-slate-200">{item.text}</span>
              <span className="text-xs text-slate-400 whitespace-nowrap">{formatRelativeTime(item.timestamp)}</span>
            </div>
          ))
        )}
      </section>

      <ConfirmDialog
        open={!!confirm}
        variant="primary"
        title={confirm?.kind === "user" ? "Approve this account?" : "Approve this enrollment?"}
        message={confirm ? `Approve ${confirm.name}?` : ""}
        confirmLabel="Approve"
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default AdminDashboard;
