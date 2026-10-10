import React, { useEffect, useState } from 'react';
import { Eye, Plus, Save, X } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { useApp } from '../../context/AppContext';
import { inputCls } from './FormControls';

// Admin Gmail addresses invited to every new class, so they can join any
// class without waiting to be let in. Admin-only setting on the server.
export const ClassObserversCard: React.FC = () => {
  const { addToast } = useApp() as any;
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    axiosInstance
      .get('/messaging/class-observers/')
      .then((r: any) => setEmails(r.data?.emails || []))
      .catch(() => addToast('Could not load class observers.', 'error'))
      .finally(() => setLoaded(true));
  }, []);

  const add = () => {
    const parts = input.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (!parts.length) return;
    setEmails((cur) => [...new Set([...cur, ...parts])]);
    setInput('');
  };

  const save = async () => {
    setSaving(true);
    try {
      const r: any = await axiosInstance.patch('/messaging/class-observers/', { emails });
      setEmails(r.data?.emails || []);
      addToast('Class observers saved. They are invited to every new class.', 'success');
    } catch (e: any) {
      addToast(e?.response?.data?.error || 'Could not save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-[#232D52] bg-[#121831] space-y-4 shadow-xl text-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-300"><Eye className="w-5 h-5" /></div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Class observers</h3>
          <p className="text-slate-400 mt-0.5">
            Gmail addresses invited to every new class, so they can join any class from Live Classes without waiting to be let in.
            virtualcityschool@gmail.com hosts every class already and does not need to be added. Only add people you trust: they can enter children's classes.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {loaded && emails.length === 0 && <span className="text-slate-500 italic">No observers yet.</span>}
        {emails.map((e) => (
          <span key={e} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-sky-400/10 border border-sky-400/30 text-sky-200">
            {e}
            <button onClick={() => setEmails((cur) => cur.filter((x) => x !== e))} className="p-0.5 rounded hover:bg-white/10" title="Remove">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="name@gmail.com"
          className={inputCls}
        />
        <button onClick={add} className="shrink-0 inline-flex items-center gap-1 px-3 rounded-xl border border-[#232D52] bg-[#1A2346] text-slate-200 hover:border-[#6D5BFF]">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
        <button onClick={save} disabled={saving} className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl font-semibold bg-[#6D5BFF] hover:bg-[#5B47FB] text-white disabled:opacity-60">
          <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <p className="text-[11px] text-slate-500">
        Applies to classes created from now on. Classes already planned get the observers when the switch is done (a one-time update of their calendar events).
      </p>
    </div>
  );
};
