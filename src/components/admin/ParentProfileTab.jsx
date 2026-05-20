import React, { useState, useEffect } from "react";
import ConfirmDialog from "../common/ConfirmDialog";
import { useDispatch } from "react-redux";
import { Button, PhoneInput } from "../ui";
import { useFieldErrors } from "../../hooks";
import { validatePhone, normalizePhone } from "../../utils/validation";
import { toastManager } from "../../utils/toastManager";
import {
  unlinkChildLinksAdmin,
  fetchAvailableStudents,
  linkChildLinksAdmin,
} from "../../store/slices/childLinksSlice";
import {
  selectAvailableStudents,
  selectAvailableStudentsLoading,
  selectAvailableStudentsError,
  selectChildLinksLinking,
} from "../../store/slices/childLinksSlice";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { showApiError } from "../../utils/apiErrorHandler";
import SearchInput from "../ui/SearchInput";

const ParentProfileTab = ({ profile, onUpdate, onRefresh, onCancel, onSaved, readOnly = false }) => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const availableStudents = useSelector(selectAvailableStudents);
  const availableStudentsLoading = useSelector(selectAvailableStudentsLoading);
  const availableStudentsError = useSelector(selectAvailableStudentsError);
  const isLinking = useSelector(selectChildLinksLinking);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [unlinkingChildId, setUnlinkingChildId] = useState(null);
  const [confirmUnlink, setConfirmUnlink] = useState({ open: false, childId: null, childUsername: "" });
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

    if (formData.phone) {
      const phoneResult = validatePhone(formData.phone);
      if (!phoneResult.isValid) newErrors.phone = phoneResult.error;
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
      const updateData = {
        ...formData,
        phone: normalizePhone(formData.phone),
      };
      await onUpdate(updateData);
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
    setConfirmUnlink({ open: true, childId, childUsername });
  };

  const handleConfirmUnlink = async () => {
    const { childId, childUsername } = confirmUnlink;
    setConfirmUnlink({ open: false, childId: null, childUsername: "" });
    setUnlinkingChildId(childId);
    try {
      await dispatch(
        unlinkChildLinksAdmin({
          parentId: profile.id,
          studentIds: [childId],
        }),
      ).unwrap();

      toastManager.success(`Successfully unlinked ${childUsername}`);

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setUnlinkingChildId(null);
    }
  };

  const handleLinkChildren = async () => {
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

      toastManager.success(
        `Successfully linked ${selectedStudentIds.length} student(s) to parent.`,
      );

      setSelectedStudentIds([]);

      if (onRefresh) {
        await onRefresh();
      }

      dispatch(fetchAvailableStudents());
    } catch (error) {
      toastManager.error(
        `Failed to link students: ${error.message || "Unknown error"}`,
      );
    }
  };


  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const filteredStudents = availableStudents.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = (
      student.username ||
      `${student.first_name || ""} ${student.last_name || ""}`
    ).toLowerCase();
    return (
      studentName.includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.id?.toString().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number
            </label>
            <PhoneInput
              value={formData.phone}
              onChange={(val) => handleInputChange("phone", val)}
              error={getFieldError("phone")}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              disabled={readOnly}
              className={`w-full bg-slate-900/60 border text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 resize-none disabled:opacity-60 disabled:cursor-default ${
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
                    className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center border border-green-600/30">
                        <i className="fas fa-user-graduate text-green-500 text-base"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{child.username}</p>
                        <div className="space-y-0.5 mt-1">
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <i className="fas fa-id-badge text-[9px]"></i>
                            ID: {child.id}
                          </p>
                          {child.email && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                              <i className="fas fa-envelope text-[9px]"></i>
                              {child.email}
                            </p>
                          )}
                        </div>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              handleUnlinkChild(child.id, child.username)
                            }
                            disabled={unlinkingChildId === child.id}
                            className="mt-4 w-full sm:w-auto px-4 py-1.5 text-xs font-medium rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                          >
                            {unlinkingChildId === child.id ? (
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

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-300">
                  Available Students
                </label>
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  placeholder="Search by name, ID or email..."
                  className="w-full sm:w-72"
                />
              </div>

              {availableStudentsLoading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-slate-400 bg-slate-900/20 rounded-xl border border-dashed border-slate-700">
                  <i className="fas fa-spinner fa-spin text-indigo-500"></i>
                  <span>Loading available students...</span>
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="p-8 bg-slate-800/20 border border-dashed border-slate-700 rounded-xl text-center">
                  <i className="fas fa-user-slash text-slate-500 text-3xl mb-3"></i>
                  <p className="text-sm text-slate-400">
                    No available students to link.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {filteredStudents.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm italic">
                        No students match your search.
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer group ${
                            selectedStudentIds.includes(student.id)
                              ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/20"
                              : "bg-slate-900/40 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/40"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                              selectedStudentIds.includes(student.id)
                                ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                : "border-slate-600 group-hover:border-slate-500 bg-slate-800"
                            }`}
                          >
                            {selectedStudentIds.includes(student.id) && (
                              <i className="fas fa-check text-[10px] text-white"></i>
                            )}
                          </div>
                          
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-600 transition-colors">
                            <i className="fas fa-user-graduate text-slate-400 group-hover:text-slate-300"></i>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {student.username || `${student.first_name || ""} ${student.last_name || ""}`.trim() || student.email.split('@')[0]}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                              <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <i className="fas fa-id-badge text-[9px] text-slate-500"></i>
                                ID: {student.id}
                              </span>
                              <span className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                                <i className="fas fa-envelope text-[9px] text-slate-500"></i>
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                    <span>
                      {selectedStudentIds.length} student(s) selected
                    </span>
                    {selectedStudentIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedStudentIds([])}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                </div>
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
        {!readOnly && (
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
        )}
      </form>
      <ConfirmDialog
        open={confirmUnlink.open}
        variant="danger"
        title="Unlink Child"
        message={`Are you sure you want to unlink ${confirmUnlink.childUsername}? This will remove the parent-child relationship.`}
        confirmLabel="Unlink"
        cancelLabel="Cancel"
        loading={unlinkingChildId !== null}
        onConfirm={handleConfirmUnlink}
        onCancel={() => setConfirmUnlink({ open: false, childId: null, childUsername: "" })}
      />
    </div>
  );
};

export default ParentProfileTab;
