import React, { useRef } from "react";
import QuillEditor from "../common/QuillEditor";
import { BACKEND_CATEGORIES, formatCategoryLabel } from "../../constants";
import { FilterSelect, Input } from "../ui";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const fieldClass = (error) =>
  `w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
    error ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
  }`;

const FieldError = ({ error }) =>
  error ? <p className="text-red-400 text-xs mt-1">{error}</p> : null;

const CourseForm = ({ formData = {}, onChange, errors = {}, users = [], mode = "create" }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    onChange("attachment", file);
  };

  const clearFile = () => {
    onChange("attachment", null);
    onChange("attachment_url", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const existingUrl = formData.attachment_url;
  const selectedFile = formData.attachment instanceof File ? formData.attachment : null;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Course Title <span className="text-red-400">*</span>
        </label>
        <Input
          type="text"
          placeholder="Enter course title"
          value={formData.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          className={fieldClass(errors.title)}
        />
        <FieldError error={errors.title} />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          placeholder="Describe what students will learn in this course..."
          value={formData.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          rows={4}
          className={fieldClass(errors.description)}
        />
        <FieldError error={errors.description} />
      </div>

      {/* Category + Status + Price */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Category <span className="text-red-400">*</span>
          </label>
          <FilterSelect
            value={formData.category || ""}
            onChange={(e) => onChange("category", e.target.value)}
            className={fieldClass(errors.category)}
          >
            <option value="">Select category</option>
            {BACKEND_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{formatCategoryLabel(cat)}</option>
            ))}
          </FilterSelect>
          <FieldError error={errors.category} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Status <span className="text-red-400">*</span>
          </label>
          <FilterSelect
            value={formData.status || "draft"}
            onChange={(e) => onChange("status", e.target.value)}
            className={fieldClass(errors.status)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </FilterSelect>
          <FieldError error={errors.status} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Price (PKR) <span className="text-red-400">*</span>
          </label>
          <Input
            type="number"
            placeholder="Enter price"
            value={formData.price || ""}
            onChange={(e) => onChange("price", e.target.value)}
            className={fieldClass(errors.price)}
          />
          <FieldError error={errors.price} />
        </div>
      </div>

      {/* Instructor */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Instructor <span className="text-red-400">*</span>
        </label>
        <FilterSelect
          value={
            mode === "edit"
              ? (formData.instructor_id || formData.instructor?.id || "")
              : (formData.instructor_id || "")
          }
          onChange={(e) => onChange("instructor_id", e.target.value)}
          className={fieldClass(errors.instructor_id)}
        >
          <option value="">Select an instructor</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </FilterSelect>
        <FieldError error={errors.instructor_id} />
      </div>

      {/* Schedule Days — weekdays only */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Schedule Days
          <span className="text-slate-500 text-xs font-normal ml-2">optional — weekdays only</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => {
            const selected = (formData.days_of_recurring || []).includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const current = formData.days_of_recurring || [];
                  const next = selected
                    ? current.filter((d) => d !== day)
                    : [...current, day];
                  onChange("days_of_recurring", next);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selected
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/20"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-indigo-500/50 hover:text-slate-200"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Outline — optional */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Course Outline
          <span className="text-slate-500 text-xs font-normal ml-2">optional</span>
        </label>
        <QuillEditor
          value={formData.outline || ""}
          onChange={(val) => onChange("outline", val)}
          placeholder="Describe the topics, modules, and structure of this course..."
        />
      </div>

      {/* Attachment — optional */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Attachment
          <span className="text-slate-500 text-xs font-normal ml-2">optional — PDF, Word, ZIP, images, etc.</span>
        </label>

        {/* Existing attachment (edit mode) */}
        {existingUrl && !selectedFile && (
          <div className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700 rounded-xl mb-2">
            <i className="fas fa-paperclip text-indigo-400 text-sm"></i>
            <span className="text-slate-300 text-sm truncate flex-1">Current attachment</span>
            <a
              href={existingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-xs"
            >
              View
            </a>
            <button type="button" onClick={clearFile} className="text-slate-500 hover:text-red-400 transition">
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        )}

        {/* Selected file preview */}
        {selectedFile && (
          <div className="flex items-center gap-3 p-3 bg-indigo-600/10 border border-indigo-500/30 rounded-xl mb-2">
            <i className="fas fa-file text-indigo-400 text-sm"></i>
            <span className="text-slate-300 text-sm truncate flex-1">{selectedFile.name}</span>
            <span className="text-slate-500 text-xs">{(selectedFile.size / 1024).toFixed(0)} KB</span>
            <button type="button" onClick={clearFile} className="text-slate-500 hover:text-red-400 transition">
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        )}

        {/* File input trigger */}
        {!selectedFile && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-600 hover:border-indigo-500 rounded-xl text-slate-400 hover:text-indigo-400 text-sm transition"
          >
            <i className="fas fa-upload"></i>
            <span>Upload file</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.ppt,.pptx,.xls,.xlsx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default CourseForm;
