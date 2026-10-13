import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Clock,
  Globe,
  HelpCircle,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Video,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { toastManager } from "../../utils/toastManager";

export const SessionTroubleshootModal = ({
  isOpen,
  onClose,
  userEmail = "",
  userRole = "student",
}) => {
  const [reloading, setReloading] = useState(false);

  if (!isOpen) return null;

  const handleHardReload = () => {
    setReloading(true);
    toastManager.info("Hard refreshing page to clear browser cache...");
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#232D52] bg-[#0E1328] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2648] bg-[#0A0E20]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Issue in Joining Class? Quick Fix Guide</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/30 animate-pulse">
                  Troubleshoot
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Resolve Google Meet errors, 20-min restrictions, stale caches, timezones, and subject enrollments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Ribbon */}
        <div className="px-6 py-3 bg-[#131936] border-b border-[#1E2648] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-amber-400 font-bold">⚡ Quick Action:</span>
            <span>If your class was planned in the last few minutes, reload your page to bypass cache:</span>
          </div>
          <button
            onClick={handleHardReload}
            disabled={reloading}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloading ? "animate-spin" : ""}`} />
            <span>{reloading ? "Reloading..." : "Reload Page Now (Ctrl+Shift+R)"}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs leading-relaxed custom-scrollbar">

          {/* 1. Chrome Account Sign-In */}
          <div className="p-4 rounded-xl bg-[#080B18] border border-amber-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <KeyRound className="w-4 h-4 shrink-0 text-amber-400" />
                <span>1. Google Chrome Login Issue ("Ask to Join" / Permission Denied)</span>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                #1 Most Common
              </span>
            </div>
            <p className="text-slate-300 text-[12px]">
              Google Meet checks the Google account active in your <b>Chrome browser</b>, NOT just your login on Virtual City School.
            </p>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] space-y-1.5">
              <p><b>• The Symptom:</b> Screen says <i>"Ask to join"</i> or <i>"You need permission to join this call"</i> or <i>"Waiting for host to admit you"</i>.</p>
              <p><b>• The Cause:</b> Your Chrome browser tab is currently signed into a personal Google account instead of your registered school email.</p>
              <p><b>• The Fix:</b> Click your Google avatar in the <b>top-right corner of Chrome/Google Meet</b> and switch to your registered VCS email {userEmail ? <b className="text-white bg-slate-800 px-1.5 py-0.5 rounded font-mono">({userEmail})</b> : ""}. Because that email is on the Google Calendar guest list, you bypass the waiting room and enter instantly.</p>
            </div>
          </div>

          {/* 2. 20-Minute Early Join Restriction Policy */}
          <div className="p-4 rounded-xl bg-[#080B18] border border-indigo-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Clock className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>2. 20-Minute Early Join Restriction Policy</span>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Safety Rule
              </span>
            </div>
            <p className="text-slate-300 text-[12px]">
              To maintain classroom order, live sessions strictly unlock <b>20 minutes before the scheduled start time</b>.
            </p>
            <ul className="list-disc pl-5 text-slate-300 space-y-1 text-[11px]">
              <li><b>Before the 20-minute mark:</b> The Join button is locked with a digital countdown clock. Clicking early displays <i>"You can join up to 20 minutes before the scheduled class time"</i>.</li>
              <li><b>At the 20-minute mark:</b> The session status badge turns <span className="text-emerald-400 font-bold">green</span> and the Join button unlocks automatically.</li>
              <li><b>Session Expiry:</b> Sessions remain joinable for up to <b>90 minutes</b> maximum from scheduled start.</li>
            </ul>
          </div>

          {/* 3. Page Refresh & Cache Issue */}
          <div className="p-4 rounded-xl bg-[#080B18] border border-cyan-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <RefreshCw className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>3. Page Refresh Issue ("No Sessions Scheduled" on New Classes)</span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Cache Check
              </span>
            </div>
            <p className="text-slate-300 text-[12px]">
              If a class was planned or rescheduled just a few moments ago while your browser tab was already open:
            </p>
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-[11px] space-y-1.5">
              <p><b>• The Fix:</b> Press <kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700 font-mono">Ctrl + Shift + R</kbd> (Windows) or <kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700 font-mono">Cmd + Shift + R</kbd> (Mac) to perform a hard reload.</p>
              <p><b>• Auto-Sync:</b> Virtual City School now includes background synchronization that automatically checks for new sessions every 60 seconds.</p>
            </div>
          </div>

          {/* 4. Timezone Mismatch */}
          <div className="p-4 rounded-xl bg-[#080B18] border border-violet-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-violet-300 font-bold text-sm">
                <Globe className="w-4 h-4 shrink-0 text-violet-400" />
                <span>4. Timezone Mismatch (AST vs PKT vs Dubai vs BST)</span>
              </div>
              <span className="text-[10px] font-mono bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">
                Clock Check
              </span>
            </div>
            <p className="text-slate-300 text-[12px]">
              Classes are master-scheduled in <b>AST (Arabia Standard Time / Saudi Arabia / GMT+3)</b>.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-violet-400 font-bold">AST (GMT+3)</div>
                <div className="text-slate-400 text-[10px]">Saudi Arabia / Qatar</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-indigo-400 font-bold">PKT (GMT+5)</div>
                <div className="text-slate-400 text-[10px]">Pakistan (+2 Hours)</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-cyan-400 font-bold">GST (GMT+4)</div>
                <div className="text-slate-400 text-[10px]">Dubai / UAE (+1 Hour)</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-emerald-400 font-bold">BST (GMT+1)</div>
                <div className="text-slate-400 text-[10px]">London (-2 Hours)</div>
              </div>
            </div>
            <p className="text-slate-400 text-[11px]">
              Use the timezone toggle in your portal header to convert all class schedules to your local device clock.
            </p>
          </div>

          {/* 5. Subject Enrollment Mismatch (For Students) */}
          <div className="p-4 rounded-xl bg-[#080B18] border border-blue-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <BookOpen className="w-4 h-4 shrink-0 text-blue-400" />
                <span>5. Course Enrollment Mismatch (Different Curriculum Code)</span>
              </div>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                Student Enrollment
              </span>
            </div>
            <p className="text-slate-300 text-[12px]">
              You will only see classes for courses where you have an <b>active enrolled subject</b>.
            </p>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 text-[11px] space-y-1.5">
              <p><b>• Example:</b> <i>English IGCSE 1 (0500)</i> vs <i>English as a Second Language IGCSE (0510)</i> vs <i>English Language O Level (1123)</i> are separate courses. If your class was scheduled under 0500, students enrolled under 0510 will not see it.</p>
              <p><b>• The Fix:</b> Check your "Enrolled Courses" tab in your dashboard. If a subject is missing from your list, message the VCS Administration to assign you to the correct cohort.</p>
            </div>
          </div>

          {/* 6. Browser Permissions & Pop-up Blocker */}
          <div className="p-4 rounded-xl bg-[#080B18] border border-rose-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <Video className="w-4 h-4 shrink-0 text-rose-400" />
                <span>6. Pop-up Blocker & Camera / Microphone Permissions</span>
              </div>
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                Browser Settings
              </span>
            </div>
            <p className="text-slate-300 text-[12px]">
              Google Meet opens in a separate tab or window. If your browser blocks pop-ups, the meeting will not launch.
            </p>
            <ul className="list-disc pl-5 text-slate-300 space-y-1 text-[11px]">
              <li>Look at the right side of your Chrome address bar for a blocked pop-up icon (🚫) and choose <b>"Always allow pop-ups from this site"</b>.</li>
              <li>Click the padlock icon (🔒) on the left of your address bar to ensure <b>Camera</b> and <b>Microphone</b> permissions are set to "Allow".</li>
            </ul>
          </div>

          {/* 7. Teacher Starting Policy */}
          {userRole === "teacher" && (
            <div className="p-4 rounded-xl bg-[#080B18] border border-teal-500/40 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-teal-400" />
                  <span>7. Teacher Starting Window & Missed Status</span>
                </div>
                <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                  Faculty Policy
                </span>
              </div>
              <p className="text-slate-300 text-[12px]">
                Teachers must click <b>Start Class</b> within 60 minutes of the scheduled start time.
              </p>
              <p className="text-teal-200 text-[11px]">
                If a teacher does not enter within 60 minutes, the class is automatically marked <b>Missed</b>. Ensure you click "Start Class" as soon as your 20-minute window unlocks.
              </p>
            </div>
          )}

          {/* 8. Emergency Admin Backup */}
          <div className="p-4 rounded-xl bg-[#080B18] border border-emerald-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <MessageSquare className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>8. Instant WhatsApp Admin Helpline</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Direct Help
              </span>
            </div>
            <p className="text-slate-300 text-[12px]">
              If you still cannot enter your meeting, reach out immediately to VCS Admin on WhatsApp:
            </p>
            <p className="text-slate-400 text-[11px]">
              The School Administrator can copy the direct Google Meet link from the Admin Panel and send it to your WhatsApp group so you can join in seconds.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1E2648] bg-[#0A0E20] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Virtual City School Classroom Operations</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            I Understand, Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};

export default SessionTroubleshootModal;
