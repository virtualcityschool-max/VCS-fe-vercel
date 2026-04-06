import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button, Input, Card } from "../../components/ui";

const UsersTab = ({
  users,
  loading,
  usersFilters,
  setUsersFilters,
  onUserDelete,
  onFetchUsers,
  onUserEdit,
  onCreateUser,
}) => {
  // Debounced search handler
  const [searchInput, setSearchInput] = useState("");
  const isMountedRef = useRef(true);

  // Debounced search update with cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMountedRef.current && searchInput !== usersFilters.search) {
        setUsersFilters((prev) => ({ ...prev, search: searchInput }));
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchInput, usersFilters.search, setUsersFilters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleFilterChange = useCallback(
    (filterName, value) => {
      setUsersFilters((prev) => ({ ...prev, [filterName]: value }));
    },
    [setUsersFilters],
  );
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await onUserDelete(userId);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleEditUser = (userId) => {
    if (onUserEdit) {
      onUserEdit(userId);
    } else {
      console.log("Edit user functionality not implemented:", userId);
    }
  };

  const handleCreateUser = () => {
    if (onCreateUser) {
      onCreateUser();
    } else {
      console.log("Create user functionality not implemented");
    }
  };

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

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
      : "bg-slate-500/20 text-slate-400 border-slate-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-800 animate-pulse"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-32"></div>
                        <div className="h-3 bg-slate-700 rounded w-48"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-700 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-700 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 bg-slate-700 rounded w-12"></div>
                      <div className="h-8 bg-slate-700 rounded w-16"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* User List Header */}
          <div className="flex justify-end items-center mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 w-full lg:w-auto max-w-2xl lg:max-w-none">
              <div className="relative flex-1 lg:flex-initial">
                <Input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full lg:w-64"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <select
                  value={usersFilters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
                <select
                  value={usersFilters.is_active}
                  onChange={(e) =>
                    handleFilterChange("is_active", e.target.value)
                  }
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <select
                  value={usersFilters.ordering}
                  onChange={(e) =>
                    handleFilterChange("ordering", e.target.value)
                  }
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="-date_joined">Newest First</option>
                  <option value="date_joined">Oldest First</option>
                  <option value="username">Username A-Z</option>
                  <option value="-username">Username Z-A</option>
                </select>
                <button
                  onClick={() => onFetchUsers()}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 sm:hidden"
                >
                  <i className="fas fa-sync"></i>
                  <span className="ml-2">Refresh</span>
                </button>
                <button
                  onClick={handleCreateUser}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <i className="fas fa-user-plus text-sm"></i>
                  <span className="hidden sm:inline ml-2">Create User</span>
                  <span className="sm:hidden">+</span>
                </button>
              </div>
              <button
                onClick={() => onFetchUsers()}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 hidden sm:flex"
              >
                <i className="fas fa-sync"></i>
                <span className="ml-2">Refresh</span>
              </button>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-800/50">
              {users?.map((user) => (
                <div
                  key={user.id}
                  className="p-4 sm:p-6 hover:bg-slate-800/30 transition"
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${getRoleColor(
                          user.role,
                        )}`}
                      >
                        <i className="fas fa-user text-white"></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm sm:text-base mb-1">
                        {user.username ||
                          user.first_name + " " + user.last_name ||
                          "Unknown User"}
                      </p>
                      <p className="text-[9px] sm:text-xs text-slate-500 uppercase break-all">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getRoleColor(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getStatusColor(
                          user.is_active,
                        )}`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-slate-600/50 transition flex items-center gap-1 flex-1 justify-center"
                      >
                        <i className="fas fa-edit"></i>
                        <span className="hidden sm:inline">Edit</span>
                        <span className="sm:hidden">✏</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-red-600/20 transition flex items-center gap-1 flex-1 justify-center"
                      >
                        <i className="fas fa-trash"></i>
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">🗑</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden lg:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b border-slate-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(
                                user.role,
                              )}`}
                            >
                              <i className="fas fa-user text-white"></i>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {user.username ||
                                user.first_name + " " + user.last_name ||
                                "Unknown User"}
                            </p>
                            <p className="text-sm text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getRoleColor(
                            user.role,
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getStatusColor(
                            user.is_active,
                          )}`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-600/50 transition"
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition"
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersTab;
