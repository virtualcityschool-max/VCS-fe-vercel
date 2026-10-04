import React, { useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  clearEnrollmentsError,
  unenrollStudent,
} from "../../store/slices/adminSlice";
import { FilterSelect, SearchInput } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";
import CreateEnrollmentModal from "./CreateEnrollmentModal";
import { showApiError } from "../../utils/apiErrorHandler";

// Subject department definitions matching VCS standard
const ENROLLMENT_DEPARTMENTS = [
  {
    id: "all",
    name: "All Subjects",
    icon: "fa-layer-group",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    keywords: [],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: "fa-calculator",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    keywords: ["math", "mathematics", "calculus", "algebra", "geometry", "0580", "4024", "9709"],
  },
  {
    id: "physics",
    name: "Physics",
    icon: "fa-atom",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    keywords: ["physics", "mechanics", "astrophysics", "quantum", "0625", "5054", "9702"],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "fa-flask",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    keywords: ["chemistry", "organic", "inorganic", "biochemistry", "0620", "5070", "9701"],
  },
  {
    id: "biology",
    name: "Biology",
    icon: "fa-dna",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    keywords: ["biology", "bio", "zoology", "botany", "life science", "genetics", "0610", "5090", "9700"],
  },
  {
    id: "english_urdu",
    name: "English & Urdu",
    icon: "fa-book-open",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    keywords: ["english", "urdu", "literature", "language", "grammar", "ielts", "toefl", "0500", "1123", "3248"],
  },
  {
    id: "computer_science",
    name: "Computer Science",
    icon: "fa-laptop-code",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    keywords: ["computer", "programming", "coding", "software", "python", "cs", "0478", "2210", "9618"],
  },
  {
    id: "general_sciences",
    name: "General Sciences",
    icon: "fa-graduation-cap",
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
    keywords: [],
  },
];

const getCourseDepartment = (course) => {
  if (!course) return ENROLLMENT_DEPARTMENTS[ENROLLMENT_DEPARTMENTS.length - 1];
  const catName = typeof course.category === "object" ? course.category?.name : course.category || "";
  const title = course.title || "";
  const text = `${title} ${catName}`.toLowerCase();

  for (const dept of ENROLLMENT_DEPARTMENTS) {
    if (dept.id !== "all" && dept.keywords.length > 0) {
      if (dept.keywords.some((kw) => text.includes(kw))) {
        return dept;
      }
    }
  }
  return ENROLLMENT_DEPARTMENTS[ENROLLMENT_DEPARTMENTS.length - 1]; // general_sciences
};

// Distinct student color themes to differentiate users and eliminate visual blending
const STUDENT_THEMES = [
  {
    border: "border-l-indigo-500",
    avatarBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    rowBg: "bg-slate-900/90",
    rowHover: "hover:bg-indigo-950/25",
  },
  {
    border: "border-l-emerald-500",
    avatarBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    rowBg: "bg-slate-900/50",
    rowHover: "hover:bg-emerald-950/25",
  },
  {
    border: "border-l-purple-500",
    avatarBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    rowBg: "bg-slate-900/90",
    rowHover: "hover:bg-purple-950/25",
  },
  {
    border: "border-l-amber-500",
    avatarBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    rowBg: "bg-slate-900/50",
    rowHover: "hover:bg-amber-950/25",
  },
  {
    border: "border-l-cyan-500",
    avatarBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    rowBg: "bg-slate-900/90",
    rowHover: "hover:bg-cyan-950/25",
  },
  {
    border: "border-l-rose-500",
    avatarBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    badgeBg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    rowBg: "bg-slate-900/50",
    rowHover: "hover:bg-rose-950/25",
  },
  {
    border: "border-l-blue-500",
    avatarBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    rowBg: "bg-slate-900/90",
    rowHover: "hover:bg-blue-950/25",
  },
];

