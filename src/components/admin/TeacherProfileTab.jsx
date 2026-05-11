import React, { useState, useEffect } from "react";
import { Button, Input, Card } from "../ui";
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Professional Summary Section */}
        <Card variant="glass" padding="md" className="border-indigo-500/10">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <i className="fas fa-user-tie text-sm"></i>
            </div>
            <h3 className="text-base font-semibold text-white">Professional Summary</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2.5">
                <i className="fas fa-quote-left text-xs text-indigo-400/60"></i>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className={`w-full bg-slate-900/60 border text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none min-h-[120px] ${
                  errors.bio
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-slate-700/50 hover:border-slate-600 focus:border-indigo-500/50"
                }`}
                placeholder="Write a brief professional biography that highlights the teacher's background and teaching philosophy..."
              />
              {errors.bio && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle text-xs"></i>
                  {getFieldError("bio")}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Professional Details Section */}
        <Card variant="glass" padding="md" className="border-indigo-500/10">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <i className="fas fa-graduation-cap text-sm"></i>
            </div>
            <h3 className="text-base font-semibold text-white">Professional Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2.5">
                <i className="fas fa-star text-xs text-emerald-400/60"></i>
                Expertise
              </label>
              <Input
                value={formData.expertise}
                onChange={(e) => handleInputChange("expertise", e.target.value)}
                placeholder="e.g., Mathematics, Physics"
                error={getFieldError("expertise")}
                className="bg-slate-900/60 border-slate-700/50 hover:border-slate-600 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2.5">
                <i className="fas fa-briefcase text-xs text-emerald-400/60"></i>
                Experience (years)
              </label>
              <Input
                type="number"
                value={formData.experience_years}
                onChange={(e) => handleInputChange("experience_years", e.target.value)}
                placeholder="Years of experience"
                error={getFieldError("experience_years")}
                className="bg-slate-900/60 border-slate-700/50 hover:border-slate-600 transition-all"
              />
            </div>
          </div>
        </Card>

        {/* Connect & Contact Section */}
        <Card variant="glass" padding="md" className="border-indigo-500/10">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <i className="fas fa-link text-sm"></i>
            </div>
            <h3 className="text-base font-semibold text-white">Connect & Contact</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2.5">
                <i className="fab fa-linkedin text-xs text-blue-400/60"></i>
                LinkedIn Profile
              </label>
              <Input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/username"
                error={getFieldError("linkedin")}
                className="bg-slate-900/60 border-slate-700/50 hover:border-slate-600 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2.5">
                <i className="fas fa-phone text-xs text-blue-400/60"></i>
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                error={getFieldError("phone")}
                className="bg-slate-900/60 border-slate-700/50 hover:border-slate-600 transition-all"
              />
            </div>
          </div>
        </Card>

        {/* Distinctions Section */}
        <Card variant="glass" padding="md" className="border-indigo-500/10">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <i className="fas fa-award text-sm"></i>
            </div>
            <h3 className="text-base font-semibold text-white">Achievements & Distinctions</h3>
          </div>
          
          <DistinctionsEditor
            distinctions={formData.distinctions}
            onChange={handleDistinctionsChange}
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="w-full sm:w-auto px-8 bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
          >
            Cancel Changes
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-10 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all duration-300"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-circle-notch fa-spin"></i>
                Saving Profile...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="fas fa-check-circle"></i>
                Save Profile
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeacherProfileTab;
