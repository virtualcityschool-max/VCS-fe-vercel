import React, { useEffect, useState } from "react";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import EvaluationMatrix from "../../components/common/EvaluationMatrix";

const StudentEvaluationPage = () => {
  const [allResults, setAllResults]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await coursesService.getMyEvaluations();
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
  }, []);

  const courses = allResults.map((r) => r.course);
  const selectedResult = allResults.find((r) => String(r.course.id) === selectedCourseId);
  const students = selectedResult?.students || [];
  const courseStatus = selectedResult?.course?.status;

  return (
    <div className="min-h-screen text-white p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black font-poppins text-white">My Evaluations</h1>
          <p className="text-slate-400 text-sm mt-1">View your assignment scores and final grades</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">
              Course
            </label>
            {loading ? (
              <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full sm:w-80 px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
              >
                {courses.length === 0 && <option value="">No courses found</option>}
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}
          </div>

          {selectedResult && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <i className="fas fa-graduation-cap text-slate-600" />
              {selectedResult.course.title}
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

        {loading ? (
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

export default StudentEvaluationPage;
