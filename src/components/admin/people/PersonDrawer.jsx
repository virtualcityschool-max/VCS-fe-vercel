import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../../services/adminService";
import { useAdminSignals } from "../shell/adminSignalsContext";
import { departmentOf } from "../ui/departments";
import { Drawer, InfoTile, StatusPill } from "../ui";

const TABS = {
  student: [
    { id: "overview", label: "Overview", icon: "fa-user" },
    { id: "subjects", label: "Subjects", icon: "fa-book" },
    { id: "attendance", label: "Attendance", icon: "fa-calendar-check" },
    { id: "fees", label: "Fees", icon: "fa-credit-card" },
  ],
  teacher: [
    { id: "overview", label: "Overview", icon: "fa-user" },
    { id: "subjects", label: "Subjects", icon: "fa-book" },
  ],
  parent: [
    { id: "overview", label: "Overview", icon: "fa-user" },
    { id: "children", label: "Children", icon: "fa-children" },
  ],
  admin: [{ id: "overview", label: "Overview", icon: "fa-user" }],
};

const BTN = "h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors";
const waLink = (phone) => {
  const d = (phone || "").replace(/[^0-9]/g, "");
  return d.length >= 8 ? `https://wa.me/${d}` : null;
};
const fmt = (iso, withTime) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) }) : "—";

const Row = ({ icon, children }) => (
  <div className="flex items-center gap-2.5 text-sm text-slate-300 min-w-0">
    <i className={`fas ${icon} w-4 text-indigo-400 text-xs`} aria-hidden="true" />
    <span className="truncate">{children}</span>
  </div>
);

