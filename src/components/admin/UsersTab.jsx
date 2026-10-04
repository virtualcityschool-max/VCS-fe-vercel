import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FilterSelect,
  SearchInput,
  EmptyState,
} from "../../components/ui";
import ConfirmDialog from "../common/ConfirmDialog";
import { getStorageUrl } from "../../utils/storageUrl";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import { getDisplayName } from "../../utils/userDisplay";
import { TagChip, StudentTagsModal, LabelFilterDropdown } from "./StudentTags";
import { useStudentTags } from "../../hooks/useStudentTags";

// Subject department definitions for Tutor classification
const TUTOR_DEPARTMENTS = [
  {
    id: "mathematics",
    name: "Mathematics",
    icon: "fa-calculator",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    keywords: ["math", "mathematics", "calculus", "algebra", "geometry", "statistics", "trigonometry"],
  },
  {
    id: "physics",
    name: "Physics",
    icon: "fa-atom",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    keywords: ["physics", "mechanics", "astrophysics", "quantum"],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "fa-flask",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    keywords: ["chemistry", "organic", "inorganic", "biochemistry"],
  },
  {
    id: "biology",
    name: "Biology",
    icon: "fa-dna",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    keywords: ["biology", "bio", "zoology", "botany", "life science", "genetics"],
  },
  {
    id: "english_urdu",
    name: "English & Urdu",
    icon: "fa-book-open",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    keywords: ["english", "urdu", "literature", "language", "grammar", "ielts", "toefl"],
  },
  {
    id: "computer_science",
    name: "Computer Science",
    icon: "fa-laptop-code",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    keywords: ["computer", "programming", "coding", "software", "python", "it", "cs", "algorithm"],
  },
  {
    id: "general_sciences",
    name: "General & Other Subjects",
    icon: "fa-graduation-cap",
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
    keywords: [],
  },
];

// eStudyGate-style Role Governance Overview for Admin view
const ADMIN_GOVERNANCE_ROLES = [
  {
    role: "Owner / SuperAdmin",
    icon: "fa-crown",
    color: "text-amber-400",
    border: "border-amber-500/30",
    badgeBg: "bg-amber-500/15 text-amber-300",
    tagline: "Full Platform Authority",
    description: "System configuration, database security, payment routing, and global staff permission allocation.",
  },
  {
    role: "Approvals Officer",
    icon: "fa-user-check",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/15 text-emerald-300",
    tagline: "Admissions & Gatekeeper",
    description: "Vets, approves, and rejects new student sign-ups, tutor credential verification, and parent linkage.",
  },
  {
    role: "Subject & Class Expert",
    icon: "fa-graduation-cap",
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    badgeBg: "bg-indigo-500/15 text-indigo-300",
    tagline: "Academic Scheduling",
    description: "Curriculum mapping, timetable coordination, teacher-to-student matching, and class planner management.",
  },
  {
    role: "Software & Support Expert",
    icon: "fa-headset",
    color: "text-sky-400",
    border: "border-sky-500/30",
    badgeBg: "bg-sky-500/15 text-sky-300",
    tagline: "Technical Ops & Live Rooms",
    description: "Google Meet session links, platform availability, student technical support, and uptime monitoring.",
  },
];

