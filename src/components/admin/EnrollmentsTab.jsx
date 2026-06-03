import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  clearEnrollmentsError,
  unenrollStudent,
} from "../../store/slices/adminSlice";
import { Button, FilterSelect, SearchInput } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";
import CreateEnrollmentModal from "./CreateEnrollmentModal";
import { showApiError } from "../../utils/apiErrorHandler";

const EnrollmentsTab = ({ enrollments, loading, error, onRefresh }) => {
  const dispatch = useDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter states
  const [studentFilter, setStudentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");

  // Check if any filters are applied
  const hasActiveFilters = useMemo(() => {
    return (
      studentFilter.trim() ||
      courseFilter.trim() ||
      typeFilter !== "all" ||
      statusFilter !== "all" ||
      dateSort !== "newest"
    );
  }, [studentFilter, courseFilter, typeFilter, statusFilter, dateSort]);

  // Filter enrollments based on all filters using useMemo
  const filteredEnrollments = useMemo(() => {
    if (!enrollments) {
      return [];
    }

    let filtered = [...enrollments];

    // Student filter
    if (studentFilter.trim()) {
      const studentLower = studentFilter.toLowerCase();
      filtered = filtered.filter((enrollment) => {
        return (
          enrollment.student?.username?.toLowerCase().includes(studentLower) ||
          enrollment.student?.email?.toLowerCase().includes(studentLower)
        );
      });
    }

    // Course filter
    if (courseFilter.trim()) {
      const courseLower = courseFilter.toLowerCase();
      filtered = filtered.filter((enrollment) => {
        return (
          enrollment.course?.title?.toLowerCase().includes(courseLower) ||
          (typeof enrollment.course?.category === "object" ? enrollment.course?.category?.name : enrollment.course?.category)?.toLowerCase().includes(courseLower)
        );
      });
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((enrollment) => {
        if (typeFilter === "private") {
          return enrollment.is_private === true;
        } else if (typeFilter === "normal") {
          return enrollment.is_private === false;
        }
        return true;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((enrollment) => {
        return enrollment.status?.toLowerCase() === statusFilter.toLowerCase();
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
    typeFilter,
    statusFilter,
    dateSort,
  ]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case "inactive":
        return "bg-slate-500/20 text-slate-400 border-slate-500/20";
      case "cancelled":
        return "bg-rose-500/20 text-rose-400 border-rose-500/20";
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/20";
    }
  };

  const getTypeColor = (isPrivate) => {
    return isPrivate
      ? "bg-purple-500/20 text-purple-400 border-purple-500/20"
      : "bg-blue-500/20 text-blue-400 border-blue-500/20";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle modal open/close
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    // Clear any previous enrollment errors
    dispatch(clearEnrollmentsError());
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    // Clear any enrollment errors when closing
    dispatch(clearEnrollmentsError());
  };

  const handleEnrollmentSuccess = () => {
    // Redux slice handles adding the new enrollment via createEnrollment.fulfilled
  };

  // Unenroll handlers
  const [unenrollConfirm, setUnenrollConfirm] = useState(null);
  const [unenrollingId, setUnenrollingId] = useState(null);

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
      // Redux slice handles removing via unenrollStudent.fulfilled
    } catch (error) {
      showApiError(error);
    } finally {
      setUnenrollingId(null);
      setUnenrollConfirm(null);
    }
  };

  const cancelUnenroll = () => {
    setUnenrollConfirm(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Enrollments</h2>
          <div className="h-10 bg-slate-700 rounded-lg w-64 animate-pulse"></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Course
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Enrollment Type
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Enrolled At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-800 animate-pulse"
                >
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded w-8"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-32"></div>
                      <div className="h-3 bg-slate-700 rounded w-48"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-36"></div>
                      <div className="h-3 bg-slate-700 rounded w-24"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-700 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-700 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 bg-slate-700 rounded w-16"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-exclamation-triangle text-rose-400 text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Unable to Load Enrollments
        </h3>
        <p className="text-slate-400 text-center mb-6 max-w-md">{error}</p>
        <button
          onClick={onRefresh}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
        >
          <i className="fas fa-redo"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:justify-end">
          <div className="grid grid-cols-2 sm:contents gap-2">
            <SearchInput
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              onClear={() => setStudentFilter("")}
              placeholder="Filter by student..."
              icon="fas fa-user"
              className="w-full sm:w-44"
            />
            <SearchInput
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              onClear={() => setCourseFilter("")}
              placeholder="Filter by course..."
              icon="fas fa-book"
              className="w-full sm:w-44"
            />
            <FilterSelect className="w-full sm:w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </FilterSelect>
            <FilterSelect className="w-full sm:w-auto" value={dateSort} onChange={(e) => setDateSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </FilterSelect>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:contents">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all duration-150"
            >
              <i className="fas fa-plus text-xs"></i>
              <span>Create Enrollment</span>
            </button>
            <button
              onClick={onRefresh}
              className="text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500"
            >
              <i className="fas fa-sync text-xs"></i>
              <span>Refresh</span>
            </button>
            {hasActiveFilters && (
              <button
                onClick={() => { setStudentFilter(""); setCourseFilter(""); setTypeFilter("all"); setStatusFilter("all"); setDateSort("newest"); }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700/70 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm font-medium transition-all duration-150"
              >
                <i className="fas fa-times text-xs"></i>
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {filteredEnrollments.map((enrollment, index) => (
            <div
              key={enrollment.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800/70 transition"
            >
              {/* Index */}
              <div className="text-xs text-slate-500 mb-3">#{index + 1}</div>

              {/* Student Info */}
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-300 mb-1">
                  Student
                </div>
                <div className="text-white font-medium">
                  {enrollment.student?.username || "Unknown"}
                </div>
                <div className="text-xs text-slate-500 break-all">
                  {enrollment.student?.email || "No email"}
                </div>
                {enrollment.student_roll_no && (
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Roll#: {enrollment.student_roll_no}
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-300 mb-1">
                  Course
                </div>
                <div className="text-white font-medium">
                  {enrollment.course?.title || "Unknown Course"}
                </div>
                <div className="text-xs text-slate-500">
                  {(typeof enrollment.course?.category === "object" ? enrollment.course?.category?.name : enrollment.course?.category) || "No category"} • PKR{" "}
                  {enrollment.course?.price || "0"}
                </div>
              </div>

              {/* Type and Status */}
              <div className="flex items-center justify-between mb-4">
                {/* <div>
                  <div className="text-sm font-medium text-slate-300 mb-1">
                    Type
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getTypeColor(
                      enrollment.is_private,
                    )}`}
                  >
                    {enrollment.is_private ? "Private" : "Normal"}
                  </span>
                </div> */}
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-300 mb-1">
                    Status
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(
                      enrollment.status,
                    )}`}
                  >
                    {enrollment.status || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Enrolled At */}
              <div className="text-xs text-slate-500">
                Enrolled: {formatDate(enrollment.enrolled_at)}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <button
                  onClick={() => handleUnenroll(enrollment)}
                  className="w-full px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <i className="fas fa-user-minus"></i>
                  <span>Unenroll</span>
                </button>
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
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Course
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Enrollment Type
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Enrolled At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment, index) => (
                <tr key={enrollment.id} className="border-b border-slate-800">
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">
                        {enrollment.student?.username || "Unknown"}
                      </div>
                      <div className="text-sm text-slate-400">
                        {enrollment.student?.email || "No email"}
                      </div>
                      {enrollment.student_roll_no && (
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Roll#: {enrollment.student_roll_no}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">
                        {enrollment.course?.title || "Unknown Course"}
                      </div>
                      <div className="text-sm text-slate-400">
                        {(typeof enrollment.course?.category === "object" ? enrollment.course?.category?.name : enrollment.course?.category) || "No category"} • PKR{" "}
                        {enrollment.course?.price || "0"}
                      </div>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getTypeColor(
                        enrollment.is_private,
                      )}`}
                    >
                      {enrollment.is_private ? "Private" : "Normal"}
                    </span>
                  </td> */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(
                        enrollment.status,
                      )}`}
                    >
                      {enrollment.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {formatDate(enrollment.enrolled_at)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleUnenroll(enrollment)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                    >
                      <i className="fas fa-user-minus"></i>
                      <span>Unenroll</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEnrollments.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center p-16">
            <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-user-graduate text-slate-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {studentFilter ||
              courseFilter ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              dateSort !== "newest"
                ? "No Matching Enrollments"
                : "No Enrollments Found"}
            </h3>
            <p className="text-slate-400 text-center mb-6 max-w-md">
              {studentFilter ||
              courseFilter ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              dateSort !== "newest"
                ? "Try adjusting your filters to find what you're looking for."
                : "There are no enrollments in the system yet."}
            </p>
            {(studentFilter ||
              courseFilter ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              dateSort !== "newest") && (
              <button
                onClick={() => {
                  setStudentFilter("");
                  setCourseFilter("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setDateSort("newest");
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Enrollment Modal */}
      <CreateEnrollmentModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleEnrollmentSuccess}
      />

      {/* Unenroll Confirmation Modal */}
      {unenrollConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-rose-500/20 rounded-full mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-rose-400 text-xl"></i>
              </div>

              <h3 className="text-lg font-bold text-white text-center mb-2">
                Confirm Unenrollment
              </h3>

              <p className="text-slate-300 text-center mb-6">
                Are you sure you want to unenroll{" "}
                <span className="font-medium text-white">
                  {unenrollConfirm.student?.username}
                </span>{" "}
                from{" "}
                <span className="font-medium text-white">
                  {unenrollConfirm.course?.title}
                </span>
                ?
              </p>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={cancelUnenroll}
                  disabled={unenrollingId === unenrollConfirm.id}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnenroll}
                  disabled={unenrollingId === unenrollConfirm.id}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {unenrollingId === unenrollConfirm.id ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Unenrolling...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-minus"></i>
                      <span>Unenroll</span>
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
