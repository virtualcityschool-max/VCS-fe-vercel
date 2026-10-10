import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../../store/slices/coursesSlice";
import { useAdminSignals } from "../shell/adminSignalsContext";
import { getDisplayName } from "../../../utils/userDisplay";
import ConfirmDialog from "../../common/ConfirmDialog";
import { mainDepartment } from "../ui/departments";
import { downloadCsv } from "../ui/csv";
import {
  PageHeader, SegmentedTabs, ViewToggle, FilterBar, DataTable, StatusPill, DeptPill,
  SubjectChips, Avatar, IconButton,
} from "../ui";
import PersonDrawer from "./PersonDrawer";

const ROLE = {
  student: { title: "Students", noun: "student", add: "New student", icon: "fa-user-graduate" },
  teacher: { title: "Teachers", noun: "teacher", add: "New teacher", icon: "fa-chalkboard-user" },
  parent: { title: "Parents", noun: "parent", add: "New parent", icon: "fa-people-roof" },
  admin: { title: "Admin Users", noun: "admin", add: "New admin", icon: "fa-user-shield" },
};

const waLink = (phone) => {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
};

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

// Fee status per student from the subscriptions list: the soonest-ending paid
// subject decides it. Enrolled with no paid window = free / never expires.
const useFeeStatus = () => {
  const signals = useAdminSignals();
  return useMemo(() => {
    const map = new Map();
    const subs = signals?.subscriptions || { active: [], expired: [] };
    subs.expired.forEach((r) => map.set(r.student?.id, { label: "Expired", days: -1 }));
    subs.active.forEach((r) => {
      const id = r.student?.id;
      const prev = map.get(id);
      if (prev?.label === "Expired") return;
      const days = r.days_remaining ?? 999;
      if (!prev || days < prev.days) map.set(id, { label: days <= 7 ? `Ends in ${Math.max(days, 0)}d` : "Paid", days });
    });
    return { map, loaded: !!signals?.subscriptionsLoaded };
  }, [signals?.subscriptions, signals?.subscriptionsLoaded]);
};

