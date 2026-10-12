import React from "react";
import { X, ShieldCheck, Clock, Globe, HelpCircle, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

export const SessionTroubleshootModal = ({ isOpen, onClose, userEmail = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#232D52] bg-[#101428] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2648] bg-[#0E1326]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Classroom Access & Sign-In Guide</h3>
              <p className="text-[11px] text-slate-400">Follow these key checkpoints to enter your live class with zero delays</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs leading-relaxed">
          
          {/* Card 1: Chrome Profile */}
          <div className="p-4 rounded-xl bg-[#0B0F20] border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>1. Google Chrome Profile Sign-In (Most Common Issue)</span>
            </div>
            <p className="text-slate-300 text-[12px]">
              Google Meet checks the Google account active in your <b>Chrome browser tab</b>, not just your login on Virtual City School.
            </p>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] space-y-1">
              <p><b>If you see:</b> <i>"Please wait until a meeting host brings you into the call"</i></p>
              <p><b>Cause:</b> Your Chrome browser is currently signed into a personal outside Google account.</p>
              <p><b>Quick Fix:</b> Click your profile icon at the top-right of your Chrome window and ensure you are using your registered VCS email {userEmail ? <b className="text-white">({userEmail})</b> : ""}. Because that email is on the Google Calendar guest list, Google will let you straight into class without knocking.</p>
            </div>
          </div>

          {/* Card 2: 20-Min Window */}
          <div className="p-4 rounded-xl bg-[#0B0F20] border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Clock className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>2. 20-Minute Early Join Restriction</span>
            </div>
            <p className="text-slate-300 text-[12px]">
              Classrooms unlock strictly <b>20 minutes before the scheduled start time</b>.
            </p>
            <ul className="list-disc pl-5 text-slate-400 space-y-1 text-[11px]">
              <li>If your class is at <span className="font-mono text-slate-200">17:00 AST</span>, the room unlocks at <span className="font-mono text-emerald-300">16:40 AST</span>.</li>
              <li>Before the 20-minute mark, the join link stays locked in red with a countdown clock to prevent early wandering.</li>
              <li>When the 20-minute mark is reached, the badge turns <span className="text-emerald-400 font-bold">green</span> and the Launch/Join button activates.</li>
            </ul>
          </div>

          {/* Card 3: Timezone */}
          <div className="p-4 rounded-xl bg-[#0B0F20] border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Globe className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>3. Timezone Match (AST / PKT / BST)</span>
            </div>
            <p className="text-slate-300 text-[12px]">
              The school schedules classes in <b>AST (Arabia Standard Time / Saudi Arabia)</b> by default.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-cyan-400 font-bold">AST</div>
                <div className="text-slate-400 text-[10px]">Riyadh / Qatar</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-indigo-400 font-bold">PKT (AST + 2h)</div>
                <div className="text-slate-400 text-[10px]">Pakistan Time</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-emerald-400 font-bold">BST (AST - 2h)</div>
                <div className="text-slate-400 text-[10px]">London Time</div>
              </div>
            </div>
            <p className="text-slate-400 text-[11px]">
              Use the timezone switch toggle in your portal header to view all scheduled times in your preferred local timezone.
            </p>
          </div>

          {/* Card 4: 90-Min Max Duration & Emergency Backup */}
          <div className="p-4 rounded-xl bg-[#0B0F20] border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <MessageSquare className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>4. Emergency Admin Backup (WhatsApp)</span>
            </div>
            <p className="text-slate-300 text-[12px]">
              If you or a student have browser issues or cannot access Chrome:
            </p>
            <p className="text-slate-400 text-[11px]">
              Contact the School Administration on WhatsApp immediately. The Admin can copy the direct Google Meet conference link directly from the Admin Panel and send it to your WhatsApp group so you can join instantly.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1E2648] bg-[#0E1326] flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Virtual City School Live Operations</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            Got it, thanks
          </button>
        </div>

      </div>
    </div>
  );
};

export default SessionTroubleshootModal;
