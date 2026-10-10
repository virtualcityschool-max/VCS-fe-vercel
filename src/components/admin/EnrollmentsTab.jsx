import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { clearEnrollmentsError, unenrollStudent } from "../../store/slices/adminSlice";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import ConfirmDialog from "../common/ConfirmDialog";
import CreateEnrollmentModal from "./CreateEnrollmentModal";
import { PageHeader, SegmentedTabs, FilterBar, DataTable, StatusPill, DeptPill, SubjectChips, Avatar, IconButton } from "./ui";
import { DEPARTMENTS, departmentOf } from "./ui/departments";
import { downloadCsv } from "./ui/csv";

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

// What the student's access to this subject looks like right now.
const feeLabel = (e) => {
  if (e.status === "cancelled") return "Cancelled";
  if (e.status === "pending") return "Pending";
  if (!e.access_expires_at) return e.course?.is_paid ? "No expiry" : "Free";
  if (!e.has_access) return "Expired";
  const d = e.days_remaining ?? 0;
  return d <= 7 ? `Ends in ${Math.max(d, 0)}d` : "Paid";
};

const sourceLabel = (s) => ({ gumroad: "Gumroad", admin: "Paid to admin", free_access: "Scholarship" }[s] || (s ? s.replace(/_/g, " ") : "—"));

