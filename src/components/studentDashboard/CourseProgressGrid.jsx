import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectEnrolledCourses,
  selectPendingEnrollments,
  selectRejectedEnrollments,
} from "../../store/slices/studentDashboardSlice";
import CourseCard from "../courses/CourseCard";

const CourseProgressGrid = () => {
  const navigate = useNavigate();
  const enrolledCourses = useSelector(selectEnrolledCourses);
  const pendingEnrollments = useSelector(selectPendingEnrollments);
  const rejectedEnrollments = useSelector(selectRejectedEnrollments);
  
  const [activeTab, setActiveTab] = useState("enrolled");
  const [hasDefaulted, setHasDefaulted] = useState(false);

  // Automatically select the most relevant tab on initial load
  React.useEffect(() => {
    if (hasDefaulted) return;

    if (enrolledCourses.length > 0) {
      setActiveTab("enrolled");
      setHasDefaulted(true);
    } else if (pendingEnrollments.length > 0) {
      setActiveTab("pending");
      setHasDefaulted(true);
    } else if (rejectedEnrollments.length > 0) {
      setActiveTab("rejected");
      setHasDefaulted(true);
    }
  }, [enrolledCourses.length, pendingEnrollments.length, rejectedEnrollments.length, hasDefaulted]);

  const tabs = [
    { id: "enrolled", label: "Enrolled", count: enrolledCourses.length },
    { id: "pending", label: "Pending Approvals", count: pendingEnrollments.length },
    { id: "rejected", label: "Rejected", count: rejectedEnrollments.length },
  ];

  return (
    <section>
      {/* Header & Tabs - Optimized for a single-line layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
          <h2 className="text-3xl font-black font-poppins text-white uppercase tracking-tight">
            Courses
          </h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 shrink-0 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                  : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {tab.label}
              </span>
              {tab.count > 0 && (
                <span className={`flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-md text-[9px] font-black ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {activeTab === "enrolled" && (
          <>
            {enrolledCourses.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                mode="enrolled"
                onNavigate={navigate}
              />
            ))}
            
            {/* Explore more card */}
            <div
              onClick={() => navigate("/courses")}
              className="bg-slate-900/20 rounded-[1.25rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-6 group cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 min-h-[180px]"
            >
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-blue-500/20 group-hover:bg-blue-500/10 transition-all duration-500 text-slate-500 group-hover:text-blue-400">
                <i className="fas fa-plus text-xl"></i>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400/80 text-center transition-colors">
                Explore Courses
              </p>
              <p className="text-[10px] text-slate-600 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                Discover new learning paths
              </p>
            </div>
          </>
        )}

        {activeTab === "pending" && (
          <>
            {pendingEnrollments.length > 0 ? (
              pendingEnrollments.map((enrollment, i) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment}
                  index={i}
                  mode="pending"
                  onNavigate={navigate}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-[2.5rem] border border-white/5 border-dashed">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center mb-6 text-slate-600">
                  <i className="fas fa-clock text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-400">No Pending Approvals</h3>
                <p className="text-slate-500 text-sm mt-2">When you enroll in a course, it will appear here for review.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "rejected" && (
          <>
            {rejectedEnrollments.length > 0 ? (
              rejectedEnrollments.map((enrollment, i) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment}
                  index={i}
                  mode="rejected"
                  onNavigate={navigate}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-[2.5rem] border border-white/5 border-dashed">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center mb-6 text-slate-600">
                  <i className="fas fa-times-circle text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-400">No Rejected Enrollments</h3>
                <p className="text-slate-500 text-sm mt-2">Any declined enrollment requests will be listed here.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CourseProgressGrid;
