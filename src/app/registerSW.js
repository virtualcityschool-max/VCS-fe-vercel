// Installs the app's service worker (public/sw.js) and shows a small
// "New version available – Refresh" bar when an update is waiting.
// The bar never reloads by itself, so a class or a half-filled form is safe.

const BAR_ID = "vcs-update-bar";

function showUpdateBar(worker) {
  if (document.getElementById(BAR_ID)) return;
  const bar = document.createElement("div");
  bar.id = BAR_ID;
  bar.setAttribute("role", "status");
  bar.className =
    "theme-keep fixed left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-2xl " +
    "border border-indigo-400/40 bg-slate-900 px-4 py-3 text-base text-white shadow-2xl " +
    "w-[calc(100%-2rem)] max-w-md";
  bar.style.bottom = "calc(16px + env(safe-area-inset-bottom))";
  const text = document.createElement("span");
  text.className = "flex-1";
  text.textContent = "New version of VCS available";
  const refresh = document.createElement("button");
  refresh.type = "button";
  refresh.className = "min-h-[44px] rounded-xl bg-indigo-500 px-4 font-semibold hover:bg-indigo-400";
  refresh.textContent = "Refresh";
  refresh.onclick = () => {
    refresh.disabled = true;
    worker.postMessage("SKIP_WAITING");
  };
  const later = document.createElement("button");
  later.type = "button";
  later.className = "min-h-[44px] min-w-[44px] rounded-xl px-2 text-slate-300 hover:text-white";
  later.setAttribute("aria-label", "Later");
  later.textContent = "Later";
  later.onclick = () => bar.remove();
  bar.append(text, refresh, later);
  document.body.appendChild(bar);
}

export function registerServiceWorker() {
  // Chrome/Edge/Android offer "Install" through this event; keep it for the
  // Install button on /download (it may fire before the visitor gets there).
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__vcsInstallPrompt = e;
    dispatchEvent(new Event("vcs-install-ready"));
  });
  addEventListener("appinstalled", () => {
    window.__vcsInstallPrompt = null;
    dispatchEvent(new Event("vcs-install-ready"));
  });
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  // The prerender robot (puppeteer) must not install it.
  if (navigator.webdriver) return;

  const start = () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        const hadController = Boolean(navigator.serviceWorker.controller);
        const watch = (w) => {
          if (!w) return;
          w.addEventListener("statechange", () => {
            // "installed" with an existing controller = an update is waiting.
            if (w.state === "installed" && navigator.serviceWorker.controller) showUpdateBar(w);
          });
        };
        if (reg.waiting && hadController) showUpdateBar(reg.waiting);
        watch(reg.installing);
        reg.addEventListener("updatefound", () => watch(reg.installing));
        // Installed apps can stay open for days: look for updates now and then.
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      })
      .catch(() => {});

    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // Only after the user pressed Refresh (first install also fires this).
      if (reloaded || !document.getElementById(BAR_ID)) return;
      reloaded = true;
      location.reload();
    });
  };

  // After the page is up, so it never slows the first load.
  if (document.readyState === "complete") setTimeout(start, 3000);
  else addEventListener("load", () => setTimeout(start, 3000), { once: true });

  // Signed out: forget the offline timetable and this device's class reminders.
  addEventListener("vcs-signed-out", () => {
    import("./offlineTimetable").then((m) => m.clearTimetable()).catch(() => {});
    import("./push").then((m) => m.unsubscribeThisDevice()).catch(() => {});
  });
}

/** True when running as the installed app (Home Screen / Dock / installed window). */
export function isInstalledApp() {
  try {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  } catch {
    return false;
  }
}
