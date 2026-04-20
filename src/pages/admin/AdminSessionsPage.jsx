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
  fetchAvailableStudents,
  selectAvailableStudents,
} from "../../store/slices/adminSlice";
import { adminSessionService } from "../../services/adminSessionService";
import { Button, Input, Card } from "../../components/ui";
import { useFieldErrors } from "../../hooks";
import { normalizeApiError } from "../../utils/errorHandler";
import { toastManager } from "../../utils/toastManager";
import SessionsTab from "../../components/admin/SessionsTab";

const AdminSessionsPage = () => {
  const dispatch = useDispatch();

  const [activeModal, setActiveModal] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [loadingSessionIds, setLoadingSessionIds] = useState(new Set());
  const [updatingSessionId, setUpdatingSessionId] = useState(null);

  // Private students state for course-specific dropdown
  const [privateStudents, setPrivateStudents] = useState([]);
  const [privateStudentsLoading, setPrivateStudentsLoading] = useState(false);
  const [privateStudentsError, setPrivateStudentsError] = useState(null);

  // Session form states
  const [createSessionForm, setCreateSessionForm] = useState({
    course: "",
    title: "",
    scheduled_date: "",
    scheduled_time: "",
    is_recurring: false,
    recurrence_days: [],
    recurrence_end_date: "",
  });

  const [editSessionForm, setEditSessionForm] = useState({});
  const [showSessionFilters, setShowSessionFilters] = useState(false);
  const [sessionFilters, setSessionFilters] = useState({
    search: "",
  });

  // Get data from Redux store
  const sessions = useSelector(selectSessions);
  const courses = useSelector(selectCourses);
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

  // Fetch courses on component mount (sessions fetched by AdminLayout)
  useEffect(() => {
    dispatch(fetchCourses()); // For course dropdown
    dispatch(fetchAvailableStudents()); // For private session student selection
  }, [dispatch]);

  // Reset create session form when modal opens/closes
  useEffect(() => {
    if (activeModal === "create-session") {
      setCreateSessionForm({
        course: "",
        title: "",
        scheduled_date: "",
        scheduled_time: "",
        is_recurring: false,
        recurrence_days: [],
        recurrence_end_date: "",
      });
      clearAllCreateSessionErrors();
    } else if (activeModal === null) {
      clearAllCreateSessionErrors();
    }
  }, [activeModal, clearAllCreateSessionErrors]);


  // Reset edit session form when edit modal opens/closes
  useEffect(() => {
    if (
      activeModal &&
      typeof activeModal === "object" &&
      activeModal.type === "edit-session"
    ) {
      if (editingSession) {
        // Convert datetime format for HTML datetime-local inputs
        const formatDateTimeForInput = (dateTimeString) => {
          if (!dateTimeString) return "";
          try {
            const date = new Date(dateTimeString);
            // Format as YYYY-MM-DDTHH:MM for datetime-local input
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          } catch {
            return "";
          }
        };

        setEditSessionForm({
          course_id: editingSession.course_id || "",
          title: editingSession.title || "",
          start_time: formatDateTimeForInput(editingSession.start_time),
          meeting_link: editingSession.meeting_link || "",
        });
      }
    } else {
      // Clear form and errors when modal is closed
      setEditSessionForm({});
      clearAllEditSessionErrors();
    }
  }, [activeModal, editingSession, clearAllEditSessionErrors]);

  // Fetch detailed session data for editing
  const fetchSessionDetailsForEdit = async (sessionId) => {
    try {
      // For now, we'll use the session data from the list
      // In a real implementation, you might want to fetch detailed data
      const session = sessions?.data?.find((s) => s.id === sessionId);
      if (session) {
        setEditingSession(session);
        // Set the edit form immediately to avoid race condition
        // Convert datetime format for HTML datetime-local inputs
        const formatDateTimeForInput = (dateTimeString) => {
          if (!dateTimeString) return "";
          try {
            const date = new Date(dateTimeString);
            // Format as YYYY-MM-DDTHH:MM for datetime-local input
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          } catch {
            return "";
          }
        };

        setEditSessionForm({
          course_id: session.course_id || "",
          title: session.title || "",
          start_time: formatDateTimeForInput(session.start_time),
          meeting_link: session.meeting_link || "",
        });
        setActiveModal({
          type: "edit-session",
          sessionId: sessionId,
        });
      } else {
        toastManager.error("Session not found");
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      toastManager.error("Failed to load session details");
    }
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

    if (!formData.scheduled_date) errors.scheduled_date = "Start date is required";
    if (!formData.scheduled_time) errors.scheduled_time = "Start time is required";

    if (formData.scheduled_date && formData.scheduled_time) {
      const scheduled = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      if (scheduled < new Date()) errors.scheduled_date = "Scheduled time must be in the future";
    }

    if (formData.is_recurring) {
      if (!formData.recurrence_days?.length)
        errors.recurrence_days = "Select at least one recurrence day";
      if (!formData.recurrence_end_date)
        errors.recurrence_end_date = "End date is required for recurring classes";
      else if (formData.scheduled_date && formData.recurrence_end_date <= formData.scheduled_date)
        errors.recurrence_end_date = "End date must be after start date";
    }

    return errors;
  };

  const validateEditSessionForm = (formData) => {
    const errors = {};

    if (!formData.course_id) {
      errors.course_id = "Course is required";
    }

    if (!formData.title?.trim()) {
      errors.title = "Session title is required";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (!formData.start_time) {
      errors.start_time = "Start time is required";
    } else {
      // Check if start time is in the past
      const startTime = new Date(formData.start_time);
      const now = new Date();
      if (startTime < now) {
        errors.start_time = "Scheduled time must be in the future";
      }
    }

    if (!formData.meeting_link?.trim()) {
      errors.meeting_link = "Meeting link is required";
    } else {
      try {
        new URL(formData.meeting_link);
      } catch {
        errors.meeting_link = "Please enter a valid URL";
      }
    }

    return errors;
  };

  // Handle session creation
  const handleCreateSession = async (sessionData) => {
    clearAllCreateSessionErrors();

    const validationErrors = validateCreateSessionForm(sessionData);
    if (Object.keys(validationErrors).length > 0) {
      setCreateSessionErrors(validationErrors);
      toastManager.error("Please fix highlighted fields");
      return;
    }

    const selectedCourse = courses?.data?.find(
      (c) => c.id === Number(sessionData.course),
    );
    const instructor_id = selectedCourse?.instructor?.id;

    if (!instructor_id) {
      toastManager.error("Selected course has no instructor assigned");
      return;
    }

    // Build ISO datetime with local offset
    const localOffset = new Date().toTimeString().slice(9, 15).replace(":", "");
    const offsetStr = `+${localOffset.slice(0, 2)}:${localOffset.slice(2)}`;
    const scheduled_at = `${sessionData.scheduled_date}T${sessionData.scheduled_time}:00${offsetStr}`;

    const payload = {
      course: Number(sessionData.course),
      instructor_id,
      title: sessionData.title,
      scheduled_at,
      is_recurring: sessionData.is_recurring,
      ...(sessionData.is_recurring && {
        recurrence_days: sessionData.recurrence_days,
        recurrence_end_date: sessionData.recurrence_end_date,
      }),
    };

    try {
      await dispatch(createSession(payload)).unwrap();
      toastManager.success("Class created successfully");
      setActiveModal(null);
      dispatch(fetchSessions());
      setCreateSessionForm({
        course: "",
        title: "",
        scheduled_date: "",
        scheduled_time: "",
        is_recurring: false,
        recurrence_days: [],
        recurrence_end_date: "",
      });
      clearAllCreateSessionErrors();
    } catch (error) {
      handleCreateSessionApiError(error);
    }
  };

  // Handle session update
  const handleUpdateSession = async (sessionData) => {
    if (!editingSession) {
      toastManager.error("Error: Session ID is missing");
      return;
    }

    // Clear previous errors first
    clearAllEditSessionErrors();

    // Run frontend validation
    const frontendErrors = validateEditSessionForm(sessionData);
    setEditSessionErrors(frontendErrors);

    if (Object.keys(frontendErrors).length > 0) {
      toastManager.error("Please fix highlighted fields");
      return;
    }

    setUpdatingSessionId(editingSession.id);
    try {
      await dispatch(
        updateSession({ sessionId: editingSession.id, sessionData }),
      ).unwrap();
      toastManager.success("Session updated successfully");
      setActiveModal(null);
      dispatch(fetchSessions());
    } catch (error) {
      const hadFieldErrors = handleEditSessionApiError(
        error,
        toastManager.error,
      );
      if (!hadFieldErrors) {
        const normalizedError = normalizeApiError(error);
        toastManager.error(normalizedError.message);
      }
    } finally {
      setUpdatingSessionId(null);
    }
  };

  // Handle session deletion
  const handleDeleteSession = async (sessionId) => {
    const session = sessions?.data?.find((s) => s.id === sessionId);
    const sessionTitle = session?.title || "this session";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${sessionTitle}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setLoadingSessionIds((prev) => new Set(prev).add(sessionId));
    try {
      await dispatch(deleteSession(sessionId)).unwrap();
      toastManager.success("Session deleted successfully");
      dispatch(fetchSessions());
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      toastManager.error(normalizedError.message);
    } finally {
      setLoadingSessionIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  return (
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
    />
  );
};

export default AdminSessionsPage;
