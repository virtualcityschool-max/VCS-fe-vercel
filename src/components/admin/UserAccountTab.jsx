import React, { useState } from "react";
import { Button, Input, PasswordValidation, PasswordInput } from "../ui";
import { validateEmail, validatePassword } from "../../utils/validation";
import { useFieldErrors } from "../../hooks";

const UserAccountTab = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "student",
    is_active: user?.is_active ?? true,
    is_staff: user?.is_staff ?? false,
    password: "",
    confirm_password: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    errors,
    setErrors,
    clearFieldError,
    clearAllErrors,
    handleApiError,
    getFieldError,
  } = useFieldErrors({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      clearFieldError(field);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation (only if password is provided)
    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }

      // Confirm password validation
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role,
        is_active: formData.is_active,
        is_staff: formData.is_staff,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await onUpdate(updateData);

      // Reset password fields after successful update
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirm_password: "",
      }));

      clearAllErrors();
    } catch (error) {
      // Handle backend field errors using the error hook
      const originalError = error.originalError || error;
      if (originalError?.response?.data?.details) {
        // Set field errors directly from backend response
        setErrors(originalError.response.data.details);
      } else {
        // Use handleApiError for non-field errors
        handleApiError(originalError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      role: user?.role || "student",
      is_active: user?.is_active ?? true,
      is_staff: user?.is_staff ?? false,
      password: "",
      confirm_password: "",
    });
    clearAllErrors();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-user text-indigo-400"></i>
            Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <Input
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full bg-slate-800 text-white"
                placeholder="Username"
                error={getFieldError("username")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full bg-slate-800 text-white"
                placeholder="Email"
                error={getFieldError("email")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date Joined
              </label>
              <Input
                value={formatDate(user?.date_joined)}
                disabled
                className="w-full bg-slate-800/50 border-slate-700 text-slate-400"
                placeholder="Date joined"
              />
            </div>
          </div>
        </div>

        {/* Access Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-shield-alt text-indigo-400"></i>
            Access
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white">
                  Active Account
                </label>
                <p className="text-xs text-slate-400 mt-1">
                  User can log in and access the system
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleInputChange("is_active", !formData.is_active)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_active ? "bg-indigo-600" : "bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white">
                  Staff Access
                </label>
                <p className="text-xs text-slate-400 mt-1">
                  Can access admin panel and staff features
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleInputChange("is_staff", !formData.is_staff)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_staff ? "bg-indigo-600" : "bg-slate-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_staff ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reset Password Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-key text-indigo-400"></i>
            Reset Password
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <PasswordInput
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Leave blank to keep current"
                error={getFieldError("password")}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              {formData.password && (
                <PasswordValidation password={formData.password} />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <PasswordInput
                value={formData.confirm_password}
                onChange={(e) =>
                  handleInputChange("confirm_password", e.target.value)
                }
                placeholder="Repeat new password"
                error={getFieldError("confirm_password")}
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Account
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserAccountTab;
