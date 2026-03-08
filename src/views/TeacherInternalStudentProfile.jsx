
import React from 'react';
import { AppView } from '../types';

const TeacherInternalStudentProfile = ({ setView }) => {
  return (
    <section id="student-risk-view" className="min-h-screen bg-[#0f172a] text-white font-inter p-4 md:p-8">
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setView?.(AppView.TEACHER)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition group font-bold text-sm"
          >
            <i className="fas fa-arrow-left transition group-hover:-translate-x-1"></i>
            Back to Teacher Dashboard
          </button>
          <div className="h-6 w-px bg-slate-800"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Internal Profile • Student Risk Assessment
          </p>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-xs font-bold text-slate-500">Priority Level:</span>
           <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/30">
             High Attention
           </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Basic Info Sidebar */}
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-700 shadow-2xl text-center">
              <div className="relative inline-block mb-6">
                <img src="https://i.pravatar.cc/150?u=stud123" className="w-32 h-32 rounded-3xl border-4 border-slate-700 shadow-xl object-cover" alt="Kevin Wu" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 border-4 border-slate-800 rounded-full shadow-lg" title="Critical Status"></div>
              </div>
              <h2 className="text-2xl font-black font-poppins text-white mb-1">Kevin Wu</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Student ID: #82942</p>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider">GPA</span>
                  <span className="font-black text-green-500">3.82</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Attendance</span>
                  <span className="font-black text-indigo-400">94%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Credits</span>
                  <span className="font-black text-white">42/120</span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-900/40 transition active:scale-95">
                  Send Direct Message
                </button>
                <button className="w-full py-4 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-inner">
                  View Schedule
                </button>
              </div>
            </div>
          </div>

          {/* Behavioral & Risk Data Main */}
          <div className="flex-1 space-y-8">
            {/* Status Flags */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
              <h3 className="text-xl font-bold font-poppins text-white mb-8 flex items-center gap-3">
                <i className="fas fa-shield-alt text-indigo-400"></i> Behavioral Risk Assessment
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="bg-red-500/10 text-red-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 flex items-center gap-3 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                  Plagiarism Warning
                </div>
                <div className="bg-yellow-500/10 text-yellow-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 flex items-center gap-3 shadow-lg">
                  <i className="fas fa-clock"></i> Late Submissions (3)
                </div>
                <div className="bg-indigo-500/10 text-indigo-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 flex items-center gap-3 shadow-lg">
                  <i className="fas fa-trophy"></i> High Achiever: Mathematics
                </div>
              </div>
            </div>

            {/* Private Teacher Notes */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-bold font-poppins text-white flex items-center gap-3">
                  <i className="fas fa-sticky-note text-yellow-500"></i> Confidential Teacher Notes
                </h3>
                <button className="text-indigo-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                    <i className="fas fa-plus"></i>
                  </div>
                  Add Behavioral Note
                </button>
              </div>
              <div className="space-y-6">
                {[
                  { date: 'Oct 12, 2023', teacher: 'Dr. Sarah Miller', note: 'Student showed exceptional insight during the React session. However, failed to cite sources in the final lab report.', type: 'Warning', color: 'bg-red-500' },
                  { date: 'Sep 28, 2023', teacher: 'Prof. Mark Wood', note: 'Kevin is struggling with participation. Needs encouragement during group activities.', type: 'Observation', color: 'bg-indigo-500' },
                ].map((n, i) => (
                  <div key={i} className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 hover:bg-slate-900 transition">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-1 h-8 rounded-full ${n.color}`}></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{n.date}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white shadow-lg ${n.color}`}>
                        {n.type}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium italic">"{n.note}"</p>
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Added by {n.teacher}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Performance Chart Area */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-bold font-poppins text-white flex items-center gap-3">
                  <i className="fas fa-chart-bar text-green-500"></i> Grade Distribution
                </h3>
                <div className="flex gap-2">
                  <button className="bg-slate-900 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase text-slate-500 border border-slate-700">MT1</button>
                  <button className="bg-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-indigo-900/20">Finals</button>
                </div>
              </div>
              <div className="h-64 flex items-end gap-6 px-4">
                {[80, 45, 95, 70, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-slate-900/50 rounded-2xl relative group cursor-pointer border border-slate-800">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-indigo-700 to-indigo-500 rounded-2xl transition-all duration-1000 shadow-lg shadow-indigo-900/20 group-hover:from-indigo-600 group-hover:to-indigo-400" 
                      style={{ height: `${h}%` }}
                    ></div>
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-xs font-black text-white opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                      {h}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-8 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-4">
                <span>Logic</span>
                <span>Eng</span>
                <span>Math</span>
                <span>Hist</span>
                <span>Code</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherInternalStudentProfile;
