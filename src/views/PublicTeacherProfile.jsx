import React from 'react';
import { useDispatch } from 'react-redux';
import { setView } from '../store/slices/uiSlice';
import { AppView } from '../types';

const PublicTeacherProfile = () => {
  const dispatch = useDispatch();
  const handleSetView = (view) => dispatch(setView(view));
  return (
    <section id="teacher-profile-view" className="min-h-screen bg-slate-900 text-white font-inter">
      {/* Global Navigation Bar */}
      <nav className="w-full bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-10 overflow-hidden">
            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0" onClick={() => handleSetView(AppView.PUBLIC_HOME)}>
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-black text-white group-hover:rotate-12 transition">V</div>
              <span className="text-[10px] sm:text-sm font-black font-poppins text-white tracking-tight whitespace-nowrap">VirtualCitySchool</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto custom-scrollbar whitespace-nowrap py-2 no-scrollbar">
              <button 
                onClick={() => handleSetView(AppView.PUBLIC_HOME)}
                className="text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer"
              >
                Home
              </button>
              <button 
                onClick={() => handleSetView(AppView.STUDENT)}
                className="text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer"
              >
                Dashboard
              </button>
              <button 
                className="bg-slate-800 text-white px-3 sm:px-4 py-1.5 rounded-lg font-medium text-xs sm:text-sm cursor-default"
              >
                Instructors
              </button>
              <button 
                onClick={() => handleSetView(AppView.MARKETPLACE)}
                className="text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer"
              >
                Catalog
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 shrink-0 ml-4">
            <button className="relative text-slate-400 hover:text-white transition text-base sm:text-lg"><i className="far fa-bell"></i></button>
            <img src="https://i.pravatar.cc/150?u=me" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-700 shadow-md" alt="User" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-slate-800 rounded-[3rem] p-10 border border-slate-700/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
            <div className="relative shrink-0">
              <img 
                src="https://i.pravatar.cc/150?u=samuel_okoro" 
                className="w-32 h-32 lg:w-48 lg:h-48 rounded-[2.5rem] lg:rounded-[3rem] border-4 border-slate-700 object-cover shadow-2xl" 
                alt="Dr. Samuel Okoro" 
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-slate-800 rounded-2xl shadow-lg flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-2">
                <h1 className="text-4xl font-black font-poppins tracking-tight">Dr. Samuel Okoro</h1>
                <span className="bg-blue-600/10 text-blue-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  <i className="fas fa-check-circle mr-2"></i> Verified Instructor
                </span>
              </div>
              <p className="text-indigo-400 font-bold text-lg mb-6">Senior Physics Professor & STEM Architect</p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                {['12+ Years Experience', 'Quantum Mechanics', 'O-Levels Expert'].map((tag) => (
                  <span key={tag} className="bg-slate-900/60 text-slate-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-72">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95">
                Book a Live Class
              </button>
              <button className="bg-slate-950 border border-slate-700 text-slate-300 hover:text-white px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition shadow-inner">
                Message Instructor
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-slate-800 p-10 rounded-[3rem] border border-slate-700/50 shadow-xl h-full flex flex-col">
              <h2 className="text-2xl font-black font-poppins mb-8 flex items-center gap-4">
                 <i className="fas fa-user-tie text-indigo-400"></i> Instructional Profile
              </h2>
              <div className="text-slate-400 leading-relaxed text-lg mb-10 flex-1 space-y-6">
                <p>
                  Dr. Samuel Okoro is a world-renowned educator specializing in theoretical physics. With a Ph.D. from Cambridge, he brings a unique depth to <span className="text-white font-bold">VirtualCitySchool</span> students.
                </p>
                <p>
                  He has mentored over <span className="text-indigo-400 font-bold">1,200 students</span> across the globe, maintaining one of the highest satisfaction ratings in the VirtualCity ecosystem.
                </p>
              </div>
              
              <div className="bg-slate-950/50 p-8 rounded-4xl border-l-4 border-indigo-600 italic shadow-inner">
                <p className="text-slate-300 font-medium leading-relaxed text-lg">
                  "At VirtualCitySchool, we learn to visualize the fabric of reality. My goal is to transform every learner into a critical thinker."
                </p>
                <p className="mt-4 text-[10px] text-indigo-400 font-black uppercase tracking-widest not-italic">— Philosophical Approach</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl text-center group hover:bg-slate-800/80 transition">
                <p className="text-4xl font-black text-white mb-2">1,200+</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Learners</p>
              </div>
              <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl text-center group hover:bg-slate-800/80 transition">
                <p className="text-4xl font-black text-yellow-500 mb-2 flex items-center justify-center gap-2">
                  4.9 <i className="fas fa-star text-sm"></i>
                </p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Rating</p>
              </div>
            </div>

            <div className="bg-slate-800 p-10 rounded-[3rem] border border-slate-700/50 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Distinctions</h3>
              <ul className="space-y-8">
                {[
                  { icon: 'fa-award', title: 'Top 1% STEM Mentor', subtitle: 'VirtualCity Elite' },
                  { icon: 'fa-microscope', title: 'Senior Research Fellow', subtitle: 'Global Physics League' }
                ].map((cert, idx) => (
                  <li key={idx} className="flex items-start gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-lg">
                      <i className={`fas ${cert.icon} text-indigo-400 text-xl`}></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 text-sm leading-tight mb-1">{cert.title}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{cert.subtitle}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PublicTeacherProfile;