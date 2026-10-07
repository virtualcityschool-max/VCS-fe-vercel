import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig, SortOption } from '../components/common/FilterBar';
import { StatusPill } from '../components/common/StatusPill';
import { EnrollmentRecord } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { Field, MultiPick, SelectInput } from '../components/common/FormControls';

export const StudentEnrollmentsView: React.FC = () => {
  const {
    enrollments,
    students,
    subjects,
    addEnrollments,
    removeEnrollment,
    openDetailDrawer,
    addToast,
  } = useApp() as any;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('date-desc');
  const [modalOpen, setModalOpen] = useState(false);

  // New enrollment form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [pickedSubjects, setPickedSubjects] = useState<string[]>([]);
  const pickedStudent = students.find((s: any) => s.id === selectedStudentId);
  // Published subjects at the student's level that they are not already taking.
  const subjectChoices = useMemo(() => {
    if (!pickedStudent) return [];
    const taken = new Set(pickedStudent.enrolledSubjectIds || []);
    const atLevel = subjects.filter((s: any) => s.status === 'Published' && !taken.has(s.id));
    const sameLevel = pickedStudent.level ? atLevel.filter((s: any) => s.level === pickedStudent.level) : [];
    return (sameLevel.length ? sameLevel : atLevel)
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .map((s: any) => ({ value: s.id, label: s.name, sub: s.priceUSD ? `$${s.priceUSD}/mo` : 'Free' }));
  }, [pickedStudent, subjects]);

  const filters: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'Active', value: 'Active', count: enrollments.filter((e) => e.status === 'Active').length },
        { label: 'Pending', value: 'Pending', count: enrollments.filter((e) => (e.status as string) === 'Pending').length },
      ],
    },
    {
      id: 'dept',
      label: 'Department',
      value: deptFilter,
      onChange: setDeptFilter,
      options: [
        { label: 'Mathematics', value: 'Mathematics' },
        { label: 'Physics', value: 'Physics' },
        { label: 'Chemistry', value: 'Chemistry' },
        { label: 'Biology', value: 'Biology' },
        { label: 'Computer Science', value: 'Computer Science' },
        { label: 'English & Urdu', value: 'English & Urdu' },
        { label: 'General', value: 'General' },
      ],
    },
  ];

  const sortOptions: SortOption[] = [
    { label: 'Latest enrolment', value: 'date-desc' },
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Most subjects', value: 'count-desc' },
  ];

  const filtered = enrollments.filter((record) => {
    const student = students.find((s) => s.id === record.studentId);
    const subject = subjects.find((s) => s.id === record.subjectId);

    const matchSearch =
      (student?.name.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (student?.rollNo.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (subject?.name.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (subject?.code.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (record.electiveGroup?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchDept = deptFilter === 'all' || subject?.department === deptFilter;

    return matchSearch && matchStatus && matchDept;
  });

  // One group per student: the student once, then each of their subjects.
  const groups = useMemo(() => {
    const byStudent = new Map<string, EnrollmentRecord[]>();
    filtered.forEach((r) => byStudent.set(r.studentId, [...(byStudent.get(r.studentId) || []), r]));
    const list = [...byStudent.entries()].map(([studentId, rows]) => ({
      studentId,
      student: students.find((st) => st.id === studentId),
      rows: [...rows].sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate)),
      latest: rows.reduce((m, r) => (r.enrollmentDate > m ? r.enrollmentDate : m), ''),
    }));
    if (currentSort === 'name-asc') list.sort((a, b) => (a.student?.name || '').localeCompare(b.student?.name || ''));
    else if (currentSort === 'count-desc') list.sort((a, b) => b.rows.length - a.rows.length);
    else list.sort((a, b) => b.latest.localeCompare(a.latest));
    return list;
  }, [filtered, students, currentSort]);

  const PAGE = 10;
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [searchQuery, statusFilter, deptFilter, currentSort]);
  const pages = Math.max(1, Math.ceil(groups.length / PAGE));
  const pageGroups = groups.slice((Math.min(page, pages) - 1) * PAGE, Math.min(page, pages) * PAGE);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || pickedSubjects.length === 0) return;
    const ok = await addEnrollments(selectedStudentId, pickedSubjects);
    if (ok) {
      setModalOpen(false);
      setPickedSubjects([]);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Student Enrollments"
        subtitle="Manage subject seat allocations, elective groups, free trial conversions, and curriculum tracking."
        primaryAction={{
          label: 'Enroll in course',
          onClick: () => setModalOpen(true),
          icon: Plus,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by student, roll #, subject name or code..."
        filters={filters}
        sortOptions={sortOptions}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />

      <div className="rounded-2xl border border-[#232D52] bg-[#121831] shadow-xl overflow-hidden">
        {pageGroups.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400">No enrolments match these filters.</div>
        )}
        {pageGroups.map(({ studentId, student, rows }) => {
          const active = rows.filter((r) => r.status === 'Active');
          const listed = active.reduce((sum, r) => sum + (r.monthlyFeeUSD || 0), 0);
          const attention = rows.filter((r) => ['Expiring Soon', 'Overdue', 'Access expired', 'Pending'].includes(r.feeStatus as string)).length;
          return (
            <div key={studentId} className="border-b border-[#1E2648] last:border-b-0">
              {/* Student */}
              <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-[#0E1428]/60">
                <button
                  onClick={() => student && openDetailDrawer('student', student)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                    {(student?.name || 'S')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-100 group-hover:text-white truncate">{student?.name || 'Student'}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      Roll {student?.rollNo ?? '—'}{student?.level ? ` · ${student.level}` : ''}
                    </div>
                  </div>
                </button>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-[#1A2346] border border-[#232D52] text-slate-200 font-semibold">
                    {active.length} active subject{active.length === 1 ? '' : 's'}
                  </span>
                  {listed > 0 && <span className="text-slate-400 font-mono">${listed}/mo listed</span>}
                  {attention > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">{attention} need attention</span>
                  )}
                  <button
                    onClick={() => { setSelectedStudentId(studentId); setPickedSubjects([]); setModalOpen(true); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#232D52] text-slate-300 hover:text-white hover:border-[#6D5BFF]"
                  >
                    <Plus className="w-3 h-3" /> Add subject
                  </button>
                </div>
              </div>
              {/* Their subjects */}
              <div className="divide-y divide-[#1E2648]/50">
                {rows.map((r) => {
                  const subject = subjects.find((x) => x.id === r.subjectId);
                  return (
                    <div key={r.id} className="grid grid-cols-12 items-center gap-3 pl-16 pr-4 py-2.5 text-xs hover:bg-[#1A2346]/30">
                      <div className="col-span-12 md:col-span-5 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {subject?.code && <span className="font-mono font-bold text-indigo-400">{subject.code}</span>}
                          <span className="font-semibold text-slate-200 truncate">{subject?.name || 'Subject'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{[subject?.department, subject?.level].filter(Boolean).join(' · ')}</div>
                      </div>
                      <div className="col-span-4 md:col-span-2 text-slate-400">
                        <div className="font-mono">{r.enrollmentDate}</div>
                        <div className="text-[10px] text-slate-500">{(r as any).source}</div>
                      </div>
                      <div className="col-span-3 md:col-span-1 font-mono text-slate-300">
                        {r.monthlyFeeUSD ? `$${r.monthlyFeeUSD}/mo` : 'Free'}
                      </div>
                      <div className="col-span-5 md:col-span-3 flex flex-wrap gap-1.5">
                        <StatusPill status={r.feeStatus} />
                        {r.status !== 'Active' && <StatusPill status={r.status} />}
                        {r.electiveGroup && r.electiveGroup !== 'Group class' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#151D3A] text-slate-300 border border-[#232D52]">{r.electiveGroup}</span>
                        )}
                      </div>
                      <div className="col-span-12 md:col-span-1 flex justify-end">
                        <button
                          onClick={() => removeEnrollment(r.id)}
                          title="Remove from this subject"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {/* Pages of students */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#1E2648] bg-[#0E1428] text-xs text-slate-400">
          <span>
            {groups.length} student{groups.length === 1 ? '' : 's'} · {filtered.length} enrolment{filtered.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2.5 py-1 rounded-lg border border-[#232D52] disabled:opacity-40">‹</button>
            <span className="font-mono">{Math.min(page, pages)} / {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="px-2.5 py-1 rounded-lg border border-[#232D52] disabled:opacity-40">›</button>
          </div>
        </div>
      </div>

      {/* Enroll in course modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-100">Enrol a student</h3>
              <p className="text-xs text-slate-400">Pick the student, then tick one or more subjects.</p>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              <Field label="Student" required>
                <SelectInput
                  required
                  value={selectedStudentId}
                  onChange={(v) => { setSelectedStudentId(v); setPickedSubjects([]); }}
                  placeholder="Choose a student"
                  options={[...students]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((s) => ({ value: s.id, label: `${s.name}${s.level ? ` · ${s.level}` : ''}` }))}
                />
              </Field>

              <Field
                label="Subjects"
                required
                hint={pickedStudent?.level ? `Showing ${pickedStudent.level} subjects they are not already taking.` : 'Showing all published subjects they are not already taking.'}
              >
                <MultiPick
                  options={subjectChoices}
                  selected={pickedSubjects}
                  onChange={setPickedSubjects}
                  placeholder="Search subjects…"
                  emptyText={selectedStudentId ? 'No more subjects to add at this level.' : 'Choose a student first.'}
                />
              </Field>

              <p className="text-[11px] text-slate-500">
                Paid subjects start a one-month access window from today; free subjects never expire.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2648]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudentId || pickedSubjects.length === 0}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white disabled:opacity-50"
                >
                  {pickedSubjects.length > 1 ? `Enrol in ${pickedSubjects.length} subjects` : 'Enrol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
