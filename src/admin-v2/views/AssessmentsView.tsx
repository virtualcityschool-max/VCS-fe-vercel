import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Award, FileText, Plus, Search, X, RefreshCw, Users, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { axiosInstance } from '../../utils';
import { teacherService } from '../../services/teacherService';
import { formatTimezoneISO } from '../../utils/validation';
import { builderQuestionsToApi } from '../../utils/quizPayload';
import { extractApiErrorMessage } from '../../utils/apiErrorHandler';
import { CreateAssignmentModal, AdvancedQuizBuilderModal } from '../../components/teacher/modern/AssignmentQuizModals';

// Records → Quizzes & Assignments. The admin picks a level, then a subject, and
// sets a quiz or assignment for that class. It reaches the class's students (now
// or at a set time) exactly like one set by the teacher; the subject's teacher
// sees it and marks written answers; results reach students, parents and admin.

const asList = (d: any) => (Array.isArray(d) ? d : d?.results || d?.data || []);

type Kind = 'quiz' | 'assignment';

export const AssessmentsView: React.FC = () => {
  const { subjects = [], teachers = [], categories = [], tzIana, can, addToast } = useApp() as any;
  const tz = tzIana || 'Asia/Riyadh';
  // The panel re-renders often (clock, refreshes); keep the toast function out of effect deps.
  const toastRef = useRef(addToast);
  toastRef.current = addToast;
  const canSet = can ? can('manage_academics') : true;

  // Levels in the school's own order (Levels page), then any others found on subjects.
  const levels = useMemo(() => {
    const withSubjects = new Set(subjects.map((s: any) => s.level).filter(Boolean));
    const ordered = [...categories]
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .map((c: any) => c.name)
      .filter((n: string) => withSubjects.has(n));
    const rest = [...withSubjects].filter((n: any) => !ordered.includes(n)).sort() as string[];
    return [...ordered, ...rest];
  }, [subjects, categories]);

  const [level, setLevel] = useState('');
  const [query, setQuery] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const activeLevel = level || levels[0] || '';

  const teacherName = useCallback(
    (id: string) => teachers.find((t: any) => String(t.id) === String(id))?.name || 'No teacher yet',
    [teachers]
  );

  const levelSubjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects
      .filter((s: any) => (q ? true : s.level === activeLevel))
      .filter((s: any) => !q || `${s.name} ${s.code} ${s.batchName || ''} ${teacherName(s.teacherId)}`.toLowerCase().includes(q))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [subjects, activeLevel, query, teacherName]);

  const subject = subjects.find((s: any) => String(s.id) === String(subjectId));

  // Quizzes and assignments of the chosen subject.
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const [q, a] = await Promise.all([
        axiosInstance.get('/quizzes/', { params: { course: subjectId } }),
        axiosInstance.get('/assignments/', { params: { course: subjectId } }),
      ]);
      setQuizzes(asList(q.data));
      setAssignments(asList(a.data));
    } catch (e: any) {
      toastRef.current?.(extractApiErrorMessage(e) || 'Could not load this subject’s quizzes and assignments.', 'error');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);
  useEffect(() => {
    setQuizzes([]);
    setAssignments([]);
    load();
  }, [load]);

  const [quizOpen, setQuizOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  // Must keep the same identity between renders: the forms reset when it changes.
  const subjectName = subject?.name || '';
  const courseOption = useMemo(() => (subjectId ? [{ id: subjectId, title: subjectName }] : []), [subjectId, subjectName]);

  const saveQuiz = async (d: any) => {
    const questions = builderQuestionsToApi(d.questions);
    try {
      await teacherService.createQuiz({
        course: Number(d.courseId),
        title: d.title.trim(),
        description: d.description?.trim() || '',
        total_marks: questions.reduce((s: number, q: any) => s + q.max_marks, 0),
        duration_minutes: d.durationMinutes,
        published_at: d.launchDateTime ? formatTimezoneISO(d.launchDateTime, tz) : new Date().toISOString(),
        due_date: formatTimezoneISO(d.dueDateTime, tz),
        questions,
      });
    } catch (err) {
      throw new Error(extractApiErrorMessage(err) || 'Could not publish the quiz.');
    }
    addToast?.(`Quiz "${d.title}" set for ${subject?.name}.`, 'success');
    load();
  };

  const saveAssignment = async (d: any) => {
    await teacherService.createAssignment({
      course: Number(d.courseId),
      title: d.title,
      description: d.description,
      max_score: d.maxMarks,
      due_date: formatTimezoneISO(`${d.dueDate}T${d.dueTime}`, tz),
      status: 'published',
      ...(d.publishDate ? { publish_at: formatTimezoneISO(`${d.publishDate}T${d.publishTime}`, tz) } : {}),
      ...(d.file ? { file: d.file } : {}),
    });
    addToast?.(`Assignment "${d.title}" ${d.publishDate ? 'scheduled' : 'published'} for ${subject?.name}.`, 'success');
    load();
  };

  // Results of one quiz / assignment.
  const [results, setResults] = useState<{ kind: Kind; item: any; rows: any[] | null } | null>(null);
  const openResults = async (kind: Kind, item: any) => {
    setResults({ kind, item, rows: null });
    try {
      const r = await axiosInstance.get(kind === 'quiz' ? `/quizzes/${item.id}/submissions/` : `/assignments/${item.id}/submissions/`);
      setResults({ kind, item, rows: asList(r.data) });
    } catch (e: any) {
      setResults(null);
      addToast?.(extractApiErrorMessage(e) || 'Could not load the results.', 'error');
    }
  };

  const fmt = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString('en-GB', { timeZone: tz, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
      : '—';
  const stateOf = (start?: string | null, due?: string) => {
    const now = Date.now();
    if (start && new Date(start).getTime() > now) return { label: 'Scheduled', cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30' };
    if (due && new Date(due).getTime() < now) return { label: 'Closed', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
    return { label: 'Open', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  };

  const items = [
    ...quizzes.map((q) => ({ kind: 'quiz' as Kind, item: q, start: q.published_at, due: q.due_date, marks: q.total_marks, by: q.created_by_name, count: q.submissions_count, created: q.created_at })),
    ...assignments.map((a) => ({ kind: 'assignment' as Kind, item: a, start: a.publish_at || a.created_at, due: a.due_date, marks: a.max_score, by: a.created_by_name, count: a.submissions_count, created: a.created_at })),
  ].sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')));

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Quizzes & Assignments"
        subtitle="Set a quiz or assignment for any subject. The class's students get it (now or at a set time), the subject's teacher sees it and marks it, and results reach students, parents and you."
        onRefresh={load}
      />

      {/* 1. Level */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">1 · Choose a level</div>
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {levels.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => { setLevel(l); setQuery(''); setSubjectId(''); }}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                l === activeLevel && !query
                  ? 'bg-[#6D5BFF] border-[#6D5BFF] text-white shadow-md shadow-indigo-600/25'
                  : 'bg-[#121831] border-[#232D52] text-slate-300 hover:text-white hover:bg-[#151D3A]'
              }`}
            >
              {l}
              <span className="ml-1.5 text-[10px] opacity-70">{subjects.filter((s: any) => s.level === l).length}</span>
            </button>
          ))}
          {levels.length === 0 && <div className="text-xs text-slate-500">No subjects yet.</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* 2. Subject */}
        <div className="rounded-2xl border border-[#232D52] bg-[#121831] overflow-hidden">
          <div className="p-3 border-b border-[#1E2648] space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">2 · Choose a subject</div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all subjects or teachers"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#0E1428] border border-[#232D52] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#6D5BFF]"
              />
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#1E2648]/60">
            {levelSubjects.map((s: any) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubjectId(String(s.id))}
                className={`w-full text-left px-3.5 py-2.5 transition-colors cursor-pointer ${
                  String(s.id) === String(subjectId) ? 'bg-[#151D3A] border-l-2 border-[#6D5BFF]' : 'hover:bg-[#151D3A]/60 border-l-2 border-transparent'
                }`}
              >
                <div className="text-xs font-semibold text-white truncate">{s.name}</div>
                <div className="text-[11px] text-slate-400 truncate">
                  {teacherName(s.teacherId)} · {s.studentCount} student{s.studentCount === 1 ? '' : 's'}
                  {query && s.level ? ` · ${s.level}` : ''}
                </div>
              </button>
            ))}
            {levelSubjects.length === 0 && <div className="p-4 text-xs text-slate-500">No subjects match.</div>}
          </div>
        </div>

        {/* 3. Set and follow */}
        <div className="rounded-2xl border border-[#232D52] bg-[#121831] min-h-[200px]">
          {!subject ? (
            <div className="p-10 text-center text-xs text-slate-500">Choose a subject to set a quiz or assignment and see results.</div>
          ) : (
            <>
              <div className="p-4 border-b border-[#1E2648] flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{subject.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {subject.level} · Teacher: {teacherName(subject.teacherId)} · {subject.studentCount} enrolled
                  </div>
                </div>
                {canSet && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#6D5BFF]/40 bg-[#6D5BFF]/15 text-indigo-200 hover:bg-[#6D5BFF]/25 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Assignment
                    </button>
                  </div>
                )}
              </div>

              <div className="divide-y divide-[#1E2648]/60">
                {loading && items.length === 0 && <div className="p-6 text-xs text-slate-500">Loading…</div>}
                {!loading && items.length === 0 && (
                  <div className="p-6 text-xs text-slate-500">No quizzes or assignments for this subject yet.</div>
                )}
                {items.map(({ kind, item, start, due, marks, by, count }) => {
                  const st = stateOf(kind === 'quiz' ? start : item.publish_at, due);
                  const Icon = kind === 'quiz' ? Award : FileText;
                  return (
                    <div key={`${kind}-${item.id}`} className="p-4 flex flex-wrap items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1A2346] border border-[#232D52] flex items-center justify-center text-indigo-300 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold ${st.cls}`}>{st.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-x-3">
                          <span>{kind === 'quiz' ? 'Quiz' : 'Assignment'} · {marks} marks{kind === 'quiz' && item.duration_minutes ? ` · ${item.duration_minutes} min` : ''}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{st.label === 'Scheduled' ? `Opens ${fmt(start)} · ` : ''}Due {fmt(due)}</span>
                          <span>Set by {by || '—'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openResults(kind, item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-[#232D52] text-slate-200 hover:bg-[#151D3A] cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" /> Results ({count ?? 0})
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <AdvancedQuizBuilderModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        courses={courseOption}
        onSaveQuiz={saveQuiz}
        timezone={tz}
      />
      <CreateAssignmentModal
        isOpen={assignmentOpen}
        onClose={() => setAssignmentOpen(false)}
        courses={courseOption}
        onCreateAssignment={saveAssignment}
        allowSchedule
      />

      {results && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setResults(null)}>
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#232D52] bg-[#101428] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2648] bg-[#0E1326]">
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{results.item.title}</div>
                <div className="text-[11px] text-slate-400">
                  {results.kind === 'quiz' ? 'Quiz' : 'Assignment'} results · {subject?.name}
                  {results.rows ? ` · ${results.rows.length} of ${subject?.studentCount ?? '?'} submitted` : ''}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => openResults(results.kind, results.item)} title="Refresh" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setResults(null)} title="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto">
              {!results.rows && <div className="p-6 text-xs text-slate-500">Loading…</div>}
              {results.rows && results.rows.length === 0 && <div className="p-6 text-xs text-slate-500">No student has submitted yet.</div>}
              {results.rows && results.rows.length > 0 && (
                <table className="w-full text-xs">
                  <thead className="text-[11px] text-slate-400 bg-[#0E1428]">
                    <tr>
                      <th className="text-left font-semibold px-4 py-2">Student</th>
                      <th className="text-left font-semibold px-4 py-2">Submitted</th>
                      <th className="text-right font-semibold px-4 py-2">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2648]/60">
                    {results.rows.map((r: any) => {
                      // A quiz stays 'submitted' while written answers wait for the teacher (else auto_graded / graded).
                      const waiting = results.kind === 'quiz' ? r.status === 'submitted' : !r.is_graded;
                      const result =
                        results.kind === 'quiz'
                          ? `${Number(r.obtained_marks)} / ${r.total_marks_snapshot}${r.percentage != null ? ` (${Math.round(r.percentage)}%)` : ''}`
                          : r.is_graded ? `${Number(r.score)} / ${results.item.max_score}` : '';
                      return (
                        <tr key={r.id}>
                          <td className="px-4 py-2.5 text-slate-100">{r.student_name || `Student #${r.student}`}</td>
                          <td className="px-4 py-2.5 text-slate-400">
                            {fmt(r.submitted_at)}
                            {r.status === 'late' && <span className="ml-1.5 text-amber-300">late</span>}
                            {results.kind === 'assignment' && r.file_url && (
                              <a href={r.file_url} target="_blank" rel="noreferrer" className="ml-2 text-indigo-300 hover:underline">file</a>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {waiting && results.kind === 'assignment' ? (
                              <span className="text-amber-300">Waiting for the teacher to mark</span>
                            ) : (
                              <span className="font-mono text-white">
                                {result}
                                {waiting && <span className="ml-1.5 font-sans text-amber-300">· written answers to mark</span>}
                                {!waiting && <CheckCircle2 className="inline w-3.5 h-3.5 ml-1.5 text-emerald-400" />}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
