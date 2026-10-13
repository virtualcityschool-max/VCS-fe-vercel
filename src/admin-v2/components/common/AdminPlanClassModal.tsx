import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Bolt,
  Hourglass,
  CheckCircle2,
  Copy,
  Check,
  Users,
  Sparkles,
  BookOpen,
  Layers,
  Repeat,
  ShieldCheck,
  Info,
} from 'lucide-react';
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
  const [recurrenceWeeks, setRecurrenceWeeks] = useState<'1' | '2' | '3' | '4' | 'custom'>('1');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const timeInputRef = React.useRef<HTMLInputElement>(null);
  const customEndDateRef = React.useRef<HTMLInputElement>(null);

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

  // Calculate day code, full name, and formatted start date from scheduledDate
  const { dayCode, dayFullName, formattedStartDate } = useMemo(() => {
    if (!scheduledDate) return { dayCode: 'MON', dayFullName: 'Monday', formattedStartDate: '' };
    const parts = scheduledDate.split('-').map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const fullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIdx = d.getUTCDay();
    return {
      dayCode: dayNames[dayIdx],
      dayFullName: fullNames[dayIdx],
      formattedStartDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
    };
  }, [scheduledDate]);

  // Calculate series recurrence end date
  const calculatedEndDate = useMemo(() => {
    if (!scheduledDate) return '';
    if (recurrenceWeeks === 'custom') {
      return customEndDate || scheduledDate;
    }
    const parts = scheduledDate.split('-').map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
    const weeks = Number(recurrenceWeeks) || 1;
    d.setUTCDate(d.getUTCDate() + weeks * 7);
    return d.toISOString().split('T')[0];
  }, [scheduledDate, recurrenceWeeks, customEndDate]);

  // Formatted display of end date
  const formattedEndDate = useMemo(() => {
    if (!calculatedEndDate) return '';
    const parts = calculatedEndDate.split('-').map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }, [calculatedEndDate]);

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
        // Scheduled mode: combine scheduledDate and scheduledTime in AST (UTC+3)
        const [hours, mins] = scheduledTime.split(':').map(Number);
        const dt = new Date(`${scheduledDate}T${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00+03:00`);
        isoDateTime = dt.toISOString();
      }

      const payload: any = {
        course: Number(selectedCourseId),
        title: title.trim() || 'Live Class',
        scheduled_at: isoDateTime,
        is_recurring: mode === 'scheduled' ? isRecurring : false,
      };

      if (mode === 'scheduled' && isRecurring) {
        payload.recurrence_days = [dayCode];
        payload.recurrence_end_date = calculatedEndDate;
      }

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

            {/* Row 1: Academic Level Dropdown & Course Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="1. Academic Level / Class" hint="Select level to narrow down courses">
                <select
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    setSelectedCourseId('');
                  }}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="all">-- All Academic Levels ({rawCourses.length || subjects.length} courses) --</option>
                  {availableLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="2. Course / Subject" required hint="Picking a course auto-fills instructor & title">
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
            </div>

            {/* Row 2: Assigned Teacher & Class Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="3. Assigned Teacher" hint="Auto-filled from course, but can be customized">
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

              <Field label="4. Class Title" required hint="Defaulted automatically from the course">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Add Math O Level - Unit 3 Lecture"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Mode-specific Fields */}
            {mode === 'scheduled' && (
              <div className="p-4 rounded-xl bg-[#0E1428] border border-[#232D52] space-y-4">
                <style>{`
                  .vcs-picker-box {
                    background-color: #172146 !important;
                    border: 2px solid #3B4E85 !important;
                    transition: all 0.2s ease !important;
                  }
                  .vcs-picker-box:hover, .vcs-picker-box:focus-within {
                    border-color: #6366F1 !important;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3) !important;
                    background-color: #1A2652 !important;
                  }
                  .vcs-picker-box input {
                    color-scheme: dark !important;
                  }
                  .vcs-picker-box input::-webkit-calendar-picker-indicator {
                    filter: invert(1) brightness(1.8) !important;
                    cursor: pointer !important;
                    opacity: 1 !important;
                    background-color: #4F46E5 !important;
                    border-radius: 6px !important;
                    padding: 5px !important;
                    transform: scale(1.15) !important;
                    transition: all 0.2s ease !important;
                  }
                  .vcs-picker-box input::-webkit-calendar-picker-indicator:hover {
                    background-color: #6366F1 !important;
                    transform: scale(1.25) !important;
                  }
                `}</style>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Schedule Time & Date</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 font-mono font-bold">
                    Zone: AST (Arabia Standard Time · UTC+3)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Start Date" required hint={formattedStartDate ? `Selected: ${formattedStartDate}` : 'Defaults to today; click to change'}>
                    <div
                      onClick={() => {
                        try { dateInputRef.current?.showPicker?.(); } catch (_) { dateInputRef.current?.focus(); }
                      }}
                      className="vcs-picker-box relative flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/25 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                          <Calendar className="w-4 h-4 text-indigo-300" />
                        </div>
                        <input
                          ref={dateInputRef}
                          type="date"
                          required
                          min={todayStr}
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full bg-transparent text-white font-bold text-sm tracking-wide outline-none cursor-pointer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          try { dateInputRef.current?.showPicker?.(); } catch (_) { dateInputRef.current?.focus(); }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/30 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border border-indigo-400/30"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Pick Date</span>
                      </button>
                    </div>
                  </Field>

                  <Field label="Start Time (AST)" required hint="Time in Saudi Arabia / AST (24h or AM/PM)">
                    <div
                      onClick={() => {
                        try { timeInputRef.current?.showPicker?.(); } catch (_) { timeInputRef.current?.focus(); }
                      }}
                      className="vcs-picker-box relative flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/25 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                          <Clock className="w-4 h-4 text-indigo-300" />
                        </div>
                        <input
                          ref={timeInputRef}
                          type="time"
                          required
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full bg-transparent text-white font-bold text-sm tracking-wide outline-none cursor-pointer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          try { timeInputRef.current?.showPicker?.(); } catch (_) { timeInputRef.current?.focus(); }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/30 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border border-indigo-400/30"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pick Time</span>
                      </button>
                    </div>
                  </Field>
                </div>

                {/* Class Frequency: Single vs Recurring */}
                <div className="space-y-3 pt-2 border-t border-[#1E2648]">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Class Frequency
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsRecurring(false)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        !isRecurring
                          ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-sm ring-1 ring-indigo-400/50'
                          : 'bg-[#0B0F20] border-[#1E2648] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        !isRecurring ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                      }`}>
                        {!isRecurring && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Single Class (One-Off)</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Runs once on {formattedStartDate || 'selected date'} only</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRecurring(true)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isRecurring
                          ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-sm ring-1 ring-indigo-400/50'
                          : 'bg-[#0B0F20] border-[#1E2648] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isRecurring ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                      }`}>
                        {isRecurring && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Weekly Series</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/25 text-indigo-300 font-bold border border-indigo-400/30">Active</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Repeats every {dayFullName} at {scheduledTime} AST</div>
                      </div>
                    </button>
                  </div>

                  {/* Recurring Series Duration Options */}
                  {isRecurring && (
                    <div className="p-3.5 rounded-xl bg-[#090D1C] border border-[#1E2648] space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Repeat className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Series Length (Weeks)</span>
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          Every {dayFullName} until {formattedEndDate}
                        </span>
                      </div>

                      {/* 1 Week (Default), 2 Weeks, 3 Weeks, 4 Weeks, Custom */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {[
                          { key: '1', label: '1 Week', sub: 'Default (2 classes)' },
                          { key: '2', label: '2 Weeks', sub: '3 classes total' },
                          { key: '3', label: '3 Weeks', sub: '4 classes total' },
                          { key: '4', label: '4 Weeks', sub: '1 Month (5 classes)' },
                          { key: 'custom', label: 'Custom', sub: 'Pick End Date' },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setRecurrenceWeeks(opt.key as any)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              recurrenceWeeks === opt.key
                                ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-md shadow-indigo-600/30 ring-1 ring-white/20'
                                : 'bg-[#141C3C] text-slate-300 hover:text-white hover:bg-[#1A2552] border-[#2A396A]'
                            }`}
                          >
                            <div className="text-xs font-bold leading-tight">{opt.label}</div>
                            <div className="text-[10px] opacity-80 mt-1 leading-tight">{opt.sub}</div>
                          </button>
                        ))}
                      </div>

                      {recurrenceWeeks === 'custom' && (
                        <div className="pt-1">
                          <Field label="Custom Series End Date" required hint="Must be on or after start date">
                            <div
                              onClick={() => {
                                try { customEndDateRef.current?.showPicker?.(); } catch (_) { customEndDateRef.current?.focus(); }
                              }}
                              className="vcs-picker-box relative flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer shadow-sm"
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/25 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                                  <Calendar className="w-4 h-4 text-indigo-300" />
                                </div>
                                <input
                                  ref={customEndDateRef}
                                  type="date"
                                  required
                                  min={scheduledDate}
                                  value={customEndDate || calculatedEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  className="w-full bg-transparent text-white font-bold text-sm tracking-wide outline-none cursor-pointer"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try { customEndDateRef.current?.showPicker?.(); } catch (_) { customEndDateRef.current?.focus(); }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/30 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border border-indigo-400/30"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Pick Date</span>
                              </button>
                            </div>
                          </Field>
                        </div>
                      )}

                      {/* Google Meet & Timetable Safety Notice */}
                      <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200/90 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          <span>Google Meet Safe · Single Master Meeting Room</span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-slate-300 pl-5">
                          All weekly classes in this series share <b>1 master Google Meet room ID</b> on Google Calendar. Google Meet creation limits are never exceeded. All future lectures across the series are placed immediately on the timetable upon creation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
