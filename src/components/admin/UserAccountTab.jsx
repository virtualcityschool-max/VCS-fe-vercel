import React, { useState, useRef } from "react";
import { Button, Input, PasswordValidation, PasswordInput, FilterSelect } from "../ui";
import { validateEmail, validatePassword } from "../../utils/validation";
import { useFieldErrors } from "../../hooks";
import { getStorageUrl } from "../../utils/storageUrl";
import { adminService } from "../../services/adminService";
import { toastManager } from "../../utils/toastManager";

const MAX_AVATAR_MB = 2;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

const UserAccountTab = ({ user, onUpdate, onCancel, onSaved, onAvatarUpdated, readOnly = false }) => {
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

  // ── Avatar ─────────────────────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState(null); // local blob URL
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toastManager.error("Only JPG and PNG files are accepted.");
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      toastManager.error(`Photo must be smaller than ${MAX_AVATAR_MB} MB.`);
      return;
    }
    // Local preview
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const updated = await adminService.updateUserAvatar(user.id, file);
      toastManager.success("Profile photo updated.");
      if (onAvatarUpdated) onAvatarUpdated(updated);
    } catch {
      toastManager.error("Failed to upload photo. Please try again.");
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const currentAvatar = avatarPreview || getStorageUrl(user?.avatar);
  const initials = (user?.username || "U").slice(0, 2).toUpperCase();

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
      if (onSaved) {
        onSaved();
      }
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
    if (onCancel) {
      onCancel();
    }
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
    <div className="space-y-4">

      {/* ── Avatar section ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex-wrap sm:flex-nowrap">
        {/* Avatar circle */}
        <div className="relative group flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-600 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            {currentAvatar ? (
              <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-black">{initials}</span>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                <i className="fas fa-spinner fa-spin text-white text-lg" />
              </div>
            )}
          </div>

          {/* Upload overlay — only shown when not readOnly */}
          {!readOnly && !avatarUploading && (
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-0.5 transition-opacity cursor-pointer"
            >
              <i className="fas fa-camera text-white text-sm" />
              <span className="text-white text-[8px] font-black uppercase tracking-widest">Change</span>
            </button>
          )}

          <input
            ref={avatarInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white mb-0.5 truncate">{user?.username || "User"}</p>
          <p className="text-xs text-slate-500 capitalize mb-2">{user?.role || "—"}</p>
          {!readOnly && (
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest transition disabled:opacity-50"
            >
              <i className="fas fa-upload text-[9px]" />
              {avatarUploading ? "Uploading…" : "Upload Photo"}
            </button>
          )}
          <p className="text-[9px] text-slate-600 mt-1.5 leading-relaxed">JPG or PNG · Max 2 MB · 200×200px</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
                disabled={readOnly}
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
                disabled={readOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role
              </label>
              <FilterSelect
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled
              >
                <option value="student">Student</option>
                <option value="teacher">Tutor</option>
                <option value="parent">Guardian</option>
                <option value="admin">Admin</option>
              </FilterSelect>
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

        <div className="flex items-center gap-2 py-1">
          <p className="text-sm font-medium text-white">Account Status</p>
          <button
            type="button"
            onClick={() => !readOnly && handleInputChange("is_active", !formData.is_active)}
            disabled={readOnly}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.is_active ? "bg-indigo-600" : "bg-slate-600"
            } ${readOnly ? "opacity-60 cursor-default" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.is_active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-xs font-semibold ${formData.is_active ? "text-emerald-400" : "text-slate-500"}`}>
            {formData.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {!readOnly && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        )}

        {!readOnly && (
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-1">
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
        )}
      </form>
    </div>
  );
};

export default UserAccountTab;
