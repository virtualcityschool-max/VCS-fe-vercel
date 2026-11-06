import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video, ClipboardCheck, LineChart, GraduationCap, CalendarDays, Wallet, ChevronRight, CheckCircle2 } from "lucide-react";
import { useSeo } from "../../hooks/useSeo";
import { SITE_URL } from "../../data/examDates";
import { GUIDE_CATALOG, guideForCode } from "../../data/subjectGuides/catalog";
import COURSE_INDEX from "../../data/courseIndex.json";
import { coursesService } from "../../services/coursesService";
import { upcomingSeries, mockExamsHref } from "../../utils/examSeason";
import Reveal from "../../components/ui/Reveal";

// "Online O Level school" and "Online A Level school" pages: what VCS teaches
// at that level, how live classes work, fees, and how students sit the real
// Cambridge exam. Written for the searches parents use ("online o level school
// in pakistan", "a level online classes"); the subject detail stays on the
// subject guides, which these pages link to.

const LEVELS = {
  o: {
    path: "/online-o-level",
    guideLevel: "O Level",
    name: "O Level",
    kicker: "Online Cambridge O Level",
    title: "Online O Level School in Pakistan & the Gulf – Live Cambridge Classes",
    description:
      "Live online Cambridge O Level classes taught by qualified teachers: Maths, Add Maths, Physics, Chemistry, Biology, English, Computer Science, Islamiyat, Pakistan Studies and Urdu. Monthly fee per subject, mock exams and exam guidance.",
    h1: ["Online O Level School:", "live Cambridge classes from home"],
    intro: [
      <>Virtual City School teaches <strong className="text-emerald-300 font-semibold">Cambridge O Level</strong> in live online classes for students in Pakistan, Saudi Arabia, the UAE, Qatar, Kuwait, Bahrain, Oman and beyond. Every class is taught in real time by a subject teacher, so your child can ask questions and get answers in the lesson.</>,
      "Choose one subject or a full set. Each subject is a monthly course with its own teacher, classes, assignments and quizzes, and your child sits the official Cambridge exam at the end.",
    ],
    image: { src: "/images/about/online-class.webp", srcSet: "/images/about/online-class-800.webp 800w, /images/about/online-class.webp 1400w", alt: "A student in a live online class on a laptop" },
    tone: { text: "text-emerald-300", soft: "bg-emerald-500/10 border-emerald-500/25", top: "border-t-emerald-400" },
    about: {
      heading: "What O Level is",
      paragraphs: [
        "Cambridge O Level is an international qualification for students aged about 14 to 16. Each subject is a separate qualification, graded A* to E, and examined by Cambridge International in the May/June or October/November series.",
        "Most students study O Level over two to three years and take their subjects across one or more exam series. Many then go on to Cambridge AS & A Level.",
        "For university admission in Pakistan, O Level results are converted to a Matric equivalent by the Inter Board Committee of Chairmen (IBCC). IBCC sets its own rules on how many subjects, and which ones, are needed, so check ibcc.edu.pk before choosing your subjects.",
      ],
    },
    faq: [
      { q: "Can my child do O Level fully online?", a: "Yes. Classes, assignments, quizzes and mock exams are online. The official Cambridge exams themselves are written on paper at an exam centre, which online students enter as private candidates." },
      { q: "Which O Level subjects do you teach?", a: "Mathematics (4024), Additional Mathematics (4037), Physics (5054), Chemistry (5070), Biology (5090), English Language (1123), Computer Science (2210), Islamiyat (2058), Pakistan Studies (2059), and Urdu as a First (3247) or Second (3248) Language. We also teach Cambridge IGCSE subjects." },
      { q: "How much are the O Level fees?", a: "Each subject is a monthly course. Current fees are shown on each course page and in the table on this page. If your family can't cover the fee, you can apply for free access." },
      { q: "How do science practicals work online?", a: "O Level Physics, Chemistry and Biology offer a written Alternative to Practical paper as well as a lab Practical Test. Students who study online usually take the Alternative to Practical paper; your exam centre confirms which one it offers." },
      { q: "When are classes held?", a: "Classes run on Arabian Standard Time (UTC+3), scheduled so students in Pakistan and across the Gulf can attend live. Message us on WhatsApp with your child's grade for exact timings." },
    ],
  },
  a: {
    path: "/online-a-level",
    guideLevel: "AS & A Level",
    name: "A Level",
    kicker: "Online Cambridge AS & A Level",
    title: "Online A Level School – Live AS & A2 Cambridge Classes for Pakistan & the Gulf",
    description:
      "Live online Cambridge AS and A2 Level classes: Mathematics, Physics, Chemistry, Biology, English Language, Computer Science and Urdu. Qualified teachers, monthly fee per subject, mock exams and private-candidate guidance.",
    h1: ["Online A Level School:", "live AS & A2 Cambridge classes"],
    intro: [
      <>Virtual City School teaches <strong className="text-violet-300 font-semibold">Cambridge International AS & A Level</strong> in live online classes, with separate AS and A2 courses for each subject. Students join from Pakistan, the Gulf and beyond, and every lesson is taught in real time by a subject teacher.</>,
      "It suits students whose city has no affordable A Level college, families who move between countries, and students who want to add a subject their college doesn't offer.",
    ],
    image: { src: "/images/about/students.webp", srcSet: "/images/about/students-800.webp 800w, /images/about/students.webp 1400w", alt: "Students studying together" },
    tone: { text: "text-violet-300", soft: "bg-violet-500/10 border-violet-500/25", top: "border-t-violet-400" },
    about: {
      heading: "How AS and A Level work",
      paragraphs: [
        "Cambridge International AS & A Level is the qualification universities ask for at age 16 to 19. AS Level is the first half of the course and is a qualification in its own right; the full A Level adds the second half, which we teach as A2.",
        "Many students take the AS papers at the end of the first year and the remaining A Level papers in the second year. Others sit all the papers at the end. Each subject's guide shows exactly which papers make up AS and A Level.",
        "A Level results are recognised for university admission in the UK, across the Gulf and internationally. For universities in Pakistan, IBCC converts them to an FSc/HSSC equivalent; check its current rules at ibcc.edu.pk.",
      ],
    },
    faq: [
      { q: "Can I study A Levels online and still sit the real exam?", a: "Yes. You learn in live online classes and enter the official Cambridge exams as a private candidate at an exam centre, such as the British Council in Pakistan or an approved centre in the Gulf." },
      { q: "Which A Level subjects do you teach?", a: "Mathematics (9709), Physics (9702), Chemistry (9701), Biology (9700), English Language (9093), Computer Science (9618) and Urdu, each as an AS course and an A2 course." },
      { q: "How much are the A Level fees?", a: "Each AS or A2 subject is a monthly course; current fees are in the table on this page and on each course page. You can also apply for free access if the fee is a barrier." },
      { q: "Do you teach the A Level science practicals?", a: "Cambridge AS & A Level sciences include practical papers. Private candidates need an exam centre that runs the practical paper for their subject, so confirm this with your centre before you register." },
      { q: "Can I take AS this year and A2 next year?", a: "Yes, that is the most common route. Each subject guide explains which papers count for AS and which complete the A Level." },
    ],
  },
};

