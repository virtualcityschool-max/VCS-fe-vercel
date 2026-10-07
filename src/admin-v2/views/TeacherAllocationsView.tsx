import React, { useState } from 'react';
import { subjectChip } from '../utils';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig, SortOption } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { Teacher, DepartmentName } from '../types';
import {
  GitFork,
  BookOpen,
  Plus,
  AlertTriangle,
  CheckCircle,
  X,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DEPARTMENT_CONFIG } from '../data/departments';

export const TeacherAllocationsView: React.FC = () => {
  const {
    teachers,
    subjects,
    allocateTeacherSubject,
    deallocateTeacherSubject,
    openDetailDrawer,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [workloadFilter, setWorkloadFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('hours-desc');

  // Allocation modal
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [targetTeacherId, setTargetTeacherId] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState('');

  // Subjects without assigned teacher
  const unassignedSubjects = subjects.filter(
    (s) => !s.teacherId || !teachers.some((t) => t.id === s.teacherId)
  );

  const filters: FilterConfig[] = [
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
    {
      id: 'workload',
      label: 'Load Status',
      value: workloadFilter,
      onChange: setWorkloadFilter,
      options: [
        { label: 'High Load (>18h)', value: 'high' },
        { label: 'Balanced (10-18h)', value: 'balanced' },
        { label: 'Available / Standby (<10h)', value: 'available' },
      ],
    },
  ];

  const sortOptions: SortOption[] = [
    { label: 'Hours (Highest)', value: 'hours-desc' },
    { label: 'Hours (Lowest)', value: 'hours-asc' },
    { label: 'Name (A-Z)', value: 'name-asc' },
  ];

  const filtered = teachers.filter((teacher) => {
    const matchSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDept = deptFilter === 'all' || teacher.department === deptFilter;

    let matchLoad = true;
    if (workloadFilter === 'high') matchLoad = teacher.weeklyHours >= 18;
    else if (workloadFilter === 'balanced') matchLoad = teacher.weeklyHours >= 10 && teacher.weeklyHours < 18;
    else if (workloadFilter === 'available') matchLoad = teacher.weeklyHours < 10;

    return matchSearch && matchDept && matchLoad;
  });

  if (currentSort === 'hours-desc') {
    filtered.sort((a, b) => b.weeklyHours - a.weeklyHours);
  } else if (currentSort === 'hours-asc') {
    filtered.sort((a, b) => a.weeklyHours - b.weeklyHours);
  } else if (currentSort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    allocateTeacherSubject(targetTeacherId, targetSubjectId);
    setAllocModalOpen(false);
  };

  const maxStandardHours = 24;

  const columns: Column<Teacher>[] = [
    {
      header: 'Faculty Member',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name[0]}
          </div>
          <div className="truncate">
            <div className="font-semibold text-slate-100">{row.name}</div>
            <div className="text-[11px] text-slate-400 font-mono truncate">{row.department}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Allocated Course Modules',
      cell: (row) => {
        const assigned = subjects.filter((s) => row.assignedSubjectIds.includes(s.id));

        return (
          <div className="flex items-center gap-1.5 flex-wrap max-w-md">
            {assigned.map((sub) => (
              <span
                key={sub.id}
                className="group/chip inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium bg-[#151D3A] text-slate-200 border border-[#232D52] hover:border-slate-500"
              >
                <span className="text-indigo-400 font-bold">{subjectChip(sub)}</span>
                {sub.code && <span>{sub.name.slice(0, 14)}...</span>}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deallocateTeacherSubject(row.id, sub.id);
                  }}
                  className="text-slate-400 hover:text-rose-400 ml-0.5 opacity-60 group-hover/chip:opacity-100"
                  title="Remove allocation"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {assigned.length === 0 && (
              <span className="text-slate-500 text-xs italic">Unallocated (Standby capacity)</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Weekly Teaching Load',
      cell: (row) => {
        const loadPct = Math.min(100, Math.round((row.weeklyHours / maxStandardHours) * 100));
        const isHigh = row.weeklyHours >= 20;

        return (
          <div className="w-40 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-200">{row.weeklyHours} hrs/wk</span>
              <span className={isHigh ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                {loadPct}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isHigh ? 'bg-amber-500' : 'bg-[#6D5BFF]'
                }`}
                style={{ width: `${loadPct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Action',
      cell: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTargetTeacherId(row.id);
            setAllocModalOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Allocate</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Teacher Allocations"
        subtitle="Distribute Cambridge course syllabi, balance faculty weekly seminar hours, and manage standby pools."
        primaryAction={{
          label: 'Allocate course',
          onClick: () => setAllocModalOpen(true),
          icon: GitFork,
        }}
      />

      {/* Unassigned courses alert if any exist */}
      {unassignedSubjects.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">
                {unassignedSubjects.length} Cambridge course(s) require teacher allocation:
              </span>
              <span className="text-slate-300 ml-1.5">
                {unassignedSubjects.map((s) => `${s.code} ${s.name}`).join(', ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setTargetSubjectId(unassignedSubjects[0].id);
              setAllocModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors whitespace-nowrap self-end sm:self-center"
          >
            Assign Tutor Now
          </button>
        </div>
      )}

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search teacher name or department..."
        filters={filters}
        sortOptions={sortOptions}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => openDetailDrawer('teacher', row)}
      />

      {/* Allocate Course Modal */}
      {allocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-slate-100">Allocate Teacher to Course</h3>
            <p className="text-xs text-slate-400">
              Assign a faculty tutor to a Cambridge syllabus and update timetable ownership.
            </p>

            <form onSubmit={handleAllocationSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Faculty Tutor *</label>
                <select
                  required
                  value={targetTeacherId}
                  onChange={(e) => setTargetTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Choose a teacher</option>
                  {[...teachers].sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department} - {t.weeklyHours}h/wk)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Cambridge Course *</label>
                <select
                  required
                  value={targetSubjectId}
                  onChange={(e) => setTargetSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({[s.department, s.level].filter(Boolean).join(' · ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2648]">
                <button
                  type="button"
                  onClick={() => setAllocModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
