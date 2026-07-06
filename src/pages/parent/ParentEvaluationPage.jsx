import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParentDashboard } from "../../store/slices/parentSlice";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import EvaluationMatrix from "../../components/common/EvaluationMatrix";
import { FilterSelect } from "../../components/ui";
import { getDisplayName } from "../../utils/userDisplay";

const ParentEvaluationPage = () => {
  const dispatch = useDispatch();
  const { data: dashboardData, loading: dashLoading } = useSelector((s) => s.parent.dashboard);
  const children = dashboardData?.children ?? [];

  const [childId, setChildId]                       = useState("");
  const [allResults, setAllResults]                 = useState([]);
  const [selectedCourseId, setSelectedCourseId]     = useState("");
  const [loading, setLoading]                       = useState(false);

  useEffect(() => {
    if (!dashboardData) dispatch(fetchParentDashboard());
  }, [dispatch]);

  // Auto-select first child once dashboard loads
  useEffect(() => {
    if (children.length && !childId) {
      setChildId(String(children[0].id));
    }
  }, [children]);

  // Fetch evaluations whenever selected child changes
  useEffect(() => {
    if (!childId) return;
    setAllResults([]);
    setSelectedCourseId("");
    const load = async () => {
      setLoading(true);
      try {
        const data = await coursesService.getMyEvaluations({ student_id: childId });
        const results = data?.results || [];
        setAllResults(results);
        if (results.length > 0) setSelectedCourseId(String(results[0].course.id));
      } catch {
        toastManager.error("Failed to load evaluations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [childId]);

  const courses = allResults.map((r) => r.course);
  const selectedResult = allResults.find((r) => String(r.course.id) === selectedCourseId);
  const students = selectedResult?.students || [];
  const courseStatus = selectedResult?.course?.status;
  const activeChild = children.find((c) => String(c.id) === childId);

  const isLoading = dashLoading || loading;

  return (
    <div className="text-white px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-poppins">Child Evaluations</h1>
          <p className="text-slate-400 text-sm mt-1">View your child's assignment scores and final grades.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Child Account</span>
            {dashLoading ? (
              <div className="h-10 bg-slate-800 rounded-xl animate-pulse w-[220px]" />
            ) : (
              <FilterSelect
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                style={{ width: 220 }}
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getDisplayName(c) || c.name}
                  </option>
                ))}
              </FilterSelect>
            )}
          </div>
        </div>
      </div>

      {activeChild && (
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold shrink-0">Courses</span>
          {/* Course Tabs - Premium Segmented Control */}
          <div className="flex items-center p-1 bg-slate-900/80 rounded-2xl border border-white/5 shadow-2xl overflow-x-auto custom-scrollbar max-w-full pb-2">
            {courses.length > 0 ? (
              courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseId(String(c.id))}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 whitespace-nowrap active:scale-95 shrink-0 ${
                    String(selectedCourseId) === String(c.id)
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/40"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <i className={`fas fa-graduation-cap text-[11px] transition-opacity ${
                    String(selectedCourseId) === String(c.id) ? "opacity-100" : "opacity-40"
                  }`}></i>
                  <span>{c.title}</span>
                </button>
              ))
            ) : !loading && (
              <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-600 font-bold italic">
                No courses available
              </div>
            )}
          </div>

          {courseStatus && (
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg border shrink-0 ${
              courseStatus === "completed"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            }`}>
              {courseStatus}
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-spinner animate-spin text-indigo-400 text-2xl" />
        </div>
      ) : (
        <EvaluationMatrix students={students} courseStatus={courseStatus} />
      )}
    </div>
  );
};

export default ParentEvaluationPage;
