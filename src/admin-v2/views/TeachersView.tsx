import React, { useState } from 'react';
import { subjectChip } from '../utils';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig, SortOption } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { Teacher, DepartmentName } from '../types';
import {
  GraduationCap,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  Mail,
  BookOpen,
  Award,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { DEPARTMENT_CONFIG } from '../data/mockData';

export const TeachersView: React.FC = () => {
  const {
    teachers,
    subjects,
    openDetailDrawer,
    openQuickAdd,
    toggleTeacherStatus,
    bulkAssignSubject,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'engaged' | 'standby'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('name-asc');

  // Bulk subject modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedSubjectToAssign, setSelectedSubjectToAssign] = useState(subjects[0]?.id || '');
  const [pendingBulkTeacherIds, setPendingBulkTeacherIds] = useState<string[]>([]);

  const engagedCount = teachers.filter((t) => t.status === 'Engaged').length;
  const standbyCount = teachers.filter((t) => t.status === 'Standby').length;

  const filters: FilterConfig[] = [
    {
      id: 'department',
      label: 'Department',
      value: deptFilter,
      onChange: setDeptFilter,
      options: [
        { label: 'Mathematics', value: 'Mathematics', count: teachers.filter((t) => t.department === 'Mathematics').length },
        { label: 'Physics', value: 'Physics', count: teachers.filter((t) => t.department === 'Physics').length },
        { label: 'Chemistry', value: 'Chemistry', count: teachers.filter((t) => t.department === 'Chemistry').length },
        { label: 'Biology', value: 'Biology', count: teachers.filter((t) => t.department === 'Biology').length },
        { label: 'Computer Science', value: 'Computer Science', count: teachers.filter((t) => t.department === 'Computer Science').length },
        { label: 'English & Urdu', value: 'English & Urdu', count: teachers.filter((t) => t.department === 'English & Urdu').length },
        { label: 'General', value: 'General', count: teachers.filter((t) => t.department === 'General').length },
      ],
    },
  ];

  const sortOptions: SortOption[] = [
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Experience (Years)', value: 'exp-desc' },
    { label: 'Weekly Hours', value: 'hours-desc' },
  ];

  let filtered = teachers.filter((teacher) => {
    const matchSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'engaged' && teacher.status === 'Engaged') ||
      (activeTab === 'standby' && teacher.status === 'Standby');

    const matchDept = deptFilter === 'all' || teacher.department === deptFilter;

    return matchSearch && matchTab && matchDept;
  });

  if (currentSort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'exp-desc') {
    filtered.sort((a, b) => b.experienceYears - a.experienceYears);
  } else if (currentSort === 'hours-desc') {
    filtered.sort((a, b) => b.weeklyHours - a.weeklyHours);
  }

  const columns: Column<Teacher>[] = [
    {
      header: 'Teacher',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name[0]}
          </div>
          <div className="truncate">
            <div className="font-semibold text-slate-100">{row.name}</div>
            <div className="text-[11px] text-slate-400 font-mono truncate">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      cell: (row) => {
        const dept = DEPARTMENT_CONFIG[row.department as DepartmentName] || DEPARTMENT_CONFIG.General;
        return (
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
            style={{
              backgroundColor: `${dept.hex}15`,
              color: dept.hex,
              borderColor: `${dept.hex}30`,
            }}
          >
            {row.department}
          </span>
        );
      },
    },
    {
      header: 'Assigned Subjects',
      cell: (row) => {
        const assigned = subjects.filter((s) => row.assignedSubjectIds.includes(s.id));
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {assigned.slice(0, 2).map((s) => (
              <span
                key={s.id}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
              >
                {subjectChip(s)}
              </span>
            ))}
            {assigned.length > 2 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/15 text-indigo-300 font-mono font-medium">
                +{assigned.length - 2} more
              </span>
            )}
            {assigned.length === 0 && (
              <span className="text-slate-500 text-[11px] italic">Standby pool</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Experience & Qualification',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-200">{row.experienceYears} Years Exp</div>
          <div className="text-[11px] text-slate-400 truncate max-w-xs">{row.qualification}</div>
        </div>
      ),
    },
    {
      header: 'Workload',
      cell: (row) => (
        <span className="font-mono text-slate-300 text-xs font-medium">
          {row.weeklyHours} hrs/wk
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Teachers Directory"
        subtitle="Manage faculty across 7 academic departments, weekly class loads, and standby talent pool."
        primaryAction={{
          label: 'New teacher',
          onClick: () => openQuickAdd('teacher'),
          icon: GraduationCap,
        }}
        extraActions={
          <div className="flex items-center rounded-xl border border-[#232D52] bg-[#121831] p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#6D5BFF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Table view"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-[#6D5BFF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Cards view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Segmented Status Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121831] border border-[#232D52] rounded-xl w-fit">
        {[
          { id: 'all', label: 'All Faculty', count: teachers.length },
          { id: 'engaged', label: 'Engaged', count: engagedCount },
          { id: 'standby', label: 'Standby Pool', count: standbyCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#6D5BFF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search teacher name, qualification, or department..."
        filters={filters}
        sortOptions={sortOptions}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => openDetailDrawer('teacher', row)}
          onToggleStatus={(row) => toggleTeacherStatus(row.id)}
          bulkActions={[
            {
              label: 'Assign Subject',
              icon: BookOpen,
              onClick: (ids) => {
                setPendingBulkTeacherIds(ids);
                setAssignModalOpen(true);
              },
            },
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => openDetailDrawer('teacher', t)}
              className="p-5 rounded-2xl border border-[#232D52] bg-[#121831] hover:border-indigo-500/50 transition-all cursor-pointer space-y-4 shadow-lg group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {t.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">{t.department}</p>
                  </div>
                </div>
                <StatusPill status={t.status} />
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-[#0E1428] p-3 rounded-xl border border-[#1E2648]">
                {t.qualification}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#1E2648]">
                <div>
                  <span className="text-slate-500 block">Experience</span>
                  <span className="font-semibold text-slate-200">{t.experienceYears} Years</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Weekly Load</span>
                  <span className="font-semibold font-mono text-slate-200">{t.weeklyHours} hrs/wk</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-slate-100">Bulk Assign Subject</h3>
            <p className="text-xs text-slate-400">
              Assign subject curriculum to {pendingBulkTeacherIds.length} selected teacher(s).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Subject</label>
              <select
                required
                value={selectedSubjectToAssign}
                onChange={(e) => setSelectedSubjectToAssign(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Choose a subject</option>
                  {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  bulkAssignSubject(pendingBulkTeacherIds, selectedSubjectToAssign);
                  setAssignModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
