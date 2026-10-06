import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export interface SortOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  sortOptions?: SortOption[];
  currentSort?: string;
  onSortChange?: (sort: string) => void;
  onClearAll?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  sortOptions = [],
  currentSort,
  onSortChange,
  onClearAll,
}) => {
  const activeFilters = filters.filter((f) => f.value && f.value !== 'all');
  const hasActiveFiltersOrSearch = activeFilters.length > 0 || searchQuery.trim().length > 0;

  const handleClearAll = () => {
    onSearchChange('');
    filters.forEach((f) => f.onChange('all'));
    if (onClearAll) onClearAll();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-[#232D52] bg-[#121831] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          {filters.map((filter) => (
            <div key={filter.id} className="relative">
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 text-xs font-medium rounded-xl border border-[#232D52] bg-[#121831] text-slate-200 hover:border-slate-600 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="all">All {filter.label}s</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>
          ))}

          {sortOptions.length > 0 && onSortChange && (
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none pl-7 pr-8 py-2 text-xs font-medium rounded-xl border border-[#232D52] bg-[#121831] text-slate-200 hover:border-slate-600 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chips & Clear All */}
      {hasActiveFiltersOrSearch && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium mr-1">Active filters:</span>

          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.map((filter) => {
            const currentOpt = filter.options.find((o) => o.value === filter.value);
            return (
              <span
                key={filter.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
              >
                <span>
                  {filter.label}: {currentOpt?.label || filter.value}
                </span>
                <button
                  onClick={() => filter.onChange('all')}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          <button
            onClick={handleClearAll}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
