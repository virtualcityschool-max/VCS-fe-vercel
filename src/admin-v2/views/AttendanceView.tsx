import React, { useState } from 'react';
import { exportVisibleTableCsv, fileSlug } from '../utils';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { AttendanceStatus } from '../types';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Users,
  Download,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    students,
    subjects,
    attendanceMatrix,
    toggleAttendanceCell,
    addToast,
    tzIana,
    teachers,
    rawAttendanceAll,
    sessionCourse,
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedType, setSelectedType] = useState<'student' | 'teacher'>('student');

  // The last 7 days in the admin's timezone, oldest first.
  const dates = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-CA', tzIana ? { timeZone: tzIana } : undefined)
  );

  const dayOf = (iso: string) => new Date(iso).toLocaleDateString('en-CA', tzIana ? { timeZone: tzIana } : undefined);
  const matrix: Record<string, Record<string, AttendanceStatus>> = {};
  (rawAttendanceAll || []).forEach((r: any) => {
    const role = r.participant_role === 'teacher' ? 'teacher' : 'student';
    if (role !== selectedType || !r.scheduled_at) return;
    if (selectedSubjectId !== 'all' && String(sessionCourse.get(String(r.session)) ?? '') !== selectedSubjectId) return;
    const code = r.status === 'present' ? 'P' : r.status === 'late' ? 'L' : r.status === 'absent' ? 'A' : null;
    if (!code) return;
    const d = dayOf(r.scheduled_at);
    if (!dates.includes(d)) return;
    const k = String(r.student);
    matrix[k] = matrix[k] || {};
    const prev = matrix[k][d];
    if (!prev || code === 'A' || (code === 'L' && prev === 'P')) matrix[k][d] = code as AttendanceStatus;
  });
  const people = (selectedType === 'student' ? students : teachers).filter((p: any) => matrix[p.id]);

  // Calculate totals from matrix
  let totalRecords = 0;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  people.forEach((s: any) => {
    const studentRecords = matrix[s.id] || {};
    dates.forEach((d) => {
      const status = studentRecords[d];
      if (status && status !== '-') {
        totalRecords++;
        if (status === 'P') presentCount++;
        if (status === 'A') absentCount++;
        if (status === 'L') lateCount++;
      }
    });
  });

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'P':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'A':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold';
      case 'L':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800/40 text-slate-500 border-slate-700/40';
    }
  };

  const getStatusFullLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'P':
        return 'Present';
      case 'A':
        return 'Absent';
      case 'L':
        return 'Late';
      default:
        return 'Unmarked';
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Attendance Matrices"
        subtitle="Track live student class presence, absences, and punctuality across Cambridge terms."
        primaryAction={{
          label: 'Export Matrix',
          onClick: () => {
            const n = exportVisibleTableCsv(fileSlug('attendance'));
            addToast(n ? `Downloaded attendance for ${n} rows.` : 'Nothing to export.', n ? 'success' : 'info');
          },
          icon: Download,
        }}
      />

      {/* Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
          <div className="text-xs text-slate-400">Total Check-ins</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{totalRecords}</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
          <div className="text-xs text-emerald-400">Present (P)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {presentCount}{' '}
            <span className="text-xs font-normal text-emerald-300">
              ({totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0}%)
            </span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
          <div className="text-xs text-rose-400">Absent (A)</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {absentCount}{' '}
            <span className="text-xs font-normal text-rose-300">
              ({totalRecords > 0 ? Math.round((absentCount / totalRecords) * 100) : 0}%)
            </span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
          <div className="text-xs text-amber-400">Late (L)</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{lateCount}</div>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#232D52] bg-[#121831]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#0E1428] rounded-xl border border-[#232D52]">
            <button
              onClick={() => setSelectedType('student')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedType === 'student' ? 'bg-[#6D5BFF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setSelectedType('teacher')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedType === 'teacher' ? 'bg-[#6D5BFF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Teachers
            </button>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Subjects (Aggregate)</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-medium">Click cell to cycle:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-[11px]">
              P
            </span>
            <span className="text-slate-300">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded border border-rose-500/40 bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold font-mono text-[11px]">
              A
            </span>
            <span className="text-slate-300">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded border border-amber-500/40 bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono text-[11px]">
              L
            </span>
            <span className="text-slate-300">Late</span>
          </div>
        </div>
      </div>

      {/* Attendance Matrix Table */}
      <div className="rounded-2xl border border-[#232D52] bg-[#121831] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E2648] bg-[#0E1428] text-xs font-semibold text-slate-400">
                <th className="py-3 px-4">Student Candidate</th>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Level</th>
                {dates.map((d) => (
                  <th key={d} className="py-3 px-4 text-center font-mono text-xs">
                    {d.slice(5)}
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Weekly Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2648]/60 text-xs">
              {people.length === 0 && (
                <tr>
                  <td colSpan={dates.length + 4} className="py-10 text-center text-xs text-slate-400">
                    No attendance recorded for this selection in the last 7 days.
                  </td>
                </tr>
              )}
              {people.map((student: any) => {
                const studentRecords = matrix[student.id] || {};
                let p = 0;
                let tot = 0;

                dates.forEach((d) => {
                  const s = studentRecords[d];
                  if (s && s !== '-') {
                    tot++;
                    if (s === 'P') p++;
                  }
                });

                const rate = tot > 0 ? Math.round((p / tot) * 100) : 100;

                return (
                  <tr key={student.id} className="hover:bg-[#1A2346]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100">{student.name}</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">{student.rollNo || '—'}</td>
                    <td className="py-3 px-4 text-slate-400">{student.level || student.department || '—'}</td>

                    {dates.map((date) => {
                      const status = studentRecords[date] || '-';
                      return (
                        <td key={date} className="py-3 px-4 text-center">
                          <button
                            onClick={() =>
                              selectedType === 'student'
                                ? toggleAttendanceCell(student.id, date, selectedSubjectId === 'all' ? undefined : selectedSubjectId)
                                : addToast('Teacher attendance is recorded automatically when they join the class.', 'info')
                            }
                            className={`w-7 h-7 rounded-lg border font-mono font-bold text-xs inline-flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${getStatusColor(
                              status
                            )}`}
                            title={`Click to cycle (${getStatusFullLabel(status)})`}
                          >
                            {status}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={rate >= 90 ? 'text-emerald-400' : rate >= 75 ? 'text-amber-400' : 'text-rose-400'}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
