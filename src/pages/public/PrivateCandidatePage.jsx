import { Link } from "react-router-dom";
import { MapPin, UserCheck, CreditCard, FileCheck2, IdCard, Award, AlertTriangle, ExternalLink, CalendarDays } from "lucide-react";
import { useSeo } from "../../hooks/useSeo";
import { SITE_URL } from "../../data/examDates";
import { registrationWindows } from "../../utils/examSeason";
import Reveal from "../../components/ui/Reveal";

// How a student who studies online (or at home) enters the official Cambridge
// O Level, IGCSE and AS & A Level exams as a private candidate, in Pakistan
// and the Gulf. Facts come from Cambridge International's private-candidate
// page and the British Council's private-candidate registration page (see
// SOURCES); fees and exact deadlines change every series, so the page sends
// families to those sources for them instead of quoting numbers.

const PAGE_URL = `${SITE_URL}/private-candidate`;

const SOURCES = [
  { label: "Cambridge International: private candidates", href: "https://www.cambridgeinternational.org/exam-administration/private-candidates" },
  { label: "British Council: private candidate registration", href: "https://internationalschools.britishcouncil.org/students/private-candidates/registration" },
  { label: "British Council School Registration System (SRS)", href: "https://schoolexams.britishcouncil.org/" },
  { label: "British Council Pakistan: private candidates", href: "https://www.britishcouncil.pk/exam/international-schools-igcse-a-levels/private-candidates" },
];

const STEPS = [
  { icon: MapPin, title: "Choose where to register", text: "In Pakistan, private candidates register with the British Council. In the Gulf, register with the British Council in your country or with a Cambridge school that accepts private candidates. Not every school does, so ask first." },
  { icon: UserCheck, title: "Register online", text: "The British Council uses its online School Registration System (SRS). You need a valid passport or national ID. For a student under 18, a parent or guardian completes the registration." },
  { icon: CreditCard, title: "Pay the entry fees", text: "Fees are shown in the registration system for each subject. Your registration isn't processed until payment is received." },
  { icon: FileCheck2, title: "Check your statement of entry", text: "Check every subject and paper code on it. Changes after the regular deadline cost a late fee." },
  { icon: IdCard, title: "Sit the exams", text: "Take your ID to every exam. Your centre tells you the venue and times." },
  { icon: Award, title: "Results and certificates", text: "Results and certificates come through the centre or exam provider you registered with." },
];

const FAQ = [
  { q: "What is a private candidate?", a: "Cambridge calls students who don't attend one of its registered schools, or who study at a Cambridge school registered as online, private candidates. They enter the same exams and receive the same certificates as school candidates." },
  { q: "Who registers private candidates in Pakistan?", a: "The British Council registers private candidates for Cambridge O Level, IGCSE and AS & A Level in Pakistan, through its online School Registration System." },
  { q: "When do I register for the May/June exams?", a: "Registration usually opens around the end of November and closes in late February, with late entries (with a penalty fee) until early April. Exact dates are set each year in the British Council's registration system." },
  { q: "When do I register for the October/November exams?", a: "Registration usually opens around early August and closes in mid-September, with late entries (with a penalty fee) until early October." },
  { q: "Can I take science practicals as a private candidate?", a: "O Level sciences have a written Alternative to Practical paper that most private candidates take. AS & A Level sciences have a practical paper, so you need a centre that runs it for your subject; confirm this before you register." },
  { q: "Can I get a refund if I withdraw?", a: "The British Council gives a full refund of entry fees only if you withdraw in writing by the last regular entry date; administration fees may apply. After that, refunds are generally not given." },
];

