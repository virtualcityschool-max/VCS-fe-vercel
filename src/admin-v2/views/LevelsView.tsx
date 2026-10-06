import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { Layers, Plus, Trash2, Edit3, Check, BookOpen } from 'lucide-react';
import { AcademicLevel } from '../types';

export const LevelsView: React.FC = () => {
  const { levels, addLevel, removeLevel, subjects, students, addToast } = useApp();
  const [newLevelName, setNewLevelName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLevelName.trim()) return;
    addLevel(newLevelName.trim() as AcademicLevel);
    setNewLevelName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Curriculum Levels"
        subtitle="Manage academic stages and certification tiers across Cambridge International and National tracks."
        primaryAction={{
          label: 'Add level',
          onClick: () => setIsAdding(true),
          icon: Plus,
        }}
      />

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-950/20 flex items-center gap-3 animate-in fade-in"
        >
          <input
            type="text"
            required
            autoFocus
            value={newLevelName}
            onChange={(e) => setNewLevelName(e.target.value)}
            placeholder="e.g. Edexcel IAL or Grade 9"
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#232D52] bg-[#121831] text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Save Level
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-[#232D52] bg-[#121831] divide-y divide-[#1E2648] shadow-xl overflow-hidden">
        {levels.map((lvl, idx) => {
          const associatedSubjects = subjects.filter((s) => s.level === lvl).length;
          const associatedStudents = students.filter((s) => s.level === lvl).length;

          return (
            <div
              key={lvl}
              className="p-4 flex items-center justify-between hover:bg-[#151D3A]/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <span className="font-mono text-slate-500 text-xs w-6">{idx + 1}.</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{lvl}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {associatedSubjects} active subjects · {associatedStudents} enrolled candidates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeLevel(lvl)}
                  disabled={levels.length <= 1}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30"
                  title="Remove level"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
