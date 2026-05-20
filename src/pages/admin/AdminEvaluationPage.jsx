import React, { useEffect, useState } from "react";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import EvaluationMatrix from "../../components/common/EvaluationMatrix";
import { FilterSelect } from "../../components/ui";

import { GradingScaleButton } from "../../components/admin/GradingScaleModal";

const AdminEvaluationPage = () => {
  const [courses, setCourses]                       = useState([]);
  const [selectedCourseId, setSelectedCourseId]     = useState("");
  const [loadingInit, setLoadingInit]               = useState(true);
  const [tab, setTab]                               = useState("public");
  const [refreshKey, setRefreshKey]                 = useState(0);

  const [publicStudents, setPublicStudents]         = useState([]);
  const [loadingPublic, setLoadingPublic]           = useState(false);

  const [privateList, setPrivateList]               = useState([]);
  const [selectedPrivateId, setSelectedPrivateId]   = useState("");
  const [privateEval, setPrivateEval]               = useState(null);
  const [loadingPrivateList, setLoadingPrivateList] = useState(false);
  const [loadingPrivateEval, setLoadingPrivateEval] = useState(false);

  // Load courses once
  useEffect(() => {
    const init = async () => {
      setLoadingInit(true);
      try {
        const courseData = await coursesService.getAllCourses();
        const cList = Array.isArray(courseData) ? courseData : (courseData?.results || []);
        setCourses(cList);
      } catch {
        toastManager.error("Failed to load courses");
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, []);

  const resetResults = () => {
    setPublicStudents([]);
    setPrivateList([]);
    setSelectedPrivateId("");
    setPrivateEval(null);
  };

  // Auto-fetch whenever course or tab changes
  useEffect(() => {
    resetResults();
    if (!selectedCourseId) return;
    if (tab === "public") fetchPublicEvals(selectedCourseId);
    else fetchPrivateList(selectedCourseId);
  }, [selectedCourseId, tab]);

  const fetchPublicEvals = async (courseId) => {
    setLoadingPublic(true);
    try {
      const data = await coursesService.getEvaluations({ course_id: courseId });
      const results = data?.results || [];
      const students = results
        .flatMap((r) => r.students || [])
        .filter((s) => !s.is_private_enrollment);
      setPublicStudents(students);
    } catch {
      toastManager.error("Failed to load evaluations");
      setPublicStudents([]);
    } finally {
      setLoadingPublic(false);
    }
  };

  const fetchPrivateList = async (courseId) => {
    setLoadingPrivateList(true);
    setSelectedPrivateId("");
    setPrivateEval(null);
    try {
      const data = await coursesService.getPrivateStudents(courseId);
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
      const params = { student_id: studentId, course_id: selectedCourseId };
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

  const selectedCourse = courses.find((c) => String(c.id) === selectedCourseId);
  const courseStatus   = selectedCourse?.status;
  const isCompleted    = courseStatus === "completed";
  const isLoading      = loadingPublic || loadingPrivateList;

  const handleGradingScaleUpdate = () => {
    setRefreshKey(k => k + 1);
    // Also refetch current data to see updated grades/results from server
    if (!selectedCourseId) return;
    if (tab === "public") fetchPublicEvals(selectedCourseId);
    else if (selectedPrivateId) handlePrivateStudentSelect(selectedPrivateId);
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header Actions (Course & Grading Scale) - Positioned to align with the global header */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap sm:justify-end gap-3 mb-4 mt-2 sm:-mt-20 lg:-mt-24 relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="sm:mb-0.5">
             <GradingScaleButton onUpdated={handleGradingScaleUpdate} />
          </div>

          <div className="w-full sm:w-64">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5 mb-1.5 block tracking-[0.2em]">Course</label>
            {loadingInit ? (
              <div className="h-10 w-full bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <FilterSelect
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full"
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </FilterSelect>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        {/* Course status pill */}
        {selectedCourse && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>Course Status: </span>
            {courseStatus && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                courseStatus === "completed"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : courseStatus === "published"
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-slate-700 text-slate-400"
              }`}>
                {courseStatus}
              </span>
            )}
          </div>
        )}

        {/* Private student dropdown */}
        {tab === "private" && selectedCourseId && (
          <div className="flex flex-col gap-1 w-full sm:max-w-xs">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Student</span>
            {loadingPrivateList ? (
              <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <FilterSelect
                value={selectedPrivateId}
                onChange={(e) => handlePrivateStudentSelect(e.target.value)}
                className="w-full"
              >
                <option value="">
                  {privateList.length === 0 ? "No private students" : "— Select a student —"}
                </option>
                {privateList.map((s) => (
                  <option key={s.enrollment_id} value={s.student_id}>
                    {s.username}{s.email ? ` (${s.email})` : ""}
                  </option>
                ))}
              </FilterSelect>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* ── PUBLIC RESULTS ── */}
        {!isLoading && tab === "public" && (
          publicStudents.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-1">
                {/* <p className="text-sm text-slate-400">
                  {publicStudents.length} student{publicStudents.length !== 1 ? "s" : ""}
                </p> */}
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
              <EvaluationMatrix key={`public-${refreshKey}`} students={publicStudents} courseStatus={courseStatus} />
            </>
          ) : selectedCourseId ? (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-inbox text-slate-500 text-xl" />
              </div>
              <p className="text-slate-400 text-sm">No Data Found</p>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-book text-slate-500 text-xl" />
              </div>
              <p className="text-slate-400 text-sm">Select a course to view evaluations</p>
            </div>
          )
        )}

        {/* ── PRIVATE RESULTS ── */}
        {!isLoading && tab === "private" && (
          !selectedCourseId ? (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-lock text-amber-400 text-xl" />
              </div>
              <p className="text-slate-400 text-sm">Select a course to view private students</p>
            </div>
          ) : !selectedPrivateId ? (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-user-lock text-amber-400 text-xl" />
              </div>
              <p className="text-slate-400 text-sm">
                {privateList.length === 0
                  ? "No private students in this course"
                  : "Select a private student from the dropdown above"
                }
              </p>
            </div>
          ) : loadingPrivateEval ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : privateEval ? (
            <EvaluationMatrix key={`private-${refreshKey}`} students={[privateEval]} courseStatus={courseStatus} />
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

export default AdminEvaluationPage;
