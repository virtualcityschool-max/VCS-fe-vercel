import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCourses } from "../../store/slices/teacherSlice";
import TeacherGrading from "./TeacherGrading";
import TeacherQuizzes from "./TeacherQuizzes";

const TABS = [
  { id: "assignments", label: "Assignments", icon: "fas fa-clipboard-list" },
  { id: "quizzes",     label: "Quizzes",     icon: "fas fa-question-circle" },
];

const TeacherAssessments = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("assignments");
  const { myCourses } = useSelector((s) => s.teachers);

  // Filter states lifted to parent for unified layout
  const [filters, setFilters] = useState({
    course: "",
    status: "published",
  });

  useEffect(() => {
    if (!myCourses?.length) dispatch(fetchMyCourses());
  }, [dispatch, myCourses?.length]);

  return (
    <div className="text-white space-y-8">
      {/* 1) Main Heading & 2) Subheading */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-poppins">My Assignments</h1>
          <p className="text-slate-400 text-sm mt-1">Manage, review, and grade your students' assessments.</p>
        </div>

        {/* 4) Filters & CTA aligned top-right */}
        <div id="assessment-controls-portal" className="flex flex-wrap items-center gap-3">
          {/* Filters and buttons will be injected here by children or handled here */}
        </div>
      </div>

      {/* 3) Assignment/Quiz tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 -mb-px transition-all duration-200 ${
              activeTab === tab.id
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-white"
            }`}
          >
            <i className={`${tab.icon} text-xs`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "assignments" && (
          <TeacherGrading 
            externalFilters={filters} 
            onFiltersChange={setFilters} 
            hideHeader={true}
            controlsContainerId="assessment-controls-portal"
          />
        )}
        {activeTab === "quizzes" && (
          <TeacherQuizzes 
            externalFilters={filters} 
            onFiltersChange={setFilters} 
            hideHeader={true}
            controlsContainerId="assessment-controls-portal"
          />
        )}
      </div>
    </div>
  );
};

export default TeacherAssessments;
