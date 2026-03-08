import React from 'react';
import { AppView } from '../types';

const ParentPortal = ({ setView }) => {
  return (
    <section id="parent-view" className="min-h-screen bg-[#0f172a] text-white font-inter">
      {/* Navigation Bar */}
      <nav className="w-full bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0" onClick={() => setView?.(AppView.PUBLIC_HOME)}>
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-black text-white group-hover:rotate-12 transition">V</div>
              <span className="text-[10px] sm:text-sm font-black font-poppins text-white tracking-tight whitespace-nowrap">VirtualCitySchool</span>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView?.(AppView.PUBLIC_HOME)}
                className="text-slate-400 font-medium text-sm hover:text-white transition cursor-pointer"
              >
                Home
              </button>
              <button 
                className="bg-slate-800 text-white px-4 py-1.5 rounded-lg font-medium text-sm cursor-default"
              >
                Guardian Portal
              </button>
              <button 
                className="text-slate-400 font-medium text-sm hover:text-white transition cursor-pointer"
              >
                Messages
              </button>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative text-slate-400 hover:text-white transition text-lg">
              <i className="far fa-bell"></i>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#0f172a]"></span>
            </button>
            <img src="https://i.pravatar.cc/150?u=parent" className="w-8 h-8 rounded-full border border-slate-700 shadow-md" alt="Mr. Khan" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold font-poppins mb-2">Welcome back, Mr. Khan!</h1>
          <p className="text-slate-400 text-lg">
            Monitor your children's progress at the <span className="text-white font-bold">VirtualCitySchool</span> terminal.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Main Dashboard - Left Column */}
          <div className="lg:col-span-7 space-y-12">
            
            <section>
              <h2 className="text-xl font-bold font-poppins mb-6">Enrolled Students</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sarah Khan - Doing Well */}
                <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-lg flex flex-col h-full group hover:border-indigo-500/30 transition">
                  <div className="flex justify-between items-start mb-6">
                    <img src="https://i.pravatar.cc/150?u=sarah_j" className="w-20 h-20 rounded-3xl border-2 border-indigo-500 shadow-md group-hover:scale-105 transition" alt="Sarah" />
                    <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">Excellent Performance</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Sarah Khan</h3>
                  <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">Grade 12 • Science Stream</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Current GPA</p>
                      <p className="text-xl font-black text-white">3.92</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Attendance</p>
                      <p className="text-xl font-black text-indigo-400">98%</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700 flex justify-between items-center mt-auto">
                    <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <i className="fas fa-check-circle"></i> Account Paid
                    </p>
                    <button className="text-indigo-400 hover:text-white transition"><i className="fas fa-arrow-right"></i></button>
                  </div>
                </div>

                {/* Ahmed Khan - Risk Alert */}
                <div className="bg-slate-800 p-8 rounded-[2.5rem] border-2 border-red-500/20 shadow-2xl flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-6">
                    <img src="https://i.pravatar.cc/150?u=ahmed" className="w-20 h-20 rounded-3xl border-2 border-red-500 shadow-md group-hover:scale-105 transition" alt="Ahmed" />
                    <span className="bg-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-500/20 animate-pulse">Risk Alert</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Ahmed Khan</h3>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-6">Grade 10 • General Stream</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Current GPA</p>
                      <p className="text-xl font-black text-rose-500">2.45</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Attendance</p>
                      <p className="text-xl font-black text-amber-500">82%</p>
                    </div>
                  </div>

                  <ul className="text-sm space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-red-400 font-bold bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                      <i className="fas fa-exclamation-triangle"></i>
                      <p className="text-xs">Algebra Mid-term Overdue</p>
                    </li>
                  </ul>
                  
                  <div className="pt-6 border-t border-slate-700 flex justify-between items-center mt-auto">
                    <p className="text-amber-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <i className="fas fa-clock"></i> Fees Pending
                    </p>
                    <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition">Review Task</button>
                  </div>
                </div>

              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold font-poppins mb-6">Financial & Communication</h2>
              <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-3xl flex items-center justify-center text-2xl">
                    <i className="fas fa-wallet"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Outstanding</p>
                    <h3 className="text-2xl font-black font-poppins text-white">$450.00</h3>
                  </div>
                </div>
                <button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95">
                  Pay Balance Now
                </button>
              </div>
            </section>

          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-8">
            <section className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[3rem] border border-slate-700 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">VirtualCity Updates</h3>
              <ul className="space-y-6">
                {[
                  { t: 'Mid-Term Exam Dates', c: 'Academic' },
                  { t: 'VirtualCity Science Fair', c: 'Events' },
                  { t: 'Winter Registration', c: 'Important' }
                ].map((news, i) => (
                  <li key={i} className="group cursor-pointer border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
                    <p className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition mb-1">{news.t}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{news.c}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[3rem] border border-slate-700 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Recent Activity</h3>
              <div className="relative pl-6 space-y-10">
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-700"></div>
                {[
                  { m: 'Sarah: Physics Report Graded', t: '2h ago', b: 'bg-indigo-500' },
                  { m: 'Ahmed: New grade posted', t: '5h ago', b: 'bg-slate-500' },
                  { m: 'Winter Lab Fees Invoiced', t: 'Yesterday', b: 'bg-slate-700' }
                ].map((act, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full ${act.b} border-4 border-slate-800 shadow-sm`}></div>
                    <p className="text-xs font-bold text-slate-200 mb-1 leading-tight">{act.m}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{act.t}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ParentPortal;