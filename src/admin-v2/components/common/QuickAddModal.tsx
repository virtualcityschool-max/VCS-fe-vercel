import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, GraduationCap, BookOpen, Calendar, FileText, Users, ShieldCheck } from 'lucide-react';
import {
  CAMBRIDGE_SUBJECTS,
  COUNTRIES,
  EXPERIENCE_YEARS,
  FEE_PRESETS,
  GENDERS,
  GUARDIAN_RELATIONSHIPS,
  LEARNING_GOALS,
  QUALIFICATIONS,
  SUBJECT_AREAS,
  TIMEZONES,
  countryByName,
} from '../../data/formOptions';
import { Field, FormSection, MultiPick, PasswordField, PhoneField, SelectInput, fullPhone, inputCls } from './FormControls';

type QuickType = 'student' | 'teacher' | 'parent' | 'admin' | 'subject' | 'session' | 'post';

const DEFAULT_COUNTRY = 'Saudi Arabia';

// Country, timezone and WhatsApp number move together: picking a country
// presets the other two, which can still be changed.
const useContact = () => {
  const [country, setCountryRaw] = useState(DEFAULT_COUNTRY);
  const [timezone, setTimezone] = useState(countryByName(DEFAULT_COUNTRY)!.tz);
  const [dial, setDial] = useState(countryByName(DEFAULT_COUNTRY)!.dial);
  const [phone, setPhone] = useState('');
  const setCountry = (name: string) => {
    setCountryRaw(name);
    const c = countryByName(name);
    if (c) {
      setTimezone(c.tz);
      setDial(c.dial);
    }
  };
  const reset = () => {
    setCountry(DEFAULT_COUNTRY);
    setPhone('');
  };
  return { country, setCountry, timezone, setTimezone, dial, setDial, phone, setPhone, reset };
};

const ContactFields: React.FC<{ c: ReturnType<typeof useContact>; phoneLabel: string }> = ({ c, phoneLabel }) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="Country">
        <SelectInput value={c.country} onChange={c.setCountry} options={COUNTRIES.map((x) => x.name)} />
      </Field>
      <Field label="Timezone" hint="Class times are shown to them in this zone.">
        <SelectInput value={c.timezone} onChange={c.setTimezone} options={TIMEZONES} />
      </Field>
    </div>
    <PhoneField
      label={phoneLabel}
      dial={c.dial}
      onDialChange={c.setDial}
      number={c.phone}
      onNumberChange={c.setPhone}
      hint="Used for WhatsApp class reminders."
    />
  </>
);

