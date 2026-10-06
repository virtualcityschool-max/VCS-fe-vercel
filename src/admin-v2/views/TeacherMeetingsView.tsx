import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusPill } from '../components/common/StatusPill';
import { EmptyState } from '../components/common/EmptyState';
import { TeacherMeeting } from '../types';
import { Video, Plus, Calendar, Clock, ExternalLink } from 'lucide-react';

export const TeacherMeetingsView: React.FC = () => {
  const { meetings, teachers, parents, students, addMeeting, timezone, addToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  // New meeting form
  const [title, setTitle] = useState('');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [parentId, setParentId] = useState(parents[0]?.id || '');
  const [date, setDate] = useState('2026-10-06');
  const [time, setTime] = useState('17:00');
  const [topic, setTopic] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMeeting({
      title: title.trim(),
      teacherId,
      parentId,
      date,
      time,
      durationMinutes: 25,
      status: 'Scheduled',
      topic: topic || 'Academic progress & assessment feedback',
      meetLink: 'https://meet.google.com/vcs-consultation',
    });

    setModalOpen(false);
    setTitle('');
    setTopic('');
  };

  const columns: Column<TeacherMeeting>[] = [
    {
      header: 'Consultation Title & Topic',
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
      header: 'Parent / Student',
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
      header: 'Meet Link',
      cell: (row) =>
        row.meetLink ? (
          <a
            href={row.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:underline"
          >
            <span>Google Meet</span>
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
        title="Teacher Meetings & Consultations"
        subtitle="One-on-one parent conferences, academic counseling, and student diagnostic slots."
        primaryAction={{
          label: 'Schedule meeting',
          onClick: () => setModalOpen(true),
          icon: Plus,
        }}
      />

      {meetings.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No upcoming consultation meetings"
          description="When parents book progress reviews or teachers schedule diagnostic sessions, they will be tracked here."
          actionLabel="Schedule first meeting"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={meetings} />
      )}

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-slate-100">Schedule Parent-Teacher Meeting</h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cambridge IGCSE Math Diagnostic Review"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Teacher</label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Parent</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time ({timezone.split(' ')[0]})</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Discussion Agenda / Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Review test scores and past paper strategy..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2648]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white"
                >
                  Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
