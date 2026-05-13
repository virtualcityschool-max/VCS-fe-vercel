import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StudentAssignments from "./StudentAssignments";
import StudentQuizList from "./StudentQuizList";
import { FilterSelect } from "../../components/ui";
import axiosInstance from "../../utils/axiosInstance";

const TABS = [
  { id: "assignments", label: "Assignments", icon: "fas fa-clipboard-list" },
  { id: "quizzes",     label: "Quizzes",     icon: "fas fa-question-circle" },
];

const StudentAssessments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabFromUrl === "quizzes" ? "quizzes" : "assignments"
  );

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseId, setCourseId] = useState(searchParams.get("course") || "");

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
      next.set("tab", id);
      return next;
    });
  };

  return (
    <div className="text-white px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-poppins mb-2">Assessments</h1>
          <p className="text-slate-400 text-sm">View and manage all your assignments and quizzes.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {coursesLoading ? (
            <div className="h-10 w-48 bg-slate-800 rounded-xl animate-pulse" />
          ) : (
            <FilterSelect 
              value={courseId} 
              onChange={(e) => setCourseId(e.target.value)} 
              style={{ minWidth: 160 }}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </FilterSelect>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-10 bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800/50 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-[14px] text-sm font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-[1.02]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <i className={`${tab.icon} ${activeTab === tab.id ? "text-white" : "text-indigo-400/70"} text-xs`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — suppress the sub-page header on StudentAssignments */}
      {activeTab === "assignments" && <StudentAssignments hideHeader filterCourse={courseId} />}
      {activeTab === "quizzes"     && <StudentQuizList hideHeader filterCourse={courseId} />}
    </div>
  );
};

export default StudentAssessments;
