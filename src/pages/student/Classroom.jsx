import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Classroom = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950 font-inter">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer"
            onClick={() => navigate("/student")}
          >
            V
          </div>
          <div>
            <h1 className="font-bold text-sm">
              Advanced Physics: Quantum Dynamics
            </h1>
            <p className="text-[10px] text-slate-500 flex items-center gap-2">
              <span className="flex items-center gap-1 text-red-500 font-black">
                <i className="fas fa-circle text-[6px]"></i> LIVE SESSION
              </span>
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              243 Students Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden xs:flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/150?u=${i}`}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-slate-900 shadow-md"
              />
            ))}
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
              +240
            </div>
          </div>
          <button
            onClick={() => navigate("/student")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition shadow-lg shadow-red-900/40 active:scale-95"
          >
            Leave
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="lg:hidden text-slate-400 hover:text-white transition"
          >
            <i
              className={`fas ${showChat ? "fa-times" : "fa-comment"} text-xl`}
            ></i>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative flex flex-col p-4">
          <div className="flex-1 bg-slate-900 rounded-3xl relative overflow-hidden group border border-white/5">
            <img
              src="https://picsum.photos/seed/lecture/1200/800"
              className="w-full h-full object-cover opacity-60"
            />

            {/* Overlay UI */}
            <div className="absolute inset-0 flex flex-col justify-between p-8">
              <div className="flex justify-between items-start">
                <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
                  <img
                    src="https://i.pravatar.cc/150?u=teacher"
                    className="w-12 h-12 rounded-xl shadow-lg"
                  />
                  <div>
                    <p className="font-bold text-sm text-white">
                      Dr. Samuel Okoro
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Instructor • Sharing Screen
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="bg-black/40 backdrop-blur-md w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-white shadow-xl">
                    <i className="fas fa-expand"></i>
                  </button>
                  <button className="bg-black/40 backdrop-blur-md w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-white shadow-xl">
                    <i className="fas fa-cog"></i>
                  </button>
                </div>
              </div>

              <div className="flex justify-center flex-wrap gap-2 sm:gap-5 animate-slide-up mb-4">
                <button className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl bg-slate-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 transition shadow-2xl">
                  <i className="fas fa-microphone text-xs sm:text-base"></i>
                </button>
                <button className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl bg-slate-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 transition shadow-2xl">
                  <i className="fas fa-video text-xs sm:text-base"></i>
                </button>
                <button className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-900/50 hover:scale-110 transition active:scale-95">
                  <i className="fas fa-hand-paper text-xs sm:text-base"></i>
                </button>
                <button className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl bg-slate-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 transition shadow-2xl">
                  <i className="fas fa-desktop text-xs sm:text-base"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Participant Strip */}
          <div className="h-28 mt-4 flex gap-4 overflow-x-auto custom-scrollbar pb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-40 h-full bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition shadow-xl"
              >
                <img
                  src={`https://picsum.photos/seed/s${i}/300/200`}
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-[9px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Student #{i}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed inset-0 lg:relative lg:inset-auto lg:w-96 border-l border-slate-800 flex flex-col bg-slate-900/95 lg:bg-slate-900/30 backdrop-blur-xl z-100 transition-transform duration-300 ${showChat ? "translate-x-0" : "translate-x-full lg:translate-x-0"} ${showChat ? "" : "hidden lg:flex"}`}
        >
          <div className="flex p-4 border-b border-slate-800">
            <button className="flex-1 pb-4 border-b-2 border-indigo-500 font-black text-[10px] uppercase tracking-widest text-white">
              Live Chat
            </button>
            <button className="flex-1 pb-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-300">
              Roster
            </button>
            <button className="flex-1 pb-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-300">
              Handouts
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex gap-4 animate-fadeIn">
                <img
                  src={`https://i.pravatar.cc/150?u=chat${i}`}
                  className="w-9 h-9 rounded-xl border border-slate-700 shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black uppercase text-indigo-400">
                      User #{i}
                    </p>
                    <span className="text-[9px] text-slate-600 font-bold">
                      10:4{i} AM
                    </span>
                  </div>
                  <p className="text-xs bg-slate-800 p-3 rounded-2xl rounded-tl-none text-slate-300 shadow-inner">
                    This explanation of Schrödinger's equation is amazing!
                    Thanks Dr. Samuel! 🚀
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-950/50">
            <div className="relative">
              <input
                type="text"
                placeholder="Type a message to the class..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition shadow-lg active:scale-95">
                <i className="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classroom;
