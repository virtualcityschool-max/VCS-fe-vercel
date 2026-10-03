import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectEnrolledCourses,
  selectMyAttendance,
  selectLiveSchedule,
  joinLiveSession,
} from "../../../store/slices/studentDashboardSlice";
import { useDateFormatters } from "../../../hooks/useDateFormatters";
import TimezoneTag from "../../ui/TimezoneTag";

const ScheduleAttendanceTab = ({ onRequestLeave }) => {
  const dispatch = useDispatch();
  const enrolledCourses = useSelector(selectEnrolledCourses) || [];
  const myAttendance = useSelector(selectMyAttendance) || [];
  const liveSchedule = useSelector(selectLiveSchedule) || [];
  const { timezone, timezoneAbbr, formatTime, formatDate } = useDateFormatters();

  const [scheduleView, setScheduleView] = useState("timetable"); // "timetable" | "sessions"

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

  // Fallback live sessions if API returns empty
  const fallbackLiveSessions = [
    {
      id: "live-1",
      title: "Derivatives & Rate of Change - Live Class",
      course_title: "Cambridge IGCSE Mathematics",
      teacher_name: "Dr. A. Vance",
      scheduled_at: new Date(Date.now() + 15 * 60000).toISOString(),
      status: "live",
      meeting_link: "https://meet.google.com/abc-defg-hij",
      can_join: true,
    },
    {
      id: "live-2",
      title: "Electromagnetism Problem Solving",
      course_title: "IGCSE Physics (0625)",
      teacher_name: "Prof. Einstein",
      scheduled_at: new Date(Date.now() + 120 * 60000).toISOString(),
      status: "scheduled",
      meeting_link: "https://meet.google.com/xyz-uvwx-rst",
      can_join: true,
    },
    {
      id: "live-3",
      title: "Literature Review: Shakespeare & Macbeth",
      course_title: "English Language & Literature",
      teacher_name: "Ms. Shakespeare",
      scheduled_at: new Date(Date.now() + 24 * 3600000).toISOString(),
      status: "scheduled",
      meeting_link: "https://meet.google.com/eng-lit-vcs",
      can_join: false,
    },
  ];

  const displaySessions = liveSchedule.length > 0 ? liveSchedule : fallbackLiveSessions;

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
      {/* Top 2 Columns: Attendance Overview & Weekly Class Schedule / Live Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Attendance Overview */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <i className="fas fa-user-check text-indigo-400 text-sm" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Attendance Standing
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
              Subject Attendance Rates
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
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2.5">
            <div className="flex items-start gap-2 text-xs text-amber-300">
              <i className="fas fa-calendar-times mt-0.5 text-amber-400 shrink-0" />
              <span>Need time off? Submit an advance notice to instructors.</span>
            </div>
            <button
              onClick={onRequestLeave}
              className="w-full py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <i className="fas fa-file-medical text-xs" />
              Request Leave / Absence
            </button>
          </div>
        </div>

        {/* Right Column: Weekly Schedule & Merged Live Sessions */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <i className="fas fa-chalkboard text-indigo-400 text-sm" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Class Schedule &amp; Sessions
              </h3>
            </div>

            {/* View Switcher: Weekly Timetable vs Live Sessions */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setScheduleView("timetable")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  scheduleView === "timetable"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <i className="fas fa-calendar-alt text-[10px]" />
                <span>Weekly Timetable</span>
              </button>
              <button
                type="button"
                onClick={() => setScheduleView("sessions")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  scheduleView === "sessions"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <i className="fas fa-video text-[10px]" />
                <span>Live Sessions ({displaySessions.length})</span>
              </button>
            </div>
          </div>

          {scheduleView === "timetable" ? (
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md">
                  <tr className="border-b border-white/10 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2.5 px-3">Day</th>
                    <th className="py-2.5 px-3">
                      Time <span className="text-indigo-400">({timezoneAbbr})</span>
                    </th>
                    <th className="py-2.5 px-3">Subject &amp; Tutor</th>
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
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                          {row.room}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Merged Live Sessions List (My Sessions) */
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
              {displaySessions.map((session) => {
                const isLive = session.status === "live";
                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLive
                        ? "bg-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-950/40"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isLive ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
                          }`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                          {session.course_title || session.course?.title || "Cambridge Class"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isLive
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                          }`}
                        >
                          {isLive ? "LIVE NOW" : session.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {session.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tutor: {session.teacher_name || session.instructor_name || "Assigned Faculty"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        <i className="far fa-clock mr-1 text-slate-500" />
                        {session.scheduled_at ? formatTime(session.scheduled_at, timezone) : "Upcoming"}{" "}
                        <TimezoneTag /> •{" "}
                        {session.scheduled_at ? formatDate(session.scheduled_at, timezone) : "Today"}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {session.meeting_link ? (
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-blue-900/30"
                        >
                          <i className="fas fa-video text-xs" />
                          <span>Join Meeting</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl bg-white/5 text-slate-500 text-xs font-semibold cursor-not-allowed"
                        >
                          Link Available at Class Time
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Exams Strip */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-graduation-cap text-indigo-400 text-sm" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Upcoming Major Exams &amp; Assessment Defense
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
            Term 1
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingExams.map((exam, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl bg-white/[0.02] border border-white/5 border-l-4 ${exam.border} flex flex-col justify-between space-y-2`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {exam.date}
                </span>
                <h4 className="font-bold text-xs text-white mt-1">{exam.title}</h4>
              </div>
              <p className="text-[11px] text-slate-400">{exam.format}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleAttendanceTab;
