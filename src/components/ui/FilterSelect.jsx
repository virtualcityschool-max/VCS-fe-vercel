import React, { useState, useRef, useEffect, useMemo } from "react";

const FilterSelect = ({
  className = "",
  children,
  value,
  onChange,
  disabled = false,
  placeholder = "Select...",
  style,
}) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const containerRef        = useRef(null);
  const searchRef           = useRef(null);

  // Parse <option> children → [{ value, label, disabled }]
  const options = useMemo(() => {
    const list = [];
    React.Children.forEach(children, (child) => {
      if (!child || child.type !== "option") return;
      list.push({
        value:    String(child.props.value ?? ""),
        label:    String(child.props.children ?? ""),
        disabled: !!child.props.disabled,
      });
    });
    return list;
  }, [children]);

  const selected = options.find((o) => String(o.value) === String(value ?? ""));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    onChange?.({ target: { value: opt.value } });
    setOpen(false);
    setSearch("");
  };

  const toggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  return (
    <div ref={containerRef} className="relative inline-flex" style={style}>
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2
          bg-slate-900 border rounded-xl pl-3.5 pr-3 py-2.5
          text-sm font-medium transition-all duration-150
          ${open
            ? "border-indigo-500/60 ring-2 ring-indigo-500/15"
            : "border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/70"
          }
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          ${className}`}
      >
        <span className={`truncate ${selected ? "text-white" : "text-slate-500"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <i className={`fas fa-chevron-down text-slate-500 text-[10px] flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[200] top-[calc(100%+4px)] left-0 w-full min-w-[180px]
          bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">

          {/* Search */}
          <div className="px-2 pt-2 pb-1.5 border-b border-slate-800">
            <div className="relative">
              <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-800 border border-slate-700/60 rounded-lg pl-7 pr-3 py-1.5
                  text-white text-xs placeholder-slate-500
                  focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-xs text-slate-500 text-center">No results</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-sm transition-colors select-none
                    ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                    ${String(opt.value) === String(value ?? "")
                      ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterSelect;
