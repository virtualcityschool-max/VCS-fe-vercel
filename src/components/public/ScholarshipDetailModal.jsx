import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ScholarshipDetailModal({ scholarship, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!scholarship) return null;

  const handleCopy = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`${url}#${scholarship.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusBadge = () => {
    if (scholarship.statusColor === "amber") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          {scholarship.status} · usually {scholarship.lastDate}
        </span>
      );
    }
    if (scholarship.statusColor === "emerald") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {scholarship.status} · usually {scholarship.lastDate}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        {scholarship.status} · usually {scholarship.lastDate}
      </span>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-y-auto flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xl" aria-hidden="true">
                {scholarship.countryFlag}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {scholarship.awardCountry}
              </span>
              <span className="text-slate-500">&middot;</span>
              <span className="text-xs text-slate-400 font-medium">
                {scholarship.provider}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-poppins text-white leading-tight">
              {scholarship.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close modal"
          >
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Coverage
              </p>
              <p className="text-sm font-bold text-emerald-400">
                {scholarship.coverage}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Degree Level
              </p>
              <p className="text-sm font-bold text-white">
                {scholarship.degrees.join(", ")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Usually open
              </p>
              <p className="text-sm font-bold text-amber-300">
                {scholarship.lastDate}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Status
              </p>
              <div>{statusBadge()}</div>
            </div>
          </div>

          {/* Overview */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
              Program Overview
            </h4>
            <p className="text-base text-slate-200 leading-relaxed">
              {scholarship.summary}
            </p>
          </div>

          {/* Scholarship Offered / Benefits */}
          <div className="bg-gradient-to-br from-indigo-950/30 to-slate-950/50 border border-indigo-500/20 rounded-xl p-5">
            <h4 className="text-sm font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2 mb-3">
              <i className="fas fa-gift text-indigo-400" />
              What the Scholarship Covers
            </h4>
            <ul className="space-y-2.5">
              {scholarship.scholarshipOffered.map((benefit, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed"
                >
                  <i className="fas fa-check-circle text-emerald-400 text-sm mt-0.5 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Special Focus: Pakistan & Gulf Eligibility */}
          {scholarship.eligibilityWrtPakistan && (
            <div className="bg-gradient-to-br from-emerald-950/25 to-slate-950/50 border border-emerald-500/25 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg" aria-hidden="true">
                  🇵🇰
                </span>
                <h4 className="text-sm font-black uppercase tracking-wider text-emerald-300">
                  Eligibility Specially for Pakistani Students
                </h4>
              </div>

              <div className="space-y-3 text-sm text-slate-200">
                <div>
                  <strong className="text-white block font-semibold mb-0.5">
                    Target Applicants:
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    {scholarship.eligibilityWrtPakistan.targetAudience}
                  </p>
                </div>

                <div>
                  <strong className="text-white block font-semibold mb-0.5">
                    Academic Prerequisites:
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    {scholarship.eligibilityWrtPakistan.academicPrerequisite}
                  </p>
                </div>

                <div>
                  <strong className="text-white block font-semibold mb-0.5">
                    English Language Condition:
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    {scholarship.eligibilityWrtPakistan.englishRequirement}
                  </p>
                </div>

                {scholarship.eligibilityWrtPakistan.hecOrVisaNotes && (
                  <div>
                    <strong className="text-white block font-semibold mb-0.5">
                      HEC &amp; Visa Documentation:
                    </strong>
                    <p className="text-slate-300 leading-relaxed">
                      {scholarship.eligibilityWrtPakistan.hecOrVisaNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Application Requirements */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center gap-2">
              <i className="fas fa-clipboard-check text-cyan-400" />
              General Requirements &amp; Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scholarship.keyRequirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-xs sm:text-sm text-slate-300"
                >
                  <i className="fas fa-arrow-right text-cyan-400 text-xs mt-1 shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VCS Cambridge Pathway banner */}
          <div className="bg-slate-950/70 border border-cyan-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-slate-300">
              <strong className="text-cyan-300 font-semibold block">
                Preparing for International Admissions?
              </strong>
              Top international scholarships reward high Cambridge O Level &amp; A Level grades. VCS provides live online classes with certified Cambridge tutors.
            </div>
            <Link
              to="/courses"
              className="shrink-0 text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
            >
              Explore Cambridge Courses &rarr;
            </Link>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/60 text-slate-200 text-xs sm:text-sm font-semibold transition"
          >
            <i className={`fas ${copied ? "fa-check text-emerald-400" : "fa-share-nodes text-slate-400"}`} />
            {copied ? "Link Copied!" : "Share Scholarship"}
          </button>

          <div className="flex items-center gap-3">
            {scholarship.officialLink && (
              <a
                href={scholarship.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/10 text-indigo-300 hover:text-white text-xs sm:text-sm font-semibold transition"
              >
                <span>Official University Portal</span>
                <i className="fas fa-external-link-alt text-xs" />
              </a>
            )}
            <a
              href={scholarship.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
            >
              <span>Apply Online</span>
              <i className="fas fa-arrow-right text-xs" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
