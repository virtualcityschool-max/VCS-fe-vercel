import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { coursesService } from "../../services/coursesService";
import { adminTeacherSessionService } from "../../services/adminTeacherSessionService";

const AdminAttendance = () => {
  const dispatch = useDispatch();

  const coursesState = useSelector(selectCourses);
  const {
    sessions, loadingSessions,
    allAttendance, loadingAllAttendance,
    patchingStudentAttendance,
  } = useSelector((s) => s.teachers);

  const courses = coursesState?.data ?? [];

  const [tab,               setTab]               = useState("student");
  const [courseId,          setCourseId]          = useState("");
  const [dateFilter,        setDateFilter]        = useState("last7");
  const [editRecord,        setEditRecord]        = useState(null);
  const [courseEnrollments, setCourseEnrollments] = useState([]);

  // Admin tab state
  const [adminSessions,           setAdminSessions]           = useState([]);
  const [adminSessionAttendance,  setAdminSessionAttendance]  = useState([]);
  const [adminLoading,            setAdminLoading]            = useState(false);

  const activeCourseId = courseId || (courses[0] ? String(courses[0].id) : "");

  // ── Date range ──────────────────────────────────────────────────────────────
  const dateRange = useMemo(() => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    if (dateFilter === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (dateFilter === "last7") {
      start.setDate(now.getDate() - 7);
    } else if (dateFilter === "last30") {
      start.setDate(now.getDate() - 30);
    } else if (dateFilter === "thisMonth") {
      start.setHours(0, 0, 0, 0);
      start.setDate(1);
    } else if (dateFilter === "lastMonth") {
      start.setMonth(now.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth());
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else {
      return null;
    }

    if (dateFilter !== "lastMonth") end.setTime(now.getTime());
    return { start, end };
  }, [dateFilter]);

  // ── Course-based filtering (student / teacher tabs) ────────────────────────
  const filteredSessions = useMemo(() => {
    const now = new Date();
    return (sessions || []).filter((s) => {
      const d = s.scheduled_at ? new Date(s.scheduled_at) : null;
      if (!d || d > now) return false;
      if (!dateRange) return true;
      return d >= dateRange.start && d <= dateRange.end;
    });
  }, [sessions, dateRange]);

  const filteredAttendance = useMemo(() => {
    const sessionIds = new Set(filteredSessions.map((s) => s.id));
    return (allAttendance || []).filter((r) => {
      const sId = r.session?.id ?? r.session_id ?? r.session;
      return sessionIds.has(sId);
    });
  }, [allAttendance, filteredSessions]);

  const stats = useMemo(() => {
    const records = filteredAttendance;
    const present = records.filter((r) => r.status === "present").length;
    const absent  = records.filter((r) => r.status === "absent").length;
    const late    = records.filter((r) => r.status === "late").length;
    const total   = records.length;
    return { total, present, absent, late, rate: total ? Math.round(((present + late) / total) * 100) : 0 };
  }, [filteredAttendance]);

  // ── Admin tab filtering ────────────────────────────────────────────────────
  const filteredAdminSessions = useMemo(() => {
    const now = new Date();
    return adminSessions.filter((s) => {
      const d = s.scheduled_at ? new Date(s.scheduled_at) : null;
      if (!d || d > now) return false;
      if (!dateRange) return true;
      return d >= dateRange.start && d <= dateRange.end;
    });
  }, [adminSessions, dateRange]);

  const adminMatrixRecords = useMemo(() => {
    const sessionIds = new Set(filteredAdminSessions.map((s) => s.id));
    // The endpoint returns one object per session with the teacher attendance
    // records nested under `attendance` - flatten them into per-participant rows
    // (mirrors the teacher attendance page), otherwise the matrix gets records
    // with no student/session id and renders nothing.
    return adminSessionAttendance
      .filter((item) => sessionIds.has(item.session_id ?? item.session))
      .flatMap((item) => {
        const attList = Array.isArray(item.attendance)
          ? item.attendance
          : item.attendance
            ? [item.attendance]
            : [];
        return attList.map((att) => ({
          student: att.teacher_id,
          session: item.session_id ?? item.session,
          status: att.status,
          joined_at: att.joined_at,
          left_at: att.left_at ?? null,
          teacher_name: att.username,
          student_name: att.username,
          participant_role: "teacher",
        }));
      });
  }, [adminSessionAttendance, filteredAdminSessions]);

  // ── Data fetching ──────────────────────────────────────────────────────────

  // Courses (for student / teacher tabs)
  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Sessions & attendance by course (student / teacher tabs only)
  useEffect(() => {
    if (tab === "admin" || !activeCourseId) return;
    dispatch(fetchTeacherSessions({ course: activeCourseId }));
  }, [activeCourseId, tab, dispatch]);

  useEffect(() => {
    if (!activeCourseId) return;
    coursesService.getCourseEnrollments(activeCourseId)
      .then((data) => setCourseEnrollments(Array.isArray(data) ? data : (data?.results || [])))
      .catch(() => setCourseEnrollments([]));
  }, [activeCourseId]);

  useEffect(() => {
    if (tab === "admin" || !activeCourseId) return;
    dispatch(fetchAllAttendance({
      course: activeCourseId,
      participant_role: tab === "teacher" ? "teacher" : "student",
    }));
  }, [activeCourseId, tab, dispatch]);

  // Admin sessions + attendance (admin tab only, no course param)
  const fetchAdminData = useCallback(async () => {
    setAdminLoading(true);
    try {
      const [sessionsData, attendanceData] = await Promise.all([
        adminTeacherSessionService.getSessions(),
        adminTeacherSessionService.getAllAttendance(),
      ]);
      const sessionsList = Array.isArray(sessionsData)
        ? sessionsData
        : (sessionsData?.results || []);
      setAdminSessions(sessionsList);
      setAdminSessionAttendance(Array.isArray(attendanceData) ? attendanceData : []);
    } catch {
      setAdminSessions([]);
      setAdminSessionAttendance([]);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "admin") fetchAdminData();
  }, [tab, fetchAdminData]);

  // ── Edit handler ───────────────────────────────────────────────────────────
  const refetchCourseAttendance = () =>
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
      if (tab === "admin") fetchAdminData();
      else refetchCourseAttendance();
    } catch {
      toastManager.error("Failed to update attendance");
    }
  };

  const isLoading = loadingSessions || loadingAllAttendance;

  return (
    <div className="text-white space-y-8">
      {/* Header filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap sm:justify-end gap-3 mb-4 mt-2 sm:-mt-20 lg:-mt-24 relative z-20">
        <div className="w-full sm:w-48">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5 mb-1.5 block uppercase tracking-[0.2em]">Date Range</label>
          <FilterSelect
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full"
          >
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="all">All Time</option>
          </FilterSelect>
        </div>

        {tab !== "admin" && (
          <div className="w-full sm:w-64">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5 mb-1.5 block uppercase tracking-[0.2em]">Course</label>
            <FilterSelect
              value={activeCourseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full"
            >
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </FilterSelect>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: "student", label: "Student Attendance",       icon: "fa-user-graduate" },
          { id: "teacher", label: "Tutor Attendance",         icon: "fa-chalkboard-teacher" },
          { id: "admin",   label: "Admin Session Attendance", icon: "fa-shield-alt" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 -mb-px transition-all duration-200 whitespace-nowrap shrink-0 ${
              tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-white"
            }`}
          >
            <i className={`fas ${t.icon} text-xs`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats - student / teacher tabs */}
      {tab !== "admin" && !isLoading && filteredAttendance.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total",   value: stats.total,   color: "text-white" },
            { label: "Present", value: stats.present, color: "text-emerald-400" },
            { label: "Absent",  value: stats.absent,  color: "text-rose-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Matrix - student / teacher tabs */}
      {tab !== "admin" && (
        isLoading ? (
          <div className="flex items-center justify-center py-20">
            <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
          </div>
        ) : (
          <AttendanceMatrix
            sessions={filteredSessions}
            attendanceRecords={filteredAttendance}
            enrolledStudents={tab === "student" ? courseEnrollments : []}
            participantRole={tab === "teacher" ? "teacher" : "student"}
            onEditRecord={setEditRecord}
          />
        )
      )}

      {/* Matrix - admin sessions tab */}
      {tab === "admin" && (
        adminLoading ? (
          <div className="flex items-center justify-center py-20">
            <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
          </div>
        ) : (
          <AttendanceMatrix
            sessions={filteredAdminSessions}
            attendanceRecords={adminMatrixRecords}
            enrolledStudents={[]}
            participantRole="teacher"
            onEditRecord={setEditRecord}
          />
        )
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
