import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeacherPlannerSessions,
  createTeacherPlannerSession,
  updateTeacherPlannerSession,
  deleteTeacherPlannerSession,
  selectTeacherPlannerSessions,
  fetchUsers,
  selectUsers,
} from "../../store/slices/adminSlice";
import TeacherPlannerTab from "../../components/admin/TeacherPlannerTab";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

const AdminTeacherPlannerPage = () => {
  const dispatch = useDispatch();

  const sessions = useSelector(selectTeacherPlannerSessions);
  const teachers = useSelector(selectUsers);

  const [loadingSessionIds, setLoadingSessionIds] = useState(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, sessionId: null, title: "" });

  useEffect(() => {
    dispatch(fetchTeacherPlannerSessions({ view: "parent" }));
    dispatch(fetchUsers({ role: "teacher" }));
  }, [dispatch]);

  const setLoading = (id, on) => {
    setLoadingSessionIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleCreate = async (payload, onSuccess) => {
    setIsCreating(true);
    try {
      await dispatch(createTeacherPlannerSession(payload)).unwrap();
      toastManager.success("Session created successfully");
      dispatch(fetchTeacherPlannerSessions({ view: "parent" }));
      onSuccess?.();
    } catch (error) {
      showApiError(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (sessionId, payload, onSuccess) => {
    setLoading(sessionId, true);
    try {
      await dispatch(updateTeacherPlannerSession({ sessionId, sessionData: payload })).unwrap();
      toastManager.success("Session updated successfully");
      dispatch(fetchTeacherPlannerSessions({ view: "parent" }));
      onSuccess?.();
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(sessionId, false);
    }
  };

  const handleDelete = (sessionId) => {
    const session = sessions?.data?.find((s) => s.id === sessionId);
    setConfirmDialog({ open: true, sessionId, title: session?.title || "this session" });
  };

  const confirmDelete = async () => {
    const { sessionId } = confirmDialog;
    setConfirmDialog({ open: false, sessionId: null, title: "" });
    setLoading(sessionId, true);
    try {
      await dispatch(deleteTeacherPlannerSession(sessionId)).unwrap();
      toastManager.success("Session deleted. Emails sent to invited tutors.");
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(sessionId, false);
    }
  };

  return (
    <>
      <TeacherPlannerTab
        sessions={sessions?.data || []}
        teachers={teachers?.data || []}
        loading={sessions?.loading || false}
        loadingSessionIds={loadingSessionIds}
        isCreating={isCreating}
        onSessionCreate={handleCreate}
        onSessionUpdate={handleUpdate}
        onSessionDelete={handleDelete}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        variant="danger"
        title="Delete Session"
        message={`Delete "${confirmDialog.title}"? All future sessions will be removed and invited tutors will be notified by email.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false, sessionId: null, title: "" })}
      />
    </>
  );
};

export default AdminTeacherPlannerPage;
