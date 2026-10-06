import React, { useEffect, useMemo, useState } from 'react';
import { coursesService } from '../../services/coursesService';
import { exportVisibleTableCsv, fileSlug } from '../utils';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { Award, Sliders, Save, Check, Download } from 'lucide-react';

export const EvaluationsView: React.FC = () => {
  const {
    students,
    subjects,
    grades,
    settings,
    updateSettings,
    updateGrade,
    addToast,
  } = useApp();

  // Start on the subject with the most students; marks load per subject.
  const defaultSubjectId = useMemo(
    () => [...subjects].sort((a, b) => b.studentCount - a.studentCount)[0]?.id || '',
    [subjects]
  );
  const [chosenSubjectId, setSelectedSubjectId] = useState('');
  const selectedSubjectId = chosenSubjectId || defaultSubjectId;
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loadingEval, setLoadingEval] = useState(false);

  useEffect(() => {
    if (!selectedSubjectId) return;
    let cancelled = false;
    setLoadingEval(true);
    coursesService
      .getEvaluations({ course: selectedSubjectId })
      .then((d: any) => {
        if (cancelled) return;
        const list = Array.isArray(d) ? d : d?.results || [];
        setEvaluation(list.find((x: any) => String(x.course?.id) === String(selectedSubjectId)) || list[0] || null);
      })
      .catch(() => !cancelled && setEvaluation(null))
      .finally(() => !cancelled && setLoadingEval(false));
    return () => {
      cancelled = true;
    };
  }, [selectedSubjectId]);

  const scales: { grade: string; min_percentage: number }[] = evaluation?.grading_scale?.scales || [];
  const gradeFor = (pct: number) =>
    [...scales].sort((a, b) => b.min_percentage - a.min_percentage).find((g) => pct >= g.min_percentage)?.grade || '—';
  const [scaleModalOpen, setScaleModalOpen] = useState(false);

  // Local grading scale threshold state
  const [thresholds, setThresholds] = useState(settings.gradeThresholds);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleSaveScale = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ gradeThresholds: thresholds });
    setScaleModalOpen(false);
  };


  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Student Evaluations & Assessment Sheets"
        subtitle="Manage Cambridge exam marks, coursework evaluations, quiz scoring, and predicted grades."
        primaryAction={{
          label: 'Grading scale rules',
          onClick: () => {
            setThresholds(settings.gradeThresholds);
            setScaleModalOpen(true);
          },
          icon: Sliders,
        }}
        extraActions={
          <button
            onClick={() => {
              const n = exportVisibleTableCsv(fileSlug(`evaluations ${selectedSubject?.name || ''}`));
              addToast(n ? `Downloaded ${n} evaluation rows as CSV.` : 'Nothing to export.', n ? 'success' : 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[#232D52] bg-[#121831] text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        }
      />

      {/* Subject Selector Bar */}
      <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-300 whitespace-nowrap">
            Select Course:
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} {sub.name} ({sub.level})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Active Scale Thresholds: </span>
          <span className="text-emerald-400 font-bold">A+ ≥ {settings.gradeThresholds.AStar}%</span>
          <span>·</span>
          <span className="text-indigo-400 font-bold">A ≥ {settings.gradeThresholds.A}%</span>
          <span>·</span>
          <span className="text-amber-400 font-bold">B ≥ {settings.gradeThresholds.B}%</span>
        </div>
      </div>

      {/* Assessment Table */}
      <div className="rounded-2xl border border-[#232D52] bg-[#121831] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E2648] bg-[#0E1428] text-xs font-semibold text-slate-400">
                <th className="py-3 px-4">Student Candidate</th>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4 text-center">Assignments</th>
                <th className="py-3 px-4 text-center">Quizzes</th>
                <th className="py-3 px-4 text-center">Combined</th>
                <th className="py-3 px-4 text-center">Final %</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2648]/60 text-xs">
              {loadingEval && (
                <tr><td colSpan={8} className="py-10 text-center text-xs text-slate-400">Loading marks…</td></tr>
              )}
              {!loadingEval && (evaluation?.students || []).length === 0 && (
                <tr><td colSpan={8} className="py-10 text-center text-xs text-slate-400">No students are enrolled in this subject yet.</td></tr>
              )}
              {!loadingEval && (evaluation?.students || []).map((row: any) => {
                const a = row.assignment_totals || {};
                const q = row.quiz_totals || {};
                const c = row.combined_totals || {};
                const f = row.final_totals || {};
                const hasMarks = (a.computed_total || 0) + (q.computed_total || 0) + (f.total_marks || 0) > 0;
                const finalPct = hasMarks ? Math.round(f.percentage ?? c.computed_percentage ?? 0) : null;
                const letterGrade = finalPct === null ? '—' : f.grade || gradeFor(finalPct);
                const result = !hasMarks ? 'No marks yet' : (f.result || c.computed_result) === 'passed' ? 'Passed' : 'Below pass mark';

                return (
                  <tr key={row.enrollment_id} className="hover:bg-[#1A2346]/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100">{row.student?.username}</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">{row.student?.roll_no ?? '—'}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-200">
                      {a.computed_total ? `${a.computed_obtained} / ${a.computed_total}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-200">
                      {q.computed_total ? `${q.computed_obtained} / ${q.computed_total}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-200">
                      {c.computed_total ? `${c.computed_obtained} / ${c.computed_total}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-100">
                      {finalPct === null ? '—' : `${finalPct}%`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                          letterGrade === '—'
                            ? 'bg-slate-800/60 text-slate-500 border border-slate-700/60'
                            : letterGrade === 'A+' || letterGrade === 'A'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : letterGrade === 'B'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : letterGrade === 'C'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {letterGrade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {result}
                      {f.is_override ? ' · set by teacher' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Scale Modal */}
      {scaleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-slate-100">Cambridge Grading Scale Editor</h3>
            <p className="text-xs text-slate-400">
              Configure minimum percentage thresholds required for Cambridge report cards.
            </p>

            <form onSubmit={handleSaveScale} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">A+ Threshold (%)</label>
                  <input
                    type="number"
                    value={thresholds.AStar}
                    onChange={(e) => setThresholds({ ...thresholds, AStar: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">A Threshold (%)</label>
                  <input
                    type="number"
                    value={thresholds.A}
                    onChange={(e) => setThresholds({ ...thresholds, A: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">B Threshold (%)</label>
                  <input
                    type="number"
                    value={thresholds.B}
                    onChange={(e) => setThresholds({ ...thresholds, B: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">C Threshold (%)</label>
                  <input
                    type="number"
                    value={thresholds.C}
                    onChange={(e) => setThresholds({ ...thresholds, C: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">D Threshold (%) · pass mark</label>
                  <input
                    type="number"
                    value={thresholds.D}
                    onChange={(e) => setThresholds({ ...thresholds, D: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2648]">
                <button
                  type="button"
                  onClick={() => setScaleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white"
                >
                  Save Scale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
