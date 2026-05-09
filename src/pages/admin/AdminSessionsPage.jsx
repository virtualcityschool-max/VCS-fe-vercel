import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
const AdminSessionsPage = () => {
  const dispatch = useDispatch();

  const [activeModal, setActiveModal] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [loadingSessionIds, setLoadingSessionIds] = useState(new Set());
  const [updatingSessionId, setUpdatingSessionId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, sessionId: null, sessionTitle: "" });

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
  const [showSessionFilters, setShowSessionFilters] = useState(false);
  const [sessionFilters, setSessionFilters] = useState({
    search: "",
    teacher: "",
    course: "",
    view: "",
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

  // Re-fetch sessions when teacher, course, or view filter changes
  useEffect(() => {
    const params = {};
    if (sessionFilters.teacher) params.teacher = sessionFilters.teacher;
    if (sessionFilters.course) params.course = sessionFilters.course;
    if (sessionFilters.view) params.view = sessionFilters.view;
    dispatch(fetchSessions(params));
  }, [dispatch, sessionFilters.teacher, sessionFilters.course, sessionFilters.view]);

  // Reset create session form when modal opens/closes
  useEffect(() => {
    if (activeModal === "create-session") {
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

    if ((session.enrollment_count ?? 0) >= 1) {
      toastManager.error("Cannot edit: this session has active enrollments.");
      return;
    }

    // Parse scheduled datetime into separate date + time for the form
    const rawDateTime = session.start_time || session.scheduled_at;
    let startDate = "";
    let startTime = "";
    if (rawDateTime) {
      try {
        const d = new Date(rawDateTime);
        startDate = d.toISOString().slice(0, 10);
        startTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      } catch {}
    }

    setEditingSession(session);
    setEditSessionForm({
      course_id: session.course?.id || session.course_id || "",
      course_title: session.course?.title || session.course_title || "",
      teacher_name: session.teacher_name || "",
      instructor_id: session.instructor_id || "",
      title: session.title || "",
      description: session.description || "",
      start_date: startDate,
      time: startTime,
      recurrence_days: session.recurrence_days || [],
      recurrence_end_date: session.recurrence_end_date || "",
    });
    setActiveModal({ type: "edit-session", sessionId });
  };

  // Validation functions
  const validateCreateSessionForm = (formData) => {
    const errors = {};

    if (!formData.course) errors.course = "Course is required";

    if (!formData.title?.trim()) {
      errors.title = "Class title is required";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (!formData.time) errors.time = "Class time is required";

    if (!formData.scheduled_date) {
      errors.scheduled_date = "Start date is required";
    } else {
      const [year, month, day] = formData.scheduled_date.split("-");
      const scheduled = new Date(year, month - 1, day);
      const today = new Date();
      scheduled.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (scheduled < today) {
        errors.scheduled_date = "Scheduled date must be today or in the future";
      }
    }

    if (!formData.recurrence_days?.length) {
      errors.recurrence_days = "Select at least one recurring day";
    }
    if (!formData.recurrence_end_date) {
      errors.recurrence_end_date = "Recurrence end date is required";
    } else if (formData.scheduled_date && formData.recurrence_end_date <= formData.scheduled_date) {
      errors.recurrence_end_date = "End date must be after start date";
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
      const d = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      if (d < today) errors.start_date = "Start date must be today or in the future";
    }

    if (!formData.time) errors.time = "Class time is required";

    if (!formData.recurrence_days?.length) errors.recurrence_days = "Select at least one recurring day";

    if (!formData.recurrence_end_date) {
      errors.recurrence_end_date = "Recurrence end date is required";
    } else if (formData.start_date && formData.recurrence_end_date <= formData.start_date) {
      errors.recurrence_end_date = "End date must be after start date";
    }

    return errors;
  };

  // Handle session creation
  const handleCreateSession = async (sessionData) => {
    clearAllCreateSessionErrors();

    const selectedCourse = courses?.data?.find(
      (c) => c.id === Number(sessionData.course),
    );

    const validationErrors = validateCreateSessionForm(sessionData);
    if (Object.keys(validationErrors).length > 0) {
      setCreateSessionErrors(validationErrors);
      toastManager.error("Please fix highlighted fields");
      return;
    }

    const instructor_id = selectedCourse?.instructor?.id;
    if (!instructor_id) {
      toastManager.error("Selected course has no instructor assigned");
      return;
    }

    const payload = {
      course: Number(sessionData.course),
      instructor_id,
      title: sessionData.title,
      scheduled_at: sessionData.scheduled_date,
      time: sessionData.time,
      is_recurring: sessionData.is_recurring,
      recurrence_days: sessionData.is_recurring ? (sessionData.recurrence_days || []) : [],
      recurrence_end_date: sessionData.recurrence_end_date,
    };

    try {
      await dispatch(createSession(payload)).unwrap();
      toastManager.success("Class created successfully");
      setActiveModal(null);
      dispatch(fetchSessions());
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
    }
  };

  // Handle session update
  const handleUpdateSession = async (sessionData) => {
    if (!editingSession) {
      toastManager.error("Error: Session ID is missing");
      return;
    }

    clearAllEditSessionErrors();

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
    if (sessionData.course_id) {
      payload.course = Number(sessionData.course_id);
    }
    if (sessionData.start_date && sessionData.time) {
      payload.scheduled_at = `${sessionData.start_date}T${sessionData.time}:00Z`;
    }
    if (sessionData.instructor_id) {
      payload.instructor_id = Number(sessionData.instructor_id);
    }

    try {
      await dispatch(updateSession({ sessionId: editingSession.id, sessionData: payload })).unwrap();
      toastManager.success("Session updated successfully");
      setActiveModal(null);
      const params = {};
      if (sessionFilters.teacher) params.teacher = sessionFilters.teacher;
      if (sessionFilters.course) params.course = sessionFilters.course;
      if (sessionFilters.view) params.view = sessionFilters.view;
      dispatch(fetchSessions(params));
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

    if ((session?.enrollment_count ?? 0) >= 1) {
      toastManager.error("Cannot delete session as enrollment exists against this session.");
      return;
    }

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
      dispatch(fetchSessions(params));
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
      editSessionForm={editSessionForm}
      setEditSessionForm={setEditSessionForm}
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
      showSessionFilters={showSessionFilters}
      setShowSessionFilters={setShowSessionFilters}
      sessionFilters={sessionFilters}
      setSessionFilters={setSessionFilters}
      teachers={teachers?.data || []}
    />

    <ConfirmDialog
      open={confirmDialog.open}
      variant="danger"
      title="Delete Class"
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
