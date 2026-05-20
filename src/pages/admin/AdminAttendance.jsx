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
  const [dateFilter, setDateFilter] = useState("last7");
  const [editRecord, setEditRecord] = useState(null);

  const activeCourseId = courseId || (courses[0] ? String(courses[0].id) : "");

  // Date Filter logic
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
      // all
      return null;
    }
    
    // For all filters except lastMonth, the end is 'now' (effectively)
    if (dateFilter !== "lastMonth") {
      end.setTime(now.getTime());
    }

    return { start, end };
  }, [dateFilter]);

  // Filtered Sessions & Attendance
  const filteredSessions = useMemo(() => {
    const list = sessions || [];
    const now = new Date();
    return list.filter((s) => {
      const d = s.scheduled_at ? new Date(s.scheduled_at) : null;
      if (!d) return false;
      if (d > now) return false; // Don't show future
      if (!dateRange) return true;
      return d >= dateRange.start && d <= dateRange.end;
    });
  }, [sessions, dateRange]);

  const filteredAttendance = useMemo(() => {
    const list = allAttendance || [];
    const sessionIds = new Set(filteredSessions.map((s) => s.id));
    return list.filter((r) => {
      const sId = r.session?.id ?? r.session_id ?? r.session;
      return sessionIds.has(sId);
    });
  }, [allAttendance, filteredSessions]);

  // Overall stats from filtered list
  const stats = useMemo(() => {
    const records = filteredAttendance || [];
    const present = records.filter((r) => r.status === "present").length;
    const absent  = records.filter((r) => r.status === "absent").length;
    const late    = records.filter((r) => r.status === "late").length;
    const total   = records.length;
    return { total, present, absent, late, rate: total ? Math.round(((present + late) / total) * 100) : 0 };
  }, [filteredAttendance]);

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
    <div className="text-white space-y-8">
      {/* Header Actions (Course & Date Filters) - Positioned to align with the global header */}
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
      </div>

      {/* Tabs Row */}
      <div className="flex gap-1 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: "student", label: "Student Attendance", icon: "fa-user-graduate" },
          { id: "teacher", label: "Teacher Attendance", icon: "fa-chalkboard-teacher" },
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

      {/* Stats */}
      {!isLoading && (filteredAttendance || []).length > 0 && (
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
          sessions={filteredSessions}
          attendanceRecords={filteredAttendance || []}
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
