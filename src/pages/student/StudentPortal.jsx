import React from "react";
import { useNavigate } from "react-router-dom";

const StudentPortal = () => {
  const navigate = useNavigate();
  return (
    <section
      id="student-view"
      className="min-h-screen bg-[#0f172a] text-white font-inter"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-br from-indigo-600 to-blue-800 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-center min-h-[160px] border border-white/10">
            <h1 className="text-2xl font-bold font-poppins mb-1">
              Welcome back, Sarah!
            </h1>
            <p className="text-blue-100/80 text-sm">
              Focus on your goals today at VirtualCitySchool.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 shadow-xl flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
              <i className="fas fa-broadcast-tower text-xl"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                Urdu with Mr. Iqbal
              </p>
              <h3 className="text-xl font-bold">Starts in 15 mins</h3>
              <p className="text-xs text-slate-500">Virtual Room 105</p>
            </div>
          </div>

          <div className="bg-red-500/5 p-8 rounded-[2.5rem] border border-red-500/20 shadow-xl flex items-center gap-6">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 animate-pulse">
              <i className="fas fa-exclamation-circle text-xl"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">
                Attention Required
              </p>
              <h3 className="text-xl font-bold text-white">1 Assignment</h3>
              <p className="text-xs text-red-400/70 truncate">
                Past Due: Quantum Basics
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-xl font-bold font-poppins mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>{" "}
                My Live Schedule
              </h2>
              <div className="space-y-6">
                <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 flex flex-col md:flex-row items-center gap-8 hover:bg-slate-800/80 transition group shadow-lg">
                  <img
                    src="https://i.pravatar.cc/150?u=samuel_okoro"
                    className="w-20 h-20 rounded-2xl border-2 border-slate-700 object-cover"
                    alt="Dr. Samuel"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h4 className="text-xl font-bold group-hover:text-blue-400 transition">
                        Physics
                      </h4>
                      <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Mon & Wed @ 10:00 AM
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">
                      Instructor: Dr. Samuel Okoro
                    </p>
                    <div className="w-full max-w-sm">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                        <span className="text-slate-500">Attendance Rate</span>
                        <span className="text-green-500">92%</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-1000"
                          style={{ width: "92%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/classroom")}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/40 transition active:scale-95"
                  >
                    Join Live Room
                  </button>
                </div>

                <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 flex flex-col md:flex-row items-center gap-8 hover:bg-slate-800/80 transition group shadow-lg">
                  <img
                    src="https://i.pravatar.cc/150?u=iqbal"
                    className="w-20 h-20 rounded-2xl border-2 border-slate-700 object-cover"
                    alt="Mr. Iqbal"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h4 className="text-xl font-bold group-hover:text-blue-400 transition">
                        Urdu
                      </h4>
                      <span className="bg-slate-700 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Tue & Thu @ 02:00 PM
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">
                      Instructor: Mr. Iqbal
                    </p>
                    <div className="w-full max-w-sm">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                        <span className="text-slate-500">Attendance Rate</span>
                        <span className="text-yellow-500">85%</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 transition-all duration-1000"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full md:w-auto border border-slate-600 text-white hover:bg-slate-700 px-8 py-4 rounded-2xl font-bold text-sm transition active:scale-95">
                    View Syllabus
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold font-poppins mb-6 border-b border-slate-800 pb-4">
                On-Demand Enrollments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800 rounded-[2.5rem] border border-slate-700 overflow-hidden group shadow-xl hover:border-blue-500/30 transition">
                  <div className="h-36 bg-slate-700 relative overflow-hidden">
                    <img
                      src="https://picsum.photos/seed/py_course/600/400"
                      className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition duration-700"
                      alt="Python"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-800 to-transparent"></div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-lg font-bold mb-6">
                      Complete Python Bootcamp
                    </h4>
                    <div className="mb-8">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-3">
                        <span>Course Progress</span>
                        <span className="text-blue-400">45% Completed</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-1000"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                    </div>
                    <button className="w-full py-4 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm rounded-2xl transition shadow-inner">
                      Resume Course
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-blue-500/50 transition">
                  <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition text-slate-500 group-hover:text-blue-500">
                    <i className="fas fa-plus"></i>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-400">
                    Explore Catalog
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div className="bg-slate-800 p-8 rounded-[2.5rem] border-2 border-red-500/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition"></div>
              <h3 className="text-red-500 font-black uppercase tracking-[0.2em] text-[10px] mb-8">
                Financial Status
              </h3>
              <div className="mb-10">
                <p className="text-4xl font-black text-white mb-2">$450.00</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  Outstanding Balance • Due Jan 01
                </p>
              </div>
              <button className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-lg shadow-red-900/30 active:scale-95">
                Pay Now
              </button>
            </div>

            <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Assignments
                </h3>
                <i className="fas fa-tasks text-slate-600 text-xs"></i>
              </div>
              <div className="space-y-6">
                {[
                  {
                    t: "Quantum Mechanics Intro",
                    s: "Pending",
                    c: "text-yellow-500 bg-yellow-500/10",
                  },
                  {
                    t: "Urdu Poetry Analysis",
                    s: "Submitted",
                    c: "text-green-500 bg-green-500/10",
                  },
                  {
                    t: "Python Loops Lab",
                    s: "Pending",
                    c: "text-yellow-500 bg-yellow-500/10",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1.5 border-b border-slate-700/30 pb-4 last:border-0 last:pb-0"
                  >
                    <p className="font-semibold text-slate-300 text-sm line-clamp-1">
                      {item.t}
                    </p>
                    <div className="flex">
                      <span
                        className={`${item.c} px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest`}
                      >
                        {item.s}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-slate-900 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition">
                View All Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentPortal;
