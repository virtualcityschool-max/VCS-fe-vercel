import React, { useEffect, useState } from "react";
import { teacherService } from "../../services/teacherService";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import EvaluationMatrix from "../../components/common/EvaluationMatrix";
import { FilterSelect } from "../../components/ui";

// ── Main page ─────────────────────────────────────────────────────────────────
const TeacherEvaluationPage = () => {
  const [courses, setCourses]               = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [tab, setTab]                       = useState("public");

  const [publicStudents, setPublicStudents] = useState([]);
  const [gradingScale, setGradingScale]     = useState(null);
  const [loadingPublic, setLoadingPublic]   = useState(false);

  const [privateList, setPrivateList]             = useState([]);
  const [selectedPrivateId, setSelectedPrivateId] = useState("");
  const [privateEval, setPrivateEval]             = useState(null);
  const [loadingPrivateList, setLoadingPrivateList] = useState(false);
  const [loadingPrivateEval, setLoadingPrivateEval] = useState(false);

  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingCourses(true);
      try {
        const data = await teacherService.getMyCourses();
        const list = Array.isArray(data) ? data : (data?.results || []);
        setCourses(list);
        if (list.length > 0) setSelectedCourseId(String(list[0].id));
      } catch {
        toastManager.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    setSelectedPrivateId("");
    setPrivateEval(null);
    setPrivateList([]);

    if (tab === "public") fetchPublicEvals();
    else fetchPrivateList();
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) return;
    if (tab === "public" && publicStudents.length === 0) fetchPublicEvals();
    if (tab === "private" && privateList.length === 0) fetchPrivateList();
  }, [tab]);

  const fetchPublicEvals = async () => {
    setLoadingPublic(true);
    try {
      const data = await coursesService.getEvaluations({ course_id: selectedCourseId });
      const results = data?.results || [];
      const students = results
        .flatMap((r) => r.students || [])
        .filter((s) => !s.is_private_enrollment);
      setPublicStudents(students);
      setGradingScale(results[0]?.grading_scale || null);
    } catch {
      toastManager.error("Failed to load evaluations");
      setPublicStudents([]);
    } finally {
      setLoadingPublic(false);
    }
  };

  const fetchPrivateList = async () => {
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
      const data = await coursesService.getEvaluations({
        course_id: selectedCourseId,
        student_id: studentId,
      });
      const results = data?.results || [];
      const students = results.flatMap((r) => r.students || []);
      setPrivateEval(students[0] || null);
    } catch {
      toastManager.error("Failed to load student evaluation");
    } finally {
      setLoadingPrivateEval(false);
    }
  };

  const handleCourseChange = (id) => {
    setSelectedCourseId(id);
    setPublicStudents([]);
    setSelectedPrivateId("");
    setPrivateEval(null);
    setPrivateList([]);
  };

  const selectedCourse = courses.find((c) => String(c.id) === selectedCourseId);
  const courseStatus   = selectedCourse?.status;
  const isCompleted    = courseStatus === "completed";

  return (
    <div className="min-h-screen text-white px-6">
      <div className="mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-poppins text-white">Evaluations</h1>
            <p className="text-slate-400 text-sm mt-1">View student performance and assignment results</p>
          </div>

          <div className="w-full sm:w-64">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">
              Course
            </label>
            {loadingCourses ? (
              <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <FilterSelect
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </FilterSelect>
            )}
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-4">
          {/* <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">
                Enrollment Type
              </label>
              <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setTab("public")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    tab === "public" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <i className="fas fa-users mr-1.5" />Public
                </button>
              </div>
            </div>
          </div> */}

          {/* Private student dropdown */}
          {tab === "private" && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">
                Select Private Student
              </label>
              {loadingPrivateList ? (
                <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
              ) : (
                <select
                  value={selectedPrivateId}
                  onChange={(e) => handlePrivateStudentSelect(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-amber-700/40 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
                >
                  <option value="">
                    {privateList.length === 0 ? "No private students found" : "— Select a student —"}
                  </option>
                  {privateList.map((s) => (
                    <option key={s.enrollment_id} value={s.student_id}>
                      {s.username}{s.email ? ` (${s.email})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedCourse && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <i className="fas fa-graduation-cap text-slate-600" />
              {selectedCourse.title}
              {courseStatus && (
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  courseStatus === "completed"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : courseStatus === "published"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-slate-700 text-slate-400"
                }`}>
                  {courseStatus}
                </span>
              )}
            </p>
          )}
        </div>

        {/* ── PUBLIC TAB ── */}
        {tab === "public" && (
          loadingPublic ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {publicStudents.length > 0 && (
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-slate-400">
                    {publicStudents.length} public enrolled student{publicStudents.length !== 1 ? "s" : ""}
                  </p>
                  {isCompleted && (
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
                  )}
                </div>
              )}
              <EvaluationMatrix students={publicStudents} courseStatus={courseStatus} gradingScale={gradingScale} />
            </>
          )
        )}

        {/* ── PRIVATE TAB ── */}
        {tab === "private" && (
          !selectedPrivateId ? (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-lock text-amber-400 text-xl" />
              </div>
              <p className="text-slate-400 text-sm">Select a private student from the dropdown above</p>
            </div>
          ) : loadingPrivateEval ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : privateEval ? (
            <EvaluationMatrix students={[privateEval]} courseStatus={courseStatus} gradingScale={gradingScale} />
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
              <p className="text-slate-400 text-sm">No evaluation data found for this student</p>
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default TeacherEvaluationPage;
