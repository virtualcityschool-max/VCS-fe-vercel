import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { Award, Sliders, Save, Check, Download } from 'lucide-react';

export const GradesView: React.FC = () => {
  const {
    students,
    subjects,
    grades,
    settings,
    updateSettings,
    updateGrade,
    addToast,
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || 'sub-1');
  const [scaleModalOpen, setScaleModalOpen] = useState(false);

  // Local grading scale threshold state
  const [thresholds, setThresholds] = useState(settings.gradeThresholds);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleSaveScale = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ gradeThresholds: thresholds });
    setScaleModalOpen(false);
    addToast('Cambridge grade scale boundaries updated.', 'success');
  };

  const calculateGrade = (totalPercentage: number): 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U' => {
    if (totalPercentage >= thresholds.AStar) return 'A*';
    if (totalPercentage >= thresholds.A) return 'A';
    if (totalPercentage >= thresholds.B) return 'B';
    if (totalPercentage >= thresholds.C) return 'C';
    if (totalPercentage >= thresholds.D) return 'D';
    if (totalPercentage >= thresholds.E) return 'E';
    return 'U';
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Grades & Evaluations"
        subtitle="Manage Cambridge assessment marks, coursework evaluations, and predicted grade reports."
        primaryAction={{
          label: 'Grading scale rules',
          onClick: () => setScaleModalOpen(true),
          icon: Sliders,
        }}
        extraActions={
          <button
            onClick={() => addToast('Exported grade book to PDF report.', 'info')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[#232D52] bg-[#121831] text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Book</span>
          </button>
        }
      />

      {/* Subject Selector Bar */}
      <div className="p-4 rounded-xl border border-[#232D52] bg-[#121831] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-300 whitespace-nowrap">
            Select Subject:
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
          <span className="text-emerald-400 font-bold">A* ≥ {thresholds.AStar}%</span>
          <span>·</span>
          <span className="text-indigo-400 font-bold">A ≥ {thresholds.A}%</span>
          <span>·</span>
          <span className="text-amber-400 font-bold">B ≥ {thresholds.B}%</span>
        </div>
      </div>

      {/* Assessment Table */}
      <div className="rounded-2xl border border-[#232D52] bg-[#121831] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E2648] bg-[#0E1428] text-xs font-semibold text-slate-400">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4 text-center">Quiz 1 (20)</th>
                <th className="py-3 px-4 text-center">Midterm (100)</th>
                <th className="py-3 px-4 text-center">Mock Exam (100)</th>
                <th className="py-3 px-4 text-center">Weighted Total %</th>
                <th className="py-3 px-4 text-center">Predicted Grade</th>
                <th className="py-3 px-4">Teacher Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2648]/60 text-xs">
              {students.map((student) => {
                const gradeRecord = grades.find((g) => g.studentId === student.id);
                const q1 = gradeRecord?.quiz1 ?? 15;
                const mid = gradeRecord?.midterm ?? 75;
                const mock = gradeRecord?.mockExam ?? 70;

                // Weighted total: Quiz 20% + Midterm 30% + Mock 50%
                const totalPct = Math.round((q1 / 20) * 20 + (mid / 100) * 30 + (mock / 100) * 50);
                const letterGrade = calculateGrade(totalPct);

                return (
                  <tr key={student.id} className="hover:bg-[#1A2346]/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100">{student.name}</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">{student.rollNo}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-200">{q1} / 20</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-200">{mid} / 100</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-200">{mock} / 100</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-100">
                      {totalPct}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                          letterGrade === 'A*' || letterGrade === 'A'
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
                      {gradeRecord?.teacherNotes || 'Consistently meeting Cambridge syllabus milestones.'}
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
                  <label className="block text-slate-300 font-medium mb-1">A* Threshold (%)</label>
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
