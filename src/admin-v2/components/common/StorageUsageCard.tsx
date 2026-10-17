import React, { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';

const mb = (b: number) => Math.round(b / (1024 * 1024));

// Read-only: how much of the database plan is used. Old technical records are
// cleared automatically every Sunday night, so this should stay low.
export const StorageUsageCard: React.FC = () => {
  const [usage, setUsage] = useState<{ used_bytes: number; limit_bytes: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    axiosInstance
      .get('/messaging/storage-usage/')
      .then((r: any) => setUsage(r.data))
      .catch(() => setFailed(true));
  }, []);

  const pct = usage ? Math.min(100, Math.round((usage.used_bytes / usage.limit_bytes) * 100)) : 0;
  const bar = pct >= 80 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="p-6 rounded-2xl border border-[#232D52] bg-[#121831] space-y-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Database Storage</h3>
          <p className="text-xs text-slate-400">
            Old technical records (calendar logs, expired logins, unused sign-in codes) are cleared automatically every Sunday night.
          </p>
        </div>
      </div>
      {failed ? (
        <p className="text-xs text-slate-400">Could not read storage right now.</p>
      ) : !usage ? (
        <p className="text-xs text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-200 font-semibold">{mb(usage.used_bytes)} MB used of {mb(usage.limit_bytes)} MB</span>
            <span className="text-slate-400 font-mono">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className={`h-full ${bar}`} style={{ width: `${Math.max(pct, 1)}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};
