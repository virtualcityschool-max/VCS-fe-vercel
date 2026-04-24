import React from "react";
import { BACKEND_CATEGORIES, formatCategoryLabel } from "../../constants";
import { FilterSelect, Input } from "../ui";

const fieldClass = (error) =>
  `w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
    error ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
  }`;

const FieldError = ({ error }) =>
  error ? <p className="text-red-400 text-xs mt-1">{error}</p> : null;

const CourseForm = ({ formData = {}, onChange, errors = {}, users = [], mode = "create" }) => {
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
    </div>
  );
};

export default CourseForm;
