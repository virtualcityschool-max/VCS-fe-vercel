import React, { useEffect, useState } from "react";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import EvaluationMatrix from "../../components/common/EvaluationMatrix";
import { FilterSelect } from "../../components/ui";

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
      <div className="mx-auto space-y-6">

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-poppins text-white">My Evaluations</h1>
            <p className="text-slate-400 text-sm mt-1">View your assignment scores and final grades</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {loading ? (
              <div className="h-10 w-48 bg-slate-800 rounded-xl animate-pulse" />
            ) : (
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
                ) : (
                  <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-600 font-bold italic">
                    No courses available
                  </div>
                )}
              </div>
            )}
          </div>
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
