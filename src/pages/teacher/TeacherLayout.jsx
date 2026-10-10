import React from "react";
import { Outlet } from "react-router-dom";

const TeacherLayout = () => {
  return (
    <section className="min-h-screen bg-[#070913] text-white p-4 md:p-6 lg:p-8 pt-16 lg:pt-6">
      <Outlet />
    </section>
  );
};

export default TeacherLayout;
