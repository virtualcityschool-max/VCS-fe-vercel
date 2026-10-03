import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectLiveSchedule, selectAssignments } from "../../../store/slices/studentDashboardSlice";

const CalendarTab = ({ onOpenSubmitModal }) => {
  const liveSchedule = useSelector(selectLiveSchedule) || [];
  const assignments = useSelector(selectAssignments) || [];

  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // December 2025
  const [selectedDay, setSelectedDay] = useState(1);
  const [eventFilter, setEventFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const daysInMonth = 31;
  const startDayOffset = 0; // Dec 1, 2025 is Monday -> offset for Sunday start = 1

  // Sample schedule items per day
  const dailyLectures = [
    { time: "08:00 – 09:30", subject: "Mathematics", tutor: "Dr. A. Vance", room: "Room 204", link: "https://meet.google.com" },
    { time: "09:45 – 11:15", subject: "Physics", tutor: "Prof. Einstein", room: "Lab 1", link: "https://meet.google.com" },
    { time: "11:30 – 13:00", subject: "English", tutor: "Ms. Shakespeare", room: "Hall A", link: "https://meet.google.com" },
    { time: "13:30 – 15:00", subject: "Urdu", tutor: "Mr. Iqbal", room: "Room 105", link: "https://meet.google.com" },
  ];

  const dailyAssignment = {
    id: 991,
    title: "Calculus Problem Set 4",
    course_title: "Mathematics",
    deadline: "23:59 PM (2025-12-01)",
    status: "pending",
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Top Mini-Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Lectures This Month</span>
            <i className="fas fa-book-open text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">92</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Mon – Fri active sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Assignments Due</span>
            <i className="fas fa-clipboard-check text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">5</p>
          <p className="text-[10px] text-amber-400 mt-0.5">5 pending submission</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Midterms & Exams</span>
            <i className="fas fa-graduation-cap text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">2</p>
          <p className="text-[10px] text-purple-300 mt-0.5">Scheduled in session</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Current View</span>
            <i className="fas fa-calendar-alt text-blue-400" />
          </div>
          <p className="text-base font-black text-white mt-1 truncate">December 2025</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Full Month Grid</p>
        </div>
      </div>

      {/* 2. Interactive Academic Calendar */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        {/* Calendar Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition"
              >
                <i className="fas fa-chevron-left text-xs" />
              </button>
              <button
                onClick={() => setSelectedDay(Math.min(31, selectedDay + 1))}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition"
              >
                <i className="fas fa-chevron-right text-xs" />
              </button>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              December 2025
            </h3>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-bold">
              Term Focus
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl text-xs font-bold">
              {["all", "assignments", "lectures", "exams"].map((f) => (
                <button
                  key={f}
                  onClick={() => setEventFilter(f)}
                  className={`px-3 py-1 rounded-lg uppercase text-[10px] transition cursor-pointer ${
                    eventFilter === f ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative">
              <i className="fas fa-search absolute left-3 top-2.5 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Lectures
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Pending Assignment
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Submitted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Exam / Defense
          </span>
        </div>

        {/* Calendar Grid */}
        <div className="border border-white/5 rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-800/50 border-b border-white/5 text-center py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-white/5 bg-slate-900/50">
            {/* Pad leading days */}
            <div className="h-24 p-2 text-slate-600 text-xs font-mono bg-white/[0.01]">30</div>

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = selectedDay === day;
              const isWeekend = (day + 0) % 7 === 6 || (day + 0) % 7 === 0;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-24 p-1.5 sm:p-2 text-xs flex flex-col justify-between transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/20 border-2 border-indigo-500"
                      : "hover:bg-white/[0.03]"
                  } ${isWeekend ? "bg-white/[0.01]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300"
                      }`}
                    >
                      {day}
                    </span>
                    {!isWeekend && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </div>

                  {!isWeekend && (
                    <div className="space-y-1">
                      <div className="p-1 rounded bg-indigo-500/15 border border-indigo-500/20 text-[9px] font-bold text-indigo-300 truncate">
                        08:00 Math
                      </div>
                      <div className="text-[9px] text-slate-500 font-semibold px-0.5">
                        +3 more
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Selected Day Schedule & Events Panel */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-calendar-day text-indigo-400" />
              Schedule & Events for Day {selectedDay}, December 2025
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              4 Scheduled Lectures • 1 Assignment Due • 0 Major Exams
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-indigo-600/20 text-indigo-300 text-xs font-bold self-start sm:self-auto">
            Dec {selectedDay}, 2025
          </span>
        </div>

        {/* Assignment Due */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <i className="fas fa-exclamation text-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300">
                  Pending
                </span>
                <span className="text-xs font-bold text-slate-300">{dailyAssignment.course_title}</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{dailyAssignment.title}</h4>
              <p className="text-[11px] text-slate-400">Deadline: {dailyAssignment.deadline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onOpenSubmitModal(dailyAssignment)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
            >
              View Rubric & Submit
            </button>
          </div>
        </div>

        {/* Scheduled Lectures with 1-Click Video Call Camera */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Scheduled Lectures (4)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dailyLectures.map((lec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 hover:border-indigo-500/30 transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{lec.time}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-bold">
                      {lec.room}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-white mt-1 group-hover:text-indigo-300 transition">
                    {lec.subject}
                  </h5>
                  <p className="text-xs text-slate-400">{lec.tutor}</p>
                </div>

                <a
                  href={lec.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition shadow-lg shrink-0 cursor-pointer"
                  title="Join Live Class Session"
                >
                  <i className="fas fa-video text-sm" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;
