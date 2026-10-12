import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectPlatformSettings } from "../../store/slices/platformSettingsSlice";
import {
  fetchSessions,
  createSession,
  updateSession,
  deleteSession,
  selectSessions,
  selectCourses,
  fetchCourses,
  fetchUsers,
  selectUsers,
  fetchAvailableStudents,
  selectAvailableStudents,
} from "../../store/slices/adminSlice";
import { adminSessionService } from "../../services/adminSessionService";
import { Button, Input, Card } from "../../components/ui";
import { useFieldErrors } from "../../hooks";
import { normalizeApiError } from "../../utils/errorHandler";
import { toastManager } from "../../utils/toastManager";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SessionsTab from "../../components/admin/SessionsTab";
import { showApiError } from "../../utils/apiErrorHandler";
import { useDateFormatters } from "../../hooks";
import { useApp } from "../../admin-v2/context/AppContext";
const AdminSessionsPage = () => {
  // Deleting classes is Super Admin only (the server checks too).
  const { can } = useApp();
  const canDelete = can("delete");
  const dispatch = useDispatch();
  const { timezone, toPayloadISO, toDatetimeInput } = useDateFormatters();

  // Read platform settings first - used as initial values for state below
  const ps = useSelector(selectPlatformSettings);

  const [activeModal, setActiveModal] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [loadingSessionIds, setLoadingSessionIds] = useState(new Set());
  const [updatingSessionId, setUpdatingSessionId] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, sessionId: null, sessionTitle: "" });
  const [deletePast, setDeletePast] = useState(false);

  // Scheduling mode for create form
  const [createMode, setCreateMode] = useState(() => ps?.session_default_start_type || "scheduled");
  const [delayHours, setDelayHours] = useState(0);
  const [delayMins,  setDelayMins]  = useState(30);

  // Private students state for course-specific dropdown
  const [privateStudents, setPrivateStudents] = useState([]);
  const [privateStudentsLoading, setPrivateStudentsLoading] = useState(false);
  const [privateStudentsError, setPrivateStudentsError] = useState(null);

  // Session form states
  const [createSessionForm, setCreateSessionForm] = useState({
    course: "",
    title: "",
    time: "",
    scheduled_date: "",
    meeting_link: "",
    is_recurring: true,
    recurrence_days: [],
    recurrence_end_date: "",
    instructor_id: "",
    instructor_username: "",
  });

  const [newlyCreatedSession, setNewlyCreatedSession] = useState(null);
  const [editSessionForm, setEditSessionForm] = useState({});
  const originalEditFormRef = useRef({});
  const [showSessionFilters, setShowSessionFilters] = useState(false);
  const [sessionFilters, setSessionFilters] = useState({
    search: "",
    teacher: "",
    course: "",
    view: "parent",
    status: "",
  });

  // Get data from Redux store
  const sessions = useSelector(selectSessions);
  const courses = useSelector(selectCourses);
  const teachers = useSelector(selectUsers);
  const availableStudents = useSelector(selectAvailableStudents);

  // Error handling
  const {
    errors: createSessionErrors,
    setErrors: setCreateSessionErrors,
    handleApiError: handleCreateSessionApiError,
    clearFieldError: clearCreateSessionFieldError,
    clearAllErrors: clearAllCreateSessionErrors,
  } = useFieldErrors({});

  const {
    errors: editSessionErrors,
    setErrors: setEditSessionErrors,
    handleApiError: handleEditSessionApiError,
    clearFieldError: clearEditSessionFieldError,
    clearAllErrors: clearAllEditSessionErrors,
  } = useFieldErrors({});

  // Fetch supporting data on mount
  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchUsers({ role: "teacher" }));
    dispatch(fetchAvailableStudents());
  }, [dispatch]);

  // Re-fetch sessions when server-side filters change
  useEffect(() => {
    const params = {};
    if (sessionFilters.teacher) params.teacher = sessionFilters.teacher;
    if (sessionFilters.course) params.course = sessionFilters.course;
    if (sessionFilters.view) params.view = sessionFilters.view;
    if (sessionFilters.status) params.status = sessionFilters.status;
    dispatch(fetchSessions(params));
  }, [dispatch, sessionFilters.teacher, sessionFilters.course, sessionFilters.view, sessionFilters.status]);

  // Reset create session form when modal opens/closes
  useEffect(() => {
    if (activeModal === "create-session") {
      setCreateMode(ps?.session_default_start_type || "scheduled");
      setDelayHours(0);
      setDelayMins(30);
      setCreateSessionForm({
        course: "",
        title: "",
        time: "",
        scheduled_date: "",
        meeting_link: "",
        is_recurring: true,
        recurrence_days: [],
        recurrence_end_date: "",
        instructor_id: "",
        instructor_username: "",
      });
      clearAllCreateSessionErrors();
    } else if (activeModal === null) {
      clearAllCreateSessionErrors();
    }
  }, [activeModal, clearAllCreateSessionErrors]);


  // Clear edit form when modal closes
  useEffect(() => {
    if (activeModal === null) {
      setEditSessionForm({});
      clearAllEditSessionErrors();
    }
  }, [activeModal, clearAllEditSessionErrors]);

  // Fetch detailed session data for editing
  const fetchSessionDetailsForEdit = (sessionId) => {
    const session = sessions?.data?.find((s) => s.id === sessionId);

    if (!session) {
      toastManager.error("Session not found");
      return;
    }

    if (session.is_child === true) {
      toastManager.error("Child sessions cannot be edited. Edit the parent session instead.");
      return;
    }

    const rawDateTime = session.start_time || session.scheduled_at;
    let startDate = "";
    let startTime = "";
    if (rawDateTime) {
      const localDT = toDatetimeInput(rawDateTime); // converts to user's timezone (e.g. "2026-05-23T11:30")
      if (localDT?.includes("T")) {
        [startDate, startTime] = localDT.split("T");
      }
    }

    setEditingSession(session);

    const formSnapshot = {
      course_id: session.course?.id || session.course_id || "",
      course_title: session.course?.title || session.course_title || "",
      teacher_name: session.teacher_name || "",
      instructor_id: session.instructor_id || session.teacher,
      title: session.title || "",
      description: session.description || "",
      start_date: startDate,
      time: startTime,
      meeting_link: session.meeting_link || "",
      recurrence_days: session.recurrence_days || [],
      recurrence_end_date: session.recurrence_end_date || "",
    };
    originalEditFormRef.current = formSnapshot;
    setEditSessionForm(formSnapshot);
    setActiveModal({ type: "edit-session", sessionId });
  };

  // Validation functions
  const validateCreateSessionForm = (formData, mode = "scheduled") => {
    const errors = {};

    if (!formData.course) errors.course = "Course is required";

    if (!formData.title?.trim()) {
      errors.title = "Session title is required";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (mode === "scheduled") {
      if (!formData.time) errors.time = "Session time is required";
      if (!formData.scheduled_date) errors.scheduled_date = "Start date is required";
      if (!formData.recurrence_days?.length) errors.recurrence_days = "Select at least one recurring day";
      if (!formData.recurrence_end_date) {
        errors.recurrence_end_date = "Recurrence end date is required";
      } else if (formData.scheduled_date && formData.recurrence_end_date < formData.scheduled_date) {
        errors.recurrence_end_date = "End date must be on or after start date";
      }
    } else if (mode === "delayed") {
      if (Number(delayHours) === 0 && Number(delayMins) === 0) {
        errors.delay = "Set at least 1 minute delay";
      }
    }

    return errors;
  };

  const validateEditSessionForm = (formData) => {
    const errors = {};

    if (!formData.title?.trim()) errors.title = "Session title is required";
    else if (formData.title.trim().length < 5) errors.title = "Title must be at least 5 characters";

    if (!formData.time) errors.time = "Session time is required";

    if (!formData.recurrence_days?.length) errors.recurrence_days = "Select at least one recurring day";

    if (!formData.recurrence_end_date) {
      errors.recurrence_end_date = "Recurrence end date is required";
    } else if (formData.start_date && formData.recurrence_end_date < formData.start_date) {
      errors.recurrence_end_date = "End date cannot be before start date";
    }

    return errors;
  };

  // Handle session creation
  const handleCreateSession = async (sessionData) => {
    clearAllCreateSessionErrors();

    const selectedCourse = courses?.data?.find(
      (c) => c.id === Number(sessionData.course),
    );

    const validationErrors = validateCreateSessionForm(sessionData, createMode);
    if (Object.keys(validationErrors).length > 0) {
      setCreateSessionErrors(validationErrors);
      toastManager.error("Please fix highlighted fields");
      return;
    }

    const instructor_id = selectedCourse?.instructor?.id;
    if (!instructor_id) {
      toastManager.error("Selected course has no tutor assigned");
      return;
    }

    const pad = (n) => String(n).padStart(2, "0");
    const localNow = (offsetMs = 0) => {
      const d = new Date(Date.now() + offsetMs);
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    let payload;
    if (createMode === "now") {
      payload = {
        course: Number(sessionData.course),
        instructor_id,
        title: sessionData.title,
        scheduled_at: toPayloadISO(toDatetimeInput(new Date().toISOString())),
        is_recurring: false,
        recurrence_days: [],
      };
    } else if (createMode === "delayed") {
      const offsetMs = (Number(delayHours) * 60 + Number(delayMins)) * 60 * 1000;
      payload = {
        course: Number(sessionData.course),
        instructor_id,
        title: sessionData.title,
        scheduled_at: toPayloadISO(toDatetimeInput(new Date(Date.now() + offsetMs).toISOString())),
        is_recurring: false,
        recurrence_days: [],
      };
    } else {
      payload = {
        course: Number(sessionData.course),
        instructor_id,
        title: sessionData.title,
        scheduled_at: toPayloadISO(`${sessionData.scheduled_date}T${sessionData.time}`),
        is_recurring: sessionData.is_recurring,
        recurrence_days: sessionData.is_recurring ? (sessionData.recurrence_days || []) : [],
        recurrence_end_date: sessionData.recurrence_end_date,
      };
    }
    if (sessionData.meeting_link?.trim()) {
      payload.meeting_link = sessionData.meeting_link.trim();
    }
    try {
      setIsCreatingSession(true);
      const created = await dispatch(createSession(payload)).unwrap();
      toastManager.success("Session created successfully");
      if (created?.meeting_link) {
        setNewlyCreatedSession(created);
        setActiveModal("created-success");
      } else {
        setActiveModal(null);
      }
      const params = {};
      if (sessionFilters.teacher) params.teacher = sessionFilters.teacher;
      if (sessionFilters.course) params.course = sessionFilters.course;
      if (sessionFilters.view) params.view = sessionFilters.view;
      if (sessionFilters.status) params.status = sessionFilters.status;
      dispatch(fetchSessions(params));
      setCreateSessionForm({
        course: "",
        title: "",
        time: "",
        scheduled_date: "",
        meeting_link: "",
        is_recurring: true,
        recurrence_days: [],
        recurrence_end_date: "",
        instructor_id: "",
        instructor_username: "",
      });
      clearAllCreateSessionErrors();
    } catch (error) {
      showApiError(error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const refreshSessions = () => {
    const params = {};
    if (sessionFilters.teacher) params.teacher = sessionFilters.teacher;
    if (sessionFilters.course) params.course = sessionFilters.course;
    if (sessionFilters.view) params.view = sessionFilters.view;
    if (sessionFilters.status) params.status = sessionFilters.status;
    dispatch(fetchSessions(params));
  };

  // Handle session update
  const handleUpdateSession = async (sessionData) => {
    if (!editingSession) {
      toastManager.error("Error: Session ID is missing");
      return;
    }

    clearAllEditSessionErrors();

    const orig = originalEditFormRef.current;
    const scheduleFieldsChanged =
      sessionData.start_date !== orig.start_date ||
      sessionData.time !== orig.time ||
      sessionData.recurrence_end_date !== orig.recurrence_end_date ||
      String(sessionData.course_id) !== String(orig.course_id) ||
      JSON.stringify([...(sessionData.recurrence_days || [])].sort()) !==
        JSON.stringify([...(orig.recurrence_days || [])].sort());

    if (!scheduleFieldsChanged) {
      // Only title (or description/meeting_link) changed - validate title only, send minimal payload
      const titleErrors = {};
      if (!sessionData.title?.trim()) {
        titleErrors.title = "Session title is required";
      } else if (sessionData.title.trim().length < 5) {
        titleErrors.title = "Title must be at least 5 characters";
      }
      if (Object.keys(titleErrors).length > 0) {
        setEditSessionErrors(titleErrors);
        toastManager.error("Please fix highlighted fields");
        return;
      }
      setUpdatingSessionId(editingSession.id);
      try {
        const miniPayload = { title: sessionData.title };
        if (sessionData.meeting_link !== undefined) {
          miniPayload.meeting_link = sessionData.meeting_link.trim();
        }
        await dispatch(updateSession({ sessionId: editingSession.id, sessionData: miniPayload })).unwrap();
        toastManager.success("Session updated successfully");
        setActiveModal(null);
        refreshSessions();
      } catch (error) {
        showApiError(error);
      } finally {
        setUpdatingSessionId(null);
      }
      return;
    }

    // Schedule fields changed - full validation
    const frontendErrors = validateEditSessionForm(sessionData);
    setEditSessionErrors(frontendErrors);
    if (Object.keys(frontendErrors).length > 0) {
      toastManager.error("Please fix highlighted fields");
      return;
    }

    setUpdatingSessionId(editingSession.id);

    const payload = {
      title: sessionData.title,
      description: sessionData.description || "",
      is_recurring: true,
      recurrence_days: sessionData.recurrence_days || [],
      recurrence_end_date: sessionData.recurrence_end_date,
    };
    if (sessionData.meeting_link?.trim()) payload.meeting_link = sessionData.meeting_link.trim();
    if (sessionData.course_id) payload.course = Number(sessionData.course_id);
    if (sessionData.instructor_id) payload.instructor_id = Number(sessionData.instructor_id);
    if (sessionData.start_date && sessionData.time) {
      payload.scheduled_at = toPayloadISO(`${sessionData.start_date}T${sessionData.time}`);
    }

    try {
      await dispatch(updateSession({ sessionId: editingSession.id, sessionData: payload })).unwrap();
      toastManager.success("Session updated successfully");
      setActiveModal(null);
      refreshSessions();
    } catch (error) {
      showApiError(error);
    } finally {
      setUpdatingSessionId(null);
    }
  };

  // Handle session deletion
  const handleDeleteSession = (sessionId) => {
    const session = sessions?.data?.find((s) => s.id === sessionId);
    const sessionTitle = session?.title || "this session";

    setConfirmDialog({ open: true, sessionId, sessionTitle });
  };

  const confirmDeleteSession = async () => {
    const { sessionId } = confirmDialog;
    setConfirmDialog({ open: false, sessionId: null, sessionTitle: "" });
    const deletingPast = deletePast;
    setDeletePast(false);

    setLoadingSessionIds((prev) => new Set(prev).add(sessionId));
    try {
      await dispatch(deleteSession({ sessionId, deletePast: deletingPast })).unwrap();
      toastManager.success(
        deletingPast ? "Session and all history deleted" : "Future sessions deleted"
      );
      dispatch(fetchCourses());
    } catch (error) {
      showApiError(error);
    } finally {
      setLoadingSessionIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  return (
    <>
    <SessionsTab
      sessions={sessions?.data || []}
      courses={courses?.data || []}
      availableStudents={availableStudents?.data || []}
      privateStudents={privateStudents}
      privateStudentsLoading={privateStudentsLoading}
      privateStudentsError={privateStudentsError}
      loading={sessions?.loading || false}
      loadingSessionIds={loadingSessionIds}
      updatingSessionId={updatingSessionId}
      isCreatingSession={isCreatingSession}
      editSessionForm={editSessionForm}
      setEditSessionForm={setEditSessionForm}
      originalEditForm={originalEditFormRef.current}
      createSessionForm={createSessionForm}
      setCreateSessionForm={setCreateSessionForm}
      createSessionErrors={createSessionErrors}
      clearCreateSessionFieldError={clearCreateSessionFieldError}
      editSessionErrors={editSessionErrors}
      clearEditSessionFieldError={clearEditSessionFieldError}
      clearAllEditSessionErrors={clearAllEditSessionErrors}
      onSessionCreate={handleCreateSession}
      onSessionUpdate={handleUpdateSession}
      onSessionDelete={handleDeleteSession}
      canDelete={canDelete}
      onSessionEdit={fetchSessionDetailsForEdit}
      activeModal={activeModal}
      setActiveModal={setActiveModal}
      createMode={createMode}
      setCreateMode={setCreateMode}
      delayHours={delayHours}
      setDelayHours={setDelayHours}
      delayMins={delayMins}
      setDelayMins={setDelayMins}
      showSessionFilters={showSessionFilters}
      setShowSessionFilters={setShowSessionFilters}
      sessionFilters={sessionFilters}
      setSessionFilters={setSessionFilters}
      teachers={teachers?.data || []}
    />

    <ConfirmDialog
      open={confirmDialog.open}
      variant="danger"
      title="Delete Session"
      message={`Delete "${confirmDialog.sessionTitle}"? Its upcoming classes that have not started are removed. Classes already held and their attendance are always kept (a class with attendance cannot be deleted; cancel it instead).`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={confirmDeleteSession}
      onCancel={() => { setConfirmDialog({ open: false, sessionId: null, sessionTitle: "" }); setDeletePast(false); }}
    />

    {/* Class Created Success Modal with Meet Link */}
    {activeModal === "created-success" && newlyCreatedSession && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-in fade-in">
        <div className="bg-[#121831] border border-[#232D52] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Class Planned Successfully!</h3>
              <p className="text-xs text-slate-400 mt-0.5">{newlyCreatedSession.title}</p>
            </div>
          </div>

          <div className="p-4 bg-[#0E1428] border border-[#232D52] rounded-xl space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Google Meet Link</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-mono text-indigo-300 truncate select-all">{newlyCreatedSession.meeting_link}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(newlyCreatedSession.meeting_link);
                  toastManager.success("Google Meet link copied!");
                }}
                className="px-3 py-1.5 rounded-lg bg-[#6D5BFF] hover:bg-[#5B47FB] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
              >
                <i className="fas fa-copy text-xs"></i> Copy Link
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join Class: ${newlyCreatedSession.title}\nGoogle Meet Link: ${newlyCreatedSession.meeting_link}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <i className="fab fa-whatsapp text-sm"></i> Share on WhatsApp
            </a>
            <a
              href={newlyCreatedSession.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-xl bg-[#1A2346] hover:bg-[#232D52] text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 border border-[#232D52] transition"
            >
              <i className="fas fa-video text-xs"></i> Open Meet
            </a>
          </div>

          <div className="text-right pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                setNewlyCreatedSession(null);
              }}
              className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminSessionsPage;
