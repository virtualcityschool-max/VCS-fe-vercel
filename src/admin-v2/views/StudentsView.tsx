import React, { useState } from 'react';
import { subjectChip } from '../utils';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig, SortOption } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { Student } from '../types';
import { UserPlus, UserCheck, UserX, Download } from 'lucide-react';

export const StudentsView: React.FC = () => {
  const {
    students,
    subjects,
    openDetailDrawer,
    openQuickAdd,
    deleteStudent,
    bulkUpdateStudentStatus,
    addToast,
    levels,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('name-asc');

  // Filters setup
  const filters: FilterConfig[] = [
    {
      id: 'level',
      label: 'Level',
      value: levelFilter,
      onChange: setLevelFilter,
      options: levels
        .map((l) => ({ label: l, value: l, count: students.filter((s) => s.level === l).length }))
        .filter((o) => o.count > 0),
    },
    {
      id: 'feeStatus',
      label: 'Fee Status',
      value: feeFilter,
      onChange: setFeeFilter,
      options: [
        { label: 'Paid', value: 'Paid', count: students.filter((s) => s.feeStatus === 'Paid').length },
        { label: 'Expiring Soon', value: 'Expiring Soon', count: students.filter((s) => s.feeStatus === 'Expiring Soon').length },
        { label: 'Overdue', value: 'Overdue', count: students.filter((s) => s.feeStatus === 'Overdue').length },
        { label: 'Free Access', value: 'Free Access', count: students.filter((s) => (s.feeStatus as string) === 'Free Access').length },
        { label: 'Not Enrolled', value: 'Not Enrolled', count: students.filter((s) => (s.feeStatus as string) === 'Not Enrolled').length },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'Active', value: 'Active', count: students.filter((s) => s.status === 'Active').length },
        { label: 'Inactive', value: 'Inactive', count: students.filter((s) => s.status === 'Inactive').length },
      ],
    },
  ];

  const sortOptions: SortOption[] = [
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Roll #', value: 'roll-asc' },
    { label: 'Attendance (Highest)', value: 'att-desc' },
  ];

  // Filtering & Sorting logic
  let filtered = students.filter((student) => {
    const matchSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchLevel = levelFilter === 'all' || student.level === levelFilter;
    const matchFee = feeFilter === 'all' || student.feeStatus === feeFilter;
    const matchStatus = statusFilter === 'all' || student.status === statusFilter;

    return matchSearch && matchLevel && matchFee && matchStatus;
  });

  if (currentSort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'roll-asc') {
    filtered.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  } else if (currentSort === 'att-desc') {
    filtered.sort((a, b) => b.attendanceRate - a.attendanceRate);
  }

  // Table Columns
  const columns: Column<Student>[] = [
    {
      header: 'Student',
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
      header: 'Roll #',
      cell: (row) => (
        <span className="font-mono text-xs text-indigo-300 font-semibold">{row.rollNo}</span>
      ),
    },
    {
      header: 'Enrolled Subjects',
      cell: (row) => {
        const enrolled = subjects.filter((s) => row.enrolledSubjectIds.includes(s.id));
        const firstTwo = enrolled.slice(0, 2);
        const remainder = enrolled.length - 2;

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {firstTwo.map((sub) => (
              <span
                key={sub.id}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
              >
                {subjectChip(sub)}
              </span>
            ))}
            {remainder > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/15 text-indigo-300 font-mono font-medium">
                +{remainder} more
              </span>
            )}
            {enrolled.length === 0 && (
              <span className="text-slate-500 text-[11px] italic">No subjects</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Fee Status',
      cell: (row) => <StatusPill status={row.feeStatus} />,
    },
    {
      header: 'Latest Enrollment',
      cell: (row) => (
        <span className="font-mono text-slate-400 text-xs">{row.latestEnrollmentDate}</span>
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
        title="Student Roster"
        subtitle={`Managing ${students.length} active Cambridge and national curriculum candidates.`}
        primaryAction={{
          label: 'Enroll student',
          onClick: () => openQuickAdd('student'),
          icon: UserPlus,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search student name, roll number, or email..."
        filters={filters}
        sortOptions={sortOptions}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => openDetailDrawer('student', row)}
        onDelete={(row) => deleteStudent(row.id)}
        onToggleStatus={(row) => {
          bulkUpdateStudentStatus([row.id], row.status === 'Active' ? 'Inactive' : 'Active');
        }}
        bulkActions={[
          {
            label: 'Activate Selected',
            icon: UserCheck,
            onClick: (ids) => bulkUpdateStudentStatus(ids, 'Active'),
          },
          {
            label: 'Deactivate Selected',
            icon: UserX,
            onClick: (ids) => bulkUpdateStudentStatus(ids, 'Inactive'),
            isDestructive: true,
          },
          {
            label: 'Export CSV',
            icon: Download,
            onClick: (ids) => {
              const rows = students.filter((s) => ids.includes(s.id));
              const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
              const csv = [['Name', 'Email', 'Roll #', 'Level', 'Fee status', 'Parent', 'Parent phone', 'Subjects'],
                ...rows.map((s) => [s.name, s.email, s.rollNo, s.level, s.feeStatus, s.guardianName, s.guardianPhone,
                  s.enrolledSubjectIds.map((id) => subjects.find((x) => x.id === id)?.name).filter(Boolean).join('; ')])]
                .map((r) => r.map(esc).join(',')).join('\n');
              const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
              const a = document.createElement('a');
              a.href = url;
              a.download = 'vcs-selected-students.csv';
              a.click();
              URL.revokeObjectURL(url);
              addToast(`Downloaded ${rows.length} students as CSV.`, 'success');
            },
          },
        ]}
      />
    </div>
  );
};
