import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminService } from "../../../services/adminService";
import { approveUser, actionEnrollment } from "../../../store/slices/approvalsSlice";
import { fetchPendingChildLinks } from "../../../store/slices/childLinksSlice";
import { fetchCourses } from "../../../store/slices/adminSlice";
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

const Bars = ({ rows, valueLabel, color }) => {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => (
        <div key={r.name} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 text-[13px]">
            <span className="flex-1 truncate text-slate-200">{r.name}</span>
            <span className="tabular-nums text-white font-semibold">{valueLabel(r.value)}</span>
          </div>
          <div className="h-2 rounded bg-[#1E294B]">
            <div className={`h-2 rounded ${color}`} style={{ width: `${Math.max((r.value / max) * 100, 3)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Subjects are needed for the "no teacher" card; skip if already loaded.
  useEffect(() => {
    if (!courses || courses.length === 0) dispatch(fetchCourses());
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
      if (r.scheduled_at && dayKey(new Date(r.scheduled_at), timeZone) === todayKey) {
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
  }, [attendance, timeZone, todayKey]);

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

  // Headline numbers straight from /admin/dashboard/.
  const u = analytics?.users || {};
  const kpis = analytics
    ? [
        { label: "Students", value: u.students ?? 0, sub: `${u.parents ?? 0} parents` },
        { label: "Teachers", value: u.teachers ?? 0, sub: `${analytics.courses?.published ?? 0} subjects published` },
        { label: "Active enrollments", value: analytics.enrollments?.active ?? 0, sub: `${analytics.enrollments?.pending ?? 0} waiting` },
        { label: "Monthly fees (USD)", value: `$${(analytics.revenue?.total || 0).toLocaleString("en-US")}`, sub: "from active enrollments" },
      ]
    : [];
  const topSubjects = (analytics?.enrollments?.by_course || [])
    .slice()
    .sort((a, b) => b.students - a.students)
    .slice(0, 5)
    .map((c) => ({ name: c.course, value: c.students }));
  const feesBySubject = (analytics?.revenue?.by_course || [])
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((c) => ({ name: c.course, value: c.revenue }));

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Greeting */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-2xl font-bold text-white">
          {greetingFor(hour)}, {profile?.first_name || getDisplayName(profile) || "Admin"}
        </h1>
        <p className="text-sm text-slate-400 tabular-nums">
          {now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", ...(timeZone ? { timeZone } : {}) })}
          {" · "}
          {fmtTime(now)}
        </p>
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
        <section aria-label="Headline numbers" className="grid gap-4 grid-cols-2 xl:grid-cols-4">
          {(kpis.length ? kpis : [0, 1, 2, 3]).map((k, i) =>
            k.label ? (
              <div key={k.label} className={`${CARD} p-4 flex flex-col gap-1`}>
                <span className="text-xs text-slate-400">{k.label}</span>
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{k.value}</span>
                <span className="text-xs text-slate-400">{k.sub}</span>
              </div>
            ) : (
              <div key={i} className={`${CARD} h-[104px] animate-pulse`} />
            ),
          )}
        </section>
      )}

      {/* Classes today */}
      <section className={`${CARD} p-5 flex flex-col gap-3`}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-white">Classes today</h2>
          <span className="text-xs text-slate-400">View only. Opening a Meet link changes nothing.</span>
          <Link to="/admin/sessions" className="ml-auto text-xs text-indigo-300 hover:text-indigo-200">Timetable →</Link>
        </div>

        {liveSessions.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950/60 border border-emerald-900">
            <span className="text-[10px] font-extrabold tracking-wider px-2 py-1 rounded bg-emerald-700 text-white">LIVE NOW</span>
            <span className="flex-1 min-w-[200px] text-sm font-semibold text-white">
              {s.course_title || s.title} {s.teacher_name && <span className="font-normal text-emerald-200">· {s.teacher_name}</span>}
            </span>
            {s.meeting_link && (
              <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-800 text-emerald-200 hover:bg-emerald-900/50">
                Open Meet ↗
              </a>
            )}
          </div>
        ))}

        {heldToday.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-[#182042] border border-[#2A3766]">
            <span className="text-xs text-slate-300 tabular-nums w-16">{fmtTime(s.at)}</span>
            <span className="flex-1 min-w-[200px] text-sm font-medium text-white truncate">{s.title}</span>
            <span className="text-xs text-slate-400 tabular-nums">{s.present}/{s.total} attended</span>
          </div>
        ))}

        {attendance !== null && liveSessions.length === 0 && heldToday.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No classes live or held yet today.</p>
        )}

        <div className="pt-2 border-t border-[#1E294B]">{teacherMeetings}</div>
      </section>

      {/* Subjects and fees */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <section className={`${CARD} p-5 flex flex-col gap-4`}>
          <div className="flex items-center"><h2 className="flex-1 text-lg font-bold text-white">Top subjects by students</h2><Link to="/admin/courses" className="text-xs text-indigo-300 hover:text-indigo-200">Subjects →</Link></div>
          {topSubjects.length ? <Bars rows={topSubjects} valueLabel={(v) => v} color="bg-[#6D5BFF]" /> : <p className="text-sm text-slate-400">No enrollments yet.</p>}
        </section>
        <section className={`${CARD} p-5 flex flex-col gap-4`}>
          <div className="flex items-center"><h2 className="flex-1 text-lg font-bold text-white">Monthly fees by subject</h2><Link to="/admin/subscriptions" className="text-xs text-indigo-300 hover:text-indigo-200">Subscriptions →</Link></div>
          {feesBySubject.length ? <Bars rows={feesBySubject} valueLabel={(v) => `$${v.toLocaleString("en-US")}`} color="bg-emerald-500" /> : <p className="text-sm text-slate-400">No paid enrollments yet.</p>}
          <p className="text-xs text-slate-400">Price × active students, this month.</p>
        </section>
      </div>

      {/* Recent activity */}
      <section className={`${CARD} p-5 flex flex-col gap-1`}>
        <h2 className="text-lg font-bold text-white mb-2">Recent activity</h2>
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
