import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Rich course dropdown rendered via portal — floats freely above modals/overflow containers.
 *
 * Props:
 *   courses          - array of course objects
 *   value            - currently selected course id (string or number)
 *   onChange(course) - called with the full course object on selection
 *   error            - truthy → red border
 *   placeholder      - trigger placeholder text (default "Select a course")
 *   getDisabledReason(course) → string|null — return a string to disable + annotate an item
 */
const CourseSelect = ({
  courses = [],
  value,
  onChange,
  error,
  placeholder = "Select a course",
  getDisabledReason,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const openDropdown = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropH = 256; // max-h-64
    const openBelow = spaceBelow >= dropH || spaceBelow >= spaceAbove;
    setDropPos({
      top: openBelow ? rect.bottom + 4 : rect.top - dropH - 4,
      left: rect.left,
      width: rect.width,
    });
    setSearch("");
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false);
    };
    const closeOnScroll = (e) => {
      // ignore scrolling inside the dropdown list itself
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [open]);

  const selected = courses.find((c) => String(c.id) === String(value));

  const filtered = search.trim()
    ? courses.filter((c) =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.username?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { if (open) { setOpen(false); setSearch(""); } else { openDropdown(); } }}
        className={`w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 text-sm transition ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-slate-700 focus:ring-indigo-500 hover:border-slate-600"
        }`}
      >
        {selected ? (
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{selected.title}</p>
          </div>
        ) : (
          <span className="text-slate-500">{placeholder}</span>
        )}
        <i
          className={`fas fa-chevron-down text-slate-500 text-xs flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          open && (
            <div
              style={{
                position: "fixed",
                top: dropPos.top,
                left: dropPos.left,
                width: dropPos.width,
                zIndex: 9999,
              }}
              ref={dropdownRef}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Search */}
              <div className="px-2 pt-2 pb-1.5 border-b border-slate-800">
                <div className="relative">
                  <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    style={{ fontSize: 16 }}
                    className="w-full bg-slate-800 border border-slate-700/60 rounded-lg pl-7 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 text-sm"
                  />
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto custom-scrollbar">
              {filtered.length === 0 && (
                <div className="px-4 py-3 text-slate-500 text-sm">No courses found</div>
              )}
              {filtered.map((c) => {
                const reason = getDisabledReason?.(c) ?? null;
                const disabled = reason !== null;
                const isSelected = String(c.id) === String(value);
                return (
                  <div
                    key={c.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!disabled) { onChange(c); setOpen(false); }
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      if (!disabled) { onChange(c); setOpen(false); }
                    }}
                    className={`px-4 py-3 border-b border-slate-700/50 last:border-0 transition select-none
                      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      ${isSelected ? "bg-indigo-500/15" : ""}`}
                  >
                    <p className={`text-sm font-semibold ${isSelected ? "text-indigo-300" : "text-white"}`}>
                      {c.title}
                    </p>
                    {c.instructor?.username && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tutor: <span className="text-slate-300">{c.instructor.username}</span>
                        {c.instructor.email && (
                          <span className="text-slate-500"> · {c.instructor.email}</span>
                        )}
                      </p>
                    )}
                    {disabled && (
                      <p className="text-[11px] text-amber-400/80 mt-0.5 flex items-center gap-1">
                        <i className="fas fa-ban text-[9px]" />
                        {reason}
                      </p>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          ),
          document.body
        )}
    </div>
  );
};

export default CourseSelect;
