import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourses,
  selectCourses,
} from "../../store/slices/adminSlice";
import {
  fetchTeacherSessions,
  fetchAllAttendance,
  updateStudentAttendance,
} from "../../store/slices/teacherSlice";
import AttendanceMatrix from "../../components/common/AttendanceMatrix";
import AttendanceEditModal from "../../components/common/AttendanceEditModal";
import { FilterSelect } from "../../components/ui";
import { toastManager } from "../../utils/toastManager";

const AdminAttendance = () => {
  const dispatch = useDispatch();

  const coursesState = useSelector(selectCourses);
  const {
    sessions, loadingSessions,
    allAttendance, loadingAllAttendance,
    patchingStudentAttendance,
  } = useSelector((s) => s.teachers);

  const courses = coursesState?.data ?? [];

  const [tab,        setTab]        = useState("student");
  const [courseId,   setCourseId]   = useState("");
  const [editRecord, setEditRecord] = useState(null);

  const activeCourseId = courseId || (courses[0] ? String(courses[0].id) : "");

  // Top-level sessions only (no child sessions as separate columns)
  // const parentSessions = useMemo(
  //   () => (sessions || []).filter((s) => s.is_child === false || s.is_child == null),
  //   [sessions]
  // );

  // Overall stats from flat attendance list
  const stats = useMemo(() => {
    const records = allAttendance || [];
    const present = records.filter((r) => r.status === "present").length;
    const absent  = records.filter((r) => r.status === "absent").length;
    const late    = records.filter((r) => r.status === "late").length;
    const total   = records.length;
    return { total, present, absent, late, rate: total ? Math.round(((present + late) / total) * 100) : 0 };
  }, [allAttendance]);

  // Load courses once
  useEffect(() => {
   dispatch(fetchCourses());
  }, [dispatch]);

  // Fetch sessions whenever course changes
  useEffect(() => {
    if (!activeCourseId) return;
    dispatch(fetchTeacherSessions({ course: activeCourseId }));
  }, [activeCourseId, dispatch]);

  // Fetch attendance whenever course OR tab changes
  useEffect(() => {
    if (!activeCourseId) return;
    dispatch(fetchAllAttendance({
      course: activeCourseId,
      participant_role: tab === "teacher" ? "teacher" : "student",
    }));
  }, [activeCourseId, tab, dispatch]);

  const refetchAttendance = () =>
    dispatch(fetchAllAttendance({
      course: activeCourseId,
      participant_role: tab === "teacher" ? "teacher" : "student",
    }));

  const handleEditSave = async (form) => {
    if (!editRecord) return;
    const sessionId = editRecord.session?.id ?? editRecord.session_id ?? editRecord.session;
    const pId       = editRecord.student?.id ?? editRecord.student_id ?? editRecord.student
                   ?? editRecord.teacher?.id ?? editRecord.teacher_id ?? editRecord.teacher;
    if (!sessionId || !pId) { toastManager.error("Missing session or participant info"); return; }
    try {
      await dispatch(updateStudentAttendance({ sessionId, studentId: pId, data: { status: form.status, note: form.note } })).unwrap();
      toastManager.success("Attendance updated");
      setEditRecord(null);
      refetchAttendance();
    } catch {
      toastManager.error("Failed to update attendance");
    }
  };

  const isLoading = loadingSessions || loadingAllAttendance;

  return (
    <div className="text-white space-y-6">
      {/* <div>
        <h1 className="text-2xl font-black font-poppins">Attendance</h1>
        <p className="text-slate-400 text-sm mt-1">Session-wise attendance matrix for all courses.</p>
      </div> */}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {[
          { id: "student", label: "Student Attendance", icon: "fa-user-graduate" },
          { id: "teacher", label: "Teacher Attendance", icon: "fa-chalkboard-teacher" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <i className={`fas ${t.icon} text-xs`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Course filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Course</span>
          <FilterSelect
            value={activeCourseId}
            onChange={(e) => setCourseId(e.target.value)}
            style={{ width: 240 }}
          >
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </FilterSelect>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && (allAttendance || []).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",   value: stats.total,      color: "text-white" },
            { label: "Present", value: stats.present,    color: "text-emerald-400" },
            { label: "Absent",  value: stats.absent,     color: "text-rose-400" },
            { label: "Rate",    value: `${stats.rate}%`, color: stats.rate >= 75 ? "text-emerald-400" : "text-rose-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Matrix */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
        </div>
      ) : (
        <AttendanceMatrix
          sessions={sessions}
          attendanceRecords={allAttendance || []}
          participantRole={tab === "teacher" ? "teacher" : "student"}
          onEditRecord={setEditRecord}
        />
      )}

      <AttendanceEditModal
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleEditSave}
        saving={patchingStudentAttendance}
      />
    </div>
  );
};

export default AdminAttendance;
