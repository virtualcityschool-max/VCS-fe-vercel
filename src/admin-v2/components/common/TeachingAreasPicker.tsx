import React, { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { TEACHING_AREAS } from '../../data/formOptions';

// Chip drop-down to tick the subjects a teacher teaches. Suggested areas
// (guessed from their profile text) show dashed until an admin confirms.
export const TeachingAreasPicker: React.FC<{
  value: string[];
  suggested?: boolean;
  onChange: (areas: string[]) => void;
}> = ({ value, suggested, onChange }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggle = (a: string) => onChange(value.includes(a) ? value.filter((x) => x !== a) : [...value, a]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setPos({ top: r.bottom + 4, left: r.left });
          setOpen((o) => !o);
        }}
        title={suggested ? 'Suggested from their profile — click to confirm or change' : 'Subjects this teacher teaches'}
        className="flex flex-wrap items-center gap-1 min-w-[170px] max-w-[260px] px-2 py-1.5 rounded-xl border border-[#232D52] bg-[#0E1428] hover:border-[#6D5BFF] text-left"
      >
        {value.length === 0 && <span className="text-xs text-slate-500 italic px-1">Choose subjects</span>}
        {value.map((a) => (
          <span
            key={a}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${suggested ? 'border border-dashed border-sky-400/50 text-sky-300/80' : 'bg-sky-400/15 border border-sky-400/30 text-sky-200'}`}
          >
            {a}
          </span>
        ))}
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-auto shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div style={{ top: pos.top, left: pos.left }} className="fixed z-50 w-56 rounded-xl border border-[#232D52] bg-[#121831] p-1.5 shadow-2xl text-xs">
            {suggested && value.length > 0 && (
              <button
                onClick={() => { onChange(value); setOpen(false); }}
                className="w-full mb-1 px-2.5 py-1.5 rounded-lg bg-sky-500/15 text-sky-200 font-semibold hover:bg-sky-500/25 text-left"
              >
                Confirm suggestion
              </button>
            )}
            {TEACHING_AREAS.map((a) => {
              const on = value.includes(a);
              return (
                <button key={a} onClick={() => toggle(a)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left ${on ? 'text-white bg-[#6D5BFF]/15' : 'text-slate-300 hover:bg-[#1A2346]'}`}>
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${on ? 'bg-[#6D5BFF] border-[#6D5BFF]' : 'border-slate-600'}`}>
                    {on && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  {a}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
