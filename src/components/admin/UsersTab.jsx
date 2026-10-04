import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FilterSelect,
  SearchInput,
  EmptyState,
} from "../../components/ui";
import ConfirmDialog from "../common/ConfirmDialog";
import { getStorageUrl } from "../../utils/storageUrl";
import { toastManager } from "../../utils/toastManager";
import { getDisplayName } from "../../utils/userDisplay";
import { TagChip, StudentTagsModal, LabelFilterDropdown } from "./StudentTags";
import { useStudentTags } from "../../hooks/useStudentTags";

// Subject department definitions for Tutor Swimlanes
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
        {/* Card Header: Avatar, Name, Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
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
            <div className="min-w-0">
              <h4 className="font-bold text-white text-base truncate">
                {getDisplayName(user) || "Student"}
              </h4>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              {user.phone && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <i className="fas fa-phone text-[9px]" />
                  <span>{user.phone}</span>
                </p>
              )}
            </div>
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

// Tutor Card inside Subject Swimlane: Green if engaged, Amber if standby
const TutorCard = ({
  user,
  handleViewUser,
  handleEditUser,
  handlePurgeUser,
  handleDeleteUser,
  processing,
}) => {
  const assignedList = user.assigned_courses || [];
  const isEngaged = user.is_engaged || assignedList.length > 0;

  return (
    <div
      className={`min-w-[310px] max-w-[330px] rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xl shrink-0 transition-all duration-200 ${
        isEngaged
          ? "border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 hover:border-emerald-500/60"
          : "border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 hover:border-amber-500/60"
      }`}
    >
      <div className="p-5 space-y-4">
        {/* Header: Avatar, Name, Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
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
                    isEngaged
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {(getDisplayName(user) || user.username || "T")[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-white text-base truncate">
                {getDisplayName(user) || "Tutor"}
              </h4>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              {user.phone && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <i className="fas fa-phone text-[9px]" />
                  <span>{user.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Engaged vs Standby badge */}
          <div className="shrink-0">
            {isEngaged ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Engaged • {assignedList.length} Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Standby • Available
              </span>
            )}
          </div>
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
            <span>{isEngaged ? `Assigned Courses (${assignedList.length})` : "Current Status"}</span>
          </div>

          {isEngaged ? (
            <div className="space-y-1 max-h-28 overflow-y-auto no-scrollbar">
              {assignedList.map((course, idx) => (
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
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-lg shrink-0">
              <i className="fas fa-user-friends text-base" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-white text-base truncate">
                {getDisplayName(user) || "Guardian"}
              </h4>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              {user.phone && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <i className="fas fa-phone text-[9px]" />
                  <span>{user.phone}</span>
                </p>
              )}
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              user.is_active
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-slate-500/15 text-slate-400 border-slate-500/30"
            }`}
          >
            {user.is_active ? "Active" : "Inactive"}
          </span>
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
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                user.is_superuser
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              <i className={`fas ${user.is_superuser ? "fa-crown text-amber-400" : "fa-shield-alt text-red-400"}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-white text-base truncate">
                  {getDisplayName(user) || "Admin"}
                </h4>
                {user.is_superuser && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                    <i className="fas fa-crown text-[8px]" />
                    Super Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              user.is_active
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-slate-500/15 text-slate-400 border-slate-500/30"
            }`}
          >
            {user.is_active ? "Active" : "Inactive"}
          </span>
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
  const [viewMode, setViewMode] = useState("cards"); // 'cards' (default) vs 'table'
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

  // Group tutors into subject swimlanes
  const tutorDepartmentGroups = useMemo(() => {
    const teachers = (users || []).filter((u) => u.role === "teacher");
    const departmentMap = {};

    TUTOR_DEPARTMENTS.forEach((dept) => {
      departmentMap[dept.id] = [];
    });

    teachers.forEach((teacher) => {
      // Gather all subjects and course text for this teacher
      const subjectTokens = [
        ...(teacher.subjects || []),
        teacher.expertise || "",
        ...(teacher.assigned_courses || []).map((c) => `${c.title} ${c.category || ""}`),
      ]
        .join(" ")
        .toLowerCase();

      let matched = false;
      TUTOR_DEPARTMENTS.forEach((dept) => {
        if (dept.keywords.length > 0) {
          const hasKeyword = dept.keywords.some((kw) => subjectTokens.includes(kw));
          if (hasKeyword) {
            departmentMap[dept.id].push(teacher);
            matched = true;
          }
        }
      });

      // If tutor doesn't match any specific department keyword, place in general
      if (!matched) {
        departmentMap["general_sciences"].push(teacher);
      }
    });

    return TUTOR_DEPARTMENTS.map((dept) => ({
      ...dept,
      tutors: departmentMap[dept.id] || [],
      engagedCount: (departmentMap[dept.id] || []).filter(
        (t) => t.is_engaged || (t.assigned_courses && t.assigned_courses.length > 0)
      ).length,
      standbyCount: (departmentMap[dept.id] || []).filter(
        (t) => !t.is_engaged && (!t.assigned_courses || t.assigned_courses.length === 0)
      ).length,
    })).filter((dept) => dept.tutors.length > 0);
  }, [users]);

  // Overall metric counts for tutors
  const tutorMetrics = useMemo(() => {
    const teachers = (users || []).filter((u) => u.role === "teacher");
    const engaged = teachers.filter(
      (t) => t.is_engaged || (t.assigned_courses && t.assigned_courses.length > 0)
    ).length;
    const standby = teachers.length - engaged;
    return { total: teachers.length, engaged, standby };
  }, [users]);

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
      ) : viewMode === "cards" ? (
        /* ─────────────────────────────────────────────
           CARDS VIEW MODE
           ───────────────────────────────────────────── */
        <div className="space-y-8">
          {/* 1. STUDENT VIEW */}
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
                {users.map((user) => (
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

          {/* 2. TUTOR VIEW (Subject-wise Horizontal Swimlanes) */}
          {usersFilters.role === "teacher" && (
            <div className="space-y-8">
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

              {/* Subject-Wise Horizontal Swimlanes */}
              <div className="space-y-8">
                {tutorDepartmentGroups.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4"
                  >
                    {/* Swimlane Department Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${dept.bg}`}>
                          <i className={`fas ${dept.icon} ${dept.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                            <span>{dept.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                              {dept.tutors.length}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400">
                            Subject Faculty & Class Allocation Lane
                          </p>
                        </div>
                      </div>

                      {/* Engaged vs Standby Pills */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{dept.engagedCount} Engaged</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{dept.standbyCount} Standby</span>
                        </span>
                      </div>
                    </div>

                    {/* Horizontal Scrollable Row */}
                    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
                      {dept.tutors.map((tutor) => (
                        <TutorCard
                          key={`${dept.id}-${tutor.id}`}
                          user={tutor}
                          handleViewUser={handleViewUser}
                          handleEditUser={handleEditUser}
                          handlePurgeUser={handlePurgeUser}
                          handleDeleteUser={handleDeleteUser}
                          processing={processing}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. GUARDIAN VIEW */}
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
                  <i className="fas fa-user-shield" />
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

          {/* 4. ADMIN VIEW (eStudyGate Role Permissions Model) */}
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

          {/* 5. ALL ROLES VIEW (Rich unified cards) */}
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
                    return (
                      <TutorCard
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
            {users?.map((user) => (
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
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                    Role & Subjects / Children
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-800 ${
                      user.is_superuser ? "bg-amber-500/[0.04]" : "hover:bg-slate-800/20 transition"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getStorageUrl(user.avatar) ? (
                          <img
                            src={getStorageUrl(user.avatar)}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getRoleColor(
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
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-white">
                              {getDisplayName(user) || "Unknown User"}
                            </p>
                            {user.is_superuser && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                                <i className="fas fa-crown text-[8px]" />
                                Super Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          {user.role === "student" && user.roll_no != null && (
                            <p className="text-sm text-slate-400">Roll #{user.roll_no}</p>
                          )}
                          {user.role === "student" && tagsFor(user).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 max-w-xs">
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getRoleColor(
                            user.role,
                          )}`}
                        >
                          {displayRole(user.role)}
                        </span>
                        {user.role === "student" && user.enrolled_courses?.length > 0 && (
                          <p className="text-xs text-slate-400">
                            {user.enrolled_courses.length} enrolled: {user.enrolled_courses.map((c) => c.title).slice(0, 2).join(", ")}
                            {user.enrolled_courses.length > 2 ? "..." : ""}
                          </p>
                        )}
                        {user.role === "teacher" && (
                          <p className="text-xs text-slate-400">
                            {user.assigned_courses?.length > 0
                              ? `${user.assigned_courses.length} assigned class(es)`
                              : "Standby (0 assigned)"}
                          </p>
                        )}
                        {user.role === "parent" && user.linked_children?.length > 0 && (
                          <p className="text-xs text-slate-400">
                            {user.linked_children.length} linked child(ren)
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getStatusColor(
                          user.is_active,
                        )}`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_superuser ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 w-fit">
                          <i className="fas fa-lock text-amber-500/70 text-xs" />
                          <span className="text-amber-600/90 text-xs font-semibold">System Protected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
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
                            style={{ minWidth: "100px" }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition text-center disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.is_active
                                ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                                : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
                            }`}
                          >
                            {processing[user.id] === "toggling" ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-1" />
                                {user.is_active ? "Deactivating..." : "Activating..."}
                              </>
                            ) : (
                              <>
                                <i className={`fas ${user.is_active ? "fa-ban" : "fa-check-circle"} mr-1`} />
                                {user.is_active ? "Deactivate" : "Activate"}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
