import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, GraduationCap, BookOpen, Calendar, FileText } from 'lucide-react';
import { AcademicLevel, DepartmentName } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    quickAddModal,
    closeQuickAdd,
    addStudent,
    addTeacher,
    addSubject,
    addSession,
    addPost,
    subjects,
    teachers,
    levels,
    addAdmin,
  } = useApp();

  const [activeType, setActiveType] = useState<'student' | 'teacher' | 'admin' | 'subject' | 'session' | 'post'>('student');

  useEffect(() => {
    if (quickAddModal.isOpen) {
      setActiveType(quickAddModal.initialType || 'student');
    }
  }, [quickAddModal.isOpen, quickAddModal.initialType]);

  // Student form state
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentLevel, setStudentLevel] = useState<AcademicLevel>('IGCSE');
  const [studentGuardian, setStudentGuardian] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentSubjectId, setStudentSubjectId] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Teacher form state
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherDept, setTeacherDept] = useState<DepartmentName>('Mathematics');
  const [teacherQual, setTeacherQual] = useState('');
  const [teacherExp, setTeacherExp] = useState(5);
  const [teacherHours, setTeacherHours] = useState(15);
  const [teacherPhone, setTeacherPhone] = useState('');

  // Subject form state
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subDept, setSubDept] = useState<DepartmentName>('Mathematics');
  const [subLevel, setSubLevel] = useState<AcademicLevel>('' as AcademicLevel);
  const [subTeacherId, setSubTeacherId] = useState('');
  const [subPrice, setSubPrice] = useState(120);

  // Session form state
  const [sessTitle, setSessTitle] = useState('');
  const [sessSubId, setSessSubId] = useState('');
  const [sessTeacherId, setSessTeacherId] = useState('');
  const [sessStart, setSessStart] = useState('16:00');
  const [sessEnd, setSessEnd] = useState('17:00');
  const [sessMeetLink, setSessMeetLink] = useState('https://meet.google.com/vcs-session');

  // Post form state
  const [postTitle, setPostTitle] = useState('');
  const [postType, setPostType] = useState<'Article' | 'Video'>('Article');
  const [postCategory, setPostCategory] = useState('Cambridge Tips');
  const [postAuthor, setPostAuthor] = useState('VCS Academic Team');
  const [postDuration, setPostDuration] = useState('5 min read');

  if (!quickAddModal.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeType === 'session') { closeQuickAdd(); addSession(); return; }
    if (activeType === 'post') { closeQuickAdd(); addPost({ type: 'Article' }); return; }
    setSaving(true);
    let ok: any = false;
    if (activeType === 'student') {
      ok = await addStudent({ name: studentName, email: studentEmail, password, subjectId: studentSubjectId });
    } else if (activeType === 'teacher') {
      ok = await addTeacher({ name: teacherName, email: teacherEmail, password });
    } else if (activeType === 'admin') {
      ok = await addAdmin({ name: teacherName, email: teacherEmail, password });
    } else if (activeType === 'subject') {
      const title = subCode.trim() && !subName.includes(subCode.trim()) ? `${subName.trim()} (${subCode.trim()})` : subName.trim();
      ok = await addSubject({ name: title, level: subLevel, teacherId: subTeacherId, priceUSD: Number(subPrice), status: subTeacherId ? 'Published' : 'Draft' });
    }
    setSaving(false);
    if (ok) {
      setPassword('');
      closeQuickAdd();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#232D52] bg-[#121831] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2648] bg-[#0E1428]">
          <h3 className="text-base font-bold text-slate-100">Quick Add Record</h3>
          <button
            onClick={closeQuickAdd}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entity Selector Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-[#0A0F22] border-b border-[#1E2648] overflow-x-auto">
          {[
            { id: 'student', label: 'Student', icon: UserPlus },
            { id: 'teacher', label: 'Teacher', icon: GraduationCap },
            ...(quickAddModal.initialType === ('admin' as any) ? [{ id: 'admin', label: 'Admin', icon: UserPlus }] : []),
            { id: 'subject', label: 'Subject', icon: BookOpen },
            { id: 'session', label: 'Class Session', icon: Calendar },
            { id: 'post', label: 'Blog / Video', icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveType(item.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#6D5BFF] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeType === 'student' && (
            <>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="block font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
                <div>
                <label className="block font-medium text-slate-300 mb-1">Temporary Password *</label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min. 8 characters"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Share the password with them privately; they can change it after logging in. Use their Gmail so they join Google Meet classes without waiting.
              </p>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Enroll in a first subject (optional)</label>
                <select
                  value={studentSubjectId}
                  onChange={(e) => setStudentSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">No subject yet</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.level || 'no level'})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeType === 'teacher' && (
            <>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="block font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
                <div>
                <label className="block font-medium text-slate-300 mb-1">Temporary Password *</label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min. 8 characters"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Share the password with them privately; they can change it after logging in. Use their Gmail so they join Google Meet classes without waiting.
              </p>
              <p className="text-[11px] text-slate-400">
                Qualifications, experience and subjects are added on the teacher's profile and in Teacher Allocations.
              </p>
            </>
          )}

          {activeType === 'admin' && (
            <>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="block font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
                <div>
                <label className="block font-medium text-slate-300 mb-1">Temporary Password *</label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min. 8 characters"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Share the password with them privately; they can change it after logging in. Use their Gmail so they join Google Meet classes without waiting.
              </p>
              <p className="text-[11px] text-slate-400">
                Admins can see and change everything in this panel. Only add staff you trust.
              </p>
            </>
          )}

          {activeType === 'subject' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Cambridge Code (optional)</label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="0580"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="e.g. IGCSE Mathematics Extended"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <p className="text-[11px] text-slate-400 self-end pb-2">Department is worked out from the subject name.</p>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Level</label>
                  <select
                    required
                    value={subLevel}
                    onChange={(e) => setSubLevel(e.target.value as AcademicLevel)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {!levels.includes(subLevel) && <option value="">Choose a level</option>}
                    {levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Assigned Teacher</label>
                  <select
                    value={subTeacherId}
                    onChange={(e) => setSubTeacherId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">No teacher yet (saved as draft)</option>
                    {[...teachers].sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Monthly Fee (USD)</label>
                  <input
                    type="number"
                    value={subPrice}
                    onChange={(e) => setSubPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {(activeType === 'session' || activeType === 'post') && (
            <div className="p-4 rounded-xl border border-[#232D52] bg-[#0E1428] space-y-2 text-slate-300">
              <p className="text-sm font-semibold text-slate-100">
                {activeType === 'session' ? 'Plan a class in the class planner' : 'Write a blog post or video in the editor'}
              </p>
              <p className="text-xs text-slate-400">
                {activeType === 'session'
                  ? 'Creating a class books it in Google Calendar, makes the Meet link and invites enrolled students, so it uses the full planner with recurrence and student options.'
                  : 'The editor has the cover image, rich text and video link fields.'}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#1E2648] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeQuickAdd}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="disabled:opacity-60 px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {activeType === 'session' ? 'Open class planner' : activeType === 'post' ? 'Open editor' : saving ? 'Saving…' : 'Save & Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
