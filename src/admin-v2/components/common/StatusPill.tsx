import React from 'react';

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  // Grey first: "inactive" also contains "active".
  if (normalized.includes('inactive') || normalized.includes('not enrolled') || normalized.includes('no marks')) {
    colorClasses = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
  }
  // Green / Success
  else if (
    normalized.includes('active') ||
    normalized.includes('paid') ||
    normalized.includes('present') ||
    normalized.includes('published') ||
    normalized.includes('engaged') ||
    normalized.includes('approved')
  ) {
    colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400';
  }
  // Amber / Pending / Warning
  else if (
    normalized.includes('pending') ||
    normalized.includes('expiring') ||
    normalized.includes('standby') ||
    normalized.includes('trial') ||
    normalized.includes('late')
  ) {
    colorClasses = 'bg-amber-950/60 text-amber-400 border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-400';
  }
  // Red / Danger / Overdue
  else if (
    normalized.includes('expired') ||
    normalized.includes('overdue') ||
    normalized.includes('absent') ||
    normalized.includes('rejected') ||
    normalized.includes('cancelled')
  ) {
    colorClasses = 'bg-rose-950/60 text-rose-400 border-rose-800/60 dark:bg-rose-950/60 dark:text-rose-400';
  }
  // Blue / Info / Live
  else if (
    normalized.includes('live') ||
    normalized.includes('scheduled') ||
    normalized.includes('upcoming')
  ) {
    colorClasses = 'bg-sky-950/60 text-sky-400 border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-400';
  }
  // Grey / Draft / Ended
  else if (
    normalized.includes('draft') ||
    normalized.includes('ended') ||
    normalized.includes('inactive') ||
    normalized.includes('completed')
  ) {
    colorClasses = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${colorClasses} whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      <span>{status}</span>
    </span>
  );
};