export const QuickAddModal: React.FC = () => {
  const app = useApp() as any;
  const {
    quickAddModal,
    closeQuickAdd,
    addStudent,
    addTeacher,
    addParent,
    addAdmin,
    addSubject,
    addSession,
    addPost,
    subjects,
    teachers,
    students,
    levelOptions = [],
  } = app;

  const [activeType, setActiveType] = useState<QuickType>('student');
  const [saving, setSaving] = useState(false);

  // Shared account fields (each tab keeps its own copy via a key below).
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const contact = useContact();

  // Student
  const [levelId, setLevelId] = useState('');
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRel, setGuardianRel] = useState('parent');
  const [guardianDial, setGuardianDial] = useState(countryByName(DEFAULT_COUNTRY)!.dial);
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  // Teacher
  const [area, setArea] = useState('');
  const [teachLevels, setTeachLevels] = useState<string[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');

  // Parent
  const [childEmails, setChildEmails] = useState<string[]>([]);

  // Subject
  const [syllabus, setSyllabus] = useState('');
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subLevel, setSubLevel] = useState('');
  const [subTeacherId, setSubTeacherId] = useState('');
  const [feeChoice, setFeeChoice] = useState('30');
  const [feeOther, setFeeOther] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subBatch, setSubBatch] = useState('');

  const resetAll = () => {
    setName(''); setEmail(''); setPassword(''); setGender(''); contact.reset();
    setLevelId(''); setStudentSubjects([]); setGoal('');
    setGuardianName(''); setGuardianRel('parent'); setGuardianPhone(''); setGuardianEmail('');
    setArea(''); setTeachLevels([]); setTeacherSubjects([]); setQualification(''); setExperience('');
    setChildEmails([]);
    setSyllabus(''); setSubName(''); setSubCode(''); setSubLevel(''); setSubTeacherId(''); setFeeChoice('30'); setFeeOther(''); setSubDescription(''); setSubBatch('');
  };

  useEffect(() => {
    if (quickAddModal.isOpen) setActiveType((quickAddModal.initialType as QuickType) || 'student');
  }, [quickAddModal.isOpen, quickAddModal.initialType]);

  const levelName = (id: string) => levelOptions.find((l: any) => String(l.id) === String(id))?.name || '';

  // Subjects for a student: those at the chosen level first, published only.
  const studentSubjectOptions = useMemo(() => {
    const lvl = levelName(levelId);
    return subjects
      .filter((s: any) => s.status === 'Published' && (!lvl || s.level === lvl))
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .map((s: any) => ({ value: s.id, label: s.name, sub: `${s.priceUSD ? `$${s.priceUSD}/mo` : 'Free'}${lvl ? '' : ` · ${s.level || 'no level'}`}` }));
  }, [subjects, levelId, levelOptions]);

  const unassignedSubjects = useMemo(
    () => subjects
      .filter((s: any) => !s.teacherId)
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .map((s: any) => ({ value: s.id, label: s.name, sub: s.level || '' })),
    [subjects]
  );

  const studentChoices = useMemo(
    () => [...students]
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .map((s: any) => ({ value: s.email, label: s.name, sub: s.email })),
    [students]
  );

  const sortedTeachers = useMemo(() => [...teachers].sort((a: any, b: any) => a.name.localeCompare(b.name)), [teachers]);

  // Picking a Cambridge syllabus fills name + code and guesses the level.
  const pickSyllabus = (code: string) => {
    setSyllabus(code);
    const s = CAMBRIDGE_SUBJECTS.find((x) => x.code === code);
    if (!s) {
      setSubCode('');
      return;
    }
    setSubName(s.name);
    setSubCode(s.code);
    const match = levelOptions.find((l: any) =>
      s.stage === 'OL' ? /o\s*level|igcse/i.test(l.name) : /as\s*level/i.test(l.name)
    );
    if (match) setSubLevel(match.name);
  };

  if (!quickAddModal.isOpen) return null;

  const fee = feeChoice === 'other' ? Number(feeOther || 0) : Number(feeChoice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeType === 'session') { closeQuickAdd(); addSession(); return; }
    if (activeType === 'post') { closeQuickAdd(); addPost({ type: 'Article' }); return; }
    setSaving(true);
    let ok: any = false;
    const phone = fullPhone(contact.dial, contact.phone);
    if (activeType === 'student') {
      ok = await addStudent({
        name, email, password, timezone: contact.timezone, subjectIds: studentSubjects,
        profile: {
          full_name: name, gender, country: contact.country, phone,
          grade_level: levelId, learning_goal: goal,
          guardian_name: guardianName, guardian_relationship: guardianName ? guardianRel : '',
          guardian_phone: fullPhone(guardianDial, guardianPhone), guardian_email: guardianEmail,
        },
      });
    } else if (activeType === 'teacher') {
      ok = await addTeacher({
        name, email, password, timezone: contact.timezone, subjectIds: teacherSubjects,
        profile: {
          full_name: name, gender, country: contact.country, phone,
          expertise: area, class_levels: teachLevels, qualification,
          ...(experience !== '' ? { experience_years: Number(experience) } : {}),
          subjects: area ? [area] : [],
        },
      });
    } else if (activeType === 'parent') {
      ok = await addParent({ name, email, password, timezone: contact.timezone, childEmails, profile: { phone } });
    } else if (activeType === 'admin') {
      ok = await addAdmin({ name, email, password, timezone: contact.timezone });
    } else if (activeType === 'subject') {
      const code = subCode.trim();
      const title = code && !subName.includes(code) ? `${subName.trim()} (${code})` : subName.trim();
      ok = await addSubject({
        name: title, level: subLevel, teacherId: subTeacherId, priceUSD: fee, description: subDescription, batchName: subBatch.trim(),
        status: subTeacherId ? 'Published' : 'Draft',
      });
    }
    setSaving(false);
    if (ok) {
      resetAll();
      closeQuickAdd();
    }
  };

  const tabs: { id: QuickType; label: string; icon: any }[] = [
    { id: 'student', label: 'Student', icon: UserPlus },
    { id: 'teacher', label: 'Teacher', icon: GraduationCap },
    { id: 'parent', label: 'Parent', icon: Users },
    ...(quickAddModal.initialType === ('admin' as any) ? [{ id: 'admin' as QuickType, label: 'Admin', icon: ShieldCheck }] : []),
    { id: 'subject', label: 'Subject', icon: BookOpen },
    { id: 'session', label: 'Class', icon: Calendar },
    { id: 'post', label: 'Blog / Video', icon: FileText },
  ];

  const accountFields = (who: string) => (
    <FormSection title="Account">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={`${who} full name`} required>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} />
        </Field>
        <Field label="Gmail address" required hint="Must be Gmail / Google so they can join Meet classes.">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" className={inputCls} />
        </Field>
      </div>
      <PasswordField value={password} onChange={setPassword} />
    </FormSection>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#232D52] bg-[#121831] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2648] bg-[#0E1428]">
          <div>
            <h3 className="text-base font-bold text-slate-100">Quick add</h3>
            <p className="text-[11px] text-slate-500">Fields marked * are required. Everything else can be filled in later.</p>
          </div>
          <button onClick={closeQuickAdd} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 p-2 bg-[#0A0F22] border-b border-[#1E2648] overflow-x-auto">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isSelected = activeType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveType(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#6D5BFF] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {activeType === 'student' && (
            <>
              {accountFields('Student')}
              <FormSection title="Studies">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Level">
                    <SelectInput
                      value={levelId}
                      onChange={(v) => { setLevelId(v); setStudentSubjects([]); }}
                      placeholder="Choose a level"
                      options={levelOptions.map((l: any) => ({ value: String(l.id), label: l.name }))}
                    />
                  </Field>
                  <Field label="Learning goal">
                    <SelectInput value={goal} onChange={setGoal} placeholder="Not set" options={LEARNING_GOALS} />
                  </Field>
                </div>
                <Field label="Enrol in subjects" hint={levelId ? 'Showing subjects at the chosen level.' : 'Pick a level to narrow the list.'}>
                  <MultiPick
                    options={studentSubjectOptions}
                    selected={studentSubjects}
                    onChange={setStudentSubjects}
                    placeholder="Search subjects…"
                    emptyText="No published subjects at this level."
                  />
                </Field>
              </FormSection>
              <FormSection title="Contact">
                <ContactFields c={contact} phoneLabel="Student WhatsApp" />
                <Field label="Gender">
                  <SelectInput value={gender} onChange={setGender} placeholder="Not set" options={GENDERS} />
                </Field>
              </FormSection>
              <FormSection title="Guardian" subtitle="optional">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Guardian name">
                    <input type="text" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="Full name" className={inputCls} />
                  </Field>
                  <Field label="Relationship">
                    <SelectInput value={guardianRel} onChange={setGuardianRel} options={GUARDIAN_RELATIONSHIPS} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PhoneField label="Guardian WhatsApp" dial={guardianDial} onDialChange={setGuardianDial} number={guardianPhone} onNumberChange={setGuardianPhone} />
                  <Field label="Guardian email">
                    <input type="email" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} placeholder="parent@gmail.com" className={inputCls} />
                  </Field>
                </div>
                <p className="text-[11px] text-slate-500">To give the parent their own login, add them in the Parent tab and tick this student.</p>
              </FormSection>
            </>
          )}

          {activeType === 'teacher' && (
            <>
              {accountFields('Teacher')}
              <FormSection title="Teaching">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Main subject area">
                    <SelectInput value={area} onChange={setArea} placeholder="Choose" options={SUBJECT_AREAS} />
                  </Field>
                  <Field label="Qualification">
                    <SelectInput value={qualification} onChange={setQualification} placeholder="Choose" options={QUALIFICATIONS} />
                  </Field>
                  <Field label="Experience">
                    <SelectInput value={experience} onChange={setExperience} placeholder="Choose" options={EXPERIENCE_YEARS.map((x) => ({ value: String(x.value), label: x.label }))} />
                  </Field>
                </div>
                <Field label="Levels they teach">
                  <MultiPick
                    options={levelOptions.map((l: any) => ({ value: l.name, label: l.name }))}
                    selected={teachLevels}
                    onChange={setTeachLevels}
                    placeholder="Search levels…"
                  />
                </Field>
                <Field label="Assign subjects now" hint="Only subjects without a teacher are listed. Change others in Teacher Allocations.">
                  <MultiPick
                    options={unassignedSubjects}
                    selected={teacherSubjects}
                    onChange={setTeacherSubjects}
                    placeholder="Search subjects…"
                    emptyText="Every subject already has a teacher."
                  />
                </Field>
              </FormSection>
              <FormSection title="Contact">
                <ContactFields c={contact} phoneLabel="Teacher WhatsApp" />
                <Field label="Gender">
                  <SelectInput value={gender} onChange={setGender} placeholder="Not set" options={GENDERS} />
                </Field>
              </FormSection>
            </>
          )}

          {activeType === 'parent' && (
            <>
              {accountFields('Parent')}
              <FormSection title="Children">
                <Field label="Link children" hint="Links are approved straight away; the parent sees their progress and attendance.">
                  <MultiPick options={studentChoices} selected={childEmails} onChange={setChildEmails} placeholder="Search students by name or email…" />
                </Field>
              </FormSection>
              <FormSection title="Contact">
                <ContactFields c={contact} phoneLabel="Parent WhatsApp" />
              </FormSection>
            </>
          )}

          {activeType === 'admin' && (
            <>
              {accountFields('Admin')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Timezone">
                  <SelectInput value={contact.timezone} onChange={contact.setTimezone} options={TIMEZONES} />
                </Field>
              </div>
              <p className="text-[11px] text-amber-300/80">Admins can see and change everything in this panel. Only add staff you trust.</p>
            </>
          )}

          {activeType === 'subject' && (
            <>
              <FormSection title="Subject">
                <Field label="Cambridge syllabus" hint="Pick one to fill the name and code, or choose “Not a Cambridge subject”.">
                  <select value={syllabus} onChange={(e) => pickSyllabus(e.target.value)} className={`${inputCls} cursor-pointer`}>
                    <option value="">Not a Cambridge subject (type a name)</option>
                    <optgroup label="O Level / IGCSE">
                      {CAMBRIDGE_SUBJECTS.filter((s) => s.stage === 'OL').map((s) => (
                        <option key={s.code} value={s.code}>{s.code} · {s.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="AS & A Level">
                      {CAMBRIDGE_SUBJECTS.filter((s) => s.stage === 'AL').map((s) => (
                        <option key={s.code} value={s.code}>{s.code} · {s.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Subject name" required className="sm:col-span-2" hint="Add a batch if needed, e.g. “Physics IGCSE – Batch 2”.">
                    <input type="text" required value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="e.g. Mathematics Grade 8" className={inputCls} />
                  </Field>
                  <Field label="Code" hint="Optional">
                    <input type="text" value={subCode} onChange={(e) => setSubCode(e.target.value.replace(/[^\dA-Za-z]/g, ''))} placeholder="0580" className={`${inputCls} font-mono`} />
                  </Field>
                </div>
                <Field label="Batch name" hint="Optional, e.g. Morning. Add more batches later from the Subjects Catalogue.">
                  <input type="text" value={subBatch} onChange={(e) => setSubBatch(e.target.value)} placeholder="Leave empty if this is the only batch" className={inputCls} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Level" required>
                    <SelectInput required value={subLevel} onChange={setSubLevel} placeholder="Choose a level" options={levelOptions.map((l: any) => l.name)} />
                  </Field>
                  <Field label="Teacher" hint={subTeacherId ? 'Published on the website straight away.' : 'Without a teacher it is saved as a draft.'}>
                    <SelectInput
                      value={subTeacherId}
                      onChange={setSubTeacherId}
                      placeholder="No teacher yet"
                      options={sortedTeachers.map((t: any) => ({ value: t.id, label: `${t.name} · ${t.department}` }))}
                    />
                  </Field>
                </div>
              </FormSection>
              <FormSection title="Fee">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Monthly fee">
                    <SelectInput
                      value={feeChoice}
                      onChange={setFeeChoice}
                      options={[...FEE_PRESETS.map((f) => ({ value: String(f), label: f === 0 ? 'Free' : `$${f} / month` })), { value: 'other', label: 'Other amount…' }]}
                    />
                  </Field>
                  {feeChoice === 'other' && (
                    <Field label="Amount (USD / month)" required>
                      <input type="number" min={0} required value={feeOther} onChange={(e) => setFeeOther(e.target.value)} className={inputCls} />
                    </Field>
                  )}
                </div>
                <Field label="Short description" hint="Shown on the subject page. Optional.">
                  <textarea rows={2} value={subDescription} onChange={(e) => setSubDescription(e.target.value)} placeholder="What students will learn" className={inputCls} />
                </Field>
              </FormSection>
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
              className="disabled:opacity-60 px-5 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {activeType === 'session'
                ? 'Open class planner'
                : activeType === 'post'
                ? 'Open editor'
                : saving
                ? 'Saving…'
                : `Create ${activeType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
