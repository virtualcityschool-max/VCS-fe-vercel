import React from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { EmptyState } from '../components/common/EmptyState';
import { TeacherMeeting } from '../types';
import { Video, Plus, ExternalLink } from 'lucide-react';

export const PTMMeetingsView: React.FC = () => {
  const { meetings, addMeeting, timezone, can } = useApp() as any;

  const columns: Column<TeacherMeeting>[] = [
    {
      header: 'Staff Meeting & Agenda',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-100">{row.title}</div>
          <div className="text-xs text-slate-400 mt-0.5 max-w-sm truncate">{row.topic}</div>
        </div>
      ),
    },
    {
      header: 'Teachers invited',
      cell: (row: any) => <span className="font-semibold text-slate-200 text-xs">{row.invitedNames || '—'}</span>,
    },
    {
      header: `Date & Time (${timezone.split(' ')[0]})`,
      cell: (row) => (
        <div className="font-mono text-xs">
          <div className="text-slate-200 font-bold">{row.date}</div>
          <div className="text-indigo-400">{row.time} ({row.durationMinutes}m)</div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Google Meet',
      cell: (row) =>
        row.meetLink ? (
          <a
            href={row.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:underline"
          >
            <span>Launch Meet</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-slate-500 text-xs">None</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Staff Meetings"
        subtitle="Meetings between the school admin team and teachers, with their Google Meet links."
        primaryAction={can('manage_academics') ? {
          label: 'Schedule staff meeting',
          onClick: () => addMeeting(),
          icon: Plus,
        } : undefined}
      />

      {meetings.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No staff meetings yet"
          description="Staff meetings you schedule with teachers appear here."
          actionLabel={can('manage_academics') ? 'Schedule staff meeting' : undefined}
          onAction={can('manage_academics') ? () => addMeeting() : undefined}
        />
      ) : (
        <DataTable columns={columns} data={meetings} />
      )}

    </div>
  );
};
