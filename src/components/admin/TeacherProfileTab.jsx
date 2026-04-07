import React, { useState, useEffect } from "react";
import { Button, Input } from "../ui";
import { useFieldErrors } from "../../hooks";
import DistinctionsEditor from "./DistinctionsEditor";

const TeacherProfileTab = ({ profile, onUpdate }) => {
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
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bio Section */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-pen text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Professional Bio
                </h3>
                <p className="text-sm text-slate-400">
                  Share your teaching experience and philosophy
                </p>
              </div>
            </div>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className={`w-full bg-slate-900/60 border text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none transition-all duration-300 placeholder-slate-500 shadow-inner ${errors.bio ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-600/50"}`}
              rows="4"
              placeholder="Tell us about your teaching experience, educational philosophy, and what makes you passionate about education..."
            />
            {errors.bio && (
              <p className="mt-3 text-sm text-red-400 flex items-center gap-2 animate-pulse">
                <i className="fas fa-exclamation-circle text-sm"></i>
                {getFieldError("bio")}
              </p>
            )}
          </div>
        </div>

        {/* Expertise Section */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-graduation-cap text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Areas of Expertise
                </h3>
                <p className="text-sm text-slate-400">
                  Subjects and specializations
                </p>
              </div>
            </div>
            <Input
              value={formData.expertise}
              onChange={(e) => handleInputChange("expertise", e.target.value)}
              placeholder="e.g., Mathematics, Physics, Computer Science, Literature"
              error={getFieldError("expertise")}
              className="bg-slate-900/60 rounded-2xl px-6 py-4 shadow-inner"
            />
          </div>
        </div>

        {/* Experience and Rating Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <i className="fas fa-clock text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Experience
                  </h3>
                  <p className="text-sm text-slate-400">Years of teaching</p>
                </div>
              </div>
              <Input
                type="number"
                value={formData.experience_years}
                onChange={(e) =>
                  handleInputChange("experience_years", e.target.value)
                }
                placeholder="Years of experience"
                error={getFieldError("experience_years")}
                className="bg-slate-900/60 rounded-2xl px-6 py-4 shadow-inner"
              />
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <i className="fas fa-star text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    Rating
                  </h3>
                  <p className="text-sm text-slate-400">
                    Performance rating (0.0 - 5.0)
                  </p>
                </div>
              </div>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => handleInputChange("rating", e.target.value)}
                placeholder="0.0 - 5.0"
                error={getFieldError("rating")}
                className="bg-slate-900/60 rounded-2xl px-6 py-4 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <i className="fab fa-linkedin text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    LinkedIn Profile
                  </h3>
                  <p className="text-sm text-slate-400">
                    Professional networking
                  </p>
                </div>
              </div>
              <Input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/username"
                error={getFieldError("linkedin")}
                className="bg-slate-900/60 rounded-2xl px-6 py-4 shadow-inner"
              />
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <i className="fas fa-phone text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Phone Number
                  </h3>
                  <p className="text-sm text-slate-400">Contact information</p>
                </div>
              </div>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                error={getFieldError("phone")}
                className="bg-slate-900/60 rounded-2xl px-6 py-4 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Distinctions Section */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-trophy text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Professional Distinctions
                </h3>
                <p className="text-sm text-slate-400">
                  Awards and achievements
                </p>
              </div>
            </div>
            <DistinctionsEditor
              distinctions={formData.distinctions}
              onChange={handleDistinctionsChange}
            />
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

export default TeacherProfileTab;
