import React, { useEffect, useState } from "react";
import { teacherService } from "../../services/teacherService";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";

// ── Shared UI ─────────────────────────────────────────────────────────────────
const ResultBadge = ({ result }) => {
  const passed = result === "passed";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
      passed
        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
        : "bg-red-500/15 text-red-400 border-red-500/20"
    }`}>
      <i className={`fas fa-${passed ? "check" : "times"} text-[10px]`} />
      {passed ? "Passed" : "Failed"}
    </span>
  );
};

const ScoreRing = ({ percentage, size = 64 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (percentage / 100) * circ;
  const color = percentage >= 60 ? "#34d399" : percentage >= 40 ? "#fbbf24" : "#f87171";
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill={color} fontSize={size < 56 ? 9 : 11} fontWeight="700"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {Math.round(percentage)}%
      </text>
    </svg>
  );
};

const StudentDetailCard = ({ data, onBack }) => {
  const { student, is_private_enrollment, assignments, quiz_summary, assignment_totals, final_totals } = data;
  const allAssignments = [...(assignments?.public || []), ...(assignments?.private || [])];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
        <button onClick={onBack}
          className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition flex-shrink-0">
          <i className="fas fa-arrow-left text-xs" />
        </button>
        <div className="w-9 h-9 bg-indigo-600/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-400 text-sm font-bold">{student.username.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{student.username}</p>
          <p className="text-slate-400 text-xs truncate">{student.email}</p>
        </div>
        {is_private_enrollment && (
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full">
            Private
          </span>
        )}
        {final_totals?.result && <ResultBadge result={final_totals.result} />}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Final Result</h3>
          <div className="flex items-center gap-5">
            <ScoreRing percentage={final_totals?.percentage || 0} size={72} />
            <div>
              <p className="text-2xl font-black text-white tabular-nums">
                {final_totals?.obtained_marks ?? "—"}
                <span className="text-slate-500 text-base font-semibold">/{final_totals?.total_marks ?? "—"}</span>
              </p>
              <p className="text-slate-400 text-xs mt-1">Total Marks</p>
              {final_totals?.is_override && (
                <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                  <i className="fas fa-pen text-[10px]" />Override applied
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Assignments</p>
              <p className="text-sm font-bold text-white">
                {assignment_totals?.computed_obtained ?? "—"}/{assignment_totals?.computed_total ?? "—"}
              </p>
              <p className="text-xs text-slate-400">{assignment_totals?.computed_percentage?.toFixed(1) ?? 0}%</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Quiz</p>
              <p className="text-sm font-bold text-white">
                {quiz_summary?.total_score ?? "—"}/{quiz_summary?.total_max || "—"}
              </p>
              <p className="text-xs text-slate-400">{quiz_summary?.note || `${quiz_summary?.percentage || 0}%`}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Assignments ({allAssignments.length})
          </h3>
          {allAssignments.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No assignments found.</p>
          ) : (
            allAssignments.map((a) => (
              <div key={a.assignment_id} className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {a.is_graded ? `${a.score} / ${a.max_score} marks` : "Not graded yet"}
                  </p>
                </div>
                {a.is_graded
                  ? <span className="text-sm font-bold text-indigo-400 tabular-nums">{a.score}/{a.max_score}</span>
                  : <span className="text-xs text-slate-500 italic">Pending</span>
                }
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StudentCard = ({ data, onClick }) => {
  const { student, final_totals, assignment_totals } = data;
  return (
    <div onClick={onClick}
      className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 hover:border-slate-600/60 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition group">
      <div className="flex-shrink-0">
        <ScoreRing percentage={final_totals?.percentage || 0} size={52} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold truncate">{student.username}</p>
        <p className="text-slate-400 text-xs truncate">{student.email}</p>
        <p className="text-slate-500 text-xs mt-1">
          {assignment_totals?.computed_obtained ?? "—"}/{assignment_totals?.computed_total ?? "—"} marks
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {final_totals?.result && <ResultBadge result={final_totals.result} />}
        <i className="fas fa-chevron-right text-slate-600 text-xs group-hover:text-slate-400 transition" />
      </div>
    </div>
  );
};

// ── Dropdown helper ───────────────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, children, loading, borderColor = "border-slate-700" }) => (
  <div className="flex-1 min-w-0">
    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">{label}</label>
    {loading ? (
      <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
    ) : (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 bg-slate-800/60 border ${borderColor} rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none`}
      >
        {children}
      </select>
    )}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminEvaluationPage = () => {
  const [teachers, setTeachers]             = useState([]);
  const [courses, setCourses]               = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedCourseId, setSelectedCourseId]   = useState("");
  const [tab, setTab]                       = useState("public");

  // Public tab
  const [publicStudents, setPublicStudents] = useState([]);
  const [loadingPublic, setLoadingPublic]   = useState(false);
  const [selectedPublicStudent, setSelectedPublicStudent] = useState(null);

  // Private tab
  const [privateList, setPrivateList]       = useState([]);
  const [selectedPrivateId, setSelectedPrivateId] = useState("");
  const [privateEval, setPrivateEval]       = useState(null);
  const [loadingPrivateList, setLoadingPrivateList] = useState(false);
  const [loadingPrivateEval, setLoadingPrivateEval] = useState(false);

  const [loadingInit, setLoadingInit]       = useState(true);

  // Load teachers + courses on mount
  useEffect(() => {
    const init = async () => {
      setLoadingInit(true);
      try {
        const [teacherData, courseData] = await Promise.all([
          teacherService.getTeachers(),
          coursesService.getAllCourses(),
        ]);
        const tList = Array.isArray(teacherData) ? teacherData : (teacherData?.results || []);
        const cList = Array.isArray(courseData)  ? courseData  : (courseData?.results  || []);
        setTeachers(tList);
        setCourses(cList);
      } catch {
        toastManager.error("Failed to load teachers/courses");
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, []);

  const resetResults = () => {
    setPublicStudents([]);
    setSelectedPublicStudent(null);
    setPrivateList([]);
    setSelectedPrivateId("");
    setPrivateEval(null);
  };

  const handleSearch = () => {
    resetResults();
    if (tab === "public") fetchPublicEvals();
    else if (selectedCourseId) fetchPrivateList();
  };

  const fetchPublicEvals = async () => {
    setLoadingPublic(true);
    try {
      const params = {};
      if (selectedTeacherId) params.teacher_id = selectedTeacherId;
      if (selectedCourseId)  params.course_id  = selectedCourseId;
      const data = await coursesService.getEvaluations(params);
      const results = data?.results || [];
      const students = results.flatMap((r) => r.students || [])
        .filter((s) => !s.is_private_enrollment);
      setPublicStudents(students);
    } catch {
      toastManager.error("Failed to load evaluations");
      setPublicStudents([]);
    } finally {
      setLoadingPublic(false);
    }
  };

  const fetchPrivateList = async () => {
    if (!selectedCourseId) {
      toastManager.error("Select a course to view private students");
      return;
    }
    setLoadingPrivateList(true);
    setSelectedPrivateId("");
    setPrivateEval(null);
    try {
      const data = await coursesService.getPrivateStudents(selectedCourseId);
      const list = Array.isArray(data) ? data : (data?.results || []);
      setPrivateList(list);
    } catch {
      toastManager.error("Failed to load private students");
      setPrivateList([]);
    } finally {
      setLoadingPrivateList(false);
    }
  };

  const handlePrivateStudentSelect = async (studentId) => {
    setSelectedPrivateId(studentId);
    setPrivateEval(null);
    if (!studentId) return;
    setLoadingPrivateEval(true);
    try {
      const params = { student_id: studentId };
      if (selectedCourseId)  params.course_id  = selectedCourseId;
      if (selectedTeacherId) params.teacher_id  = selectedTeacherId;
      const data = await coursesService.getEvaluations(params);
      const results = data?.results || [];
      const students = results.flatMap((r) => r.students || []);
      setPrivateEval(students[0] || null);
    } catch {
      toastManager.error("Failed to load student evaluation");
    } finally {
      setLoadingPrivateEval(false);
    }
  };

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    resetResults();
  };

  return (
    <div className="min-h-screen text-white p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-black font-poppins text-white">Evaluations</h1>
          <p className="text-slate-400 text-sm mt-1">Review student performance across teachers and courses</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-4">

          {/* Row 1: teacher + course + tab toggle */}
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">

            <SelectField
              label="Teacher (optional)"
              value={selectedTeacherId}
              onChange={setSelectedTeacherId}
              loading={loadingInit}
            >
              <option value="">All Teachers</option>
              {teachers.map((t) => {
                const name = t.username || t.name || t.user?.username || `Teacher #${t.id}`;
                return <option key={t.id} value={t.id}>{name}</option>;
              })}
            </SelectField>

            <SelectField
              label="Course (optional)"
              value={selectedCourseId}
              onChange={setSelectedCourseId}
              loading={loadingInit}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </SelectField>

            {/* Enrollment type toggle */}
            <div className="flex-shrink-0">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">
                Enrollment Type
              </label>
              <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1">
                <button
                  onClick={() => handleTabSwitch("public")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    tab === "public" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <i className="fas fa-users mr-1.5" />Public
                </button>
                <button
                  onClick={() => handleTabSwitch("private")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    tab === "private" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <i className="fas fa-lock mr-1.5" />Private
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: private student dropdown (only on private tab) */}
          {tab === "private" && (
            <SelectField
              label="Select Private Student"
              value={selectedPrivateId}
              onChange={handlePrivateStudentSelect}
              loading={loadingPrivateList}
              borderColor="border-amber-700/40"
            >
              <option value="">
                {privateList.length === 0 ? "Search first to load students" : "— Select a student —"}
              </option>
              {privateList.map((s) => {
                const name  = s.username || s.student?.username || s.name  || `Student #${s.id}`;
                const email = s.email    || s.student?.email    || "";
                return (
                  <option key={s.id} value={s.id}>
                    {name}{email ? ` (${email})` : ""}
                  </option>
                );
              })}
            </SelectField>
          )}

          {/* Search button */}
          <div className="flex justify-end">
            <button
              onClick={handleSearch}
              disabled={loadingPublic || loadingPrivateList}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition active:scale-95 flex items-center gap-2"
            >
              {(loadingPublic || loadingPrivateList) ? (
                <><i className="fas fa-spinner fa-spin text-xs" />Loading…</>
              ) : (
                <><i className="fas fa-search text-xs" />Search</>
              )}
            </button>
          </div>
        </div>

        {/* ── PUBLIC RESULTS ── */}
        {tab === "public" && (
          <>
            {loadingPublic ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : selectedPublicStudent ? (
              <StudentDetailCard data={selectedPublicStudent} onBack={() => setSelectedPublicStudent(null)} />
            ) : publicStudents.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-slate-400">
                    {publicStudents.length} student{publicStudents.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      Passed: {publicStudents.filter((s) => s.final_totals?.result === "passed").length}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                      Failed: {publicStudents.filter((s) => s.final_totals?.result === "failed").length}
                    </span>
                  </div>
                </div>
                {publicStudents.map((s) => (
                  <StudentCard key={s.enrollment_id} data={s} onClick={() => setSelectedPublicStudent(s)} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-search text-slate-500 text-xl" />
                </div>
                <p className="text-slate-400 text-sm">Use the filters above and click Search</p>
              </div>
            )}
          </>
        )}

        {/* ── PRIVATE RESULTS ── */}
        {tab === "private" && (
          <>
            {!selectedPrivateId ? (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-lock text-amber-400 text-xl" />
                </div>
                <p className="text-slate-400 text-sm">
                  {privateList.length === 0
                    ? "Select a course and click Search to load private students"
                    : "Select a private student from the dropdown above"
                  }
                </p>
              </div>
            ) : loadingPrivateEval ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-20 bg-slate-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : privateEval ? (
              <StudentDetailCard
                data={privateEval}
                onBack={() => { setSelectedPrivateId(""); setPrivateEval(null); }}
              />
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
                <p className="text-slate-400 text-sm">No evaluation data found for this student</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default AdminEvaluationPage;
