import React, { useState } from "react";
import { useDateFormatters } from "../../../hooks/useDateFormatters";

const WeeklyPlannerTab = ({ onOpenLiveSchedule }) => {
  const { timezoneAbbr } = useDateFormatters();

  // Determine current day of week (1 = Monday, 5 = Friday)
  const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const initialDay =
    currentDayIndex === 1
      ? "Monday"
      : currentDayIndex === 2
      ? "Tuesday"
      : currentDayIndex === 3
      ? "Wednesday"
      : currentDayIndex === 4
      ? "Thursday"
      : currentDayIndex === 5
      ? "Friday"
      : "Monday";

  const [selectedDay, setSelectedDay] = useState(initialDay);

  // Weekly timetable rows (Monday to Friday)
  const weeklyTimetable = [
    // MONDAY
    { day: "Monday", time: "08:00 – 09:30", subject: "Mathematics", code: "IGCSE 0580", tutor: "Dr. A. Vance", room: "Room 204", topic: "Differential Calculus & Rate of Change" },
    { day: "Monday", time: "09:45 – 11:15", subject: "Physics", code: "IGCSE 0625", tutor: "Prof. Einstein", room: "Lab 1", topic: "Electromagnetism & Induced Currents" },
    { day: "Monday", time: "11:30 – 13:00", subject: "English", code: "Literature 0475", tutor: "Ms. Shakespeare", room: "Hall A", topic: "Macbeth: Analysis of Act III Scene II" },
    { day: "Monday", time: "13:30 – 15:00", subject: "Urdu", code: "First Lang 3247", tutor: "Mr. Iqbal", room: "Room 105", topic: "Poetry Analysis: Ghalib & Allama Iqbal" },

    // TUESDAY
    { day: "Tuesday", time: "08:00 – 09:30", subject: "Chemistry", code: "IGCSE 0620", tutor: "Dr. Curie", room: "Lab 2", topic: "Organic Chemistry: Functional Groups" },
    { day: "Tuesday", time: "09:45 – 11:15", subject: "History", code: "Cambridge 0470", tutor: "Dr. Brown", room: "Room 302", topic: "World War I & Modern Treaties (1919-1923)" },
    { day: "Tuesday", time: "11:30 – 13:00", subject: "Islamic Study", code: "Islamiyat 2058", tutor: "Prof. Ghazali", room: "Hall B", topic: "The Major Themes of the Quran" },
    { day: "Tuesday", time: "13:30 – 15:00", subject: "Pakistan Study", code: "Pak Studies 2059", tutor: "Ms. Jinnah", room: "Room 108", topic: "Decline of Mughal Empire & 1857 War" },

    // WEDNESDAY
    { day: "Wednesday", time: "08:00 – 09:30", subject: "Mathematics", code: "IGCSE 0580", tutor: "Dr. A. Vance", room: "Room 204", topic: "Trigonometric Identities & Sine/Cosine Rules" },
    { day: "Wednesday", time: "09:45 – 11:15", subject: "Physics", code: "IGCSE 0625", tutor: "Prof. Einstein", room: "Lab 1", topic: "Thermal Physics & Gas Laws Demonstration" },
    { day: "Wednesday", time: "11:30 – 13:00", subject: "Chemistry", code: "IGCSE 0620", tutor: "Dr. Curie", room: "Lab 2", topic: "Stoichiometry & Mole Calculations" },
    { day: "Wednesday", time: "13:30 – 15:00", subject: "English", code: "Literature 0475", tutor: "Ms. Shakespeare", room: "Hall A", topic: "Discursive Essay Writing & Argumentation" },

    // THURSDAY
    { day: "Thursday", time: "08:00 – 09:30", subject: "Urdu", code: "First Lang 3247", tutor: "Mr. Iqbal", room: "Room 105", topic: "Formal Letter Writing & Grammar Drill" },
    { day: "Thursday", time: "09:45 – 11:15", subject: "History", code: "Cambridge 0470", tutor: "Dr. Brown", room: "Room 302", topic: "The League of Nations & Collective Security" },
    { day: "Thursday", time: "11:30 – 13:00", subject: "Pakistan Study", code: "Pak Studies 2059", tutor: "Ms. Jinnah", room: "Room 108", topic: "Sir Syed Ahmad Khan & Aligarh Movement" },
    { day: "Thursday", time: "13:30 – 15:00", subject: "Islamic Study", code: "Islamiyat 2058", tutor: "Prof. Ghazali", room: "Hall B", topic: "Life in Makkah: Opposition & Migration" },

    // FRIDAY
    { day: "Friday", time: "08:00 – 09:30", subject: "Mathematics", code: "IGCSE 0580", tutor: "Dr. A. Vance", room: "Room 204", topic: "Vectors and Transformation Geometry" },
    { day: "Friday", time: "09:45 – 11:15", subject: "Physics", code: "IGCSE 0625", tutor: "Prof. Einstein", room: "Lab 1", topic: "Radioactivity & Half-life Problem Solving" },
    { day: "Friday", time: "11:30 – 13:00", subject: "Chemistry", code: "IGCSE 0620", tutor: "Dr. Curie", room: "Lab 2", topic: "Acids, Bases and Salts Laboratory Practical" },
    { day: "Friday", time: "14:00 – 15:30", subject: "English", code: "Literature 0475", tutor: "Ms. Shakespeare", room: "Hall A", topic: "Unseen Poetry Comprehension & Analysis" },
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "All Days"];

  const filteredSchedule =
    selectedDay === "All Days"
      ? weeklyTimetable
      : weeklyTimetable.filter((item) => item.day === selectedDay);

  const upcomingExams = [
    {
      date: "DEC 15, 2025",
      title: "Mathematics Midterm Examination",
      format: "Cambridge Paper 2 & 4 • 2 Hours",
      border: "border-l-indigo-500",
    },
    {
      date: "JAN 10, 2026",
      title: "Physics Practical Defense",
      format: "Lab Investigation • 45 Mins",
      border: "border-l-blue-500",
    },
    {
      date: "JAN 25, 2026",
      title: "Islamic Study Oral Defense",
      format: "Oral Recitation • 15 Mins",
      border: "border-l-emerald-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Weekly Curriculum Planner &amp; Timetable
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold">
              Term 2025–26
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Shows your recurring curriculum framework across Monday to Friday. Times shown in your local timezone ({timezoneAbbr}).
          </p>
        </div>

        {onOpenLiveSchedule && (
          <button
            onClick={onOpenLiveSchedule}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 self-start sm:self-center"
          >
            <i className="fas fa-video text-xs" />
            <span>Join Live Google Meet &rarr;</span>
          </button>
        )}
      </div>

      {/* 2. Day Selector Strip */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => {
          const isSelected = selectedDay === day;
          const isToday =
            (day === "Monday" && currentDayIndex === 1) ||
            (day === "Tuesday" && currentDayIndex === 2) ||
            (day === "Wednesday" && currentDayIndex === 3) ||
            (day === "Thursday" && currentDayIndex === 4) ||
            (day === "Friday" && currentDayIndex === 5);

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase">
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Timetable Grid */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <i className="fas fa-clock text-indigo-400 text-sm" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              {selectedDay === "All Days" ? "Full Week Curriculum Timetable" : `${selectedDay} Timetable`} ({filteredSchedule.length} Periods)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-indigo-300">
            Timezone: {timezoneAbbr}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase font-bold text-slate-400">
                {selectedDay === "All Days" && <th className="py-3 px-3">Day</th>}
                <th className="py-3 px-3">Time Slot</th>
                <th className="py-3 px-3">Subject &amp; Syllabus</th>
                <th className="py-3 px-3">Weekly Curriculum Topic</th>
                <th className="py-3 px-3">Assigned Faculty</th>
                <th className="py-3 px-3 text-right">Classroom / Lab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSchedule.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition">
                  {selectedDay === "All Days" && (
                    <td className="py-3.5 px-3 font-bold text-indigo-400 whitespace-nowrap">
                      {row.day}
                    </td>
                  )}
                  <td className="py-3.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                    {row.time}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-white block">{row.subject}</span>
                    <span className="text-[10px] font-mono text-indigo-400">{row.code}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 text-xs max-w-xs">
                    {row.topic}
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                    <i className="fas fa-chalkboard-teacher text-slate-500 mr-1.5" />
                    {row.tutor}
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                      {row.room}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Upcoming Major Cambridge Exams Strip */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-graduation-cap text-indigo-400 text-sm" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Term 1 Examination Milestones
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
            Cambridge Schedule
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

export default WeeklyPlannerTab;