const EnrollmentsTab = ({ enrollments, loading, error, onRefresh }) => {
  const dispatch = useDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStudentForEnrollment, setSelectedStudentForEnrollment] = useState(null);

  // Filter states
  const [studentFilter, setStudentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [enrollmentCountFilter, setEnrollmentCountFilter] = useState("all"); // 'all' | 'multiple' | 'single'
  const [viewMode, setViewMode] = useState("table"); // 'table' (Deduplicated Student Table) | 'cards' (Deduplicated Cards) | 'detailed' (Flat junction records)

  // Unenroll state
  const [unenrollConfirm, setUnenrollConfirm] = useState(null);
  const [unenrollingId, setUnenrollingId] = useState(null);

  // Check if any filters are applied
  const hasActiveFilters = useMemo(() => {
    return (
      studentFilter.trim() ||
      courseFilter.trim() ||
      typeFilter !== "all" ||
      statusFilter !== "all" ||
      dateSort !== "newest" ||
      selectedDepartment !== "all" ||
      enrollmentCountFilter !== "all"
    );
  }, [studentFilter, courseFilter, typeFilter, statusFilter, dateSort, selectedDepartment, enrollmentCountFilter]);

  // Base filtered enrollments
  const filteredEnrollments = useMemo(() => {
    if (!enrollments) return [];
    let filtered = [...enrollments];

    // Student filter
    if (studentFilter.trim()) {
      const studentLower = studentFilter.toLowerCase();
      filtered = filtered.filter((e) => {
        return (
          e.student?.username?.toLowerCase().includes(studentLower) ||
          e.student?.email?.toLowerCase().includes(studentLower) ||
          String(e.student_roll_no || "").toLowerCase().includes(studentLower)
        );
      });
    }

    // Course filter
    if (courseFilter.trim()) {
      const courseLower = courseFilter.toLowerCase();
      filtered = filtered.filter((e) => {
        const catName = typeof e.course?.category === "object" ? e.course?.category?.name : e.course?.category;
        return (
          e.course?.title?.toLowerCase().includes(courseLower) ||
          (catName && catName.toLowerCase().includes(courseLower))
        );
      });
    }

    // Department quick filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((e) => {
        const dept = getCourseDepartment(e.course);
        return dept.id === selectedDepartment;
      });
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((e) => {
        if (typeFilter === "private") return e.is_private === true;
        if (typeFilter === "normal") return e.is_private === false;
        return true;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => {
        return e.status?.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Date sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.enrolled_at || 0);
      const dateB = new Date(b.enrolled_at || 0);
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [
    enrollments,
    studentFilter,
    courseFilter,
    selectedDepartment,
    typeFilter,
    statusFilter,
    dateSort,
  ]);

  // Group enrollments by student so each student appears ONLY ONCE
  const studentGroups = useMemo(() => {
    const map = new Map();
    filteredEnrollments.forEach((e) => {
      const studentId = e.student?.id || e.student?.email || "unknown";
      if (!map.has(studentId)) {
        map.set(studentId, {
          studentId,
          student: e.student,
          student_roll_no: e.student_roll_no || e.student?.roll_no,
          enrollments: [],
          latest_enrolled_at: e.enrolled_at,
          has_active: e.status?.toLowerCase() === "active",
        });
      }
      const group = map.get(studentId);
      group.enrollments.push(e);
      if (new Date(e.enrolled_at || 0) > new Date(group.latest_enrolled_at || 0)) {
        group.latest_enrolled_at = e.enrolled_at;
      }
      if (e.status?.toLowerCase() === "active") {
        group.has_active = true;
      }
    });

    let groups = Array.from(map.values());

    // Apply multiple vs single course filter
    if (enrollmentCountFilter === "multiple") {
      groups = groups.filter((g) => g.enrollments.length > 1);
    } else if (enrollmentCountFilter === "single") {
      groups = groups.filter((g) => g.enrollments.length === 1);
    }

    return groups;
  }, [filteredEnrollments, enrollmentCountFilter]);

  // Metrics for quick filter bar
  const metrics = useMemo(() => {
    if (!enrollments) return { totalStudents: 0, multiCourseStudents: 0, singleCourseStudents: 0, totalEnrollments: 0 };
    const studentMap = new Map();
    enrollments.forEach((e) => {
      const id = e.student?.id || e.student?.email || "unknown";
      studentMap.set(id, (studentMap.get(id) || 0) + 1);
    });

    let multi = 0;
    let single = 0;
    studentMap.forEach((cnt) => {
      if (cnt > 1) multi++;
      else single++;
    });

    return {
      totalStudents: studentMap.size,
      multiCourseStudents: multi,
      singleCourseStudents: single,
      totalEnrollments: enrollments.length,
    };
  }, [enrollments]);

  // Department enrollment counts
  const departmentCounts = useMemo(() => {
    const counts = { all: enrollments?.length || 0 };
    ENROLLMENT_DEPARTMENTS.forEach((dept) => {
      if (dept.id !== "all") counts[dept.id] = 0;
    });

    (enrollments || []).forEach((e) => {
      const dept = getCourseDepartment(e.course);
      if (counts[dept.id] !== undefined) {
        counts[dept.id]++;
      }
    });

    return counts;
  }, [enrollments]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "inactive":
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
      case "cancelled":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "pending":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleOpenCreateModal = (studentId = null) => {
    setSelectedStudentForEnrollment(studentId);
    setIsCreateModalOpen(true);
    dispatch(clearEnrollmentsError());
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedStudentForEnrollment(null);
    dispatch(clearEnrollmentsError());
  };

  const handleEnrollmentSuccess = () => {};

  const handleUnenroll = (enrollment) => {
    setUnenrollConfirm(enrollment);
  };

  const confirmUnenroll = async () => {
    if (!unenrollConfirm) return;
    setUnenrollingId(unenrollConfirm.id);
    try {
      await dispatch(
        unenrollStudent({
          courseId: unenrollConfirm.course.id,
          studentId: unenrollConfirm.student.id,
        }),
      ).unwrap();
      toastManager.success("Student unenrolled successfully");
    } catch (err) {
      showApiError(err);
    } finally {
      setUnenrollingId(null);
      setUnenrollConfirm(null);
    }
  };

  const cancelUnenroll = () => {
    setUnenrollConfirm(null);
  };

  const handleClearFilters = useCallback(() => {
    setStudentFilter("");
    setCourseFilter("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateSort("newest");
    setSelectedDepartment("all");
    setEnrollmentCountFilter("all");
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-slate-800 rounded-lg w-48 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg w-64 animate-pulse" />
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-12 bg-slate-800/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-exclamation-triangle text-rose-400 text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Unable to Load Enrollments</h3>
        <p className="text-slate-400 text-center mb-6 max-w-md">{error}</p>
        <button
          onClick={onRefresh}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all flex items-center gap-2"
        >
          <i className="fas fa-redo" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────
         TOP CONTROLS & FILTER BAR
         ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              onClear={() => setStudentFilter("")}
              placeholder="Search student or roll #..."
              icon="fas fa-user-graduate"
              className="w-full sm:w-56"
            />
            <SearchInput
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              onClear={() => setCourseFilter("")}
              placeholder="Search course title..."
              icon="fas fa-book"
              className="w-full sm:w-52"
            />
            <FilterSelect
              className="w-full sm:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </FilterSelect>
            <FilterSelect
              className="w-full sm:w-auto"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </FilterSelect>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Deduplicated Table: 1 student per row"
              >
                <i className="fas fa-table text-xs" />
                <span>By Student (Table)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "cards"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Deduplicated Cards: 1 student per card"
              >
                <i className="fas fa-th-large text-xs" />
                <span>By Student (Cards)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("detailed")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "detailed"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Detailed junction records"
              >
                <i className="fas fa-list text-xs" />
                <span>Detailed Records</span>
              </button>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition"
            >
              <i className="fas fa-plus text-xs" />
              <span>New Enrollment</span>
            </button>
            <button
              onClick={onRefresh}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition flex items-center gap-1.5"
              title="Refresh enrollments"
            >
              <i className="fas fa-sync text-xs" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition"
              >
                <i className="fas fa-times text-xs" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────
           QUICK-CLICK FILTER BARS (Department & Multi-Course)
           ───────────────────────────────────────────── */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-lg">
          {/* Department Pills */}
          <div className="flex flex-wrap items-center gap-1.5 py-0.5">
            {ENROLLMENT_DEPARTMENTS.map((dept) => {
              const active = selectedDepartment === dept.id;
              const count = departmentCounts[dept.id] || 0;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400"
                      : "bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800"
                  }`}
                >
                  <i className={`fas ${dept.icon} text-[11px] ${active ? "text-white" : dept.color}`} />
                  <span>{dept.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? "bg-indigo-700/80 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Student Multi-Course Toggle */}
          <div className="flex items-center gap-1.5 shrink-0 border-t lg:border-t-0 border-slate-800 pt-2 lg:pt-0">
            <button
              onClick={() => setEnrollmentCountFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                enrollmentCountFilter === "all"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Students ({metrics.totalStudents})
            </button>
            <button
              onClick={() => setEnrollmentCountFilter("multiple")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                enrollmentCountFilter === "multiple"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "border-slate-800 text-slate-400 hover:text-emerald-300"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Subject 2+ ({metrics.multiCourseStudents})</span>
            </button>
            <button
              onClick={() => setEnrollmentCountFilter("single")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                enrollmentCountFilter === "single"
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                  : "border-slate-800 text-slate-400 hover:text-blue-300"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Single (1) ({metrics.singleCourseStudents})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
         MAIN CONTENT CONTAINER
         ───────────────────────────────────────────── */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {studentGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16">
            <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-user-graduate text-slate-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {hasActiveFilters ? "No Matching Enrollments" : "No Enrollments Found"}
            </h3>
            <p className="text-slate-400 text-center mb-6 max-w-md text-sm">
              {hasActiveFilters
                ? "Try adjusting your search criteria or subject department filters."
                : "There are no student enrollments recorded in the system yet."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : viewMode === "table" ? (
          /* ═════════════════════════════════════════════
             DEFAULT MODE: DEDUPLICATED STUDENT TABLE
             (One student, one entry only, dedicated columns)
             ═════════════════════════════════════════════ */
          <div className="overflow-x-auto table-scrollbar pb-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">#</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-3 py-3">Roll #</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-4 py-3">Enrolled Subjects</th>
                  <th className="px-3 py-3 text-center">Total</th>
                  <th className="px-3 py-3">Latest Enrolled</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {studentGroups.map((group, index) => {
                  const studentName = group.student?.username || "Unknown Student";
                  const initial = studentName.charAt(0).toUpperCase() || "S";
                  const count = group.enrollments.length;
                  const theme = STUDENT_THEMES[index % STUDENT_THEMES.length];

                  return (
                    <tr
                      key={group.studentId || index}
                      className={`border-l-4 ${theme.border} ${theme.rowBg} ${theme.rowHover} border-b-2 border-slate-800 transition-colors group`}
                    >
                      {/* Index */}
                      <td className="px-3 py-3.5 text-center font-mono text-slate-500 align-top">
                        {index + 1}
                      </td>

                      {/* Student */}
                      <td className="px-4 py-3.5 whitespace-nowrap align-top">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${theme.avatarBg} border flex items-center justify-center font-black text-xs shrink-0 shadow-sm`}>
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs leading-tight">
                              {studentName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Roll # */}
                      <td className="px-3 py-3.5 whitespace-nowrap align-top">
                        {group.student_roll_no ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs ${theme.badgeBg} border`}>
                            #{group.student_roll_no}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-3 py-3.5 whitespace-nowrap align-top">
                        <span
                          className="font-mono text-xs text-slate-300 select-all hover:text-indigo-300 transition"
                          title={group.student?.email}
                        >
                          {group.student?.email || "—"}
                        </span>
                      </td>

                      {/* Enrolled Subjects (Chips with prominent red cross button + inline Add Subject button) */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {group.enrollments.map((enr) => {
                            const dept = getCourseDepartment(enr.course);
                            const catName =
                              typeof enr.course?.category === "object"
                                ? enr.course?.category?.name
                                : enr.course?.category;
                            return (
                              <span
                                key={enr.id}
                                className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs transition shadow-sm"
                              >
                                <i className={`fas ${dept.icon} text-[10px] ${dept.color}`} />
                                <span className="font-semibold text-slate-200">
                                  {enr.course?.title || "Course"}
                                </span>
                                {catName && (
                                  <span className="text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.2 rounded border border-slate-700/60">
                                    {catName}
                                  </span>
                                )}
                                <span className="text-[10px] font-mono font-bold text-emerald-400">
                                  ${enr.course?.price || 0}
                                </span>
                                {/* High-contrast prominent red cross button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnenroll(enr);
                                  }}
                                  className="w-5 h-5 rounded-md bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white flex items-center justify-center transition shrink-0 ml-1 shadow-sm active:scale-90"
                                  title={`Remove / Unenroll ${studentName} from ${enr.course?.title}`}
                                >
                                  <i className="fas fa-times text-[11px] font-black" />
                                </button>
                              </span>
                            );
                          })}

                          {/* Plus sign inline to enroll another subject for this student */}
                          <button
                            onClick={() => handleOpenCreateModal(group.student?.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-dashed border-indigo-500/50 hover:border-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white text-xs font-bold transition active:scale-95 shadow-sm"
                            title={`Add another subject for ${studentName}`}
                          >
                            <i className="fas fa-plus text-[10px]" />
                            <span>Add Subject</span>
                          </button>
                        </div>
                      </td>

                      {/* Total Subjects */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-center align-top">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                          <i className="fas fa-book text-[9px]" />
                          {count} {count === 1 ? "Subject" : "Subjects"}
                        </span>
                      </td>

                      {/* Latest Enrollment */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-slate-400 font-mono text-xs align-top">
                        {formatDate(group.latest_enrolled_at)}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5 whitespace-nowrap align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            group.has_active
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              group.has_active ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                            }`}
                          />
                          {group.has_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCreateModal(group.student?.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition active:scale-95 flex items-center gap-1.5 shrink-0"
                            title={`Enroll ${studentName} in a new subject`}
                          >
                            <i className="fas fa-plus text-xs" />
                            <span>Enroll Subject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : viewMode === "cards" ? (
          /* ═════════════════════════════════════════════
             CARDS MODE: DEDUPLICATED STUDENT CARDS
             ═════════════════════════════════════════════ */
          <div className="p-4 sm:p-6 space-y-4">
            {studentGroups.map((group, gIdx) => {
              const studentName = group.student?.username || "Unknown Student";
              const studentEmail = group.student?.email || "No email";
              const initial = studentName.charAt(0).toUpperCase() || "S";
              const count = group.enrollments.length;

              return (
                <div
                  key={group.studentId || gIdx}
                  className="bg-slate-800/40 border border-slate-700/80 hover:border-indigo-500/40 rounded-2xl p-5 transition-all shadow-lg"
                >
                  {/* Student Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md">
                        {initial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-white leading-none">
                            {studentName}
                          </h4>
                          {group.student_roll_no && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold">
                              Roll #{group.student_roll_no}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-1 select-all">{studentEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {count} Subject{count === 1 ? "" : "s"} Enrolled
                      </span>
                    </div>
                  </div>

                  {/* Course Cards Grid */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.enrollments.map((enrollment) => {
                      const dept = getCourseDepartment(enrollment.course);
                      const courseTitle = enrollment.course?.title || "Unknown Course";
                      const category =
                        typeof enrollment.course?.category === "object"
                          ? enrollment.course?.category?.name
                          : enrollment.course?.category || "General";
                      const price = enrollment.course?.price || 0;

                      return (
                        <div
                          key={enrollment.id}
                          className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                <i className={`fas ${dept.icon} text-[9px] ${dept.color}`} />
                                <span>{category}</span>
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(
                                  enrollment.status,
                                )}`}
                              >
                                {enrollment.status || "Active"}
                              </span>
                            </div>
                            <h5 className="font-semibold text-white text-sm line-clamp-1">
                              {courseTitle}
                            </h5>
                            <p className="text-xs text-slate-400 mt-1">
                              ${price} USD • Enrolled {formatDate(enrollment.enrolled_at)}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-end">
                            <button
                              onClick={() => handleUnenroll(enrollment)}
                              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
                              title="Unenroll from this course"
                            >
                              <i className="fas fa-user-minus text-[10px]" />
                              <span>Unenroll</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ═════════════════════════════════════════════
             DETAILED TABLE MODE: ALL JUNCTION RECORDS
             (De-stacked, compact high-density layout)
             ═════════════════════════════════════════════ */
          <div className="overflow-x-auto table-scrollbar pb-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">#</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-3 py-3">Roll #</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-3 py-3">Level / Category</th>
                  <th className="px-3 py-3">Fee</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Enrolled At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {filteredEnrollments.map((enrollment, index) => {
                  const dept = getCourseDepartment(enrollment.course);
                  const catName =
                    typeof enrollment.course?.category === "object"
                      ? enrollment.course?.category?.name
                      : enrollment.course?.category;

                  return (
                    <tr
                      key={enrollment.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-3 py-2.5 text-center font-mono text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[11px]">
                            {(enrollment.student?.username || "S")[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-white text-xs">
                            {enrollment.student?.username || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-xs">
                        {enrollment.student_roll_no ? (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            #{enrollment.student_roll_no}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-xs text-slate-300 select-all">
                        {enrollment.student?.email || "—"}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <i className={`fas ${dept.icon} text-[10px] ${dept.color}`} />
                          <span className="font-medium text-slate-200">
                            {enrollment.course?.title || "Unknown Course"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                          {catName || "General"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-emerald-400 font-semibold">
                        ${enrollment.course?.price || 0} USD
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(
                            enrollment.status,
                          )}`}
                        >
                          {enrollment.status || "Active"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-400 text-xs">
                        {formatDate(enrollment.enrolled_at)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleUnenroll(enrollment)}
                          className="px-2.5 py-1 bg-rose-600/15 hover:bg-rose-600/30 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/30 transition flex items-center gap-1 ml-auto"
                        >
                          <i className="fas fa-user-minus text-[10px]" />
                          <span>Unenroll</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────
         MODALS (Create & Unenroll)
         ───────────────────────────────────────────── */}
      <CreateEnrollmentModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleEnrollmentSuccess}
        initialStudentId={selectedStudentForEnrollment}
      />

      {unenrollConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-1">
                Confirm Unenrollment
              </h3>
              <p className="text-slate-400 text-center text-xs mb-6">
                Are you sure you want to unenroll{" "}
                <span className="font-semibold text-white">
                  {unenrollConfirm.student?.username}
                </span>{" "}
                from{" "}
                <span className="font-semibold text-white">
                  {unenrollConfirm.course?.title}
                </span>
                ?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={cancelUnenroll}
                  disabled={unenrollingId === unenrollConfirm.id}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnenroll}
                  disabled={unenrollingId === unenrollConfirm.id}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {unenrollingId === unenrollConfirm.id ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs" />
                      <span>Unenrolling...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-minus text-xs" />
                      <span>Confirm Unenroll</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentsTab;
