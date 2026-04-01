import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeacherDashboard,
  fetchMyCourses,
  fetchAssignments,
} from "../../store/slices/teacherSlice";

const TeacherPortal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { dashboard, myCourses, assignments, loading, error } = useSelector(
    (state) => state.teachers,
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTeacherDashboard());
    dispatch(fetchMyCourses());
    dispatch(fetchAssignments());
  }, [dispatch]);

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <i className="fas fa-spinner animate-spin text-2xl"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <section
      id="teacher-view"
      className="min-h-screen bg-slate-950 text-white flex"
    >
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 z-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-xs">
            V
          </div>
          <span className="text-[10px] sm:text-sm font-black tracking-tighter whitespace-nowrap">
            VirtualCitySchool
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-slate-400 hover:text-white transition"
        >
          <i
            className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"} text-xl`}
          ></i>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-72 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-10">
          <div
            className="flex items-center gap-3 mb-16 cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">
              V
            </div>
            <span className="text-lg font-black tracking-tighter whitespace-nowrap">
              VirtualCitySchool
            </span>
          </div>
          <nav className="space-y-2">
            {[
              "Dashboard",
              "My Classes",
              "Attendance",
              "Grading",
              "AI Assistant",
            ].map((item) => (
              <button
                key={item}
                className="w-full text-left px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white transition"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-linear-to-br from-indigo-600 to-indigo-800 p-8 sm:p-10 rounded-5xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black font-poppins mb-2 text-white">
                Welcome, {dashboard?.teacher?.username || "Instructor"}!
              </h2>
              <p className="text-indigo-100 text-sm sm:text-base font-medium">
                You have {dashboard?.upcoming_sessions_count || 0} Live Sessions.
              </p>
            </div>
            <i className="fas fa-sparkles absolute top-6 sm:top-10 right-6 sm:right-10 text-6xl sm:text-8xl text-white/10"></i>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-5xl flex flex-col justify-center text-center">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4">
              Total Students
            </p>
            <h3 className="text-4xl sm:text-5xl font-black text-white">{dashboard?.total_students || 0}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
          <div className="lg:col-span-6 space-y-8">
            <h3 className="text-xl font-bold font-poppins">Today's Schedule</h3>
            <div className="space-y-4">
              {[
                {
                  time: "10:00 AM",
                  title: "Quantum Mechanics Basics",
                  room: "VR-102",
                  count: 42,
                },
                {
                  time: "01:30 PM",
                  title: "Advanced Lab: Optics",
                  room: "VR-005",
                  count: 12,
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center justify-between hover:border-indigo-500 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-indigo-400 font-black text-sm">
                      {c.time}
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-indigo-400 transition">
                        {c.title}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {c.room} • {c.count} Learners
                      </p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-slate-700"></i>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-xl font-bold font-poppins text-rose-500">
              Risk Alerts
            </h3>
            <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-5xl space-y-6 shadow-2xl">
              {[
                {
                  name: "Kevin Wu",
                  status: "Plagiarism Alert",
                  action: () => navigate("/student/kevin-wu"),
                },
                {
                  name: "Sarah Ahmed",
                  status: "Attendance Drop",
                  action: () => {},
                },
              ].map((risk, i) => (
                <div
                  key={i}
                  onClick={risk.action}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-rose-500/20 cursor-pointer hover:bg-rose-500/10 transition group"
                >
                  <div>
                    <p className="font-bold text-white group-hover:text-rose-400">
                      {risk.name}
                    </p>
                    <p className="text-[10px] text-rose-500 uppercase font-black tracking-widest">
                      {risk.status}
                    </p>
                  </div>
                  <button className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase shadow-lg">
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default TeacherPortal;
