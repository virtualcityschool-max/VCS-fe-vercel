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

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".zip"];
const MAX_FILE_SIZE_MB = 10;

const CourseForm = ({ formData = {}, onChange, errors = {}, users = [], categories = [], mode = "create" }) => {
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    if (!file) return;

    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFileError(null);
    onChange("attachment", file);
  };

  const clearFile = () => {
    onChange("attachment", null);
    onChange("attachment_url", null);
    setFileError(null);
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

        {/* Category + Status + Pricing toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-black text-slate-500 mb-2">
              Level <span className="text-red-400">*</span>
            </label>
            <FilterSelect
              value={formData.category || ""}
              onChange={(e) => onChange("category", e.target.value)}
              className={fieldClass(errors.category)}
            >
              <option value="">Select level</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
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
              Pricing
            </label>
            <div className="flex rounded-lg overflow-hidden border border-slate-700">
              <button
                type="button"
                onClick={() => { onChange("is_paid", false); onChange("price", "0"); onChange("gumroad_product_permalink", ""); }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition ${!formData.is_paid ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-300"}`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => onChange("is_paid", true)}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition ${formData.is_paid ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-300"}`}
              >
                Paid
              </button>
            </div>
          </div>
        </div>

        {/* Price + Gumroad — only shown for paid courses */}
        {formData.is_paid && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-black text-slate-500 mb-2">
                Price (USD) <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                placeholder="0"
                max="10000000"
                value={formData.price || ""}
                onChange={(e) => onChange("price", e.target.value)}
                className={fieldClass(errors.price)}
              />
              <FieldError error={errors.price} />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-black text-slate-500 mb-2">
                Gumroad Permalink <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. mcrqh or https://gumroad.com/l/mcrqh"
                value={formData.gumroad_product_permalink || ""}
                onChange={(e) => onChange("gumroad_product_permalink", e.target.value.trim())}
                className={fieldClass(errors.gumroad_product_permalink)}
              />
              <FieldError error={errors.gumroad_product_permalink} />
            </div>
          </div>
        )}

        {/* Instructor */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tutor <span className="text-red-400">*</span>
          </label>
          {mode === "edit" && (formData.has_session || formData.enrolled_students_count) ? (
            <>
              <input
                type="text"
                value={
                  users.find((u) => u.id === Number(formData.instructor_id || formData.instructor?.id))?.username ||
                  formData.instructor?.username ||
                  "—"
                }
                disabled
                className="w-full px-3 py-2 bg-slate-700/40 border border-slate-700/40 rounded-lg text-slate-400 cursor-not-allowed text-sm"
              />
              <p className="text-[10px] text-slate-500 mt-1">Tutor cannot be changed once a class has been created for this course.</p>
            </>
          ) : (
            <>
              <FilterSelect
                value={
                  mode === "edit"
                    ? (formData.instructor_id || formData.instructor?.id || "")
                    : (formData.instructor_id || "")
                }
                onChange={(e) => onChange("instructor_id", e.target.value)}
                className={fieldClass(errors.instructor_id)}
              >
                <option value="">Select an tutor</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.username}{user.email ? ` — ${user.email}` : ""}</option>
                ))}
              </FilterSelect>
              <FieldError error={errors.instructor_id} />
            </>
          )}
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
              <span className="text-slate-500 text-[10px] uppercase font-black ml-2 opacity-50">PDF, ZIP, DOC</span>
            </label>
            
            {(existingUrl || selectedFile) ? (
              <div className="flex flex-col justify-center h-[100px] gap-2 p-3 bg-slate-800/40 border border-slate-700 rounded-xl relative group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <i className="fas fa-paperclip text-indigo-400 text-xs shrink-0"></i>
                  <span className="text-slate-300 text-[11px] font-bold truncate">
                    {selectedFile ? selectedFile.name : "Current Attachment"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {existingUrl && !selectedFile && (
                    <button
                      type="button"
                      onClick={() => setViewerUrl(getStorageUrl(existingUrl))}
                      className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300"
                    >
                      Preview
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
                  >
                    Change
                  </button>
                </div>

                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                >
                  <i className="fas fa-times text-[10px]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-[100px] flex flex-col items-center justify-center gap-1 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl text-slate-500 hover:text-indigo-400 transition bg-slate-800/20"
              >
                <i className="fas fa-paperclip text-lg"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Attach File</span>
              </button>
            )}

            {fileError ? (
              <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                <i className="fas fa-exclamation-circle"></i> {fileError}
              </p>
            ) : (
              <p className="text-slate-600 text-[9px] mt-1">Max 10MB</p>
            )}
            
            <input 
              ref={fileInputRef} 
              type="file" 
              accept={ALLOWED_EXTENSIONS.join(",")} 
              className="hidden" 
              onChange={handleFileChange} 
            />
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

      {viewerUrl && (
        <FileViewerModal filePath={viewerUrl} handleClose={() => setViewerUrl(null)} />
      )}
    </div>
  );
};

export default CourseForm;
