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

const ParentProfileTab = ({ profile, onUpdate, onCancel, onSaved }) => {
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
    // Reset form to original profile data
    setFormData({
      phone: profile?.phone || "",
      address: profile?.address || "",
    });
    clearAllErrors();
    if (onCancel) {
      onCancel();
    }
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
              error={getFieldError("phone")}
              className="bg-slate-900/60 border-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={`w-full bg-slate-900/60 border text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 resize-none ${
                errors.address
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-700 focus:ring-indigo-500/30"
              }`}
              rows="3"
              placeholder="Enter full address"
            />
            {errors.address && (
              <p className="mt-2 text-sm text-red-400">{getFieldError("address")}</p>
            )}
          </div>
        </div>

        {/* Linked Children Section */}
        {profile?.children && profile.children.length > 0 && (
          <div className="border border-slate-800 rounded-xl p-4">
              <h3 className="text-base font-semibold text-white mb-3">Linked Children</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.children.map((child) => (
                  <div
                    key={child.id}
                    className="bg-slate-900/60 border border-slate-700 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-600/30 rounded-full flex items-center justify-center">
                        <i className="fas fa-user-graduate text-white text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{child.username}</p>
                        <p className="text-xs text-slate-400">Student ID: {child.id}</p>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleUnlinkChild(child.id, child.username)
                          }
                          disabled={isUnlinking}
                          className="mt-3 px-3 py-1.5 text-sm disabled:opacity-50"
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
          </div>
        )}

        {/* Link New Children Section - Always show */}
        <div className="border border-slate-800 rounded-xl p-4">
            <h3 className="text-base font-semibold text-white mb-3">Link New Children</h3>

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
