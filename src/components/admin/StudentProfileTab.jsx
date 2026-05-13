import React, { useState, useEffect } from "react";
import { Button, Input, PhoneInput } from "../ui";
import { useFieldErrors } from "../../hooks";

const StudentProfileTab = ({ profile, userId, onUpdate, onCancel, onSaved }) => {
  const [formData, setFormData] = useState({
    grade_level: "",
    date_of_birth: "",
    phone: "",
  });

  const [isSaving, setIsSaving] = useState(false);

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
        grade_level: profile.grade_level || "",
        date_of_birth: profile.date_of_birth || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      clearFieldError(field);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Grade level validation
    if (!formData.grade_level?.trim()) {
      newErrors.grade_level = "Grade level is required";
    }

    // Date of birth validation
    if (!formData.date_of_birth?.trim()) {
      newErrors.date_of_birth = "Date of birth is required";
    } else if (new Date(formData.date_of_birth) > new Date()) {
      newErrors.date_of_birth = "Date of birth cannot be in the future";
    }

    if (formData.phone && formData.phone.replace(/\D/g, "").length < 5) {
      newErrors.phone = "Please enter a valid phone number";
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
      grade_level: profile?.grade_level || "",
      date_of_birth: profile?.date_of_birth || "",
      phone: profile?.phone || "",
    });
    clearAllErrors();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      {/* Student ID — read-only */}
      {userId != null && (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
          <i className="fas fa-id-badge text-indigo-400 text-sm flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Student ID</p>
            <p className="text-white font-semibold text-sm">#{userId}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Grade Level
            </label>
            <Input
              value={formData.grade_level}
              onChange={(e) => handleInputChange("grade_level", e.target.value)}
              placeholder="e.g. Grade 8, A-Level"
              error={getFieldError("grade_level")}
              className="bg-slate-900/60 border-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date of Birth
            </label>
            <Input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              error={getFieldError("date_of_birth")}
              className="w-full bg-slate-900/60 text-white border-slate-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Phone Number
          </label>
          <PhoneInput
            value={formData.phone}
            onChange={(val) => handleInputChange("phone", val)}
            error={getFieldError("phone")}
          />
        </div>

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

export default StudentProfileTab;
