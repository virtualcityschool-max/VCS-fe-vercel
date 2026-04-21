import React from "react";
import { BACKEND_CATEGORIES, formatCategoryLabel } from "../../constants";

const RECURRING_DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

const fieldClass = (error) =>
  `w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
    error ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
  }`;

const readonlyClass =
  "w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-400 cursor-not-allowed text-sm";

const FieldError = ({ error }) =>
  error ? <p className="text-red-400 text-xs mt-1">{error}</p> : null;

const CourseForm = ({ formData = {}, onChange, errors = {}, users = [], mode = "create" }) => {
  const isEdit = mode === "edit";

  return (
    <div className="space-y-4">
      {/* Title — always editable */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Course Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter course title"
          value={formData.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          className={fieldClass(errors.title)}
        />
        <FieldError error={errors.title} />
      </div>

      {/* Description — always editable */}
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

      {/* Category — always editable */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Category <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.category || ""}
          onChange={(e) => onChange("category", e.target.value)}
          className={fieldClass(errors.category)}
        >
          <option value="">Select category</option>
          {BACKEND_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {formatCategoryLabel(cat)}
            </option>
          ))}
        </select>
        <FieldError error={errors.category} />
      </div>

      {/* Price + Instructor — create only */}
      {!isEdit && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Price (PKR) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter price"
              value={formData.price || ""}
              onChange={(e) => onChange("price", e.target.value)}
              className={fieldClass(errors.price)}
            />
            <FieldError error={errors.price} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Instructor <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.instructor_id || ""}
              onChange={(e) => onChange("instructor_id", e.target.value)}
              className={fieldClass(errors.instructor_id)}
            >
              <option value="">Select an instructor</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            <FieldError error={errors.instructor_id} />
          </div>
        </>
      )}

      {/* Status — always editable */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Status <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.status || "draft"}
          onChange={(e) => onChange("status", e.target.value)}
          className={fieldClass(errors.status)}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <FieldError error={errors.status} />
      </div>

      {/* Instructor — read-only in edit mode */}
      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Instructor <span className="text-slate-500 text-xs ml-1">(read-only)</span>
          </label>
          <div className={readonlyClass + " flex items-center gap-2"}>
            <i className="fas fa-user text-slate-500 text-xs"></i>
            <span>{formData.instructor?.username || "—"}</span>
          </div>
        </div>
      )}

      {/* Time — editable on create, read-only on edit */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Time {!isEdit && <span className="text-red-400">*</span>}
          {isEdit && <span className="text-slate-500 text-xs ml-1">(read-only)</span>}
        </label>
        <input
          type="time"
          value={formData.time || ""}
          disabled={isEdit}
          onChange={isEdit ? undefined : (e) => onChange("time", e.target.value)}
          className={isEdit ? readonlyClass : fieldClass(errors.time)}
        />
        {!isEdit && <FieldError error={errors.time} />}
      </div>

      {/* Days — editable on create, read-only on edit */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Days of Recurring {!isEdit && <span className="text-red-400">*</span>}
          {isEdit && <span className="text-slate-500 text-xs ml-1">(read-only)</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {RECURRING_DAYS.map((day) => {
            const selected = (formData.days_of_recurring || []).includes(day);
            if (isEdit) {
              return (
                <span
                  key={day}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    selected
                      ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                      : "bg-slate-800/50 border-slate-700/50 text-slate-600"
                  }`}
                >
                  {day}
                </span>
              );
            }
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const next = selected
                    ? formData.days_of_recurring.filter((d) => d !== day)
                    : [...(formData.days_of_recurring || []), day];
                  onChange("days_of_recurring", next);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  selected
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        {!isEdit && <FieldError error={errors.days_of_recurring} />}
      </div>
    </div>
  );
};

export default CourseForm;
