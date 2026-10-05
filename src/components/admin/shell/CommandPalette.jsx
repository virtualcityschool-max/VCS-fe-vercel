import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminService } from "../../../services/adminService";
import { fetchCourses } from "../../../store/slices/adminSlice";
import { getDisplayName } from "../../../utils/userDisplay";
import { ADMIN_NAV } from "./adminNav";

const ROLE_LABEL = { student: "Student", teacher: "Teacher", parent: "Parent", admin: "Admin" };
const ROLE_ICON = { student: "fa-user-graduate", teacher: "fa-chalkboard-user", parent: "fa-people-roof", admin: "fa-user-shield" };
const MAX_PER_GROUP = 6;

const PAGES = ADMIN_NAV.flatMap((g) =>
  g.items.map((i) => ({ ...i, hint: g.section || "Home" })),
);

const asList = (data) => (Array.isArray(data) ? data : data?.data || data?.results || []);

// ⌘K / Ctrl+K search across menu pages, people and subjects. People are
// loaded once, the first time it opens, straight from the API so the lists
// on other admin pages are never overwritten.
const CommandPalette = ({ open, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [people, setPeople] = useState(null);
  const courses = useSelector((s) => s.admin.courses.data);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setCursor(0);
    setTimeout(() => inputRef.current?.focus(), 0);
    if (people === null) {
      adminService.getUsers().then((d) => setPeople(asList(d))).catch(() => setPeople([]));
    }
    if (!courses || courses.length === 0) dispatch(fetchCourses());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (...fields) => !q || fields.some((f) => (f || "").toString().toLowerCase().includes(q));

    const pageHits = PAGES.filter((p) => match(p.label, p.hint)).slice(0, q ? MAX_PER_GROUP : PAGES.length);
    const peopleHits = q
      ? (people || [])
          .filter((u) => match(getDisplayName(u), u.email, u.username, u.student_profile?.roll_no, u.roll_no))
          .slice(0, MAX_PER_GROUP)
      : [];
    const courseHits = q ? (courses || []).filter((c) => match(c.title)).slice(0, MAX_PER_GROUP) : [];

    return [
      ...pageHits.map((p) => ({ key: `p-${p.id}`, group: "Pages", icon: p.icon, label: p.label, hint: p.hint, to: p.to })),
      ...peopleHits.map((u) => ({
        key: `u-${u.id}`,
        group: "People",
        icon: `fas ${ROLE_ICON[u.role] || "fa-user"}`,
        label: getDisplayName(u) || u.email,
        hint: `${ROLE_LABEL[u.role] || u.role} · ${u.email}`,
        to: `/admin/users/${u.id}`,
      })),
      ...courseHits.map((c) => ({
        key: `c-${c.id}`,
        group: "Subjects",
        icon: "fas fa-book",
        label: c.title,
        hint: c.category?.name || c.category_name || "Subject",
        to: `/admin/courses/${c.id}`,
      })),
    ];
  }, [query, people, courses]);

  if (!open) return null;

  const go = (item) => {
    if (!item) return;
    onClose();
    navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") go(results[cursor]);
  };

  let lastGroup = null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <button type="button" aria-label="Close search" className="absolute inset-0 bg-black/60 cursor-default" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-[#2A3766] bg-[#121831] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-[#1E294B]">
          <i className="fas fa-magnifying-glass text-slate-400 text-sm" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search students, teachers, parents, subjects or pages…"
            className="flex-1 h-14 bg-transparent outline-none text-white placeholder:text-slate-500 text-[15px]"
          />
          <kbd className="text-[11px] text-slate-400 border border-[#2A3766] rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {query && people === null && <p className="px-4 py-2 text-xs text-slate-400">Loading people…</p>}
          {results.length === 0 && <p className="px-4 py-6 text-sm text-slate-400 text-center">Nothing found for “{query}”</p>}
          {results.map((r, i) => {
            const header = r.group !== lastGroup ? r.group : null;
            lastGroup = r.group;
            return (
              <React.Fragment key={r.key}>
                {header && <p className="px-4 pt-2 pb-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">{header}</p>}
                <button
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(r)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${i === cursor ? "bg-[#6D5BFF]/20" : ""}`}
                >
                  <i className={`${r.icon} w-4 text-center text-slate-300 text-sm`} aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-white truncate">{r.label}</span>
                    <span className="block text-xs text-slate-400 truncate">{r.hint}</span>
                  </span>
                  {i === cursor && <i className="fas fa-arrow-turn-down rotate-90 text-slate-400 text-xs" aria-hidden="true" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
