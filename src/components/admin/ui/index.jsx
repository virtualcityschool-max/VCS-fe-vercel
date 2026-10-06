import React, { useEffect, useRef, useState } from "react";
import { departmentOf } from "./departments";

// Shared admin building blocks from the redesign: every list page uses the
// same header, filter bar, table and status pills.

export const PageHeader = ({ title, subtitle, primaryAction, extraActions, onExportCsv, onRefresh }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2648]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {extraActions}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-lg shadow-indigo-600/20 transition-all whitespace-nowrap"
          >
            <i className={`fas ${primaryAction.icon || "fa-plus"} text-xs`} aria-hidden="true" />
            {primaryAction.label}
          </button>
        )}
        {(onExportCsv || onRefresh) && (
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="More options"
              className="w-10 h-10 rounded-xl border border-[#232D52] bg-[#121831] text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all"
            >
              <i className="fas fa-ellipsis-vertical" aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#232D52] bg-[#121831] p-1.5 shadow-2xl z-30 text-xs">
                {onExportCsv && (
                  <button type="button" onClick={() => { setMenuOpen(false); onExportCsv(); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg text-left">
                    <i className="fas fa-download w-4 text-slate-400" aria-hidden="true" /> Export CSV
                  </button>
                )}
                {onRefresh && (
                  <button type="button" onClick={() => { setMenuOpen(false); onRefresh(); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg text-left">
                    <i className="fas fa-rotate w-4 text-slate-400" aria-hidden="true" /> Refresh data
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const SegmentedTabs = ({ tabs, value, onChange }) => (
  <div role="tablist" className="flex flex-wrap items-center gap-1.5 p-1 bg-[#121831] border border-[#232D52] rounded-xl w-fit">
    {tabs.map((t) => (
      <button
        key={t.id}
        type="button"
        role="tab"
        aria-selected={value === t.id}
        onClick={() => onChange(t.id)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
          value === t.id ? "bg-[#6D5BFF] text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
        }`}
      >
        {t.label}
        {t.count !== undefined && (
          <span className={`px-1.5 rounded-full text-[10px] tabular-nums ${value === t.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
            {t.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

export const ViewToggle = ({ value, onChange }) => (
  <div className="flex items-center rounded-xl border border-[#232D52] bg-[#121831] p-0.5">
    {[
      { id: "table", icon: "fa-table-list", label: "Table view" },
      { id: "cards", icon: "fa-grip", label: "Cards view" },
    ].map((v) => (
      <button
        key={v.id}
        type="button"
        onClick={() => onChange(v.id)}
        title={v.label}
        aria-label={v.label}
        className={`w-9 h-9 rounded-lg text-sm transition-colors ${value === v.id ? "bg-[#6D5BFF] text-white" : "text-slate-400 hover:text-white"}`}
      >
        <i className={`fas ${v.icon}`} aria-hidden="true" />
      </button>
    ))}
  </div>
);

export const FilterBar = ({ search, onSearch, placeholder = "Search…", filters = [], sortOptions = [], sort, onSort }) => {
  const active = filters.filter((f) => f.value && f.value !== "all");
  const hasAny = active.length > 0 || search.trim().length > 0;
  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <label className="relative flex-1 min-w-[240px] max-w-md">
          <span className="sr-only">Search</span>
          <i className="fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full h-10 pl-10 pr-9 text-sm rounded-xl border border-[#232D52] bg-[#121831] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {search && (
            <button type="button" aria-label="Clear search" onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              <i className="fas fa-xmark text-xs" aria-hidden="true" />
            </button>
          )}
        </label>
        <div className="flex flex-wrap items-center gap-2.5">
          {filters.map((f) => (
            <select
              key={f.id}
              aria-label={f.label}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="h-10 pl-3.5 pr-8 text-xs font-medium rounded-xl border border-[#232D52] bg-[#121831] text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All {f.plural || `${f.label}s`}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}{o.count !== undefined ? ` (${o.count})` : ""}
                </option>
              ))}
            </select>
          ))}
          {sortOptions.length > 0 && (
            <select
              aria-label="Sort"
              value={sort}
              onChange={(e) => onSort(e.target.value)}
              className="h-10 pl-3.5 pr-8 text-xs font-medium rounded-xl border border-[#232D52] bg-[#121831] text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
            </select>
          )}
        </div>
      </div>
      {hasAny && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Active filters:</span>
          {search.trim() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              Search: “{search}”
              <button type="button" aria-label="Remove search" onClick={() => onSearch("")} className="hover:text-white"><i className="fas fa-xmark text-[10px]" aria-hidden="true" /></button>
            </span>
          )}
          {active.map((f) => (
            <span key={f.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              {f.label}: {f.options.find((o) => o.value === f.value)?.label || f.value}
              <button type="button" aria-label={`Remove ${f.label} filter`} onClick={() => f.onChange("all")} className="hover:text-white"><i className="fas fa-xmark text-[10px]" aria-hidden="true" /></button>
            </span>
          ))}
          <button type="button" onClick={() => { onSearch(""); filters.forEach((f) => f.onChange("all")); }} className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 ml-1">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

const PILL_TONES = [
  [["inactive", "draft", "ended", "completed"], "bg-slate-800/80 text-slate-400 border-slate-700/60"],
  [["active", "paid", "present", "published", "engaged", "approved", "free access"], "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"],
  [["pending", "expiring", "ends in", "standby", "trial", "late", "requested"], "bg-amber-950/60 text-amber-400 border-amber-800/60"],
  [["expired", "overdue", "absent", "rejected", "cancelled", "not enrolled"], "bg-rose-950/60 text-rose-400 border-rose-800/60"],
  [["live", "scheduled", "upcoming"], "bg-sky-950/60 text-sky-400 border-sky-800/60"],
];

export const StatusPill = ({ status }) => {
  const s = (status || "").toLowerCase();
  const tone = PILL_TONES.find(([words]) => words.some((w) => s.includes(w)))?.[1] || "bg-slate-800/80 text-slate-400 border-slate-700/60";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap ${tone}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      {status}
    </span>
  );
};

export const DeptPill = ({ dept }) =>
  dept ? (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap"
      style={{ backgroundColor: `${dept.hex}1A`, color: dept.hex, borderColor: `${dept.hex}40` }}
    >
      {dept.name}
    </span>
  ) : (
    <span className="text-slate-500 text-xs">—</span>
  );

export const SubjectChips = ({ titles = [], max = 2, empty = "None" }) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    {titles.slice(0, max).map((t) => {
      const d = departmentOf(t);
      return (
        <span key={t} title={t} className="px-2 py-0.5 rounded text-[11px] border max-w-[160px] truncate" style={{ color: d.hex, borderColor: `${d.hex}40`, backgroundColor: `${d.hex}12` }}>
          {t}
        </span>
      );
    })}
    {titles.length > max && (
      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/15 text-indigo-300 font-medium">+{titles.length - max} more</span>
    )}
    {titles.length === 0 && <span className="text-slate-500 text-[11px] italic">{empty}</span>}
  </div>
);

export const Avatar = ({ name = "", size = "sm" }) => {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
  const cls = size === "lg" ? "w-11 h-11 text-sm" : "w-8 h-8 text-xs";
  return (
    <div className={`${cls} rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
};

// Generic table: checkbox selection with a bulk-action bar, row click opens
// details, per-row action buttons, client-side paging.
export const DataTable = ({ columns, rows, rowKey = "id", onRowClick, rowActions, bulkActions = [], pageSize = 15, empty }) => {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.includes(r[rowKey]));

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () =>
    setSelected((s) => (allOnPage ? s.filter((id) => !pageRows.some((r) => r[rowKey] === id)) : [...new Set([...s, ...pageRows.map((r) => r[rowKey])])]));

  if (rows.length === 0 && empty) return empty;

  return (
    <div className="relative rounded-2xl border border-[#232D52] bg-[#121831] shadow-xl overflow-hidden text-slate-200">
      {selected.length > 0 && bulkActions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#6D5BFF]/15 border-b border-indigo-500/30 text-indigo-200 text-xs font-medium">
          <span><b className="text-white">{selected.length}</b> selected</span>
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => { a.onClick(rows.filter((r) => selected.includes(r[rowKey]))); setSelected([]); }}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold ${a.destructive ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30" : "bg-indigo-600 text-white hover:bg-indigo-500"}`}
              >
                {a.icon && <i className={`fas ${a.icon} text-[11px]`} aria-hidden="true" />}
                {a.label}
              </button>
            ))}
            <button type="button" onClick={() => setSelected([])} className="px-2.5 h-8 text-xs text-slate-300 hover:text-white">Deselect</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E2648] bg-[#0E1428] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {bulkActions.length > 0 && (
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={toggleAll} className="rounded cursor-pointer accent-[#6D5BFF]" />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.header} className={`py-3 px-4 whitespace-nowrap ${c.align === "right" ? "text-right" : ""}`}>{c.header}</th>
              ))}
              {rowActions && <th className="py-3 px-4 text-right w-28">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2648]/60 text-xs">
            {pageRows.map((r) => {
              const id = r[rowKey];
              const isSel = selected.includes(id);
              return (
                <tr key={id} onClick={() => onRowClick?.(r)} className={`transition-colors ${onRowClick ? "cursor-pointer" : ""} ${isSel ? "bg-indigo-500/10" : "hover:bg-[#1A2346]/70"}`}>
                  {bulkActions.length > 0 && (
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label="Select row" checked={isSel} onChange={() => toggle(id)} className="rounded cursor-pointer accent-[#6D5BFF]" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.header} className={`py-3 px-4 ${c.className || ""} ${c.align === "right" ? "text-right" : ""}`}>{c.cell(r)}</td>
                  ))}
                  {rowActions && (
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">{rowActions(r)}</div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#1E2648] bg-[#0E1428] text-xs text-slate-400">
        <span>
          Showing <b className="text-slate-200 tabular-nums">{rows.length ? start + 1 : 0}–{Math.min(start + pageSize, rows.length)}</b> of <b className="text-slate-200 tabular-nums">{rows.length}</b>
        </span>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} className="w-8 h-8 rounded-lg border border-[#232D52] hover:bg-slate-800 disabled:opacity-40">
            <i className="fas fa-chevron-left text-[10px]" aria-hidden="true" />
          </button>
          <span className="px-2 text-slate-300 tabular-nums">{current} / {totalPages}</span>
          <button type="button" aria-label="Next page" disabled={current === totalPages} onClick={() => setPage(current + 1)} className="w-8 h-8 rounded-lg border border-[#232D52] hover:bg-slate-800 disabled:opacity-40">
            <i className="fas fa-chevron-right text-[10px]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const IconButton = ({ icon, label, onClick, tone = "hover:text-indigo-300", disabled }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className={`w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-40 ${tone}`}
  >
    <i className={`fas ${icon} text-[13px]`} aria-hidden="true" />
  </button>
);

// Right-side details panel.
export const Drawer = ({ open, onClose, title, subtitle, avatarName, status, tabs, tab, onTab, children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300]" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close details" onClick={onClose} className="absolute inset-0 bg-black/50 cursor-default" />
      <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-[#121831] border-l border-[#232D52] shadow-2xl flex flex-col text-slate-100">
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[#1E2648] bg-[#0E1428]">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={avatarName || title} size="lg" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">{title}</h2>
              {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {status && <StatusPill status={status} />}
            <IconButton icon="fa-xmark" label="Close" onClick={onClose} tone="hover:text-white" />
          </div>
        </div>
        {tabs && (
          <div className="flex items-center gap-1 px-4 border-b border-[#1E2648] overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTab(t.id)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap ${tab === t.id ? "border-[#6D5BFF] text-indigo-300" : "border-transparent text-slate-400 hover:text-slate-200"}`}
              >
                <i className={`fas ${t.icon} text-[11px]`} aria-hidden="true" /> {t.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>
        {footer && <div className="p-4 border-t border-[#1E2648] bg-[#0E1428] flex flex-wrap items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export const InfoTile = ({ label, value, sub, tone = "text-slate-100" }) => (
  <div className="p-3.5 rounded-xl border border-[#232D52] bg-[#0E1428]">
    <div className="text-xs text-slate-400">{label}</div>
    <div className={`text-base font-bold mt-1 ${tone}`}>{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
  </div>
);
