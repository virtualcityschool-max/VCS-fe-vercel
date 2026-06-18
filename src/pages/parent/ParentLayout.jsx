import React from "react";
import { Outlet, useLocation } from "react-router-dom";

const ParentLayout = () => {
  const location = useLocation();

  const isParentHome = location.pathname === "/parent";

  return (
    <div
      className={`min-h-screen bg-slate-950 text-white ${
        isParentHome ? "pt-0" : "pt-10 md:pt-0"
      }`}
    >
      <Outlet />
    </div>
  );
};

export default ParentLayout;