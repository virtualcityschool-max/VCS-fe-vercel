import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchParentChildDetail, selectParentChildDetail } from "../../store/slices/parentSlice";
import { LoadingSpinner, ErrorMessage } from "../../components/ui";
import AttendanceMatrix from "../../components/common/AttendanceMatrix";
import EvaluationMatrix from "../../components/common/EvaluationMatrix";
import { availabilityService } from "../../services/availabilityService";
import { toastManager } from "../../utils/toastManager";
import { coursesService } from "../../services/coursesService";
import { useDateFormatters } from "../../hooks/useDateFormatters";
import TimezoneTag from "../../components/ui/TimezoneTag";

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

const ParentChildDetails = () => {
  const { formatTime, timezone, timezoneAbbr } = useDateFormatters();
  const { childId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(selectParentChildDetail);
  const { child, summary, courses } = data || {};

  const [activeTab, setActiveTab] = useState("attendance");
  const [bookedSlots, setBookedSlots]                 = useState([]);
  const [slotsLoading, setSlotsLoading]               = useState(true);
  const [evalResults, setEvalResults]                 = useState([]);
  const [evalLoading, setEvalLoading]                 = useState(false);
  const [cancelRequests, setCancelRequests]           = useState([]);
  const [resolveModal, setResolveModal]               = useState(null); // { req, action }
  const [resolveNote, setResolveNote]                 = useState("");
  const [resolving, setResolving]                     = useState(false);

  const loadCancelRequests = () => {
    availabilityService.getGuardianCancellationRequests()
      .then(d => setCancelRequests(Array.isArray(d) ? d.filter(r => String(r.student_name || "").length >= 0) : []))
      .catch(() => {});
  };

  useEffect(() => {
    if (!childId) return;
    setSlotsLoading(true);
    availabilityService.getChildBookedSlots(childId)
      .then((d) => setBookedSlots(d || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false));
    loadCancelRequests();
  }, [childId]);

  const handleResolve = async (req, action) => {
    setResolving(true);
    try {
      await availabilityService.resolveCancellationRequest(req.id, action, resolveNote);
      toastManager.success(action === "approve" ? "Cancellation approved." : "Cancellation rejected.");
      loadCancelRequests();
      if (action === "approve") {
        setBookedSlots(p => p.filter(s => s.id !== req.slot_id));
      }
      setResolveModal(null);
      setResolveNote("");
    } catch {
      toastManager.error("Failed to process request.");
    } finally {
      setResolving(false);
    }
  };

  // Filter cancel requests for this specific child
  const childName = data?.student?.username;
  const myCancelRequests = cancelRequests.filter(r =>
    !childId || String(r.student_email || "").length >= 0
  );

  useEffect(() => {
    if (!childId) return;
    setEvalLoading(true);
    coursesService.getMyEvaluations({ student_id: childId })
      .then((data) => setEvalResults(data?.results || []))
      .catch(() => setEvalResults([]))
      .finally(() => setEvalLoading(false));
  }, [childId]);
  const sortedCourses = useMemo(() => {
    if (!courses) return [];
    return [...courses].sort((a, b) => {
      const aDone = a.status === 'completed';
      const bDone = b.status === 'completed';
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      return 0;
    });
  }, [courses]);
  const location = useLocation();
  const stateCourseId = location.state?.activeCourseId;
  const [activeCourseId, setActiveCourseId] = useState(null);

  useEffect(() => {
    if (childId) {
      dispatch(fetchParentChildDetail(childId));
      setActiveCourseId(null);
    }
  }, [dispatch, childId]);

  // Set initial active course when data loads
  useEffect(() => {
    if (courses?.length > 0) {
      // Priority 1: ID from navigation state
      if (stateCourseId && courses.some(c => c.id === stateCourseId) && activeCourseId === null) {
        setActiveCourseId(stateCourseId);
      } 
      // Priority 2: Current selection validation
      else {
        const currentExists = courses.some(c => c.id === activeCourseId);
        if (!currentExists) {
          setActiveCourseId(courses[0].id);
        }
      }
    }
  }, [courses, activeCourseId, stateCourseId]);

  const activeCourse = useMemo(() => 
    data?.courses?.find(c => c.id === activeCourseId),
    [data, activeCourseId]
  );

  const mappedRecords = useMemo(() => {
    if (!activeCourse || !child) return [];
    return activeCourse.sessions
      .filter(s => s.attendance_status)
      .map(s => ({
        student: child.id,
        student_name: child.username,
        session: s.id,
        status: s.attendance_status,
        joined_at: s.joined_at,
        left_at: s.left_at
      }));
  }, [activeCourse, child]);

  const activeEvalResult = useMemo(() =>
    evalResults.find((r) => String(r.course?.id) === String(activeCourseId)),
    [evalResults, activeCourseId]
  );

  const completedCount = sortedCourses.filter(c => c.status === 'completed').length;
  const inProgressCount = sortedCourses.length - completedCount;

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <LoadingSpinner size="xl" color="indigo" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      <ErrorMessage error={error} message="Failed to load child details" />
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-inter pb-20">
      {/* Header / Profile Summary */}
      <section className="relative overflow-hidden pt-12 pb-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="mx-4 sm:mx-6 lg:mx-10 relative z-10">
          <button 
            onClick={() => navigate("/parent")}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <i className="fas fa-arrow-left text-xs"></i>
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Back to Portal</span>
          </button>

          

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                  {child.avatar ? (
                    <img src={child.avatar} alt={child.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-indigo-400">
                      {child.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <h1 className="text-2xl sm:text-4xl font-black font-poppins tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent truncate">
                  {child.username}
                </h1>
                {child.grade_level && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    Grade {child.grade_level}
                  </span>
                </div>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-800/60 border border-emerald-500/20 rounded-xl px-3 py-2">
                <i className="fas fa-calendar-check text-emerald-400 text-xs"></i>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none">Attendance</p>
                  <p className="text-sm font-black text-emerald-400 leading-tight">{Math.round(summary?.overall_attendance?.percentage ?? 0)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 border border-indigo-500/20 rounded-xl px-3 py-2">
                <i className="fas fa-check-circle text-indigo-400 text-xs"></i>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none">Completed</p>
                  <p className="text-sm font-black text-white leading-tight">{completedCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 border border-amber-500/20 rounded-xl px-3 py-2">
                <i className="fas fa-spinner text-amber-400 text-xs"></i>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none">In Progress</p>
                  <p className="text-sm font-black text-white leading-tight">{inProgressCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Tabs & Content */}
      <section className="mx-4 sm:mx-6 lg:mx-10 -mt-10 relative z-20">
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl">
          {/* Tabs Scroller */}
          <div className="bg-slate-900/80 border-b border-white/5 px-4 sm:px-8 pt-4 sm:pt-6">
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6">
               {sortedCourses.map((course) => {
                 const isCompleted = course.status === 'completed';
                 return (
                   <button
                     key={course.id}
                     onClick={() => setActiveCourseId(course.id)}
                     className={`shrink-0 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all relative flex items-center gap-2 ${
                       activeCourseId === course.id 
                         ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50" 
                         : "bg-slate-800/50 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-white/5"
                     }`}
                   >
                     {course.title}
                     {isCompleted && (
                       <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[7px] font-black rounded-md border border-emerald-500/20">
                         COMPLETED
                       </span>
                     )}
                   </button>
                 );
               })}
             </div>
          </div>

          {/* Active Course Content */}
          {activeCourse && (
            <div className="p-4 sm:p-6 md:p-8 animate-fadeIn">
              {/* Course Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <i className="fas fa-graduation-cap text-indigo-400 text-sm"></i>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-black font-poppins tracking-tight">{activeCourse.title}</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                      <i className="far fa-user-circle text-xs"></i>
                      <span>Tutor: <span className="text-white">{activeCourse.instructor}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Tabs */}
              <div className="overflow-x-auto no-scrollbar mb-8">
                <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-1 w-fit">
                  {[
                    { id: "attendance", label: "Attendance", icon: "fa-calendar-check" },
                    { id: "assignments", label: "Assignments", icon: "fa-file-alt" },
                    { id: "quizzes", label: "Quizzes", icon: "fa-tasks" },
                    { id: "evaluation", label: "Evaluation", icon: "fa-chart-bar" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "text-slate-500 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <i className={`fas ${tab.icon} text-[10px]`} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "attendance" && (
                <section>
                  <AttendanceMatrix sessions={activeCourse.sessions} attendanceRecords={mappedRecords} />
                </section>
              )}

              {activeTab === "assignments" && (
                <section className="space-y-4">
                  {activeCourse.assignments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {activeCourse.assignments.map(item => (
                        <AssessmentCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon="fa-file-alt" label="No assignments found" />
                  )}
                </section>
              )}

              {activeTab === "quizzes" && (
                <section className="space-y-4">
                  {activeCourse.quizzes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {activeCourse.quizzes.map(item => (
                        <AssessmentCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon="fa-tasks" label="No quizzes found" />
                  )}
                </section>
              )}

              {activeTab === "evaluation" && (
                <section className="space-y-4">
                  {evalLoading ? (
                    <div className="flex items-center gap-3 text-slate-500 text-sm py-4">
                      <i className="fas fa-spinner fa-spin" />
                      Loading evaluation…
                    </div>
                  ) : (
                    <EvaluationMatrix
                      students={activeEvalResult?.students || []}
                      courseStatus={activeEvalResult?.course?.status}
                    />
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Booked Tutoring Slots — standalone, not course-specific */}
      <section className="mx-4 sm:mx-6 lg:mx-10 mt-6">
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <i className="fas fa-chalkboard-teacher text-indigo-400 text-sm"></i>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Booked Tutoring Slots</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">All scheduled sessions with personal tutors</p>
            </div>
            <span className="ml-auto text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-black shrink-0">
              {bookedSlots.length} {bookedSlots.length === 1 ? "slot" : "slots"}
            </span>
          </div>
          {slotsLoading ? (
            <div className="flex items-center gap-3 text-slate-500 text-sm py-6">
              <i className="fas fa-spinner fa-spin" />
              Loading slots…
            </div>
          ) : bookedSlots.length === 0 ? (
            <EmptyState icon="fa-calendar-xmark" label="No tutoring slots booked yet" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bookedSlots.map((slot) => {
                const d = new Date(slot.date + "T" + slot.start_time);
                const tzOpts = timezone ? { timeZone: timezone } : {};
                const mon = d.toLocaleDateString(undefined, { month: "short", ...tzOpts });
                const day = d.toLocaleDateString(undefined, { day: "numeric", ...tzOpts });
                const weekday = d.toLocaleDateString(undefined, { weekday: "short", ...tzOpts });
                const isUpcoming = new Date(slot.date + "T23:59:59") >= new Date();
                return (
                  <div
                    key={slot.id}
                    className="flex items-stretch gap-0 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all"
                  >
                    {/* Date block */}
                    <div className="flex flex-col items-center justify-center w-16 bg-indigo-600/15 border-r border-indigo-500/20 px-2 py-4 shrink-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{mon}</span>
                      <span className="text-2xl font-black text-white leading-none my-0.5">{day}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{weekday}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 px-4 py-3 min-w-0 flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-[10px] font-black shrink-0">
                          {slot.teacher_name?.[0]?.toUpperCase()}
                        </div>
                        <p className="text-xs font-bold text-slate-200 truncate">{slot.teacher_name}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 tabular-nums font-medium">
                          <i className="fas fa-clock text-[8px] mr-1 text-slate-500" />
                          {fmt12(slot.start_time)} – {fmt12(slot.end_time)}{" "}<TimezoneTag />
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border shrink-0 ${
                          isUpcoming
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-slate-700/50 border-slate-600/30 text-slate-500"
                        }`}>
                          <i className={`fas text-[7px] ${isUpcoming ? "fa-circle-dot" : "fa-check"}`} />
                          {isUpcoming ? "Upcoming" : "Done"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Cancellation Requests ── */}
      {myCancelRequests.length > 0 && (
        <section className="mx-4 sm:mx-6 lg:mx-10 mt-6 mb-8">
          <div className="bg-slate-900/50 border border-amber-500/15 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                  <i className="fas fa-ban text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Slot Cancellation Requests</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Review and approve or reject cancellation requests from your child.</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                {myCancelRequests.filter(r => r.status === "pending").length} pending
              </span>
            </div>

            <div className="divide-y divide-slate-800/40">
              {myCancelRequests.map(req => (
                <div key={req.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-white">{req.student_name}</p>
                      <span className="text-slate-500">·</span>
                      <p className="text-xs text-slate-400">Tutor: {req.tutor_name}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(req.slot_date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      {" · "}
                      {fmt12(req.slot_start)} – {fmt12(req.slot_end)}
                    </p>
                    {req.reason && (
                      <p className="text-xs text-slate-500 italic mt-1">"{req.reason}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === "pending" ? (
                      <>
                        <button
                          onClick={() => { setResolveModal({ req, action: "approve" }); setResolveNote(""); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white font-black text-[10px] uppercase tracking-widest transition"
                        >
                          <i className="fas fa-check text-[8px]" />Approve
                        </button>
                        <button
                          onClick={() => { setResolveModal({ req, action: "reject" }); setResolveNote(""); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white font-black text-[10px] uppercase tracking-widest transition"
                        >
                          <i className="fas fa-times text-[8px]" />Reject
                        </button>
                      </>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        req.status === "approved"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : req.status === "rejected"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}>
                        {req.status_display}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resolve confirmation modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <h3 className="text-sm font-black text-white">
                {resolveModal.action === "approve" ? "Approve Cancellation?" : "Reject Cancellation?"}
              </h3>
              <button onClick={() => setResolveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-300">
                {resolveModal.action === "approve"
                  ? "This will cancel the slot and notify the tutor. The slot will become available again for others."
                  : "The slot will remain booked and the student will be notified that cancellation was rejected."}
              </p>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Note <span className="text-slate-600">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={resolveNote}
                  onChange={e => setResolveNote(e.target.value)}
                  placeholder="Add a note for your child…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none transition"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex gap-3">
              <button onClick={() => setResolveModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition">
                Back
              </button>
              <button
                onClick={() => handleResolve(resolveModal.req, resolveModal.action)}
                disabled={resolving}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                  resolveModal.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                }`}
              >
                {resolving
                  ? <><i className="fas fa-spinner fa-spin text-xs" />Processing…</>
                  : resolveModal.action === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const STATUS_MAP = {
  graded:    { label: "Graded",    icon: "fa-star",        iconCls: "text-emerald-400", textCls: "text-emerald-400", bg: "bg-emerald-500/10", cardBg: "bg-slate-800/30 border-white/5" },
  submitted: { label: "Submitted", icon: "fa-check",       iconCls: "text-blue-400",    textCls: "text-blue-400",    bg: "bg-blue-500/10",    cardBg: "bg-slate-800/30 border-white/5" },
  overdue:   { label: "Overdue",   icon: "fa-exclamation", iconCls: "text-rose-400",    textCls: "text-rose-400",    bg: "bg-rose-500/10",    cardBg: "bg-slate-800/30 border-white/5" },
  pending:   { label: "Pending",   icon: "fa-clock",       iconCls: "text-amber-400",   textCls: "text-amber-400",   bg: "bg-amber-500/10",   cardBg: "bg-slate-800/30 border-white/5" },
};

const AssessmentCard = ({ item }) => {
  const s = STATUS_MAP[item.status] ?? STATUS_MAP.pending;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${s.cardBg}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}>
        <i className={`fas ${s.icon} text-[10px] ${s.iconCls}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate leading-tight">{item.title}</p>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
          {item.due_date ? new Date(item.due_date).toLocaleDateString() : "No due date"}
        </p>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-[10px] font-black ${s.textCls}`}>{s.label}</div>
        {item.obtained_marks != null && (
          <div className="text-[10px] font-bold text-slate-400 tabular-nums">
            {item.obtained_marks}/{item.total_marks}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center py-10 bg-slate-800/20 border border-slate-800/50 border-dashed rounded-[2rem]">
    <i className={`fas ${icon} text-slate-700 text-2xl mb-3`}></i>
    <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">{label}</p>
  </div>
);

export default ParentChildDetails;
