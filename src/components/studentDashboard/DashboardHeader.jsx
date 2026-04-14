import React from "react";
import { useSelector } from "react-redux";
import {
  selectStudent,
  selectDashboardStats,
} from "../../store/slices/studentDashboardSlice";

const DashboardHeader = () => {
  const student = useSelector(selectStudent);
  const stats = useSelector(selectDashboardStats);

  const formatGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  console.log("📊 Dashboard Header: Student:", student, "Stats:", stats);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-800 p-6 lg:p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-center min-h-[160px] border border-white/10">
      <h1 className="text-xl lg:text-2xl font-bold font-poppins mb-1 line-clamp-2">
        {formatGreeting()}, {student?.username || "Student"}!
      </h1>
      <p className="text-blue-100/80 text-sm line-clamp-2">
        Focus on your goals today at VirtualCitySchool.
      </p>
      {student?.grade_level && (
        <p className="text-blue-200/60 text-xs mt-2">
          Grade Level: {student.grade_level}
        </p>
      )}
    </div>
  );
};

export default DashboardHeader;
