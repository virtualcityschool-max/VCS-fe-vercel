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
              <FilterSelect
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{ minWidth: 160 }}
              >
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </FilterSelect>
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
