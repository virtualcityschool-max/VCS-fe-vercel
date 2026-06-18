import React from "react";
import { Outlet, useLocation } from "react-router-dom";

const StudentLayout = () => {
   const location = useLocation();

  const isStudentHome = location.pathname === "/student";
  return (
    <div
      className={`min-h-screen bg-slate-950 text-white ${
        isStudentHome ? "pt-0" : "pt-12 md:pt-0"
      }`}
    >
    <Outlet />
  </div>
  );
};

export default StudentLayout;
