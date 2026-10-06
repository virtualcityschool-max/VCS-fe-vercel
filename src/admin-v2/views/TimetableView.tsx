import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { TimetableSession, DepartmentName } from '../types';
import {
  Calendar as CalendarIcon,
  Table as TableIcon,
  Plus,
  Video,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DEPARTMENT_CONFIG } from '../data/departments';

export const TimetableView: React.FC = () => {
  const {
    sessions,
    subjects,
    teachers,
    openQuickAdd,
    timezone,
    tzIana,
  } = useApp();

  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [weekOffset, setWeekOffset] = useState(0);

  // Real calendar week (Monday–Sunday) in the admin's timezone.
  const dayKey = (d: Date) => d.toLocaleDateString('en-CA', tzIana ? { timeZone: tzIana } : undefined);
  const todayKey = dayKey(new Date());
  const [ty, tm, td] = todayKey.split('-').map(Number);
  const todayUtc = new Date(Date.UTC(ty, tm - 1, td));
  const monday = new Date(todayUtc);
  monday.setUTCDate(todayUtc.getUTCDate() - ((todayUtc.getUTCDay() + 6) % 7) + weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return d;
  });
  const keyOf = (d: Date) => d.toISOString().slice(0, 10);
  const fmtDay = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const weekNo = (() => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + 3);
    const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    return 1 + Math.round(((d.getTime() - firstThu.getTime()) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  })();
  const weekLabel = `Week ${weekNo} (${fmtDay(weekDays[0])} – ${fmtDay(weekDays[6])}, ${weekDays[6].getUTCFullYear()})`;
  const weekSessions = sessions.filter((s) => s.date && s.date >= keyOf(weekDays[0]) && s.date <= keyOf(weekDays[6]));

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const columns: Column<TimetableSession>[] = [
    {
      header: 'Session',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-100">{row.title}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{row.recurrence} Recurrence</div>
        </div>
      ),
    },
    {
      header: 'Subject & Dept',
      cell: (row) => {
        const sub = subjects.find((s) => s.id === row.subjectId);
        const dept = DEPARTMENT_CONFIG[row.department as DepartmentName] || DEPARTMENT_CONFIG.General;
        return (
          <div>
            <div className="font-semibold text-slate-200">
              {sub ? `${sub.code} ${sub.name}` : row.department}
            </div>
            <span
              className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-medium border"
              style={{
                backgroundColor: `${dept.hex}15`,
                color: dept.hex,
                borderColor: `${dept.hex}30`,
              }}
            >
              {row.department}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Tutor',
      cell: (row) => {
        const teacher = teachers.find((t) => t.id === row.teacherId);
        return (
          <span className={`text-xs ${teacher ? 'text-slate-200 font-medium' : 'text-amber-400 font-bold'}`}>
            {teacher ? teacher.name : 'Unassigned!'}
          </span>
        );
      },
    },
    {
      header: `Start (${timezone})`,
      cell: (row) => (
        <div className="font-mono text-xs">
          <div className="text-slate-300">{row.date}</div>
          <div className="text-indigo-300 font-semibold">{row.startTime}</div>
        </div>
      ),
    },
    {
      header: 'End',
      cell: (row) => <span className="font-mono text-xs text-slate-400">{row.endTime}</span>,
    },
    {
      header: 'Recurrence',
      cell: (row) => <span className="text-xs text-slate-400">{row.recurrence}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Timetable & Live Seminars"
        subtitle={`Live interactive Cambridge sessions scheduled in ${timezone}.`}
        primaryAction={{
          label: 'Plan class',
          onClick: () => openQuickAdd('session'),
          icon: Plus,
        }}
        extraActions={
          <div className="flex items-center rounded-xl border border-[#232D52] bg-[#121831] p-0.5">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-[#6D5BFF] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-[#6D5BFF] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        }
      />

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={[...sessions].sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))}
        />
      ) : (
        /* Week Calendar View with Department color-coding */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-[#232D52] bg-[#121831]">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-100">{weekLabel}</span>
              <span className="px-2 py-0.5 text-[11px] rounded bg-indigo-500/15 text-indigo-300 font-mono">
                {weekOffset === 0 ? 'This week' : weekOffset < 0 ? `${-weekOffset} week${weekOffset < -1 ? 's' : ''} ago` : `In ${weekOffset} week${weekOffset > 1 ? 's' : ''}`}
                {' · '}
                {weekSessions.length} classes
              </span>
            </div>
            <div className="flex items-center gap-2">
              {weekOffset !== 0 && (
                <button onClick={() => setWeekOffset(0)} className="px-2.5 py-1 rounded-lg border border-[#232D52] text-xs text-slate-300 hover:text-white">
                  Today
                </button>
              )}
              <button onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week" className="p-1.5 rounded-lg border border-[#232D52] text-slate-400 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week" className="p-1.5 rounded-lg border border-[#232D52] text-slate-400 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {daysOfWeek.map((day, idx) => {
              const key = keyOf(weekDays[idx]);
              const isToday = key === todayKey;
              const daySessions = weekSessions
                .filter((s) => s.date === key)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div
                  key={day}
                  className={`rounded-2xl border p-3 flex flex-col min-h-[360px] ${
                    isToday
                      ? 'border-indigo-500/40 bg-[#121831] shadow-lg'
                      : 'border-[#1E2648] bg-[#0E1428]/60'
                  }`}
                >
                  <div className="pb-2 mb-2 border-b border-[#1E2648] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      {day} <span className="font-normal text-slate-500 font-mono">{fmtDay(weekDays[idx])}</span>
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded bg-[#6D5BFF] text-white text-[10px] font-mono font-bold">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    {daySessions.map((s) => {
                      const dept =
                        DEPARTMENT_CONFIG[s.department as DepartmentName] || DEPARTMENT_CONFIG.General;
                      const teacher = teachers.find((t) => t.id === s.teacherId);

                      return (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-xl border text-xs space-y-1.5 transition-transform hover:scale-[1.01]"
                          style={{
                            backgroundColor: `${dept.hex}15`,
                            borderColor: `${dept.hex}40`,
                          }}
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="font-bold text-slate-100">{s.startTime}</span>
                            <StatusPill status={s.status} />
                          </div>

                          <div className="font-semibold text-slate-100 line-clamp-2 leading-tight">
                            {s.title}
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                            <span className="truncate">{teacher ? teacher.name : 'No tutor'}</span>
                            {s.meetingLink && (
                              <a
                                href={s.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:text-indigo-300"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {daySessions.length === 0 && (
                      <div className="h-full flex items-center justify-center text-slate-600 text-[11px] italic">
                        No scheduled classes
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
