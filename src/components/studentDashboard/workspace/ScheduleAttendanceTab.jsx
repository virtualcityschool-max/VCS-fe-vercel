import React from "react";
import { useSelector } from "react-redux";
import { selectEnrolledCourses, selectMyAttendance } from "../../../store/slices/studentDashboardSlice";

const ScheduleAttendanceTab = ({ onRequestLeave }) => {
  const enrolledCourses = useSelector(selectEnrolledCourses) || [];
  const myAttendance = useSelector(selectMyAttendance) || [];

  // Subject attendance breakdown
  const subjectsAttendance = [
    { name: "Mathematics", attended: 24, total: 24, percent: 100, color: "bg-emerald-400" },
    { name: "Physics", attended: 22, total: 24, percent: 92, color: "bg-emerald-400" },
    { name: "Chemistry", attended: 20, total: 22, percent: 91, color: "bg-emerald-400" },
    { name: "English", attended: 18, total: 20, percent: 90, color: "bg-emerald-400" },
    { name: "History", attended: 16, total: 18, percent: 89, color: "bg-emerald-400" },
    { name: "Urdu", attended: 15, total: 18, percent: 83, color: "bg-amber-400" },
    { name: "Islamic Study", attended: 14, total: 14, percent: 100, color: "bg-emerald-400" },
  ];

  // Weekly timetable schedule rows (Monday to Friday)
  const scheduleRows = [
    { day: "Monday", time: "08:00 – 09:30", subject: "Mathematics", tutor: "Dr. A. Vance", room: "Room 204" },
    { day: "Monday", time: "09:45 – 11:15", subject: "Physics", tutor: "Prof. Einstein", room: "Lab 1" },
    { day: "Monday", time: "11:30 – 13:00", subject: "English", tutor: "Ms. Shakespeare", room: "Hall A" },
    { day: "Monday", time: "13:30 – 15:00", subject: "Urdu", tutor: "Mr. Iqbal", room: "Room 105" },

    { day: "Tuesday", time: "08:00 – 09:30", subject: "Chemistry", tutor: "Dr. Curie", room: "Lab 2" },
    { day: "Tuesday", time: "09:45 – 11:15", subject: "History", tutor: "Dr. Brown", room: "Room 302" },
    { day: "Tuesday", time: "11:30 – 13:00", subject: "Islamic Study", tutor: "Prof. Ghazali", room: "Hall B" },
    { day: "Tuesday", time: "13:30 – 15:00", subject: "Pakistan Study", tutor: "Ms. Jinnah", room: "Room 108" },

    { day: "Wednesday", time: "08:00 – 09:30", subject: "Mathematics", tutor: "Dr. A. Vance", room: "Room 204" },
    { day: "Wednesday", time: "09:45 – 11:15", subject: "Physics", tutor: "Prof. Einstein", room: "Lab 1" },
    { day: "Wednesday", time: "11:30 – 13:00", subject: "Chemistry", tutor: "Dr. Curie", room: "Lab 2" },
    { day: "Wednesday", time: "13:30 – 15:00", subject: "English", tutor: "Ms. Shakespeare", room: "Hall A" },

    { day: "Thursday", time: "08:00 – 09:30", subject: "Urdu", tutor: "Mr. Iqbal", room: "Room 105" },
    { day: "Thursday", time: "09:45 – 11:15", subject: "History", tutor: "Dr. Brown", room: "Room 302" },
    { day: "Thursday", time: "11:30 – 13:00", subject: "Pakistan Study", tutor: "Ms. Jinnah", room: "Room 108" },
    { day: "Thursday", time: "13:30 – 15:00", subject: "Islamic Study", tutor: "Prof. Ghazali", room: "Hall B" },

    { day: "Friday", time: "08:00 – 09:30", subject: "Mathematics", tutor: "Dr. A. Vance", room: "Room 204" },
    { day: "Friday", time: "09:45 – 11:15", subject: "Physics", tutor: "Prof. Einstein", room: "Lab 1" },
    { day: "Friday", time: "11:30 – 13:00", subject: "Chemistry", tutor: "Dr. Curie", room: "Lab 2" },
    { day: "Friday", time: "14:00 – 15:30", subject: "English", tutor: "Ms. Shakespeare", room: "Hall A" },
  ];

  const upcomingExams = [
    {
      date: "DEC 15, 2025",
      title: "Mathematics Midterm",
      format: "Written Exam • 2 Hours",
      border: "border-l-indigo-500",
    },
    {
      date: "JAN 10, 2026",
      title: "Physics Final Project Defense",
      format: "Presentation • 30 Mins",
      border: "border-l-blue-500",
    },
    {
      date: "JAN 25, 2026",
      title: "Islamic Study Oral",
      format: "Recitation • 15 Mins",
      border: "border-l-emerald-500",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top 2 Columns: Attendance Overview & Weekly Class Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Attendance Overview */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <i className="fas fa-user-check text-indigo-400 text-sm" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Attendance Overview
            </h3>
          </div>

          {/* Circular Gauge */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  strokeDasharray="92, 100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white font-poppins leading-none">
                  92%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Overall
                </span>
              </div>
            </div>
          </div>

          {/* Subject Breakdown list */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Subject Breakdown
            </h4>
            <div className="space-y-3">
              {subjectsAttendance.map((sub, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{sub.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {sub.attended}/{sub.total} &nbsp;|&nbsp;{" "}
                      <strong className="text-white">{sub.percent}%</strong>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${sub.color} rounded-full`}
                      style={{ width: `${sub.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Absence Alert & Request Leave */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2.5">
            <div className="flex items-start gap-2 text-xs text-red-300">
              <i className="fas fa-exclamation-triangle mt-0.5 text-red-400 shrink-0" />
              <span>You have 1 unexplained absence(s).</span>
            </div>
            <button
              onClick={onRequestLeave}
              className="w-full py-2 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-file-medical text-xs" />
              Request Leave
            </button>
          </div>
        </div>

        {/* Right Column: Weekly Class Schedule Table */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <i className="fas fa-calendar-alt text-indigo-400 text-sm" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Weekly Class Schedule
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
              Term Timetable
            </span>
          </div>

          <div className="overflow-x-auto max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md">
                <tr className="border-b border-white/10 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Subject & Tutor</th>
                  <th className="py-2.5 px-3 text-right">Room / Lab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scheduleRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-3 font-bold text-indigo-400">{row.day}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{row.subject}</span>
                      <span className="text-[10px] text-slate-400">{row.tutor}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300">
                        {row.room}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Strip: Upcoming Major Exams */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <i className="fas fa-graduation-cap text-indigo-400 text-sm" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Upcoming Major Exams
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingExams.map((exam, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl bg-white/[0.02] border border-white/5 border-l-4 ${exam.border} shadow-sm space-y-1.5`}
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {exam.date}
              </span>
              <h4 className="text-sm font-bold text-white leading-tight">
                {exam.title}
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                {exam.format}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleAttendanceTab;
