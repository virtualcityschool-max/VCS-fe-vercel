import React, { useRef, useState } from "react";
import QuillEditor from "../common/QuillEditor";
import { BACKEND_CATEGORIES, formatCategoryLabel } from "../../constants";
import { FilterSelect, Input } from "../ui";
import { getStorageUrl } from "../../utils/storageUrl";

const fieldClass = (error) =>
  `w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
    error ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
  }`;

const FieldError = ({ error }) =>
  error ? <p className="text-red-400 text-xs mt-1">{error}</p> : null;

const CourseForm = ({ formData = {}, onChange, errors = {}, users = [], mode = "create" }) => {
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    onChange("attachment", file);
  };

  const clearFile = () => {
    onChange("attachment", null);
    onChange("attachment_url", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0] || null;
    if (!file) return;
    onChange("thumbnail", file);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
  };

  const clearThumbnail = () => {
    onChange("thumbnail", null);
    onChange("thumbnail_url", null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const existingUrl = formData.attachment_url;
  const selectedFile = formData.attachment instanceof File ? formData.attachment : null;
  const existingThumbnail = formData.thumbnail_url;
  const selectedThumbnail = formData.thumbnail instanceof File ? formData.thumbnail : null;

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

      {/* Thumbnail — optional */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Course Thumbnail
          <span className="text-slate-500 text-xs font-normal ml-2">optional — JPG, PNG, JPEG</span>
        </label>

        {/* Preview */}
        {(thumbnailPreview || existingThumbnail) && !selectedThumbnail && existingThumbnail && (
          <div className="relative mb-2 w-full rounded-xl overflow-hidden border border-slate-700" style={{ height: 140 }}>
            <img
              src={getStorageUrl(existingThumbnail)}
              alt="Current thumbnail"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={clearThumbnail}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition"
            >
              <i className="fas fa-times text-xs" />
            </button>
          </div>
        )}

        {thumbnailPreview && selectedThumbnail && (
          <div className="relative mb-2 w-full rounded-xl overflow-hidden border border-indigo-500/40" style={{ height: 140 }}>
            <img
              src={thumbnailPreview}
              alt="New thumbnail preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-black/50 text-xs text-white truncate">
              {selectedThumbnail.name}
            </div>
            <button
              type="button"
              onClick={clearThumbnail}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition"
            >
              <i className="fas fa-times text-xs" />
            </button>
          </div>
        )}

        {!thumbnailPreview && !existingThumbnail && (
          <button
            type="button"
            onClick={() => thumbnailInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-600 hover:border-indigo-500 rounded-xl text-slate-400 hover:text-indigo-400 text-sm transition"
          >
            <i className="fas fa-image"></i>
            <span>Upload thumbnail</span>
          </button>
        )}

        {(thumbnailPreview || existingThumbnail) && (
          <button
            type="button"
            onClick={() => thumbnailInputRef.current?.click()}
            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            <i className="fas fa-pencil-alt mr-1 text-[10px]" />
            Replace thumbnail
          </button>
        )}

        <input
          ref={thumbnailInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={handleThumbnailChange}
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
