import React from 'react';
import { Layers } from 'lucide-react';
import { DepartmentName } from '../../types';
import { DEPARTMENT_CONFIG, DEPARTMENT_ICONS } from '../../data/departments';

// One bar: department chips (with symbol and count) on the left, a small
// segmented group on the right (e.g. All / Published / Draft).
export const CategoryBar: React.FC<{
  allLabel: string;
  dept: string;
  onDept: (d: string) => void;
  counts: Partial<Record<DepartmentName, number>>;
  total: number;
  segments?: { id: string; label: string; count?: number; dot?: string }[];
  segment?: string;
  onSegment?: (id: string) => void;
}> = ({ allLabel, dept, onDept, counts, total, segments, segment, onSegment }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl border border-[#232D52] bg-[#0E1428]">
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        onClick={() => onDept('all')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
          dept === 'all' ? 'bg-[#6D5BFF] border-[#6D5BFF] text-white shadow-md shadow-indigo-900/40' : 'border-[#232D52] text-slate-300 hover:text-white'
        }`}
      >
        <Layers className="w-3.5 h-3.5" /> {allLabel}
        <span className={`font-mono text-[10px] px-1.5 rounded ${dept === 'all' ? 'bg-white/20' : 'bg-[#1A2346]'}`}>{total}</span>
      </button>
      {(Object.keys(DEPARTMENT_ICONS) as DepartmentName[])
        .filter((d) => (counts[d] || 0) > 0)
        .map((d) => {
          const Icon = DEPARTMENT_ICONS[d];
          const hex = (DEPARTMENT_CONFIG[d] || DEPARTMENT_CONFIG.General).hex;
          const active = dept === d;
          return (
            <button
              key={d}
              onClick={() => onDept(active ? 'all' : d)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
              style={active ? { backgroundColor: hex, borderColor: hex, color: '#fff' } : { borderColor: '#232D52', color: '#CBD5E1' }}
            >
              <Icon className="w-3.5 h-3.5" style={active ? undefined : { color: hex }} />
              {d === 'General' ? 'General & Other' : d}
              <span className={`font-mono text-[10px] px-1.5 rounded ${active ? 'bg-white/20' : 'bg-[#1A2346] text-slate-400'}`}>{counts[d]}</span>
            </button>
          );
        })}
    </div>
    {segments && (
      <div className="flex items-center gap-1">
        {segments.map((sg) => (
          <button
            key={sg.id}
            onClick={() => onSegment?.(sg.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              segment === sg.id ? 'bg-[#1A2346] border-slate-500 text-white' : 'border-[#232D52] text-slate-400 hover:text-white'
            }`}
          >
            {sg.dot && <span className={`w-1.5 h-1.5 rounded-full ${sg.dot}`} />}
            {sg.label}
            {sg.count !== undefined && <span className="font-mono text-[10px] opacity-80">({sg.count})</span>}
          </button>
        ))}
      </div>
    )}
  </div>
);
