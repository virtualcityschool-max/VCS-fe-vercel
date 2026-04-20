import React from "react";
import { Outlet } from "react-router-dom";

const TeacherLayout = () => {
  return (
    <section className="min-h-screen bg-slate-950 text-white p-6 pt-16 lg:p-12">
      <Outlet />
    </section>
  );
};

export default TeacherLayout;
