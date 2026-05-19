import React, { useState, useEffect, useRef } from "react";

const COUNTRIES = [
  { name: "Pakistan",        dialCode: "+92",  flag: "🇵🇰", placeholder: "3001234567",  maxLen: 10 },
  { name: "United Kingdom",  dialCode: "+44",  flag: "🇬🇧", placeholder: "7911123456",  maxLen: 10 },
  { name: "Australia",       dialCode: "+61",  flag: "🇦🇺", placeholder: "412345678",   maxLen: 9  },
  { name: "United States",   dialCode: "+1",   flag: "🇺🇸", placeholder: "2015551234",  maxLen: 10 },
  { name: "UAE",             dialCode: "+971", flag: "🇦🇪", placeholder: "501234567",   maxLen: 9  },
];

const parsePhone = (value) => {
  if (!value) return { dialCode: "+92", number: "" };
  const v = value.startsWith("+") ? value : "+" + value.replace(/\D/g, "");
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (v.startsWith(c.dialCode)) {
      return { dialCode: c.dialCode, number: v.slice(c.dialCode.length).replace(/\D/g, "") };
    }
  }
  return { dialCode: "+92", number: v.replace(/\D/g, "") };
};

const PhoneInput = ({ value, onChange, error, className = "", disabled = false, label }) => {
  const parsed = parsePhone(value);
  const [dialCode, setDialCode] = useState(parsed.dialCode);
  const [number, setNumber] = useState(parsed.number);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef(null);

  const selectedCountry = COUNTRIES.find((c) => c.dialCode === dialCode) || COUNTRIES[0];

  useEffect(() => {
    const p = parsePhone(value);
    setDialCode(p.dialCode);
    setNumber(p.number);
  }, [value]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelectCountry = (c) => {
    setDialCode(c.dialCode);
    setDropdownOpen(false);
    onChange(number ? c.dialCode + number : "");
  };

  const handleNumberChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, selectedCountry.maxLen);
    setNumber(digits);
    onChange(digits ? dialCode + digits : "");
  };

  const handleKeyDown = (e) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter", "Home", "End"];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const borderCls = error
    ? "border-red-500"
    : focused
      ? "border-indigo-500 ring-2 ring-indigo-500/20"
      : "border-slate-700/60 hover:border-slate-600";

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      )}

      <div className={`flex items-stretch bg-slate-900/60 border rounded-xl overflow-visible transition-all duration-150 ${borderCls} ${disabled ? "opacity-60" : ""}`}>
        {/* Country selector button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setDropdownOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 border-r border-slate-700/60 shrink-0 hover:bg-slate-800/60 transition-colors rounded-l-xl"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="text-xs font-bold text-slate-300">{selectedCountry.dialCode}</span>
          <i className={`fas fa-chevron-down text-[9px] text-slate-500 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}></i>
        </button>

        {/* Number input */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={number}
          onChange={handleNumberChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={selectedCountry.placeholder}
          maxLength={selectedCountry.maxLen}
          className="flex-1 bg-transparent text-white text-sm px-3 py-2.5 focus:outline-none placeholder:text-slate-600 min-w-0 rounded-r-xl"
        />
      </div>

      {/* Country dropdown */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
          {COUNTRIES.map((c) => (
            <button
              key={c.dialCode}
              type="button"
              onClick={() => handleSelectCountry(c)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors text-left ${
                c.dialCode === dialCode ? "bg-indigo-600/20 text-indigo-300" : "text-slate-300"
              }`}
            >
              <span className="text-base">{c.flag}</span>
              <span className="flex-1 font-medium">{c.name}</span>
              <span className="text-xs text-slate-500 font-mono">{c.dialCode}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <i className="fas fa-exclamation-circle text-[10px]"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
