import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { Parent } from '../types';
import {
  HeartHandshake,
  MessageCircle,
  ExternalLink,
  Phone,
  UserPlus,
  GraduationCap,
} from 'lucide-react';

export const ParentsView: React.FC = () => {
  const { parents, students, openDetailDrawer, openQuickAdd } = useApp() as any;
  const [searchQuery, setSearchQuery] = useState('');
  const filtered = parents.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const columns: Column<Parent>[] = [
    {
      header: 'Parent / Guardian',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name[0]}
          </div>
          <div className="truncate">
            <div className="font-semibold text-slate-100">{row.name}</div>
            <div className="text-[11px] text-slate-400 font-mono truncate">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone & WhatsApp',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-300">{row.phone}</span>
          {row.whatsappNumber && (
            <a
              href={`https://wa.me/${row.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors flex items-center gap-1 text-[11px]"
              title="Click to chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      ),
    },
    {
      header: 'Linked Children',
      cell: (row) => {
        const linked = students.filter((s) => row.linkedStudentIds.includes(s.id));
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {linked.map((s) => (
              <span
                key={s.id}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1"
              >
                <GraduationCap className="w-3 h-3" />
                <span>{s.name}</span>
                <span className="font-mono text-[10px] text-indigo-400">({s.rollNo})</span>
              </span>
            ))}
            {linked.length === 0 && (
              <span className="text-slate-500 text-[11px] italic">No linked children</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Location',
      cell: (row) => <span className="text-xs text-slate-400">{row.location}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Parents & Guardians"
        subtitle="Maintain direct guardian communication, progress monitoring, and WhatsApp accountability."
        primaryAction={{
          label: 'New parent',
          onClick: () => openQuickAdd('parent' as any),
          icon: UserPlus,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search parent name, email, or city..."
      />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => openDetailDrawer('parent', row)}
      />

    </div>
  );
};
