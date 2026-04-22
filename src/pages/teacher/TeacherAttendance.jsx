import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeacherSessions,
  fetchSessionAttendance,
  updateSessionAttendance,
} from "../../store/slices/teacherSlice";
import { toastManager } from "../../utils/toastManager";
import { FilterSelect } from "../../components/ui";

const TeacherAttendance = () => {
  const dispatch = useDispatch();
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [editingNote, setEditingNote] = useState({});
  const [editingStatus, setEditingStatus] = useState({});

  const {
    sessions,
    loadingSessions,
    errorSessions,
    attendanceRecords,
    loadingAttendance,
    errorAttendance,
    updatingAttendanceId,
    updatingAttendanceError,
  } = useSelector((state) => state.teachers);

  useEffect(() => {
    dispatch(fetchTeacherSessions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSessionId) {
      dispatch(fetchSessionAttendance(selectedSessionId));
    }
  }, [dispatch, selectedSessionId]);

  const handleSessionChange = (sessionId) => {
    setSelectedSessionId(sessionId);
    setEditingNote({});
    setEditingStatus({});
  };

  const handleNoteChange = (attendanceId, note) => {
    setEditingNote((prev) => ({ ...prev, [attendanceId]: note }));
  };

  const handleStatusChange = (attendanceId, status) => {
    setEditingStatus((prev) => ({ ...prev, [attendanceId]: status }));
  };

  // const handleUpdateAttendance = (attendanceId) => {
  //   const data = {};
  //   if (editingStatus[attendanceId]) {
  //     data.status = editingStatus[attendanceId];
  //   }
  //   if (editingNote[attendanceId] !== undefined) {
  //     data.note = editingNote[attendanceId];
  //   }

  //   if (Object.keys(data).length === 0) return;

  //   dispatch(
  //     updateSessionAttendance({
  //       sessionId: selectedSessionId,
  //       attendanceId,
  //       data,
  //     }),
  //   ).then(() => {
  //     // Clear editing state after successful update
  //     setEditingNote((prev) => {
  //       const newState = { ...prev };
  //       delete newState[attendanceId];
  //       return newState;
  //     });
  //     setEditingStatus((prev) => {
  //       const newState = { ...prev };
  //       delete newState[attendanceId];
  //       return newState;
  //     });
  //   });
  // };

  const handleUpdateAttendance = (record) => {
    const key = record.id;
    const data = {};

    if (editingStatus[key]) {
      data.status = editingStatus[key];
    }
    if (editingNote[key] !== undefined) {
      data.note = editingNote[key];
    }

    if (Object.keys(data).length === 0) return;

    dispatch(
      updateSessionAttendance({
        sessionId: selectedSessionId,
        attendanceId: record.id,
        data,
      }),
    )
      .then(() => {
        // Clear editing state after successful update
        setEditingNote((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
        setEditingStatus((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });

        // Show success toast
        toastManager.success("Attendance updated successfully!");
      })
      .catch((error) => {
        // Show error toast
        toastManager.error("Failed to update attendance. Please try again.");
        console.error("Attendance update error:", error);
      });
  };

  if (loadingSessions) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl"></i>
      </div>
    );
  }

  if (errorSessions) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-red-400">
        Failed to load sessions: {errorSessions}
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-black font-poppins mb-2">
          Attendance Management
        </h1>
        <p className="text-slate-400 text-sm">
          Select a session to view and manage student attendance.
        </p>
      </div>

      {/* Session Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Select Session
        </label>
        <FilterSelect
          value={selectedSessionId}
          onChange={(e) => handleSessionChange(e.target.value)}
          className="w-full md:w-96"
        >
          <option value="">Choose a session...</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title || `Session ${session.id}`}
            </option>
          ))}
        </FilterSelect>
      </div>

      {/* No Sessions State */}
      {!loadingSessions && sessions.length === 0 && (
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center">
          <i className="fas fa-calendar-times text-4xl text-slate-600 mb-4"></i>
          <p className="text-slate-400">No sessions available</p>
        </div>
      )}

      {/* Session Selected but No Attendance */}
      {selectedSessionId &&
        !loadingAttendance &&
        attendanceRecords.length === 0 && (
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center">
            <i className="fas fa-users text-4xl text-slate-600 mb-4"></i>
            <p className="text-slate-400">
              No attendance records for this session
            </p>
          </div>
        )}

      {/* Attendance Loading */}
      {selectedSessionId && loadingAttendance && (
        <div className="min-h-[20vh] flex items-center justify-center text-white">
          <i className="fas fa-spinner animate-spin text-xl"></i>
        </div>
      )}

      {/* Attendance Error */}
      {errorAttendance && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">
            Failed to load attendance: {errorAttendance}
          </p>
        </div>
      )}

      {/* Update Error */}
      {updatingAttendanceError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">
            Failed to update attendance: {updatingAttendanceError}
          </p>
        </div>
      )}

      {/* Attendance Records */}
      {selectedSessionId &&
        !loadingAttendance &&
        attendanceRecords.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">
              Attendance Records
            </h2>
            {attendanceRecords.map((record) => (
              <div
                key={record.id}
                className="bg-slate-900 p-6 rounded-3xl border border-slate-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Student Name */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                      Student
                    </p>
                    <p className="font-semibold text-white">
                      {record.student_name}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                      Status
                    </p>
                    <FilterSelect
                      value={editingStatus[record.id] ?? record.status}
                      onChange={(e) => handleStatusChange(record.id, e.target.value)}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </FilterSelect>
                  </div>

                  {/* Times */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                      Time
                    </p>
                    <p className="text-sm text-slate-300">
                      {record.joined_at
                        ? new Date(record.joined_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                      {record.left_at &&
                        ` - ${new Date(record.left_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end">
                    <button
                      onClick={() => handleUpdateAttendance(record)}
                      disabled={
                        updatingAttendanceId === record.id ||
                        (!editingStatus[record.id] &&
                          editingNote[record.id] === undefined)
                      }
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-1 rounded-lg text-sm transition-colors"
                    >
                      {updatingAttendanceId === record.id ? (
                        <i className="fas fa-spinner animate-spin"></i>
                      ) : (
                        "Update"
                      )}
                    </button>
                  </div>
                </div>

                {/* Note */}
                <div className="mt-4">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                    Note
                  </p>
                  <textarea
                    value={editingNote[record.id] ?? record.note ?? ""}
                    onChange={(e) =>
                      handleNoteChange(record.id, e.target.value)
                    }
                    placeholder="Add a note..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default TeacherAttendance;
