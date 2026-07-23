import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReferralStats,
  fetchReferralDetail,
  clearReferralDetail,
  selectReferralStats,
  selectReferralStatsLoading,
  selectReferralDetail,
  selectReferralDetailLoading,
} from "../../store/slices/referralSlice";
import { SearchInput, FilterSelect } from "../../components/ui";

const ORDERINGS = [
  { value: "-total_signups", label: "Most signups" },
  { value: "-total_enrolled", label: "Most enrolled" },
  { value: "-created_at", label: "Newest code" },
];

const roleBadge = (role) => {
  const map = {
    teacher: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    student: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };
  return map[role] || "bg-slate-600/20 text-slate-300 border-slate-500/30";
};

const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

const AdminReferralsPage = () => {
  const dispatch = useDispatch();
  const rows = useSelector(selectReferralStats);
  const loading = useSelector(selectReferralStatsLoading);
  const detail = useSelector(selectReferralDetail);
  const detailLoading = useSelector(selectReferralDetailLoading);

  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-total_signups");
  const [detailUser, setDetailUser] = useState(null); // { user_id, user_name }
  const [detailTab, setDetailTab] = useState("student"); // student | teacher

  // Debounce the search so we don't fire a request per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const params = { ordering };
    if (debouncedSearch) params.search = debouncedSearch;
    dispatch(fetchReferralStats(params));
  }, [dispatch, ordering, debouncedSearch]);

  const openDetail = (row) => {
    setDetailUser({ user_id: row.user_id, user_name: row.user_name });
    setDetailTab("student");
    dispatch(fetchReferralDetail({ userId: row.user_id }));
  };
  const closeDetail = () => {
    setDetailUser(null);
    dispatch(clearReferralDetail());
  };

  const totals = useMemo(() => {
    const signups = rows.reduce((s, r) => s + (r.total_signups || 0), 0);
    const enrolled = rows.reduce((s, r) => s + (r.total_enrolled || 0), 0);
    return { signups, enrolled };
  }, [rows]);

  // Split the referred users into the two tabs.
  const students = useMemo(
    () => detail.filter((u) => u.referred_user_role === "student"),
    [detail],
  );
  const teachers = useMemo(
    () => detail.filter((u) => u.referred_user_role === "teacher"),
    [detail],
  );

  return (
    <div className="space-y-6">
      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Referring users", value: rows.length, icon: "fa-users", chip: "bg-indigo-500/15 text-indigo-400" },
          { label: "Total signups", value: totals.signups, icon: "fa-user-plus", chip: "bg-blue-500/15 text-blue-400" },
          { label: "Enrolled", value: totals.enrolled, icon: "fa-graduation-cap", chip: "bg-emerald-500/15 text-emerald-400" },
        ].map((t) => (
          <div
            key={t.label}
            className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md p-5 flex items-center gap-4"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.chip}`}>
              <i className={`fas ${t.icon}`} />
            </span>
            <div>
              <p className="text-2xl font-black text-white leading-none">{t.value}</p>
              <p className="text-xs text-slate-400 mt-1">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Search by name, email or code…"
          className="w-full sm:max-w-sm"
        />
        <div className="sm:ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort</span>
          <FilterSelect value={ordering} onChange={(e) => setOrdering(e.target.value)} className="min-w-[160px]">
            {ORDERINGS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </FilterSelect>
        </div>
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Referral code</th>
                <th className="px-5 py-3 font-semibold text-center">Signups</th>
                <th className="px-5 py-3 font-semibold text-center">Enrolled</th>
                <th className="px-5 py-3 font-semibold text-center">Conversion</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 font-semibold text-right">Referred users</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-6 bg-slate-800/60 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                    <i className="fas fa-share-nodes text-2xl mb-3 block opacity-40" />
                    No referral data found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.user_id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-white">{r.user_name}</div>
                      <div className="text-xs text-slate-500">{r.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2">
                        <code className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-mono">
                          {r.referral_code}
                        </code>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleBadge(r.role)}`}>
                          {r.role}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-white">{r.total_signups}</td>
                    <td className="px-5 py-3 text-center font-bold text-emerald-400">{r.total_enrolled}</td>
                    <td className="px-5 py-3 text-center text-slate-300">{r.conversion_rate}%</td>
                    <td className="px-5 py-3 text-slate-400">{fmtDate(r.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openDetail(r)}
                        disabled={!r.total_signups}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition"
                      >
                        <i className="fas fa-list" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-800/60 animate-pulse" />
          ))
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 py-14 text-center text-slate-500">
            <i className="fas fa-share-nodes text-2xl mb-3 block opacity-40" />
            No referral data found.
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.user_id}
              className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{r.user_name}</div>
                  <div className="text-xs text-slate-500 truncate">{r.email}</div>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleBadge(r.role)}`}>
                  {r.role}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <code className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-mono">
                  {r.referral_code}
                </code>
                <span className="text-[11px] text-slate-500">· {fmtDate(r.created_at)}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-800/50 py-2">
                  <p className="text-base font-black text-white leading-none">{r.total_signups}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Signups</p>
                </div>
                <div className="rounded-xl bg-slate-800/50 py-2">
                  <p className="text-base font-black text-emerald-400 leading-none">{r.total_enrolled}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Enrolled</p>
                </div>
                <div className="rounded-xl bg-slate-800/50 py-2">
                  <p className="text-base font-black text-white leading-none">{r.conversion_rate}%</p>
                  <p className="text-[10px] text-slate-500 mt-1">Conversion</p>
                </div>
              </div>

              <button
                onClick={() => openDetail(r)}
                disabled={!r.total_signups}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition"
              >
                <i className="fas fa-list" /> View referred users
              </button>
            </div>
          ))
        )}
      </div>

      {/* Detail modal — users who signed up through this referrer */}
      {detailUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Referred users</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Signed up through {detailUser.user_name}
                </p>
              </div>
              <button onClick={closeDetail} className="text-slate-400 hover:text-white transition" aria-label="Close">
                <i className="fas fa-times" />
              </button>
            </div>
            {/* Role tabs */}
            {!detailLoading && (
              <div className="flex gap-1 border-b border-slate-800 px-5 overflow-x-auto no-scrollbar">
                {[
                  { key: "student", label: "Students", count: students.length, icon: "fa-user-graduate" },
                  { key: "teacher", label: "Teachers", count: teachers.length, icon: "fa-chalkboard-teacher" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setDetailTab(t.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-all duration-200 whitespace-nowrap shrink-0 ${
                      detailTab === t.key
                        ? "border-indigo-500 text-white"
                        : "border-transparent text-slate-500 hover:text-white"
                    }`}
                  >
                    <i className={`fas ${t.icon} text-xs`} />
                    {t.label}
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-700/70 text-[10px] font-semibold text-slate-300">
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-y-auto custom-scrollbar p-5 pt-3">
              {detailLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-800/60 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : detailTab === "student" ? (
                students.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No student signups yet.</p>
                ) : (
                  <>
                    {/* Desktop: table */}
                    <table className="hidden sm:table w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                          <th className="py-2 pr-3 font-semibold">Student</th>
                          <th className="py-2 px-3 font-semibold">Signed up</th>
                          <th className="py-2 px-3 font-semibold text-center">Enrolled</th>
                          <th className="py-2 pl-3 font-semibold">Courses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((u) => (
                          <tr key={u.id} className="border-b border-white/5 align-top">
                            <td className="py-2.5 pr-3">
                              <div className="font-medium text-white">{u.referred_user_name}</div>
                              <div className="text-xs text-slate-500">{u.referred_user_email}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                              {fmtDate(u.signed_up_at)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center min-w-[1.5rem] px-2 py-0.5 rounded-full text-xs font-bold border ${
                                  u.enrolled_course_count > 0
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-slate-600/20 text-slate-400 border-slate-500/30"
                                }`}
                              >
                                {u.enrolled_course_count}
                              </span>
                            </td>
                            <td className="py-2.5 pl-3">
                              {u.enrolled_course_count > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {u.enrolled_courses.map((c) => (
                                    <span
                                      key={c.id}
                                      className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300"
                                    >
                                      {c.title}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-600 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile: cards */}
                    <div className="sm:hidden space-y-3">
                      {students.map((u) => (
                        <div
                          key={u.id}
                          className="rounded-xl border border-white/5 bg-slate-800/40 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-white truncate">
                                {u.referred_user_name}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {u.referred_user_email}
                              </div>
                            </div>
                            <span
                              className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${
                                u.enrolled_course_count > 0
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-slate-600/20 text-slate-400 border-slate-500/30"
                              }`}
                            >
                              <i className="fas fa-book text-[10px]" />
                              {u.enrolled_course_count}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                            <i className="fas fa-calendar-day text-slate-500" />
                            Signed up {fmtDate(u.signed_up_at)}
                          </div>
                          {u.enrolled_course_count > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {u.enrolled_courses.map((c) => (
                                <span
                                  key={c.id}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300"
                                >
                                  {c.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )
              ) : teachers.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No teacher signups yet.</p>
              ) : (
                <>
                  {/* Desktop: table */}
                  <table className="hidden sm:table w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                        <th className="py-2 pr-3 font-semibold">Teacher</th>
                        <th className="py-2 px-3 font-semibold">Signed up</th>
                        <th className="py-2 pl-3 font-semibold">Referral code used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((u) => (
                        <tr key={u.id} className="border-b border-white/5">
                          <td className="py-2.5 pr-3">
                            <div className="font-medium text-white">{u.referred_user_name}</div>
                            <div className="text-xs text-slate-500">{u.referred_user_email}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                            {fmtDate(u.signed_up_at)}
                          </td>
                          <td className="py-2.5 pl-3">
                            <code className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-mono">
                              {u.code_used}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile: cards */}
                  <div className="sm:hidden space-y-3">
                    {teachers.map((u) => (
                      <div
                        key={u.id}
                        className="rounded-xl border border-white/5 bg-slate-800/40 p-4"
                      >
                        <div className="font-semibold text-white truncate">
                          {u.referred_user_name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {u.referred_user_email}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <i className="fas fa-calendar-day text-slate-500" />
                            Signed up {fmtDate(u.signed_up_at)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            Code
                            <code className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono">
                              {u.code_used}
                            </code>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReferralsPage;
