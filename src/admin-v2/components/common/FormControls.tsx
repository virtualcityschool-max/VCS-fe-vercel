import React, { useMemo, useState } from 'react';
import { Check, Copy, RefreshCw, Search, X } from 'lucide-react';
import { COUNTRIES, generatePassword } from '../../data/formOptions';

// Shared form building blocks for the admin area, in the dashboard's palette.

export const inputCls =
  'w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#6D5BFF] focus:ring-1 focus:ring-[#6D5BFF]/40 disabled:opacity-60';

export const Field: React.FC<{
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, className = '', children }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-300 mb-1">
      {label}
      {required && <span className="text-rose-400"> *</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
  </div>
);

export const FormSection: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div className="space-y-3 pt-1">
    <div className="flex items-baseline gap-2 border-b border-[#1E2648] pb-1.5">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#A99DFF]">{title}</h4>
      {subtitle && <span className="text-[11px] text-slate-500">{subtitle}</span>}
    </div>
    {children}
  </div>
);

type Opt = { value: string | number; label: string };

export const SelectInput: React.FC<{
  value: string | number;
  onChange: (v: string) => void;
  options: (Opt | string)[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}> = ({ value, onChange, options, placeholder, required, disabled }) => (
  <select
    value={value}
    required={required}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    className={`${inputCls} cursor-pointer`}
  >
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options.map((o) => {
      const opt = typeof o === 'string' ? { value: o, label: o } : o;
      return (
        <option key={String(opt.value)} value={opt.value}>
          {opt.label}
        </option>
      );
    })}
  </select>
);

// Temporary password with one-click generate and copy.
export const PasswordField: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Field label="Temporary password" required hint="Upper & lower case, a number and a symbol. Share it privately; they can change it later.">
      <div className="flex gap-2">
        <input
          type="text"
          required
          minLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Click Generate"
          className={`${inputCls} font-mono`}
        />
        <button
          type="button"
          onClick={() => onChange(generatePassword())}
          title="Generate a password"
          className="shrink-0 flex items-center gap-1.5 px-3 rounded-xl border border-[#232D52] bg-[#1A2346] text-xs font-semibold text-slate-200 hover:border-[#6D5BFF]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Generate
        </button>
        <button
          type="button"
          disabled={!value}
          onClick={() => {
            navigator.clipboard?.writeText(value).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          title="Copy"
          className="shrink-0 px-2.5 rounded-xl border border-[#232D52] bg-[#1A2346] text-slate-300 hover:text-white disabled:opacity-40"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </Field>
  );
};

// Phone stored as digits with country code, no '+', e.g. 966501234567.
export const PhoneField: React.FC<{
  label: string;
  dial: string;
  onDialChange: (d: string) => void;
  number: string;
  onNumberChange: (n: string) => void;
  hint?: string;
}> = ({ label, dial, onDialChange, number, onNumberChange, hint }) => {
  const dials = useMemo(
    () => Array.from(new Map(COUNTRIES.map((c) => [c.dial, c])).values()),
    []
  );
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <select
          value={dial}
          onChange={(e) => onDialChange(e.target.value)}
          className={`${inputCls.replace("w-full ", "")} w-[118px] shrink-0 cursor-pointer font-mono`}
        >
          {dials.map((c) => (
            <option key={c.dial} value={c.dial}>
              +{c.dial} {c.name.length > 12 ? c.name.split(' ').map((w) => w[0]).join('') : c.name}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={(e) => onNumberChange(e.target.value.replace(/[^\d]/g, '').replace(/^0+/, ''))}
          placeholder="50 123 4567"
          className={`${inputCls} font-mono`}
        />
      </div>
    </Field>
  );
};

export const fullPhone = (dial: string, number: string) => (number ? `${dial}${number}` : '');

// Searchable pick-list with checkboxes; selected items show as chips.
export const MultiPick: React.FC<{
  options: { value: string; label: string; sub?: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  emptyText?: string;
}> = ({ options, selected, onChange, placeholder = 'Search…', emptyText = 'Nothing to choose.' }) => {
  const [q, setQ] = useState('');
  const list = options.filter((o) => `${o.label} ${o.sub || ''}`.toLowerCase().includes(q.toLowerCase()));
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  const byValue = new Map(options.map((o) => [o.value, o]));
  return (
    <div className="rounded-xl border border-[#232D52] bg-[#0E1428]">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 border-b border-[#1E2648]">
          {selected.map((v) => (
            <span key={v} className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-[#6D5BFF]/20 border border-[#6D5BFF]/40 text-[11px] text-indigo-200">
              {byValue.get(v)?.label || v}
              <button type="button" onClick={() => toggle(v)} className="p-0.5 rounded hover:bg-white/10">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1E2648]">
        <Search className="w-3.5 h-3.5 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none py-1"
        />
      </div>
      <div className="max-h-40 overflow-y-auto p-1">
        {list.length === 0 && <p className="px-2 py-3 text-center text-[11px] text-slate-500">{emptyText}</p>}
        {list.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button
              type="button"
              key={o.value}
              onClick={() => toggle(o.value)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs ${on ? 'bg-[#6D5BFF]/15 text-white' : 'text-slate-300 hover:bg-[#1A2346]'}`}
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-[#6D5BFF] border-[#6D5BFF]' : 'border-slate-600'}`}>
                {on && <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              <span className="truncate">{o.label}</span>
              {o.sub && <span className="ml-auto shrink-0 text-[10px] text-slate-500">{o.sub}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
