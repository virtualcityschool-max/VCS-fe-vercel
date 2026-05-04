import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card, FilterSelect, SearchInput } from "../../components/ui";
import ConfirmDialog from "../common/ConfirmDialog";

// Search controls component
const SearchControls = ({
  searchInput,
  setSearchInput,
  usersFilters,
  handleFilterChange,
  onFetchUsers,
  handleCreateUser,
  onClearFilters,
}) => {
  const roleTabs = [
    { value: "", label: "All" },
    { value: "admin", label: "Admin" },
    { value: "teacher", label: "Teacher" },
    { value: "student", label: "Student" },
    { value: "parent", label: "Parent" },
  ];

  // Check if any filters are applied
  const hasActiveFilters = !!(
    usersFilters.search ||
    usersFilters.role ||
    usersFilters.is_active ||
    usersFilters.ordering !== "-date_joined"
  );

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Role tab pills */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 flex flex-wrap items-center gap-1 w-fit">
          {roleTabs.map((tab) => {
            const isActive = usersFilters.role === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => handleFilterChange("role", tab.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onClear={() => setSearchInput("")}
            placeholder="Search by username or email..."
            className="w-full sm:w-64"
          />
          <FilterSelect
            value={usersFilters.is_active}
            onChange={(e) => handleFilterChange("is_active", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </FilterSelect>
          <FilterSelect
            value={usersFilters.ordering}
            onChange={(e) => handleFilterChange("ordering", e.target.value)}
          >
            <option value="-date_joined">Newest First</option>
            <option value="date_joined">Oldest First</option>
            <option value="username">Username A–Z</option>
            <option value="-username">Username Z–A</option>
          </FilterSelect>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              title="Clear all filters"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700/70 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm font-medium transition-all duration-150"
            >
              <i className="fas fa-times text-xs"></i>
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          <button
            onClick={() => onFetchUsers()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700/70 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-all duration-150"
            title="Refresh"
          >
            <i className="fas fa-sync text-xs"></i>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all duration-150"
          >
            <i className="fas fa-user-plus text-xs"></i>
            <span className="hidden sm:inline">Create User</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium mr-1">Role Colors</span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/20">
          Admin
        </span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/20">
          Teacher
        </span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/20">
          Student
        </span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/20">
          Parent
        </span>
        <span className="text-slate-500 mx-1">|</span>
        <span className="text-slate-400 font-medium mr-1">Status</span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
          Active
        </span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-slate-500/20 text-slate-400 border border-slate-500/20">
          Inactive
        </span>
      </div> */}
    </div>
  );
};

const UsersTab = ({
  users,
  loading,
  usersFilters,
  setUsersFilters,
  onUserDelete,
  onUserPurge,
  onFetchUsers,
  onCreateUser,
}) => {
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState({ open: false, userId: null });
  const [purgeDialog, setPurgeDialog] = useState({ open: false, userId: null });
  // Debounced search handler - use controlled pattern
  const [localSearchInput, setLocalSearchInput] = useState(
    usersFilters.search || "",
  );
  const isMountedRef = useRef(true);

  // Use the local input for UI, but sync with external filter when they differ
  const searchInput = localSearchInput;
  const setSearchInput = setLocalSearchInput;

  // Clear all filters handler
  const handleClearFilters = useCallback(() => {
    setUsersFilters({
      search: "",
      role: "",
      is_active: "",
      ordering: "-date_joined",
    });
    setLocalSearchInput("");
  }, [setUsersFilters]);

  // Debounced search update with cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== usersFilters.search) {
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
  const handleDeleteUser = (userId) => {
    setConfirmDialog({ open: true, userId });
  };

  const confirmDeleteUser = async () => {
    const { userId } = confirmDialog;
    setConfirmDialog({ open: false, userId: null });
    try {
      await onUserDelete(userId);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handlePurgeUser = (userId) => {
    setPurgeDialog({ open: true, userId });
  };

  const confirmPurgeUser = async () => {
    const { userId } = purgeDialog;
    setPurgeDialog({ open: false, userId: null });
    try {
      await onUserPurge(userId);
    } catch (error) {
      console.error("Failed to purge user:", error);
    }
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/users/${userId}`);
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
      {/* User List Header */}
      <SearchControls
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        usersFilters={usersFilters}
        handleFilterChange={handleFilterChange}
        onFetchUsers={onFetchUsers}
        handleCreateUser={handleCreateUser}
        onClearFilters={handleClearFilters}
      />
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
          {/* Users List */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-800/50 space-y-4">
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
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-red-600/20 transition flex items-center gap-1 flex-1 justify-center"
                      >
                        <i className="fas fa-trash"></i>
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                      <button
                        onClick={() => handlePurgeUser(user.id)}
                        className="bg-rose-900/20 text-rose-400 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-rose-900/40 transition flex items-center gap-1 flex-1 justify-center"
                        title="Permanently delete"
                      >
                        <i className="fas fa-skull-crossbones"></i>
                        <span className="hidden sm:inline">Purge</span>
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
                          <button
                            onClick={() => handlePurgeUser(user.id)}
                            className="bg-rose-900/20 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-rose-900/40 transition"
                            title="Permanently delete"
                          >
                            <i className="fas fa-skull-crossbones mr-1"></i>
                            Purge
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

      <ConfirmDialog
        open={confirmDialog.open}
        variant="danger"
        title="Delete User"
        message="Are you sure you want to delete this user? This will deactivate the account."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteUser}
        onCancel={() => setConfirmDialog({ open: false, userId: null })}
      />

      <ConfirmDialog
        open={purgeDialog.open}
        variant="danger"
        title="Permanently Delete User"
        message="This will permanently remove the user record and cannot be undone. Are you sure you want to purge this user?"
        confirmLabel="Purge"
        cancelLabel="Cancel"
        onConfirm={confirmPurgeUser}
        onCancel={() => setPurgeDialog({ open: false, userId: null })}
      />
    </div>
  );
};

export default UsersTab;
