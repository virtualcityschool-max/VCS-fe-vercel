import React, { useMemo, useState } from 'react';
import { exportVisibleTableCsv, fileSlug } from '../utils';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { ChevronLeft, ChevronRight, Download, Pencil, Lock } from 'lucide-react';

type Code = 'P' | 'L' | 'A';
const codeOf = (st: string): Code | null => (st === 'present' ? 'P' : st === 'late' ? 'L' : st === 'absent' ? 'A' : null);
const CHIP: Record<Code, string> = {
  P: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  L: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  A: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold',
};
const LABEL: Record<Code, string> = { P: 'Present', L: 'Late', A: 'Absent' };

// One chip per class: a student with two classes on a day shows two chips.
// The totals use the same calculation as the dashboard (attendanceSummary):
// every marked class record counts once; unmarked records are left out.
export const AttendanceView: React.FC = () => {
  const { students, subjects, addToast, tzIana, teachers, rawAttendanceAll, sessionCourse, attendanceSummary, setAttendanceStatus, can } = useApp() as any;
  const canEdit = can('edit_attendance');

  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedType, setSelectedType] = useState<'student' | 'teacher'>('student');
  const [weekOffset, setWeekOffset] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [picking, setPicking] = useState<any>(null);

  // Monday-to-Sunday week in the admin's timezone (this week by default, like the dashboard).
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekOffset]);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  const dayKey = (d: Date) => d.toLocaleDateString('en-CA', tzIana ? { timeZone: tzIana } : undefined);
  const dates = Array.from({ length: 7 }, (_, i) => dayKey(new Date(weekStart.getTime() + i * 86400000 + 12 * 3600000)));
  const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', ...(tzIana ? { timeZone: tzIana } : {}) });

  // person → day → class records (sorted by time)
  const cells = useMemo(() => {
    const m: Record<string, Record<string, any[]>> = {};
    (rawAttendanceAll || []).forEach((r: any) => {
      const role = r.participant_role === 'teacher' ? 'teacher' : 'student';
      if (role !== selectedType || !r.scheduled_at || !codeOf(r.status)) return;
      const t = new Date(r.scheduled_at).getTime();
      if (t < weekStart.getTime() || t >= weekEnd.getTime()) return;
      if (selectedSubjectId !== 'all' && String(sessionCourse.get(String(r.session)) ?? '') !== selectedSubjectId) return;
      const k = String(r.student);
      const d = dayKey(new Date(r.scheduled_at));
      m[k] = m[k] || {};
      (m[k][d] = m[k][d] || []).push(r);
    });
    Object.values(m).forEach((byDay) => Object.values(byDay).forEach((list) => list.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))));
    return m;
  }, [rawAttendanceAll, selectedType, selectedSubjectId, weekStart, sessionCourse, tzIana]);

  const people = (selectedType === 'student' ? students : teachers).filter((p: any) => cells[p.id]);

  // Same numbers as the dashboard for students; teachers counted the same way.
  const summary = selectedType === 'student'
    ? attendanceSummary(weekStart.toISOString(), weekEnd.toISOString(), selectedSubjectId === 'all' ? undefined : selectedSubjectId)
    : (() => {
        const all = Object.values(cells).flatMap((byDay) => Object.values(byDay).flat());
        const present = all.filter((r: any) => r.status === 'present').length;
        const late = all.filter((r: any) => r.status === 'late').length;
        return { total: all.length, present, late, absent: all.length - present - late, unmarked: 0, rate: all.length ? Math.round(((present + late) / all.length) * 1000) / 10 : null };
      })();
  const pct = (n: number) => (summary.total ? Math.round((n / summary.total) * 100) : 0);
  const weekLabel = `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(weekEnd.getTime() - 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;

  const onChip = (r: any) => {
    if (selectedType === 'teacher') { addToast('Teacher attendance is recorded automatically when they join the class.', 'info'); return; }
    if (!editMode) return;
    setPicking(r);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Attendance"
        subtitle="Every class each student had this week, one mark per class. Present + late count as attended."
        primaryAction={{
          label: 'Export',
          onClick: () => {
            const n = exportVisibleTableCsv(fileSlug('attendance'));
            addToast(n ? `Downloaded attendance for ${n} rows.` : 'Nothing to export.', n ? 'success' : 'info');
          },
          icon: Download,
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
          <div className="text-xs text-slate-400">Class records marked</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{summary.total}</div>
        </div>
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
          <div className="text-xs text-indigo-300">Attendance rate</div>
          <div className="text-2xl font-bold font-mono text-indigo-200 mt-1">{summary.rate === null ? '—' : `${summary.rate}%`}</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
          <div className="text-xs text-emerald-400">Present</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{summary.present} <span className="text-xs font-normal text-emerald-300">({pct(summary.present)}%)</span></div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
          <div className="text-xs text-amber-400">Late</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{summary.late} <span className="text-xs font-normal text-amber-300">({pct(summary.late)}%)</span></div>
        </div>
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
          <div className="text-xs text-rose-400">Absent</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{summary.absent} <span className="text-xs font-normal text-rose-300">({pct(summary.absent)}%)</span></div>
        </div>
      </div>
      {summary.unmarked > 0 && (
        <p className="text-xs text-slate-500 -mt-3">{summary.unmarked} class record{summary.unmarked === 1 ? '' : 's'} this week {summary.unmarked === 1 ? 'has' : 'have'} no mark (for example the class never started) and {summary.unmarked === 1 ? 'is' : 'are'} not counted.</p>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-[#232D52] bg-[#121831]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#0E1428] rounded-xl border border-[#232D52]">
            {(['student', 'teacher'] as const).map((t) => (
              <button key={t} onClick={() => setSelectedType(t)} className={`px-3 py-1 text-xs font-semibold rounded-lg ${selectedType === t ? 'bg-[#6D5BFF] text-white' : 'text-slate-400 hover:text-white'}`}>
                {t === 'student' ? 'Students' : 'Teachers'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl border border-[#232D52] bg-[#0E1428]">
            <button disabled={weekOffset <= -3} onClick={() => setWeekOffset((w) => w - 1)} className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-2 text-xs text-slate-300 font-mono">{weekOffset === 0 ? `This week · ${weekLabel}` : weekLabel}</span>
            <button disabled={weekOffset >= 0} onClick={() => setWeekOffset((w) => w + 1)} className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All subjects</option>
            {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.code} {s.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {(['P', 'L', 'A'] as Code[]).map((c) => (
            <span key={c} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded border flex items-center justify-center font-mono text-xs ${CHIP[c]}`}>{c}</span>
              <span className="text-slate-300">{LABEL[c]}</span>
            </span>
          ))}
          {canEdit && selectedType === 'student' && (
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${editMode ? 'bg-amber-500 text-slate-950' : 'border border-[#232D52] text-slate-300 hover:text-white'}`}
            >
              {editMode ? <><Lock className="w-3.5 h-3.5" /> Done editing</> : <><Pencil className="w-3.5 h-3.5" /> Correct attendance</>}
            </button>
          )}
        </div>
      </div>
      {editMode && (
        <p className="text-xs text-amber-300 -mt-3">Edit mode: click a class mark to change it. Each change is confirmed first and recorded in the operations log with your name.</p>
      )}

      <div className="rounded-2xl border border-[#232D52] bg-[#121831] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E2648] bg-[#0E1428] text-xs font-semibold text-slate-400">
                <th className="py-3 px-4">{selectedType === 'student' ? 'Student' : 'Teacher'}</th>
                <th className="py-3 px-4">{selectedType === 'student' ? 'Roll #' : ''}</th>
                {dates.map((d) => (
                  <th key={d} className="py-3 px-2 text-center font-mono text-xs">
                    {new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' })} {d.slice(8)}
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2648]/60 text-xs">
              {people.length === 0 && (
                <tr>
                  <td colSpan={dates.length + 3} className="py-10 text-center text-xs text-slate-400">No attendance recorded for this selection in this week.</td>
                </tr>
              )}
              {people.map((p: any) => {
                const byDay = cells[p.id] || {};
                const all = Object.values(byDay).flat();
                const ok = all.filter((r: any) => r.status !== 'absent').length;
                const rate = all.length ? Math.round((ok / all.length) * 100) : null;
                return (
                  <tr key={p.id} className="hover:bg-[#1A2346]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">{selectedType === 'student' ? p.rollNo || '—' : ''}</td>
                    {dates.map((d) => (
                      <td key={d} className="py-2 px-2 text-center">
                        <div className="inline-flex flex-wrap justify-center gap-1">
                          {(byDay[d] || []).map((r: any) => {
                            const c = codeOf(r.status) as Code;
                            return (
                              <button
                                key={r.id ?? `${r.session}-${r.student}`}
                                onClick={() => onChip(r)}
                                className={`w-7 h-7 rounded-lg border font-mono text-xs inline-flex items-center justify-center ${CHIP[c]} ${editMode ? 'cursor-pointer hover:scale-105 ring-1 ring-amber-400/40' : 'cursor-default'}`}
                                title={`${r.session_title || r.course_title || 'Class'} · ${timeOf(r.scheduled_at)} · ${LABEL[c]}${editMode ? ' (click to change)' : ''}`}
                              >
                                {c}
                              </button>
                            );
                          })}
                          {!(byDay[d] || []).length && <span className="text-slate-600">·</span>}
                        </div>
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {rate === null ? '—' : <span className={rate >= 90 ? 'text-emerald-400' : rate >= 75 ? 'text-amber-400' : 'text-rose-400'}>{rate}%</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setPicking(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#232D52] bg-[#121831] p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-bold text-white">Correct attendance</div>
            <div className="text-xs text-slate-400">
              {students.find((s: any) => s.id === String(picking.student))?.name} · {picking.session_title || picking.course_title || 'Class'} · {new Date(picking.scheduled_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', ...(tzIana ? { timeZone: tzIana } : {}) })}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['present', 'late', 'absent'] as const).map((st) => (
                <button
                  key={st}
                  disabled={picking.status === st}
                  onClick={async () => { const r = picking; setPicking(null); await setAttendanceStatus(r, st); }}
                  className={`py-2 rounded-xl text-xs font-semibold border disabled:opacity-40 ${CHIP[codeOf(st) as Code]}`}
                >
                  {LABEL[codeOf(st) as Code]}
                </button>
              ))}
            </div>
            <button onClick={() => setPicking(null)} className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
