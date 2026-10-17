import React from 'react';
import { Infinity as InfinityIcon } from 'lucide-react';

export interface AccessValidityInfo {
  label: string;
  subDate?: string;
  isUnlimited?: boolean;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
}

/**
 * Formats access expiration into human-readable duration remaining:
 * - "Unlimited" for null/lifetime access
 * - "Expired" for expired access
 * - "15 days" for < 30 days
 * - "1M 15d" / "1M" / "2M 5d" for months + days
 * - "1Y 2M 15d" for years + months + days
 */
export function formatAccessRemaining(
  expiresAt?: string | null,
  daysRemaining?: number | null,
  isUnlimitedExplicit?: boolean
): AccessValidityInfo {
  if (isUnlimitedExplicit || !expiresAt) {
    return {
      label: 'Unlimited',
      subDate: 'Permanent access',
      isUnlimited: true,
    };
  }

  const end = new Date(expiresAt);
  const now = new Date();

  if (isNaN(end.getTime())) {
    return { label: '—', subDate: '' };
  }

  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0 || (daysRemaining !== null && daysRemaining !== undefined && daysRemaining <= 0)) {
    return {
      label: 'Expired',
      subDate: expiresAt.slice(0, 10),
      isExpired: true,
    };
  }

  // Calculate year, month, day difference
  let years = end.getFullYear() - now.getFullYear();
  let months = end.getMonth() - now.getMonth();
  let days = end.getDate() - now.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}Y`);
  if (months > 0) parts.push(`${months}M`);
  if (days > 0) parts.push(`${days}d`);

  let label = parts.length > 0 ? parts.join(' ') : 'Today';

  // If only days and less than 1 month, format as "X days" (e.g. "15 days") as explicitly requested
  if (years === 0 && months === 0 && days > 0) {
    label = `${days} day${days === 1 ? '' : 's'}`;
  }

  const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpiringSoon = (daysRemaining ?? totalDays) <= 7;

  return {
    label,
    subDate: expiresAt.slice(0, 10),
    isExpiringSoon,
  };
}

export const AccessValidityCell: React.FC<{
  expiresAt?: string | null;
  daysRemaining?: number | null;
  isUnlimited?: boolean;
}> = ({ expiresAt, daysRemaining, isUnlimited }) => {
  const info = formatAccessRemaining(expiresAt, daysRemaining, isUnlimited);

  if (info.isUnlimited) {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-400">
          <InfinityIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Unlimited</span>
        </span>
        <span className="text-[10px] text-slate-500">Permanent access</span>
      </div>
    );
  }

  if (info.isExpired) {
    return (
      <div className="flex flex-col">
        <span className="font-mono text-xs font-bold text-rose-400">
          Expired
        </span>
        {info.subDate && (
          <span className="text-[10px] text-slate-500 font-mono">
            {info.subDate}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span
        className={`font-mono text-xs font-bold ${
          info.isExpiringSoon ? 'text-amber-400' : 'text-sky-300'
        }`}
      >
        {info.label}
      </span>
      {info.subDate && (
        <span className="text-[10px] text-slate-400 font-mono">
          Until {info.subDate}
        </span>
      )}
    </div>
  );
};
