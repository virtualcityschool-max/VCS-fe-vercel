import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, Input } from "../ui";
import { useFieldErrors } from "../../hooks";
import { toastManager } from "../../utils/toastManager";
import {
  unlinkChildLinksAdmin,
  fetchAvailableStudents,
  linkChildLinksAdmin,
} from "../../store/slices/childLinksSlice";
import {
  selectChildLinksUnlinking,
  selectAvailableStudents,
  selectAvailableStudentsLoading,
  selectAvailableStudentsError,
  selectChildLinksLinking,
} from "../../store/slices/childLinksSlice";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const ParentProfileTab = ({ profile, onUpdate }) => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const isUnlinking = useSelector(selectChildLinksUnlinking);
  const availableStudents = useSelector(selectAvailableStudents);
  const availableStudentsLoading = useSelector(selectAvailableStudentsLoading);
  const availableStudentsError = useSelector(selectAvailableStudentsError);
  const isLinking = useSelector(selectChildLinksLinking);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const {
    errors,
    setErrors,
    clearFieldError,
    clearAllErrors,
    handleApiError,
    getFieldError,
  } = useFieldErrors({});

  // Update form state when profile data changes
  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile]);

  // Fetch available students on mount
  useEffect(() => {
    dispatch(fetchAvailableStudents());
  }, [dispatch]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      clearFieldError(field);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Phone validation
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone =
        "Phone number must contain only digits, spaces, and basic formatting";
    } else if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = "Phone number must not exceed 20 characters";
    }

    // Address validation
    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
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
      await onUpdate(formData);
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
    // Reset form to original profile data
    setFormData({
      phone: profile?.phone || "",
      address: profile?.address || "",
    });
    clearAllErrors();
  };

  const handleUnlinkChild = async (childId, childUsername) => {
    const confirmed = window.confirm(
      `Are you sure you want to unlink ${childUsername}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(
        unlinkChildLinksAdmin({
          parentId: profile.id,
          studentIds: [childId],
        }),
      ).unwrap();

      // Show success toast
      toastManager.success(`Successfully unlinked ${childUsername}`);

      // Refresh parent profile
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      // Show error toast
      toastManager.error(
        `Failed to unlink ${childUsername}: ${error.message || "Unknown error"}`,
      );
    }
  };

  const handleLinkChildren = async () => {
    console.log("profile", profile);
    // Validate at least one student selected
    if (selectedStudentIds.length === 0) {
      toastManager.error("Please select at least one student to link.");
      return;
    }

    try {
      await dispatch(
        linkChildLinksAdmin({
          parentId: id,
          studentIds: selectedStudentIds,
        }),
      ).unwrap();

      // Show success toast
      toastManager.success(
        `Successfully linked ${selectedStudentIds.length} student(s) to parent.`,
      );

      // Clear selection
      setSelectedStudentIds([]);

      // Refresh parent profile
      if (onUpdate) {
        onUpdate();
      }

      // Refresh available students list
      dispatch(fetchAvailableStudents());
    } catch (error) {
      // Show error toast
      toastManager.error(
        `Failed to link students: ${error.message || "Unknown error"}`,
      );
    }
  };

  const handleStudentSelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value),
    );
    setSelectedStudentIds(selectedOptions);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Information Section */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-address-card text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Contact Information
                </h3>
                <p className="text-sm text-slate-400">
                  Parent's contact details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-phone text-blue-400 text-sm"></i>
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  error={getFieldError("phone")}
                  variant="glass"
                  className="bg-slate-900/60 rounded-2xl px-6 py-4 shadow-inner"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-home text-purple-400 text-sm"></i>
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full bg-slate-900/60 border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 resize-none transition-all duration-300 placeholder-slate-500 shadow-inner ${errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-600/50"}`}
                  rows="3"
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="mt-3 text-sm text-red-400 flex items-center gap-2 animate-pulse">
                    <i className="fas fa-exclamation-circle text-sm"></i>
                    {getFieldError("address")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Linked Children Section */}
        {profile?.children && profile.children.length > 0 && (
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <i className="fas fa-users text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    Linked Children
                  </h3>
                  <p className="text-sm text-slate-400">
                    Students associated with this parent
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.children.map((child) => (
                  <div
                    key={child.id}
                    className="group bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-600/30 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:border-slate-500/50 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-teal-500 to-green-600 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <i className="fas fa-user-graduate text-white text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">
                          {child.username}
                        </p>
                        <p className="text-sm text-slate-400">
                          Student ID: {child.id}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-400 border border-green-500/20 shadow-sm">
                            <i className="fas fa-check-circle mr-1"></i>
                            Active
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleUnlinkChild(child.id, child.username)
                          }
                          disabled={isUnlinking}
                          className="mt-3 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm border-red-500/50 shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isUnlinking ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Unlinking...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-unlink mr-2"></i>
                              Unlink
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Link New Children Section */}

              <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-info-circle text-white text-sm"></i>
                  </div>
                  <p className="text-sm text-blue-300">
                    These children are linked to this parent account. Children
                    associations are managed through the system administration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Link New Children Section - Always show */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-link text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Link New Children
                </h3>
                <p className="text-sm text-slate-400">
                  Add new students to this parent account
                </p>
              </div>
            </div>

            {availableStudentsError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">
                  Failed to load available students: {availableStudentsError}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Available Students
              </label>
              {availableStudentsLoading ? (
                <div className="flex items-center gap-3 text-slate-400">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Loading available students...</span>
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="p-4 bg-slate-800/50 border border-slate-600/30 rounded-xl">
                  <p className="text-sm text-slate-400">
                    No available students to link.
                  </p>
                </div>
              ) : (
                <>
                  <select
                    multiple
                    value={selectedStudentIds}
                    onChange={handleStudentSelectionChange}
                    className="w-full bg-slate-900/60 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500/50 transition-all duration-300"
                    size="4"
                  >
                    {availableStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.email}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-400">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple
                    students.
                  </p>
                </>
              )}
            </div>

            <Button
              type="button"
              onClick={handleLinkChildren}
              disabled={
                isLinking ||
                availableStudentsLoading ||
                selectedStudentIds.length === 0
              }
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white border-green-500/50 shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLinking ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-3"></i>
                  Linking...
                </>
              ) : (
                <>
                  <i className="fas fa-link mr-3"></i>
                  Link Selected Children
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Parent Summary Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-chart-pie text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Parent Summary
                </h3>
                <p className="text-sm text-slate-400">
                  Quick overview information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-600/30 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:border-slate-500/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-phone text-white text-sm"></i>
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    Contact
                  </span>
                </div>
                <p className="text-white font-bold text-lg">
                  {formData.phone || "Not Set"}
                </p>
              </div>
              <div className="group bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-600/30 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:border-slate-500/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-home text-white text-sm"></i>
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    Address
                  </span>
                </div>
                <p className="text-white font-bold text-lg truncate">
                  {formData.address || "Not Set"}
                </p>
              </div>
              <div className="group bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-600/30 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:border-slate-500/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-users text-white text-sm"></i>
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    Children
                  </span>
                </div>
                <p className="text-white font-bold text-lg">
                  {profile?.children?.length || 0} Linked
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 p-8 rounded-3xl bg-gradient-to-br from-slate-800/40 via-slate-900/20 to-slate-800/40 border border-slate-700/50 shadow-2xl backdrop-blur-xl">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-slate-700/60 to-slate-700/40 hover:from-slate-700/50 hover:to-slate-700/30 text-white border-slate-600/50 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <i className="fas fa-times mr-3"></i>
            Cancel Changes
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-3"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-3"></i>
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ParentProfileTab;
