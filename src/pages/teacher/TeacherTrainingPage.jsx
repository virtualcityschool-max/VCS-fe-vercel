import React, { useEffect, useState, useCallback } from "react";
import { trainingService } from "../../services/trainingService";
import { toastManager } from "../../utils/toastManager";
import { useDateFormatters } from "../../hooks/useDateFormatters";

const CAT_COLOR = {
  onboarding: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  teaching:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  curriculum: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  features:   "bg-violet-500/15 text-violet-300 border-violet-500/20",
  delivery:   "bg-rose-500/15 text-rose-300 border-rose-500/20",
  other:      "bg-slate-500/15 text-slate-300 border-slate-500/20",
};

const STATUS_CFG = {
  completed:  { cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", icon: "fa-check-circle", label: "Completed"  },
  registered: { cls: "bg-indigo-500/15  text-indigo-300  border-indigo-500/20",  icon: "fa-clock",       label: "Registered" },
  pending:    { cls: "bg-slate-500/15   text-slate-400   border-slate-500/20",   icon: "fa-circle",      label: "Pending"    },
};

const TeacherTrainingPage = () => {
  const { formatDate, formatTime } = useDateFormatters();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all"); // all | pending | registered | completed
  const [registering, setRegistering] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainingService.list();
      setSessions(Array.isArray(data) ? data : []);
    } catch { toastManager.error("Failed to load training sessions."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRegister = async (session) => {
    setRegistering(session.id);
    try {
      const res = await trainingService.register(session.id);
      if (res.already_registered) {
        toastManager.info("You are already registered for this session.");
      } else {
        toastManager.success("Registered successfully!");
      }
      setSessions(p => p.map(s => s.id === session.id ? { ...s, my_status: "registered" } : s));
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to register.";
      toastManager.error(msg);
    } finally {
      setRegistering(null);
    }
  };

  const filtered = sessions.filter(s => filter === "all" || s.my_status === filter);

  const counts = {
    all:        sessions.length,
    pending:    sessions.filter(s => s.my_status === "pending").length,
    registered: sessions.filter(s => s.my_status === "registered").length,
    completed:  sessions.filter(s => s.my_status === "completed").length,
  };

  const canRegister = (s) => {
    if (s.my_status !== "pending") return false;
    if (!s.registration_deadline) return true;
    return new Date(s.registration_deadline) > new Date();
  };

  return (
    <div className="text-white space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black font-poppins tracking-tight">My Training</h1>
        <p className="text-slate-500 text-sm mt-1">Internal training sessions assigned to you by the admin team.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {["all", "pending", "registered", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 ${
              filter === f ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {f}
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20 text-white" : "bg-slate-800 text-slate-500"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Sessions */}
      {loading ? (
        <div className="flex justify-center py-16"><i className="fas fa-spinner fa-spin text-slate-600 text-2xl" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-slate-500 text-xl" />
          </div>
          <p className="text-white font-bold mb-1">
            {filter === "all" ? "No training sessions assigned" : `No ${filter} sessions`}
          </p>
          <p className="text-slate-500 text-sm">
            {filter === "all" ? "The admin will notify you when training is available." : "Try a different filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(s => {
            const status = STATUS_CFG[s.my_status] || STATUS_CFG.pending;
            const isExpanded = expanded === s.id;
            const isPast = new Date(s.scheduled_at) < new Date();
            const deadlinePassed = s.registration_deadline && new Date(s.registration_deadline) < new Date();

            return (
              <div key={s.id} className={`bg-slate-900/60 border rounded-2xl overflow-hidden transition ${
                s.is_mandatory ? "border-rose-500/20" : "border-slate-800"
              }`}>
                {/* Card header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-black text-white text-base">{s.title}</h3>
                      {s.is_mandatory && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-rose-500/15 text-rose-300 border border-rose-500/20 rounded-full px-2 py-0.5">
                          Mandatory
                        </span>
                      )}
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CAT_COLOR[s.category] || CAT_COLOR.other}`}>
                        {s.category_display}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-user-tie text-[10px] text-slate-500" />
                        {s.trainer_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-calendar text-[10px] text-slate-500" />
                        {formatDate(s.scheduled_at)} at {formatTime(s.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-clock text-[10px] text-slate-500" />
                        {s.duration_mins} min
                      </span>
                      {s.registration_deadline && (
                        <span className={`flex items-center gap-1.5 ${deadlinePassed ? "text-rose-400" : "text-amber-400"}`}>
                          <i className="fas fa-hourglass-half text-[10px]" />
                          {deadlinePassed ? "Deadline passed" : `Deadline: ${formatDate(s.registration_deadline)}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status.cls}`}>
                      <i className={`fas ${status.icon} text-[9px]`} />
                      {status.label}
                    </span>

                    {canRegister(s) && (
                      <button onClick={() => handleRegister(s)} disabled={registering === s.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition shadow-lg shadow-indigo-900/30 active:scale-95">
                        {registering === s.id ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-check text-[9px]" />}
                        Register
                      </button>
                    )}

                    {s.learning_objectives && (
                      <button onClick={() => setExpanded(isExpanded ? null : s.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                        <i className={`fas fa-chevron-${isExpanded ? "up" : "down"} text-xs`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded objectives */}
                {isExpanded && s.learning_objectives && (
                  <div className="px-5 pb-5 border-t border-slate-800/60 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      <i className="fas fa-list-check mr-1.5" />Learning Objectives
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {s.learning_objectives}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherTrainingPage;
