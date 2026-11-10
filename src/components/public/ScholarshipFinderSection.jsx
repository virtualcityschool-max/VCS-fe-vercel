import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../ui/Reveal";
import {
  SCHOLARSHIPS_DATA,
  SCHOLARSHIP_DEGREES,
  SCHOLARSHIP_REGIONS,
  SCHOLARSHIP_COVERAGE_TYPES,
  SCHOLARSHIP_AUDIENCES,
  filterScholarships,
} from "../../data/scholarshipsData";
import ScholarshipDetailModal from "./ScholarshipDetailModal";

export default function ScholarshipFinderSection({ initialLimit = 6, showFullLink = true }) {
  const [audience, setAudience] = useState("all");
  const [selectedDegree, setSelectedDegree] = useState("All Degrees");
  const [selectedRegion, setSelectedRegion] = useState("All Countries");
  const [coverageFilter, setCoverageFilter] = useState("All Funding");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScholarship, setSelectedScholarship] = useState(null);

  const filteredScholarships = useMemo(() => {
    return filterScholarships(SCHOLARSHIPS_DATA, {
      degree: selectedDegree,
      region: selectedRegion,
      coverage: coverageFilter,
      search: searchQuery,
      audience,
    });
  }, [audience, selectedDegree, selectedRegion, coverageFilter, searchQuery]);

  const displayedScholarships = initialLimit
    ? filteredScholarships.slice(0, initialLimit)
    : filteredScholarships;

  return (
    <section id="scholarships" className="relative my-16 md:my-24">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-72 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-purple-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-black uppercase tracking-[0.25em] text-indigo-400 mb-4">
            <i className="fas fa-graduation-cap text-cyan-400" />
            Scholarships that open every year
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-poppins tracking-tight text-white mb-4">
            Find Scholarships by <span className="text-cyan-400">Country</span>,{" "}
            <span className="text-indigo-400">University</span> &amp;{" "}
            <span className="text-emerald-400">Degree</span>
          </h2>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            {SCHOLARSHIPS_DATA.length} scholarships that run{" "}
            <strong className="text-emerald-300 font-semibold">every year</strong>, for students in Pakistan and the Gulf, with the months they are usually open and a link to each official page. Dates move a little each year, so always check the official page before you apply.
          </p>
        </Reveal>

        {/* Filter Toolbar */}
        <Reveal className="bg-slate-900/70 border border-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholarship, university, country, or keyword..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  <i className="fas fa-times-circle" />
                </button>
              )}
            </div>

            {/* Country / Region Filter */}
            <div className="w-full sm:w-auto min-w-[210px]">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
              >
                {SCHOLARSHIP_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Funding Filter */}
            <div className="w-full sm:w-auto min-w-[190px]">
              <select
                value={coverageFilter}
                onChange={(e) => setCoverageFilter(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
              >
                {SCHOLARSHIP_COVERAGE_TYPES.map((cov) => (
                  <option key={cov} value={cov}>
                    {cov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Who it is for */}
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mr-2">
              I am:
            </span>
            {SCHOLARSHIP_AUDIENCES.map((a) => (
              <button
                key={a.key}
                onClick={() => setAudience(a.key)}
                aria-pressed={audience === a.key}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition ${
                  audience === a.key
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Degree Tabs */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mr-2">
              Degree Level:
            </span>
            {SCHOLARSHIP_DEGREES.map((deg) => {
              const active = selectedDegree === deg;
              return (
                <button
                  key={deg}
                  onClick={() => setSelectedDegree(deg)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    active
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60"
                  }`}
                >
                  {deg}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Scholarships Grid */}
        {displayedScholarships.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-white/5 rounded-2xl p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-2xl">
              <i className="fas fa-search" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No scholarships found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              No matching scholarships for your selected filters. Try resetting the country or degree filters.
            </p>
            <button
              onClick={() => {
                setSelectedDegree("All Degrees");
                setAudience("all");
                setSelectedRegion("All Countries");
                setCoverageFilter("All Funding");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {displayedScholarships.map((item, idx) => {
              const isClosingSoon = item.statusColor === "amber";
              const isFullyFunded = item.coverage === "Fully Funded";

              return (
                <Reveal
                  key={item.id}
                  delay={idx * 60}
                  className="group bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  <div>
                    {/* Top Row: Country + Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" aria-hidden="true">
                          {item.countryFlag}
                        </span>
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                          {item.awardCountry}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isClosingSoon
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                            : item.statusColor === "emerald"
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : "bg-slate-500/15 border-slate-500/30 text-slate-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Scholarship Title */}
                    <h3 className="text-lg font-bold font-poppins text-white group-hover:text-cyan-300 transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Provider */}
                    <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                      <i className="fas fa-university text-slate-500" />
                      <span className="truncate">{item.provider}</span>
                    </p>

                    {/* Key Metrics Pills */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">
                          Coverage
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isFullyFunded ? "text-emerald-400" : "text-cyan-300"
                          }`}
                        >
                          {item.coverage}
                        </span>
                      </div>
                      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">
                          Usually open
                        </span>
                        <span className="text-xs font-bold text-amber-300 truncate block">
                          {item.lastDate}
                        </span>
                      </div>
                    </div>

                    {/* Degree Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.degrees.map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300 font-medium"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Pakistan Eligibility Highlight */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 mb-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
                        <span>🇵🇰</span>
                        <span>Eligibility for Pakistan:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {item.eligibilityWrtPakistan?.academicPrerequisite ||
                          item.eligibilityWrtPakistan?.targetAudience}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedScholarship(item)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
                    >
                      <span>View Criteria &amp; Details</span>
                      <i className="fas fa-chevron-right text-xs" />
                    </button>

                    <a
                      href={item.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Official page</span>
                      <i className="fas fa-arrow-right text-xs" />
                    </a>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* View All & Full Directory CTA */}
        {showFullLink && (
          <Reveal className="mt-10 text-center">
            <Link
              to="/scholarships"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-600 hover:from-indigo-600 hover:to-cyan-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-indigo-500/25 transition hover:-translate-y-0.5"
            >
              <i className="fas fa-globe-americas" />
              <span>See all scholarships ({SCHOLARSHIPS_DATA.length})</span>
              <i className="fas fa-arrow-right text-xs" />
            </Link>
          </Reveal>
        )}
      </div>

      {/* Detail Modal */}
      {selectedScholarship && (
        <ScholarshipDetailModal
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
        />
      )}
    </section>
  );
}
