import React, { useState, useEffect } from "react";
import { Button, Input } from "../ui";
import { useFieldErrors } from "../../hooks";

const StudentProfileTab = ({ profile, onUpdate }) => {
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
      grade_level: profile?.grade_level || "",
      date_of_birth: profile?.date_of_birth || "",
      phone: profile?.phone || "",
    });
    clearAllErrors();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Academic Information Section */}
        <div className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-graduation-cap text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Academic Information
                </h3>
                <p className="text-sm text-slate-400">
                  Student's educational details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Level */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-layer-group text-blue-400 text-sm"></i>
                  Grade Level
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-5 h-5 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-graduation-cap text-white text-xs"></i>
                    </div>
                  </div>
                  <select
                    value={formData.grade_level}
                    onChange={(e) =>
                      handleInputChange("grade_level", e.target.value)
                    }
                    className={`w-full bg-slate-900/60 border text-white rounded-2xl pl-12 pr-10 py-4 focus:outline-none focus:ring-4 transition-all duration-300 shadow-inner appearance-none cursor-pointer ${
                      errors.grade_level
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-600/50 focus:border-blue-500/50 focus:ring-blue-500/20 hover:border-slate-500/50"
                    } group-hover:shadow-lg`}
                  >
                    <option value="" className="bg-slate-800">
                      Select Grade Level
                    </option>
                    <option value="Kindergarten" className="bg-slate-800">
                      Kindergarten
                    </option>
                    <option value="Grade 1" className="bg-slate-800">
                      Grade 1
                    </option>
                    <option value="Grade 2" className="bg-slate-800">
                      Grade 2
                    </option>
                    <option value="Grade 3" className="bg-slate-800">
                      Grade 3
                    </option>
                    <option value="Grade 4" className="bg-slate-800">
                      Grade 4
                    </option>
                    <option value="Grade 5" className="bg-slate-800">
                      Grade 5
                    </option>
                    <option value="Grade 6" className="bg-slate-800">
                      Grade 6
                    </option>
                    <option value="Grade 7" className="bg-slate-800">
                      Grade 7
                    </option>
                    <option value="Grade 8" className="bg-slate-800">
                      Grade 8
                    </option>
                    <option value="Grade 9" className="bg-slate-800">
                      Grade 9
                    </option>
                    <option value="Grade 10" className="bg-slate-800">
                      Grade 10
                    </option>
                    <option value="Grade 11" className="bg-slate-800">
                      Grade 11
                    </option>
                    <option value="Grade 12" className="bg-slate-800">
                      Grade 12
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <div className="w-6 h-6 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-chevron-down text-blue-400 text-xs"></i>
                    </div>
                  </div>
                </div>
                {errors.grade_level && (
                  <p className="mt-3 text-sm text-red-400 flex items-center gap-2 animate-pulse">
                    <i className="fas fa-exclamation-circle text-sm"></i>
                    {getFieldError("grade_level")}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-calendar text-purple-400 text-sm"></i>
                  Date of Birth
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-5 h-5 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-birthday-cake text-white text-xs"></i>
                    </div>
                  </div>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      handleInputChange("date_of_birth", e.target.value)
                    }
                    error={getFieldError("date_of_birth")}
                    showErrorMessage={false}
                    className="w-full bg-slate-900/60 text-white rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 shadow-inner hover:border-slate-500/50 group-hover:shadow-lg"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <div className="w-6 h-6 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-chevron-down text-purple-400 text-xs"></i>
                    </div>
                  </div>
                </div>
                {errors.date_of_birth && (
                  <p className="mt-3 text-sm text-red-400 flex items-center gap-2 animate-pulse">
                    <i className="fas fa-exclamation-circle text-sm"></i>
                    {getFieldError("date_of_birth")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-linear-to-br from-green-500 via-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-phone text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Contact Information
                </h3>
                <p className="text-sm text-slate-400">
                  How to reach the student
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <i className="fas fa-mobile-alt text-green-400 text-sm"></i>
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-5 h-5 bg-linear-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-phone text-white text-xs"></i>
                  </div>
                </div>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  error={getFieldError("phone")}
                  showErrorMessage={false}
                  className="w-full bg-slate-900/60 text-white rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 shadow-inner hover:border-slate-500/50 group-hover:shadow-lg"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div className="w-6 h-6 bg-linear-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-mobile-alt text-green-400 text-xs"></i>
                  </div>
                </div>
              </div>
              {errors.phone && (
                <p className="mt-3 text-sm text-red-400 flex items-center gap-2 animate-pulse">
                  <i className="fas fa-exclamation-circle text-sm"></i>
                  {getFieldError("phone")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Student Progress Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border border-slate-700/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-3xl hover:border-slate-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-chart-line text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Student Information
                </h3>
                <p className="text-sm text-slate-400">
                  Current academic status
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-600/30 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:border-slate-500/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-book text-white text-sm"></i>
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    Current Grade
                  </span>
                </div>
                <p className="text-white font-bold text-lg">
                  {formData.grade_level || "Not Set"}
                </p>
              </div>
              <div className="group bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-600/30 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:border-slate-500/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-birthday-cake text-white text-sm"></i>
                  </div>
                  <span className="text-sm text-slate-400 font-medium">
                    Age
                  </span>
                </div>
                <p className="text-white font-bold text-lg">
                  {formData.date_of_birth
                    ? `${Math.floor((new Date() - new Date(formData.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))} years`
                    : "Not Set"}
                </p>
              </div>
              <div className="group bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-600/30 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:border-slate-500/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-linear-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
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
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 p-8 rounded-3xl bg-linear-to-br from-slate-800/40 via-slate-900/20 to-slate-800/40 border border-slate-700/50 shadow-2xl backdrop-blur-xl">
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

export default StudentProfileTab;
