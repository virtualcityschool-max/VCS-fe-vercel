import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { getDisplayName } from "../../utils/userDisplay";

/**
 * Rich course dropdown rendered via portal - floats freely above modals/overflow containers.
 *
 * Props:
 *   courses          - array of course objects
 *   value            - currently selected course id (string or number)
 *   onChange(course) - called with the full course object on selection
 *   error            - truthy → red border
 *   placeholder      - trigger placeholder text (default "Select a course")
 *   getDisabledReason(course) → string|null - return a string to disable + annotate an item
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
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const isScrolling = useRef(false); // ✅ Added tracker for screen touch movements

  const openDropdown = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropH = 290; // max height with level pills
    const openBelow = spaceBelow >= dropH || spaceBelow >= spaceAbove;
    
    // ✅ CHANGED: Uses window scroll offsets to build an absolute anchor coordinates grid
    setDropPos({
      top: openBelow ? rect.bottom + window.scrollY + 4 : rect.top + window.scrollY - dropH - 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
    setSearch("");
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (dropdownRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    
    // ✅ CHANGED: Allow background scroll container movements if it targets the dropdown area itself
    const closeOnScroll = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      setOpen(false);
    };

    // ✅ CHANGED: Changed listener to standard 'click' to safely ignore mobile scroll triggers
    document.addEventListener("click", close);
    const t = setTimeout(() => window.addEventListener("scroll", closeOnScroll, true), 300);
    return () => {
      document.removeEventListener("click", close);
      clearTimeout(t);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [open]);

  const selected = courses.find((c) => String(c.id) === String(value));

  const matchesLevel = (c, lvl) => {
    if (lvl === "All") return true;
    const text = `${c.title || ""} ${c.category?.name || c.level || ""}`.toLowerCase();
    if (lvl === "O Level") return text.includes("o level") || text.includes("olevel") || text.includes("ol ") || text.includes("4037") || text.includes("0580") || text.includes("5070");
    if (lvl === "A Level") return text.includes("a level") || text.includes("alevel") || text.includes("al ") || text.includes("as level") || text.includes("9709") || text.includes("9701") || text.includes("9702");
    if (lvl === "IGCSE") return text.includes("igcse");
    if (lvl === "Primary") return text.includes("primary") || text.includes("grade") || text.includes("checkpoint");
    return text.includes(lvl.toLowerCase());
  };

  const levelFiltered = selectedLevel === "All" ? courses : courses.filter((c) => matchesLevel(c, selectedLevel));

  const filtered = search.trim()
    ? levelFiltered.filter((c) =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        getDisplayName(c.instructor)?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : levelFiltered;

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
                position: "absolute", // ✅ CHANGED: Absolute elements resist mobile viewpoint bounces
                top: dropPos.top,
                left: dropPos.left,
                width: dropPos.width,
                zIndex: 9999,
              }}
              ref={dropdownRef}
              onClick={(e) => e.stopPropagation()} // ✅ CHANGED: Uses click event bubbling controls
              className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Level Filter Pills */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 bg-slate-950/70">
                {["All", "O Level", "A Level", "IGCSE", "Primary"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                      selectedLevel === lvl
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="px-2 pt-2 pb-1.5 border-b border-slate-800">
                <div className="relative">
                  <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses or teachers…"
                    style={{ fontSize: 16 }}
                    className="w-full bg-slate-800 border border-slate-700/60 rounded-lg pl-7 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 text-sm"
                  />
                </div>
              </div>

              <div 
                className="max-h-52 overflow-y-auto custom-scrollbar" 
                style={{ overscrollBehavior: "contain" }}
                onTouchMove={() => { isScrolling.current = true; }}    // ✅ Added scroll capture hook
                onTouchStart={() => { isScrolling.current = false; }}  // ✅ Added clean layout swipe reset
              >
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
                      // ✅ CHANGED: Dropdown option picks only happen if the user didn't scroll the screen
                      if (!disabled && !isScrolling.current) { onChange(c); setOpen(false); }
                    }}
                    className={`px-4 py-3 border-b border-slate-700/50 last:border-0 transition select-none
                      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      ${isSelected ? "bg-indigo-500/15" : ""}`}
                  >
                    <p className={`text-sm font-semibold ${isSelected ? "text-indigo-300" : "text-white"}`}>
                      {c.title}
                    </p>
                    {getDisplayName(c.instructor) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tutor: <span className="text-slate-300">{getDisplayName(c.instructor)}</span>
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