// Search controls component with Cards vs Table segmented view switcher
const SearchControls = ({
  searchInput,
  setSearchInput,
  usersFilters,
  handleFilterChange,
  onFetchUsers,
  handleCreateUser,
  onClearFilters,
  tags,
  onManageLabels,
  viewMode,
  setViewMode,
}) => {
  const roleTabs = [
    { value: "", label: "All" },
    { value: "admin", label: "Admin(s)" },
    { value: "teacher", label: "Tutor(s)" },
    { value: "student", label: "Student(s)" },
    { value: "parent", label: "Guardian(s)" },
  ];

  const CREATE_LABEL_BY_ROLE = {
    admin: "New Admin",
    teacher: "New Tutor",
    student: "New Student",
    parent: "New Guardian",
  };
  const createUserLabel = CREATE_LABEL_BY_ROLE[usersFilters.role] || "Create User";

  const hasActiveFilters = !!(
    usersFilters.search ||
    usersFilters.role ||
    usersFilters.is_active ||
    usersFilters.tags ||
    usersFilters.ordering !== "-date_joined"
  );

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        {/* Role tab pills & View mode segmented control */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 flex items-center gap-1 w-fit max-w-full overflow-x-auto no-scrollbar shrink-0">
            {roleTabs.map((tab) => {
              const isActive = usersFilters.role === tab.value;
              return (
                <button
                  key={tab.label}
                  onClick={() => handleFilterChange("role", tab.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Cards vs Table view toggle */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1 flex items-center shrink-0">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "cards"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Card Hub View"
            >
              <i className="fas fa-th-large text-[11px]" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Classic Table View"
            >
              <i className="fas fa-table text-[11px]" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Group */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-start gap-1.5 flex-1 sm:justify-end">
          <SearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onClear={() => setSearchInput("")}
            placeholder={
              usersFilters.role === "student"
                ? "Search by name, email, roll no..."
                : usersFilters.role === "teacher"
                  ? "Search tutors, subjects, expertise..."
                  : "Search users..."
            }
            className="w-full sm:w-64 sm:mr-auto xl:mr-0"
          />

          <div className="grid grid-cols-2 sm:contents gap-1.5">
            {(usersFilters.role === "" || usersFilters.role === "student") && (
              <LabelFilterDropdown
                className="w-full sm:w-34"
                tags={tags}
                value={usersFilters.tags}
                onChange={(v) => handleFilterChange("tags", v)}
                onAdd={() => onManageLabels({})}
                onEdit={(tag) => onManageLabels({ highlight: tag })}
              />
            )}

            <FilterSelect
              className="w-full sm:w-auto"
              value={usersFilters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
            >
              <option value="">Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </FilterSelect>

            <FilterSelect
              className="w-full sm:w-auto"
              value={usersFilters.ordering}
              onChange={(e) => handleFilterChange("ordering", e.target.value)}
            >
              <option value="-date_joined">Newest</option>
              <option value="date_joined">Oldest</option>
              <option value="username">A–Z</option>
            </FilterSelect>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              title={hasActiveFilters ? "Clear all filters" : "No filters applied"}
              className={`flex items-center gap-1.5 h-[42px] px-3.5 rounded-xl border bg-slate-900 text-sm font-medium transition-all duration-150 shrink-0 ${
                hasActiveFilters
                  ? "border-slate-700/70 text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400"
                  : "border-slate-800/60 text-slate-600 cursor-not-allowed"
              }`}
            >
              <i className="fas fa-times text-xs"></i>
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={handleCreateUser}
              className="h-[42px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <i className="fas fa-user-plus text-[10px]" />
              <span>{createUserLabel}</span>
            </button>
            <button
              onClick={() => onFetchUsers()}
              className="text-white h-[42px] px-5 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 shrink-0"
              title="Refresh"
            >
              <i className="fas fa-sync text-xs"></i>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CARD COMPONENTS
// ─────────────────────────────────────────────

// Unified Student Card: Green if active/enrolled, Red if zero enrollments
const StudentCard = ({
  user,
  tagsFor,
  handleFilterChange,
  setTagModalUser,
  handleViewUser,
  handleEditUser,
  handlePurgeUser,
  handleDeleteUser,
  processing,
  navigate,
}) => {
  const isEnrolled =
    user.is_engaged ||
    (user.enrollment_count && user.enrollment_count > 0) ||
    (user.enrolled_courses && user.enrolled_courses.length > 0);

  const enrolledList = user.enrolled_courses || [];
  const enrollCount = user.enrollment_count || enrolledList.length;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xl ${
        isEnrolled
          ? "border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 hover:border-emerald-500/60 hover:shadow-emerald-500/5"
          : "border-rose-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/20 hover:border-rose-500/60 hover:shadow-rose-500/5"
      }`}
    >
      <div className="p-5 space-y-4">
        {/* Card Header: Avatar & Status Badge on Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative shrink-0">
            {getStorageUrl(user.avatar) ? (
              <img
                src={getStorageUrl(user.avatar)}
                alt={user.username}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-800"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                  isEnrolled
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {(getDisplayName(user) || user.username || "S")[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Active / Inactive Status Badge */}
          <div className="shrink-0">
            {isEnrolled ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active • {enrollCount} Enrolled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Not Active • 0 Classes
              </span>
            )}
          </div>
        </div>

        {/* User Identity: Full Name & Full Email (Zero Truncation) */}
        <div className="space-y-1">
          <h4 className="font-bold text-white text-base leading-snug break-words">
            {getDisplayName(user) || "Student"}
          </h4>
          <p className="text-xs text-slate-400 font-mono break-all select-all">
            {user.email}
          </p>
          {user.phone && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <i className="fas fa-phone text-[9px]" />
              <span>{user.phone}</span>
            </p>
          )}
        </div>

        {/* Academic Tier & Roll Number Info */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          {user.roll_no != null && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
              Roll #{user.roll_no}
            </span>
          )}
          {user.grade_level && (
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium text-[11px]">
              <i className="fas fa-layer-group text-[9px] mr-1" />
              {user.grade_level}
            </span>
          )}
          {user.guardian?.name && (
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium text-[11px]">
              <i className="fas fa-user-shield text-[9px] mr-1" />
              {user.guardian.name}
            </span>
          )}
        </div>

        {/* Enrolled Subjects List or Missing Warning */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Enrolled Subjects ({enrolledList.length})</span>
            {enrolledList.length > 0 && (
              <span className="text-emerald-400 text-[10px] lowercase font-normal">all subjects unified</span>
            )}
          </div>

          {enrolledList.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar pt-1">
              {enrolledList.map((course, idx) => (
                <div
                  key={course.id || idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/60 text-slate-200 text-xs shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate max-w-[200px]" title={course.title}>
                    {course.title}
                  </span>
                  {course.category && (
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({course.category})
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-2">
              <div className="text-xs text-rose-300 flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-rose-400" />
                <span>No courses enrolled yet</span>
              </div>
              <button
                onClick={() => navigate("/admin/enrollments")}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                <i className="fas fa-plus text-[10px]" />
                <span>Enroll</span>
              </button>
            </div>
          )}
        </div>

        {/* Student Tags */}
        {tagsFor(user).length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tagsFor(user).map((tag) => (
              <TagChip
                key={tag.id}
                tag={tag}
                onClick={() => handleFilterChange("tags", String(tag.id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTagModalUser(user)}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-indigo-300 transition"
            title="Manage labels"
          >
            <i className="fas fa-tags text-xs" />
          </button>
          <button
            onClick={() => handleViewUser(user.id)}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
            title="View student profile"
          >
            <i className="fas fa-eye text-xs" />
          </button>
          <button
            onClick={() => handleEditUser(user.id)}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
            title="Edit student"
          >
            <i className="fas fa-edit text-xs" />
          </button>
          <button
            onClick={() => handlePurgeUser(user)}
            disabled={!!processing[user.id]}
            className="w-8 h-8 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50"
            title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
          >
            <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-xs`} />
          </button>
        </div>

        <button
          onClick={() => handleDeleteUser(user)}
          disabled={!!processing[user.id]}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50 ${
            user.is_active
              ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
              : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
          }`}
        >
          {processing[user.id] === "toggling" ? (
            <>
              <i className="fas fa-spinner fa-spin text-xs" />
              <span>{user.is_active ? "Deactivating..." : "Activating..."}</span>
            </>
          ) : (
            <>
              <i className={`fas ${user.is_active ? "fa-ban" : "fa-check-circle"} text-xs`} />
              <span>{user.is_active ? "Deactivate" : "Activate"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Tutor Card in Responsive Grid: Green if engaged, Amber if standby (Identical grid card layout like others)
const TutorCard = ({
  user,
  assignedCourses,
  isEngaged,
  handleViewUser,
  handleEditUser,
  handlePurgeUser,
  handleDeleteUser,
  processing,
}) => {
  const courses = assignedCourses || user.assigned_courses || [];
  const engaged = isEngaged != null ? isEngaged : (user.is_engaged || courses.length > 0);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xl ${
        engaged
          ? "border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 hover:border-emerald-500/60 hover:shadow-emerald-500/5"
          : "border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 hover:border-amber-500/60 hover:shadow-amber-500/5"
      }`}
    >
      <div className="p-5 space-y-4">
        {/* Card Header: Avatar & Status Badge on Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative shrink-0">
            {getStorageUrl(user.avatar) ? (
              <img
                src={getStorageUrl(user.avatar)}
                alt={user.username}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-800"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                  engaged
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {(getDisplayName(user) || user.username || "T")[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Engaged vs Standby badge */}
          <div className="shrink-0">
            {engaged ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Engaged • {courses.length} Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Standby • Available
              </span>
            )}
          </div>
        </div>

        {/* User Identity: Full Name & Full Email (Zero Truncation) */}
        <div className="space-y-1">
          <h4 className="font-bold text-white text-base leading-snug break-words">
            {getDisplayName(user) || "Tutor"}
          </h4>
          <p className="text-xs text-slate-400 font-mono break-all select-all">
            {user.email}
          </p>
          {user.phone && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <i className="fas fa-phone text-[9px]" />
              <span>{user.phone}</span>
            </p>
          )}
        </div>

        {/* Professional Details: Experience & Qualification */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {user.experience_years != null && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
              <i className="fas fa-briefcase text-[9px] mr-1 text-slate-400" />
              {user.experience_years} yrs exp
            </span>
          )}
          {user.qualification && (
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] truncate max-w-[170px]" title={user.qualification}>
              <i className="fas fa-award text-[9px] mr-1" />
              {user.qualification}
            </span>
          )}
        </div>

        {/* Assigned Classes vs Standby Notification */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>{engaged ? `Assigned Courses (${courses.length})` : "Current Status"}</span>
          </div>

          {engaged ? (
            <div className="space-y-1 max-h-28 overflow-y-auto no-scrollbar">
              {courses.map((course, idx) => (
                <div
                  key={course.id || idx}
                  className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-white flex items-center justify-between gap-2"
                >
                  <span className="truncate font-medium">{course.title}</span>
                  {course.category && (
                    <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                      {course.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <i className="fas fa-clock text-amber-400" />
              <span>Available for new class allocation</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewUser(user.id)}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
            title="View tutor profile"
          >
            <i className="fas fa-eye text-xs" />
          </button>
          <button
            onClick={() => handleEditUser(user.id)}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
            title="Edit tutor"
          >
            <i className="fas fa-edit text-xs" />
          </button>
          <button
            onClick={() => handlePurgeUser(user)}
            disabled={!!processing[user.id]}
            className="w-8 h-8 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50"
            title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
          >
            <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-xs`} />
          </button>
        </div>

        <button
          onClick={() => handleDeleteUser(user)}
          disabled={!!processing[user.id]}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50 ${
            user.is_active
              ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
              : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
          }`}
        >
          {processing[user.id] === "toggling" ? (
            <>
              <i className="fas fa-spinner fa-spin text-xs" />
              <span>{user.is_active ? "Deactivating..." : "Activating..."}</span>
            </>
          ) : (
            <>
              <i className={`fas ${user.is_active ? "fa-ban" : "fa-check-circle"} text-xs`} />
              <span>{user.is_active ? "Deactivate" : "Activate"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Guardian Card connected directly to linked students
const GuardianCard = ({
  user,
  handleViewUser,
  handleEditUser,
  handlePurgeUser,
  handleDeleteUser,
  processing,
}) => {
  const linkedChildren = user.linked_children || [];
  const cleanPhone = user.phone ? user.phone.replace(/[^0-9]/g, "") : "";

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/20 flex flex-col justify-between overflow-hidden shadow-xl hover:border-purple-500/60 transition-all duration-200">
      <div className="p-5 space-y-4">
        {/* Header: Avatar & Status Badge on Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-lg shrink-0">
            <i className="fas fa-user-friends text-base" />
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
              user.is_active
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-slate-500/15 text-slate-400 border-slate-500/30"
            }`}
          >
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* User Identity: Full Name & Full Email (Zero Truncation) */}
        <div className="space-y-1">
          <h4 className="font-bold text-white text-base leading-snug break-words">
            {getDisplayName(user) || "Guardian"}
          </h4>
          <p className="text-xs text-slate-400 font-mono break-all select-all">
            {user.email}
          </p>
          {user.phone && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <i className="fas fa-phone text-[9px]" />
              <span>{user.phone}</span>
            </p>
          )}
        </div>

        {/* Linked Children Section */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Linked Students ({linkedChildren.length})</span>
          </div>

          {linkedChildren.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {linkedChildren.map((child, idx) => (
                <div
                  key={child.id || idx}
                  className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <i className="fas fa-user-graduate text-indigo-400 text-[10px]" />
                      <span>{child.display_name || child.username}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {child.roll_no ? `Roll #${child.roll_no}` : "No roll#"} {child.grade_level ? `• ${child.grade_level}` : ""}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                    Linked
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-slate-400 text-xs">
              No students currently linked to this guardian
            </div>
          )}
        </div>

        {/* Direct WhatsApp & Contact Actions */}
        {cleanPhone && (
          <div className="pt-2">
            <a
              href={`https://wa.me/${cleanPhone}?text=Hello%20from%20Virtual%20City%20School`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <i className="fab fa-whatsapp text-emerald-400 text-sm" />
              <span>Direct WhatsApp Chat</span>
            </a>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewUser(user.id)}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
            title="View guardian profile"
          >
            <i className="fas fa-eye text-xs" />
          </button>
          <button
            onClick={() => handleEditUser(user.id)}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
            title="Edit guardian"
          >
            <i className="fas fa-edit text-xs" />
          </button>
          <button
            onClick={() => handlePurgeUser(user)}
            disabled={!!processing[user.id]}
            className="w-8 h-8 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50"
            title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
          >
            <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-xs`} />
          </button>
        </div>

        <button
          onClick={() => handleDeleteUser(user)}
          disabled={!!processing[user.id]}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50 ${
            user.is_active
              ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
              : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
          }`}
        >
          {processing[user.id] === "toggling" ? (
            <>
              <i className="fas fa-spinner fa-spin text-xs" />
              <span>{user.is_active ? "Deactivating..." : "Activating..."}</span>
            </>
          ) : (
            <>
              <i className={`fas ${user.is_active ? "fa-ban" : "fa-check-circle"} text-xs`} />
              <span>{user.is_active ? "Deactivate" : "Activate"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Admin User Card with eStudyGate Role info
const AdminCard = ({
  user,
  handleViewUser,
  handleEditUser,
  handlePurgeUser,
  handleDeleteUser,
  processing,
}) => {
  return (
    <div
      className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-200 ${
        user.is_superuser
          ? "border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 hover:border-amber-500/70"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
      }`}
    >
      <div className="p-5 space-y-4">
        {/* Header: Avatar & Status Badge on Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
              user.is_superuser
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            <i className={`fas ${user.is_superuser ? "fa-crown text-amber-400" : "fa-shield-alt text-red-400"}`} />
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
              user.is_active
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-slate-500/15 text-slate-400 border-slate-500/30"
            }`}
          >
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* User Identity: Full Name & Full Email (Zero Truncation) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-white text-base leading-snug break-words">
              {getDisplayName(user) || "Admin"}
            </h4>
            {user.is_superuser && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                <i className="fas fa-crown text-[8px]" />
                Super Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono break-all select-all">
            {user.email}
          </p>
        </div>

        {/* System Protection or Role scope */}
        {user.is_superuser ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300 font-medium">
            <i className="fas fa-lock text-amber-400" />
            <span>System Protected • Full platform superuser privileges</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2 text-xs text-slate-300">
            <i className="fas fa-user-shield text-indigo-400" />
            <span>Console Administrator • Standard Operations Role</span>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {user.is_superuser ? (
          <div className="text-xs text-slate-500 italic">System Protected Admin</div>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleViewUser(user.id)}
                className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                title="View admin profile"
              >
                <i className="fas fa-eye text-xs" />
              </button>
              <button
                onClick={() => handleEditUser(user.id)}
                className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                title="Edit admin"
              >
                <i className="fas fa-edit text-xs" />
              </button>
              <button
                onClick={() => handlePurgeUser(user)}
                disabled={!!processing[user.id]}
                className="w-8 h-8 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50"
                title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
              >
                <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-xs`} />
              </button>
            </div>

            <button
              onClick={() => handleDeleteUser(user)}
              disabled={!!processing[user.id]}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50 ${
                user.is_active
                  ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                  : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
              }`}
            >
              {processing[user.id] === "toggling" ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs" />
                  <span>{user.is_active ? "Deactivating..." : "Activating..."}</span>
                </>
              ) : (
                <>
                  <i className={`fas ${user.is_active ? "fa-ban" : "fa-check-circle"} text-xs`} />
                  <span>{user.is_active ? "Deactivate" : "Activate"}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN USERS TAB COMPONENT
// ─────────────────────────────────────────────
const UsersTab = ({
  users,
  loading,
  usersFilters,
  setUsersFilters,
  onUserDelete,
  onUserPurge,
  onFetchUsers,
  onUserEdit,
  onUserView,
  onCreateUser,
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table"); // 'table' (default) vs 'cards'
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedTutorStatus, setSelectedTutorStatus] = useState("all"); // 'all' | 'engaged' | 'standby'
  const [selectedStudentStatus, setSelectedStudentStatus] = useState("all"); // 'all' | 'active' | 'inactive'
  const [coursesByTeacher, setCoursesByTeacher] = useState({});

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: null,
    isActive: false,
    user: null,
  });
  const [purgeDialog, setPurgeDialog] = useState({ open: false, userId: null });
  const { tags, loaded: tagsLoaded, refresh: refreshTags } = useStudentTags();
  const [tagModalUser, setTagModalUser] = useState(null);
  const [labelLibrary, setLabelLibrary] = useState(null);
  const [tagOverrides, setTagOverrides] = useState({});
  const tagsFor = (user) => tagOverrides[user.id] ?? user.tags ?? [];
  const [processing, setProcessing] = useState({});
  const [localSearchInput, setLocalSearchInput] = useState(usersFilters.search || "");
  const isMountedRef = useRef(true);

  const searchInput = localSearchInput;
  const setSearchInput = setLocalSearchInput;

  // Fetch all courses in background to establish instructor assignment mapping
  useEffect(() => {
    let isMounted = true;
    coursesService
      .getAllCourses()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : (data?.results || data?.data || []);
        const map = {};
        list.forEach((c) => {
          const instructorId =
            c.instructor?.id || (typeof c.instructor === "number" ? c.instructor : null);
          if (instructorId) {
            if (!map[instructorId]) map[instructorId] = [];
            map[instructorId].push({
              id: c.id,
              title: c.title,
              category: typeof c.category === "object" ? c.category?.name : c.category,
            });
          }
        });
        setCoursesByTeacher(map);
      })
      .catch((err) => console.warn("Could not load courses for teacher map:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClearFilters = useCallback(() => {
    setUsersFilters({
      search: "",
      role: "",
      is_active: "",
      tags: "",
      ordering: "-date_joined",
    });
    setLocalSearchInput("");
  }, [setUsersFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== usersFilters.search) {
        setUsersFilters((prev) => ({ ...prev, search: searchInput }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, usersFilters.search, setUsersFilters]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleFilterChange = useCallback(
    (filterName, value) => {
      setUsersFilters((prev) => ({ ...prev, [filterName]: value }));
    },
    [setUsersFilters],
  );

  const handleStudentsStale = useCallback(() => {
    setTagOverrides({});
    onFetchUsers();
  }, [onFetchUsers]);

  useEffect(() => {
    if (!tagsLoaded || !usersFilters.tags) return;
    if (!tags.some((t) => String(t.id) === String(usersFilters.tags))) {
      handleFilterChange("tags", "");
    }
  }, [tags, tagsLoaded, usersFilters.tags, handleFilterChange]);

  const handleDeleteUser = async (user) => {
    setConfirmDialog({
      open: true,
      userId: user.id,
      isActive: user.is_active,
      user,
    });
  };

  const startProcessing = (userId, kind) =>
    setProcessing((prev) => ({ ...prev, [userId]: kind }));

  const stopProcessing = (userId) =>
    setProcessing((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });

  const confirmDeleteUser = async () => {
    const { userId, user } = confirmDialog;
    startProcessing(userId, "toggling");
    try {
      await onUserDelete(userId, user);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      toastManager.error("Failed to update user status");
    } finally {
      stopProcessing(userId);
      setConfirmDialog({
        open: false,
        userId: null,
        isActive: false,
        user: null,
      });
    }
  };

  const handlePurgeUser = async (user) => {
    setPurgeDialog({ open: true, userId: user.id });
  };

  const confirmPurgeUser = async () => {
    const { userId } = purgeDialog;
    startProcessing(userId, "purging");
    try {
      await onUserPurge(userId);
    } catch (error) {
      console.error("Failed to purge user:", error);
      toastManager.error("Failed to permanently delete user");
    } finally {
      stopProcessing(userId);
      setPurgeDialog({ open: false, userId: null });
    }
  };

  const handleViewUser = (userId) => {
    if (onUserView) onUserView(userId);
    else navigate(`/admin/users/${userId}`, { state: { viewOnly: true } });
  };

  const handleEditUser = (userId) => {
    if (onUserEdit) onUserEdit(userId);
    else navigate(`/admin/users/${userId}`);
  };

  const handleCreateUser = () => {
    if (onCreateUser) onCreateUser();
  };

  const ROLE_DISPLAY = { teacher: "Tutor", parent: "Guardian", student: "Student", admin: "Admin" };
  const displayRole = (r) => ROLE_DISPLAY[r] || r;

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/20";
      case "teacher":
        return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      case "parent":
        return "bg-purple-500/20 text-purple-400 border-purple-500/20";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/20";
    }
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
      : "bg-slate-500/20 text-slate-400 border-slate-500/20";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Helper: Retrieve assigned courses for teacher with fallback to coursesByTeacher map
  const getTeacherCourses = useCallback(
    (teacher) => {
      if (teacher.assigned_courses && teacher.assigned_courses.length > 0) {
        return teacher.assigned_courses;
      }
      return coursesByTeacher[teacher.id] || [];
    },
    [coursesByTeacher],
  );

  // Helper: Check if teacher is engaged in active courses
  const getTeacherIsEngaged = useCallback(
    (teacher) => {
      if (teacher.is_engaged != null) {
        return Boolean(teacher.is_engaged);
      }
      const courses = getTeacherCourses(teacher);
      return courses.length > 0;
    },
    [getTeacherCourses],
  );

  // Helper: Extract search tokens for subject department classification
  const getTeacherSubjectTokens = useCallback(
    (teacher) => {
      const courses = getTeacherCourses(teacher);
      const courseTokens = courses.map((c) => `${c.title} ${c.category || ""}`).join(" ");
      const profileSubjects = (teacher.subjects || []).join(" ");
      const expertise = teacher.expertise || "";
      return `${courseTokens} ${profileSubjects} ${expertise}`.toLowerCase();
    },
    [getTeacherCourses],
  );

  // Map teachers to department buckets
  const departmentTutorMap = useMemo(() => {
    const teachers = (users || []).filter((u) => u.role === "teacher");
    const map = {};
    TUTOR_DEPARTMENTS.forEach((dept) => {
      map[dept.id] = [];
    });

    teachers.forEach((teacher) => {
      const tokens = getTeacherSubjectTokens(teacher);
      let matched = false;
      TUTOR_DEPARTMENTS.forEach((dept) => {
        if (dept.keywords.length > 0) {
          const hasKeyword = dept.keywords.some((kw) => tokens.includes(kw));
          if (hasKeyword) {
            map[dept.id].push(teacher);
            matched = true;
          }
        }
      });
      if (!matched) {
        map["general_sciences"].push(teacher);
      }
    });

    return map;
  }, [users, getTeacherSubjectTokens]);

  // Helper: Retrieve primary department metadata for teacher
  const getTeacherDepartment = useCallback(
    (teacher) => {
      const tokens = getTeacherSubjectTokens(teacher);
      for (const dept of TUTOR_DEPARTMENTS) {
        if (dept.keywords.length > 0 && dept.keywords.some((kw) => tokens.includes(kw))) {
          return dept;
        }
      }
      return (
        TUTOR_DEPARTMENTS.find((d) => d.id === "general_sciences") ||
        TUTOR_DEPARTMENTS[TUTOR_DEPARTMENTS.length - 1]
      );
    },
    [getTeacherSubjectTokens],
  );

  // Overall metric counts for tutors
  const tutorMetrics = useMemo(() => {
    const teachers = (users || []).filter((u) => u.role === "teacher");
    let engaged = 0;
    teachers.forEach((t) => {
      if (getTeacherIsEngaged(t)) engaged++;
    });
    const standby = teachers.length - engaged;
    return { total: teachers.length, engaged, standby };
  }, [users, getTeacherIsEngaged]);

  // Filtered tutors list for 3-column responsive grid view
  const filteredTutors = useMemo(() => {
    const teachers = (users || []).filter((u) => u.role === "teacher");

    return teachers.filter((teacher) => {
      // Department filter
      if (selectedDepartment !== "all") {
        const inDept = (departmentTutorMap[selectedDepartment] || []).some((t) => t.id === teacher.id);
        if (!inDept) return false;
      }

      // Status filter
      const isEngaged = getTeacherIsEngaged(teacher);
      if (selectedTutorStatus === "engaged" && !isEngaged) return false;
      if (selectedTutorStatus === "standby" && isEngaged) return false;

      return true;
    });
  }, [users, selectedDepartment, selectedTutorStatus, departmentTutorMap, getTeacherIsEngaged]);

  // Overall metric counts for students
  const studentMetrics = useMemo(() => {
    const students = (users || []).filter((u) => u.role === "student");
    const active = students.filter(
      (s) =>
        s.is_engaged ||
        (s.enrollment_count && s.enrollment_count > 0) ||
        (s.enrolled_courses && s.enrolled_courses.length > 0)
    ).length;
    const inactive = students.length - active;
    return { total: students.length, active, inactive };
  }, [users]);

  // Filtered students list based on active/inactive status toggle
  const filteredStudents = useMemo(() => {
    const students = (users || []).filter((u) => u.role === "student");
    return students.filter((s) => {
      const isEnrolled =
        s.is_engaged ||
        (s.enrollment_count && s.enrollment_count > 0) ||
        (s.enrolled_courses && s.enrolled_courses.length > 0);
      if (selectedStudentStatus === "active" && !isEnrolled) return false;
      if (selectedStudentStatus === "inactive" && isEnrolled) return false;
      return true;
    });
  }, [users, selectedStudentStatus]);

  // Overall displayed users for current active role and sub-filters
  const displayedUsers = useMemo(() => {
    if (usersFilters.role === "teacher") return filteredTutors;
    if (usersFilters.role === "student") return filteredStudents;
    return users || [];
  }, [usersFilters.role, filteredTutors, filteredStudents, users]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <SearchControls
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        usersFilters={usersFilters}
        handleFilterChange={handleFilterChange}
        onFetchUsers={onFetchUsers}
        handleCreateUser={handleCreateUser}
        onClearFilters={handleClearFilters}
        tags={tags}
        onManageLabels={setLabelLibrary}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-32" />
                  <div className="h-3 bg-slate-800 rounded w-48" />
                </div>
              </div>
              <div className="h-10 bg-slate-800 rounded-xl" />
              <div className="h-8 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <EmptyState
            icon="fas fa-search"
            title={
              usersFilters.search || usersFilters.role || usersFilters.tags || usersFilters.is_active !== ""
                ? "No users found"
                : "No users yet"
            }
            description={
              usersFilters.search
                ? `No users match "${usersFilters.search}". Try a different search or clear the filters.`
                : usersFilters.role || usersFilters.tags || usersFilters.is_active !== ""
                  ? "No users match the selected filters."
                  : "There are no users to display at this time."
            }
            action={
              usersFilters.search || usersFilters.role || usersFilters.tags || usersFilters.is_active !== ""
                ? {
                    label: "Clear Filters",
                    icon: "fas fa-redo",
                    variant: "outline",
                    onClick: handleClearFilters,
                  }
                : null
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Click Filter Bar for Tutors (Visible in both Table & Cards view) */}
          {usersFilters.role === "teacher" && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-lg">
              {/* Department Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => setSelectedDepartment("all")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedDepartment === "all"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <i className="fas fa-layer-group text-[11px]" />
                  <span>All Departments</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300 font-mono">
                    {tutorMetrics.total}
                  </span>
                </button>
                {TUTOR_DEPARTMENTS.map((dept) => {
                  const count = (departmentTutorMap[dept.id] || []).length;
                  if (count === 0) return null;
                  const isActive = selectedDepartment === dept.id;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                        isActive
                          ? `${dept.bg} ${dept.color} ring-1 ring-current shadow-md`
                          : "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <i className={`fas ${dept.icon} text-[11px] ${isActive ? dept.color : "text-slate-400"}`} />
                      <span>{dept.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300 font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status Toggle (All / Engaged / Standby) */}
              <div className="flex items-center gap-1 shrink-0 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => setSelectedTutorStatus("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    selectedTutorStatus === "all"
                      ? "bg-slate-800 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({tutorMetrics.total})
                </button>
                <button
                  onClick={() => setSelectedTutorStatus("engaged")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    selectedTutorStatus === "engaged"
                      ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                      : "text-slate-400 hover:text-emerald-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Engaged ({tutorMetrics.engaged})</span>
                </button>
                <button
                  onClick={() => setSelectedTutorStatus("standby")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    selectedTutorStatus === "standby"
                      ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                      : "text-slate-400 hover:text-amber-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Standby ({tutorMetrics.standby})</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Click Filter Bar for Students (Visible in both Table & Cards view) */}
          {usersFilters.role === "student" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => setSelectedStudentStatus("all")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedStudentStatus === "all"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <i className="fas fa-users text-[11px]" />
                  <span>All Students</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300 font-mono">
                    {studentMetrics.total}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedStudentStatus("active")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    selectedStudentStatus === "active"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ring-1 ring-emerald-400 shadow-md shadow-emerald-500/10"
                      : "border-slate-800 text-slate-400 hover:text-emerald-300 hover:bg-slate-800"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active & Enrolled</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300 font-mono">
                    {studentMetrics.active}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedStudentStatus("inactive")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    selectedStudentStatus === "inactive"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-400 shadow-md shadow-rose-500/10"
                      : "border-slate-800 text-slate-400 hover:text-rose-300 hover:bg-slate-800"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>0 Enrollments (Inactive)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300 font-mono">
                    {studentMetrics.inactive}
                  </span>
                </button>
              </div>
            </div>
          )}

          {viewMode === "cards" ? (
            /* ─────────────────────────────────────────────
               CARDS VIEW MODE
               ───────────────────────────────────────────── */
            <div className="space-y-8">
              {/* 1. STUDENT VIEW (Grid of Cards) */}
              {usersFilters.role === "student" && (
                <div className="space-y-6">
                  {/* Student Metrics Header */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Total Students</p>
                        <p className="text-2xl font-black text-white mt-0.5">{studentMetrics.total}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <i className="fas fa-user-graduate" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-emerald-400 uppercase font-semibold">Active & Enrolled</p>
                        <p className="text-2xl font-black text-emerald-300 mt-0.5">{studentMetrics.active}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <i className="fas fa-check-circle" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-rose-400 uppercase font-semibold">0 Enrollments (Inactive)</p>
                        <p className="text-2xl font-black text-rose-300 mt-0.5">{studentMetrics.inactive}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <i className="fas fa-exclamation-triangle" />
                      </div>
                    </div>
                  </div>

                  {/* Deduplicated Student Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStudents.map((user) => (
                  <StudentCard
                    key={user.id}
                    user={user}
                    tagsFor={tagsFor}
                    handleFilterChange={handleFilterChange}
                    setTagModalUser={setTagModalUser}
                    handleViewUser={handleViewUser}
                    handleEditUser={handleEditUser}
                    handlePurgeUser={handlePurgeUser}
                    handleDeleteUser={handleDeleteUser}
                    processing={processing}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. TUTOR VIEW (Responsive 3-Column Grid like Others with Subject Department Filter) */}
          {usersFilters.role === "teacher" && (
            <div className="space-y-6">
              {/* Tutor Metrics Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Total Faculty</p>
                    <p className="text-2xl font-black text-white mt-0.5">{tutorMetrics.total}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <i className="fas fa-chalkboard-teacher" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-400 uppercase font-semibold">Engaged in Classes</p>
                    <p className="text-2xl font-black text-emerald-300 mt-0.5">{tutorMetrics.engaged}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <i className="fas fa-play-circle" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-400 uppercase font-semibold">Standby (Ready to Assign)</p>
                    <p className="text-2xl font-black text-amber-300 mt-0.5">{tutorMetrics.standby}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <i className="fas fa-pause-circle" />
                  </div>
                </div>
              </div>

              {/* Responsive 3-Column Tutor Grid: Cards wrap cleanly like others! */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => {
                  const assigned = getTeacherCourses(tutor);
                  const isEngaged = getTeacherIsEngaged(tutor);
                  return (
                    <TutorCard
                      key={tutor.id}
                      user={tutor}
                      assignedCourses={assigned}
                      isEngaged={isEngaged}
                      handleViewUser={handleViewUser}
                      handleEditUser={handleEditUser}
                      handlePurgeUser={handlePurgeUser}
                      handleDeleteUser={handleDeleteUser}
                      processing={processing}
                    />
                  );
                })}
              </div>

              {filteredTutors.length === 0 && (
                <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
                  <i className="fas fa-filter text-2xl mb-2 text-slate-500" />
                  <p className="text-sm">No tutors match the selected department or status filters.</p>
                </div>
              )}
            </div>
          )}

          {/* 3. GUARDIAN VIEW (Grid of Cards) */}
          {usersFilters.role === "parent" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Guardian Direct Communication Hub</h4>
                  <p className="text-xs text-purple-300 mt-0.5">
                    Connect directly to student guardians via WhatsApp or phone call.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <i className="fas fa-user-friends text-base" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((user) => (
                  <GuardianCard
                    key={user.id}
                    user={user}
                    handleViewUser={handleViewUser}
                    handleEditUser={handleEditUser}
                    handlePurgeUser={handlePurgeUser}
                    handleDeleteUser={handleDeleteUser}
                    processing={processing}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 4. ADMIN VIEW (eStudyGate Role Permissions Model + Grid of Cards) */}
          {usersFilters.role === "admin" && (
            <div className="space-y-8">
              {/* 4 Role Governance Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                    <i className="fas fa-sitemap text-indigo-400" />
                    <span>eStudyGate Platform Governance & Role Architecture</span>
                  </h3>
                  <span className="text-xs text-slate-400">Institutional Multi-Role Framework</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {ADMIN_GOVERNANCE_ROLES.map((role) => (
                    <div
                      key={role.role}
                      className={`p-5 rounded-2xl bg-slate-900/60 border ${role.border} flex flex-col justify-between space-y-3 shadow-lg`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                            <i className={`fas ${role.icon} ${role.color}`} />
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${role.badgeBg}`}>
                            {role.tagline}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{role.role}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Users Grid */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Configured Administrators ({users.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <AdminCard
                      key={user.id}
                      user={user}
                      handleViewUser={handleViewUser}
                      handleEditUser={handleEditUser}
                      handlePurgeUser={handlePurgeUser}
                      handleDeleteUser={handleDeleteUser}
                      processing={processing}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. ALL ROLES VIEW (Rich unified cards in 3-column grid) */}
          {usersFilters.role === "" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((user) => {
                  if (user.role === "student") {
                    return (
                      <StudentCard
                        key={user.id}
                        user={user}
                        tagsFor={tagsFor}
                        handleFilterChange={handleFilterChange}
                        setTagModalUser={setTagModalUser}
                        handleViewUser={handleViewUser}
                        handleEditUser={handleEditUser}
                        handlePurgeUser={handlePurgeUser}
                        handleDeleteUser={handleDeleteUser}
                        processing={processing}
                        navigate={navigate}
                      />
                    );
                  }
                  if (user.role === "teacher") {
                    const assigned = getTeacherCourses(user);
                    const isEngaged = getTeacherIsEngaged(user);
                    return (
                      <TutorCard
                        key={user.id}
                        user={user}
                        assignedCourses={assigned}
                        isEngaged={isEngaged}
                        handleViewUser={handleViewUser}
                        handleEditUser={handleEditUser}
                        handlePurgeUser={handlePurgeUser}
                        handleDeleteUser={handleDeleteUser}
                        processing={processing}
                      />
                    );
                  }
                  if (user.role === "parent") {
                    return (
                      <GuardianCard
                        key={user.id}
                        user={user}
                        handleViewUser={handleViewUser}
                        handleEditUser={handleEditUser}
                        handlePurgeUser={handlePurgeUser}
                        handleDeleteUser={handleDeleteUser}
                        processing={processing}
                      />
                    );
                  }
                  return (
                    <AdminCard
                      key={user.id}
                      user={user}
                      handleViewUser={handleViewUser}
                      handleEditUser={handleEditUser}
                      handlePurgeUser={handlePurgeUser}
                      handleDeleteUser={handleDeleteUser}
                      processing={processing}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────
           TABLE VIEW MODE (Dense Table preserved)
           ───────────────────────────────────────────── */
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Mobile Card-Table View */}
          <div className="lg:hidden divide-y divide-slate-800/50 space-y-4">
            {displayedUsers?.map((user) => (
              <div
                key={user.id}
                className={`p-4 sm:p-6 transition ${
                  user.is_superuser
                    ? "bg-amber-500/[0.04] border-l-2 border-amber-500/40"
                    : "hover:bg-slate-800/30"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="relative">
                    {getStorageUrl(user.avatar) ? (
                      <img
                        src={getStorageUrl(user.avatar)}
                        alt={user.username}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${getRoleColor(
                          user.role,
                        )}`}
                      >
                        <i
                          className={`fas ${
                            user.is_superuser ? "fa-crown text-amber-400" : "fa-user text-white"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-white text-sm sm:text-base">
                        {getDisplayName(user) || "Unknown User"}
                      </p>
                      {user.is_superuser && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                          <i className="fas fa-crown text-[8px]" />
                          Super Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] sm:text-xs text-slate-500 break-all">{user.email}</p>
                    {user.role === "student" && user.roll_no != null && (
                      <p className="text-[9px] sm:text-xs text-slate-500 break-all">
                        Roll #{user.roll_no}
                      </p>
                    )}
                    {user.role === "student" && tagsFor(user).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tagsFor(user).map((tag) => (
                          <TagChip
                            key={tag.id}
                            tag={tag}
                            onClick={() => handleFilterChange("tags", String(tag.id))}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getRoleColor(
                        user.role,
                      )}`}
                    >
                      {displayRole(user.role)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getStatusColor(
                        user.is_active,
                      )}`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {user.is_superuser ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 self-start sm:self-auto">
                      <i className="fas fa-lock text-amber-500/70 text-xs" />
                      <span className="text-amber-600/90 text-xs font-semibold">System Protected</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {user.role === "student" && (
                        <button
                          onClick={() => setTagModalUser(user)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-600/50 hover:text-indigo-300 transition"
                          title="Manage labels"
                        >
                          <i className="fas fa-tags text-xs" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-600/50 hover:text-slate-200 transition"
                        title="View user"
                      >
                        <i className="fas fa-eye text-xs" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition"
                        title="Edit user"
                      >
                        <i className="fas fa-edit text-xs" />
                      </button>
                      <button
                        onClick={() => handlePurgeUser(user)}
                        disabled={!!processing[user.id]}
                        className="w-8 h-8 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
                      >
                        <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-xs`} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={!!processing[user.id]}
                        className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition flex items-center gap-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                          user.is_active
                            ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                            : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
                        }`}
                      >
                        {processing[user.id] === "toggling" ? (
                          <>
                            <i className="fas fa-spinner fa-spin" />
                            {user.is_active ? "Deactivating..." : "Activating..."}
                          </>
                        ) : (
                          <>
                            <i className={`fas ${user.is_active ? "fa-ban" : "fa-check-circle"}`} />
                            {user.is_active ? "Deactivate" : "Activate"}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden lg:block">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                {usersFilters.role === "student" ? (
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-3 py-3">Roll #</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Grade</th>
                    <th className="px-3 py-3">Enrolled Subjects</th>
                    <th className="px-3 py-3">Guardian</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                ) : usersFilters.role === "teacher" ? (
                  <tr>
                    <th className="px-4 py-3">Tutor</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Assigned Classes</th>
                    <th className="px-3 py-3">Exp & Qual.</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                ) : usersFilters.role === "parent" ? (
                  <tr>
                    <th className="px-4 py-3">Guardian</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Phone & WhatsApp</th>
                    <th className="px-3 py-3">Linked Students</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                ) : usersFilters.role === "admin" ? (
                  <tr>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role & Scope</th>
                    <th className="px-3 py-3">Joined</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                ) : (
                  /* All Users Unified Table Header */
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">ID / Department</th>
                    <th className="px-3 py-3">Academic & Class Details</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedUsers?.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <i className="fas fa-search text-2xl text-slate-600" />
                        <p className="text-sm font-semibold text-slate-300">No users match the selected filters</p>
                        <p className="text-xs text-slate-500">Try selecting "All" or clearing the active search filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedUsers?.map((user) => {
                    const assigned = user.role === "teacher" ? getTeacherCourses(user) : [];
                    const isEngaged = user.role === "teacher" ? getTeacherIsEngaged(user) : false;

                    if (usersFilters.role === "student") {
                      return (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                          {/* Student */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              {getStorageUrl(user.avatar) ? (
                                <img
                                  src={getStorageUrl(user.avatar)}
                                  alt={user.username}
                                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                  {(getDisplayName(user) || "S")[0].toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-white text-xs leading-none">
                                  {getDisplayName(user) || "Unknown Student"}
                                </p>
                                {tagsFor(user).length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    {tagsFor(user).slice(0, 2).map((tag) => (
                                      <TagChip key={tag.id} tag={tag} onClick={() => handleFilterChange("tags", String(tag.id))} />
                                    ))}
                                    {tagsFor(user).length > 2 && (
                                      <span className="text-[10px] text-slate-500">+{tagsFor(user).length - 2}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Roll # */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {user.roll_no != null ? (
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 font-mono text-[11px] text-slate-300 font-semibold">
                                #{user.roll_no}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Email */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="font-mono text-xs text-slate-300 select-all hover:text-indigo-300 transition" title={user.email}>
                              {user.email}
                            </span>
                          </td>

                          {/* Grade */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {user.grade_level ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                                <i className="fas fa-layer-group text-[9px]" />
                                {user.grade_level}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Enrolled Subjects */}
                          <td className="px-3 py-2.5">
                            {user.enrolled_courses && user.enrolled_courses.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                                {user.enrolled_courses.slice(0, 2).map((course, idx) => (
                                  <span
                                    key={course.id || idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 text-slate-200 text-[11px] font-medium whitespace-nowrap"
                                    title={course.title}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="max-w-[110px] truncate">{course.title}</span>
                                  </span>
                                ))}
                                {user.enrolled_courses.length > 2 && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold"
                                    title={user.enrolled_courses.slice(2).map((c) => c.title).join(", ")}
                                  >
                                    +{user.enrolled_courses.length - 2} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-medium whitespace-nowrap">
                                <i className="fas fa-exclamation-circle text-[9px]" />
                                0 Courses
                              </span>
                            )}
                          </td>

                          {/* Guardian */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {user.guardian?.name ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                                <i className="fas fa-user-shield text-purple-400 text-[10px]" />
                                <span>{user.guardian.name}</span>
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {user.is_active ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/15 text-slate-400 border border-slate-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-2.5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setTagModalUser(user)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-indigo-300 transition"
                                title="Manage labels"
                              >
                                <i className="fas fa-tags text-[11px]" />
                              </button>
                              <button
                                onClick={() => handleViewUser(user.id)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                title="View student"
                              >
                                <i className="fas fa-eye text-[11px]" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user.id)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                title="Edit student"
                              >
                                <i className="fas fa-edit text-[11px]" />
                              </button>
                              <button
                                onClick={() => handlePurgeUser(user)}
                                disabled={!!processing[user.id]}
                                className="w-7 h-7 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50"
                                title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
                              >
                                <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-[11px]`} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={!!processing[user.id]}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                                  user.is_active
                                    ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                                    : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
                                }`}
                              >
                                {processing[user.id] === "toggling" ? (
                                  <i className="fas fa-spinner fa-spin text-[10px]" />
                                ) : (
                                  user.is_active ? "Deactivate" : "Activate"
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    if (usersFilters.role === "teacher") {
                      const dept = getTeacherDepartment(user);
                      return (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                          {/* Tutor */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              {getStorageUrl(user.avatar) ? (
                                <img
                                  src={getStorageUrl(user.avatar)}
                                  alt={user.username}
                                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                  {(getDisplayName(user) || "T")[0].toUpperCase()}
                                </div>
                              )}
                              <p className="font-semibold text-white text-xs leading-none">
                                {getDisplayName(user) || "Unknown Tutor"}
                              </p>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="font-mono text-xs text-slate-300 select-all hover:text-indigo-300 transition" title={user.email}>
                              {user.email}
                            </span>
                          </td>

                          {/* Department */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold ${dept.bg} ${dept.color}`}>
                              <i className={`fas ${dept.icon} text-[10px]`} />
                              <span>{dept.name}</span>
                            </span>
                          </td>

                          {/* Assigned Classes */}
                          <td className="px-3 py-2.5">
                            {assigned.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold whitespace-nowrap">
                                  <i className="fas fa-play text-[9px]" />
                                  {assigned.length} {assigned.length === 1 ? "Class" : "Classes"}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate max-w-[130px]" title={assigned.map((c) => c.title).join(", ")}>
                                  {assigned.map((c) => c.title).join(", ")}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium whitespace-nowrap">
                                <i className="fas fa-clock text-[9px]" />
                                Standby (0 assigned)
                              </span>
                            )}
                          </td>

                          {/* Exp & Qual */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <div className="text-xs text-slate-300">
                              {user.experience_years != null && <span>{user.experience_years} yrs exp</span>}
                              {user.experience_years != null && user.qualification && <span className="text-slate-500 mx-1">•</span>}
                              {user.qualification && <span className="text-slate-400">{user.qualification}</span>}
                              {!user.experience_years && !user.qualification && <span className="text-slate-600">—</span>}
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {user.phone ? (
                              <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                                <i className="fas fa-phone text-[9px] text-slate-500" />
                                <span>{user.phone}</span>
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {!user.is_active ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/15 text-slate-400 border border-slate-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                Inactive
                              </span>
                            ) : isEngaged ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Engaged
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                Standby
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-2.5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleViewUser(user.id)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                title="View tutor"
                              >
                                <i className="fas fa-eye text-[11px]" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user.id)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                title="Edit tutor"
                              >
                                <i className="fas fa-edit text-[11px]" />
                              </button>
                              <button
                                onClick={() => handlePurgeUser(user)}
                                disabled={!!processing[user.id]}
                                className="w-7 h-7 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50"
                                title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
                              >
                                <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-[11px]`} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={!!processing[user.id]}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                                  user.is_active
                                    ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                                    : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
                                }`}
                              >
                                {processing[user.id] === "toggling" ? (
                                  <i className="fas fa-spinner fa-spin text-[10px]" />
                                ) : (
                                  user.is_active ? "Deactivate" : "Activate"
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    if (usersFilters.role === "parent") {
                      return (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                          {/* Guardian */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              {getStorageUrl(user.avatar) ? (
                                <img
                                  src={getStorageUrl(user.avatar)}
                                  alt={user.username}
                                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                  <i className="fas fa-user-friends text-[10px]" />
                                </div>
                              )}
                              <p className="font-semibold text-white text-xs leading-none">
                                {getDisplayName(user) || "Unknown Guardian"}
                              </p>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="font-mono text-xs text-slate-300 select-all hover:text-indigo-300 transition" title={user.email}>
                              {user.email}
                            </span>
                          </td>

                          {/* Phone & WhatsApp */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {user.phone ? (
                              <a
                                href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}?text=Hello%20from%20Virtual%20City%20School`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/25 transition"
                              >
                                <i className="fab fa-whatsapp text-emerald-400" />
                                <span>{user.phone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>

                          {/* Linked Students */}
                          <td className="px-3 py-2.5">
                            {user.linked_children && user.linked_children.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {user.linked_children.map((child, idx) => (
                                  <span
                                    key={child.id || idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs whitespace-nowrap"
                                  >
                                    <i className="fas fa-user-graduate text-[9px]" />
                                    <span>{child.display_name || child.username}</span>
                                    {child.roll_no && <span className="font-mono text-[10px] text-purple-400">#{child.roll_no}</span>}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500 text-xs italic">No linked students</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              user.is_active
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                            }`}>
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-2.5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleViewUser(user.id)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                title="View guardian"
                              >
                                <i className="fas fa-eye text-[11px]" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user.id)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                title="Edit guardian"
                              >
                                <i className="fas fa-edit text-[11px]" />
                              </button>
                              <button
                                onClick={() => handlePurgeUser(user)}
                                disabled={!!processing[user.id]}
                                className="w-7 h-7 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50"
                                title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
                              >
                                <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-[11px]`} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={!!processing[user.id]}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                                  user.is_active
                                    ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                                    : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
                                }`}
                              >
                                {processing[user.id] === "toggling" ? (
                                  <i className="fas fa-spinner fa-spin text-[10px]" />
                                ) : (
                                  user.is_active ? "Deactivate" : "Activate"
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    if (usersFilters.role === "admin") {
                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-800/30 transition-colors group ${
                            user.is_superuser ? "bg-amber-500/[0.03]" : ""
                          }`}
                        >
                          {/* Admin */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  user.is_superuser
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                <i className={`fas ${user.is_superuser ? "fa-crown text-[10px]" : "fa-shield-alt text-[10px]"}`} />
                              </div>
                              <p className="font-semibold text-white text-xs leading-none">
                                {getDisplayName(user) || "Admin"}
                              </p>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="font-mono text-xs text-slate-300 select-all hover:text-indigo-300 transition" title={user.email}>
                              {user.email}
                            </span>
                          </td>

                          {/* Role & Privileges */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {user.is_superuser ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                                <i className="fas fa-crown text-[9px] text-amber-400" />
                                Super Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                                <i className="fas fa-shield-alt text-[9px]" />
                                Platform Admin
                              </span>
                            )}
                          </td>

                          {/* Joined */}
                          <td className="px-3 py-2.5 whitespace-nowrap text-xs text-slate-400 font-mono">
                            {formatDate(user.date_joined)}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              user.is_active
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                            }`}>
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-2.5 whitespace-nowrap text-right">
                            {user.is_superuser ? (
                              <span className="text-amber-500/80 text-xs italic font-medium">
                                <i className="fas fa-lock text-[10px] mr-1" />
                                Protected
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleViewUser(user.id)}
                                  className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                  title="View admin"
                                >
                                  <i className="fas fa-eye text-[11px]" />
                                </button>
                                <button
                                  onClick={() => handleEditUser(user.id)}
                                  className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                  title="Edit admin"
                                >
                                  <i className="fas fa-edit text-[11px]" />
                                </button>
                                <button
                                  onClick={() => handlePurgeUser(user)}
                                  disabled={!!processing[user.id]}
                                  className="w-7 h-7 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50"
                                  title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
                                >
                                  <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-[11px]`} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={!!processing[user.id]}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                                    user.is_active
                                      ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                                      : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
                                  }`}
                                >
                                  {processing[user.id] === "toggling" ? (
                                    <i className="fas fa-spinner fa-spin text-[10px]" />
                                  ) : (
                                    user.is_active ? "Deactivate" : "Activate"
                                  )}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    }

                    /* All Users Unified Row */
                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-slate-800/30 transition-colors group ${
                          user.is_superuser ? "bg-amber-500/[0.03]" : ""
                        }`}
                      >
                        {/* User */}
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {getStorageUrl(user.avatar) ? (
                              <img
                                src={getStorageUrl(user.avatar)}
                                alt={user.username}
                                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                              />
                            ) : (
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${getRoleColor(user.role)}`}>
                                {user.is_superuser ? (
                                  <i className="fas fa-crown text-[10px] text-amber-400" />
                                ) : (
                                  (getDisplayName(user) || "U")[0].toUpperCase()
                                )}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-xs leading-none">
                                {getDisplayName(user) || "Unknown User"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="font-mono text-xs text-slate-300 select-all hover:text-indigo-300 transition" title={user.email}>
                            {user.email}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getRoleColor(user.role)}`}>
                            {displayRole(user.role)}
                          </span>
                        </td>

                        {/* Specific details */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {user.role === "student" && (
                            <div className="flex items-center gap-1.5">
                              {user.roll_no != null && (
                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-300 font-semibold">
                                  #{user.roll_no}
                                </span>
                              )}
                              {user.grade_level && (
                                <span className="text-[11px] text-indigo-300">{user.grade_level}</span>
                              )}
                              {!user.roll_no && !user.grade_level && <span className="text-slate-600 text-xs">—</span>}
                            </div>
                          )}
                          {user.role === "teacher" && (
                            (() => {
                              const dept = getTeacherDepartment(user);
                              return (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${dept.bg} ${dept.color}`}>
                                  <i className={`fas ${dept.icon} text-[9px]`} />
                                  <span>{dept.name}</span>
                                </span>
                              );
                            })()
                          )}
                          {user.role === "parent" && (
                            user.phone ? (
                              <span className="text-xs text-slate-300 font-mono">{user.phone}</span>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )
                          )}
                          {user.role === "admin" && (
                            user.is_superuser ? (
                              <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                                <i className="fas fa-crown text-[9px]" /> Super Admin
                              </span>
                            ) : (
                              <span className="text-indigo-300 text-xs">Platform Admin</span>
                            )
                          )}
                        </td>

                        {/* Academic / Class Assignments */}
                        <td className="px-3 py-2.5">
                          {user.role === "student" && (
                            user.enrolled_courses && user.enrolled_courses.length > 0 ? (
                              <span className="text-xs text-slate-300">
                                <span className="text-emerald-400 font-semibold">{user.enrolled_courses.length} enrolled:</span>{" "}
                                {user.enrolled_courses.map((c) => c.title).slice(0, 2).join(", ")}
                                {user.enrolled_courses.length > 2 ? "..." : ""}
                              </span>
                            ) : (
                              <span className="text-xs text-rose-400 italic">0 courses enrolled</span>
                            )
                          )}
                          {user.role === "teacher" && (
                            assigned.length > 0 ? (
                              <span className="text-xs text-emerald-400 font-semibold">
                                {assigned.length} assigned class(es)
                              </span>
                            ) : (
                              <span className="text-xs text-amber-400 italic">Standby (0 assigned)</span>
                            )
                          )}
                          {user.role === "parent" && (
                            user.linked_children && user.linked_children.length > 0 ? (
                              <span className="text-xs text-purple-300">
                                {user.linked_children.length} linked: {user.linked_children.map((c) => c.display_name || c.username).join(", ")}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 italic">No linked students</span>
                            )
                          )}
                          {user.role === "admin" && (
                            <span className="text-xs text-slate-400">System Administration</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(user.is_active)}`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2.5 whitespace-nowrap text-right">
                          {user.is_superuser ? (
                            <span className="text-amber-500/80 text-xs italic font-medium">Protected</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              {user.role === "student" && (
                                <button
                                  onClick={() => setTagModalUser(user)}
                                  className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-indigo-300 transition"
                                  title="Manage labels"
                                >
                                  <i className="fas fa-tags text-[11px]" />
                                </button>
                              )}
                              <button
                                onClick={() => handleViewUser(user.id)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                title="View details"
                              >
                                <i className="fas fa-eye text-[11px]" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user.id)}
                                className="w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                                title="Edit user"
                              >
                                <i className="fas fa-edit text-[11px]" />
                              </button>
                              <button
                                onClick={() => handlePurgeUser(user)}
                                disabled={!!processing[user.id]}
                                className="w-7 h-7 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50"
                                title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
                              >
                                <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-[11px]`} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={!!processing[user.id]}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                                  user.is_active
                                    ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                                    : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
                                }`}
                              >
                                {processing[user.id] === "toggling" ? (
                                  <i className="fas fa-spinner fa-spin text-[10px]" />
                                ) : (
                                  user.is_active ? "Deactivate" : "Activate"
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )}

      {/* Label Management Modals */}
      {labelLibrary && (
        <StudentTagsModal
          student={null}
          tags={tags}
          initialHighlight={labelLibrary.highlight || null}
          onClose={() => setLabelLibrary(null)}
          onTagsChanged={refreshTags}
          onStudentsStale={handleStudentsStale}
          onSaved={() => {}}
        />
      )}

      {tagModalUser && (
        <StudentTagsModal
          student={{
            id: tagModalUser.id,
            name: getDisplayName(tagModalUser) || tagModalUser.email,
            roll_no: tagModalUser.roll_no,
            tags: tagsFor(tagModalUser),
          }}
          tags={tags}
          onClose={() => setTagModalUser(null)}
          onTagsChanged={refreshTags}
          onStudentsStale={handleStudentsStale}
          onSaved={(userId, saved) => {
            setTagOverrides((prev) => ({ ...prev, [userId]: saved }));
            refreshTags();
          }}
        />
      )}

      {/* Deactivate/Activate Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        variant={confirmDialog.isActive ? "warning" : "success"}
        title={confirmDialog.isActive ? "Deactivate User" : "Activate User"}
        message={
          confirmDialog.isActive
            ? "Are you sure you want to deactivate this user? They will lose access to the platform."
            : "Are you sure you want to activate this user? They will regain access to the platform."
        }
        loading={processing[confirmDialog.userId] === "toggling"}
        confirmLabel={
          processing[confirmDialog.userId] === "toggling"
            ? confirmDialog.isActive
              ? "Deactivating..."
              : "Activating..."
            : confirmDialog.isActive
              ? "Deactivate"
              : "Activate"
        }
        cancelLabel="Cancel"
        onConfirm={confirmDeleteUser}
        onCancel={() =>
          setConfirmDialog({
            open: false,
            userId: null,
            isActive: false,
            user: null,
          })
        }
      />

      {/* Permanent Delete Confirm Dialog */}
      <ConfirmDialog
        open={purgeDialog.open}
        variant="danger"
        title="Delete User Permanently"
        message="This will permanently remove the user record and cannot be undone. This action is irreversible."
        loading={processing[purgeDialog.userId] === "purging"}
        confirmLabel={
          processing[purgeDialog.userId] === "purging" ? "Deleting..." : "Delete"
        }
        cancelLabel="Cancel"
        onConfirm={confirmPurgeUser}
        onCancel={() => setPurgeDialog({ open: false, userId: null })}
      />
    </div>
  );
};

export default UsersTab;
