import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar, FilterConfig, SortOption } from '../components/common/FilterBar';
import { StatusPill } from '../components/common/StatusPill';
import { DepartmentName } from '../types';
import { ArrowRightLeft, Check, ExternalLink, Pencil, Plus, Users, X } from 'lucide-react';
import { DEPARTMENT_CONFIG, DEPARTMENT_ICONS } from '../data/departments';
import { CategoryBar } from '../components/common/CategoryBar';
import { Field, SelectInput, inputCls } from '../components/common/FormControls';
import { FEE_PRESETS } from '../data/formOptions';

// Subjects Catalogue: one row per subject, its batches underneath. A batch is
// a class group with its own teacher, timetable, students and fee.
export const SubjectsView: React.FC = () => {
  const {
    catalog = [],
    teachers,
    openQuickAdd,
    toggleSubjectStatus,
    allocateTeacherSubject,
    addBatch,
    renameBatch,
    moveBatch,
    levels,
  } = useApp() as any;

  const [segment, setSegment] = useState<'all' | 'published' | 'draft' | 'multi'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('code-asc');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [segment, searchQuery, deptFilter, levelFilter, currentSort]);

  // Dialogs
  const [adding, setAdding] = useState<any>(null); // subject
  const [batchForm, setBatchForm] = useState({ name: '', teacherId: '', fee: '', publish: true });
  const [moving, setMoving] = useState<any>(null); // { batch, fromSubject }
  const [moveTarget, setMoveTarget] = useState('');
  const [moveName, setMoveName] = useState('');
  const [moveQuery, setMoveQuery] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [busy, setBusy] = useState(false);

  const sortedTeachers = useMemo(() => [...teachers].sort((a: any, b: any) => a.name.localeCompare(b.name)), [teachers]);
  const allBatches = catalog.flatMap((s: any) => s.batches);
  const publishedBatches = allBatches.filter((b: any) => b.status === 'Published').length;

  const filters: FilterConfig[] = [
    {
      id: 'level',
      label: 'Level',
      value: levelFilter,
      onChange: setLevelFilter,
      options: levels.map((lvl: string) => ({ label: lvl, value: lvl, count: catalog.filter((s: any) => s.level === lvl).length })),
    },
  ];
  const sortOptions: SortOption[] = [
    { label: 'Code', value: 'code-asc' },
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Students (most)', value: 'students-desc' },
    { label: 'Batches (most)', value: 'batches-desc' },
  ];

  const q = searchQuery.trim().toLowerCase();
  const list = catalog
    .filter((s: any) => deptFilter === 'all' || s.department === deptFilter)
    .filter((s: any) => levelFilter === 'all' || s.level === levelFilter)
    .filter((s: any) =>
      !q ||
      `${s.code} ${s.name}`.toLowerCase().includes(q) ||
      s.batches.some((b: any) => `${b.title} ${b.batchName} ${b.teacherName}`.toLowerCase().includes(q))
    )
    .filter((s: any) =>
      segment === 'all' ||
      (segment === 'multi' ? s.batches.length > 1 : s.batches.some((b: any) => b.status === (segment === 'published' ? 'Published' : 'Draft')))
    );
  const studentsOf = (s: any) => s.batches.reduce((n: number, b: any) => n + b.students, 0);
  if (currentSort === 'name-asc') list.sort((a: any, b: any) => a.name.localeCompare(b.name));
  else if (currentSort === 'students-desc') list.sort((a: any, b: any) => studentsOf(b) - studentsOf(a));
  else if (currentSort === 'batches-desc') list.sort((a: any, b: any) => b.batches.length - a.batches.length);
  else list.sort((a: any, b: any) => (a.code ? 0 : 1) - (b.code ? 0 : 1) || a.code.localeCompare(b.code) || a.name.localeCompare(b.name));

  const PAGE = 12;
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const shown = list.slice((Math.min(page, pages) - 1) * PAGE, Math.min(page, pages) * PAGE);

  const openAdd = (s: any) => {
    const fee = s.batches[0]?.priceUSD ?? 0;
    setBatchForm({ name: `Batch ${s.batches.length + 1}`, teacherId: '', fee: String(fee), publish: true });
    setAdding(s);
  };
  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await addBatch(adding.id, {
      batchName: batchForm.name.trim(),
      teacherId: batchForm.teacherId || undefined,
      priceUSD: Number(batchForm.fee || 0),
      publish: batchForm.publish,
    });
    setBusy(false);
    if (ok) setAdding(null);
  };
  const submitMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveTarget) return;
    setBusy(true);
    const ok = await moveBatch(moveTarget, moving.batch.id, moveName.trim() || undefined);
    setBusy(false);
    if (ok) setMoving(null);
  };
  const saveRename = async (batchId: string) => {
    const ok = await renameBatch(batchId, renameValue);
    if (ok) setRenaming(null);
  };

  const moveChoices = catalog
    .filter((s: any) => moving && s.id !== moving.fromSubject.id)
    .filter((s: any) => !moveQuery.trim() || `${s.code} ${s.name} ${s.level}`.toLowerCase().includes(moveQuery.trim().toLowerCase()))
    .slice(0, 60);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Subjects Catalogue"
        subtitle={`${catalog.length} subjects in ${allBatches.length} batches across ${new Set(catalog.map((x: any) => x.department)).size} departments.`}
        primaryAction={{ label: 'New subject', onClick: () => openQuickAdd('subject'), icon: Plus }}
      />

      <CategoryBar
        allLabel="All Subjects"
        dept={deptFilter}
        onDept={setDeptFilter}
        total={catalog.length}
        counts={catalog.reduce((m: any, x: any) => ({ ...m, [x.department]: (m[x.department] || 0) + 1 }), {})}
        segments={[
          { id: 'all', label: 'All', count: catalog.length },
          { id: 'multi', label: 'With batches', count: catalog.filter((s: any) => s.batches.length > 1).length, dot: 'bg-sky-400' },
          { id: 'published', label: 'Published', count: publishedBatches, dot: 'bg-emerald-400' },
          { id: 'draft', label: 'Draft', count: allBatches.length - publishedBatches, dot: 'bg-amber-400' },
        ]}
        segment={segment}
        onSegment={(id) => setSegment(id as any)}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search subject, code (e.g. 0580), batch or teacher…"
        filters={filters}
        sortOptions={sortOptions}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
      />

      <div className="rounded-2xl border border-[#232D52] bg-[#121831] shadow-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-[#1E2648] bg-[#0E1428] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span className="col-span-1">Code</span>
          <span className="col-span-4">Subject / batch</span>
          <span className="col-span-2">Teacher</span>
          <span className="col-span-1">Students</span>
          <span className="col-span-1">Fee</span>
          <span className="col-span-3 text-right">Status · actions</span>
        </div>

        {shown.length === 0 && <div className="py-12 text-center text-xs text-slate-400">No subjects match these filters.</div>}

        {shown.map((s: any) => {
          const dept = DEPARTMENT_CONFIG[s.department as DepartmentName] || DEPARTMENT_CONFIG.General;
          const Icon = DEPARTMENT_ICONS[s.department as DepartmentName] || DEPARTMENT_ICONS.General;
          const multi = s.batches.length > 1;
          return (
            <div key={s.id} className="border-b border-[#1E2648] last:border-b-0">
              {/* Subject */}
              <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-[#0E1428]/50">
                <div className="col-span-2 md:col-span-1 font-mono text-sm font-bold text-sky-400">{s.code || <span className="text-slate-600">—</span>}</div>
                <div className="col-span-10 md:col-span-8 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${dept.hex}1f`, borderColor: `${dept.hex}40`, color: dept.hex }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 truncate">{s.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {s.department} · {s.level || 'No level'} · {s.batches.length} batch{s.batches.length === 1 ? '' : 'es'} · {studentsOf(s)} student{studentsOf(s) === 1 ? '' : 's'}
                    </div>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-3 flex justify-end">
                  <button onClick={() => openAdd(s)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#232D52] text-xs text-slate-300 hover:text-white hover:border-[#6D5BFF]">
                    <Plus className="w-3 h-3" /> Add batch
                  </button>
                </div>
              </div>

              {/* Batches */}
              {s.batches.map((b: any) => (
                <div key={b.id} className="grid grid-cols-12 gap-3 items-center px-4 py-2 text-xs hover:bg-[#1A2346]/30 border-t border-[#1E2648]/40">
                  <div className="hidden md:block md:col-span-1" />
                  <div className="col-span-12 md:col-span-4 min-w-0">
                    {renaming === b.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          placeholder="e.g. Morning"
                          className={`${inputCls} !py-1 !text-xs max-w-[180px]`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(b.id);
                            if (e.key === 'Escape') setRenaming(null);
                          }}
                        />
                        <button onClick={() => saveRename(b.id)} className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setRenaming(null)} className="p-1 rounded text-slate-400 hover:bg-[#1A2346]"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${b.batchName ? 'bg-sky-400/10 text-sky-300 border-sky-400/30' : 'bg-[#1A2346] text-slate-400 border-[#232D52]'}`}>
                          {b.batchName || (multi ? 'Unnamed batch' : 'Only batch')}
                        </span>
                        <button title="Rename batch" onClick={() => { setRenaming(b.id); setRenameValue(b.batchName); }} className="p-1 rounded text-slate-500 hover:text-white hover:bg-[#1A2346] shrink-0">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <span className="text-slate-500 truncate" title={b.title}>{b.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-2 min-w-0">
                    <select
                      value={b.teacherId}
                      onChange={(e) => e.target.value && allocateTeacherSubject(e.target.value, b.id)}
                      className={`${inputCls} !py-1 !text-xs cursor-pointer ${b.teacherId ? '' : '!text-amber-300'}`}
                      title="Teacher for this batch"
                    >
                      {!b.teacherId && <option value="">No teacher yet</option>}
                      {sortedTeachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center gap-1 font-mono text-slate-200">
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> {b.students}
                  </div>
                  <div className="col-span-4 md:col-span-1 font-mono text-emerald-400 font-semibold">{b.priceUSD ? `$${b.priceUSD}/mo` : 'Free'}</div>
                  <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-1">
                    <button title={b.status === 'Published' ? 'Unpublish' : 'Publish'} onClick={() => toggleSubjectStatus(b.id)}>
                      <StatusPill status={b.status} />
                    </button>
                    <button
                      title="Move this batch to another subject (to combine duplicates)"
                      onClick={() => { setMoving({ batch: b, fromSubject: s }); setMoveTarget(''); setMoveName(b.batchName); setMoveQuery(s.code || ''); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2346]"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                    <a href={`/admin/courses/${b.id}`} title="Open batch page (content, outline, students)" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2346]">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <div className="flex items-center justify-between px-5 py-3 border-t border-[#1E2648] bg-[#0E1428] text-xs text-slate-400">
          <span>{list.length} subject{list.length === 1 ? '' : 's'}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2.5 py-1 rounded-lg border border-[#232D52] disabled:opacity-40">‹</button>
            <span className="font-mono">{Math.min(page, pages)} / {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="px-2.5 py-1 rounded-lg border border-[#232D52] disabled:opacity-40">›</button>
          </div>
        </div>
      </div>

      {/* Add batch */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={submitAdd} className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100 text-xs">
            <div>
              <h3 className="text-base font-bold">Add a batch</h3>
              <p className="text-slate-400 mt-1">{adding.code ? `${adding.code} · ` : ''}{adding.name} · {adding.level}</p>
            </div>
            <Field label="Batch name" required hint="e.g. Morning, Evening, Girls' section, Batch 2">
              <input required autoFocus value={batchForm.name} onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Teacher" hint="Without a teacher the batch is saved as a draft.">
              <SelectInput
                value={batchForm.teacherId}
                onChange={(v) => setBatchForm({ ...batchForm, teacherId: v })}
                placeholder="No teacher yet"
                options={sortedTeachers.map((t: any) => ({ value: t.id, label: `${t.name} · ${t.department}` }))}
              />
            </Field>
            <Field label="Monthly fee">
              <SelectInput
                value={batchForm.fee}
                onChange={(v) => setBatchForm({ ...batchForm, fee: v })}
                options={[...new Set([...FEE_PRESETS, Number(batchForm.fee || 0)])].sort((a, b) => a - b).map((f) => ({ value: String(f), label: f === 0 ? 'Free' : `$${f} / month` }))}
              />
            </Field>
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" checked={batchForm.publish} onChange={(e) => setBatchForm({ ...batchForm, publish: e.target.checked })} />
              Publish on the website now (needs a teacher)
            </label>
            <p className="text-[11px] text-slate-500">Then plan its classes in the Timetable as usual: each batch has its own Meet links and attendance.</p>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#1E2648]">
              <button type="button" onClick={() => setAdding(null)} className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={busy || !batchForm.name.trim()} className="px-4 py-2 rounded-xl font-semibold bg-[#6D5BFF] hover:bg-[#5B47FB] text-white disabled:opacity-50">
                {busy ? 'Adding…' : 'Add batch'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Move batch */}
      {moving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={submitMove} className="w-full max-w-lg rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100 text-xs">
            <div>
              <h3 className="text-base font-bold">Move batch to another subject</h3>
              <p className="text-slate-400 mt-1">
                “{moving.batch.title}”: its {moving.batch.students} student{moving.batch.students === 1 ? '' : 's'}, classes, attendance and marks move with it.
                {moving.fromSubject.batches.length === 1 && ' Its current subject has no other batch, so it will be removed.'}
              </p>
            </div>
            <Field label="Move into subject" required>
              <input value={moveQuery} onChange={(e) => setMoveQuery(e.target.value)} placeholder="Search by code or name, e.g. 0580" className={inputCls} />
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-[#232D52] bg-[#0E1428] p-1">
                {moveChoices.map((c: any) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setMoveTarget(c.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left ${moveTarget === c.id ? 'bg-[#6D5BFF]/20 text-white' : 'text-slate-300 hover:bg-[#1A2346]'}`}
                  >
                    <span className="font-mono text-sky-400 w-10 shrink-0">{c.code}</span>
                    <span className="truncate">{c.name}</span>
                    <span className="ml-auto text-[10px] text-slate-500 shrink-0">{c.level} · {c.batches.length} batch{c.batches.length === 1 ? '' : 'es'}</span>
                  </button>
                ))}
                {moveChoices.length === 0 && <p className="px-2 py-3 text-center text-slate-500">No match.</p>}
              </div>
            </Field>
            <Field label="Batch name in the new subject" hint="Must differ from its batches there, e.g. Evening.">
              <input value={moveName} onChange={(e) => setMoveName(e.target.value)} placeholder="e.g. Evening" className={inputCls} />
            </Field>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#1E2648]">
              <button type="button" onClick={() => setMoving(null)} className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={busy || !moveTarget} className="px-4 py-2 rounded-xl font-semibold bg-[#6D5BFF] hover:bg-[#5B47FB] text-white disabled:opacity-50">
                {busy ? 'Moving…' : 'Move batch'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
