import React, { useState, useRef, useEffect } from 'react';
import { exportVisibleTableCsv, fileSlug } from '../../utils';
import { MoreVertical, Download, RefreshCw, Plus, LucideIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  onExportCsv?: () => void;
  onRefresh?: () => void;
  extraActions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  primaryAction,
  onExportCsv,
  onRefresh,
  extraActions,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToast, resetDemoData } = useApp();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    setMenuOpen(false);
    if (onExportCsv) {
      onExportCsv();
    } else {
      const n = exportVisibleTableCsv(fileSlug(title));
      addToast(n ? `Downloaded ${n} ${title} rows as CSV.` : 'Nothing to export on this view.', n ? 'success' : 'info');
    }
  };

  const handleRefresh = () => {
    setMenuOpen(false);
    if (onRefresh) {
      onRefresh();
    } else {
      resetDemoData();
    }
  };

  const Icon = primaryAction?.icon || Plus;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2648]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {extraActions}

        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{primaryAction.label}</span>
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 rounded-xl border border-[#232D52] bg-[#121831] text-slate-300 hover:text-white hover:bg-[#1A2346] hover:border-indigo-500/40 transition-all cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#232D52] bg-[#121831] p-1.5 shadow-2xl z-30 text-xs">
              <button
                onClick={handleExport}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors text-left"
              >
                <Download className="w-4 h-4 text-slate-400" />
                Export CSV
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors text-left"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
