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
  const { parents, students, openDetailDrawer, addParent, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [newParentModalOpen, setNewParentModalOpen] = useState(false);

  // New parent form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const filtered = parents.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const done = await addParent({ name: name.trim(), email: email.trim(), password });
    if (done === false) return;
    setNewParentModalOpen(false);
    setName('');
    setEmail('');
    setPassword('');
  };

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
          onClick: () => setNewParentModalOpen(true),
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

      {/* New Parent Modal */}
      {newParentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-slate-100">Register Parent / Guardian</h3>

            <form onSubmit={handleCreateParent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Guardian Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Temporary password *</label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Share it with the parent. They link their children from their own portal, and you approve the link under Pending Approvals.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2648]">
                <button
                  type="button"
                  onClick={() => setNewParentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white"
                >
                  Create Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