const PeopleDirectory = ({ role, users, loading, onCreate, onView, onEdit, onToggleActive, onPurge, onRefresh }) => {
  const cfg = ROLE[role] || ROLE.student;
  const fees = useFeeStatus();
  const dispatch = useDispatch();
  const categories = useSelector((s) => s.courses.categories);

  // A student's level is stored as a level (category) id: show its name.
  useEffect(() => {
    if (role === "student") dispatch(fetchCategories());
  }, [dispatch, role]);
  const levelName = useMemo(() => {
    const byId = new Map((categories || []).map((c) => [String(c.id), c.name]));
    return (v) => (v == null || v === "" ? null : byId.get(String(v)) || String(v));
  }, [categories]);
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [dept, setDept] = useState("all");
  const [fee, setFee] = useState("all");
  const [sort, setSort] = useState("name");
  const [openId, setOpenId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // One normalised row per user so table, cards, filters and CSV agree.
  const rows = useMemo(
    () =>
      users.map((u) => {
        const name = getDisplayName(u) || u.email;
        const subjects = role === "teacher"
          ? (u.assigned_courses || []).map((c) => c.title)
          : (u.enrolled_courses || []).filter((c) => c.status !== "cancelled").map((c) => c.title);
        const d = role === "teacher" ? mainDepartment(subjects) : null;
        const latest = (u.enrolled_courses || []).map((c) => c.enrolled_at).filter(Boolean).sort().pop();
        const feeInfo = fees.map.get(u.id);
        const feeLabel = role !== "student" ? null
          : feeInfo ? feeInfo.label
          : subjects.length ? (fees.loaded ? "Free access" : "…")
          : "Not enrolled";
        return {
          ...u,
          grade_level: levelName(u.grade_level),
          linked_children: (u.linked_children || []).map((c) => ({ ...c, grade_level: levelName(c.grade_level) })),
          name,
          subjects,
          dept: d,
          latest,
          feeLabel,
          engaged: role === "teacher" ? subjects.length > 0 : undefined,
          status: u.is_active ? "Active" : "Inactive",
          phoneAny: u.phone || u.guardian?.phone || "",
        };
      }),
    [users, role, fees, levelName],
  );

  const counts = {
    all: rows.length,
    engaged: rows.filter((r) => r.engaged).length,
    standby: rows.filter((r) => r.engaged === false).length,
    active: rows.filter((r) => r.is_active).length,
    inactive: rows.filter((r) => !r.is_active).length,
    enrolled: rows.filter((r) => r.subjects.length > 0).length,
    notEnrolled: rows.filter((r) => r.subjects.length === 0).length,
  };

  const tabs = role === "teacher"
    ? [{ id: "all", label: "All Faculty", count: counts.all }, { id: "engaged", label: "Engaged", count: counts.engaged }, { id: "standby", label: "Standby Pool", count: counts.standby }]
    : role === "student"
    ? [{ id: "all", label: "All Students", count: counts.all }, { id: "enrolled", label: "Enrolled", count: counts.enrolled }, { id: "not-enrolled", label: "Not Enrolled", count: counts.notEnrolled }, { id: "inactive", label: "Inactive", count: counts.inactive }]
    : [{ id: "all", label: "All", count: counts.all }, { id: "active", label: "Active", count: counts.active }, { id: "inactive", label: "Inactive", count: counts.inactive }];

  const levels = [...new Set(rows.map((r) => r.grade_level).filter(Boolean))].sort();
  const depts = [...new Map(rows.filter((r) => r.dept).map((r) => [r.dept.id, r.dept])).values()];

  const filters = [];
  if (role === "student") {
    filters.push({ id: "level", label: "Level", value: level, onChange: setLevel, options: levels.map((l) => ({ label: l, value: l, count: rows.filter((r) => r.grade_level === l).length })) });
    filters.push({ id: "fee", label: "Fee status", plural: "fee statuses", value: fee, onChange: setFee, options: ["Paid", "Ends soon", "Expired", "Free access", "Not enrolled"].map((f) => ({ label: f, value: f })) });
  }
  if (role === "teacher") {
    filters.push({ id: "dept", label: "Department", value: dept, onChange: setDept, options: depts.map((d) => ({ label: d.name, value: d.id, count: rows.filter((r) => r.dept?.id === d.id).length })) });
  }

  const q = search.trim().toLowerCase();
  const filtered = rows
    .filter((r) => {
      if (tab === "engaged" && !r.engaged) return false;
      if (tab === "standby" && r.engaged !== false) return false;
      if (tab === "active" && !r.is_active) return false;
      if (tab === "inactive" && r.is_active) return false;
      if (tab === "enrolled" && r.subjects.length === 0) return false;
      if (tab === "not-enrolled" && r.subjects.length > 0) return false;
      if (level !== "all" && r.grade_level !== level) return false;
      if (dept !== "all" && r.dept?.id !== dept) return false;
      if (fee !== "all") {
        const l = r.feeLabel || "";
        if (fee === "Ends soon" ? !l.startsWith("Ends in") : l !== fee) return false;
      }
      if (!q) return true;
      return [r.name, r.email, r.roll_no, r.phoneAny, r.qualification, r.expertise, ...r.subjects, ...(r.linked_children || []).map((c) => c.name)]
        .some((v) => (v || "").toString().toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.date_joined) - new Date(a.date_joined);
      if (sort === "roll") return (a.roll_no || "").localeCompare(b.roll_no || "", undefined, { numeric: true });
      if (sort === "subjects") return b.subjects.length - a.subjects.length;
      if (sort === "experience") return (b.experience_years || 0) - (a.experience_years || 0);
      return a.name.localeCompare(b.name);
    });

  const sortOptions = [
    { label: "Name (A–Z)", value: "name" },
    { label: "Newest first", value: "newest" },
    ...(role === "student" ? [{ label: "Roll #", value: "roll" }, { label: "Most subjects", value: "subjects" }] : []),
    ...(role === "teacher" ? [{ label: "Most subjects", value: "subjects" }, { label: "Experience", value: "experience" }] : []),
  ];

  const personCell = (r) => (
    <div className="flex items-center gap-3 min-w-[180px]">
      <Avatar name={r.name} />
      <div className="min-w-0">
        <div className="font-semibold text-slate-100 truncate">{r.name}</div>
        <div className="text-[11px] text-slate-400 truncate">{r.email}</div>
      </div>
    </div>
  );

  const phoneCell = (phone) => {
    const wa = waLink(phone);
    if (!phone) return <span className="text-slate-500">—</span>;
    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="tabular-nums text-slate-300">{phone}</span>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="Chat on WhatsApp" aria-label="Chat on WhatsApp" className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 flex items-center justify-center">
            <i className="fab fa-whatsapp text-sm" aria-hidden="true" />
          </a>
        )}
      </div>
    );
  };

  const columns = {
    student: [
      { header: "Student", cell: personCell },
      { header: "Roll #", cell: (r) => <span className="tabular-nums text-slate-300">{r.roll_no || "—"}</span> },
      { header: "Level", cell: (r) => <span className="text-slate-300 whitespace-nowrap">{r.grade_level || "—"}</span> },
      { header: "Enrolled subjects", cell: (r) => <SubjectChips titles={r.subjects} empty="Not enrolled" /> },
      { header: "Parent", cell: (r) => (r.guardian?.name ? <div className="whitespace-nowrap"><div className="text-slate-200">{r.guardian.name}</div><div className="text-[11px] text-slate-400 tabular-nums">{r.guardian.phone || ""}</div></div> : <span className="text-slate-500">—</span>) },
      { header: "Fees", cell: (r) => <StatusPill status={r.feeLabel} /> },
      { header: "Latest enrollment", cell: (r) => <span className="text-slate-400 whitespace-nowrap tabular-nums">{fmtDate(r.latest)}</span> },
      { header: "Status", cell: (r) => <StatusPill status={r.status} /> },
    ],
    teacher: [
      { header: "Teacher", cell: personCell },
      { header: "Department", cell: (r) => <DeptPill dept={r.dept} /> },
      { header: "Assigned subjects", cell: (r) => <SubjectChips titles={r.subjects} empty="Standby pool" /> },
      { header: "Experience & qualification", cell: (r) => <div className="min-w-[160px]"><div className="font-semibold text-slate-200">{r.experience_years ? `${r.experience_years} yr${r.experience_years === 1 ? "" : "s"} experience` : "—"}</div><div className="text-[11px] text-slate-400 truncate max-w-[220px]">{r.qualification || r.expertise || ""}</div></div> },
      { header: "Phone", cell: (r) => phoneCell(r.phone) },
      { header: "Status", cell: (r) => <StatusPill status={r.engaged ? "Engaged" : "Standby"} /> },
    ],
    parent: [
      { header: "Parent / guardian", cell: personCell },
      { header: "Phone & WhatsApp", cell: (r) => phoneCell(r.phone) },
      {
        header: "Linked children",
        cell: (r) => (r.linked_children?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {r.linked_children.map((c) => (
              <span key={c.id} className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-800 border border-slate-700 text-slate-200 whitespace-nowrap">
                {c.name}{c.roll_no ? <span className="text-slate-400"> · #{c.roll_no}</span> : null}
              </span>
            ))}
          </div>
        ) : <span className="text-slate-500 text-[11px] italic">No children linked</span>),
      },
      { header: "Joined", cell: (r) => <span className="text-slate-400 whitespace-nowrap">{fmtDate(r.date_joined)}</span> },
      { header: "Status", cell: (r) => <StatusPill status={r.status} /> },
    ],
    admin: [
      { header: "Admin account", cell: personCell },
      { header: "Access", cell: (r) => <span className="text-slate-300">{r.is_superuser ? "Super admin" : "Admin"}</span> },
      { header: "Created", cell: (r) => <span className="text-slate-400 whitespace-nowrap">{fmtDate(r.date_joined)}</span> },
      { header: "Status", cell: (r) => <StatusPill status={r.status} /> },
    ],
  }[role] || [];

  const askToggle = (r) =>
    setConfirm({
      title: r.is_active ? `Deactivate ${r.name}?` : `Activate ${r.name}?`,
      message: r.is_active ? "They won't be able to log in until you activate them again." : "They will be able to log in again.",
      label: r.is_active ? "Deactivate" : "Activate",
      variant: r.is_active ? "warning" : "primary",
      run: () => onToggleActive(r.id, r),
    });

  const askPurge = (r) =>
    setConfirm({
      title: `Permanently delete ${r.name}?`,
      message: "This removes the account and its records for good. It cannot be undone. Deactivate instead if you might need them later.",
      label: "Delete permanently",
      variant: "danger",
      run: () => onPurge(r.id),
    });

  const rowActions = (r) => (
    <>
      <IconButton icon="fa-eye" label="Details" onClick={() => setOpenId(r.id)} />
      <IconButton icon="fa-pen" label="Edit" onClick={() => onEdit(r.id)} tone="hover:text-emerald-300" />
      <IconButton icon={r.is_active ? "fa-user-slash" : "fa-user-check"} label={r.is_active ? "Deactivate" : "Activate"} onClick={() => askToggle(r)} tone="hover:text-amber-300" />
    </>
  );

  const bulkActions = [
    {
      label: "Export CSV",
      icon: "fa-download",
      onClick: (sel) => exportCsv(sel),
    },
    ...(role !== "admin"
      ? [{
          label: "Deactivate",
          icon: "fa-user-slash",
          destructive: true,
          onClick: (sel) => {
            const targets = sel.filter((r) => r.is_active);
            if (!targets.length) return;
            setConfirm({
              title: `Deactivate ${targets.length} ${cfg.noun}${targets.length === 1 ? "" : "s"}?`,
              message: "They won't be able to log in until activated again.",
              label: "Deactivate",
              variant: "warning",
              run: () => targets.forEach((r) => onToggleActive(r.id, r)),
            });
          },
        }]
      : []),
  ];

  const exportCsv = (list = filtered) => {
    const header = ["Name", "Email", "Phone", ...(role === "student" ? ["Roll #", "Level", "Subjects", "Fees", "Parent", "Parent phone"] : []), ...(role === "teacher" ? ["Department", "Subjects", "Experience", "Qualification", "Status"] : []), ...(role === "parent" ? ["Children"] : []), "Active", "Joined"];
    const data = list.map((r) => [
      r.name, r.email, r.phone || "",
      ...(role === "student" ? [r.roll_no || "", r.grade_level || "", r.subjects.join("; "), r.feeLabel || "", r.guardian?.name || "", r.guardian?.phone || ""] : []),
      ...(role === "teacher" ? [r.dept?.name || "", r.subjects.join("; "), r.experience_years || "", r.qualification || "", r.engaged ? "Engaged" : "Standby"] : []),
      ...(role === "parent" ? [(r.linked_children || []).map((c) => c.name).join("; ")] : []),
      r.is_active ? "Yes" : "No", fmtDate(r.date_joined),
    ]);
    downloadCsv(`vcs-${cfg.title.toLowerCase().replace(/\s+/g, "-")}.csv`, header, data);
  };

  const subtitle = {
    student: `${counts.all} students · ${counts.enrolled} enrolled · ${counts.notEnrolled} not enrolled in any subject`,
    teacher: `${counts.all} teachers · ${counts.engaged} engaged · ${counts.standby} in the standby pool`,
    parent: `${counts.all} parents · ${rows.filter((r) => r.linked_children?.length).length} with linked children`,
    admin: `${counts.all} admin accounts`,
  }[role];

  const openRow = rows.find((r) => r.id === openId);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title={cfg.title}
        subtitle={subtitle}
        primaryAction={{ label: cfg.add, icon: cfg.icon, onClick: onCreate }}
        extraActions={role !== "admin" && <ViewToggle value={view} onChange={setView} />}
        onExportCsv={() => exportCsv()}
        onRefresh={onRefresh}
      />

      <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder={`Search ${cfg.title.toLowerCase()} by name, email${role === "student" ? ", roll #" : ""}${role === "teacher" ? ", subject" : ""}…`}
        filters={filters}
        sortOptions={sortOptions}
        sort={sort}
        onSort={setSort}
      />

      {loading && rows.length === 0 ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-[#121831] animate-pulse" />)}</div>
      ) : view === "table" ? (
        <DataTable
          columns={columns}
          rows={filtered}
          onRowClick={(r) => setOpenId(r.id)}
          rowActions={rowActions}
          bulkActions={bulkActions}
          empty={<p className="py-16 text-center text-sm text-slate-400 rounded-2xl border border-[#232D52] bg-[#121831]">No {cfg.title.toLowerCase()} match these filters.</p>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpenId(r.id)}
              className="text-left p-5 rounded-2xl border border-[#232D52] bg-[#121831] hover:border-indigo-500/50 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={r.name} size="lg" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-100 truncate">{r.name}</div>
                    <div className="text-xs text-slate-400 truncate">
                      {role === "teacher" ? r.dept?.name || "No subjects yet" : role === "student" ? `${r.grade_level || "—"}${r.roll_no ? ` · #${r.roll_no}` : ""}` : r.email}
                    </div>
                  </div>
                </div>
                <StatusPill status={role === "teacher" ? (r.engaged ? "Engaged" : "Standby") : role === "student" ? r.feeLabel : r.status} />
              </div>
              {role === "parent" ? (
                <div className="text-xs text-slate-300 bg-[#0E1428] p-3 rounded-xl border border-[#1E2648]">
                  {r.linked_children?.length ? r.linked_children.map((c) => c.name).join(", ") : "No children linked"}
                </div>
              ) : (
                <SubjectChips titles={r.subjects} max={3} empty={role === "teacher" ? "Standby pool" : "Not enrolled"} />
              )}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#1E2648]">
                <div><span className="text-slate-500 block">{role === "teacher" ? "Experience" : "Joined"}</span><span className="font-semibold text-slate-200">{role === "teacher" ? (r.experience_years ? `${r.experience_years} years` : "—") : fmtDate(r.date_joined)}</span></div>
                <div><span className="text-slate-500 block">{role === "student" ? "Parent" : "Phone"}</span><span className="font-semibold text-slate-200 tabular-nums">{role === "student" ? r.guardian?.name || "—" : r.phone || "—"}</span></div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="col-span-full py-16 text-center text-sm text-slate-400">No {cfg.title.toLowerCase()} match these filters.</p>}
        </div>
      )}

      <PersonDrawer
        role={role}
        person={openRow}
        onClose={() => setOpenId(null)}
        onEdit={() => onEdit(openRow.id)}
        onView={() => onView(openRow.id)}
        onToggleActive={() => askToggle(openRow)}
        onPurge={() => askPurge(openRow)}
      />

      <ConfirmDialog
        open={!!confirm}
        variant={confirm?.variant || "primary"}
        title={confirm?.title || ""}
        message={confirm?.message || ""}
        confirmLabel={confirm?.label || "Confirm"}
        onConfirm={() => { const c = confirm; setConfirm(null); c?.run(); }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default PeopleDirectory;
