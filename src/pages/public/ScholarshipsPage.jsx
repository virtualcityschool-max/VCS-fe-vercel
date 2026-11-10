import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/useSeo";
import Reveal from "../../components/ui/Reveal";
import ScholarshipFinderSection from "../../components/public/ScholarshipFinderSection";

const SCHOLARSHIP_FAQS = [
  {
    q: "Are Pakistani students eligible for these international scholarships?",
    a: "Yes. Every scholarship listed on this directory has been specifically verified for applicants holding a Pakistani passport and students residing in Pakistan or across Gulf countries (Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman). Countries like the USA, UK, Germany, Hungary, Turkey, and China offer dedicated quotas or partner-country funding for Pakistani candidates.",
  },
  {
    q: "Do I always need an IELTS or TOEFL exam score?",
    a: "Not for every scholarship. Fellowships and cultural camps (like the Hurford Fellowship and AYFN Korea Camp) do not require formal language tests. In European countries like Italy and Hungary, as well as China and Turkey, many universities accept an 'English as Medium of Instruction' certificate issued by your school or university. For competitive programs in the UK, USA (Fulbright), and Australia (AGRTP), an IELTS (6.5+) or TOEFL score is required.",
  },
  {
    q: "How do Cambridge O Level and A Level grades help in securing scholarships?",
    a: "Cambridge International qualifications (O Level, IGCSE, AS & A Level) are globally recognized by universities across the USA, UK, Europe, and Australia. Top grades (straight As/A*s) qualify students directly for undergraduate merit waivers (such as American University's Global Leader award and Bocconi's Merit Grant) without needing local conversion exams.",
  },
  {
    q: "What documents should Pakistani students prepare in advance?",
    a: "Start by preparing: 1) Valid Pakistani passport (minimum 6 months validity); 2) Academic transcripts & certificates (attested by IBCC for O/A Levels/Inter, or HEC for Bachelor degrees); 3) Statement of Purpose (SOP) or motivation letter; 4) Two academic or professional letters of recommendation; 5) Updated CV in Europass format.",
  },
  {
    q: "Can students in Saudi Arabia and the UAE apply as overseas Pakistanis?",
    a: "Yes. Pakistani students living in the Gulf apply under international student or Pakistani nationality criteria. In fact, many Gulf-based students leverage their Cambridge schooling and English proficiency to win fully funded scholarships in Europe, the US, and Australia.",
  },
];

export default function ScholarshipsPage() {
  const [openFaq, setOpenFaq] = useState(null);

  useSeo({
    title: "Global Scholarships for Pakistani & Gulf Students – Bachelors, Masters & PhD",
    description:
      "Find fully funded international scholarships in the USA, UK, Europe, Australia, and Asia. Verified criteria, deadlines, and requirements for Pakistani and international students.",
    url: "https://virtualcityschool.com/scholarships",
    jsonLd: [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://virtualcityschool.com" },
          { "@type": "ListItem", position: 2, name: "Scholarships", item: "https://virtualcityschool.com/scholarships" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: SCHOLARSHIP_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background aurora tints */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-aurora"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <article className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-24">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-cyan-400 transition">
            Home
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold">Scholarships</span>
        </nav>

        {/* Page Hero Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs font-black uppercase tracking-[0.25em] text-cyan-400 mb-4">
            <i className="fas fa-award text-indigo-400" />
            Verified Higher Education Grants
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-poppins tracking-tight text-white mb-4">
            International Scholarships for <span className="text-cyan-400">Pakistani</span> &amp;{" "}
            <span className="text-indigo-400">Gulf Students</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-3xl leading-relaxed">
            A comprehensive, verified directory of fully funded and partial scholarship programs for undergraduate, postgraduate, and fellowship applicants &mdash; complete with country requirements, deadlines, eligibility criteria, and direct application links.
          </p>
        </header>

        {/* Full Scholarship Finder Section (no limit on this page) */}
        <ScholarshipFinderSection initialLimit={0} showFullLink={false} />

        {/* Preparation Pathway: How VCS Helps */}
        <Reveal className="my-16 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/40 border border-indigo-500/30 rounded-2xl p-6 sm:p-10 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 block mb-2">
                Your Academic Springboard
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-poppins text-white mb-3">
                Aiming for a Fully Funded International Scholarship?
              </h3>
              <p className="text-slate-300 text-base leading-relaxed mb-4">
                Global scholarship committees look for stellar academic performance, critical thinking, and fluent English communication. Virtual City School provides live Cambridge O Level and A Level online classes with qualified expert teachers across Pakistan and the Gulf &mdash; laying the strongest possible academic foundation for top university admissions worldwide.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <i className="fas fa-check text-emerald-400" />
                  Cambridge O &amp; A Level Curriculum
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-check text-emerald-400" />
                  Live Teacher-Led Sessions
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-check text-emerald-400" />
                  Mocks on Past Cambridge Papers
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                to="/courses"
                className="btn-glow px-6 py-3.5 rounded-xl text-white font-bold text-sm text-center flex items-center justify-center gap-2"
              >
                Explore Cambridge Courses
                <i className="fas fa-arrow-right text-xs" />
              </Link>
              <Link
                to="/teachers"
                className="px-6 py-3.5 rounded-xl border border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/10 text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition"
              >
                Meet Cambridge Tutors
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Scholarships FAQ Section */}
        <section className="my-16">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-poppins text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Everything Pakistani and Gulf students need to know before applying for global scholarships.
            </p>
          </Reveal>

          <div className="max-w-3xl mx-auto space-y-3">
            {SCHOLARSHIP_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-white/10 rounded-xl bg-slate-900/60 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-white font-semibold text-sm sm:text-base hover:text-cyan-300 transition"
                  >
                    <span>{faq.q}</span>
                    <i
                      className={`fas fa-chevron-down text-xs text-slate-400 transition-transform duration-300 shrink-0 ${
                        isOpen ? "rotate-180 text-cyan-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </article>
    </main>
  );
}
