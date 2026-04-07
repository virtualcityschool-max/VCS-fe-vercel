import React from "react";
import { Button } from "../ui";

const UserDetailsHeader = ({ user, onBack, onDelete }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/20";
      case "teacher":
        return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      case "parent":
        return "bg-purple-500/20 text-purple-400 border-purple-500/20";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/20";
    }
  };

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
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

      {/* User Summary Card */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* User Info */}
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div
                className={`w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center ${getRoleColor(
                  user.role,
                )} shadow-xl group-hover:shadow-2xl transition-all duration-300`}
              >
                <span className="text-2xl lg:text-3xl font-bold text-white">
                  {getInitials(user.first_name, user.last_name, user.username)}
                </span>
              </div>
              {/* Status Indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-slate-900 shadow-lg ${
                  user.is_active ? "bg-emerald-500" : "bg-slate-500"
                }`}
              ></div>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username || "Unknown User"}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                {/* Role Badge */}
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${getRoleColor(
                    user.role,
                  )} shadow-lg`}
                >
                  {user.role}
                </span>

                {/* Email */}
                <div className="flex items-center gap-2 text-slate-300">
                  <i className="fas fa-envelope text-slate-400"></i>
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <i className="fas fa-id-badge text-slate-500"></i>
                  <span>ID: #{user.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar text-slate-500"></i>
                  <span>Joined {formatDate(user.date_joined)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i
                    className={`fas fa-circle text-xs ${
                      user.is_active ? "text-emerald-500" : "text-slate-500"
                    }`}
                  ></i>
                  <span>{user.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="danger"
              onClick={onDelete}
              className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <i className="fas fa-trash"></i>
              <span className="hidden sm:inline">Delete User</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsHeader;
