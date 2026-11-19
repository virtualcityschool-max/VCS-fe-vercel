import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

/** A class can be moved or cancelled only while it is scheduled and has not started. */
export const canChangeSession = (raw: any) =>
  !!raw && raw.status === 'scheduled' && new Date(raw.scheduled_at).getTime() > Date.now();

/** Edit + Delete for an upcoming class. Used by Live Classes and the Timetable.
 * Edit opens the planner filled in from the class; Delete marks it cancelled (the record is kept). */
export const SessionChangeButtons: React.FC<{
  onReschedule: () => void;
  onCancel: () => void;
  // 'card' fills the width of a calendar card; 'inline' sits in a table row.
  variant?: 'inline' | 'card';
}> = ({ onReschedule, onCancel, variant = 'inline' }) => {
  const card = variant === 'card';
  const base = card
    ? 'flex-1 inline-flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition'
    : 'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition';
  return (
    <span className={card ? 'flex flex-wrap gap-1 pt-1' : 'inline-flex items-center gap-1'}>
      <button
        type="button"
        onClick={onReschedule}
        className={`${base} bg-[#6D5BFF] hover:bg-[#5B47FB] text-white`}
        title="Change this class's date, time, teacher or title"
      >
        <Pencil className="w-3 h-3" /> Edit
      </button>
      <button
        type="button"
        onClick={onCancel}
        className={`${base} border border-rose-500/40 text-rose-300 hover:bg-rose-500/10`}
        title="Delete this class (it is marked cancelled; the record is kept)"
      >
        <Trash2 className="w-3 h-3" /> Delete
      </button>
    </span>
  );
};
