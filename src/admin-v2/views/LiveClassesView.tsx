import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { inputCls } from '../components/common/FormControls';
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Info, Radio, Search, Users, Video } from 'lucide-react';

type Phase = 'live' | 'late' | 'soon' | 'later' | 'ended' | 'cancelled';

const PHASE_STYLE: Record<Phase, { label: string; pill: string }> = {
  live: { label: 'Live now', pill: 'bg-rose-500/15 text-rose-300 border-rose-500/40' },
  late: { label: 'Not started yet', pill: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  soon: { label: 'Starting soon', pill: 'bg-sky-500/15 text-sky-300 border-sky-500/40' },
  later: { label: 'Scheduled', pill: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  ended: { label: 'Ended', pill: 'bg-slate-700/30 text-slate-400 border-slate-600/40' },
  cancelled: { label: 'Cancelled', pill: 'bg-slate-700/30 text-slate-500 border-slate-600/40 line-through' },
};

const mins = (ms: number) => Math.max(0, Math.round(ms / 60000));
const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim() : `${m} min`);

// Live Classes: today's Google Meet classes with who is in them, and a Join
// button so an admin can drop in and observe a class.
export const LiveClassesView: React.FC = () => {
  const { sessions = [], rawAttendanceAll = [], subjects = [], reload, tzIana, setCurrentView } = useApp() as any;
  const [mode, setMode] = useState<'upcoming' | 'past'>('upcoming');
  const [dayOffset, setDayOffset] = useState(0);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(Date.now());

  // Countdowns tick every 30 s; classes and attendance refresh every minute.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    const r = setInterval(() => reload('sessions', 'attendance'), 60000);
    reload('sessions', 'attendance');
    return () => { clearInterval(t); clearInterval(r); };
  }, []);

  const dayKey = useMemo(() => {
    const d = new Date(now + dayOffset * 86400000);
    return d.toLocaleDateString('en-CA', tzIana ? { timeZone: tzIana } : undefined);
  }, [now, dayOffset, tzIana]);
  const dayLabel = new Date(now + dayOffset * 86400000).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', ...(tzIana ? { timeZone: tzIana } : {}),
  });
  const timeOf = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', ...(tzIana ? { timeZone: tzIana } : {}) });

  const attendanceBySession = useMemo(() => {
    const m = new Map<string, any[]>();
    rawAttendanceAll.forEach((a: any) => {
      const k = String(a.session);
      m.set(k, [...(m.get(k) || []), a]);
    });
    return m;
  }, [rawAttendanceAll]);

  const rowsFor = (key: string) => {
    const q = query.trim().toLowerCase();
    return sessions
      .filter((s: any) => s.date === key)
      .map((s: any) => {
        const r = s._raw || {};
        const start = new Date(r.scheduled_at);
        const end = new Date(start.getTime() + (r.duration_mins || 60) * 60000);
        const t = now;
        const phase: Phase =
          r.status === 'cancelled' ? 'cancelled'
          : r.status === 'live' ? 'live'
          : r.status === 'ended' || t > end.getTime() ? 'ended'
          : t >= start.getTime() ? 'late'
          : start.getTime() - t <= 60 * 60000 ? 'soon'
          : 'later';
        const att = attendanceBySession.get(String(r.id)) || [];
        const inNow = (a: any) => a.joined_at && !a.left_at;
        const studentsAtt = att.filter((a: any) => a.participant_role !== 'teacher');
        const subject = subjects.find((x: any) => x.id === String(r.course));
        return {
          id: String(r.id), r, start, end, phase,
          title: r.title, course: r.course_title || subject?.name || '', batch: subject?.batchName || '',
          teacher: r.teacher_name || 'No teacher', link: r.meeting_link || '',
          expected: r.enrollment_count ?? null,
          teacherIn: att.some((a: any) => a.participant_role === 'teacher' && inNow(a)),
          teacherJoined: att.some((a: any) => a.participant_role === 'teacher' && a.joined_at),
          studentsNow: studentsAtt.filter(inNow).length,
          present: studentsAtt.filter((a: any) => a.status === 'present').length,
          late: studentsAtt.filter((a: any) => a.status === 'late').length,
          absent: studentsAtt.filter((a: any) => a.status === 'absent').length,
        };
      })
      .filter((x: any) => !q || `${x.title} ${x.course} ${x.batch} ${x.teacher}`.toLowerCase().includes(q))
      .sort((a: any, b: any) => a.start.getTime() - b.start.getTime());
  };
  const keyFor = (offset: number) =>
    new Date(now + offset * 86400000).toLocaleDateString('en-CA', tzIana ? { timeZone: tzIana } : undefined);
  const labelFor = (offset: number) =>
    new Date(now + offset * 86400000).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', ...(tzIana ? { timeZone: tzIana } : {}) });
  // Today drives the live sections and counts; the chosen day drives "Past classes".
  const todayRows = useMemo(() => rowsFor(keyFor(0)), [sessions, now, attendanceBySession, subjects, query]);
  const rows = useMemo(() => (mode === 'upcoming' ? todayRows : rowsFor(dayKey)), [todayRows, sessions, dayKey, now, attendanceBySession, subjects, query, mode]);
  // Next 7 days for the "coming up" list.
  const nextDays = useMemo(
    () => [1, 2, 3, 4, 5, 6, 7].map((o) => ({ offset: o, label: o === 1 ? `Tomorrow · ${labelFor(o)}` : labelFor(o), rows: rowsFor(keyFor(o)).filter((x: any) => x.phase !== 'cancelled') })),
    [sessions, now, attendanceBySession, subjects, query]
  );

  const group = (phases: Phase[]) => todayRows.filter((x: any) => phases.includes(x.phase));
  const liveRows = group(['live', 'late']);
  const soonRows = group(['soon']);
  const laterRows = group(['later']);
  const endedRows = rows.filter((x: any) => x.phase === 'ended' || x.phase === 'cancelled').reverse();

  const comingUp = nextDays.reduce((n, d) => n + d.rows.length, 0);
  const kpis = [
    { label: 'Live now', value: todayRows.filter((x: any) => x.phase === 'live').length, tint: 'text-rose-400' },
    { label: 'Should have started', value: todayRows.filter((x: any) => x.phase === 'late').length, tint: 'text-amber-400' },
    { label: 'Later today', value: soonRows.length + laterRows.length, tint: 'text-sky-400' },
    { label: 'Coming up · next 7 days', value: comingUp, tint: 'text-slate-100' },
  ];

  const Row: React.FC<{ x: any }> = ({ x }) => {
    const st = PHASE_STYLE[x.phase as Phase];
    const t = now;
    const timing =
      x.phase === 'live' ? `Live for ${dur(mins(t - x.start.getTime()))} · ends ${timeOf(x.end)}`
      : x.phase === 'late' ? `Was due ${dur(mins(t - x.start.getTime()))} ago`
      : x.phase === 'soon' || x.phase === 'later' ? `Starts in ${dur(mins(x.start.getTime() - t))}`
      : x.phase === 'cancelled' ? 'Cancelled'
      : `Ended ${timeOf(x.end)}`;
    const ended = x.phase === 'ended' || x.phase === 'cancelled';
    return (
      <div className={`grid grid-cols-12 gap-3 items-center px-4 py-3 border-t border-[#1E2648]/60 ${x.phase === 'live' ? 'bg-rose-500/[0.04]' : ''}`}>
        <div className="col-span-4 md:col-span-2">
          <div className="text-sm font-bold text-slate-100 font-mono">{timeOf(x.start)}</div>
          <div className="text-[11px] text-slate-500">{timing}</div>
        </div>
        <div className="col-span-8 md:col-span-4 min-w-0">
          <div className="text-sm font-semibold text-slate-100 truncate">{x.course || x.title}</div>
          <div className="text-[11px] text-slate-400 truncate">
            {x.batch && <span className="text-sky-300">{x.batch} · </span>}
            {x.title !== x.course ? x.title : ''}
          </div>
        </div>
        <div className="col-span-6 md:col-span-2 min-w-0">
          <div className="text-[13px] text-slate-200 truncate">{x.teacher}</div>
          <div className={`text-[11px] ${x.teacherIn ? 'text-emerald-400' : x.phase === 'late' || x.phase === 'live' ? 'text-amber-300' : 'text-slate-500'}`}>
            {x.teacherIn ? '● In the class' : ended ? (x.teacherJoined ? 'Taught the class' : 'Did not join') : x.phase === 'late' || x.phase === 'live' ? 'Not in the class yet' : ''}
          </div>
        </div>
        <div className="col-span-6 md:col-span-2 text-xs">
          {ended ? (
            <span className="text-slate-400">
              <span className="text-emerald-400">{x.present}</span> present · <span className="text-amber-400">{x.late}</span> late · <span className="text-rose-400">{x.absent}</span> absent
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-slate-200">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              {x.phase === 'live' || x.phase === 'late' ? <><b>{x.studentsNow}</b> in class</> : null}
              {x.expected != null && <span className="text-slate-500">{x.phase === 'live' || x.phase === 'late' ? ` of ${x.expected}` : `${x.expected} enrolled`}</span>}
            </span>
          )}
        </div>
        <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap ${st.pill}`}>
            {x.phase === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-1 animate-pulse align-middle" />}
            {st.label}
          </span>
          {!ended && x.link && (
            <a
              href={x.link}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap ${x.phase === 'live' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-[#6D5BFF] hover:bg-[#5B47FB]'}`}
            >
              <Video className="w-3.5 h-3.5" /> Join
            </a>
          )}
          {!ended && !x.link && <span className="text-[11px] text-amber-300">No Meet link</span>}
        </div>
      </div>
    );
  };

  const Section: React.FC<{ title: string; icon: any; tone: string; items: any[]; empty?: string }> = ({ title, icon: Icon, tone, items, empty }) =>
    items.length === 0 && !empty ? null : (
      <div className="rounded-2xl border border-[#232D52] bg-[#121831] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0E1428] text-[11px] font-bold uppercase tracking-wider">
          <Icon className={`w-3.5 h-3.5 ${tone}`} />
          <span className={tone}>{title}</span>
          <span className="text-slate-500 font-mono">{items.length}</span>
        </div>
        {items.length === 0 ? <div className="px-4 py-6 text-center text-xs text-slate-500 border-t border-[#1E2648]/60">{empty}</div> : items.map((x) => <Row key={x.id} x={x} />)}
      </div>
    );

  const tab = (id: 'upcoming' | 'past', label: string) => (
    <button
      onClick={() => { setMode(id); setDayOffset(0); }}
      className={`px-4 py-2 rounded-lg text-xs font-semibold ${mode === id ? 'bg-[#6D5BFF] text-white' : 'text-slate-400 hover:text-white'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader title="Live Classes" subtitle="Classes running now and coming up. Join any class to see how it is going." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="p-4 rounded-xl border border-[#232D52] bg-[#121831]">
            <div className="text-xs text-slate-400">{k.label}</div>
            <div className={`text-2xl font-bold font-mono mt-1 ${k.tint}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[#232D52] bg-[#121831] w-fit">
          {tab('upcoming', 'Now & coming up')}
          {tab('past', 'Past classes')}
        </div>
        {mode === 'past' && (
          <div className="flex items-center gap-1 p-1 rounded-xl border border-[#232D52] bg-[#121831] w-fit">
            <button onClick={() => setDayOffset((d) => d - 1)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2346]"><ChevronLeft className="w-4 h-4" /></button>
            <span className="flex items-center gap-1.5 px-3 text-xs text-slate-300"><CalendarDays className="w-3.5 h-3.5 text-sky-300" />{dayOffset === 0 ? `Today · ${dayLabel}` : dayLabel}</span>
            <button disabled={dayOffset >= 0} onClick={() => setDayOffset((d) => Math.min(0, d + 1))} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2346] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search class, subject, batch or teacher…" className={`${inputCls} pl-9`} />
        </div>
      </div>

      {mode === 'upcoming' && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-sky-500/20 bg-sky-500/[0.06] text-xs text-slate-300">
          <Info className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
          <span>
            Join opens the class in Google Meet with the Google account signed in to this browser. <b className="text-white">virtualcityschool@gmail.com</b> hosts every
            class and enters straight away; other admin Gmail addresses listed under <button onClick={() => setCurrentView('settings')} className="text-sky-300 hover:underline">Platform Settings → Class observers</button> are
            invited to every new class and also enter without waiting. Everyone in the class can see who joins, so keep camera and microphone off to observe quietly.
          </span>
        </div>
      )}

      {mode === 'upcoming' ? (
        <>
          <Section title="Live now" icon={Radio} tone="text-rose-300" items={liveRows} empty="No class is running at the moment." />
          {liveRows.some((x: any) => x.phase === 'late') && (
            <div className="flex items-center gap-2 text-xs text-amber-300 -mt-3">
              <AlertTriangle className="w-3.5 h-3.5" /> “Not started yet” means the class time has begun but the teacher has not started it in the system.
            </div>
          )}
          <Section title="Starting within the hour" icon={Video} tone="text-sky-300" items={soonRows} />
          <Section title="Later today" icon={CalendarDays} tone="text-slate-200" items={laterRows} />
          {nextDays.filter((d) => d.rows.length).map((d) => (
            <Section key={d.offset} title={d.label} icon={CalendarDays} tone="text-slate-300" items={d.rows} />
          ))}
          {liveRows.length + soonRows.length + laterRows.length + comingUp === 0 && (
            <div className="text-center text-xs text-slate-500">
              No classes planned for the next 7 days. Plan classes in the{' '}
              <button onClick={() => setCurrentView('timetable')} className="text-sky-300 hover:underline">Timetable</button>.
            </div>
          )}
        </>
      ) : (
        <Section title={dayOffset === 0 ? 'Ended today' : 'Classes held'} icon={CalendarDays} tone="text-slate-300" items={endedRows} empty="No classes held on this day." />
      )}
    </div>
  );
};
