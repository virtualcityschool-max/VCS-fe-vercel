import React, { useCallback, useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { toastManager } from "../../utils/toastManager";
import ConfirmDialog from "../../components/common/ConfirmDialog";

/**
 * Monthly access for paid courses.
 *
 * The "Cancel on Gumroad" list is the important one: Gumroad's API cannot cancel
 * a membership, so a student who is unenrolled here keeps being billed until
 * someone cancels it on Gumroad by hand. This page is what stops that being
 * forgotten.
 *
 * Every action here moves money or cuts a student off mid-course, so all three
 * go through a confirm step and report back as a toast. Nothing on this page
 * fires straight off a click.
 */

const SOURCE_LABELS = {
  gumroad: "Gumroad",
  admin: "Admin",
  free_access: "Free access",
  free: "Free course",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const Pill = ({ tone, children }) => {
  const tones = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    slate: "bg-slate-700/40 text-slate-300 border-white/10",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${tones[tone] || tones.slate}`}
    >
      {children}
    </span>
  );
};

const AdminSubscriptionsPage = () => {
  const [data, setData] = useState({
    active: [],
    expired: [],
    needs_gumroad_cancellation: [],
  });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [tab, setTab] = useState("expired");
  // { action: "extend" | "revoke" | "cancelled", row }
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminService.getSubscriptions());
    } catch (err) {
      toastManager.error(
        err?.response?.data?.error || "Could not load subscriptions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Extending is silent by nature: the row stays put and only the expiry date
  // moves, so say out loud what the new date is or the click reads as a no-op.
  const runExtend = async (row) => {
    const wasLapsed = !row.has_access;
    const res = await adminService.extendSubscription(row.enrollment_id);
    const until = formatDate(res?.access_expires_at);
    toastManager.success(
      wasLapsed
        ? `Access restored for ${row.student?.name}. Now runs until ${until}.`
        : `Another month recorded for ${row.student?.name}. Now runs until ${until}.`
    );
    if (wasLapsed) setTab("active");
  };

  // Ends access on our side. Gumroad billing is untouched, so surface the
  // warning the API sends back when a membership is still live.
  const runRevoke = async (row) => {
    const res = await adminService.revokeSubscription(row.enrollment_id);
    if (res?.gumroad_cancel_required) {
      toastManager.warning(
        res.warning ||
          "Access is blocked, but their Gumroad membership is still charging them.",
        { duration: 12000 }
      );
      setTab("cancel");
    } else {
      toastManager.success(
        `Access ended for ${row.student?.name} on "${row.course?.title}".`
      );
    }
  };

  const runMarkCancelled = async (row) => {
    await adminService.markGumroadCancelled(row.enrollment_id);
    toastManager.success(
      `Marked cancelled. ${row.student?.name} will not be billed again.`
    );
  };

  const RUNNERS = {
    extend: runExtend,
    revoke: runRevoke,
    cancelled: runMarkCancelled,
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    const { action, row } = confirm;
    setBusyId(row.enrollment_id);
    try {
      await RUNNERS[action](row);
      setConfirm(null);
      await load();
    } catch (err) {
      toastManager.error(
        err?.response?.data?.error || "Something went wrong. Nothing was changed."
      );
      setConfirm(null);
    } finally {
      setBusyId(null);
    }
  };

  const tabs = [
    { id: "expired", label: "Expired", count: data.expired?.length || 0 },
    { id: "active", label: "Active", count: data.active?.length || 0 },
    {
      id: "cancel",
      label: "Cancel on Gumroad",
      count: data.needs_gumroad_cancellation?.length || 0,
    },
  ];

  const rows =
    tab === "active"
      ? data.active
      : tab === "expired"
        ? data.expired
        : data.needs_gumroad_cancellation;

  // Copy for the confirm step, per action. Each one spells out the consequence
  // that is easy to forget: months stack, grades survive, Gumroad keeps billing.
  const confirmProps = () => {
    if (!confirm) return {};
    const { action, row } = confirm;
    const student = row.student?.name || "this student";
    const course = row.course?.title || "this course";

    if (action === "extend") {
      const lapsed = !row.has_access;
      const takeover = lapsed && row.enrollment_source === "gumroad";
      return {
        variant: lapsed ? "success" : "primary",
        title: takeover
          ? "Take over this subscription?"
          : lapsed
            ? "Restore access?"
            : "Record another month?",
        message: takeover
          ? `${student} paid through Gumroad and that membership has lapsed. Giving them a month here moves them onto manual billing, so from now on you collect the payment and renew them from this page. If their Gumroad payment recovers later it goes back to being automatic.`
          : lapsed
            ? `Switch ${student} back on for "${course}"? They get a full month starting today, and their sessions and quizzes unlock straight away.`
            : `Add a month to ${student} on "${course}"? It stacks on top of ${formatDate(row.access_expires_at)}, so no paid days are lost. Only do this once you have their payment.`,
        confirmLabel: takeover
          ? "Take over"
          : lapsed
            ? "Restore access"
            : "Add 1 month",
      };
    }

    if (action === "revoke") {
      return {
        variant: "danger",
        title: "End access now?",
        message: `${student} loses "${course}" immediately. Sessions, quizzes and assignments lock, but they stay enrolled and keep their grades and history. Gumroad billing is not touched by this.`,
        confirmLabel: "End access",
      };
    }

    return {
      variant: "success",
      title: "Cancelled on Gumroad?",
      message: `Only confirm once you have actually cancelled ${student}'s membership on Gumroad. This just records that it is done, it does not cancel anything itself.`,
      confirmLabel: "Yes, it is cancelled",
    };
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-white/5">
        <div className="flex items-center gap-4">          
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
                tab === t.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {t.label}
              </span>
              {t.count > 0 && (
                <span
                  className={`flex items-center justify-center min-w-[18px] h-4 px-1 rounded-md text-[9px] font-black ${
                    tab === t.id
                      ? "bg-white/20 text-white"
                      : t.id === "cancel"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stays a banner on purpose: this explains what the tab is for, it is not
          the result of an action, so it must not disappear on a timer. */}
      {tab === "cancel" && (data.needs_gumroad_cancellation?.length || 0) > 0 && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <i className="fas fa-triangle-exclamation text-rose-400 mt-0.5" />
          <p className="text-xs text-rose-200/80 leading-relaxed">
            These students are no longer entitled to access but if their Gumroad
            membership is open please open it on Gumroad, cancel it there,
            then mark it done here.
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-500">
          <i className="fas fa-spinner animate-spin text-2xl mb-3" />
          <p className="text-sm">Loading subscriptions...</p>
        </div>
      ) : rows?.length ? (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/40">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Access until</th>
                <th className="px-4 py-3">Last charge</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.enrollment_id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-white font-semibold">{r.student?.name}</p>
                    <p className="text-slate-500 text-xs">{r.student?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{r.course?.title}</td>
                  <td className="px-4 py-3">
                    <Pill tone={r.enrollment_source === "gumroad" ? "green" : "slate"}>
                      {SOURCE_LABELS[r.enrollment_source] || r.enrollment_source}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-300">
                      {formatDate(r.access_expires_at)}
                    </span>
                    {r.access_state === "expired" ? (
                      <span className="ml-2">
                        <Pill tone="amber">Ended</Pill>
                      </span>
                    ) : typeof r.days_remaining === "number" &&
                      r.days_remaining <= 7 ? (
                      <span className="ml-2">
                        <Pill tone="amber">{r.days_remaining}d left</Pill>
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {formatDate(r.last_charge_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tab === "cancel" ? (
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={r.gumroad_cancel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition"
                        >
                          Open in Gumroad
                        </a>
                        <button
                          onClick={() => setConfirm({ action: "cancelled", row: r })}
                          disabled={busyId === r.enrollment_id}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                        >
                          Mark cancelled
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {r.can_extend && (
                          <button
                            onClick={() => setConfirm({ action: "extend", row: r })}
                            disabled={busyId === r.enrollment_id}
                            title={
                              r.has_access
                                ? "This month is nearly up and nothing renews it automatically. Recording the next month adds it on top of the current expiry, so no days are lost."
                                : "Record a month of manual payment and switch their access back on."
                            }
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
                          >
                            {r.has_access ? "Add 1 month" : "Renew 1 month"}
                          </button>
                        )}
                        {/* Shows the date their month actually ends, not the date
                            the button unlocks. Those are a week apart, and showing
                            the unlock date here read as an early expiry. */}
                        {!r.can_extend && r.renewal_due_at && (
                          <span
                            className="text-slate-600 text-xs"
                            title={`Their month runs to ${formatDate(r.access_expires_at)}. The renew button unlocks on ${formatDate(r.renewal_due_at)}, a week before that.`}
                          >
                            Paid until {formatDate(r.access_expires_at)}
                          </span>
                        )}
                        {!r.can_extend && !r.renewal_due_at && !r.has_access && (
                          <span className="text-slate-600 text-xs">Awaiting renewal</span>
                        )}
                        {r.has_access && (
                          <button
                            onClick={() => setConfirm({ action: "revoke", row: r })}
                            disabled={busyId === r.enrollment_id}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-800 border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition disabled:opacity-50"
                          >
                            End access
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-[2rem] border border-white/5 border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 text-slate-600">
            <i className="fas fa-check text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-400">
            {tab === "cancel"
              ? "Nothing to cancel"
              : tab === "expired"
                ? "No expired subscriptions"
                : "No active subscriptions"}
          </h3>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        loading={busyId !== null}
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
        {...confirmProps()}
      />
    </section>
  );
};

export default AdminSubscriptionsPage;
