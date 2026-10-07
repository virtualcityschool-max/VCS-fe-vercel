import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, MessageCircle, Pencil, Save, X, Users, GraduationCap, UserRound, KeyRound, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { adminService } from '../../../services/adminService';
import { StatusPill } from './StatusPill';
import { CopyButton, Field, FormSection, PasswordField, PhoneField, SelectInput, fullPhone, inputCls } from './FormControls';
import {
  CLASS_YEARS,
  COUNTRIES,
  GENDERS,
  GUARDIAN_RELATIONSHIPS,
  LEARNING_GOALS,
  TIMEZONES,
  formatPhone,
  whatsappLink,
} from '../../data/formOptions';

// Split stored digits ("966501234567") into a known dial code and the rest.
const splitPhone = (digits?: string | null) => {
  const d = String(digits || '').replace(/[^\d]/g, '');
  const dial = [...new Set(COUNTRIES.map((c) => c.dial))].sort((a, b) => b.length - a.length).find((x) => d.startsWith(x));
  return dial ? { dial, number: d.slice(dial.length) } : { dial: '966', number: d };
};

const labelOf = (list: { value: string; label: string }[], v?: string) => list.find((x) => x.value === v)?.label || v || '';

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[130px_1fr] gap-3 py-1.5 text-[13px]">
    <span className="text-slate-500">{label}</span>
    <div className="text-slate-100 min-w-0">{children || <span className="text-slate-600">—</span>}</div>
  </div>
);

const Card: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="rounded-xl border border-[#232D52] bg-[#0E1428] p-4">
    <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-sky-300">
      <Icon className="w-3.5 h-3.5" /> {title}
    </div>
    <div className="divide-y divide-[#1E2648]/60">{children}</div>
  </div>
);

const PhoneLine: React.FC<{ digits?: string | null }> = ({ digits }) =>
  digits ? (
    <span className="inline-flex items-center gap-1 font-mono">
      {formatPhone(digits)}
      <CopyButton value={formatPhone(digits)} title="Copy number" />
      <a href={whatsappLink(digits)} target="_blank" rel="noreferrer" title="Open WhatsApp" className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10">
        <MessageCircle className="w-3.5 h-3.5" />
      </a>
    </span>
  ) : null;

