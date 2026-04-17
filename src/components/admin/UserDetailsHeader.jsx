import React from "react";
import { Button } from "../ui";

const UserDetailsHeader = ({ user, onBack, onDelete }) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button
            onClick={onBack}
            className="hover:text-white transition flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Users
          </button>
          <span>/</span>
          <span className="text-white">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username || "Unknown User"}
          </span>
        </div>
        <Button variant="danger" onClick={onDelete} className="flex items-center gap-2">
          <i className="fas fa-trash"></i>
          <span className="hidden sm:inline">Delete User</span>
          <span className="sm:hidden">Delete</span>
        </Button>
      </div>
    </div>
  );
};

export default UserDetailsHeader;
