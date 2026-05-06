import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
  deleteUser,
  purgeUser,
  toggleUserActive,
  selectUsers,
  fetchAvailableStudents,
  selectAvailableStudents,
} from "../../store/slices/adminSlice";
import {
  Button,
  Input,
  Card,
  PasswordValidation,
  PasswordInput,
  MultiSelect,
  FilterSelect,
} from "../../components/ui";
import { useFieldErrors } from "../../hooks";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRole,
} from "../../utils/validation";
import { toastManager } from "../../utils/toastManager";
import UsersTab from "../../components/admin/UsersTab";
import { showApiError } from "../../utils/apiErrorHandler";

const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Users filter state
  const [usersFilters, setUsersFilters] = useState({
    search: "",
    role: "",
    is_active: "",
    ordering: "-date_joined",
  });

  // Create user form state
  const [createUserForm, setCreateUserForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "student",
    first_name: "",
    last_name: "",
    selected_students: [],
  });

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isMountedRef = useRef(true);

  // Create user form error handling
  const {
    errors: createUserErrors,
    setErrors: setCreateUserErrors,
    handleApiError: handleCreateUserApiError,
    clearAllErrors: clearAllCreateUserErrors,
  } = useFieldErrors({});

  // Get users data from Redux store
  const users = useSelector(selectUsers);
  const availableStudents = useSelector(selectAvailableStudents);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Define handleFetchUsers
  const handleFetchUsers = useCallback(() => {
    const params = {};

    if (usersFilters.search) {
      params.search = usersFilters.search;
    }
    if (usersFilters.role) {
      params.role = usersFilters.role;
    }
    if (usersFilters.is_active !== "") {
      params.is_active = usersFilters.is_active;
    }
    if (usersFilters.ordering) {
      params.ordering = usersFilters.ordering;
    }

    dispatch(fetchUsers(params));
  }, [dispatch, usersFilters]);

  // // Debounced search handler - Fixed the comparison logic
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (isMountedRef.current) {
  //       handleFetchUsers();
  //     }
  //   }, 300); // 300ms debounce

  //   return () => clearTimeout(timer);
  // }, [usersFilters.search, handleFetchUsers]);

  // // Fetch users when component mounts or filters change
  // useEffect(() => {
  //   handleFetchUsers();
  // }, [handleFetchUsers]);

  // Fetch on initial mount + non-search filter changes
  useEffect(() => {
    handleFetchUsers();
  }, [
    handleFetchUsers,
    usersFilters.role,
    usersFilters.is_active,
    usersFilters.ordering,
  ]);

  // Fetch available students when create user modal opens
  useEffect(() => {
    if (activeModal === "create-user") {
      dispatch(fetchAvailableStudents());
    }
  }, [activeModal, dispatch]);

  // Handle active/inactive toggle via PATCH
  const handleDeleteUser = async (userId, user) => {
    try {
      await dispatch(toggleUserActive({ userId, user })).unwrap();
      toastManager.success(user.is_active ? "User deactivated successfully" : "User activated successfully");
    } catch (error) {
      showApiError(error);
    }
  };

  // Handle user purge (hard-delete — permanent removal)
  const handlePurgeUser = async (userId) => {
    try {
      await dispatch(purgeUser(userId)).unwrap();
      toastManager.success("User permanently deleted");
      handleFetchUsers();
    } catch (error) {
      showApiError(error);
    }
  };

  // Handle user editing - navigate to user details page
  const handleEditUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  // Shared reset function for create user modal
  const resetCreateUserModal = useCallback(() => {
    setCreateUserForm({
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "student",
      first_name: "",
      last_name: "",
      selected_students: [],
    });
    setCreateUserErrors({});
    clearAllCreateUserErrors();
  }, [setCreateUserErrors, clearAllCreateUserErrors]);

  // Handle create user
  const handleCreateUser = () => {
    resetCreateUserModal();
    setActiveModal("create-user");
  };

  // Handle close create user modal
  const handleCloseCreateUserModal = () => {
    resetCreateUserModal();
    setActiveModal(null);
  };

  // Validate create user form
  const validateCreateUserForm = (formData) => {
    const errors = {};

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }

    // Username validation
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.error;
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }

    // Confirm password validation
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    // Role validation
    const roleValidation = validateRole(formData.role);
    if (!roleValidation.isValid) {
      errors.role = roleValidation.error;
    }

    return errors;
  };

  // Handle create user submit
  const handleCreateUserSubmit = async (userData) => {
    clearAllCreateUserErrors();

    const validationErrors = validateCreateUserForm(userData);
    if (Object.keys(validationErrors).length > 0) {
      setCreateUserErrors(validationErrors);
      return;
    }

    const payload = {
      email: userData.email.trim(),
      username: userData.username.trim(),
      password: userData.password,
      confirm_password: userData.confirm_password,
      role: userData.role,
      first_name: userData.first_name?.trim() || "",
      last_name: userData.last_name?.trim() || "",
    };

    if (userData.role === "parent" && userData.selected_students?.length > 0) {
      payload.student_emails = userData.selected_students.map(
        (student) => student.email,
      );
    }

    try {
      setIsCreatingUser(true);
      await dispatch(createUser(payload)).unwrap();
      toastManager.success("User created successfully");
      resetCreateUserModal();
      setActiveModal(null);
      handleFetchUsers();
    } catch (error) {
      showApiError(error);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <>
      <UsersTab
        users={users?.data || []}
        loading={users?.loading || false}
        usersFilters={usersFilters}
        setUsersFilters={setUsersFilters}
        onUserDelete={handleDeleteUser}
        onUserPurge={handlePurgeUser}
        onFetchUsers={handleFetchUsers}
        onUserEdit={handleEditUser}
        onCreateUser={handleCreateUser}
      />

      {/* Create User Modal */}
      {activeModal === "create-user" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-800 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">Create User</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add a new user to the platform</p>
              </div>
              <button
                onClick={handleCloseCreateUserModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <i className="fas fa-times text-sm" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 px-1">
              {/* Username + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={createUserForm.username}
                    onChange={(e) => { setCreateUserForm({ ...createUserForm, username: e.target.value }); if (createUserErrors.username) setCreateUserErrors((prev) => ({ ...prev, username: undefined })); }}
                    className="w-full"
                    placeholder="Username"
                    autoComplete="off"
                    error={createUserErrors.username}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={createUserForm.email}
                    onChange={(e) => { setCreateUserForm({ ...createUserForm, email: e.target.value }); if (createUserErrors.email) setCreateUserErrors((prev) => ({ ...prev, email: undefined })); }}
                    className="w-full"
                    placeholder="Email"
                    autoComplete="off"
                    error={createUserErrors.email}
                  />
                </div>
              </div>

              {/* First Name + Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                  <Input
                    value={createUserForm.first_name}
                    onChange={(e) => { setCreateUserForm({ ...createUserForm, first_name: e.target.value }); if (createUserErrors.first_name) setCreateUserErrors((prev) => ({ ...prev, first_name: undefined })); }}
                    className="w-full"
                    placeholder="First Name"
                    autoComplete="off"
                    error={createUserErrors.first_name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                  <Input
                    value={createUserForm.last_name}
                    onChange={(e) => { setCreateUserForm({ ...createUserForm, last_name: e.target.value }); if (createUserErrors.last_name) setCreateUserErrors((prev) => ({ ...prev, last_name: undefined })); }}
                    className="w-full"
                    placeholder="Last Name"
                    autoComplete="off"
                    error={createUserErrors.last_name}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <FilterSelect
                  value={createUserForm.role}
                  onChange={(e) => { setCreateUserForm({ ...createUserForm, role: e.target.value }); if (createUserErrors.role) setCreateUserErrors((prev) => ({ ...prev, role: undefined })); }}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </FilterSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <PasswordInput
                  value={createUserForm.password}
                  onChange={(e) => {
                    setCreateUserForm({ ...createUserForm, password: e.target.value });
                    if (createUserErrors.password) setCreateUserErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Password"
                  autoComplete="new-password"
                  error={createUserErrors.password}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
                {createUserForm.password && (
                  <PasswordValidation password={createUserForm.password} />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <PasswordInput
                  value={createUserForm.confirm_password}
                  onChange={(e) => {
                    setCreateUserForm({ ...createUserForm, confirm_password: e.target.value });
                    if (createUserErrors.confirm_password) setCreateUserErrors((prev) => ({ ...prev, confirm_password: undefined }));
                  }}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  error={createUserErrors.confirm_password}
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>

              {createUserForm.role === "parent" && (
                <div>
                  <MultiSelect
                    options={availableStudents.data || []}
                    value={createUserForm.selected_students}
                    onChange={(selectedStudents) => {
                      setCreateUserForm({
                        ...createUserForm,
                        selected_students: selectedStudents,
                      });
                      // Clear field error when user starts typing
                      if (createUserErrors.selected_students) {
                        setCreateUserErrors((prev) => ({
                          ...prev,
                          selected_students: undefined,
                        }));
                      }
                    }}
                    label="Select Students"
                    placeholder="Choose students to link..."
                    error={createUserErrors.selected_students}
                    loading={availableStudents.loading}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 shrink-0">
              <Button
                variant="secondary"
                onClick={handleCloseCreateUserModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleCreateUserSubmit(createUserForm)}
                disabled={isCreatingUser}
                className="flex-1"
              >
                {isCreatingUser ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>
                    Create User
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsersPage;