// Full student details with in-place editing (account, studies, contact, guardian, password).
export const StudentProfilePanel: React.FC<{ studentId: string }> = ({ studentId }) => {
  const { students, levelOptions = [], reload, addToast, toggleUserStatus, confirmAction, closeDetailDrawer } = useApp() as any;
  const student = students.find((s: any) => s.id === studentId);
  const rawUser = student?._raw || {};

  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  const loadProfile = () =>
    adminService
      .getUserProfile(studentId)
      .then((p: any) => setProfile(p || {}))
      .catch(() => setProfile({}));

  useEffect(() => {
    setProfile(null);
    setEditing(false);
    loadProfile();
  }, [studentId]);

  const startEdit = () => {
    const p = profile || {};
    const ph = splitPhone(p.phone);
    const gph = splitPhone(p.guardian_phone);
    setForm({
      first_name: rawUser.first_name || '', last_name: rawUser.last_name || '', email: rawUser.email || '',
      timezone: rawUser.timezone || 'Asia/Riyadh', password: '',
      class_year: p.class_year || '', grade_level: p.grade_level ? String(p.grade_level) : '',
      school_name: p.school_name || '', learning_goal: p.learning_goal || '',
      gender: p.gender || '', date_of_birth: p.date_of_birth || '', country: p.country || '', city: p.city || '',
      dial: ph.dial, phone: ph.number,
      guardian_name: p.guardian_name || '', guardian_relationship: p.guardian_relationship || '',
      gdial: gph.dial, guardian_phone: gph.number, guardian_email: p.guardian_email || '',
    });
    setEditing(true);
  };
  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const account: any = { email: form.email.trim(), role: 'student', timezone: form.timezone };
      // The server refuses blank names, so only send the parts that are filled in.
      if (form.first_name.trim()) account.first_name = form.first_name.trim();
      if (form.last_name.trim()) account.last_name = form.last_name.trim();
      if (form.password) account.password = form.password;
      await adminService.updateUser(studentId, account);
      await adminService.updateUserProfile(studentId, {
        full_name: [form.first_name, form.last_name].filter(Boolean).join(' ').trim(),
        class_year: form.class_year, grade_level: form.grade_level || null,
        school_name: form.school_name, learning_goal: form.learning_goal || null,
        gender: form.gender || null, date_of_birth: form.date_of_birth || null,
        country: form.country, city: form.city, phone: fullPhone(form.dial, form.phone) || null,
        guardian_name: form.guardian_name, guardian_relationship: form.guardian_relationship || null,
        guardian_phone: fullPhone(form.gdial, form.guardian_phone) || null, guardian_email: form.guardian_email || null,
      });
      addToast(form.password ? 'Saved. The new password was emailed to the student.' : 'Student details saved', 'success');
      setEditing(false);
      await Promise.all([loadProfile(), reload('users')]);
    } catch (err: any) {
      const d = err?.response?.data;
      const first = d?.details && Object.entries(d.details)[0];
      addToast(first ? `${first[0].replace(/_/g, ' ')}: ${[].concat(first[1] as any).join(' ')}` : d?.error || 'Could not save. Nothing was changed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const levelName = useMemo(
    () => (id: any) => levelOptions.find((l: any) => String(l.id) === String(id))?.name || '',
    [levelOptions]
  );

  if (!student) return null;
  const p = profile || {};

  if (editing) {
    return (
      <form onSubmit={save} className="space-y-5 text-xs">
        <FormSection title="Account">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" required><input required value={form.first_name} onChange={(e) => set('first_name')(e.target.value)} className={inputCls} /></Field>
            <Field label="Last name"><input value={form.last_name} onChange={(e) => set('last_name')(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Email (login)" required hint="Changing it changes how they log in. Must be Gmail / Google.">
            <input type="email" required value={form.email} onChange={(e) => set('email')(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Timezone"><SelectInput value={form.timezone} onChange={set('timezone')} options={TIMEZONES} /></Field>
        </FormSection>

        <FormSection title="Studies">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Class">
              <select value={form.class_year} onChange={(e) => set('class_year')(e.target.value)} className={`${inputCls} cursor-pointer`}>
                <option value="">Not set</option>
                {CLASS_YEARS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Level">
              <SelectInput value={form.grade_level} onChange={set('grade_level')} placeholder="Not set" options={levelOptions.map((l: any) => ({ value: String(l.id), label: l.name }))} />
            </Field>
            <Field label="School"><input value={form.school_name} onChange={(e) => set('school_name')(e.target.value)} className={inputCls} /></Field>
            <Field label="Learning goal"><SelectInput value={form.learning_goal} onChange={set('learning_goal')} placeholder="Not set" options={LEARNING_GOALS} /></Field>
          </div>
        </FormSection>

        <FormSection title="Personal & contact">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender"><SelectInput value={form.gender} onChange={set('gender')} placeholder="Not set" options={GENDERS} /></Field>
            <Field label="Date of birth"><input type="date" value={form.date_of_birth || ''} onChange={(e) => set('date_of_birth')(e.target.value)} className={`${inputCls} [color-scheme:dark]`} /></Field>
            <Field label="Country"><SelectInput value={form.country} onChange={set('country')} placeholder="Not set" options={COUNTRIES.map((c) => c.name)} /></Field>
            <Field label="City"><input value={form.city} onChange={(e) => set('city')(e.target.value)} className={inputCls} /></Field>
          </div>
          <PhoneField label="Student WhatsApp" dial={form.dial} onDialChange={set('dial')} number={form.phone} onNumberChange={set('phone')} />
        </FormSection>

        <FormSection title="Guardian">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Guardian name"><input value={form.guardian_name} onChange={(e) => set('guardian_name')(e.target.value)} className={inputCls} /></Field>
            <Field label="Relationship"><SelectInput value={form.guardian_relationship} onChange={set('guardian_relationship')} placeholder="Not set" options={GUARDIAN_RELATIONSHIPS} /></Field>
          </div>
          <PhoneField label="Guardian WhatsApp" dial={form.gdial} onDialChange={set('gdial')} number={form.guardian_phone} onNumberChange={set('guardian_phone')} />
          <Field label="Guardian email"><input type="email" value={form.guardian_email} onChange={(e) => set('guardian_email')(e.target.value)} className={inputCls} /></Field>
        </FormSection>

        <FormSection title="Password" subtitle="optional">
          <PasswordField value={form.password} onChange={set('password')} />
          <p className="text-[11px] text-amber-300/80">Leave empty to keep their password. A new one is emailed to the student.</p>
        </FormSection>

        <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-[#121831]/95 backdrop-blur border-t border-[#1E2648] flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-300 hover:text-white">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-semibold bg-[#6D5BFF] hover:bg-[#5B47FB] text-white disabled:opacity-60">
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      {profile === null && <div className="h-1 rounded bg-sky-400/40 animate-pulse" />}

      <Card title="Account" icon={UserRound}>
        <Row label="Email">
          <span className="inline-flex items-center gap-1 min-w-0">
            <Mail className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            <span className="truncate">{student.email}</span>
            <CopyButton value={student.email} title="Copy email" />
          </span>
        </Row>
        <Row label="Phone"><PhoneLine digits={student.phone} /></Row>
        <Row label="Status"><StatusPill status={student.status} /></Row>
        <Row label="Timezone">{rawUser.timezone}</Row>
        <Row label="Joined">{(student.createdAt || '').slice(0, 10)}</Row>
      </Card>

      <Card title="Studies" icon={GraduationCap}>
        <Row label="Roll #"><span className="font-mono">{student.rollNo}</span></Row>
        <Row label="Class">
          {p.class_year ? <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-sky-400/15 text-sky-300 border border-sky-400/30">{p.class_year}</span> : null}
        </Row>
        <Row label="Level">{levelName(p.grade_level) || student.level}</Row>
        <Row label="School">{p.school_name}</Row>
        <Row label="Learning goal">{labelOf(LEARNING_GOALS, p.learning_goal)}</Row>
        <Row label="Fee status"><StatusPill status={student.feeStatus} /></Row>
        <Row label="Attendance">{student.attendanceRate == null ? null : `${student.attendanceRate}% · ${student.absencesThisWeek || 0} absent this week`}</Row>
      </Card>

      <Card title="Personal" icon={Phone}>
        <Row label="Gender">{labelOf(GENDERS, p.gender)}</Row>
        <Row label="Date of birth">{p.date_of_birth}</Row>
        <Row label="Country">{p.country}</Row>
        <Row label="City">{p.city}</Row>
      </Card>

      <Card title="Guardian" icon={Users}>
        <Row label="Name">
          {p.guardian_name ? `${p.guardian_name}${p.guardian_relationship ? ` · ${labelOf(GUARDIAN_RELATIONSHIPS, p.guardian_relationship)}` : ''}` : null}
        </Row>
        <Row label="Phone"><PhoneLine digits={p.guardian_phone} /></Row>
        <Row label="Email">
          {p.guardian_email ? (
            <span className="inline-flex items-center gap-1">{p.guardian_email}<CopyButton value={p.guardian_email} title="Copy email" /></span>
          ) : null}
        </Row>
        <Row label="Parent accounts">
          {(student.parentAccounts || []).length
            ? student.parentAccounts.map((pa: any) => (
                <div key={pa.id} className="flex items-center gap-1">
                  {pa.name}
                  <span className="text-slate-500 text-xs">· {pa.email}</span>
                  <CopyButton value={pa.email} title="Copy email" />
                </div>
              ))
            : null}
        </Row>
      </Card>

      <div className="flex flex-wrap gap-2 pt-1">
        <button onClick={startEdit} disabled={profile === null} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white disabled:opacity-50">
          <Pencil className="w-3.5 h-3.5" /> Edit details
        </button>
        <button onClick={() => toggleUserStatus(student.id)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-[#232D52] bg-[#1A2346] text-slate-200 hover:border-slate-500">
          <KeyRound className="w-3.5 h-3.5" /> {student.status === 'Inactive' ? 'Activate account' : 'Deactivate account'}
        </button>
        <button
          onClick={async () => {
            const ok = await confirmAction({
              title: `Delete ${student.name} permanently?`,
              message: 'Their account, enrolments, attendance and marks are removed for good. This cannot be undone. To pause a student, use Deactivate instead.',
              confirmLabel: 'Delete permanently',
            });
            if (!ok) return;
            try {
              await adminService.purgeUser(student.id);
              addToast(`${student.name} deleted`, 'success');
              closeDetailDrawer();
              reload('users', 'enrollments');
            } catch (err: any) {
              addToast(err?.response?.data?.error || 'Could not delete. Nothing was changed.', 'error');
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete permanently
        </button>
      </div>
    </div>
  );
};