const HOW = [
  { icon: Video, title: "Live classes", text: "Real-time lessons on Google Meet with your subject teacher, not recorded videos. Attendance is tracked." },
  { icon: ClipboardCheck, title: "Assignments and quizzes", text: "Set and marked by your child's own teacher, with marks in the student dashboard." },
  { icon: LineChart, title: "Progress you can see", text: "Assessments and evaluations through the course, visible to students and parents." },
  { icon: GraduationCap, title: "Mock exams", text: "Timed mocks on official Cambridge past papers, marked by VCS teachers. VCS students pay half." },
];

const coursesFor = (slug) => COURSE_INDEX.filter((c) => !c.canonical && c.code && guideForCode(c.code)?.slug === slug);
const stageLabel = (c, level) => (c.stage === "AS" ? "AS" : c.stage === "A2" ? "A2" : level === "O Level" ? "O Level" : "Class");

const OnlineLevelPage = ({ level }) => {
  const L = LEVELS[level];
  const url = `${SITE_URL}${L.path}`;
  const [next, after] = upcomingSeries();
  const guides = GUIDE_CATALOG.filter((g) => g.level === L.guideLevel);

  // Monthly fee per course, from the live course list (pre-built into the page).
  const [fees, setFees] = useState({});
  useEffect(() => {
    let live = true;
    coursesService.getAllCourses()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.results || [];
        if (live) setFees(Object.fromEntries(list.filter((c) => c.is_paid && Number(c.price) > 0).map((c) => [c.id, Number(c.price)])));
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useSeo({
    title: L.title,
    description: L.description,
    url,
    jsonLd: [
      {
        "@type": "FAQPage",
        mainEntity: L.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: `Online ${L.name}`, item: url },
        ],
      },
    ],
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <article className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
          <Link to="/" className="hover:text-white transition">Home</Link><span>/</span>
          <span className="text-slate-300">Online {L.name}</span>
        </nav>

        <header className="mb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-black uppercase tracking-[0.2em] mb-5 ${L.tone.soft} ${L.tone.text}`}>{L.kicker}</span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
              {L.h1[0]} <span className="text-gradient">{L.h1[1]}</span>
            </h1>
            <div className="space-y-4">
              {L.intro.map((p, i) => <p key={i} className="text-slate-200 text-base md:text-lg leading-relaxed max-w-3xl">{p}</p>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#subjects" className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-base font-semibold text-white transition">See subjects and fees <ChevronRight className="w-4 h-4" aria-hidden="true" /></a>
              <Link to="/private-candidate" className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-4 py-2.5 text-base font-semibold text-slate-200 hover:text-white hover:border-indigo-400/50 transition">How to sit the exam</Link>
            </div>
          </div>
          <figure className="relative">
            <img src={L.image.src} srcSet={L.image.srcSet} sizes="(max-width: 1024px) 100vw, 640px" alt={L.image.alt} width="1400" height="1000" className="w-full aspect-[7/5] object-cover rounded-3xl border border-white/10 shadow-2xl shadow-black/40" />
          </figure>
        </header>

        <Reveal className="mb-14">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">How online classes work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW.map(({ icon, title, text }) => { const Icon = icon; return (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <span className={`inline-flex w-10 h-10 items-center justify-center rounded-full mb-3 ${L.tone.soft} ${L.tone.text}`}><Icon className="w-5 h-5" aria-hidden="true" /></span>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-base text-slate-300 leading-relaxed">{text}</p>
              </div>
            );})}
          </div>
        </Reveal>

        <Reveal className="mb-14">
          <h2 id="subjects" className="text-2xl md:text-3xl font-black tracking-tight mb-2 scroll-mt-24">{L.name} subjects and monthly fees</h2>
          <p className="text-slate-300 text-base mb-6 max-w-3xl">Each subject has a guide to its syllabus and papers, live classes you can join, and mock exams on real past papers.</p>
          <div className={`rounded-2xl border border-white/10 border-t-4 ${L.tone.top} bg-white/[0.03] divide-y divide-white/5`}>
            {guides.map((g) => {
              const classes = coursesFor(g.slug);
              const mock = mockExamsHref(g.code);
              return (
                <div key={g.slug} className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <Link to={`/subjects/${g.slug}`} className="text-lg font-bold text-white hover:text-indigo-300 transition">{g.subject} <span className="text-slate-400 font-normal">{g.code}</span></Link>
                    <div className="text-sm text-slate-400 mt-0.5">
                      <Link to={`/subjects/${g.slug}`} className="hover:text-white">Syllabus guide</Link>
                      {mock && <> · <a href={mock} className="hover:text-white">Mock exams</a></>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((c) => (
                      <Link key={c.id} to={`/courses/${c.id}`} title={c.title} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-indigo-500/10 border border-indigo-400/30 text-indigo-200 hover:text-white hover:bg-indigo-500/20 transition">
                        {stageLabel(c, g.level)} class{fees[c.id] ? ` · $${fees[c.id]}/month` : ""}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 flex items-start gap-2 text-base text-slate-300">
            <Wallet className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Fees are per subject, per month, in US dollars. Can't cover the fee? <Link to="/" className="text-indigo-300 hover:text-white font-semibold">Apply for free access</Link> on the home page.</span>
          </p>
        </Reveal>

        <Reveal className="mb-14 grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">{L.about.heading}</h2>
            <div className="space-y-4">
              {L.about.paragraphs.map((p, i) => <p key={i} className="text-slate-300 text-base leading-relaxed">{p}</p>)}
            </div>
          </div>
          <div className={`rounded-2xl border p-6 ${L.tone.soft}`}>
            <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight mb-3"><CalendarDays className={`w-6 h-6 ${L.tone.text}`} aria-hidden="true" /> Sitting the Cambridge exam</h2>
            <p className="text-slate-200 text-base leading-relaxed mb-3">
              Online students enter the official exams as <strong className={`${L.tone.text} font-semibold`}>private candidates</strong>: you register with an exam centre, such as the British Council in Pakistan, and write the papers there. The next series are <strong className="text-white">{next.label}</strong> and <strong className="text-white">{after.label}</strong>.
            </p>
            <ul className="space-y-2 mb-4">
              {["Who registers you, and what ID you need", "When registration opens and closes", "What to check before choosing papers"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-base text-slate-200"><CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" /> {t}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/private-candidate" className="text-indigo-300 hover:text-white font-semibold">Private candidate guide →</Link>
              <Link to="/exam-dates" className="text-indigo-300 hover:text-white font-semibold">Exam dates →</Link>
            </div>
          </div>
        </Reveal>

        <Reveal className="mb-14">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">Questions parents ask</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {L.faq.map((f) => (
              <div key={f.q} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-bold mb-2">{f.q}</h3>
                <p className="text-base text-slate-300 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-black uppercase tracking-widest">
            <Link to={level === "o" ? "/online-a-level" : "/online-o-level"} className="text-indigo-300 hover:text-white">{level === "o" ? "Online A Level →" : "Online O Level →"}</Link>
            <Link to="/online-school/pakistan" className="text-indigo-300 hover:text-white">Online school in Pakistan →</Link>
            <Link to="/online-school" className="text-indigo-300 hover:text-white">Online school by country →</Link>
            <Link to="/courses" className="text-indigo-300 hover:text-white">All courses →</Link>
          </div>
        </Reveal>
      </article>
    </main>
  );
};

export const OnlineOLevelPage = () => <OnlineLevelPage level="o" />;
export const OnlineALevelPage = () => <OnlineLevelPage level="a" />;
export default OnlineOLevelPage;
