import React, { useEffect, useState } from 'react';
import {
  Eye,
  Edit2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Trash2,
  UserX,
  UserCheck,
  Download,
  BookOpen,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  className?: string;
  cell?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface BulkAction {
  label: string;
  icon?: any;
  onClick: (selectedIds: string[]) => void;
  isDestructive?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onToggleStatus?: (row: T) => void;
  bulkActions?: BulkAction[];
  pageSize?: number;
  emptyState?: React.ReactNode;
  /** Alternate row shading + stronger dividers, for rows with tall wrapped content. */
  striped?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  keyField = 'id',
  onRowClick,
  onEdit,
  onDelete,
  onToggleStatus,
  bulkActions = [],
  pageSize = 10,
  emptyState,
  striped = false,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  // A floating menu would drift away from its row on scroll, so close it instead.
  useEffect(() => {
    if (!actionMenuOpenId) return;
    const close = () => setActionMenuOpenId(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [actionMenuOpenId]);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  const isAllSelected = currentData.length > 0 && currentData.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentData.map((d) => d.id)])));
    }
  };

  const handleToggleRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleDeletePrompt = (e: React.MouseEvent, row: T) => {
    e.stopPropagation();
    setActionMenuOpenId(null);
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Record?',
      message: 'Are you sure you wish to remove or deactivate this record? This action can be undone from the activity history.',
      onConfirm: () => onDelete?.(row),
    });
  };

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="relative rounded-2xl border border-[#232D52] bg-[#121831] shadow-xl overflow-hidden text-slate-200">
      {/* Contextual Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#6D5BFF]/15 border-b border-indigo-500/30 text-indigo-200 text-xs font-medium animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{selectedIds.length}</span> record(s) selected
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    action.onClick(selectedIds);
                    setSelectedIds([]);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    action.isDestructive
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {action.label}
                </button>
              );
            })}
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E2648] bg-[#0E1428] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="rounded border-[#232D52] bg-[#121831] text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-4 ${col.className || ''} ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
              <th className="py-3 px-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs ${striped ? 'divide-[#2A3560]' : 'divide-[#1E2648]/60'}`}>
            {currentData.map((row, rowIdx) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`group transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-500/10' : 'hover:bg-[#1A2346]/70'
                  } ${striped && !isSelected && rowIdx % 2 === 1 ? 'bg-[#0B1124]' : ''}`}
                >
                  <td className="py-3 px-4" onClick={(e) => handleToggleRow(e, row.id)}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-[#232D52] bg-[#121831] text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </td>

                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-3 px-4 ${col.className || ''} ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {col.cell ? col.cell(row) : (row as any)[col.accessorKey as string]}
                    </td>
                  ))}

                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {onRowClick && (
                        <button
                          onClick={() => onRowClick(row)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            // Float the menu over the page so the table's scroll box can't clip it.
                            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
                            setActionMenuOpenId(actionMenuOpenId === row.id ? null : row.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {actionMenuOpenId === row.id && (
                          // Click anywhere outside the menu to close it.
                          <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpenId(null)} />
                        )}
                        {actionMenuOpenId === row.id && (
                          <div
                            style={{ top: menuPos.top, right: menuPos.right }}
                            className="fixed w-36 rounded-xl border border-[#232D52] bg-[#121831] p-1.5 shadow-2xl z-50 text-xs"
                          >
                            {onToggleStatus && (
                              <button
                                onClick={() => {
                                  setActionMenuOpenId(null);
                                  onToggleStatus(row);
                                }}
                                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left"
                              >
                                <UserX className="w-3.5 h-3.5 text-amber-400" />
                                Toggle Status
                              </button>
                            )}

                            {onDelete && (
                              <button
                                onClick={(e) => handleDeletePrompt(e, row)}
                                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-rose-400 hover:bg-rose-500/15 rounded-lg text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#1E2648] bg-[#0E1428] text-xs text-slate-400">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-200 font-mono">
            {data.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, data.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-200 font-mono">{data.length}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#232D52] hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-1 text-slate-300 font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#232D52] hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
