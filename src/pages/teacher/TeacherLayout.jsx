import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";

const TeacherLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <section className="min-h-screen bg-slate-950 text-white flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 z-[100] flex items-center justify-between px-6">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-xs">
            V
          </div>
          <span className="text-[10px] sm:text-sm font-black tracking-tighter whitespace-nowrap">
            VirtualCitySchool
          </span>
        </div>

        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="text-slate-400 hover:text-white transition"
          type="button"
        >
          <i
            className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"} text-xl`}
          ></i>
        </button>
      </div>

      <TeacherSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 lg:ml-72 p-6 pt-24 lg:p-12">
        <Outlet />
      </main>
    </section>
  );
};

export default TeacherLayout;
