import { useEffect, useState } from "react";
import { Bell, BellOff, Download } from "lucide-react";
import { isInstalledApp } from "../../app/registerSW";

// "Turn on class reminders" — a push notification 15 minutes before each class.
// Asks the browser for permission only when the button is tapped.
// compact: one line (dashboards); full: always shown with on/off (profile).
const DISMISS_KEY = "vcs_reminders_card_dismissed";

export default function ClassRemindersCard({ compact = true }) {
  // Hidden on the website until the founder has tested the app; shown only
  // inside the installed app (opened from the Home Screen / Dock).
  const [state, setState] = useState(() => (isInstalledApp() ? "loading" : "unavailable"));
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return compact && localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    let live = true;
    if (!isInstalledApp()) return undefined;
    import("../../app/push")
      .then((m) => m.getReminderState())
      .then((s) => live && setState(s))
      .catch(() => live && setState("unsupported"));
    return () => { live = false; };
  }, []);

  const run = async (fn) => {
    setBusy(true);
    try {
      const m = await import("../../app/push");
      setState(await m[fn]());
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading" || state === "unsupported" || state === "unavailable") return null;
  if (compact && (dismissed || state === "on")) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* private mode */ }
    setDismissed(true);
  };

  return (
    <div className="rounded-2xl border border-slate-800 border-l-4 border-l-indigo-500 bg-indigo-500/10 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
          {state === "on" ? <Bell size={20} aria-hidden /> : state === "blocked" ? <BellOff size={20} aria-hidden /> : <Bell size={20} aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-white">Class reminders</p>
          {state === "install-first" && (
            <p className="mt-1 text-sm text-slate-300">
              On iPhone and iPad, reminders work in the <strong className="text-indigo-300 font-semibold">VCS app</strong>. Install it first, then turn them on there.
            </p>
          )}
          {state === "off" && (
            <p className="mt-1 text-sm text-slate-300">Get a notification <strong className="text-emerald-300 font-semibold">15 minutes before</strong> each class on this device.</p>
          )}
          {state === "on" && <p className="mt-1 text-sm text-slate-300">On for this device: you'll get a notification 15 minutes before each class.</p>}
          {state === "blocked" && (
            <p className="mt-1 text-sm text-slate-300">Notifications are blocked for VCS. Allow them in this device's settings (Notifications → VCS), then come back here.</p>
          )}
          {state === "error" && <p className="mt-1 text-sm text-rose-300">That didn't work. Check your connection and try again.</p>}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {state === "install-first" && (
              <a href="/app" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500">
                <Download size={16} aria-hidden /> Get the app
              </a>
            )}
            {(state === "off" || state === "error") && (
              <button type="button" disabled={busy} onClick={() => run("enableReminders")}
                className="min-h-[44px] rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
                {busy ? "Turning on…" : "Turn on class reminders"}
              </button>
            )}
            {state === "on" && !compact && (
              <button type="button" disabled={busy} onClick={() => run("disableReminders")}
                className="min-h-[44px] rounded-xl border border-slate-600 px-4 text-sm font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-60">
                {busy ? "Turning off…" : "Turn off"}
              </button>
            )}
            {compact && state !== "on" && (
              <button type="button" onClick={dismiss} className="min-h-[44px] rounded-xl px-3 text-sm text-slate-400 hover:text-white">
                Not now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
