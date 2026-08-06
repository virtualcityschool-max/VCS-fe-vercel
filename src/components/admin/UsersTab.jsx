import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Card,
  FilterSelect,
  SearchInput,
  EmptyState,
} from "../../components/ui";
import ConfirmDialog from "../common/ConfirmDialog";
import { getStorageUrl } from "../../utils/storageUrl";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import { getDisplayName } from "../../utils/userDisplay";
import { TagChip, StudentTagsModal, LabelFilterDropdown } from "./StudentTags";
import { useStudentTags } from "../../hooks/useStudentTags";

// Search controls component
const SearchControls = ({
  searchInput,
  setSearchInput,
  usersFilters,
  handleFilterChange,
  onFetchUsers,
  handleCreateUser,
  onClearFilters,
  tags,
  onManageLabels,
}) => {
  const roleTabs = [
    { value: "", label: "All" },
    { value: "admin", label: "Admin(s)" },
    { value: "teacher", label: "Tutor(s)" },
    { value: "student", label: "Student(s)" },
    { value: "parent", label: "Guardian(s)" },
  ];

  // Check if any filters are applied
  const hasActiveFilters = !!(
    usersFilters.search ||
    usersFilters.role ||
    usersFilters.is_active ||
    usersFilters.tags ||
    usersFilters.ordering !== "-date_joined"
  );

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        {/* Role tab pills */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 flex items-center gap-1 w-fit max-w-full overflow-x-auto no-scrollbar shrink-0">
          {roleTabs.map((tab) => {
            const isActive = usersFilters.role === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => handleFilterChange("role", tab.value)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-500 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter Controls Group. Must stay wrappable at every width: forcing
            one line here pushed Create User and Refresh off-screen between
            about 1280px and 1450px, where the role pills share the row.
            At xl the group shares the row with the pills and stays packed
            right; below xl it drops to its own row, where mr-auto anchors the
            search left instead of leaving it right-aligned. */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-start gap-1.5 flex-1 sm:justify-end">
          <SearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onClear={() => setSearchInput("")}
            placeholder={
              usersFilters.role === "student"
                ? "Search by name, email, or roll no..."
                : "Search users..."
            }
            className="w-full sm:w-64 sm:mr-auto xl:mr-0"
          />

          <div className="grid grid-cols-2 sm:contents gap-1.5">
            {/* Labels only apply to students, so the filter appears with them.
                Same shape as the course-level dropdown: filter, rename, delete
                or add without leaving the menu. Fixed width so a long label
                name truncates in the trigger instead of stretching the row. */}
            {(usersFilters.role === "" || usersFilters.role === "student") && (
              <LabelFilterDropdown
                className="w-full sm:w-34"
                tags={tags}
                value={usersFilters.tags}
                onChange={(v) => handleFilterChange("tags", v)}
                onAdd={() => onManageLabels({})}
                onEdit={(tag) => onManageLabels({ edit: tag })}
              />
            )}

            <FilterSelect
              className="w-full sm:w-auto"
              value={usersFilters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
            >
              <option value="">Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </FilterSelect>

            <FilterSelect
              className="w-full sm:w-auto"
              value={usersFilters.ordering}
              onChange={(e) => handleFilterChange("ordering", e.target.value)}
            >
              <option value="-date_joined">Newest</option>
              <option value="date_joined">Oldest</option>
              <option value="username">A–Z</option>
            </FilterSelect>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {/* Always rendered, disabled when there is nothing to clear, so the
                row never reflows as filters come and go. */}
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              title={hasActiveFilters ? "Clear all filters" : "No filters applied"}
              className={`flex items-center gap-1.5 h-[42px] px-3.5 rounded-xl border bg-slate-900 text-sm font-medium transition-all duration-150 shrink-0 ${
                hasActiveFilters
                  ? "border-slate-700/70 text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400"
                  : "border-slate-800/60 text-slate-600 cursor-not-allowed"
              }`}
            >
              <i className="fas fa-times text-xs"></i>
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={handleCreateUser}
              className="h-[42px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <i className="fas fa-user-plus text-[10px]" />
              <span>Create User</span>
            </button>
            <button
              onClick={() => onFetchUsers()}
              className="text-white h-[42px] px-5 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 shrink-0"
              title="Refresh"
            >
              <i className="fas fa-sync text-xs"></i>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium mr-1">Role Colors</span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/20">
          Admin
        </span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/20">
          Tutor
        </span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/20">
          Student
        </span>
        <span className="px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/20">
          Guardian
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
  onUserEdit,
  onUserView,
  onCreateUser,
}) => {
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: null,
    isActive: false,
    user: null,
  });
  const [purgeDialog, setPurgeDialog] = useState({ open: false, userId: null });
  // Student labels: the full list for the filter/picker, plus whichever student
  // currently has the picker open.
  const { tags, loaded: tagsLoaded, refresh: refreshTags } = useStudentTags();
  const [tagModalUser, setTagModalUser] = useState(null);
  // The same dialog opened without a student: manage the labels themselves.
  // null = closed; {} = plain; {edit|delete: tag} = opened straight into that action.
  const [labelLibrary, setLabelLibrary] = useState(null);
  // Tags saved since the last fetch, so rows update without a full reload
  const [tagOverrides, setTagOverrides] = useState({});
  const tagsFor = (user) => tagOverrides[user.id] ?? user.tags ?? [];
  // { [userId]: "purging" | "toggling" } — keeps the confirm dialog and the
  // row's buttons in a visible busy state until the request comes back
  const [processing, setProcessing] = useState({});
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
      tags: "",
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

  // Cleanup on unmount. The flag must be re-armed on mount — StrictMode runs
  // mount/cleanup/mount in dev, which would otherwise leave it stuck at false.
  useEffect(() => {
    isMountedRef.current = true;
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

  // Renaming or deleting a label leaves the chips already drawn on the rows
  // showing stale text, so re-read the list from the server.
  const handleStudentsStale = useCallback(() => {
    setTagOverrides({});
    onFetchUsers();
  }, [onFetchUsers]);

  // Deleting the label that's currently filtering the list would otherwise
  // leave an invisible filter matching nothing, so drop it.
  useEffect(() => {
    if (!tagsLoaded || !usersFilters.tags) return;
    if (!tags.some((t) => String(t.id) === String(usersFilters.tags))) {
      handleFilterChange("tags", "");
    }
  }, [tags, tagsLoaded, usersFilters.tags, handleFilterChange]);
  const checkTeacherHasCourses = async (userId) => {
    try {
      const data = await coursesService.getAllCourses({ instructor: userId });
      const list = Array.isArray(data) ? data : (data?.results || data?.data || []);
      return list.length > 0;
    } catch {
      return false;
    }
  };

  const handleDeleteUser = async (user) => {
    // if (user.role === "teacher") {
    //   const hasCourses = await checkTeacherHasCourses(user.id);
    //   if (hasCourses) {
    //     toastManager.error("This tutor has courses assigned. Remove or reassign their courses before deactivating.");
    //     return;
    //   }
    // }
    setConfirmDialog({
      open: true,
      userId: user.id,
      isActive: user.is_active,
      user,
    });
  };

  const startProcessing = (userId, kind) =>
    setProcessing((prev) => ({ ...prev, [userId]: kind }));

  const stopProcessing = (userId) =>
    setProcessing((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });

  const confirmDeleteUser = async () => {
    const { userId, user } = confirmDialog;
    startProcessing(userId, "toggling");
    try {
      await onUserDelete(userId, user);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    } finally {
      stopProcessing(userId);
      setConfirmDialog({
        open: false,
        userId: null,
        isActive: false,
        user: null,
      });
    }
  };

  const handlePurgeUser = async (user) => {
    // if (user.role === "teacher") {
    //   const hasCourses = await checkTeacherHasCourses(user.id);
    //   if (hasCourses) {
    //     toastManager.error("This tutor has courses assigned. Remove or reassign their courses before deleting.");
    //     return;
    //   }
    // }
    setPurgeDialog({ open: true, userId: user.id });
  };

  const confirmPurgeUser = async () => {
    const { userId } = purgeDialog;
    startProcessing(userId, "purging");
    try {
      await onUserPurge(userId);
    } catch (error) {
      console.error("Failed to purge user:", error);
    } finally {
      stopProcessing(userId);
      setPurgeDialog({ open: false, userId: null });
    }
  };

  const handleViewUser = (userId) => {
    if (onUserView) onUserView(userId);
    else navigate(`/admin/users/${userId}`, { state: { viewOnly: true } });
  };

  const handleEditUser = (userId) => {
    if (onUserEdit) onUserEdit(userId);
    else navigate(`/admin/users/${userId}`);
  };

  const handleCreateUser = () => {
    if (onCreateUser) {
      onCreateUser();
    } else {
      console.log("Create user functionality not implemented");
    }
  };

  const ROLE_DISPLAY = { teacher: "Tutor", parent: "Guardian", student: "Student", admin: "Admin" };
  const displayRole  = (r) => ROLE_DISPLAY[r] || r;

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
        tags={tags}
        onManageLabels={setLabelLibrary}
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
      ) : !users || users.length === 0 ? (
        /* Empty state - no users match the current search/filters */
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <EmptyState
            icon="fas fa-search"
            title={
              usersFilters.search || usersFilters.role || usersFilters.tags || usersFilters.is_active !== ""
                ? "No users found"
                : "No users yet"
            }
            description={
              usersFilters.search
                ? `No users match "${usersFilters.search}". Try a different search or clear the filters.`
                : usersFilters.role || usersFilters.tags || usersFilters.is_active !== ""
                  ? "No users match the selected filters."
                  : "There are no users to display at this time."
            }
            action={
              usersFilters.search || usersFilters.role || usersFilters.tags || usersFilters.is_active !== ""
                ? {
                    label: "Clear Filters",
                    icon: "fas fa-redo",
                    variant: "outline",
                    onClick: handleClearFilters,
                  }
                : null
            }
          />
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
                  className={`p-4 sm:p-6 transition ${user.is_superuser ? "bg-amber-500/[0.04] border-l-2 border-amber-500/40" : "hover:bg-slate-800/30"}`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <div className="relative">
                      {getStorageUrl(user.avatar) ? (
                        <img
                          src={getStorageUrl(user.avatar)}
                          alt={user.username}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${getRoleColor(user.role)}`}
                        >
                          <i className={`fas ${user.is_superuser ? "fa-crown text-amber-400" : "fa-user text-white"}`}></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-white text-sm sm:text-base">
                          {getDisplayName(user) || "Unknown User"}
                        </p>
                        {user.is_superuser && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                            <i className="fas fa-crown text-[8px]" />
                            Super Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] sm:text-xs text-slate-500 break-all">
                        {user.email}
                      </p>
                      {user.role === "student" && user.roll_no != null && (
                        <p className="text-[9px] sm:text-xs text-slate-500 break-all">
                          Roll #{user.roll_no}
                        </p>
                      )}
                      {user.role === "student" && tagsFor(user).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tagsFor(user).map((tag) => (
                            <TagChip
                              key={tag.id}
                              tag={tag}
                              onClick={() => handleFilterChange("tags", String(tag.id))}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getRoleColor(user.role)}`}>
                        {displayRole(user.role)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getStatusColor(user.is_active)}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {user.is_superuser ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 self-start sm:self-auto">
                        <i className="fas fa-lock text-amber-500/70 text-xs" />
                        <span className="text-amber-600/90 text-xs font-semibold">System Protected</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {user.role === "student" && (
                          <button
                            onClick={() => setTagModalUser(user)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-600/50 hover:text-indigo-300 transition"
                            title="Manage labels"
                          >
                            <i className="fas fa-tags text-xs"></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-600/50 hover:text-slate-200 transition"
                          title="View user"
                        >
                          <i className="fas fa-eye text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition"
                          title="Edit user"
                        >
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button
                          onClick={() => handlePurgeUser(user)}
                          disabled={!!processing[user.id]}
                          className="w-8 h-8 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
                        >
                          <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-xs`}></i>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={!!processing[user.id]}
                          className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition flex items-center gap-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.is_active
                              ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                              : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
                          }`}
                        >
                          {processing[user.id] === "toggling" ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              {user.is_active ? "Deactivating..." : "Activating..."}
                            </>
                          ) : (
                            <>
                              <i className={`fas ${user.is_active ? "fa-ban" : "fa-check-circle"}`}></i>
                              {user.is_active ? "Deactivate" : "Activate"}
                            </>
                          )}
                        </button>
                      </div>
                    )}
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
                    <tr
                      key={user.id}
                      className={`border-b border-slate-800 ${user.is_superuser ? "bg-amber-500/[0.04]" : "hover:bg-slate-800/20 transition"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getStorageUrl(user.avatar) ? (
                            <img
                              src={getStorageUrl(user.avatar)}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getRoleColor(user.role)}`}
                            >
                              <i className={`fas ${user.is_superuser ? "fa-crown text-amber-400" : "fa-user text-white"}`}></i>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-white">
                                {getDisplayName(user) || "Unknown User"}
                              </p>
                              {user.is_superuser && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                                  <i className="fas fa-crown text-[8px]" />
                                  Super Admin
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400">{user.email}</p>
                            {user.role === "student" && user.roll_no != null && (
                              <p className="text-sm text-slate-400">
                                Roll #{user.roll_no}
                              </p>
                            )}
                            {user.role === "student" && tagsFor(user).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5 max-w-xs">
                                {tagsFor(user).map((tag) => (
                                  <TagChip
                                    key={tag.id}
                                    tag={tag}
                                    onClick={() =>
                                      handleFilterChange("tags", String(tag.id))
                                    }
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getRoleColor(user.role)}`}>
                          {displayRole(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ${getStatusColor(user.is_active)}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_superuser ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 w-fit">
                            <i className="fas fa-lock text-amber-500/70 text-xs" />
                            <span className="text-amber-600/90 text-xs font-semibold">System Protected</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {user.role === "student" && (
                              <button
                                onClick={() => setTagModalUser(user)}
                                className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-600/50 hover:text-indigo-300 transition"
                                title="Manage labels"
                              >
                                <i className="fas fa-tags text-xs"></i>
                              </button>
                            )}
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-600/50 hover:text-slate-200 transition"
                              title="View user"
                            >
                              <i className="fas fa-eye text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="w-8 h-8 flex items-center justify-center bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition"
                              title="Edit user"
                            >
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button
                              onClick={() => handlePurgeUser(user)}
                              disabled={!!processing[user.id]}
                              className="w-8 h-8 flex items-center justify-center bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title={processing[user.id] === "purging" ? "Deleting..." : "Permanently delete"}
                            >
                              <i className={`fas ${processing[user.id] === "purging" ? "fa-spinner fa-spin" : "fa-trash"} text-xs`}></i>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={!!processing[user.id]}
                              style={{ minWidth: "100px" }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition text-center disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.is_active
                                  ? "bg-amber-600/10 text-amber-400 hover:bg-amber-600/20"
                                  : "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
                              }`}
                            >
                              {processing[user.id] === "toggling" ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-1"></i>
                                  {user.is_active ? "Deactivating..." : "Activating..."}
                                </>
                              ) : (
                                <>
                                  <i className={`fas ${user.is_active ? "fa-ban" : "fa-check-circle"} mr-1`}></i>
                                  {user.is_active ? "Deactivate" : "Activate"}
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {labelLibrary && (
        <StudentTagsModal
          student={null}
          tags={tags}
          initialEdit={labelLibrary.edit || null}
          initialDelete={labelLibrary.delete || null}
          onClose={() => setLabelLibrary(null)}
          onTagsChanged={refreshTags}
          onStudentsStale={handleStudentsStale}
          onSaved={() => {}}
        />
      )}

      {tagModalUser && (
        <StudentTagsModal
          student={{
            id: tagModalUser.id,
            name: getDisplayName(tagModalUser) || tagModalUser.email,
            roll_no: tagModalUser.roll_no,
            tags: tagsFor(tagModalUser),
          }}
          tags={tags}
          onClose={() => setTagModalUser(null)}
          onTagsChanged={refreshTags}
          onStudentsStale={handleStudentsStale}
          onSaved={(userId, saved) => {
            setTagOverrides((prev) => ({ ...prev, [userId]: saved }));
            refreshTags(); // keep the filter dropdown counts honest
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        variant={confirmDialog.isActive ? "warning" : "success"}
        title={confirmDialog.isActive ? "Deactivate User" : "Activate User"}
        message={
          confirmDialog.isActive
            ? "Are you sure you want to deactivate this user? They will lose access to the platform."
            : "Are you sure you want to activate this user? They will regain access to the platform."
        }
        loading={processing[confirmDialog.userId] === "toggling"}
        confirmLabel={
          processing[confirmDialog.userId] === "toggling"
            ? confirmDialog.isActive
              ? "Deactivating..."
              : "Activating..."
            : confirmDialog.isActive
              ? "Deactivate"
              : "Activate"
        }
        cancelLabel="Cancel"
        onConfirm={confirmDeleteUser}
        onCancel={() =>
          setConfirmDialog({
            open: false,
            userId: null,
            isActive: false,
            user: null,
          })
        }
      />

      <ConfirmDialog
        open={purgeDialog.open}
        variant="danger"
        title="Delete User Permanently"
        message="This will permanently remove the user record and cannot be undone. This action is irreversible."
        loading={processing[purgeDialog.userId] === "purging"}
        confirmLabel={
          processing[purgeDialog.userId] === "purging" ? "Deleting..." : "Delete"
        }
        cancelLabel="Cancel"
        onConfirm={confirmPurgeUser}
        onCancel={() => setPurgeDialog({ open: false, userId: null })}
      />
    </div>
  );
};

export default UsersTab;
