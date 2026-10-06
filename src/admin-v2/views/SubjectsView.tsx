import React, { useState } from 'react';
import { subjectChip } from '../utils';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig, SortOption } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { Subject, DepartmentName, AcademicLevel } from '../types';
import { BookOpen, Plus, Sparkles, Users } from 'lucide-react';
import { DEPARTMENT_CONFIG } from '../data/departments';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    teachers,
    openDetailDrawer,
    openQuickAdd,
    toggleSubjectStatus,
    addToast,
    levels,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('code-asc');

  const publishedCount = subjects.filter((s) => s.status === 'Published').length;
  const draftCount = subjects.filter((s) => s.status === 'Draft').length;

  const filters: FilterConfig[] = [
    {
      id: 'department',
      label: 'Department',
      value: deptFilter,
      onChange: setDeptFilter,
      options: [
        { label: 'Mathematics', value: 'Mathematics', count: subjects.filter((s) => s.department === 'Mathematics').length },
        { label: 'Physics', value: 'Physics', count: subjects.filter((s) => s.department === 'Physics').length },
        { label: 'Chemistry', value: 'Chemistry', count: subjects.filter((s) => s.department === 'Chemistry').length },
        { label: 'Biology', value: 'Biology', count: subjects.filter((s) => s.department === 'Biology').length },
        { label: 'Computer Science', value: 'Computer Science', count: subjects.filter((s) => s.department === 'Computer Science').length },
        { label: 'English & Urdu', value: 'English & Urdu', count: subjects.filter((s) => s.department === 'English & Urdu').length },
        { label: 'General', value: 'General', count: subjects.filter((s) => s.department === 'General').length },
      ],
    },
    {
      id: 'level',
      label: 'Level',
      value: levelFilter,
      onChange: setLevelFilter,
      options: levels.map((lvl) => ({
        label: lvl,
        value: lvl,
        count: subjects.filter((s) => s.level === lvl).length,
      })),
    },
  ];

  const sortOptions: SortOption[] = [
    { label: 'Course Code', value: 'code-asc' },
    { label: 'Student Count (Highest)', value: 'students-desc' },
    { label: 'Price (Lowest)', value: 'price-asc' },
  ];

  let filtered = subjects.filter((sub) => {
    const matchSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'published' && sub.status === 'Published') ||
      (activeTab === 'draft' && sub.status === 'Draft');

    const matchDept = deptFilter === 'all' || sub.department === deptFilter;
    const matchLvl = levelFilter === 'all' || sub.level === levelFilter;

    return matchSearch && matchTab && matchDept && matchLvl;
  });

  if (currentSort === 'code-asc') {
    filtered.sort((a, b) => a.code.localeCompare(b.code));
  } else if (currentSort === 'students-desc') {
    filtered.sort((a, b) => b.studentCount - a.studentCount);
  } else if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.priceUSD - b.priceUSD);
  }

  const columns: Column<Subject>[] = [
    {
      header: 'Subject & Cambridge Code',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-xs shrink-0">
            {subjectChip(row)}
          </div>
          <div className="truncate">
            <div className="font-semibold text-slate-100">{row.name}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{row.weeklySessions} sessions/week</span>
            </div>
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
      header: 'Curriculum Level',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-300 font-medium">{row.level}</span>
      ),
    },
    {
      header: 'Assigned Tutor',
      cell: (row) => {
        const teacher = teachers.find((t) => t.id === row.teacherId);
        return (
          <span className="text-xs text-slate-300 font-medium">
            {teacher ? teacher.name : 'Unassigned'}
          </span>
        );
      },
    },
    {
      header: 'Price (USD)',
      cell: (row) => (
        <span className="font-mono text-xs text-emerald-400 font-bold">
          ${row.priceUSD} <span className="text-[10px] text-slate-500 font-normal">/mo</span>
        </span>
      ),
    },
    {
      header: 'Enrolled',
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-200">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>{row.studentCount}</span>
        </div>
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
        title="Subjects Catalogue"
        subtitle="105 Cambridge International & national curriculum courses across 7 departments."
        primaryAction={{
          label: 'New subject',
          onClick: () => openQuickAdd('subject'),
          icon: Plus,
        }}
      />

      {/* Segmented Status Split */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121831] border border-[#232D52] rounded-xl w-fit">
        {[
          { id: 'all', label: 'All Subjects', count: subjects.length },
          { id: 'published', label: 'Published', count: publishedCount },
          { id: 'draft', label: 'Draft', count: draftCount },
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
        searchPlaceholder="Search subject name or Cambridge code (e.g. 0580, 0610)..."
        filters={filters}
        sortOptions={sortOptions}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => openDetailDrawer('subject', row)}
        onToggleStatus={(row) => toggleSubjectStatus(row.id)}
      />
    </div>
  );
};
