import React, { useState, useEffect } from "react";
import { Button, Input, PhoneInput } from "../ui";
import { useFieldErrors } from "../../hooks";
import { validatePhone, normalizePhone } from "../../utils/validation";
import DistinctionsEditor from "./DistinctionsEditor";

const TeacherProfileTab = ({ profile, onUpdate, onCancel, onSaved, readOnly = false }) => {
  const [formData, setFormData] = useState({
    bio: "",
    qualification: "",
    expertise: "",
    experience_years: "",
    rating: "",
    linkedin: "",
    phone: "",
    distinctions: [],
  });

  const [isSaving, setIsSaving] = useState(false);

  const { errors, setErrors, clearFieldError, clearAllErrors, handleApiError, getFieldError } =
    useFieldErrors({});

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio ?? "",
        qualification: profile.qualification ?? "",
        expertise: profile.expertise ?? "",
        experience_years: profile.experience_years ?? "",
        rating: profile.rating ?? "",
        linkedin: profile.linkedin ?? "",
        phone: profile.phone ?? "",
        distinctions: profile.distinctions ?? [],
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) clearFieldError(field);
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.experience_years === "" || formData.experience_years === null || formData.experience_years === undefined) {
      newErrors.experience_years = "Experience years is required";
    } else if (isNaN(formData.experience_years) || formData.experience_years < 0) {
      newErrors.experience_years = "Must be a positive number";
    }
    if (formData.rating && (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = "Must be between 0 and 5";
    }
    if (formData.linkedin && !formData.linkedin.match(/^https?:\/\/(www\.)?linkedin\.com\/.+/)) {
      newErrors.linkedin = "Please enter a valid LinkedIn URL";
    }
    if (formData.phone) {
      const r = validatePhone(formData.phone);
      if (!r.isValid) newErrors.phone = r.error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      await onUpdate({
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : "",
        rating: formData.rating ? parseFloat(formData.rating) : "",
        phone: normalizePhone(formData.phone),
      });
      clearAllErrors();
      if (onSaved) onSaved();
    } catch (error) {
      const orig = error.originalError || error;
      if (orig?.response?.data?.details) setErrors(orig.response.data.details);
      else handleApiError(orig);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      bio: profile?.bio ?? "",
      qualification: profile?.qualification ?? "",
      expertise: profile?.expertise ?? "",
      experience_years: profile?.experience_years ?? "",
      rating: profile?.rating ?? "",
      linkedin: profile?.linkedin ?? "",
      phone: profile?.phone ?? "",
      distinctions: profile?.distinctions ?? [],
    });
    clearAllErrors();
    if (onCancel) onCancel();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Bio — full width */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            rows={3}
            placeholder="Brief professional biography…"
            disabled={readOnly}
            className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none transition disabled:opacity-60 disabled:cursor-default ${
              errors.bio
                ? "border-rose-500/60"
                : "border-slate-700 hover:border-slate-600 focus:border-indigo-500/60"
            }`}
          />
          {errors.bio && <p className="mt-1 text-xs text-rose-400">{getFieldError("bio")}</p>}
        </div>

        {/* Expertise · Experience · Qualification — 3 col */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Expertise</label>
            <Input
              value={formData.expertise}
              onChange={(e) => handleInputChange("expertise", e.target.value)}
              placeholder="e.g. Mathematics"
              error={getFieldError("expertise")}
              className="w-full bg-slate-800 text-white"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Experience (years)</label>
            <Input
              type="number"
              value={formData.experience_years}
              onChange={(e) => handleInputChange("experience_years", e.target.value)}
              placeholder="e.g. 5"
              error={getFieldError("experience_years")}
              className="w-full bg-slate-800 text-white"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Qualification</label>
            <Input
              value={formData.qualification}
              onChange={(e) => handleInputChange("qualification", e.target.value)}
              placeholder="e.g. MSc Computer Science"
              error={getFieldError("qualification")}
              className="w-full bg-slate-800 text-white"
              disabled={readOnly}
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rating <span className="text-slate-500 font-normal text-xs">(0 – 5)</span>
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => handleInputChange("rating", e.target.value)}
              placeholder="e.g. 4.5"
              error={getFieldError("rating")}
              className="w-full bg-slate-800 text-white"
            />
          </div> */}
        </div>

        {/* Phone · LinkedIn — 2 col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
            <PhoneInput
              value={formData.phone}
              onChange={(val) => handleInputChange("phone", val)}
              error={getFieldError("phone")}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn Profile</label>
            <Input
              type="url"
              value={formData.linkedin}
              onChange={(e) => handleInputChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              error={getFieldError("linkedin")}
              className="w-full bg-slate-800 text-white"
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Distinctions */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Achievements &amp; Distinctions</label>
          <DistinctionsEditor
            distinctions={formData.distinctions}
            onChange={(d) => !readOnly && handleInputChange("distinctions", d)}
            readOnly={readOnly}
          />
        </div>

        {/* Actions */}
        {!readOnly && (
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-1">
            <Button type="button" variant="secondary" onClick={handleCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? (
                <><i className="fas fa-spinner fa-spin mr-2" />Saving...</>
              ) : (
                <><i className="fas fa-save mr-2" />Save Profile</>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TeacherProfileTab;
