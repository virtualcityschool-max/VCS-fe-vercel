import React, { useCallback, useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { toastManager } from "../../utils/toastManager";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { PageHeader, SegmentedTabs, FilterBar, DataTable, StatusPill, Avatar } from "../../components/admin/ui";

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

const AdminSubscriptionsPage = () => {
  const [data, setData] = useState({
    active: [],
    expired: [],
    needs_gumroad_cancellation: [],
  });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
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

  const ending = (data.active || []).filter((r) => typeof r.days_remaining === "number" && r.days_remaining <= 7);
  const tabs = [
    { id: "active", label: "Active", count: data.active?.length || 0 },
    { id: "ending", label: "Ending within 7 days", count: ending.length },
    { id: "expired", label: "Expired", count: data.expired?.length || 0 },
    {
      id: "cancel",
      label: "Cancel on Gumroad",
      count: data.needs_gumroad_cancellation?.length || 0,
    },
  ];

  const tabRows =
    tab === "active"
      ? data.active
      : tab === "ending"
        ? ending
        : tab === "expired"
          ? data.expired
          : data.needs_gumroad_cancellation;
  const q = search.trim().toLowerCase();
  const rows = (tabRows || []).filter(
    (r) =>
      (source === "all" || r.enrollment_source === source) &&
      (!q || [r.student?.name, r.student?.email, r.course?.title].some((v) => (v || "").toLowerCase().includes(q))),
  );

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

  const columns = [
    {
      header: "Student",
      cell: (r) => (
        <div className="flex items-center gap-3 min-w-[170px]">
          <Avatar name={r.student?.name || ""} />
          <div className="min-w-0">
            <div className="font-semibold text-slate-100 truncate">{r.student?.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{r.student?.email}</div>
          </div>
        </div>
      ),
    },
    { header: "Subject", cell: (r) => <span className="text-slate-200 block max-w-[260px] truncate" title={r.course?.title}>{r.course?.title}</span> },
    { header: "Paid via", cell: (r) => <span className="text-slate-300 whitespace-nowrap">{SOURCE_LABELS[r.enrollment_source] || r.enrollment_source || "—"}</span> },
    {
      header: "Access until",
      cell: (r) => (
        <div className="whitespace-nowrap">
          <div className="text-slate-200 tabular-nums">{formatDate(r.access_expires_at)}</div>
          {typeof r.days_remaining === "number" && r.has_access && <div className={`text-[11px] ${r.days_remaining <= 7 ? "text-amber-300" : "text-slate-500"}`}>{r.days_remaining} days left</div>}
        </div>
      ),
    },
    { header: "Last payment", cell: (r) => <span className="text-slate-400 whitespace-nowrap tabular-nums">{formatDate(r.last_charge_at)}</span> },
    {
      header: "Status",
      cell: (r) => (
        <StatusPill status={tab === "cancel" ? "Cancel on Gumroad" : !r.has_access ? "Expired" : r.days_remaining <= 7 ? `Ends in ${Math.max(r.days_remaining, 0)}d` : "Active"} />
      ),
    },
  ];

  const actions = (r) =>
    tab === "cancel" ? (
      <div className="flex items-center gap-2">
        {r.gumroad_cancel_url && (
          <a href={r.gumroad_cancel_url} target="_blank" rel="noopener noreferrer" className="px-2.5 h-8 leading-8 rounded-lg border border-[#2A3766] text-slate-200 hover:bg-white/5 text-xs font-semibold whitespace-nowrap">
            Open on Gumroad ↗
          </a>
        )}
        <button type="button" onClick={() => setConfirm({ action: "cancelled", row: r })} disabled={busyId === r.enrollment_id} className="px-2.5 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold whitespace-nowrap disabled:opacity-50">
          Mark cancelled
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        {r.can_extend && (
          <button
            type="button"
            onClick={() => setConfirm({ action: "extend", row: r })}
            disabled={busyId === r.enrollment_id}
            title={r.has_access ? "Record next month's payment; it stacks on the current expiry." : "Record a month of manual payment and switch access back on."}
            className="px-2.5 h-8 rounded-lg bg-[#6D5BFF] hover:bg-[#5B47FB] text-white text-xs font-semibold whitespace-nowrap disabled:opacity-50"
          >
            {r.has_access ? "Add 1 month" : "Renew 1 month"}
          </button>
        )}
        {!r.can_extend && r.renewal_due_at && (
          <span className="text-slate-500 text-[11px] whitespace-nowrap" title={`Renew unlocks on ${formatDate(r.renewal_due_at)}, a week before expiry.`}>
            Paid until {formatDate(r.access_expires_at)}
          </span>
        )}
        {!r.can_extend && !r.renewal_due_at && !r.has_access && <span className="text-slate-500 text-[11px]">Awaiting renewal</span>}
        {r.has_access && (
          <button type="button" onClick={() => setConfirm({ action: "revoke", row: r })} disabled={busyId === r.enrollment_id} className="px-2.5 h-8 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold whitespace-nowrap disabled:opacity-50">
            End access
          </button>
        )}
      </div>
    );

  const monthlyActive = (data.active || []).length;
  const emptyText = { cancel: "Nothing to cancel on Gumroad ✓", expired: "No expired subscriptions", ending: "Nothing ends in the next 7 days ✓", active: "No active subscriptions" }[tab];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Subscriptions"
        subtitle={`${monthlyActive} paid subjects active · ${ending.length} ending within 7 days · ${data.expired?.length || 0} expired${data.needs_gumroad_cancellation?.length ? ` · ${data.needs_gumroad_cancellation.length} to cancel on Gumroad` : ""}`}
        onRefresh={load}
      />
      <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === "cancel" && (data.needs_gumroad_cancellation?.length || 0) > 0 && (
        <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
          Gumroad can't be cancelled from here. These students were unenrolled but Gumroad will keep charging them until you cancel the membership on Gumroad, then mark it cancelled here.
        </p>
      )}
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search student or subject…"
        filters={[{ id: "source", label: "Payment source", value: source, onChange: setSource, options: Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label })) }]}
      />
      {loading ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-[#121831] animate-pulse" />)}</div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="enrollment_id"
          rowActions={actions}
          empty={<p className="py-16 text-center text-sm text-slate-400 rounded-2xl border border-[#232D52] bg-[#121831]">{emptyText}</p>}
        />
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
