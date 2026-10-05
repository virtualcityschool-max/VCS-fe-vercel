import React, { useState, useMemo } from "react";
import { SearchInput, FilterSelect, EmptyState, LoadingSpinner } from "../../components/ui";
import { getDisplayName } from "../../utils/userDisplay";
import { getStorageUrl } from "../../utils/storageUrl";
import { toastManager } from "../../utils/toastManager";

// Academic departments for Cambridge curriculum
const DEPARTMENTS = [
  { id: "all", name: "All Departments" },
  { id: "math", name: "Mathematics", keywords: ["math", "calculus", "algebra", "geometry", "statistics"] },
  { id: "physics", name: "Physics", keywords: ["physics", "mechanics", "astrophysics"] },
  { id: "chemistry", name: "Chemistry", keywords: ["chemistry", "organic", "inorganic", "biochem"] },
  { id: "biology", name: "Biology", keywords: ["biology", "bio", "zoology", "botany", "life science"] },
  { id: "computer", name: "Computer Science", keywords: ["computer", "programming", "software", "python", "cs", "ict"] },
  { id: "english", name: "English & Languages", keywords: ["english", "urdu", "literature", "language", "grammar"] },
  { id: "commerce", name: "Commerce & Economics", keywords: ["commerce", "accounting", "business", "economics", "finance"] },
  { id: "social", name: "Humanities & Social", keywords: ["history", "geography", "pakistan studies", "islamiyat", "sociology"] },
];

const getLevelBadgeClass = (categoryName = "") => {
  const cat = String(categoryName).toLowerCase();
  if (cat.includes("igcse")) return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  if (cat.includes("o level") || cat.includes("o-level")) return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
  if (cat.includes("a level") || cat.includes("a-level")) return "bg-purple-500/15 text-purple-300 border-purple-500/30";
  if (cat.includes("as level") || cat.includes("as-level")) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  return "bg-slate-700/40 text-slate-300 border-slate-600/40";
};

