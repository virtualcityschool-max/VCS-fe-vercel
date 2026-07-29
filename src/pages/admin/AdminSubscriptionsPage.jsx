import React, { useCallback, useEffect, useState } from "react";
import { adminService } from "../../services/adminService";

/**
 * Monthly access for paid courses.
 *
 * The "Cancel on Gumroad" list is the important one: Gumroad's API cannot cancel
 * a membership, so a student who is unenrolled here keeps being billed until
 * someone cancels it on Gumroad by hand. This page is what stops that being
 * forgotten.
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
    : "—";

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
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [tab, setTab] = useState("expired");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await adminService.getSubscriptions());
    } catch (err) {
      setError(err?.response?.data?.error || "Could not load subscriptions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExtend = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await adminService.extendSubscription(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not extend access.");
    } finally {
      setBusyId(null);
    }
  };

  // Ends access on our side. Gumroad billing is untouched, so surface the
  // warning the API sends back when a membership is still live.
  const handleRevoke = async (row) => {
    const name = row.student?.name || "this student";
    if (
      !window.confirm(
        `End access to "${row.course?.title}" for ${name} now?\n\n` +
          "They stay enrolled and keep their grades and history, but sessions, " +
          "quizzes and assignments lock immediately."
      )
    )
      return;
    setBusyId(row.enrollment_id);
    setError("");
    setNotice("");
    try {
      const res = await adminService.revokeSubscription(row.enrollment_id);
      if (res?.gumroad_cancel_required) {
        setNotice(res.warning || "");
        setTab("cancel");
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not end access.");
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkCancelled = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await adminService.markGumroadCancelled(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not update.");
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <div>
            <h2 className="text-2xl font-black font-poppins text-white uppercase tracking-tight">
              Subscriptions
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Monthly access for paid courses
            </p>
          </div>
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

      {tab === "cancel" && (data.needs_gumroad_cancellation?.length || 0) > 0 && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <i className="fas fa-triangle-exclamation text-rose-400 mt-0.5" />
          <p className="text-xs text-rose-200/80 leading-relaxed">
            These students are no longer entitled to access but their Gumroad
            membership may still be charging them every month. Gumroad has no API
            to cancel a membership, so open each one on Gumroad, cancel it there,
            then mark it done here.
          </p>
        </div>
      )}

      {notice && (
        <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          {notice}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
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
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
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
                          onClick={() => handleMarkCancelled(r.enrollment_id)}
                          disabled={busyId === r.enrollment_id}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                        >
                          {busyId === r.enrollment_id ? "..." : "Mark cancelled"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {r.enrollment_source === "admin" && (
                          <button
                            onClick={() => handleExtend(r.enrollment_id)}
                            disabled={busyId === r.enrollment_id}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
                          >
                            {busyId === r.enrollment_id ? "..." : "Add 1 month"}
                          </button>
                        )}
                        {r.has_access && (
                          <button
                            onClick={() => handleRevoke(r)}
                            disabled={busyId === r.enrollment_id}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-800 border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition disabled:opacity-50"
                          >
                            {busyId === r.enrollment_id ? "..." : "End access"}
                          </button>
                        )}
                        {!r.has_access && r.enrollment_source !== "admin" && (
                          <span className="text-slate-600 text-xs">Awaiting renewal</span>
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
    </section>
  );
};

export default AdminSubscriptionsPage;
