import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig, SortOption } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { Student } from '../types';
import { UserPlus, UserCheck, UserX, Download, Tag, Plus, MessageCircle } from 'lucide-react';
import { CopyButton } from '../components/common/FormControls';
import { CLASS_YEARS, formatPhone, whatsappLink } from '../data/formOptions';
// Labels reuse the live admin's components, so they behave the same as before.
import { TagChip, StudentTagsModal } from '../../components/admin/StudentTags';
import { useStudentTags } from '../../hooks/useStudentTags';

export const StudentsView: React.FC = () => {
  const {
    students,
    openDetailDrawer,
    openQuickAdd,
    deleteStudent,
    bulkUpdateStudentStatus,
    addToast,
    levels,
    subjects,
    reload,
  } = useApp() as any;

  const { tags, refresh: refreshTags } = useStudentTags();
  const [tagFilter, setTagFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [tagOverrides, setTagOverrides] = useState<Record<string, any[]>>({});
  const [tagModalStudent, setTagModalStudent] = useState<any>(null);
  const [labelLibraryOpen, setLabelLibraryOpen] = useState(false);
  const tagsFor = (st: any): any[] => tagOverrides[st.id] ?? st._raw?.tags ?? [];

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('name-asc');

  // Filters setup
  const filters: FilterConfig[] = [
    {
      id: 'class',
      label: 'Class',
      value: classFilter,
      onChange: setClassFilter,
      options: [
        ...CLASS_YEARS.flatMap((g) => g.options).map((c) => ({ label: c, value: c, count: students.filter((st: any) => st.classYear === c).length })).filter((o) => o.count > 0),
        { label: 'Not set', value: '__none', count: students.filter((st: any) => !st.classYear).length },
      ],
    },
    {
      id: 'tag',
      label: 'Label',
      value: tagFilter,
      onChange: setTagFilter,
      options: tags.map((t: any) => ({
        label: t.name,
        value: String(t.id),
        count: students.filter((st) => tagsFor(st).some((x: any) => String(x.id) === String(t.id))).length,
      })),
    },
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
      options: ['Paid', 'Access active', 'Expiring Soon', 'Overdue', 'Access expired', 'Free Access', 'Not Enrolled']
        .map((v) => ({ label: v === 'Paid' ? 'Paid (Gumroad)' : v, value: v, count: students.filter((s) => (s.feeStatus as string) === v).length }))
        .filter((o) => o.count > 0),
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
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((student as any).phone || '').includes(searchQuery.replace(/[^\d]/g, '') || '~') ||
      ((student as any).guardianName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((student as any).classYear || '').toLowerCase() === searchQuery.trim().toLowerCase();

    const matchLevel = levelFilter === 'all' || student.level === levelFilter;
    const matchFee = feeFilter === 'all' || student.feeStatus === feeFilter;
    const matchStatus = statusFilter === 'all' || student.status === statusFilter;

    const matchClass = classFilter === 'all' || (classFilter === '__none' ? !(student as any).classYear : (student as any).classYear === classFilter);
    const matchTag = tagFilter === 'all' || tagsFor(student).some((x: any) => String(x.id) === tagFilter);

    return matchSearch && matchLevel && matchFee && matchStatus && matchTag && matchClass;
  });

  if (currentSort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'roll-asc') {
    // Numeric, so roll 37 comes before 100; students without a roll number go last.
    filtered.sort((a, b) => (parseInt(a.rollNo, 10) || Infinity) - (parseInt(b.rollNo, 10) || Infinity));
  } else if (currentSort === 'att-desc') {
    filtered.sort((a, b) => b.attendanceRate - a.attendanceRate);
  }

  // Table Columns
  const columns: Column<Student>[] = [
    {
      header: 'Roll #',
      cell: (row) => (
        <span className="font-mono text-xs text-indigo-300 font-semibold">{row.rollNo}</span>
      ),
    },
    {
      header: 'Student',
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="w-8 h-8 rounded-xl bg-sky-400/15 border border-sky-400/30 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-100 truncate">{row.name}</div>
            <div className="flex items-center gap-1 text-[13px] text-slate-300">
              <span className="truncate">{row.email}</span>
              <CopyButton value={row.email} title="Copy email" />
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Class',
      cell: (row: any) =>
        row.classYear ? (
          <div>
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-sky-400/15 text-sky-300 border border-sky-400/30">{row.classYear}</span>
            {row.level && <div className="text-[11px] text-slate-500 mt-1 truncate max-w-[140px]">{row.level}</div>}
          </div>
        ) : (
          <div>
            <span className="text-xs text-slate-500 italic">Not set</span>
            {row.level && <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[140px]">{row.level}</div>}
          </div>
        ),
    },
    {
      header: 'Contact',
      cell: (row: any) =>
        row.phone ? (
          <div className="flex items-center gap-1 text-[13px] text-slate-200 font-mono whitespace-nowrap">
            <span>{formatPhone(row.phone)}</span>
            <CopyButton value={formatPhone(row.phone)} title="Copy number" />
            <a
              href={whatsappLink(row.phone)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open WhatsApp"
              className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <span className="text-xs text-slate-500 italic">No number</span>
        ),
    },
    {
      header: 'Guardian',
      cell: (row: any) => {
        const parent = (row.parentAccounts || [])[0];
        const name = row.guardianName || parent?.name;
        const phone = row.guardianPhone || parent?.phone;
        if (!name && !phone) return <span className="text-xs text-slate-500 italic">Not recorded</span>;
        return (
          <div className="min-w-[150px]">
            <div className="text-[13px] text-slate-200 truncate">
              {name || 'Guardian'}
              {row.guardianRelationship && <span className="text-slate-500"> · {row.guardianRelationship}</span>}
              {!row.guardianName && parent && <span className="text-slate-500"> · parent account</span>}
            </div>
            {phone && (
              <div className="flex items-center gap-1 text-xs text-slate-300 font-mono">
                <span>{formatPhone(phone)}</span>
                <CopyButton value={formatPhone(phone)} title="Copy guardian number" />
                <a
                  href={whatsappLink(phone)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="WhatsApp guardian"
                  className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10"
                >
                  <MessageCircle className="w-3 h-3" />
                </a>
              </div>
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
      header: 'Labels',
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-1 max-w-[220px]" onClick={(e) => e.stopPropagation()}>
          {tagsFor(row).map((t: any) => (
            <TagChip key={t.id} tag={t} onClick={() => setTagFilter(String(t.id))} />
          ))}
          <button
            onClick={() => setTagModalStudent(row)}
            title="Edit labels"
            className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-[#1A2346]"
          >
            <Plus className="w-3 h-3" />
          </button>
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
        title="Student Log"
        subtitle={`Managing ${students.length} active Cambridge and national curriculum candidates.`}
        primaryAction={{
          label: 'Enroll student',
          onClick: () => openQuickAdd('student'),
          icon: UserPlus,
        }}
        extraActions={
          <button
            onClick={() => setLabelLibraryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[#232D52] bg-[#121831] text-slate-300 hover:text-white transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Manage labels</span>
          </button>
        }
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search name, roll #, email, phone or guardian…"
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
              const csv = [['Roll #', 'Name', 'Email', 'Phone', 'Class', 'Level', 'Guardian', 'Guardian phone', 'Fee status', 'Subjects'],
                ...rows.map((s: any) => [s.rollNo, s.name, s.email, formatPhone(s.phone), s.classYear, s.level,
                  s.guardianName || s.parentAccounts?.[0]?.name, formatPhone(s.guardianPhone || s.parentAccounts?.[0]?.phone), s.feeStatus,
                  s.enrolledSubjectIds.map((id: string) => subjects.find((x: any) => x.id === id)?.name).filter(Boolean).join('; ')])]
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
      {labelLibraryOpen && (
        <StudentTagsModal
          student={null}
          tags={tags}
          onClose={() => setLabelLibraryOpen(false)}
          onTagsChanged={refreshTags}
          onStudentsStale={() => reload('users')}
          onSaved={() => {}}
        />
      )}
      {tagModalStudent && (
        <StudentTagsModal
          student={{ id: tagModalStudent.id, name: tagModalStudent.name, roll_no: tagModalStudent._raw?.roll_no, tags: tagsFor(tagModalStudent) }}
          tags={tags}
          onClose={() => setTagModalStudent(null)}
          onTagsChanged={refreshTags}
          onStudentsStale={() => reload('users')}
          onSaved={(userId: any, saved: any[]) => {
            setTagOverrides((prev) => ({ ...prev, [String(userId)]: saved }));
            refreshTags();
          }}
        />
      )}
    </div>
  );
};
