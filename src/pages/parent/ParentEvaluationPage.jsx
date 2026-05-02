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
    <div className="min-h-screen text-white p-6 lg:p-8">
      <div className="mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black font-poppins text-white">Child Evaluations</h1>
          <p className="text-slate-400 text-sm mt-1">View your child's assignment scores and final grades</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">

            {/* Child selector */}
            <div className="sm:w-52">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">
                Child
              </label>
              {dashLoading ? (
                <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
              ) : (
                <FilterSelect
                  value={childId}
                  onChange={(e) => setChildId(e.target.value)}
                  style={{ width: 200 }}
                >
                  {children.map((c) => <option key={c.id} value={c.id}>{c.username || c.name || `Child ${c.id}`}</option>)}
                </FilterSelect>
              )}
            </div>

            {/* Course selector */}
            <div className="flex-1 min-w-0">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">
                Course
              </label>
              {loading ? (
                <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
              ) : (
                <FilterSelect
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={courses.length === 0}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none disabled:opacity-50"
                >
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </FilterSelect>
              )}
            </div>
          </div>

          {activeChild && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                {(activeChild.username || activeChild.name || "?")[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-400">
                Viewing <span className="text-white font-semibold">{activeChild.username || activeChild.name}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-lg">
                ID #{activeChild.id}
              </span>
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
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <EvaluationMatrix students={students} courseStatus={courseStatus} />
        )}

      </div>
    </div>
  );
};

export default ParentEvaluationPage;
