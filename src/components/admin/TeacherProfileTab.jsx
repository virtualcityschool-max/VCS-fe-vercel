import React, { useState, useEffect } from "react";
import { Button, Input } from "../ui";
import { useFieldErrors } from "../../hooks";
import DistinctionsEditor from "./DistinctionsEditor";

const TeacherProfileTab = ({ profile, onUpdate, onCancel, onSaved }) => {
  const [formData, setFormData] = useState({
    bio: "",
    expertise: "",
    experience_years: "",
    rating: "",
    linkedin: "",
    phone: "",
    distinctions: [],
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
        bio: profile.bio || "",
        expertise: profile.expertise || "",
        experience_years: profile.experience_years || "",
        rating: profile.rating || "",
        linkedin: profile.linkedin || "",
        phone: profile.phone || "",
        distinctions: profile.distinctions || [],
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

  const handleDistinctionsChange = (distinctions) => {
    setFormData((prev) => ({ ...prev, distinctions }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Experience years validation
    if (
      formData.experience_years === "" ||
      formData.experience_years === null ||
      formData.experience_years === undefined
    ) {
      newErrors.experience_years = "Experience years is required";
    } else if (
      isNaN(formData.experience_years) ||
      formData.experience_years < 0
    ) {
      newErrors.experience_years = "Experience years must be a positive number";
    }

    // Rating validation
    if (
      formData.rating &&
      (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 5)
    ) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    // LinkedIn URL validation
    if (
      formData.linkedin &&
      !formData.linkedin.match(/^https?:\/\/(www\.)?linkedin\.com\/.+/)
    ) {
      newErrors.linkedin = "Please enter a valid LinkedIn URL";
    }

    // Phone number validation (basic numeric check)
    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone =
        "Phone number must contain only digits, spaces, and basic formatting";
    } else if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = "Phone number must not exceed 20 characters";
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
        experience_years: formData.experience_years
          ? parseInt(formData.experience_years)
          : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
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
      bio: profile?.bio || "",
      expertise: profile?.expertise || "",
      experience_years: profile?.experience_years || "",
      rating: profile?.rating || "",
      linkedin: profile?.linkedin || "",
      phone: profile?.phone || "",
      distinctions: profile?.distinctions || [],
    });
    clearAllErrors();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            className={`w-full bg-slate-900/60 border text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 resize-none ${
              errors.bio
                ? "border-red-500 focus:ring-red-500/20"
                : "border-slate-700 focus:ring-indigo-500/30"
            }`}
            rows="3"
            placeholder="Brief professional biography..."
          />
          {errors.bio && <p className="mt-2 text-sm text-red-400">{getFieldError("bio")}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Expertise</label>
          <Input
            value={formData.expertise}
            onChange={(e) => handleInputChange("expertise", e.target.value)}
            placeholder="e.g., Mathematics, Physics"
            error={getFieldError("expertise")}
            className="bg-slate-900/60 border-slate-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Experience (years)
            </label>
            <Input
              type="number"
              value={formData.experience_years}
              onChange={(e) => handleInputChange("experience_years", e.target.value)}
              placeholder="Years of experience"
              error={getFieldError("experience_years")}
              className="bg-slate-900/60 border-slate-700"
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rating (0.0 - 5.0)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => handleInputChange("rating", e.target.value)}
              placeholder="0.0 - 5.0"
              error={getFieldError("rating")}
              className="bg-slate-900/60 border-slate-700"
            />
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              LinkedIn
            </label>
            <Input
              type="url"
              value={formData.linkedin}
              onChange={(e) => handleInputChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              error={getFieldError("linkedin")}
              className="bg-slate-900/60 border-slate-700"
            />
          </div>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Distinctions
          </label>
          <DistinctionsEditor
            distinctions={formData.distinctions}
            onChange={handleDistinctionsChange}
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

export default TeacherProfileTab;
