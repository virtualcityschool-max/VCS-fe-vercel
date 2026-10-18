import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { useSeo } from "../../hooks/useSeo";
import { SITE_URL } from "../../data/examDates";
import { guideBySlug, SUBJECT_GUIDES } from "../../data/subjectGuides";
import GuideBody from "../../components/subjects/GuideBody";
import { ACCENT, guideSections } from "../../components/subjects/guideSections";

// One Cambridge subject explained for students: what it is, why it is taught,
// how it is examined and graded, and how to do well. Content lives in
// src/data/subjectGuides; every exam fact there comes from the official syllabus.

export const SubjectGuidesIndex = () => {
  useSeo({
    title: "Cambridge Subject Guides — O Level & A Level | Virtual City School",
    description: "What each Cambridge O Level and A Level subject covers, how it is examined and graded, and how to do well — built from the official syllabus.",
    url: `${SITE_URL}/subjects`,
  });
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link><span>/</span><span className="text-slate-300">Subject Guides</span>
        </nav>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Cambridge Subject Guides</h1>
        <p className="text-slate-400 max-w-2xl mb-10">
          Everything a student should know before and during a Cambridge subject — exam pattern, topics, question types, grades and why the subject is worth loving. Built from Cambridge's official syllabus.
        </p>
        {["O Level", "AS & A Level"].map((lvl) => (
          <section key={lvl} className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">{lvl}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBJECT_GUIDES.filter((g) => g.level === lvl).map((g) => (
                <Link key={g.slug} to={`/subjects/${g.slug}`} className="group rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-indigo-500/40 p-5 transition">
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">{g.level} · {g.code}</div>
                  <div className="text-lg font-bold text-white mb-2">{g.subject}</div>
                  <p className="text-sm text-slate-400 line-clamp-3">{g.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 group-hover:text-white">Read the guide <ChevronRight className="w-4 h-4" /></span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

const SubjectGuidePage = () => {
  const { slug } = useParams();
  const g = guideBySlug(slug);
  const accent = ACCENT[g?.accent] || ACCENT.violet;

  const sections = useMemo(() => guideSections(g), [g]);

  // Highlight the section being read.
  const [active, setActive] = useState("facts");
  useEffect(() => {
    if (!sections.length) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [sections]);

  // Keep the table of contents in view while reading. position: sticky does not
  // work on this site (html/body have overflow-x: hidden), so the box is fixed
  // and placed over its column by hand, stopping at the end of the article.
  const tocSlotRef = useRef(null);
  const tocBoxRef = useRef(null);
  const gridRef = useRef(null);
  useEffect(() => {
    const place = () => {
      const slot = tocSlotRef.current, box = tocBoxRef.current, grid = gridRef.current;
      if (!slot || !box || !grid || slot.offsetParent === null) return;
      const r = slot.getBoundingClientRect();
      const end = grid.getBoundingClientRect().bottom;
      const top = Math.min(Math.max(24, r.top), end - box.offsetHeight);
      box.style.position = "fixed";
      box.style.left = `${r.left}px`;
      box.style.width = `${r.width}px`;
      box.style.top = `${top}px`;
      box.style.maxHeight = `${window.innerHeight - Math.max(top, 24) - 24}px`;
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => { window.removeEventListener("scroll", place); window.removeEventListener("resize", place); };
  }, [g]);

  useSeo({
    title: g ? `${g.title} — Student Guide | Virtual City School` : "Subject guide | Virtual City School",
    description: g ? `${g.title}: exam pattern, topics, question types, grades and study tips — from the official Cambridge syllabus for ${g.syllabusYears}.` : "",
    url: g ? `${SITE_URL}/subjects/${g.slug}` : `${SITE_URL}/subjects`,
  });

  if (!g) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-slate-400 mb-4">We don't have a guide for this subject yet.</p>
          <Link to="/subjects" className="text-indigo-300 hover:text-white font-semibold">See all subject guides</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
          <Link to="/" className="hover:text-white transition">Home</Link><span>/</span>
          <Link to="/subjects" className="hover:text-white transition">Subject Guides</Link><span>/</span>
          <span className="text-slate-300">{g.subject} {g.code}</span>
        </nav>

        <header className="mb-8 max-w-4xl">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-[0.2em] mb-4 ${accent.soft} ${accent.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} /> Cambridge {g.level} · {g.code}
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-4">{g.title}</h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">{g.tagline}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Checked against the official Cambridge syllabus for exams in {g.syllabusYears} · {g.verifiedOn}
          </p>
          {g.notice && (
            <p className="mt-3 text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 leading-relaxed">{g.notice}</p>
          )}
        </header>

        {/* Phone: table of contents as a scrollable strip */}
        <div className="lg:hidden sticky top-0 z-20 -mx-4 px-4 py-2 bg-[#020617]/95 backdrop-blur border-b border-white/5 mb-2">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${active === s.id ? "bg-indigo-500/20 border-indigo-400/50 text-white" : "border-white/10 text-slate-400"}`}>
                {s.n}. {s.title}
              </a>
            ))}
          </div>
        </div>

        <div ref={gridRef} className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
          <aside ref={tocSlotRef} className="hidden lg:block">
            <div ref={tocBoxRef} className="z-10 rounded-2xl border border-white/10 bg-[#0a1024]/95 backdrop-blur p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Table of contents</span>
                <span className="text-[10px] font-mono text-indigo-300">{sections.length} sections</span>
              </div>
              <ol className="space-y-0.5">
                {sections.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition ${active === s.id ? "bg-indigo-500/15 text-white border border-indigo-500/30" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
                        <Icon className="w-4 h-4 shrink-0" /> <span className="truncate">{s.n}. {s.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
              {g.sibling && (
                <Link to={`/subjects/${g.sibling.slug}`} className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 hover:text-white hover:border-indigo-500/40">
                  <span>{g.level === "O Level" ? "Next level" : "Also read"}: {g.sibling.label}</span><ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </aside>

          <div className="min-w-0">
            <GuideBody g={g} sections={sections} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default SubjectGuidePage;
