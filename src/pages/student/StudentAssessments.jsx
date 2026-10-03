import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StudentAssignments from "./StudentAssignments";
import StudentQuizList from "./StudentQuizList";
import StudentEvaluationPage from "./StudentEvaluationPage";
import { FilterSelect } from "../../components/ui";
import axiosInstance from "../../utils/axiosInstance";

const TABS = [
  { id: "assignments", label: "Assignments", icon: "fas fa-clipboard-list" },
  { id: "quizzes",     label: "Quizzes",     icon: "fas fa-question-circle" },
  { id: "evaluations", label: "Grading Matrix", icon: "fas fa-chart-bar" },
];

const StudentAssessments = ({ isEmbedded = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subtabFromUrl =
    searchParams.get("subtab") ||
    (searchParams.get("tab") === "quizzes"
      ? "quizzes"
      : searchParams.get("tab") === "evaluations"
      ? "evaluations"
      : "assignments");

  const [activeTab, setActiveTab] = useState(subtabFromUrl);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseId, setCourseId] = useState(searchParams.get("course") || "");

  useEffect(() => {
    if (subtabFromUrl && subtabFromUrl !== activeTab) {
      setActiveTab(subtabFromUrl);
    }
  }, [subtabFromUrl]);

  useEffect(() => {
    setCoursesLoading(true);
    axiosInstance
      .get("/courses/")
      .then((res) => {
        const data = res.data?.results ?? res.data?.data ?? res.data;
        const all = Array.isArray(data) ? data : [];
        const enrolled = all.filter((c) => c.is_enrolled === true);
        setCourses(enrolled);
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (courseId) next.set("course", courseId);
        else next.delete("course");
        return next;
      },
      { replace: true }
    );
  }, [courseId, setSearchParams]);

  const switchTab = (id) => {
    setActiveTab(id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("subtab", id);
      return next;
    });
  };

  return (
    <div className={`${isEmbedded ? "space-y-6" : "p-6 lg:p-12 space-y-6"}`}>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black font-poppins text-white mb-1">
            Assignments &amp; Quizzes
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            View rubrics, submit assignments, attempt online quizzes, and check teacher marks.
          </p>
        </div>

        {activeTab !== "evaluations" && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {coursesLoading ? (
              <div className="h-10 w-44 bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <FilterSelect
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                style={{ minWidth: 160 }}
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </FilterSelect>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchTab(tab.id)}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.01]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <i
              className={`${tab.icon} ${
                activeTab === tab.id ? "text-white" : "text-indigo-400"
              } text-xs`}
            />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "assignments" && (
        <StudentAssignments hideHeader filterCourse={courseId} />
      )}
      {activeTab === "quizzes" && (
        <StudentQuizList hideHeader filterCourse={courseId} />
      )}
      {activeTab === "evaluations" && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-xl">
          <StudentEvaluationPage />
        </div>
      )}
    </div>
  );
};

export default StudentAssessments;