const TeacherAllocationsTab = ({
  courses = [],
  teachers = [],
  loading = false,
  onAssignTeacher,
  onUnassignTeacher,
  onRefresh,
}) => {
  // View mode: "teachers" (Workload Matrix) or "subjects" (Curriculum Staffing)
  const [viewMode, setViewMode] = useState("teachers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    courseId: null,
    teacherId: null,
    courseTitle: "",
    teacherName: "",
  });
  const [modalSelectedTeacher, setModalSelectedTeacher] = useState("");
  const [modalSelectedCourse, setModalSelectedCourse] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const [unassignModal, setUnassignModal] = useState({
    isOpen: false,
    courseId: null,
    courseTitle: "",
    teacherName: "",
  });

  // Calculate teacher allocation map and subjects
  const {
    teachersWithCourses,
    coursesWithTeacher,
    kpiStats,
  } = useMemo(() => {
    // Map of teacher id -> assigned courses
    const teacherCourseMap = new Map();
    teachers.forEach((t) => teacherCourseMap.set(t.id, []));

    let assignedCoursesCount = 0;

    const enrichedCourses = courses.map((course) => {
      const assignedTeacherId = course.instructor?.id || course.instructor_id;
      const teacherObj = assignedTeacherId
        ? course.instructor || teachers.find((t) => t.id === assignedTeacherId) || null
        : null;

      if (teacherObj) {
        assignedCoursesCount += 1;
        const currentList = teacherCourseMap.get(teacherObj.id) || [];
        currentList.push(course);
        teacherCourseMap.set(teacherObj.id, currentList);
      }

      return {
        ...course,
        assignedTeacher: teacherObj,
        isAssigned: !!teacherObj,
      };
    });

    const enrichedTeachers = teachers.map((teacher) => {
      const assignedCourses = teacherCourseMap.get(teacher.id) || [];
      return {
        ...teacher,
        assignedCourses,
        assignedCount: assignedCourses.length,
        isAllocated: assignedCourses.length > 0,
      };
    });

    const totalCourses = courses.length;
    const unassignedCoursesCount = Math.max(0, totalCourses - assignedCoursesCount);
    const engagedTeachersCount = enrichedTeachers.filter((t) => t.isAllocated).length;
    const standbyTeachersCount = Math.max(0, teachers.length - engagedTeachersCount);

    return {
      teachersWithCourses: enrichedTeachers,
      coursesWithTeacher: enrichedCourses,
      kpiStats: {
        totalCourses,
        assignedCoursesCount,
        unassignedCoursesCount,
        totalTeachers: teachers.length,
        engagedTeachersCount,
        standbyTeachersCount,
      },
    };
  }, [courses, teachers]);

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    return teachersWithCourses.filter((teacher) => {
      // Status filter
      if (statusFilter === "allocated" && !teacher.isAllocated) return false;
      if (statusFilter === "standby" && teacher.isAllocated) return false;

      // Department filter
      if (selectedDept !== "all") {
        const deptDef = DEPARTMENTS.find((d) => d.id === selectedDept);
        if (deptDef?.keywords) {
          const qual = (teacher.teacher_profile?.qualification || "").toLowerCase();
          const spec = (teacher.teacher_profile?.specialization || "").toLowerCase();
          const bio = (teacher.teacher_profile?.bio || "").toLowerCase();
          const subjects = teacher.assignedCourses.map((c) => c.title.toLowerCase()).join(" ");
          const text = `${qual} ${spec} ${bio} ${subjects}`;
          const matches = deptDef.keywords.some((kw) => text.includes(kw));
          if (!matches) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = getDisplayName(teacher).toLowerCase();
        const email = (teacher.email || "").toLowerCase();
        const qual = (teacher.teacher_profile?.qualification || "").toLowerCase();
        const assignedNames = teacher.assignedCourses.map((c) => c.title.toLowerCase()).join(" ");
        return name.includes(q) || email.includes(q) || qual.includes(q) || assignedNames.includes(q);
      }

      return true;
    });
  }, [teachersWithCourses, statusFilter, selectedDept, searchQuery]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return coursesWithTeacher.filter((course) => {
      // Status filter
      if (statusFilter === "allocated" && !course.isAssigned) return false;
      if (statusFilter === "unassigned" && course.isAssigned) return false;

      // Department filter
      if (selectedDept !== "all") {
        const deptDef = DEPARTMENTS.find((d) => d.id === selectedDept);
        if (deptDef?.keywords) {
          const title = (course.title || "").toLowerCase();
          const desc = (course.description || "").toLowerCase();
          const text = `${title} ${desc}`;
          const matches = deptDef.keywords.some((kw) => text.includes(kw));
          if (!matches) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (course.title || "").toLowerCase();
        const teacherName = course.assignedTeacher ? getDisplayName(course.assignedTeacher).toLowerCase() : "";
        const teacherEmail = (course.assignedTeacher?.email || "").toLowerCase();
        return title.includes(q) || teacherName.includes(q) || teacherEmail.includes(q);
      }

      return true;
    });
  }, [coursesWithTeacher, statusFilter, selectedDept, searchQuery]);

  // Handle open assign modal from course
  const handleOpenAssignForCourse = (course) => {
    setModalSelectedTeacher(course.assignedTeacher?.id || "");
    setModalSelectedCourse(course.id);
    setAssignModal({
      isOpen: true,
      courseId: course.id,
      teacherId: null,
      courseTitle: course.title,
      teacherName: "",
    });
  };

  // Handle open assign modal from teacher
  const handleOpenAssignForTeacher = (teacher) => {
    setModalSelectedTeacher(teacher.id);
    setModalSelectedCourse("");
    setAssignModal({
      isOpen: true,
      courseId: null,
      teacherId: teacher.id,
      courseTitle: "",
      teacherName: getDisplayName(teacher),
    });
  };

  // Handle modal submit
  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    const cId = modalSelectedCourse || assignModal.courseId;
    const tId = modalSelectedTeacher || assignModal.teacherId;

    if (!cId) {
      toastManager.error("Please select a Cambridge subject");
      return;
    }
    if (!tId) {
      toastManager.error("Please select a teacher");
      return;
    }

    setSubmittingAction(true);
    try {
      const ok = await onAssignTeacher(Number(cId), Number(tId));
      if (ok) {
        setAssignModal({ isOpen: false, courseId: null, teacherId: null, courseTitle: "", teacherName: "" });
      }
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle unassign request
  const handleRequestUnassign = (course, teacher) => {
    setUnassignModal({
      isOpen: true,
      courseId: course.id,
      courseTitle: course.title,
      teacherName: teacher ? getDisplayName(teacher) : "the assigned teacher",
    });
  };

  // Confirm unassign
  const handleConfirmUnassign = async () => {
    if (!unassignModal.courseId) return;
    setSubmittingAction(true);
    try {
      const ok = await onUnassignTeacher(unassignModal.courseId);
      if (ok) {
        setUnassignModal({ isOpen: false, courseId: null, courseTitle: "", teacherName: "" });
      }
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── KPI Summary Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Cambridge Subjects */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Subjects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <i className="fas fa-book-open text-xs" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{kpiStats.totalCourses}</span>
            <span className="text-xs text-slate-500">Curriculum catalog</span>
          </div>
        </div>

        {/* Staffed Subjects */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Staffed Subjects</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <i className="fas fa-check-circle text-xs" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{kpiStats.assignedCoursesCount}</span>
            <span className="text-xs text-slate-500">
              {kpiStats.totalCourses > 0
                ? `${Math.round((kpiStats.assignedCoursesCount / kpiStats.totalCourses) * 100)}% staffed`
                : "0%"}
            </span>
          </div>
        </div>

        {/* Unassigned Warning Alert */}
        <div
          className={`border rounded-xl p-4 shadow-sm transition ${
            kpiStats.unassignedCoursesCount > 0
              ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
              : "bg-slate-900/90 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                kpiStats.unassignedCoursesCount > 0 ? "text-amber-400 font-extrabold" : "text-slate-400"
              }`}
            >
              Unassigned
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                kpiStats.unassignedCoursesCount > 0
                  ? "bg-amber-500/20 text-amber-300 animate-pulse"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              <i className="fas fa-triangle-exclamation text-xs" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                kpiStats.unassignedCoursesCount > 0 ? "text-amber-300" : "text-slate-400"
              }`}
            >
              {kpiStats.unassignedCoursesCount}
            </span>
            <span className="text-xs text-slate-400">
              {kpiStats.unassignedCoursesCount > 0 ? "Need teachers" : "Fully staffed"}
            </span>
          </div>
        </div>

        {/* Engaged Faculty */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Engaged Faculty</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <i className="fas fa-chalkboard-user text-xs" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400">{kpiStats.engagedTeachersCount}</span>
            <span className="text-xs text-slate-500">Teaching ≥1 subject</span>
          </div>
        </div>

        {/* Standby Faculty */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Standby Faculty</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <i className="fas fa-clock text-xs" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-400">{kpiStats.standbyTeachersCount}</span>
            <span className="text-xs text-slate-500">Ready to assign</span>
          </div>
        </div>
      </div>

      {/* ── Control Header & Filters ────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Top row: View Switcher + Search + Refresh */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Dual View Toggle */}
          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setViewMode("teachers");
                setStatusFilter("all");
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "teachers"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <i className="fas fa-chalkboard-user text-xs" />
              <span>By Teacher (Workload)</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  viewMode === "teachers" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {filteredTeachers.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("subjects");
                setStatusFilter("all");
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "subjects"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <i className="fas fa-book text-xs" />
              <span>By Subject (Staffing)</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  viewMode === "subjects" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {filteredCourses.length}
              </span>
            </button>
          </div>

          {/* Search Input & Refresh Button */}
          <div className="flex items-center gap-2.5 flex-1 sm:max-w-md">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  viewMode === "teachers"
                    ? "Search faculty name, qualification, email..."
                    : "Search Cambridge subject title, code..."
                }
                className="w-full text-xs"
              />
            </div>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh allocations"
                className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center justify-center shrink-0"
              >
                <i className={`fas fa-rotate text-xs ${loading ? "animate-spin text-indigo-400" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Row: Department Pills & Status Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/70">
          {/* Department Quick Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Dept:</span>
            {DEPARTMENTS.slice(0, 6).map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDept(dept.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  selectedDept === dept.id
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50"
                }`}
              >
                {dept.name}
              </button>
            ))}
            {DEPARTMENTS.length > 6 && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700/70 rounded-lg text-[11px] focus:outline-none"
              >
                <option value="all">More Depts...</option>
                {DEPARTMENTS.slice(6).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Status Quick Filter */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Status:</span>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                statusFilter === "all"
                  ? "bg-slate-700 text-white font-semibold"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            {viewMode === "teachers" ? (
              <>
                <button
                  type="button"
                  onClick={() => setStatusFilter("allocated")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    statusFilter === "allocated"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  Active Staff ({kpiStats.engagedTeachersCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("standby")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    statusFilter === "standby"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  Standby ({kpiStats.standbyTeachersCount})
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStatusFilter("allocated")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    statusFilter === "allocated"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  Staffed ({kpiStats.assignedCoursesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("unassigned")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    statusFilter === "unassigned"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  ⚠️ Unassigned ({kpiStats.unassignedCoursesCount})
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      {loading && (
        <div className="py-12 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && viewMode === "teachers" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredTeachers.length === 0 ? (
            <EmptyState
              icon="fas fa-chalkboard-user"
              title="No Teachers Found"
              description="No faculty members match your selected search or department filter."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-3.5 py-3 w-10 text-center">#</th>
                    <th className="px-4 py-3 min-w-[200px]">Faculty Member</th>
                    <th className="px-3.5 py-3 min-w-[150px]">Credentials & Subject Area</th>
                    <th className="px-3 py-3 w-28 text-center">Workload</th>
                    <th className="px-4 py-3 min-w-[320px]">Allocated Cambridge Subjects</th>
                    <th className="px-4 py-3 w-36 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTeachers.map((teacher, idx) => {
                    const avatarUrl = getStorageUrl(teacher.teacher_profile?.profile_photo);
                    const displayName = getDisplayName(teacher);
                    const qualification =
                      teacher.teacher_profile?.qualification ||
                      teacher.teacher_profile?.specialization ||
                      "Certified Cambridge Faculty";

                    return (
                      <tr
                        key={teacher.id}
                        className={`transition-colors ${
                          idx % 2 === 0 ? "bg-slate-900/50" : "bg-slate-900/20"
                        } hover:bg-slate-800/40`}
                      >
                        {/* Index */}
                        <td className="px-3.5 py-3 text-center text-slate-500 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Faculty Profile */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-9 h-9 rounded-full object-cover border border-slate-700 ring-2 ring-indigo-500/10 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-400/30">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-xs truncate hover:text-indigo-300 transition">
                                {displayName}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">{teacher.email}</p>
                              {teacher.phone_number && (
                                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <i className="fab fa-whatsapp text-emerald-400/80 text-[10px]" />
                                  <span>{teacher.phone_number}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Qualification & Area */}
                        <td className="px-3.5 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-medium max-w-full truncate">
                            <i className="fas fa-graduation-cap text-indigo-400 text-[10px]" />
                            <span className="truncate">{qualification}</span>
                          </span>
                        </td>

                        {/* Workload Status */}
                        <td className="px-3 py-3 text-center">
                          {teacher.assignedCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {teacher.assignedCount} {teacher.assignedCount === 1 ? "Subject" : "Subjects"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium">
                              Standby
                            </span>
                          )}
                        </td>

                        {/* Allocated Subjects with (x) unassign and (+) assign */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {teacher.assignedCourses.map((c) => {
                              const badgeStyle = getLevelBadgeClass(c.category?.name || "");
                              return (
                                <span
                                  key={c.id}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium group/chip transition ${badgeStyle}`}
                                >
                                  <i className="fas fa-book text-[9px] opacity-70" />
                                  <span className="max-w-[200px] truncate" title={c.title}>
                                    {c.title}
                                  </span>
                                  {/* Drop cross button */}
                                  <button
                                    type="button"
                                    onClick={() => handleRequestUnassign(c, teacher)}
                                    title={`Unassign ${c.title} from ${displayName}`}
                                    className="w-4 h-4 rounded hover:bg-rose-500/25 hover:text-rose-300 text-slate-400 flex items-center justify-center transition cursor-pointer"
                                  >
                                    <i className="fas fa-times text-[9px]" />
                                  </button>
                                </span>
                              );
                            })}

                            {/* Inline [+ Assign Subject] button */}
                            <button
                              type="button"
                              onClick={() => handleOpenAssignForTeacher(teacher)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-dashed border-indigo-500/40 text-indigo-300 text-[11px] font-semibold transition cursor-pointer hover:border-indigo-400"
                              title={`Assign another Cambridge subject to ${displayName}`}
                            >
                              <i className="fas fa-plus text-[9px]" />
                              <span>Assign Subject</span>
                            </button>
                          </div>
                        </td>

                        {/* Row Action */}
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenAssignForTeacher(teacher)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition shadow-sm cursor-pointer"
                          >
                            <i className="fas fa-thumbtack text-[10px]" />
                            <span>Allocate</span>
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
      )}

      {!loading && viewMode === "subjects" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredCourses.length === 0 ? (
            <EmptyState
              icon="fas fa-book"
              title="No Subjects Found"
              description="No Cambridge subjects match your search or filter criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-3.5 py-3 w-10 text-center">#</th>
                    <th className="px-4 py-3 min-w-[260px]">Cambridge Subject</th>
                    <th className="px-3.5 py-3 w-28 text-center">Level</th>
                    <th className="px-4 py-3 min-w-[220px]">Allocated Teacher</th>
                    <th className="px-3.5 py-3 w-24 text-center">Enrolled</th>
                    <th className="px-4 py-3 w-40 text-right">Staffing Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCourses.map((course, idx) => {
                    const levelBadgeStyle = getLevelBadgeClass(course.category?.name || "");
                    const assignedTeacher = course.assignedTeacher;
                    const teacherName = assignedTeacher ? getDisplayName(assignedTeacher) : null;
                    const teacherAvatar = assignedTeacher
                      ? getStorageUrl(assignedTeacher.teacher_profile?.profile_photo)
                      : null;

                    return (
                      <tr
                        key={course.id}
                        className={`transition-colors ${
                          idx % 2 === 0 ? "bg-slate-900/50" : "bg-slate-900/20"
                        } hover:bg-slate-800/40`}
                      >
                        {/* Index */}
                        <td className="px-3.5 py-3 text-center text-slate-500 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Subject Title */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                              <i className="fas fa-book text-xs" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-xs truncate hover:text-indigo-300 transition" title={course.title}>
                                {course.title}
                              </p>
                              {course.schedule?.time && (
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <i className="fas fa-clock text-slate-500 text-[9px]" />
                                  <span>{course.schedule.time}</span>
                                  {course.schedule?.days?.length > 0 && (
                                    <span className="text-slate-500">
                                      • {course.schedule.days.join(", ")}
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Level Badge */}
                        <td className="px-3.5 py-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${levelBadgeStyle}`}>
                            {course.category?.name || "General"}
                          </span>
                        </td>

                        {/* Assigned Teacher or Alert */}
                        <td className="px-4 py-3">
                          {assignedTeacher ? (
                            <div className="flex items-center gap-2.5">
                              {teacherAvatar ? (
                                <img
                                  src={teacherAvatar}
                                  alt={teacherName}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {teacherName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-white text-xs truncate">{teacherName}</p>
                                <p className="text-[10px] text-slate-400 truncate">{assignedTeacher.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                              <i className="fas fa-triangle-exclamation text-amber-400 text-[10px]" />
                              <span>⚠️ Unassigned — No Faculty</span>
                            </span>
                          )}
                        </td>

                        {/* Enrolled Students Count */}
                        <td className="px-3.5 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-slate-300 font-semibold text-xs">
                            <i className="fas fa-user-graduate text-slate-500 text-[10px]" />
                            <span>{course.enrollments_count ?? course.enrollments?.length ?? 0}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {assignedTeacher ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignForCourse(course)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition cursor-pointer"
                                  title="Change assigned teacher"
                                >
                                  Change
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRequestUnassign(course, assignedTeacher)}
                                  className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center transition cursor-pointer"
                                  title="Unassign teacher"
                                >
                                  <i className="fas fa-user-minus text-[10px]" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenAssignForCourse(course)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shadow-sm cursor-pointer"
                              >
                                <i className="fas fa-user-plus text-[10px]" />
                                <span>Assign Teacher</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Assign Teacher Modal (Dual Direction) ─────────────────────────── */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fas fa-thumbtack text-indigo-400" />
                  <span>Subject ⇄ Teacher Allocation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allocate a qualified Cambridge instructor to curriculum classes.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAssignModal({
                    isOpen: false,
                    courseId: null,
                    teacherId: null,
                    courseTitle: "",
                    teacherName: "",
                  })
                }
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
              >
                <i className="fas fa-times text-sm" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              {/* Subject Selection / Display */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Cambridge Subject <span className="text-red-400">*</span>
                </label>
                {assignModal.courseTitle ? (
                  <div className="p-3 bg-slate-950/80 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                    <i className="fas fa-book text-indigo-400" />
                    <span>{assignModal.courseTitle}</span>
                  </div>
                ) : (
                  <select
                    value={modalSelectedCourse}
                    onChange={(e) => setModalSelectedCourse(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a Cambridge Subject...</option>
                    {courses.map((c) => {
                      const curTeacher = c.instructor ? ` (${getDisplayName(c.instructor)})` : " — ⚠️ Unassigned";
                      return (
                        <option key={c.id} value={c.id}>
                          {c.title} {curTeacher}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Teacher Selection / Display */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Faculty Teacher <span className="text-red-400">*</span>
                </label>
                {assignModal.teacherName ? (
                  <div className="p-3 bg-slate-950/80 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                    <i className="fas fa-chalkboard-user text-indigo-400" />
                    <span>{assignModal.teacherName}</span>
                  </div>
                ) : (
                  <select
                    value={modalSelectedTeacher}
                    onChange={(e) => setModalSelectedTeacher(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a Teacher from Faculty...</option>
                    {teachers.map((t) => {
                      const qual = t.teacher_profile?.qualification ? ` • ${t.teacher_profile.qualification}` : "";
                      return (
                        <option key={t.id} value={t.id}>
                          {getDisplayName(t)} ({t.email}){qual}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setAssignModal({
                      isOpen: false,
                      courseId: null,
                      teacherId: null,
                      courseTitle: "",
                      teacherName: "",
                    })
                  }
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingAction && <i className="fas fa-spinner animate-spin text-xs" />}
                  <span>Save Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Unassign Confirmation Modal ───────────────────────────────────── */}
      {unassignModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-xl">
              <i className="fas fa-user-xmark" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Unassign Teacher from Subject?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove <strong className="text-white">{unassignModal.teacherName}</strong> from{" "}
                <strong className="text-indigo-300">{unassignModal.courseTitle}</strong>?
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <i className="fas fa-info-circle text-indigo-400" />
                Staffing Notice:
              </p>
              <p>
                The Cambridge subject will be marked as <span className="text-amber-400 font-bold">Unassigned</span> until a new teacher is allocated. Scheduled live sessions will remain intact in timetable history.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnassignModal({ isOpen: false, courseId: null, courseTitle: "", teacherName: "" })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleConfirmUnassign}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {submittingAction && <i className="fas fa-spinner animate-spin text-xs" />}
                <span>Confirm Unassign</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAllocationsTab;
