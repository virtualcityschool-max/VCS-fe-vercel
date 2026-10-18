import React, { useState, useEffect } from 'react';
import { X, Gift, RotateCcw, Calendar, CalendarRange, Infinity as InfinityIcon, ShieldCheck, Check } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export interface GrantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string | number;
  studentName?: string;
  studentRollNo?: string;
  subjectName?: string;
  subjectCode?: string;
  currentAccessUntil?: string;
  currentStatus?: string;
  initialMode?: 'renew' | 'free';
  onSuccess?: (message?: string) => void;
  onError?: (err: any) => void;
}

export type AccessDuration = '1_month' | '3_months' | 'unlimited';

export const GrantAccessModal: React.FC<GrantAccessModalProps> = ({
  isOpen,
  onClose,
  enrollmentId,
  studentName = 'Student',
  studentRollNo,
  subjectName = 'Course',
  subjectCode,
  currentAccessUntil,
  currentStatus,
  initialMode = 'renew',
  onSuccess,
  onError,
}) => {
  const [mode, setMode] = useState<'renew' | 'free'>(initialMode);
  const [duration, setDuration] = useState<AccessDuration>('1_month');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setDuration(initialMode === 'free' ? 'unlimited' : '1_month');
      setErrorMessage(null);
      setLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentId) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const isFree = mode === 'free';
      const res = await adminService.extendSubscription(Number(enrollmentId), duration, isFree);
      onSuccess?.(res?.message || (isFree ? 'Access successfully granted!' : 'Subscription successfully renewed!'));
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Failed to update access.';
      setErrorMessage(msg);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const DURATION_OPTIONS = mode === 'free'
    ? [
        {
          id: 'unlimited' as AccessDuration,
          title: 'Unlimited / Lifetime Access',
          subtitle: 'Permanent unlimited access with no expiration date or recurring fee',
          badge: 'Lifetime',
          icon: InfinityIcon,
          recommended: true,
        },
        {
          id: '1_month' as AccessDuration,
          title: '1 Month Access',
          subtitle: 'Direct complimentary course access for 1 full month',
          badge: '1 Month',
          icon: Calendar,
          recommended: false,
        },
        {
          id: '3_months' as AccessDuration,
          title: '3 Months Access',
          subtitle: 'Direct complimentary course access for 3 full months',
          badge: '3 Months',
          icon: CalendarRange,
          recommended: false,
        },
      ]
    : [
        {
          id: '1_month' as AccessDuration,
          title: '1 Month Renewal',
          subtitle: 'Extend subscription for 1 month from expiry or today',
          badge: '1 Month',
          icon: Calendar,
          recommended: true,
        },
        {
          id: '3_months' as AccessDuration,
          title: '3 Months Renewal',
          subtitle: 'Extend subscription for 3 full months (Quarterly term)',
          badge: '3 Months',
          icon: CalendarRange,
          recommended: false,
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1E2648]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                mode === 'free'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
              }`}
            >
              {mode === 'free' ? <Gift className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {mode === 'free' ? 'Grant Access' : 'Renew Subscription Access'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'free'
                  ? 'Allocate student course access (1 month, 3 months, or unlimited) directly'
                  : 'Record a paid subscription renewal collected by school administration'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-4 p-1 bg-[#0E1428] border border-[#1E2648] rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('renew');
              if (duration === 'unlimited') setDuration('1_month');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'renew'
                ? 'bg-[#6D5BFF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Standard Renewal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('free');
              if (duration === '1_month') setDuration('unlimited');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'free'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Grant Access</span>
          </button>
        </div>

        {/* Target Enrollment Summary Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#0E1428]/80 border border-[#1E2648] text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Student:</span>
            <span className="font-semibold text-white">
              {studentName} {studentRollNo ? <span className="font-mono text-slate-400">({studentRollNo})</span> : null}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Subject Seat:</span>
            <span className="font-semibold text-indigo-300">
              {subjectName} {subjectCode ? <span className="font-mono text-indigo-400">({subjectCode})</span> : null}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/5">
            <span className="text-slate-400">Current Access:</span>
            <span className={`font-mono font-semibold ${String(currentAccessUntil || '').toLowerCase().includes('unlimited') ? 'text-emerald-400' : 'text-amber-300'}`}>
              {currentAccessUntil || currentStatus || 'Expired / Inactive'}
            </span>
          </div>
        </div>

        {/* Duration Selection Cards */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
              Select Access Duration
            </label>
            <div className="space-y-2">
              {DURATION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = duration === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setDuration(opt.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? mode === 'free'
                          ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-sm'
                          : 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-sm'
                        : 'bg-[#0E1428]/60 hover:bg-[#0E1428] border-[#1E2648] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? mode === 'free'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white leading-none">{opt.title}</span>
                          {opt.recommended && (
                            <span className="px-1.5 py-0.2 rounded text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Recommended
                            </span>
                          )}
                          {opt.id === 'unlimited' && mode === 'free' && (
                            <span className="px-1.5 py-0.2 rounded text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Lifetime Free
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">{opt.subtitle}</p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? mode === 'free'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mode Context Notice */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              mode === 'free'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {mode === 'free' ? (
                <>
                  <span className="font-bold">Grant Access:</span> Directly allocates access to the student without recurring gateway charges or fee requirements.
                </>
              ) : (
                <>
                  <span className="font-bold">Standard Renewal:</span> Records manual tuition fee collected by school administration and extends the student's active seat.
                </>
              )}
            </div>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#1E2648]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                mode === 'free'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-[#6D5BFF] hover:bg-[#5B47FB] shadow-indigo-950/40'
              }`}
            >
              {loading ? (
                <span>Updating Access...</span>
              ) : (
                <>
                  {mode === 'free' ? <Gift className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>
                    {mode === 'free'
                      ? duration === 'unlimited'
                        ? 'Grant Unlimited Access'
                        : `Grant Access (${duration === '3_months' ? '3 Months' : '1 Month'})`
                      : `Confirm ${duration === '3_months' ? '3 Months' : '1 Month'} Renewal`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
