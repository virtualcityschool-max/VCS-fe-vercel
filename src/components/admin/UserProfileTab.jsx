import React, { useState, useEffect } from "react";
import { Button, Input } from "../ui";
import { useFieldErrors } from "../../hooks";
import DistinctionsEditor from "./DistinctionsEditor";

const UserProfileTab = ({ profile, onUpdate }) => {
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

  const { errors, setErrors, clearFieldError, clearAllErrors } = useFieldErrors(
    {},
  );

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
      formData.experience_years &&
      (isNaN(formData.experience_years) || formData.experience_years < 0)
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
    } catch {
      // Error is handled by parent component
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
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Professional Info Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-briefcase text-indigo-400"></i>
            Professional Info
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Brief professional biography..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Expertise
                </label>
                <Input
                  value={formData.expertise}
                  onChange={(e) =>
                    handleInputChange("expertise", e.target.value)
                  }
                  className="w-full bg-slate-800 border-slate-700 text-white"
                  placeholder="e.g., Computer Science, Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Experience (years)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) =>
                    handleInputChange("experience_years", e.target.value)
                  }
                  className="w-full bg-slate-800 border-slate-700 text-white"
                  placeholder="Years of experience"
                  error={errors.experience_years}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 text-white"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  LinkedIn
                </label>
                <Input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) =>
                    handleInputChange("linkedin", e.target.value)
                  }
                  className="w-full bg-slate-800 border-slate-700 text-white"
                  placeholder="https://linkedin.com/in/username"
                  error={errors.linkedin}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-star text-indigo-400"></i>
            Rating
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rating (0-5)
              </label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleInputChange("rating", e.target.value)}
                className="w-full bg-slate-800 border-slate-700 text-white"
                placeholder="4.5"
                error={errors.rating}
              />
              <p className="text-xs text-slate-400 mt-1">
                Auto-calculated from courses. Admin can override.
              </p>
            </div>
          </div>
        </div>

        {/* Distinctions Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-award text-indigo-400"></i>
            Distinctions
          </h3>

          <DistinctionsEditor
            distinctions={formData.distinctions}
            onChange={handleDistinctionsChange}
          />
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
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileTab;