const PersonDrawer = ({ role, person, onClose, onEdit, onView, onToggleActive, onPurge }) => {
  const [tab, setTab] = useState("overview");
  const [attendance, setAttendance] = useState(null);
  const signals = useAdminSignals();
  const personId = person?.id;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTab("overview");
    setAttendance(null);
  }, [personId]);

  // Attendance is loaded only when that tab is opened.
  useEffect(() => {
    if (tab !== "attendance" || !personId || attendance !== null) return;
    adminService
      .getAttendance({ student: personId, participant_role: "student" })
      .then((d) => setAttendance(Array.isArray(d) ? d : d?.results || []))
      .catch(() => setAttendance([]));
  }, [tab, personId, attendance]);

  const subs = useMemo(() => {
    const all = [...(signals?.subscriptions?.active || []), ...(signals?.subscriptions?.expired || [])];
    return all.filter((r) => r.student?.id === personId);
  }, [signals?.subscriptions, personId]);

  const att = useMemo(() => {
    const rows = (attendance || []).slice().sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
    const counted = rows.filter((r) => ["present", "late", "absent"].includes(r.status));
    const ok = counted.filter((r) => r.status !== "absent").length;
    return { rows, rate: counted.length ? Math.round((ok / counted.length) * 100) : null };
  }, [attendance]);

  if (!person) return null;
  const wa = waLink(person.phone);
  const guardianWa = waLink(person.guardian?.phone);

  const footer = (
    <>
      <button type="button" onClick={onToggleActive} className={`${BTN} bg-slate-800 text-slate-200 hover:bg-slate-700`}>
        <i className={`fas ${person.is_active ? "fa-user-slash" : "fa-user-check"}`} aria-hidden="true" />
        {person.is_active ? "Deactivate" : "Activate"}
      </button>
      <button type="button" onClick={onPurge} className={`${BTN} text-rose-300 hover:bg-rose-500/15`}>
        <i className="fas fa-trash" aria-hidden="true" /> Delete
      </button>
      <button type="button" onClick={onView} className={`${BTN} border border-[#2A3766] text-slate-200 hover:bg-white/5`}>
        Full profile
      </button>
      <button type="button" onClick={onEdit} className={`${BTN} bg-[#6D5BFF] hover:bg-[#5B47FB] text-white`}>
        <i className="fas fa-pen" aria-hidden="true" /> Edit
      </button>
    </>
  );

  const subtitle = [role.charAt(0).toUpperCase() + role.slice(1), person.roll_no && `Roll #${person.roll_no}`, person.grade_level].filter(Boolean).join(" · ");

  return (
    <Drawer
      open
      onClose={onClose}
      title={person.name}
      subtitle={subtitle}
      status={role === "teacher" ? (person.engaged ? "Engaged" : "Standby") : person.status}
      tabs={TABS[role]}
      tab={tab}
      onTab={setTab}
      footer={footer}
    >
      {tab === "overview" && (
        <>
          <section className="p-4 rounded-xl border border-[#232D52] bg-[#0E1428] space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Row icon="fa-envelope">{person.email}</Row>
              {person.phone && <Row icon="fa-phone">{person.phone}</Row>}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-emerald-400 hover:underline">
                  <i className="fab fa-whatsapp w-4" aria-hidden="true" /> WhatsApp chat ↗
                </a>
              )}
              <Row icon="fa-calendar">Joined {fmt(person.date_joined)}</Row>
            </div>
          </section>

          {role === "student" && (
            <div className="grid grid-cols-2 gap-3">
              <InfoTile label="Level" value={person.grade_level || "—"} sub={person.roll_no ? `Roll #${person.roll_no}` : null} />
              <InfoTile label="Fees" value={<StatusPill status={person.feeLabel} />} sub={`${person.subjects.length} subject${person.subjects.length === 1 ? "" : "s"}`} />
              <div className="col-span-2 p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428]">
                <div className="text-xs text-slate-400">Parent / guardian</div>
                {person.guardian?.name ? (
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm font-semibold text-slate-100">{person.guardian.name}</span>
                    {person.guardian.relationship && <span className="text-xs text-slate-400">{person.guardian.relationship}</span>}
                    {person.guardian.phone && <span className="text-xs text-slate-300 tabular-nums">{person.guardian.phone}</span>}
                    {guardianWa && (
                      <a href={guardianWa} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">
                        <i className="fab fa-whatsapp" aria-hidden="true" /> WhatsApp parent ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 mt-1">Not recorded</div>
                )}
              </div>
            </div>
          )}

          {role === "teacher" && (
            <div className="grid grid-cols-2 gap-3">
              <InfoTile label="Department" value={person.dept?.name || "—"} sub={`${person.subjects.length} subject${person.subjects.length === 1 ? "" : "s"} assigned`} />
              <InfoTile label="Experience" value={person.experience_years ? `${person.experience_years} years` : "—"} tone="text-indigo-300" sub={person.qualification || null} />
              {person.expertise && (
                <div className="col-span-2 p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428] text-sm text-slate-300">
                  <div className="text-xs text-slate-400 mb-1">Expertise</div>
                  {person.expertise}
                </div>
              )}
              {!person.engaged && (
                <Link to="/admin/teacher-allocations" className="col-span-2 text-center h-10 leading-10 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold">
                  In the standby pool · Assign a subject →
                </Link>
              )}
            </div>
          )}

          {role === "parent" && (
            <InfoTile label="Linked children" value={person.linked_children?.length || 0} sub="See the Children tab" />
          )}
        </>
      )}

      {tab === "subjects" && (
        <section className="space-y-2.5">
          {person.subjects.length === 0 && <p className="text-sm text-slate-400">{role === "teacher" ? "No subjects assigned yet." : "Not enrolled in any subject."}</p>}
          {(role === "teacher" ? person.assigned_courses || [] : (person.enrolled_courses || []).filter((c) => c.status !== "cancelled")).map((c) => {
            const d = departmentOf(c.title);
            return (
              <div key={c.id} className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100 truncate">{c.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-x-2">
                    <span style={{ color: d.hex }}>{d.name}</span>
                    {c.category && <span>· {c.category}</span>}
                    {c.instructor && <span>· {c.instructor}</span>}
                    {c.enrolled_at && <span>· since {fmt(c.enrolled_at)}</span>}
                  </div>
                </div>
                {c.status && <StatusPill status={c.status} />}
              </div>
            );
          })}
          {role === "student" && (
            <Link to="/admin/enrollments" className="block text-center h-10 leading-10 rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white text-xs font-semibold">
              + Enroll in a subject
            </Link>
          )}
        </section>
      )}

      {tab === "attendance" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class attendance</h3>
            {att.rate !== null && <span className="text-xs font-bold text-emerald-400 tabular-nums">{att.rate}% attended</span>}
          </div>
          {attendance === null && <div className="h-24 rounded-xl bg-[#0E1428] animate-pulse" />}
          {attendance !== null && att.rows.length === 0 && <p className="text-sm text-slate-400">No attendance recorded yet.</p>}
          {att.rows.slice(0, 30).map((r) => (
            <div key={r.id} className="p-3 rounded-xl border border-[#232D52] bg-[#0E1428] flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <div className="font-medium text-slate-200 truncate">{r.session_title}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{fmt(r.scheduled_at, true)}</div>
              </div>
              <StatusPill status={r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "—"} />
            </div>
          ))}
        </section>
      )}

      {tab === "fees" && (
        <section className="space-y-2.5">
          {subs.length === 0 && <p className="text-sm text-slate-400">No paid subscription on record. Enrolled subjects without one are free or never expire.</p>}
          {subs.map((r) => (
            <div key={r.enrollment_id} className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428] space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-100 truncate">{r.course?.title}</span>
                <StatusPill status={!r.has_access ? "Expired" : r.days_remaining <= 7 ? `Ends in ${Math.max(r.days_remaining, 0)}d` : "Paid"} />
              </div>
              <div className="text-xs text-slate-400 flex flex-wrap gap-x-3">
                <span>Access until {fmt(r.access_expires_at)}</span>
                {r.last_charge_at && <span>Last paid {fmt(r.last_charge_at)}</span>}
                <span>{r.enrollment_source === "gumroad" ? "Gumroad" : "Paid to admin"}</span>
              </div>
            </div>
          ))}
          <Link to="/admin/subscriptions" className="block text-center h-10 leading-10 rounded-xl border border-[#2A3766] text-slate-200 hover:bg-white/5 text-xs font-semibold">
            Manage in Subscriptions →
          </Link>
        </section>
      )}

      {tab === "children" && (
        <section className="space-y-2.5">
          {(person.linked_children || []).length === 0 && <p className="text-sm text-slate-400">No children linked yet.</p>}
          {(person.linked_children || []).map((c) => (
            <Link key={c.id} to={`/admin/users/${c.id}`} className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428] flex items-center justify-between gap-3 hover:border-indigo-500/40">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100 truncate">{c.name}</div>
                <div className="text-xs text-slate-400">{[c.roll_no && `Roll #${c.roll_no}`, c.grade_level, c.email].filter(Boolean).join(" · ")}</div>
              </div>
              <StatusPill status={c.status === "approved" ? "Approved" : c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : "Linked"} />
            </Link>
          ))}
        </section>
      )}
    </Drawer>
  );
};

export default PersonDrawer;
