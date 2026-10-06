import React from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { EmptyState } from '../components/common/EmptyState';
import { TeacherMeeting } from '../types';
import { Video, Plus, Calendar, Clock, ExternalLink } from 'lucide-react';

export const PTMMeetingsView: React.FC = () => {
  const { meetings, teachers, parents, students, addMeeting, timezone, addToast } = useApp();

  const columns: Column<TeacherMeeting>[] = [
    {
      header: 'PTM Conference Title & Agenda',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-100">{row.title}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm truncate">{row.topic}</div>
        </div>
      ),
    },
    {
      header: 'Teacher',
      cell: (row) => {
        const teacher = teachers.find((t) => t.id === row.teacherId);
        return <span className="font-semibold text-slate-200 text-xs">{teacher?.name || 'Tutor'}</span>;
      },
    },
    {
      header: 'Parent / Guardian',
      cell: (row) => {
        const parent = parents.find((p) => p.id === row.parentId);
        return <span className="text-xs text-indigo-300 font-medium">{parent?.name || 'Guardian'}</span>;
      },
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
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="PTM Meetings & Conferences"
        subtitle="Schedule and track one-on-one parent-teacher conferences, academic counseling, and student diagnostic feedback."
        primaryAction={{
          label: 'Schedule PTM meeting',
          onClick: () => addMeeting(),
          icon: Plus,
        }}
      />

      {meetings.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No upcoming PTM meetings"
          description="When parents book progress reviews or teachers schedule diagnostic sessions, they will be tracked here."
          actionLabel="Schedule first meeting"
          onAction={() => addMeeting()}
        />
      ) : (
        <DataTable columns={columns} data={meetings} />
      )}

      {/* Schedule Modal */}
    </div>
  );
};
