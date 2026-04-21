import React from "react";
import { Outlet } from "react-router-dom";

const StudentLayout = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <Outlet />
  </div>
);

export default StudentLayout;
