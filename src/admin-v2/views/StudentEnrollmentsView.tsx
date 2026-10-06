import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig, SortOption } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { EnrollmentRecord, DepartmentName } from '../types';
import { UserCheck, Plus, BookOpen, Layers, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { DEPARTMENT_CONFIG } from '../data/mockData';

export const StudentEnrollmentsView: React.FC = () => {
  const {
    enrollments,
    students,
    subjects,
    addEnrollment,
    removeEnrollment,
    openDetailDrawer,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('date-desc');
  const [modalOpen, setModalOpen] = useState(false);

  // New enrollment form state
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [electiveGroup, setElectiveGroup] = useState('Core Major');
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentRecord['status']>('Active');

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
    { label: 'Latest Date', value: 'date-desc' },
    { label: 'Fee (Highest)', value: 'fee-desc' },
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

  if (currentSort === 'date-desc') {
    filtered.sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate));
  } else if (currentSort === 'fee-desc') {
    filtered.sort((a, b) => b.monthlyFeeUSD - a.monthlyFeeUSD);
  }

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    const student = students.find((s) => s.id === selectedStudentId);
    if (!subject || !student) return;

    addEnrollment({
      studentId: selectedStudentId,
      subjectId: selectedSubjectId,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: enrollmentStatus,
      feeStatus: enrollmentStatus === 'Trial' ? 'Free Trial' : 'Paid',
      monthlyFeeUSD: subject.priceUSD,
      electiveGroup,
    });

    setModalOpen(false);
  };

  const columns: Column<EnrollmentRecord>[] = [
    {
      header: 'Student Candidate',
      cell: (row) => {
        const student = students.find((s) => s.id === row.studentId);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              {student ? student.name[0] : 'S'}
            </div>
            <div>
              <div className="font-semibold text-slate-100">{student?.name || 'Student'}</div>
              <div className="text-[11px] text-slate-400 font-mono">{student?.rollNo} · {student?.level}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Enrolled Course & Code',
      cell: (row) => {
        const subject = subjects.find((s) => s.id === row.subjectId);
        const dept = DEPARTMENT_CONFIG[subject?.department as DepartmentName] || DEPARTMENT_CONFIG.General;
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400">{subject?.code || ''}</span>
              <span className="font-semibold text-slate-200">{subject?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{subject?.department}</span>
              <span>·</span>
              <span>{subject?.level}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Elective Track',
      cell: (row) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#151D3A] text-slate-300 border border-[#232D52]">
          {row.electiveGroup || 'Standard Track'}
        </span>
      ),
    },
    {
      header: 'Enrollment Date',
      cell: (row) => <span className="font-mono text-xs text-slate-400">{row.enrollmentDate}</span>,
    },
    {
      header: 'Course Fee',
      cell: (row) => (
        <span className="font-mono text-xs text-emerald-400 font-bold">
          ${row.monthlyFeeUSD}/mo
        </span>
      ),
    },
    {
      header: 'Fee Status',
      cell: (row) => <StatusPill status={row.feeStatus} />,
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
  ];

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

      <DataTable
        columns={columns}
        data={filtered}
        onDelete={(row) => removeEnrollment(row.id)}
        onRowClick={(row) => {
          const student = students.find((s) => s.id === row.studentId);
          if (student) openDetailDrawer('student', student);
        }}
      />

      {/* Enroll in course modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-slate-100">Enroll Student in Course</h3>
            <p className="text-xs text-slate-400">
              Assign a student to a live Cambridge course module and allocate timetable seat.
            </p>

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Student Candidate *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Choose a student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo} - {s.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Cambridge Course *</label>
                <select
                  required
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.level || "no level"} - {sub.priceUSD ? `$${sub.priceUSD}/mo` : "Free"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <p className="sm:col-span-2 text-xs text-slate-400">
                  Paid subjects start a one-month access window from today; free subjects never expire.
                </p>
              </div>

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
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
