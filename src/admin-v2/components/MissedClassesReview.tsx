import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Missed classes are decided one by one: some were taught over a shared Meet link, some never happened.
// The admin ticks the ones that were taught (or not) and records only those.
export const MissedClassesReview: React.FC<{ isOpen: boolean; onClose: () => void; classes: any[] }> = ({ isOpen, onClose, classes }) => {
  const { batchResolveMissedSessions, can } = useApp() as any;
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => { if (isOpen) setPicked([]); }, [isOpen]);
  // Drop ticks for classes that were just resolved and left the list
  useEffect(() => {
    setPicked((p) => p.filter((id) => classes.some((c) => String(c.id) === id)));
  }, [classes]);

  if (!isOpen) return null;

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const allPicked = classes.length > 0 && picked.length === classes.length;
  const decide = async (resolution: 'held' | 'cancelled') => {
    const note = resolution === 'held' ? 'Marked held by admin after review' : 'Cancelled by admin after review';
    const done = await batchResolveMissedSessions(picked, resolution, note);
    if (done) setPicked([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#121831] border border-[#232D52] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-4 border-b border-[#1E2648]">
          <div>
            <h3 className="text-sm font-bold text-white">Missed classes — {classes.length} to decide</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tick the classes that took place and press Held. Tick the ones that did not happen and press Cancel. Nothing is deleted.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-[#1E2648] flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            className="accent-indigo-500 cursor-pointer"
            checked={allPicked}
            onChange={() => setPicked(allPicked ? [] : classes.map((c) => String(c.id)))}
          />
          <span>{picked.length ? `${picked.length} ticked` : 'Tick all'}</span>
        </div>

        <div className="overflow-y-auto divide-y divide-[#1E2648]/60">
          {classes.length === 0 && <p className="p-6 text-center text-xs text-slate-400">All missed classes are decided ✓</p>}
          {classes.map((c) => {
            const id = String(c.id);
            return (
              <label key={id} className="flex items-start gap-3 px-4 py-2.5 text-xs cursor-pointer hover:bg-slate-800/40">
                <input type="checkbox" className="mt-0.5 accent-indigo-500 cursor-pointer" checked={picked.includes(id)} onChange={() => toggle(id)} />
                <span className="w-28 shrink-0 font-mono text-slate-400">{c.date} {c.startTime}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-slate-200 truncate">{c.courseTitle || c.title}</span>
                  <span className={c.teacherName ? 'text-slate-400' : 'text-amber-400'}>{c.teacherName || 'No teacher assigned'}</span>
                </span>
              </label>
            );
          })}
        </div>

        {can('manage_academics') && (
          <div className="p-3 border-t border-[#1E2648] flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={!picked.length}
              onClick={() => decide('cancelled')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel ticked ({picked.length})</span>
            </button>
            <button
              type="button"
              disabled={!picked.length}
              onClick={() => decide('held')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Held ({picked.length})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
