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
const AdminSessionsPage = () => {
  const dispatch = useDispatch();
  const { timezone, toPayloadISO, toDatetimeInput } = useDateFormatters();

  // Read platform settings first — used as initial values for state below
  const ps = useSelector(selectPlatformSettings);

  const [activeModal, setActiveModal] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [loadingSessionIds, setLoadingSessionIds] = useState(new Set());
  const [updatingSessionId, setUpdatingSessionId] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, sessionId: null, sessionTitle: "" });

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
    is_recurring: true,
    recurrence_days: [],
    recurrence_end_date: "",
    instructor_id: "",
    instructor_username: "",
  });

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

    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    } else {
      const todayStr = timezone
        ? new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
        : new Date().toLocaleDateString("en-CA");
      if (formData.start_date < todayStr) errors.start_date = "Start date must be today or in the future";
    }

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
    try {
      setIsCreatingSession(true);
      await dispatch(createSession(payload)).unwrap();
      toastManager.success("Session created successfully");
      setActiveModal(null);
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
      // Only title (or description) changed — validate title only, send minimal payload
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
        await dispatch(updateSession({ sessionId: editingSession.id, sessionData: { title: sessionData.title } })).unwrap();
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

    // Schedule fields changed — full validation
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

    setLoadingSessionIds((prev) => new Set(prev).add(sessionId));
    try {
      await dispatch(deleteSession(sessionId)).unwrap();
      toastManager.success("Session deleted successfully");
      const params = {};
      if (sessionFilters.teacher) params.teacher = sessionFilters.teacher;
      if (sessionFilters.course) params.course = sessionFilters.course;
      if (sessionFilters.view) params.view = sessionFilters.view;
      if (sessionFilters.status) params.status = sessionFilters.status;
      dispatch(fetchSessions(params));
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
      message={`Are you sure you want to delete "${confirmDialog.sessionTitle}"? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={confirmDeleteSession}
      onCancel={() => setConfirmDialog({ open: false, sessionId: null, sessionTitle: "" })}
    />
    </>
  );
};

export default AdminSessionsPage;