const EnrollmentsTab = ({ enrollments = [], loading, onRefresh }) => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("enrollment"); // enrollment | student
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [level, setLevel] = useState("all");
  const [fee, setFee] = useState("all");
  const [sort, setSort] = useState("newest");
  const [createFor, setCreateFor] = useState(undefined); // undefined = closed, null = any student
  const [unenroll, setUnenroll] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const rows = useMemo(
    () =>
      enrollments.map((e) => ({
        ...e,
        studentName: e.student?.username || e.student?.email || "Student",
        title: e.course?.title || "Subject",
        level: e.course?.category?.name || null,
        dept: departmentOf(e.course?.title || ""),
        fee: feeLabel(e),
        price: e.course?.is_paid ? parseFloat(e.course?.price) || 0 : 0,
      })),
    [enrollments],
  );

  const count = (st) => rows.filter((r) => r.status === st).length;
  const levels = [...new Set(rows.map((r) => r.level).filter(Boolean))].sort();
  const q = search.trim().toLowerCase();

  const filtered = rows
    .filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (dept !== "all" && r.dept.id !== dept) return false;
      if (level !== "all" && r.level !== level) return false;
      if (fee !== "all" && (fee === "ending" ? !r.fee.startsWith("Ends in") : r.fee !== fee)) return false;
      if (!q) return true;
      return [r.studentName, r.student?.email, r.student?.roll_no, r.title, r.level].some((v) => (v || "").toString().toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sort === "oldest") return new Date(a.enrolled_at) - new Date(b.enrolled_at);
      if (sort === "student") return a.studentName.localeCompare(b.studentName);
      if (sort === "fee") return b.price - a.price;
      return new Date(b.enrolled_at) - new Date(a.enrolled_at);
    });

  // One row per student for the "By student" view.
  const byStudent = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const id = r.student?.id;
      const g = map.get(id) || { id, student: r.student, studentName: r.studentName, items: [], latest: null, monthly: 0 };
      g.items.push(r);
      if (!g.latest || new Date(r.enrolled_at) > new Date(g.latest)) g.latest = r.enrolled_at;
      if (r.status === "active") g.monthly += r.price;
      map.set(id, g);
    });
    return [...map.values()];
  }, [filtered]);

  const studentCell = (r) => (
    <div className="flex items-center gap-3 min-w-[170px]">
      <Avatar name={r.studentName} />
      <div className="min-w-0">
        <div className="font-semibold text-slate-100 truncate">{r.studentName}</div>
        <div className="text-[11px] text-slate-400 truncate">{r.student?.roll_no ? `Roll #${r.student.roll_no} · ` : ""}{r.student?.email}</div>
      </div>
    </div>
  );

  const enrollmentColumns = [
    { header: "Student", cell: studentCell },
    {
      header: "Subject",
      cell: (r) => (
        <div className="min-w-[200px] max-w-[300px]">
          <div className="font-medium text-slate-100 truncate" title={r.title}>{r.title}</div>
          <div className="text-[11px] text-slate-400">{r.level || "—"}{r.is_private ? " · 1-to-1" : ""}</div>
        </div>
      ),
    },
    { header: "Department", cell: (r) => <DeptPill dept={r.dept} /> },
    { header: "Enrolled", cell: (r) => <span className="text-slate-400 whitespace-nowrap tabular-nums">{fmtDate(r.enrolled_at)}</span> },
    { header: "Fee", align: "right", cell: (r) => <span className="tabular-nums font-semibold text-slate-200 whitespace-nowrap">{r.price ? `$${r.price}/mo` : <span className="text-emerald-400">Free</span>}</span> },
    { header: "Payment", cell: (r) => <div className="whitespace-nowrap"><StatusPill status={r.fee} /><div className="text-[10px] text-slate-500 mt-1">{sourceLabel(r.enrollment_source)}</div></div> },
    { header: "Status", cell: (r) => <StatusPill status={r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "—"} /> },
  ];

  const studentColumns = [
    { header: "Student", cell: studentCell },
    {
      header: "Subjects",
      cell: (g) => (
        <div className="flex items-center gap-2">
          <SubjectChips titles={g.items.map((i) => i.title)} max={3} />
          <button type="button" onClick={(e) => { e.stopPropagation(); setCreateFor(g.id); }} className="px-2 py-0.5 rounded border border-dashed border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/15 text-[11px] whitespace-nowrap">
            + Add subject
          </button>
        </div>
      ),
    },
    { header: "Total", align: "right", cell: (g) => <span className="tabular-nums text-slate-200">{g.items.length}</span> },
    { header: "Monthly fees", align: "right", cell: (g) => <span className="tabular-nums font-semibold text-slate-200">{g.monthly ? `$${g.monthly}` : "—"}</span> },
    { header: "Latest", cell: (g) => <span className="text-slate-400 whitespace-nowrap">{fmtDate(g.latest)}</span> },
    {
      header: "Payments",
      cell: (g) => {
        const worst = g.items.find((i) => i.fee === "Expired") || g.items.find((i) => i.fee.startsWith("Ends in"));
        return <StatusPill status={worst ? worst.fee : "All paid"} />;
      },
    },
  ];

  const confirmUnenroll = async () => {
    const e = unenroll;
    setUnenroll(null);
    if (!e) return;
    setBusyId(e.id);
    try {
      await dispatch(unenrollStudent({ courseId: e.course.id, studentId: e.student.id })).unwrap();
      toastManager.success("Student unenrolled");
    } catch (err) {
      showApiError(err);
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = (list = filtered) =>
    downloadCsv(
      "vcs-enrollments.csv",
      ["Student", "Roll #", "Email", "Subject", "Level", "Department", "Enrolled", "Fee (USD/mo)", "Payment", "Source", "Status"],
      list.map((r) => [r.studentName, r.student?.roll_no || "", r.student?.email || "", r.title, r.level || "", r.dept.name, fmtDate(r.enrolled_at), r.price || 0, r.fee, sourceLabel(r.enrollment_source), r.status]),
    );

  const studentsCount = new Set(rows.filter((r) => r.status === "active").map((r) => r.student?.id)).size;
  const monthly = rows.filter((r) => r.status === "active").reduce((s, r) => s + r.price, 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Student Enrollments"
        subtitle={`${count("active")} active enrollments · ${studentsCount} students · $${monthly.toLocaleString("en-US")} a month in fees`}
        primaryAction={{ label: "Enroll student", icon: "fa-user-plus", onClick: () => { dispatch(clearEnrollmentsError()); setCreateFor(null); } }}
        extraActions={
          <div className="flex items-center rounded-xl border border-[#232D52] bg-[#121831] p-0.5 text-xs font-semibold">
            {[{ id: "enrollment", label: "By enrollment" }, { id: "student", label: "By student" }].map((m) => (
              <button key={m.id} type="button" onClick={() => setMode(m.id)} className={`h-9 px-3 rounded-lg ${mode === m.id ? "bg-[#6D5BFF] text-white" : "text-slate-400 hover:text-white"}`}>
                {m.label}
              </button>
            ))}
          </div>
        }
        onExportCsv={() => exportCsv()}
        onRefresh={onRefresh}
      />

      <SegmentedTabs
        tabs={[
          { id: "all", label: "All", count: rows.length },
          { id: "active", label: "Active", count: count("active") },
          { id: "pending", label: "Pending", count: count("pending") },
          { id: "cancelled", label: "Cancelled", count: count("cancelled") },
        ]}
        value={status}
        onChange={setStatus}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search student, roll # or subject…"
        filters={[
          { id: "dept", label: "Department", value: dept, onChange: setDept, options: DEPARTMENTS.map((d) => ({ label: d.name, value: d.id, count: rows.filter((r) => r.dept.id === d.id).length })) },
          { id: "level", label: "Level", value: level, onChange: setLevel, options: levels.map((l) => ({ label: l, value: l })) },
          { id: "fee", label: "Payment", value: fee, onChange: setFee, options: [{ label: "Paid", value: "Paid" }, { label: "Ending within 7 days", value: "ending" }, { label: "Expired", value: "Expired" }, { label: "Free", value: "Free" }, { label: "No expiry", value: "No expiry" }] },
        ]}
        sortOptions={[
          { label: "Newest first", value: "newest" },
          { label: "Oldest first", value: "oldest" },
          { label: "Student (A–Z)", value: "student" },
          { label: "Fee (highest)", value: "fee" },
        ]}
        sort={sort}
        onSort={setSort}
      />

      {loading && rows.length === 0 ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-[#121831] animate-pulse" />)}</div>
      ) : mode === "enrollment" ? (
        <DataTable
          columns={enrollmentColumns}
          rows={filtered}
          rowActions={(r) => (
            <>
              <IconButton icon="fa-user-plus" label="Add another subject for this student" onClick={() => setCreateFor(r.student?.id)} />
              {r.status !== "cancelled" && (
                <IconButton icon="fa-user-minus" label="Unenroll" onClick={() => setUnenroll(r)} tone="hover:text-rose-300" disabled={busyId === r.id} />
              )}
            </>
          )}
          bulkActions={[{ label: "Export CSV", icon: "fa-download", onClick: (sel) => exportCsv(sel) }]}
          empty={<p className="py-16 text-center text-sm text-slate-400 rounded-2xl border border-[#232D52] bg-[#121831]">No enrollments match these filters.</p>}
        />
      ) : (
        <DataTable
          columns={studentColumns}
          rows={byStudent}
          rowActions={(g) => <IconButton icon="fa-user-plus" label="Enroll in another subject" onClick={() => setCreateFor(g.id)} />}
          empty={<p className="py-16 text-center text-sm text-slate-400 rounded-2xl border border-[#232D52] bg-[#121831]">No students match these filters.</p>}
        />
      )}

      <CreateEnrollmentModal
        isOpen={createFor !== undefined}
        onClose={() => { setCreateFor(undefined); dispatch(clearEnrollmentsError()); }}
        onSuccess={() => {}}
        initialStudentId={createFor || null}
      />

      <ConfirmDialog
        open={!!unenroll}
        variant="danger"
        title="Unenroll this student?"
        message={unenroll ? `Remove ${unenroll.studentName} from ${unenroll.title}?` : ""}
        confirmLabel="Unenroll"
        onConfirm={confirmUnenroll}
        onCancel={() => setUnenroll(null)}
      />
    </div>
  );
};

export default EnrollmentsTab;
