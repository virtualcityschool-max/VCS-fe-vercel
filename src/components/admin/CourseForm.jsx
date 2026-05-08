import React, { useRef, useState } from "react";
import QuillEditor from "../common/QuillEditor";
import { FilterSelect, Input } from "../ui";
import { getStorageUrl } from "../../utils/storageUrl";
import FileViewerModal from "../common/FileViewerModal";

const fieldClass = (error) =>
  `w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
    error ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
  }`;

const FieldError = ({ error }) =>
  error ? <p className="text-red-400 text-xs mt-1">{error}</p> : null;

const CourseForm = ({ formData = {}, onChange, errors = {}, users = [], categories = [], mode = "create" }) => {
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [viewerUrl, setViewerUrl] = useState(null);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: Basic Info */}
      <div className="space-y-8">
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
            rows={5}
            className={fieldClass(errors.description)}
          />
          <FieldError error={errors.description} />
        </div>

        {/* Category + Status + Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-black text-slate-500 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <FilterSelect
              value={formData.category || ""}
              onChange={(e) => onChange("category", e.target.value)}
              className={fieldClass(errors.category)}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </FilterSelect>
            <FieldError error={errors.category} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-black text-slate-500 mb-2">
              Status <span className="text-red-400">*</span>
            </label>
            <FilterSelect
              value={formData.status || "draft"}
              onChange={(e) => onChange("status", e.target.value)}
              className={fieldClass(errors.status)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              {mode!="create"?<option value="completed">Completed</option>:""}
            </FilterSelect>
            <FieldError error={errors.status} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-black text-slate-500 mb-2">
              Price (PKR) <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              placeholder="0"
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
      </div>

      {/* Right Column: Content & Media */}
      <div className="space-y-6">
        {/* Media Section — Pinned to top for stability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Thumbnail
              <span className="text-slate-500 text-[10px] uppercase font-black ml-2 opacity-50">JPG, PNG</span>
            </label>
            {(thumbnailPreview || existingThumbnail) ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-800 h-[100px]">
                <img
                  src={thumbnailPreview || getStorageUrl(existingThumbnail)}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearThumbnail}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                >
                  <i className="fas fa-times text-[10px]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="w-full h-[100px] flex flex-col items-center justify-center gap-1 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl text-slate-500 hover:text-indigo-400 transition bg-slate-800/20"
              >
                <i className="fas fa-image text-lg"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
              </button>
            )}
            <input ref={thumbnailInputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleThumbnailChange} />
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Attachment
              <span className="text-slate-500 text-[10px] uppercase font-black ml-2 opacity-50">PDF, ZIP</span>
            </label>
            {(existingUrl || selectedFile) ? (
              <div className="flex flex-col justify-center h-[100px] gap-2 p-3 bg-slate-800/40 border border-slate-700 rounded-xl relative group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <i className="fas fa-paperclip text-indigo-400 text-xs shrink-0"></i>
                  <span className="text-slate-300 text-[11px] font-bold truncate">{selectedFile ? selectedFile.name : "Attached File"}</span>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                >
                  <i className="fas fa-times text-[10px]" />
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Change</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-[100px] flex flex-col items-center justify-center gap-1 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl text-slate-500 hover:text-indigo-400 transition bg-slate-800/20"
              >
                <i className="fas fa-paperclip text-lg"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Attach</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {/* Course Outline */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Course Outline
            <span className="text-slate-500 text-[10px] uppercase font-black ml-2 opacity-50">optional</span>
          </label>
          <div className="min-h-[280px]">
            <QuillEditor
              value={formData.outline || ""}
              onChange={(val) => onChange("outline", val)}
              placeholder="Describe the topics, modules, and structure..."
            />
          </div>
        </div>
      </div>

      {viewerUrl && <FileViewerModal filePath={viewerUrl} handleClose={() => setViewerUrl(null)} />}
    </div>
  );
};

export default CourseForm;
