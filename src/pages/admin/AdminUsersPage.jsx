import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  validatePassword,
  validateRole,
} from "../../utils/validation";
import { toastManager } from "../../utils/toastManager";
import UsersTab from "../../components/admin/UsersTab";
import { showApiError } from "../../utils/apiErrorHandler";

const DEFAULT_FILTERS = { search: "", role: "", is_active: "", ordering: "-date_joined" };

const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Restore filters if navigating back from edit, otherwise use defaults
  const [usersFilters, setUsersFilters] = useState(
    () => location.state?.filters ?? DEFAULT_FILTERS,
  );

  // Create user form state
  const [createUserForm, setCreateUserForm] = useState({
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

  // Stores the last filter values the effect actually fetched with, to detect real changes
  const prevFilterRef = useRef(null);

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

  // On mount: if we arrived with filters from dashboard navigation, fetch immediately with those filters
  useEffect(() => {
    if (location.state?.filters) {
      handleFetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when any filter changes (not on mount — AdminLayout owns the initial fetch)
  useEffect(() => {
    const current = { role: usersFilters.role, is_active: usersFilters.is_active, ordering: usersFilters.ordering, search: usersFilters.search };
    const prev = prevFilterRef.current;
    prevFilterRef.current = current;

    if (prev === null) return;

    if (
      prev.role !== current.role ||
      prev.is_active !== current.is_active ||
      prev.ordering !== current.ordering ||
      prev.search !== current.search
    ) {
      handleFetchUsers();
    }
  }, [usersFilters.role, usersFilters.is_active, usersFilters.ordering, usersFilters.search, handleFetchUsers]);

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
    } catch (error) {
      showApiError(error);
    }
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`, { state: { viewOnly: true, filters: usersFilters } });
  };

  // Handle user editing - carry current filters so they can be restored on back
  const handleEditUser = (userId) => {
    navigate(`/admin/users/${userId}`, { state: { filters: usersFilters } });
  };

  // Shared reset function for create user modal
  const resetCreateUserModal = useCallback(() => {
    setCreateUserForm({
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

    // First/Last name validation
    if (!formData.first_name?.trim()) {
      errors.first_name = "First name is required";
    }
    if (!formData.last_name?.trim()) {
      errors.last_name = "Last name is required";
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
      password: userData.password,
      confirm_password: userData.confirm_password,
      role: userData.role,
      first_name: userData.first_name?.trim() || "",
      last_name: userData.last_name?.trim() || "",
      is_active: true,
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
        onUserView={handleViewUser}
        onUserEdit={handleEditUser}
        onCreateUser={handleCreateUser}
      />

      {/* Create User Modal */}
      {activeModal === "create-user" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 sm:p-8 w-full max-w-2xl lg:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">

            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Create User</h3>
                <p className="text-slate-500 text-[12px] font-medium mt-1">Add a new user to the platform</p>
              </div>
              <button
                onClick={handleCloseCreateUserModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <i className="fas fa-times text-lg" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => {
                    setCreateUserForm({ ...createUserForm, email: e.target.value });
                    if (createUserErrors.email)
                      setCreateUserErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className="w-full"
                  placeholder="Email"
                  autoComplete="off"
                  error={createUserErrors.email}
                />
              </div>

              {/* First Name | Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
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

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <FilterSelect
                  value={createUserForm.role}
                  onChange={(e) => {
                    setCreateUserForm({ ...createUserForm, role: e.target.value });
                    if (createUserErrors.role)
                      setCreateUserErrors((prev) => ({
                        ...prev,
                        role: undefined,
                      }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Tutor</option>
                  <option value="parent">Guardian</option>
                  <option value="admin">Admin</option>
                </FilterSelect>
              </div>

              {/* Password | Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
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
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
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
              </div>

              {createUserForm.role === "parent" && (
                <div>
                  <MultiSelect
                    options={availableStudents.data || []}
                    value={createUserForm.selected_students}
                    onChange={(selectedStudents) => {
                      setCreateUserForm({ ...createUserForm, selected_students: selectedStudents });
                      if (createUserErrors.selected_students) setCreateUserErrors((prev) => ({ ...prev, selected_students: undefined }));
                    }}
                    label="Select Students"
                    placeholder="Choose students to link..."
                    error={createUserErrors.selected_students}
                    loading={availableStudents.loading}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-white/5">
              <Button variant="secondary" onClick={handleCloseCreateUserModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleCreateUserSubmit(createUserForm)}
                disabled={isCreatingUser}
              >
                {isCreatingUser ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Creating...</>
                ) : (
                  <><i className="fas fa-user-plus mr-2"></i>Create User</>
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