const PrivateCandidatePage = () => {
  const windows = registrationWindows();

  useSeo({
    title: "O Level & A Level Private Candidate Registration – Pakistan & Gulf Guide",
    description: `How to register for Cambridge O Level, IGCSE and A Level exams as a private candidate in Pakistan, Saudi Arabia, the UAE and the Gulf: who registers you, documents, fees, and when ${windows[0].label} registration opens and closes.`,
    url: PAGE_URL,
    jsonLd: [
      {
        "@type": "HowTo",
        name: "How to register for Cambridge exams as a private candidate",
        step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Private candidates", item: PAGE_URL },
        ],
      },
    ],
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <article className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link><span>/</span>
          <span className="text-slate-300">Private candidates</span>
        </nav>

        <header className="mb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-[0.2em] mb-5">Cambridge exams</span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
              O Level & A Level <span className="text-gradient">private candidate registration</span>
            </h1>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl mb-4">
              If your child studies online or at home, they sit the official Cambridge O Level, IGCSE or AS & A Level exams as a <strong className="text-cyan-300 font-semibold">private candidate</strong>. They take the same papers and get the same certificate as a school candidate; the difference is that the family registers with an exam centre itself.
            </p>
            <p className="text-slate-300 text-base leading-relaxed max-w-3xl">
              This guide explains the steps for families in Pakistan, Saudi Arabia, the UAE, Qatar, Kuwait, Bahrain and Oman. Fees and exact deadlines change every series, so we link to the official pages for them.
            </p>
          </div>
          <figure>
            <img src="/images/about/students.webp" srcSet="/images/about/students-800.webp 800w, /images/about/students.webp 1400w" sizes="(max-width: 1024px) 100vw, 640px" alt="Students preparing for exams" width="1400" height="1000" className="w-full aspect-[7/5] object-cover rounded-3xl border border-white/10 shadow-2xl shadow-black/40" />
          </figure>
        </header>

        <Reveal className="mb-14">
          <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-black tracking-tight mb-2"><CalendarDays className="w-7 h-7 text-amber-300" aria-hidden="true" /> When to register</h2>
          <p className="text-slate-300 text-base mb-6 max-w-3xl">The British Council's usual registration windows for the next two series. Exact dates are confirmed each year in its registration system.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {windows.map((w) => (
              <div key={w.label} className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
                <h3 className="text-xl font-black mb-3">{w.label} series</h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
                  <dt className="text-slate-300">Opens</dt><dd className="font-semibold text-white">around {w.opens}</dd>
                  <dt className="text-slate-300">Closes</dt><dd className="font-semibold text-white">{w.closes}</dd>
                  <dt className="text-slate-300">Late entries</dt><dd className="font-semibold text-amber-200">until {w.late}, with a penalty fee</dd>
                </dl>
              </div>
            ))}
          </div>
          <p className="mt-4 text-base text-slate-300">Exam days and results dates are on our <Link to="/exam-dates" className="text-indigo-300 hover:text-white font-semibold">Cambridge exam dates</Link> page.</p>
        </Reveal>

        <Reveal className="mb-14">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">Step by step</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEPS.map(({ icon, title, text }, i) => { const Icon = icon; return (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-200"><Icon className="w-5 h-5" aria-hidden="true" /></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step {i + 1}</span>
                </div>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-base text-slate-300 leading-relaxed">{text}</p>
              </li>
            );})}
          </ol>
        </Reveal>

        <Reveal className="mb-14 grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6">
            <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight mb-4"><AlertTriangle className="w-6 h-6 text-rose-300" aria-hidden="true" /> Check before you register</h2>
            <ul className="space-y-3 text-base text-slate-200 leading-relaxed">
              <li><strong className="text-rose-200 font-semibold">Practical, coursework and speaking papers.</strong> Not every centre offers these to private candidates. Choose papers your centre can run.</li>
              <li><strong className="text-rose-200 font-semibold">One level per subject per series.</strong> The British Council doesn't let you enter the same subject at two levels with the same exam board in one series, for example IGCSE and A Level Physics.</li>
              <li><strong className="text-rose-200 font-semibold">Exact paper codes.</strong> Many subjects have options (for example Maths 9709 Mechanics or Statistics). Each subject guide lists the papers.</li>
              <li><strong className="text-rose-200 font-semibold">Withdrawing.</strong> A full refund is only given if you withdraw in writing by the last regular entry date.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
            <h2 className="text-2xl font-black tracking-tight mb-4">Preparing with Virtual City School</h2>
            <p className="text-base text-slate-200 leading-relaxed mb-4">
              We teach Cambridge <Link to="/online-o-level" className="text-emerald-300 font-semibold hover:text-white">O Level</Link> and <Link to="/online-a-level" className="text-emerald-300 font-semibold hover:text-white">AS & A Level</Link> in live online classes, and run timed <a href="/mocks/exams" className="text-emerald-300 font-semibold hover:text-white">mock exams</a> on official past papers, marked by our teachers. Each <Link to="/subjects" className="text-emerald-300 font-semibold hover:text-white">subject guide</Link> lists the papers, so you know which codes to enter.
            </p>
            <p className="text-base text-slate-300">Questions about choosing papers? Message us on WhatsApp from any page.</p>
          </div>
        </Reveal>

        <Reveal className="mb-14">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">Questions families ask</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-bold mb-2">{f.q}</h3>
                <p className="text-base text-slate-300 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <h2 className="text-xl font-black tracking-tight mb-3">Official sources</h2>
          <ul className="space-y-2">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-base text-indigo-300 hover:text-white">
                  <ExternalLink className="w-4 h-4" aria-hidden="true" /> {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-slate-400">Checked against these pages on 6 November 2026.</p>
        </Reveal>
      </article>
    </main>
  );
};

export default PrivateCandidatePage;
