import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { EmptyState } from '../components/common/EmptyState';
import { Field, SelectInput } from '../components/common/FormControls';
import { BaseUser } from '../types';
import { STAFF_ROLES, staffRoleLabel } from '../data/staffRoles';
import { Shield, UserPlus, Pencil, X } from 'lucide-react';

// Staff accounts only. Students, teachers and parents live in their own
// registers. Staff roles change through the edit form (Super Admin only).
export const AdminUsersView: React.FC = () => {
  const { allUsers, updateStaffRole, toggleUserStatus, openQuickAdd, isSuperAdmin, profile } = useApp() as any;
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [newRole, setNewRole] = useState('');
  const [saving, setSaving] = useState(false);

  const staff = allUsers.filter((u: any) => u.role === 'admin');
  const filtered = staff.filter((u: any) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || staffRoleLabel(u.adminRole).toLowerCase().includes(q);
  });

  const isMe = (row: any) => String(row.id) === String(profile?.id);

  const columns: Column<BaseUser>[] = [
    {
      header: 'Staff member',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <Shield className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="font-semibold text-slate-100">{row.name}{isMe(row) ? ' (you)' : ''}</div>
            <div className="text-[11px] text-slate-400 font-mono truncate">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Staff role',
      cell: (row: any) => (
        <div>
          <div className="text-xs font-semibold text-indigo-200">{staffRoleLabel(row.adminRole)}</div>
          <div className="text-[11px] text-slate-500 max-w-xs truncate">{STAFF_ROLES.find((r) => r.id === row.adminRole)?.allowed || 'No access until a role is set'}</div>
        </div>
      ),
    },
    {
      header: 'Added',
      cell: (row) => <span className="font-mono text-xs text-slate-400">{row.createdAt}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      header: '',
      cell: (row: any) => (isSuperAdmin && !isMe(row) && !row.isSuperuser ? (
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(row); setNewRole(row.adminRole || ''); }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#232D52] text-xs text-slate-300 hover:text-white hover:border-[#6D5BFF]"
        >
          <Pencil className="w-3 h-3" /> Edit role
        </button>
      ) : null),
    },
  ];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !newRole) return;
    setSaving(true);
    const ok = await updateStaffRole(editing.id, newRole, staffRoleLabel(newRole));
    setSaving(false);
    if (ok) setEditing(null);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Staff & Roles"
        subtitle="School staff accounts and what each role may do. Students, teachers and parents are in their own registers."
        primaryAction={isSuperAdmin ? { label: 'Add staff member', onClick: () => openQuickAdd('admin' as any), icon: UserPlus } : undefined}
      />

      <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search staff by name, email or role…" filters={[]} />

      {filtered.length === 0 ? (
        <EmptyState icon={Shield} title="No staff accounts found" description={staff.length ? 'No staff match this search.' : 'Add a staff member to give them access to this panel.'} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          onToggleStatus={isSuperAdmin ? (row: any) => (isMe(row) || row.isSuperuser ? undefined : toggleUserStatus(row.id)) : undefined}
        />
      )}

      <div className="rounded-2xl border border-[#232D52] bg-[#121831] p-5">
        <div className="text-sm font-bold text-slate-100 mb-3">What each role can do</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-[#1E2648]">
                <th className="py-2 pr-4">Role</th><th className="py-2 pr-4">Allowed</th><th className="py-2">Not allowed</th>
              </tr>
            </thead>
            <tbody>
              {STAFF_ROLES.map((r) => (
                <tr key={r.id} className="border-b border-[#1E2648]/60 align-top">
                  <td className="py-2 pr-4 font-semibold text-slate-200 whitespace-nowrap">{r.label}</td>
                  <td className="py-2 pr-4 text-slate-300">{r.allowed}</td>
                  <td className="py-2 text-slate-400">{r.notAllowed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Only a Super Admin can delete permanently; everyone else can deactivate or archive. Free access and scholarships need two people:
          Admissions recommends, then Finance or a Super Admin approves. The server checks every action, not just the menu.
        </p>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <form onSubmit={save} className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Edit staff role: {editing.name}</h3>
              <button type="button" onClick={() => setEditing(null)} className="p-1 rounded-lg text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <Field label="Staff role" required hint={STAFF_ROLES.find((r) => r.id === newRole)?.allowed}>
              <SelectInput value={newRole} onChange={setNewRole} placeholder="Choose a role…" required options={STAFF_ROLES.map((r) => ({ value: r.id, label: r.label }))} />
            </Field>
            <p className="text-[11px] text-slate-400">Currently: {staffRoleLabel(editing.adminRole)}. You will be asked to confirm.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200">Cancel</button>
              <button type="submit" disabled={saving || !newRole || newRole === editing.adminRole} className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6D5BFF] text-white disabled:opacity-50">Save role</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
