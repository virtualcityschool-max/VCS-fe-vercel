import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import StudentAssignments from "./StudentAssignments";
import StudentQuizList from "./StudentQuizList";

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

  const switchTab = (id) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };

  return (
    <div className="text-white px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-poppins mb-2">Assessments</h1>
        <p className="text-slate-400 text-sm">View and manage all your assignments and quizzes.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-900 p-1 rounded-2xl border border-slate-800 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <i className={`${tab.icon} text-xs`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — suppress the sub-page header on StudentAssignments */}
      {activeTab === "assignments" && <StudentAssignments hideHeader />}
      {activeTab === "quizzes"     && <StudentQuizList />}
    </div>
  );
};

export default StudentAssessments;
