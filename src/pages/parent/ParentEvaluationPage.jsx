import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParentDashboard } from "../../store/slices/parentSlice";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import EvaluationMatrix from "../../components/common/EvaluationMatrix";
import { FilterSelect } from "../../components/ui";

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
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Child</span>
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
                    {`${c.username || c.name} (ID: ${c.id})`}
                  </option>
                ))}
              </FilterSelect>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-0.5">Course</span>
            {loading ? (
              <div className="h-10 bg-slate-800 rounded-xl animate-pulse w-[240px]" />
            ) : (
              <FilterSelect
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={courses.length === 0}
                style={{ width: 240 }}
              >
                {courses.length === 0
                  ? <option value="">No courses available</option>
                  : courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)
                }
              </FilterSelect>
            )}
          </div>
        </div>
      </div>

      {activeChild && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
              {(activeChild.username || "?")[0].toUpperCase()}
            </div>
            <span className="text-sm text-slate-400">
              Viewing <span className="text-white font-semibold">{activeChild.username || activeChild.name}</span>
            </span>
          </div>
          {courseStatus && (
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              courseStatus === "completed"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
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
