import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig, SortOption } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { Subject, DepartmentName, AcademicLevel } from '../types';
import { BookOpen, Plus, Sparkles, Users } from 'lucide-react';
import { DEPARTMENT_CONFIG, DEPARTMENT_ICONS } from '../data/departments';

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
    { label: 'Code', value: 'code-asc' },
    { label: 'Name (A-Z)', value: 'name-asc' },
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
    // Coded (Cambridge) subjects first in code order, then the rest by name.
    filtered.sort((a, b) => (a.code ? 0 : 1) - (b.code ? 0 : 1) || a.code.localeCompare(b.code) || a.name.localeCompare(b.name));
  } else if (currentSort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'students-desc') {
    filtered.sort((a, b) => b.studentCount - a.studentCount);
  } else if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.priceUSD - b.priceUSD);
  }

  const columns: Column<Subject>[] = [
    {
      header: 'Code',
      cell: (row) =>
        row.code ? (
          <span className="font-mono text-sm font-bold text-sky-400">{row.code}</span>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    {
      header: 'Subject',
      cell: (row) => {
        const dept = DEPARTMENT_CONFIG[row.department as DepartmentName] || DEPARTMENT_CONFIG.General;
        const Icon = DEPARTMENT_ICONS[row.department as DepartmentName] || DEPARTMENT_ICONS.General;
        return (
          <div className="flex items-center gap-3 min-w-[240px]">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
              style={{ backgroundColor: `${dept.hex}1f`, borderColor: `${dept.hex}40`, color: dept.hex }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-100 truncate">{row.name}</div>
              <div className="text-[11px] text-slate-500">{row.weeklySessions} sessions/week</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Department',
      cell: (row) => {
        const dept = DEPARTMENT_CONFIG[row.department as DepartmentName] || DEPARTMENT_CONFIG.General;
        const Icon = DEPARTMENT_ICONS[row.department as DepartmentName] || DEPARTMENT_ICONS.General;
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap"
            style={{ backgroundColor: `${dept.hex}15`, color: dept.hex, borderColor: `${dept.hex}30` }}
          >
            <Icon className="w-3 h-3" />
            {row.department}
          </span>
        );
      },
    },
    {
      header: 'Curriculum Level',
      cell: (row) => (
        <span className="text-xs text-slate-300">{row.level || '—'}</span>
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
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Subjects Catalogue"
        subtitle={`${subjects.length} Cambridge and national curriculum subjects across ${new Set(subjects.map((x) => x.department)).size} departments.`}
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

      {/* Department quick filter */}
      <div className="flex flex-wrap items-center gap-2">
        {[{ name: 'all', label: 'All departments', count: subjects.length },
          ...(Object.keys(DEPARTMENT_ICONS) as DepartmentName[]).map((d) => ({ name: d, label: d, count: subjects.filter((x) => x.department === d).length })).filter((d) => d.count > 0),
        ].map((d) => {
          const active = deptFilter === d.name;
          const Icon = d.name === 'all' ? null : DEPARTMENT_ICONS[d.name as DepartmentName];
          const hex = d.name === 'all' ? '#6D5BFF' : (DEPARTMENT_CONFIG[d.name as DepartmentName] || DEPARTMENT_CONFIG.General).hex;
          return (
            <button
              key={d.name}
              onClick={() => setDeptFilter(d.name)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
              style={active ? { backgroundColor: hex, borderColor: hex, color: '#fff' } : { backgroundColor: `${hex}12`, borderColor: `${hex}35`, color: hex }}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {d.label}
              <span className={`font-mono text-[10px] px-1.5 rounded ${active ? 'bg-white/20' : 'bg-black/20'}`}>{d.count}</span>
            </button>
          );
        })}
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
