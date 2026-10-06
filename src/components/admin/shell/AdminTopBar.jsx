import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { QUICK_ADD, findNavItem, getActiveNavId } from "./adminNav";
import { useAdminSignals } from "./adminSignalsContext";
import CommandPalette from "./CommandPalette";


// Closes a dropdown on an outside click.
const useOutside = (open, setOpen) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, setOpen]);
  return ref;
};

const AdminTopBar = ({ onOpenMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const signals = useAdminSignals();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const addRef = useOutside(addOpen, setAddOpen);
  const bellRef = useOutside(bellOpen, setBellOpen);

  const active = findNavItem(getActiveNavId(location.pathname, location.search));

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAddOpen(false);
    setBellOpen(false);
  }, [location.pathname, location.search]);

  const c = signals?.counts || {};
  const alerts = [
    { n: c.approvals, text: "waiting for approval", to: "/admin/approvals", tone: "text-red-300" },
    { n: c.expiring, text: "fees ending within 7 days", to: "/admin/subscriptions", tone: "text-amber-300" },
    { n: c.unassigned, text: "published subjects with no teacher", to: "/admin/teacher-allocations", tone: "text-amber-300" },
    { n: c.live, text: "classes live right now", to: "/admin/sessions", tone: "text-emerald-300" },
  ].filter((a) => a.n > 0);
  const alertTotal = (c.approvals || 0) + (c.expiring || 0) + (c.unassigned || 0);

  return (
    <header className="sticky top-0 z-40 bg-[#0B1020]/95 backdrop-blur border-b border-[#1E294B]">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="lg:hidden w-10 h-10 rounded-xl border border-[#1E294B] bg-[#121831] text-slate-200 flex items-center justify-center"
        >
          <i className="fas fa-bars text-sm" aria-hidden="true" />
        </button>

        {/* Breadcrumb only: each page shows its own title below */}
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1 lg:flex-none lg:w-64 text-sm truncate">
          <span className="text-slate-400">Admin</span>
          {active?.section && <span className="text-slate-400"> / {active.section}</span>}
          {active && <span className="text-white font-semibold"> / {active.label}</span>}
        </nav>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="hidden md:flex flex-1 max-w-md items-center gap-3 h-10 px-3 rounded-xl border border-[#1E294B] bg-[#121831] text-slate-400 text-sm hover:border-[#2A3766] transition"
        >
          <i className="fas fa-magnifying-glass text-xs" aria-hidden="true" />
          <span className="flex-1 text-left truncate">Search students, teachers, parents, subjects…</span>
          <kbd className="text-[11px] border border-[#2A3766] rounded px-1.5">⌘K</kbd>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
            className="md:hidden w-10 h-10 rounded-xl border border-[#1E294B] bg-[#121831] text-slate-200"
          >
            <i className="fas fa-magnifying-glass text-sm" aria-hidden="true" />
          </button>

          <div className="relative" ref={addRef}>
            <button
              type="button"
              onClick={() => setAddOpen((o) => !o)}
              aria-expanded={addOpen}
              className="h-10 px-3 sm:px-4 rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white text-sm font-semibold flex items-center gap-2 transition"
            >
              <i className="fas fa-plus text-xs" aria-hidden="true" />
              <span className="hidden sm:inline">Quick add</span>
              <i className="fas fa-chevron-down text-[10px] hidden sm:inline" aria-hidden="true" />
            </button>
            {addOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#2A3766] bg-[#121831] shadow-2xl py-1.5">
                {QUICK_ADD.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => navigate(q.to)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-200 hover:bg-white/5 text-left"
                  >
                    <i className={`fas ${q.icon} w-4 text-center text-slate-400`} aria-hidden="true" />
                    {q.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => setBellOpen((o) => !o)}
              aria-label="Alerts"
              aria-expanded={bellOpen}
              className="relative w-10 h-10 rounded-xl border border-[#1E294B] bg-[#121831] text-slate-200 hover:border-[#2A3766]"
            >
              <i className="fas fa-bell text-sm" aria-hidden="true" />
              {alertTotal > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {alertTotal > 99 ? "99+" : alertTotal}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#2A3766] bg-[#121831] shadow-2xl p-2">
                {alerts.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-slate-400 text-center">All caught up ✓</p>
                ) : (
                  alerts.map((a) => (
                    <Link key={a.to} to={a.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm">
                      <span className={`font-bold tabular-nums ${a.tone}`}>{a.n}</span>
                      <span className="text-slate-200">{a.text}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
};

export default AdminTopBar;
