import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { BaseUser, UserRole } from '../types';
import { ShieldCheck, UserX, UserCheck, Shield } from 'lucide-react';

export const AllUsersView: React.FC = () => {
  const { allUsers, updateUserRole, toggleUserStatus, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filters: FilterConfig[] = [
    {
      id: 'role',
      label: 'Role',
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { label: 'Admin', value: 'admin', count: allUsers.filter((u) => u.role === 'admin').length },
        { label: 'Teacher', value: 'teacher', count: allUsers.filter((u) => u.role === 'teacher').length },
        { label: 'Student', value: 'student', count: allUsers.filter((u) => u.role === 'student').length },
        { label: 'Parent', value: 'parent', count: allUsers.filter((u) => u.role === 'parent').length },
      ],
    },
  ];

  const filtered = allUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns: Column<BaseUser>[] = [
    {
      header: 'User Account',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name[0]}
          </div>
          <div className="truncate">
            <div className="font-semibold text-slate-100 flex items-center gap-2">
              <span>{row.name}</span>
              {row.role === 'admin' && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500 text-white font-mono font-bold flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  ADMIN
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role Assignment',
      cell: (row) => (
        <select
          value={row.role}
          onChange={(e) => updateUserRole(row.id, e.target.value as UserRole)}
          className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold rounded-lg border border-[#232D52] bg-[#0E1428] text-slate-200 hover:border-slate-500 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
      ),
    },
    {
      header: 'Created Date',
      cell: (row) => <span className="font-mono text-xs text-slate-400">{row.createdAt}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="All Users & Roles"
        subtitle="Unified user identity management, role-based permissions, and account activation controls."
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search all user accounts by name or email..."
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={filtered}
        onToggleStatus={(row) => toggleUserStatus(row.id)}
      />
    </div>
  );
};
