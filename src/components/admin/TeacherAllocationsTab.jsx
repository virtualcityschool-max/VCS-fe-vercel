import React, { useMemo, useState } from "react";
import { getDisplayName } from "../../utils/userDisplay";
import ConfirmDialog from "../common/ConfirmDialog";
import { PageHeader, SegmentedTabs, FilterBar, DataTable, StatusPill, DeptPill, Avatar, IconButton } from "./ui";
import { DEPARTMENTS, departmentOf, mainDepartment } from "./ui/departments";

const levelOf = (c) => (typeof c.category === "object" ? c.category?.name : c.category) || "";
const teacherIdOf = (c) => c.instructor?.id || c.instructor_id || null;

// Subject → teacher allocation, seen from the teacher's side (who teaches
// what, how loaded they are) and from the gaps (published subjects with no
// teacher). Assign / unassign use the page's existing handlers.
const TeacherAllocationsTab = ({ courses = [], teachers = [], loading, onAssignTeacher, onUnassignTeacher, onRefresh }) => {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [sort, setSort] = useState("load");
  const [modal, setModal] = useState(null); // { teacherId?, courseId? }
  const [pickCourse, setPickCourse] = useState("");
  const [pickTeacher, setPickTeacher] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () =>
      teachers.map((t) => {
        const taught = courses.filter((c) => String(teacherIdOf(c)) === String(t.id));
        return {
          ...t,
          name: getDisplayName(t) || t.email,
          taught,
          students: taught.reduce((s, c) => s + (c.enrolled_students_count || 0), 0),
          dept: mainDepartment(taught.map((c) => c.title)),
        };
      }),
    [teachers, courses],
  );

  const unassigned = courses.filter((c) => !teacherIdOf(c) && c.status === "published");
  const maxLoad = Math.max(1, ...rows.map((r) => r.taught.length));
  const q = search.trim().toLowerCase();

  const filteredTeachers = rows
    .filter((r) => {
      if (tab === "engaged" && !r.taught.length) return false;
      if (tab === "standby" && r.taught.length) return false;
      if (dept !== "all" && r.dept?.id !== dept) return false;
      return !q || [r.name, r.email, ...r.taught.map((c) => c.title)].some((v) => (v || "").toLowerCase().includes(q));
    })
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "students" ? b.students - a.students : b.taught.length - a.taught.length));

  const filteredGaps = unassigned
    .filter((c) => (dept === "all" || departmentOf(c.title).id === dept) && (!q || [c.title, levelOf(c)].some((v) => v.toLowerCase().includes(q))))
    .sort((a, b) => (b.enrolled_students_count || 0) - (a.enrolled_students_count || 0));

  const openAllocate = ({ teacherId = "", courseId = "" } = {}) => {
    setPickTeacher(teacherId ? String(teacherId) : "");
    setPickCourse(courseId ? String(courseId) : "");
    setModal({ teacherId, courseId });
  };

  const pickedCourse = courses.find((c) => String(c.id) === pickCourse);
  const currentTeacher = pickedCourse && teacherIdOf(pickedCourse) ? rows.find((r) => String(r.id) === String(teacherIdOf(pickedCourse))) : null;

  const saveAllocation = async () => {
    if (!pickCourse || !pickTeacher) return;
    setSaving(true);
    const ok = await onAssignTeacher(Number(pickCourse), Number(pickTeacher));
    setSaving(false);
    if (ok !== false) setModal(null);
  };

  const teacherColumns = [
    {
      header: "Teacher",
      cell: (r) => (
        <div className="flex items-center gap-3 min-w-[170px]">
          <Avatar name={r.name} />
          <div className="min-w-0">
            <div className="font-semibold text-slate-100 truncate">{r.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{r.email}</div>
          </div>
        </div>
      ),
    },
    { header: "Department", cell: (r) => <DeptPill dept={r.dept} /> },
    {
      header: "Allocated subjects",
      cell: (r) =>
        r.taught.length ? (
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {r.taught.map((c) => {
              const d = departmentOf(c.title);
              return (
                <span key={c.id} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg text-[11px] border bg-[#151D3A] border-[#232D52] text-slate-200 max-w-[220px]" title={c.title}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.hex }} />
                  <span className="truncate">{c.title}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${r.name} from ${c.title}`}
                    onClick={(e) => { e.stopPropagation(); setConfirm({ course: c, teacher: r }); }}
                    className="w-5 h-5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                  >
                    <i className="fas fa-xmark text-[10px]" aria-hidden="true" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-slate-500 text-xs italic">Unallocated (standby)</span>
        ),
    },
    {
      header: "Load",
      cell: (r) => {
        const pct = Math.round((r.taught.length / maxLoad) * 100);
        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-xs tabular-nums">
              <span className="font-bold text-slate-200">{r.taught.length} subject{r.taught.length === 1 ? "" : "s"}</span>
              <span className="text-slate-400">{r.students} students</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pct >= 80 ? "bg-amber-500" : "bg-[#6D5BFF]"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
    { header: "Status", cell: (r) => <StatusPill status={r.taught.length ? "Engaged" : "Standby"} /> },
  ];

  const gapColumns = [
    { header: "Subject", cell: (c) => <div className="font-semibold text-slate-100 min-w-[220px] max-w-[340px] truncate" title={c.title}>{c.title}</div> },
    { header: "Department", cell: (c) => <DeptPill dept={departmentOf(c.title)} /> },
    { header: "Level", cell: (c) => <span className="text-slate-300 whitespace-nowrap">{levelOf(c) || "—"}</span> },
    { header: "Students", align: "right", cell: (c) => <span className={`tabular-nums font-semibold ${c.enrolled_students_count ? "text-amber-300" : "text-slate-400"}`}>{c.enrolled_students_count || 0}</span> },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Teacher Allocations"
        subtitle={`${rows.filter((r) => r.taught.length).length} teachers engaged · ${rows.filter((r) => !r.taught.length).length} on standby · ${unassigned.length} published subject${unassigned.length === 1 ? "" : "s"} without a teacher`}
        primaryAction={{ label: "Allocate subject", icon: "fa-link", onClick: () => openAllocate() }}
        onRefresh={onRefresh}
      />

      <SegmentedTabs
        tabs={[
          { id: "all", label: "All teachers", count: rows.length },
          { id: "engaged", label: "Engaged", count: rows.filter((r) => r.taught.length).length },
          { id: "standby", label: "Standby pool", count: rows.filter((r) => !r.taught.length).length },
          { id: "gaps", label: "Subjects without teacher", count: unassigned.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder={tab === "gaps" ? "Search subject or level…" : "Search teacher or subject…"}
        filters={[{ id: "dept", label: "Department", value: dept, onChange: setDept, options: DEPARTMENTS.map((d) => ({ label: d.name, value: d.id })) }]}
        sortOptions={tab === "gaps" ? [] : [{ label: "Most subjects", value: "load" }, { label: "Most students", value: "students" }, { label: "Name (A–Z)", value: "name" }]}
        sort={sort}
        onSort={setSort}
      />

      {loading && rows.length === 0 ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-[#121831] animate-pulse" />)}</div>
      ) : tab === "gaps" ? (
        <DataTable
          columns={gapColumns}
          rows={filteredGaps}
          rowActions={(c) => (
            <button type="button" onClick={() => openAllocate({ courseId: c.id })} className="px-2.5 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold whitespace-nowrap">
              + Assign teacher
            </button>
          )}
          empty={<p className="py-16 text-center text-sm text-emerald-300 rounded-2xl border border-[#232D52] bg-[#121831]">Every published subject has a teacher ✓</p>}
        />
      ) : (
        <DataTable
          columns={teacherColumns}
          rows={filteredTeachers}
          rowActions={(r) => (
            <button type="button" onClick={() => openAllocate({ teacherId: r.id })} className="px-2.5 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold whitespace-nowrap">
              + Allocate
            </button>
          )}
          empty={<p className="py-16 text-center text-sm text-slate-400 rounded-2xl border border-[#232D52] bg-[#121831]">No teachers match these filters.</p>}
        />
      )}

      {modal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Allocate subject">
          <button type="button" aria-label="Close" onClick={() => setModal(null)} className="absolute inset-0 bg-black/60 cursor-default" />
          <div className="relative w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold">Allocate a teacher to a subject</h3>
            <label className="block">
              <span className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</span>
              <select value={pickCourse} onChange={(e) => setPickCourse(e.target.value)} className="w-full h-10 px-3 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500">
                <option value="">Choose a subject…</option>
                {[...courses].sort((a, b) => (a.title || "").localeCompare(b.title || "")).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}{teacherIdOf(c) ? "" : "  (no teacher)"}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-slate-300 mb-1.5">Teacher</span>
              <select value={pickTeacher} onChange={(e) => setPickTeacher(e.target.value)} className="w-full h-10 px-3 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500">
                <option value="">Choose a teacher…</option>
                {[...rows].sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
                  <option key={t.id} value={t.id}>{t.name} · {t.taught.length} subject{t.taught.length === 1 ? "" : "s"}</option>
                ))}
              </select>
            </label>
            {currentTeacher && String(currentTeacher.id) !== pickTeacher && (
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                This subject is currently taught by {currentTeacher.name}. Saving replaces them.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="h-10 px-4 text-xs font-semibold rounded-xl text-slate-300 hover:text-white">Cancel</button>
              <button type="button" disabled={!pickCourse || !pickTeacher || saving} onClick={saveAllocation} className="h-10 px-4 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white disabled:opacity-50">
                {saving ? "Saving…" : "Save allocation"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        variant="warning"
        title="Remove this allocation?"
        message={confirm ? `${confirm.teacher.name} will no longer be the teacher of ${confirm.course.title}. The subject will show as "without teacher".` : ""}
        confirmLabel="Remove"
        onConfirm={() => { const c = confirm; setConfirm(null); onUnassignTeacher(c.course.id); }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default TeacherAllocationsTab;
