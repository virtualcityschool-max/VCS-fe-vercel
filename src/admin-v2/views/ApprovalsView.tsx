import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { Field, SelectInput, inputCls } from '../components/common/FormControls';
import {
  Check,
  X,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  PauseCircle,
  HelpCircle,
  Eye,
  RotateCcw,
  History,
} from 'lucide-react';

type Stage = 'new' | 'under_review' | 'info_requested' | 'on_hold';

const STAGES: { id: Stage; label: string; pill: string }[] = [
  { id: 'new', label: 'New', pill: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  { id: 'under_review', label: 'Under review', pill: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  { id: 'info_requested', label: 'Waiting for applicant', pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { id: 'on_hold', label: 'On hold', pill: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
];
const stageInfo = (s: string) => STAGES.find((x) => x.id === s) || STAGES[0];

const REJECT_REASONS = [
  'Incomplete or unclear information',
  'Not eligible for this programme',
  'Duplicate account or request',
  'Could not verify identity',
  'Subject or class not available',
  'Not a Google / Gmail email',
  'Scholarship places are full',
  'Other',
];

const TYPE_TABS = [
  { id: 'all', label: 'All types' },
  { id: 'account_signup', label: 'Sign-ups' },
  { id: 'enrollment_request', label: 'Enrolments & scholarships' },
  { id: 'parent_link', label: 'Parent links' },
];

// Waiting-time badge: amber from 3 days, red from 7 (a common admissions response target).
const ageBadge = (days: number) =>
  days >= 7
    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    : days >= 3
    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    : 'bg-slate-700/30 text-slate-400 border-slate-600/40';


export const ApprovalsView: React.FC = () => {
  const { approvals, approveItem, rejectItem, setReviewStage, decisions = [], tzIana, rejectedAccounts = [], reconsiderAccount, purgeAccount } = useApp() as any;
  // Times in the admin's own timezone, like the rest of the dashboard.
  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', ...(tzIana ? { timeZone: tzIana } : {}) }) : '';

  const [stageFilter, setStageFilter] = useState<'open' | Stage | 'decided' | 'rejected_accounts'>('open');
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // Dialogs
  const [rejecting, setRejecting] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [staging, setStaging] = useState<{ item: any; stage: Stage } | null>(null);
  const [stageNote, setStageNote] = useState('');
  const [busy, setBusy] = useState(false);

  const open = approvals.filter((a: any) => a.status === 'pending');
  const weekAgo = Date.now() - 7 * 86400000;
  const approved7 = decisions.filter((d: any) => d.status === 'approved' && new Date(d.updated_at).getTime() >= weekAgo).length;
  const rejected7 = decisions.filter((d: any) => d.status === 'rejected' && new Date(d.updated_at).getTime() >= weekAgo).length;
  const inProgress = open.filter((a: any) => a.stage !== 'new').length;
  const oldest = open.reduce((m: number, a: any) => Math.max(m, a.waitingDays || 0), 0);

  const matchesQuery = (txt: string) => txt.toLowerCase().includes(query.trim().toLowerCase());

  const list = useMemo(
    () =>
      open
        .filter((a: any) => stageFilter === 'open' || a.stage === stageFilter)
        .filter((a: any) => typeFilter === 'all' || a.type === typeFilter)
        .filter((a: any) => !query.trim() || matchesQuery(`${a.requesterName} ${a.requesterEmail} ${a.targetEntityName}`))
        .sort((a: any, b: any) => (b.waitingDays || 0) - (a.waitingDays || 0)),
    [open, stageFilter, typeFilter, query]
  );

  const decidedList = decisions.filter(
    (d: any) => !query.trim() || matchesQuery(`${d.summary?.name || ''} ${d.summary?.email || ''} ${d.summary?.target || ''}`)
  );

  const countFor = (s: Stage) => open.filter((a: any) => a.stage === s).length;

  const submitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejecting || !rejectReason) return;
    setBusy(true);
    const ok = await rejectItem(rejecting.id, rejectReason, rejectNote.trim());
    setBusy(false);
    if (ok) {
      setRejecting(null);
      setRejectReason('');
      setRejectNote('');
    }
  };

  const submitStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staging) return;
    setBusy(true);
    const ok = await setReviewStage(staging.item.id, staging.stage, stageNote.trim());
    setBusy(false);
    if (ok) {
      setStaging(null);
      setStageNote('');
    }
  };

  const mailto = (item: any, body = '') =>
    `mailto:${item.requesterEmail}?subject=${encodeURIComponent(`Your ${item.title} — Virtual City School`)}&body=${encodeURIComponent(
      `Dear ${item.requesterName},\n\n${body || 'Thank you for your request.'}\n\nKind regards,\nVirtual City School Admissions`
    )}`;

  const chip = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
      active ? 'bg-[#6D5BFF] text-white' : 'text-slate-400 hover:text-white hover:bg-[#1A2346]'
    }`;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Approvals Inbox"
        subtitle="Review sign-ups, enrolment and scholarship requests and parent links. Move each one through review before deciding."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Open requests', value: open.length, color: 'text-amber-400', icon: Inbox, tint: 'bg-amber-500/10 text-amber-400' },
          { label: 'In progress', value: inProgress, color: 'text-indigo-300', icon: Eye, tint: 'bg-indigo-500/10 text-indigo-300', sub: 'under review, waiting or on hold' },
          { label: 'Oldest waiting', value: `${oldest}d`, color: oldest >= 7 ? 'text-rose-400' : oldest >= 3 ? 'text-amber-400' : 'text-slate-100', icon: Clock, tint: 'bg-slate-500/10 text-slate-300', sub: 'aim: decide within 3 days' },
          { label: 'Approved · 7 days', value: approved7, color: 'text-emerald-400', icon: CheckCircle2, tint: 'bg-emerald-500/10 text-emerald-400' },
          { label: 'Rejected · 7 days', value: rejected7, color: 'text-rose-400', icon: XCircle, tint: 'bg-rose-500/10 text-rose-400' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="p-4 rounded-xl border border-[#232D52] bg-[#121831] flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400">{k.label}</div>
                <div className={`text-xl font-bold font-mono mt-1 ${k.color}`}>{k.value}</div>
                {k.sub && <div className="text-[10px] text-slate-500 mt-0.5">{k.sub}</div>}
              </div>
              <div className={`p-2 rounded-xl ${k.tint}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#121831] border border-[#232D52] rounded-xl w-fit max-w-full overflow-x-auto">
          <button onClick={() => setStageFilter('open')} className={chip(stageFilter === 'open')}>
            All open <span className="font-mono opacity-80">{open.length}</span>
          </button>
          {STAGES.map((s) => (
            <button key={s.id} onClick={() => setStageFilter(s.id)} className={chip(stageFilter === s.id)}>
              {s.label} <span className="font-mono opacity-80">{countFor(s.id)}</span>
            </button>
          ))}
          <button onClick={() => setStageFilter('decided')} className={chip(stageFilter === 'decided')}>
            <History className="w-3.5 h-3.5" /> Decided
          </button>
          <button onClick={() => setStageFilter('rejected_accounts')} className={chip(stageFilter === 'rejected_accounts')}>
            Rejected accounts <span className="font-mono opacity-80">{rejectedAccounts.length}</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or subject…" className={`${inputCls} pl-9`} />
          </div>
          {stageFilter !== 'decided' && stageFilter !== 'rejected_accounts' && (
            <div className="sm:w-64">
              <SelectInput value={typeFilter} onChange={setTypeFilter} options={TYPE_TABS.map((t) => ({ value: t.id, label: t.label }))} />
            </div>
          )}
        </div>
      </div>

      {/* Rejected sign-ups still on file */}
      {stageFilter === 'rejected_accounts' ? (
        rejectedAccounts.length === 0 ? (
          <EmptyState icon={XCircle} title="No rejected accounts" description="Rejected sign-ups stay here until you approve them after all or delete them." />
        ) : (
          <div className="rounded-2xl border border-[#232D52] bg-[#121831] divide-y divide-[#1E2648]/60">
            {rejectedAccounts
              .filter((u: any) => !query.trim() || matchesQuery(`${u.first_name || ''} ${u.last_name || ''} ${u.username || ''} ${u.email}`))
              .map((u: any) => (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-100">{[u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || u.email}</div>
                    <div className="text-slate-500">{u.email} · {u.role} · signed up {fmtDate(u.date_joined)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => purgeAccount(u)} className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 font-semibold hover:bg-rose-500/10">
                      Delete permanently
                    </button>
                    <button onClick={() => reconsiderAccount(u)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                      Approve after all
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )
      ) : stageFilter === 'decided' ? (
        decidedList.length === 0 ? (
          <EmptyState icon={History} title="No decisions recorded yet" description="Approvals and rejections made from this inbox appear here with the reason and who decided." />
        ) : (
          <div className="rounded-2xl border border-[#232D52] bg-[#121831] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E2648] bg-[#0E1428] text-slate-400">
                  <th className="py-3 px-4 font-semibold">When</th>
                  <th className="py-3 px-4 font-semibold">Applicant</th>
                  <th className="py-3 px-4 font-semibold">Request</th>
                  <th className="py-3 px-4 font-semibold">Decision</th>
                  <th className="py-3 px-4 font-semibold">Reason / note</th>
                  <th className="py-3 px-4 font-semibold">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2648]/60">
                {decidedList.map((d: any) => (
                  <tr key={d.key} className="hover:bg-[#1A2346]/40">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{fmtDate(d.updated_at)}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{d.summary?.name || '—'}</div>
                      <div className="text-[11px] text-slate-500">{d.summary?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{d.summary?.title}</div>
                      <div className="text-[11px] text-slate-500 max-w-xs truncate">{d.summary?.target}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${d.status === 'approved' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'}`}>
                        {d.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm">
                      {d.reason && <div className="font-medium">{d.reason}</div>}
                      {d.note && <div className="text-[11px] text-slate-500">{d.note}</div>}
                      {!d.reason && !d.note && <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{d.reviewer || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : list.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing here" description={open.length ? 'No requests match these filters.' : 'All requests are dealt with. New sign-ups and requests will appear here.'} />
      ) : (
        <div className="space-y-3">
          {list.map((item: any) => {
            const st = stageInfo(item.stage);
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} className="rounded-2xl border border-[#232D52] bg-[#121831] hover:border-slate-600 transition-colors">
                <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#1A2346] border border-[#232D52] flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
                      {(item.requesterName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">{item.requesterName}</span>
                        <span className="text-[11px] text-slate-500">{item.requesterEmail}</span>
                        <span className="px-2 py-0.5 rounded bg-[#0E1428] border border-[#232D52] text-[10px] font-mono text-slate-300">{item.title}</span>
                      </div>
                      <div className="text-xs text-indigo-300 truncate">{item.targetEntityName}</div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${st.pill}`}>{st.label}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${ageBadge(item.waitingDays)}`}>
                          {item.waitingDays === 0 ? 'Today' : `Waiting ${item.waitingDays} day${item.waitingDays > 1 ? 's' : ''}`}
                        </span>
                        {item.review?.reviewer && item.stage !== 'new' && (
                          <span className="text-[10px] text-slate-500">by {item.review.reviewer} · {fmtDate(item.review.updated_at)}</span>
                        )}
                      </div>
                      {item.review?.note && item.stage !== 'new' && (
                        <div className="text-[11px] text-slate-400 italic">“{item.review.note}”</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-[#1A2346]"
                    >
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} Details
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setMenuFor(menuFor === item.id ? null : item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#232D52] bg-[#0E1428] text-xs font-semibold text-slate-200 hover:border-[#6D5BFF]"
                      >
                        Status <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {menuFor === item.id && (
                        // Click anywhere outside the menu to close it.
                        <div className="fixed inset-0 z-20" onClick={() => setMenuFor(null)} />
                      )}
                      {menuFor === item.id && (
                        <div className="absolute right-0 mt-1 w-56 rounded-xl border border-[#232D52] bg-[#121831] p-1.5 shadow-2xl z-30 text-xs">
                          {item.stage !== 'under_review' && (
                            <button
                              onClick={async () => { setMenuFor(null); await setReviewStage(item.id, 'under_review', ''); }}
                              className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left text-slate-300 hover:bg-[#1A2346] hover:text-white"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-300" /> Mark under review (me)
                            </button>
                          )}
                          <button
                            onClick={() => { setMenuFor(null); setStaging({ item, stage: 'info_requested' }); setStageNote(''); }}
                            className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left text-slate-300 hover:bg-[#1A2346] hover:text-white"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-amber-300" /> Ask for more information
                          </button>
                          <button
                            onClick={() => { setMenuFor(null); setStaging({ item, stage: 'on_hold' }); setStageNote(''); }}
                            className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left text-slate-300 hover:bg-[#1A2346] hover:text-white"
                          >
                            <PauseCircle className="w-3.5 h-3.5 text-slate-300" /> Put on hold / waitlist
                          </button>
                          {item.stage !== 'new' && (
                            <button
                              onClick={async () => { setMenuFor(null); await setReviewStage(item.id, 'new', ''); }}
                              className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left text-slate-300 hover:bg-[#1A2346] hover:text-white"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-sky-300" /> Move back to New
                            </button>
                          )}
                          {item.requesterEmail && (
                            <a
                              href={mailto(item)}
                              onClick={() => setMenuFor(null)}
                              className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left text-slate-300 hover:bg-[#1A2346] hover:text-white"
                            >
                              <Mail className="w-3.5 h-3.5 text-emerald-300" /> Email applicant
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => { setRejecting(item); setRejectReason(''); setRejectNote(''); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => approveItem(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-[#1E2648] px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                    <div className="lg:col-span-2 space-y-2.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#A99DFF]">Full request</div>
                      {!item.id.startsWith('free-') && <div className="text-slate-400">{item.details}</div>}
                      {(item.facts || []).map((f: any) => (
                        <div key={f.label} className="grid grid-cols-[120px_1fr] gap-3">
                          <span className="text-slate-500">{f.label}</span>
                          <span className="text-slate-200 whitespace-pre-wrap break-words">{f.value}</span>
                        </div>
                      ))}
                      <div className="grid grid-cols-[120px_1fr] gap-3">
                        <span className="text-slate-500">Requested</span>
                        <span className="text-slate-200">{fmtDate(item.requestedIso)}</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#A99DFF]">History</div>
                      {(item.review?.history || []).length === 0 ? (
                        <p className="text-slate-500">No steps yet.</p>
                      ) : (
                        <ol className="space-y-2 border-l border-[#232D52] pl-3">
                          {[...item.review.history].reverse().map((h: any, i: number) => (
                            <li key={i}>
                              <div className="text-slate-200">{stageInfo(h.status).label}{h.reason ? ` — ${h.reason}` : ''}</div>
                              <div className="text-[10px] text-slate-500">{h.by} · {fmtDate(h.at)}</div>
                              {h.note && <div className="text-[11px] text-slate-400 italic">“{h.note}”</div>}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject dialog */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={submitReject} className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100 text-xs">
            <div>
              <h3 className="text-base font-bold">Reject {rejecting.requesterName}?</h3>
              <p className="text-slate-400 mt-1">{rejecting.title}: {rejecting.targetEntityName}</p>
            </div>
            <Field label="Reason" required>
              <SelectInput required value={rejectReason} onChange={setRejectReason} placeholder="Choose a reason" options={REJECT_REASONS} />
            </Field>
            <Field
              label="Message (optional)"
              hint={rejecting.type === 'account_signup' || rejecting.id.startsWith('free-') ? 'The reason and this message are included in the email to the applicant.' : 'Kept in the history only; this request type sends no email.'}
            >
              <textarea rows={3} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="e.g. Please re-apply with your school letter." className={inputCls} />
            </Field>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#1E2648]">
              <button type="button" onClick={() => setRejecting(null)} className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white">
                Cancel
              </button>
              <button type="submit" disabled={busy || !rejectReason} className="px-4 py-2 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50">
                {busy ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stage dialog: ask for info / on hold */}
      {staging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={submitStage} className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100 text-xs">
            <div>
              <h3 className="text-base font-bold">
                {staging.stage === 'info_requested' ? 'Ask for more information' : 'Put on hold / waitlist'}
              </h3>
              <p className="text-slate-400 mt-1">{staging.item.requesterName} · {staging.item.targetEntityName}</p>
            </div>
            <Field
              label={staging.stage === 'info_requested' ? 'What do you need from them?' : 'Why is it on hold?'}
              required
              hint="Saved in the history so other admins can see it."
            >
              <textarea
                rows={3}
                required
                autoFocus
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder={staging.stage === 'info_requested' ? 'e.g. Please send a copy of your school ID.' : 'e.g. Waiting for a teacher for this subject.'}
                className={inputCls}
              />
            </Field>
            {staging.stage === 'info_requested' && staging.item.requesterEmail && (
              <a
                href={mailto(staging.item, stageNote || 'To continue with your request we need a little more information.')}
                className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200"
              >
                <Mail className="w-3.5 h-3.5" /> Open an email to the applicant with this message
              </a>
            )}
            <div className="flex justify-end gap-3 pt-3 border-t border-[#1E2648]">
              <button type="button" onClick={() => setStaging(null)} className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white">
                Cancel
              </button>
              <button type="submit" disabled={busy || !stageNote.trim()} className="px-4 py-2 rounded-xl font-semibold bg-[#6D5BFF] hover:bg-[#5B47FB] text-white disabled:opacity-50">
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
