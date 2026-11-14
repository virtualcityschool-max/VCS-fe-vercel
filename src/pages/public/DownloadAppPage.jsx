import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Smartphone, Tablet, Laptop, Download, Bell, WifiOff, Video, CheckCircle2, ShieldCheck, Share, PlusSquare, MoreVertical, Info } from "lucide-react";
import { useSeo } from "../../hooks/useSeo";
import { SITE_URL } from "../../data/examDates";
import { isInstalledApp } from "../../app/registerSW";

// /download — "Get the App": install the VCS portal as an app on iPhone, iPad,
// Android, Mac and Windows (it is the same portal, installed from the browser;
// no app store). The device is detected after the page loads, so the
// pre-built HTML (and Google) see every set of steps.

const PAGE_URL = `${SITE_URL}/download`;
const MEET_IOS = "https://apps.apple.com/app/google-meet/id1096918571";
const MEET_ANDROID = "https://play.google.com/store/apps/details?id=com.google.android.apps.tachyon";

const DEVICES = [
  {
    id: "iphone",
    label: "iPhone & iPad",
    icon: Smartphone,
    accent: "indigo",
    steps: [
      { icon: Smartphone, text: <>Open <strong className="text-indigo-300 font-semibold">virtualcityschool.com</strong> in <strong className="text-indigo-300 font-semibold">Safari</strong>.</> },
      { icon: Share, text: <>Tap the <strong className="text-indigo-300 font-semibold">Share</strong> button (the square with an arrow pointing up). On iPhone it's at the bottom of the screen, on iPad at the top.</> },
      { icon: PlusSquare, text: <>Scroll down and tap <strong className="text-indigo-300 font-semibold">Add to Home Screen</strong>. If you see "Open as Web App", leave it switched on.</> },
      { icon: CheckCircle2, text: <>Tap <strong className="text-indigo-300 font-semibold">Add</strong>. The VCS icon appears on your Home Screen. Open it and sign in once.</> },
    ],
    note: "Using Chrome or another browser on iPhone? On recent iOS versions the Share button there also has Add to Home Screen. If you can't find it, open the page in Safari.",
  },
  {
    id: "android",
    label: "Android",
    icon: Smartphone,
    accent: "emerald",
    steps: [
      { icon: Smartphone, text: <>Open <strong className="text-emerald-300 font-semibold">virtualcityschool.com</strong> in <strong className="text-emerald-300 font-semibold">Chrome</strong>.</> },
      { icon: Download, text: <>Tap <strong className="text-emerald-300 font-semibold">Install</strong> on this page, or the "Install app" message Chrome shows at the bottom.</> },
      { icon: MoreVertical, text: <>No Install button? Tap the <strong className="text-emerald-300 font-semibold">⋮ menu</strong> (top right) → <strong className="text-emerald-300 font-semibold">Install app</strong> (or "Add to Home screen").</> },
      { icon: CheckCircle2, text: <>The VCS icon appears with your apps. Open it and sign in once.</> },
    ],
  },
  {
    id: "mac",
    label: "Mac",
    icon: Laptop,
    accent: "cyan",
    steps: [
      { icon: Laptop, text: <><strong className="text-cyan-300 font-semibold">Safari</strong> (macOS Sonoma or later): open virtualcityschool.com, then <strong className="text-cyan-300 font-semibold">File → Add to Dock</strong>.</> },
      { icon: Download, text: <><strong className="text-cyan-300 font-semibold">Chrome or Edge</strong>: click <strong className="text-cyan-300 font-semibold">Install</strong> on this page, or the install icon at the right end of the address bar.</> },
      { icon: CheckCircle2, text: <>VCS opens in its own window from the Dock or Launchpad. Sign in once.</> },
    ],
  },
  {
    id: "windows",
    label: "Windows",
    icon: Laptop,
    accent: "violet",
    steps: [
      { icon: Laptop, text: <>Open virtualcityschool.com in <strong className="text-violet-300 font-semibold">Chrome or Edge</strong>.</> },
      { icon: Download, text: <>Click <strong className="text-violet-300 font-semibold">Install</strong> on this page, or the install icon at the right end of the address bar.</> },
      { icon: CheckCircle2, text: <>VCS is added to the Start menu and opens in its own window. Sign in once.</> },
    ],
  },
];

const ACCENT = {
  indigo: { ring: "border-indigo-400/30", bg: "bg-indigo-500/10", icon: "bg-indigo-500/15 text-indigo-200", tab: "bg-indigo-500/20 text-indigo-200 border-indigo-400/40" },
  emerald: { ring: "border-emerald-400/30", bg: "bg-emerald-500/10", icon: "bg-emerald-500/15 text-emerald-200", tab: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40" },
  cyan: { ring: "border-cyan-400/30", bg: "bg-cyan-500/10", icon: "bg-cyan-500/15 text-cyan-200", tab: "bg-cyan-500/20 text-cyan-200 border-cyan-400/40" },
  violet: { ring: "border-violet-400/30", bg: "bg-violet-500/10", icon: "bg-violet-500/15 text-violet-200", tab: "bg-violet-500/20 text-violet-200 border-violet-400/40" },
};

const FEATURES = [
  { icon: Video, title: "Join live classes", text: "Your timetable and Join class button, one tap from your Home Screen. Classes open in Google Meet." },
  { icon: Bell, title: "Class reminders", text: "Turn them on in the app to get a notification 15 minutes before each class." },
  { icon: WifiOff, title: "Works when the internet drops", text: "If you lose connection, the app still shows your upcoming classes." },
  { icon: ShieldCheck, title: "Same account, nothing new", text: "Same login, menus and dashboard as the website. Free, no app store, updates itself." },
];

const FAQ = [
  { q: "Is the VCS app free?", a: "Yes. It's the Virtual City School portal installed from your browser. There's nothing to pay and no app store account needed." },
  { q: "Do I need a new account?", a: "No. Sign in with the same email and password you use on the website. On iPhone and iPad the app keeps its own sign-in, so you sign in once more after installing." },
  { q: "How do I join a class from the app?", a: "Open the app, go to your classes and tap Join class. The class opens in the Google Meet app if it's installed, otherwise in your browser." },
  { q: "How do I get class reminders?", a: "Open the VCS app, tap Turn on class reminders on your dashboard and allow notifications. On iPhone and iPad this needs iOS 16.4 or later and the app installed to the Home Screen." },
  { q: "How do I update the app?", a: "It updates itself. When a new version is ready you'll see a small 'New version available' bar; tap Refresh when it suits you." },
];

function detectDevice() {
  const ua = navigator.userAgent;
  if (/iPhone|iPod/.test(ua) || /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "iphone";
  if (/Android/.test(ua)) return "android";
  if (/Mac/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "windows";
  return "android";
}

const MeetButton = ({ href, store, label }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="theme-keep inline-flex min-h-[52px] items-center gap-3 rounded-xl border border-white/15 bg-black px-4 py-2 text-white hover:border-white/40 transition">
    {store === "apple" ? (
      <i className="fab fa-apple text-2xl" aria-hidden="true" />
    ) : (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 2.5v19l10-9.5z" fill="#22d3ee" /><path d="M4 2.5l13 7.3-3 2.7z" fill="#10b981" /><path d="M4 21.5l13-7.3-3-2.7z" fill="#f43f5e" /><path d="M17 9.8l3.4 1.9c.8.5.8 1.2 0 1.7L17 15.2 14 12.5z" fill="#f59e0b" /></svg>
    )}
    <span className="text-left leading-tight">
      <span className="block text-xs text-slate-300">{store === "apple" ? "Download on the" : "Get it on"}</span>
      <span className="block text-base font-semibold">{label}</span>
    </span>
  </a>
);

const DownloadAppPage = () => {
  const [device, setDevice] = useState(null);
  const [tab, setTab] = useState("iphone");
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installMsg, setInstallMsg] = useState("");

  useEffect(() => {
    const d = detectDevice();
    setDevice(d);
    setTab(d);
    setInstalled(isInstalledApp());
    const sync = () => setCanInstall(Boolean(window.__vcsInstallPrompt));
    sync();
    addEventListener("vcs-install-ready", sync);
    return () => removeEventListener("vcs-install-ready", sync);
  }, []);

  const install = async () => {
    const ev = window.__vcsInstallPrompt;
    if (!ev) return;
    ev.prompt();
    const { outcome } = await ev.userChoice.catch(() => ({ outcome: "dismissed" }));
    window.__vcsInstallPrompt = null;
    setCanInstall(false);
    setInstallMsg(outcome === "accepted" ? "Installing… VCS will appear with your apps." : "No problem: you can install it any time from this page.");
  };

  useSeo({
    title: "Get the VCS App – iPhone, iPad, Android & Mac | Virtual City School",
    description: "Install the free Virtual City School app on iPhone, iPad, Android, Mac or Windows: join live O Level and A Level classes, get class reminders and see your timetable offline. Same login as the website.",
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "HowTo",
        name: "How to install the Virtual City School app on iPhone and iPad",
        step: ["Open virtualcityschool.com in Safari.", "Tap the Share button.", "Tap Add to Home Screen.", "Tap Add, then open VCS and sign in."].map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
      },
      { "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Get the App", item: PAGE_URL }] },
    ],
  });

  const current = DEVICES.find((d) => d.id === tab) || DEVICES[0];
  const a = ACCENT[current.accent];

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <article className="max-w-[1920px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link><span>/</span>
          <span className="text-slate-300">Get the App</span>
        </nav>

        <header className="mb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-[0.2em] mb-5">Free · iPhone · iPad · Android · Mac</span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
              Get the <span className="text-gradient">VCS app</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
              Your classes, timetable, assignments and materials in an app on your phone, tablet or computer. It's the same portal you use on the website, with the <strong className="text-emerald-300 font-semibold">same login</strong>, installed in under a minute.
            </p>

            {installed ? (
              <p className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-base text-emerald-200">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> You're all set: you're using the VCS app.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {canInstall && (
                  <button type="button" onClick={install}
                    className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-indigo-600 px-6 text-base font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition">
                    <Download className="w-5 h-5" aria-hidden="true" /> Install VCS
                  </button>
                )}
                <a href="#steps" className="inline-flex min-h-[52px] items-center rounded-2xl border border-white/15 px-6 text-base font-semibold text-slate-200 hover:bg-white/5 transition">
                  {device ? `Steps for ${DEVICES.find((d) => d.id === device)?.label}` : "See the steps"}
                </a>
              </div>
            )}
            {installMsg && <p role="status" className="mt-3 text-base text-slate-200">{installMsg}</p>}
          </div>
          <figure>
            <img src="/images/about/online-class.webp" srcSet="/images/about/online-class-800.webp 800w, /images/about/online-class.webp 1400w" sizes="(max-width: 1024px) 100vw, 640px" alt="A student in a live online class" width="1400" height="1000" className="w-full aspect-[7/5] object-cover rounded-3xl border border-white/10 shadow-2xl shadow-black/40" />
          </figure>
        </header>

        <section className="mb-14 grid sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="What the app does">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-white/10 border-t-4 border-t-indigo-500 bg-white/[0.04] p-5">
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-200 mb-3"><Icon className="w-5 h-5" aria-hidden="true" /></span>
              <h2 className="text-lg font-bold mb-1">{title}</h2>
              <p className="text-base text-slate-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </section>

        <section id="steps" className="mb-14 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">How to install</h2>
          <p className="text-slate-300 text-base mb-6 max-w-3xl">Choose your device. {device && "We've picked yours."}</p>
          <div role="tablist" aria-label="Device" className="flex flex-wrap gap-2 mb-6">
            {DEVICES.map((d) => {
              const Icon = d.id === "iphone" ? Tablet : d.icon;
              const on = d.id === tab;
              return (
                <button key={d.id} type="button" role="tab" aria-selected={on} onClick={() => setTab(d.id)}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-base font-semibold transition ${on ? ACCENT[d.accent].tab : "border-white/10 text-slate-300 hover:bg-white/5"}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" /> {d.label}{device === d.id && <span className="text-xs font-bold uppercase tracking-widest opacity-80">· yours</span>}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className={`rounded-3xl border ${a.ring} ${a.bg} p-5 md:p-8`}>
            <ol className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {current.steps.map(({ icon: Icon, text }, i) => (
                <li key={i} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex w-10 h-10 items-center justify-center rounded-full ${a.icon}`}><Icon className="w-5 h-5" aria-hidden="true" /></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step {i + 1}</span>
                  </div>
                  <p className="text-base text-slate-200 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
            {current.note && (
              <p className="mt-5 flex items-start gap-2 text-base text-slate-200"><Info className="w-5 h-5 mt-0.5 shrink-0 text-amber-300" aria-hidden="true" /> {current.note}</p>
            )}
          </div>
        </section>

        <section className="mb-14 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 md:p-8 grid lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight mb-2"><Video className="w-6 h-6 text-emerald-300" aria-hidden="true" /> Also install Google Meet</h2>
            <p className="text-base text-slate-200 max-w-3xl">Live classes run on <strong className="text-emerald-300 font-semibold">Google Meet</strong>. On a phone or tablet, install the free Meet app so Join class opens straight into your class.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <MeetButton href={MEET_IOS} store="apple" label="App Store" />
            <MeetButton href={MEET_ANDROID} store="google" label="Google Play" />
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">Questions</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-bold mb-1">{f.q}</h3>
                <p className="text-base text-slate-300 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-base text-slate-300">Need help? Message us on <a href="https://wa.me/966556687417" target="_blank" rel="noopener noreferrer" className="text-emerald-300 font-semibold hover:text-white">WhatsApp</a>.</p>
        </section>
      </article>
    </main>
  );
};

export default DownloadAppPage;
