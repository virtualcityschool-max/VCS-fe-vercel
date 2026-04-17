import React, { useMemo } from "react";
import { Button, Input, Card } from "../../components/ui";

const SessionsTab = ({
  sessions,
  courses,
  privateStudents,
  privateStudentsLoading,
  privateStudentsError,
  loading,
  loadingSessionIds,
  updatingSessionId,
  editSessionForm,
  setEditSessionForm,
  createSessionForm,
  setCreateSessionForm,
  createSessionErrors,
  clearCreateSessionFieldError,
  editSessionErrors,
  clearEditSessionFieldError,
  onSessionCreate,
  onSessionUpdate,
  onSessionDelete,
  onSessionEdit,
  activeModal,
  setActiveModal,
  showSessionFilters,
  setShowSessionFilters,
  sessionFilters,
  setSessionFilters,
}) => {
  // Filter sessions based on search term
  const filteredSessions = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    const filtered = sessions.filter((session) => {
      // Search filter (title, course title, meeting link)
      const matchesSearch =
        sessionFilters.search === "" ||
        session.title
          ?.toLowerCase()
          .includes(sessionFilters.search.toLowerCase()) ||
        session.course?.title
          ?.toLowerCase()
          .includes(sessionFilters.search.toLowerCase()) ||
        session.meeting_link
          ?.toLowerCase()
          .includes(sessionFilters.search.toLowerCase());

      return matchesSearch;
    });

    return filtered;
  }, [sessions, sessionFilters]);

  // Check if any session filters are active
  const hasActiveSessionFilters = useMemo(() => {
    return Object.values(sessionFilters).some((value) => value !== "");
  }, [sessionFilters]);

  // Reset all session filters
  const resetSessionFilters = () => {
    setSessionFilters({
      search: "",
    });
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      // Create payload based on session type
      const payload = {
        ...createSessionForm,
      };

      // Remove private_student_id for group sessions
      if (payload.session_type === "group") {
        delete payload.private_student_id;
      }

      await onSessionCreate(payload);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();
    try {
      await onSessionUpdate(editSessionForm);
    } catch (error) {
      console.error("Failed to update session:", error);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Not set";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/20",
      },
      live: {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
      },
      ended: {
        bg: "bg-slate-500/20",
        text: "text-slate-400",
        border: "border-slate-500/20",
      },
      cancelled: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/20",
      },
    };

    const config = statusConfig[status] || statusConfig.scheduled;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
      >
        {status || "scheduled"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Session Management Header */}
      <div className="mb-8">
        <div className="flex justify-end items-center mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 w-full lg:w-auto max-w-2xl lg:max-w-none">
            <div className="relative flex-1 lg:flex-initial">
              <Input
                type="text"
                placeholder="Search sessions..."
                value={sessionFilters.search}
                onChange={(e) =>
                  setSessionFilters({
                    ...sessionFilters,
                    search: e.target.value,
                  })
                }
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full lg:w-64"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              {hasActiveSessionFilters && (
                <button
                  onClick={resetSessionFilters}
                  className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  title="Clear all filters"
                >
                  <i className="fas fa-times"></i>
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                onClick={() => setActiveModal("create-session")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg active:scale-95 transition items-center justify-center gap-2"
              >
                <i className="fas fa-plus text-sm"></i>
                <span className="hidden sm:inline ml-2">Create Session</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Results Info */}
      {hasActiveSessionFilters && (
        <div className="mb-4 text-sm text-slate-400">
          Showing {filteredSessions.length} of {sessions?.length || 0} sessions
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Session
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Course
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Start Time
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Meeting Link
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-32"></div>
                        <div className="h-3 bg-slate-700 rounded w-48"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-700 rounded w-28"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-700 rounded w-28"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-700 rounded w-36"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="h-8 bg-slate-700 rounded w-12"></div>
                        <div className="h-8 bg-slate-700 rounded w-12"></div>
                        <div className="h-8 bg-slate-700 rounded w-16"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-800/50 space-y-4">
              {filteredSessions?.map((session) => (
                <div
                  key={session.id}
                  className="p-4 sm:p-6 hover:bg-slate-800/30 transition"
                >
                  <div className="flex flex-col gap-4">
                    {/* Session Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                        <i className="fas fa-video text-indigo-400 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base mb-1">
                          {session.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {session.course?.title || "No course"}
                        </p>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clock text-indigo-400"></i>
                        <span>{formatDateTime(session.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-link text-purple-400"></i>
                        <span className="truncate max-w-[150px]">
                          {session.meeting_link}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(session.status)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onSessionEdit(session.id)}
                        className="bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-600/50 transition flex items-center gap-2"
                      >
                        <i className="fas fa-edit"></i>
                        <span>Edit Session</span>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSessionDelete(session.id)}
                          disabled={loadingSessionIds.has(session.id)}
                          className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition disabled:opacity-50 flex items-center gap-2 flex-1"
                        >
                          <i className="fas fa-trash"></i>
                          <span>
                            {loadingSessionIds.has(session.id)
                              ? "Deleting..."
                              : "Delete"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden lg:table w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Session
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Course
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Start Time
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Meeting Link
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredSessions?.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-slate-800/30 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-white group-hover:text-indigo-400 transition">
                          {session.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm">
                        {session.course?.title || "No course"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm">
                        {formatDateTime(session.start_time)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 text-sm truncate block max-w-[200px]"
                        title={session.meeting_link}
                      >
                        {session.meeting_link}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onSessionEdit(session.id)}
                          className="bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-600/50 transition"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => onSessionDelete(session.id)}
                          disabled={loadingSessionIds.has(session.id)}
                          className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition disabled:opacity-50"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          {loadingSessionIds.has(session.id)
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Results State */}
        {!loading &&
          filteredSessions.length === 0 &&
          hasActiveSessionFilters && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-search text-slate-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                No Sessions Found
              </h3>
              <p className="text-slate-400 text-center mb-6 max-w-md">
                No sessions match your current filter criteria. Try adjusting
                your filters or clearing them to see more results.
              </p>
              <button
                onClick={resetSessionFilters}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200"
              >
                <i className="fas fa-times mr-2"></i>
                Clear All Filters
              </button>
            </div>
          )}

        {/* Empty State */}
        {!loading &&
          filteredSessions.length === 0 &&
          !hasActiveSessionFilters && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-video text-slate-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                No Sessions Created
              </h3>
              <p className="text-slate-400 text-center mb-6">
                Get started by creating your first session. Sessions allow you
                to schedule online meetings for your courses.
              </p>
              <button
                onClick={() => setActiveModal("create-session")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200"
              >
                <i className="fas fa-plus mr-2"></i>
                Create First Session
              </button>
            </div>
          )}
      </div>

      {/* Create Session Modal */}
      {activeModal === "create-session" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Create New Session
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Course <span className="text-red-400">*</span>
                </label>
                <select
                  value={createSessionForm.course_id}
                  onChange={(e) => {
                    setCreateSessionForm({
                      ...createSessionForm,
                      course_id: e.target.value,
                    });
                    clearCreateSessionFieldError("course_id");
                  }}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    createSessionErrors?.course_id
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">Select course</option>
                  {courses?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} {" - "}({" "}
                      {course.instructor?.username || "No instructor"})
                    </option>
                  ))}
                </select>
                {createSessionErrors?.course_id && (
                  <p className="text-red-400 text-xs mt-1">
                    {createSessionErrors.course_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Session Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter session title"
                  value={createSessionForm.title}
                  onChange={(e) => {
                    setCreateSessionForm({
                      ...createSessionForm,
                      title: e.target.value,
                    });
                    clearCreateSessionFieldError("title");
                  }}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    createSessionErrors?.title
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                />
                {createSessionErrors?.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {createSessionErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Start Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={createSessionForm.start_time}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => {
                    setCreateSessionForm({
                      ...createSessionForm,
                      start_time: e.target.value,
                    });
                    clearCreateSessionFieldError("start_time");
                  }}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    createSessionErrors?.start_time
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                />
                {createSessionErrors?.start_time && (
                  <p className="text-red-400 text-xs mt-1">
                    {createSessionErrors.start_time}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Session Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={createSessionForm.session_type}
                  onChange={(e) => {
                    setCreateSessionForm({
                      ...createSessionForm,
                      session_type: e.target.value,
                      private_student_id:
                        e.target.value === "group"
                          ? ""
                          : createSessionForm.private_student_id,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="group">Group Session</option>
                  <option value="private">Private Session</option>
                </select>
              </div>

              {createSessionForm.session_type === "private" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Student <span className="text-red-400">*</span>
                  </label>
                  {privateStudentsLoading ? (
                    <div className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm">
                      Loading students...
                    </div>
                  ) : privateStudentsError ? (
                    <div className="w-full px-3 py-2 bg-slate-800 border border-red-500 rounded-lg text-red-400 text-sm">
                      {privateStudentsError}
                    </div>
                  ) : (
                    <select
                      value={createSessionForm.private_student_id}
                      onChange={(e) => {
                        setCreateSessionForm({
                          ...createSessionForm,
                          private_student_id: e.target.value,
                        });
                        clearCreateSessionFieldError("private_student_id");
                      }}
                      className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                        createSessionErrors?.private_student_id
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-700 focus:ring-indigo-500"
                      }`}
                    >
                      <option value="">Select student</option>
                      {privateStudents?.map((student) => (
                        <option
                          key={student.student_id}
                          value={student.student_id}
                        >
                          {student.username} ({student.email})
                        </option>
                      ))}
                    </select>
                  )}
                  {createSessionErrors?.private_student_id && (
                    <p className="text-red-400 text-xs mt-1">
                      {createSessionErrors.private_student_id}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {activeModal &&
        typeof activeModal === "object" &&
        activeModal.type === "edit-session" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Edit Session</h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form onSubmit={handleUpdateSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Course <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editSessionForm.course_id}
                    onChange={(e) => {
                      setEditSessionForm({
                        ...editSessionForm,
                        course_id: e.target.value,
                      });
                      clearEditSessionFieldError("course_id");
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      editSessionErrors?.course_id
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">Select course</option>
                    {courses?.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} -{" "}
                        {course.instructor?.username || "No instructor"}
                      </option>
                    ))}
                  </select>
                  {editSessionErrors?.course_id && (
                    <p className="text-red-400 text-xs mt-1">
                      {editSessionErrors.course_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Session Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter session title"
                    value={editSessionForm.title}
                    onChange={(e) => {
                      setEditSessionForm({
                        ...editSessionForm,
                        title: e.target.value,
                      });
                      clearEditSessionFieldError("title");
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      editSessionErrors?.title
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    }`}
                  />
                  {editSessionErrors?.title && (
                    <p className="text-red-400 text-xs mt-1">
                      {editSessionErrors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Start Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={editSessionForm.start_time}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => {
                        setEditSessionForm({
                          ...editSessionForm,
                          start_time: e.target.value,
                        });
                        clearEditSessionFieldError("start_time");
                      }}
                      className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                        editSessionErrors?.start_time
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-700 focus:ring-indigo-500"
                      }`}
                    />
                    {editSessionErrors?.start_time && (
                      <p className="text-red-400 text-xs mt-1">
                        {editSessionErrors.start_time}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Meeting Link <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={editSessionForm.meeting_link}
                    onChange={(e) => {
                      setEditSessionForm({
                        ...editSessionForm,
                        meeting_link: e.target.value,
                      });
                      clearEditSessionFieldError("meeting_link");
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      editSessionErrors?.meeting_link
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    }`}
                  />
                  {editSessionErrors?.meeting_link && (
                    <p className="text-red-400 text-xs mt-1">
                      {editSessionErrors.meeting_link}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingSessionId}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50"
                  >
                    {updatingSessionId ? "Updating..." : "Update Session"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default SessionsTab;
