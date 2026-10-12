import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, Bolt, Hourglass, CheckCircle2, Copy, Check, Users, Sparkles, BookOpen, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { inputCls, Field } from './FormControls';
import { adminSessionService } from '../../../services/adminSessionService';
import { toastManager } from '../../../utils/toastManager';

export const AdminPlanClassModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdSession: any) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const { subjects = [], teachers = [], rawCourses = [], levelOptions = [], reload, tzIana, addToast } = useApp() as any;

  // Active scheduling mode: 'scheduled' | 'now' | 'delayed'
  const [mode, setMode] = useState<'scheduled' | 'now' | 'delayed'>('scheduled');

  // Filter state for quickly selecting courses
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  // Scheduling fields
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [scheduledDate, setScheduledDate] = useState<string>(todayStr);
  const [scheduledTime, setScheduledTime] = useState<string>('16:00');
  const [isRecurring, setIsRecurring] = useState<boolean>(true);

  // Delayed start fields
  const [delayMinutes, setDelayMinutes] = useState<number>(30);

  // States
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdSession, setCreatedSession] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Derive distinct levels/categories from courses & subjects
  const availableLevels = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s: any) => {
      if (s.level) set.add(s.level);
    });
    rawCourses.forEach((c: any) => {
      if (c.category?.name) set.add(c.category.name);
      if (c.level) set.add(c.level);
    });
    return Array.from(set);
  }, [subjects, rawCourses]);

  // Filter courses by the selected level/category
  const filteredCourses = useMemo(() => {
    const list = rawCourses.length > 0 ? rawCourses : subjects;
    if (selectedLevel === 'all') return list;
    return list.filter((c: any) => {
      const lvl = (c.category?.name || c.level || '').toLowerCase();
      return lvl.includes(selectedLevel.toLowerCase());
    });
  }, [rawCourses, subjects, selectedLevel]);

  // When course changes: auto-fill Title and Teacher!
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    if (!courseId) return;

    // Find course object
    const course = (rawCourses.length > 0 ? rawCourses : subjects).find(
      (c: any) => String(c.id) === String(courseId)
    );

    if (course) {
      // Auto-set title
      const courseName = course.title || course.name || 'Live Class';
      setTitle(`${courseName} - Live Class`);

      // Auto-set teacher if assigned
      const teacherId = course.instructor?.id || course.teacherId || course.teacher?.id;
      if (teacherId) {
        setSelectedTeacherId(String(teacherId));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toastManager.error('Please select a course.');
      return;
    }

    setSubmitting(true);
    try {
      let isoDateTime = '';
      if (mode === 'now') {
        isoDateTime = new Date().toISOString();
      } else if (mode === 'delayed') {
        isoDateTime = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
      } else {
        // Scheduled mode: combine scheduledDate and scheduledTime in AST/UTC
        const [hours, mins] = scheduledTime.split(':').map(Number);
        const dt = new Date(`${scheduledDate}T${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`);
        isoDateTime = dt.toISOString();
      }

      const payload: any = {
        course: Number(selectedCourseId),
        title: title.trim() || 'Live Class',
        scheduled_at: isoDateTime,
        is_recurring: mode === 'scheduled' ? isRecurring : false,
      };

      if (selectedTeacherId) {
        payload.instructor_id = Number(selectedTeacherId);
      }

      // Backend auto-creates the Google Meet link through Google Calendar
      const result = await adminSessionService.createSession(payload);
      
      setCreatedSession(result);
      reload('sessions');
      if (addToast) addToast('Class planned successfully!', 'success');
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Failed to schedule class';
      toastManager.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (createdSession?.meeting_link) {
      navigator.clipboard.writeText(createdSession.meeting_link);
      setCopiedLink(true);
      toastManager.success('Google Meet link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleClose = () => {
    setCreatedSession(null);
    setSelectedCourseId('');
    setSelectedTeacherId('');
    setTitle('');
    setCopiedLink(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#232D52] bg-[#101428] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2648] bg-[#0E1326]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Class</h3>
              <p className="text-[11px] text-slate-400">Plan a lecture with auto-generated Google Meet & Calendar attendee sync</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View when Class is Created */}
        {createdSession ? (
          <div className="p-6 space-y-5 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Class Created Successfully!</h4>
                <p className="text-xs text-slate-300 mt-1">{createdSession.title}</p>
              </div>
            </div>

            {createdSession.meeting_link && (
              <div className="p-4 rounded-xl bg-[#0B0F20] border border-[#232D52] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Google Meet Link</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Ready to share on WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdSession.meeting_link}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-black/40 border border-[#1E2648] text-slate-200 select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E8] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-md"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                Done · View in Live Planned Classes
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
            
            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#090D1C] border border-[#1A2242]">
              <button
                type="button"
                onClick={() => setMode('scheduled')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'scheduled' ? 'bg-[#6D5BFF] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Scheduled</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('now')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'now' ? 'bg-[#6D5BFF] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bolt className="w-3.5 h-3.5" />
                <span>Start Now</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('delayed')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'delayed' ? 'bg-[#6D5BFF] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Hourglass className="w-3.5 h-3.5" />
                <span>Delayed Start</span>
              </button>
            </div>

            {/* Quick Level Filter Pills */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Select Academic Level (Filters Courses Below)
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedLevel('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedLevel === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-[#151C36] text-slate-400 hover:text-slate-200 border border-[#232D52]'
                  }`}
                >
                  All Courses ({rawCourses.length || subjects.length})
                </button>
                {availableLevels.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-[#151C36] text-slate-400 hover:text-slate-200 border border-[#232D52]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Course & Teacher Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="2. Course / Subject" required hint="Picking a course auto-fills the instructor and title">
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="">-- Choose Course ({filteredCourses.length} available) --</option>
                  {filteredCourses.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.title || c.name} {c.category?.name ? `(${c.category.name})` : ''}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Assigned Teacher" hint="Auto-filled from course, but can be customized">
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="">-- Auto-filled from course --</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.username} {t.email ? `(${t.email})` : ''}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Session Title */}
            <Field label="3. Class Title" required hint="Defaulted automatically from the course">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Add Math O Level - Unit 3 Lecture"
                className={inputCls}
              />
            </Field>

            {/* Mode-specific Fields */}
            {mode === 'scheduled' && (
              <div className="p-4 rounded-xl bg-[#0E1428] border border-[#232D52] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Schedule Time & Date</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-mono">
                    Zone: AST (Arabia Standard Time)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Start Date" required hint="Defaults to today; click to change">
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Start Time (AST)" required hint="Time in Saudi Arabia / AST">
                    <input
                      type="time"
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                  <span>Recurring weekly class on this day</span>
                </label>
              </div>
            )}

            {mode === 'delayed' && (
              <div className="p-4 rounded-xl bg-[#0E1428] border border-[#232D52] space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Start Delay</div>
                <Field label="Delay (Minutes from now)" required>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(Number(e.target.value))}
                    className={inputCls}
                  />
                </Field>
                <p className="text-[11px] text-slate-400">
                  Class will open in <b className="text-white">{delayMinutes} minutes</b> from now.
                </p>
              </div>
            )}

            {mode === 'now' && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
                <Bolt className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>This class will be created immediately with Google Meet ready. Teacher and students can enter right away.</span>
              </div>
            )}

            {/* Informative Notice (No manual Google Meet field!) */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Google Meet conference is automatically created and all enrolled students are auto-synced as calendar attendees.</span>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#1E2648] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="disabled:opacity-60 px-5 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? 'Creating Class…' : 'Create & Schedule Class'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default AdminPlanClassModal;
