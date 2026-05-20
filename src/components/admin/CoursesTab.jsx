import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, FilterSelect, SearchInput } from "../../components/ui";
import CourseForm from "./CourseForm";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

import { GradingScaleButton } from "./GradingScaleModal";

// ── Course Categories Modal ───────────────────────────────────────────────────
const CourseCategoriesModal = ({ onClose, onCategoriesChanged, initialEditId, initialDeleteId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [newName, setNewName]       = useState("");
  const [editingId, setEditingId]   = useState(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [dirty, setDirty]           = useState(false);

  useEffect(() => {
    coursesService.getCategories()
      .then((data) => {
        setCategories(data);
        if (initialEditId) {
          const cat = data.find((c) => c.id === initialEditId);
          if (cat) { setEditingId(initialEditId); setEditingName(cat.name); }
        }
        if (initialDeleteId) {
          setConfirmDeleteId(initialDeleteId);
        }
      })
      .catch(() => toastManager.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  const applyLocal = (updated) => {
    setCategories(updated);
    setDirty(true);
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const updated = [...categories, { name }].sort((a, b) => a.name.localeCompare(b.name));
    applyLocal(updated);
    setNewName("");
  };

  const handleEdit = (id) => {
    const name = editingName.trim();
    if (!name) return;
    const updated = categories.map((c) => (c.id === id ? { ...c, name } : c));
    applyLocal(updated);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    const updated = categories.filter((c) => c.id !== id);
    applyLocal(updated);
    setConfirmDeleteId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const synced = await coursesService.syncCategories(categories);
      setCategories(synced);
      onCategoriesChanged(synced);
      setDirty(false);
      toastManager.success("Categories saved");
    } catch (err) {
      showApiError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fas fa-tags text-indigo-400 text-sm" />
              Course Categories
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Add, rename, or delete course categories</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {/* Category list */}
        <div className="px-6 py-4 space-y-2 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No categories yet. Add one below.</p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/40"
              >
                {editingId === cat.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEdit(cat.id)}
                      autoFocus
                      className="flex-1 bg-slate-700 text-white text-sm px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <button
                      onClick={() => handleEdit(cat.id)}
                      disabled={saving}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-slate-400 hover:text-slate-300 text-xs px-2 py-1 rounded-lg hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : confirmDeleteId === cat.id ? (
                  <>
                    <i className="fas fa-exclamation-triangle text-amber-400 text-xs flex-shrink-0" />
                    <span className="flex-1 text-slate-300 text-xs">Delete "{cat.name}"?</span>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={saving}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50"
                    >
                      {saving ? <i className="fas fa-spinner fa-spin" /> : "Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-slate-400 hover:text-slate-300 text-xs px-2 py-1 rounded-lg hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <i className="fas fa-tag text-indigo-400 text-xs flex-shrink-0" />
                    <span className="flex-1 text-slate-200 text-sm">{cat.name}</span>
                    <button
                      onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                      className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-700 transition"
                      title="Rename"
                    >
                      <i className="fas fa-pencil-alt" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(cat.id)}
                      className="text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 transition"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add new */}
        <div className="px-6 pt-3 pb-4 border-t border-slate-800">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
            Add New Category
          </p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Business & Finance"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <i className="fas fa-plus text-xs" />
              Add
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
          >
            {saving ? <i className="fas fa-spinner fa-spin text-xs" /> : <i className="fas fa-check text-xs" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const CoursesTab = ({
  courses,
  users,
  categories,
  onCategoriesChanged,
  loading,
  loadingCourseIds,
  updatingCourseId,
  isCreatingCourse = false,
  editCourseForm,
  setEditCourseForm,
  createCourseForm,
  setCreateCourseForm,
  createCourseErrors,
  clearCreateCourseFieldError,
  editCourseErrors,
  clearEditCourseFieldError,
  onCourseCreate,
  onCourseUpdate,
  onCourseDelete,
  onCourseEdit,
  onAssignInstructor,
  activeModal,
  setActiveModal,
  showCourseFilters,
  setShowCourseFilters,
  courseFilters,
  setCourseFilters,
}) => {
  const navigate = useNavigate();

  const [catDropdownOpen, setCatDropdownOpen]       = useState(false);
  const [categoriesOpenWith, setCategoriesOpenWith] = useState(null); // null | { editId?, deleteId? }
  const catDropdownRef = useRef(null);

  // Close category dropdown on outside click/tap (works on mobile)
  useEffect(() => {
    if (!catDropdownOpen) return;
    const handler = (e) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [catDropdownOpen]);

  // Filter courses based on search term and filters
  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    const filtered = courses.filter((course) => {
      // Search filter (title, instructor, category, description)
      const matchesSearch =
        courseFilters.search === "" ||
        course.title
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        course.instructor?.username
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        (typeof course.category === "object" ? course.category?.name : course.category)
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        course.description
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase());
      // Category filter — compare by normalized name
      const matchesCategory =
        courseFilters.category === "" ||
        (() => {
          const cat = course.category;
          if (!cat) return false;
          const catName = typeof cat === "object" ? cat.name : String(cat);
          return (catName || "").toLowerCase().replace(/\s+/g, "") === courseFilters.category;
        })();

      // Price range filter
      const matchesPrice =
        courseFilters.priceRange === "" ||
        (() => {
          const price = parseFloat(course.price) || 0;
          if (courseFilters.priceRange.includes("-")) {
            const [min, max] = courseFilters.priceRange.split("-").map(parseFloat);
            return price >= min && price <= max;
          }
          if (courseFilters.priceRange.endsWith("+")) {
            const min = parseFloat(courseFilters.priceRange.replace("+", "")) || 0;
            return price >= min;
          }
          return true;
        })();

      // Status filter
      const matchesStatus =
        courseFilters.status === "" || 
        String(course.status || "").toLowerCase() === courseFilters.status.toLowerCase();
      
      // Instructor filter
      const matchesInstructor =
        courseFilters.instructor === "" ||
        (() => {
          const inst = course.instructor;
          if (!inst) return false;
          // Check if instructor is an object with id or just an ID
          const instId = typeof inst === "object" ? inst.id : inst;
          return String(instId) === courseFilters.instructor;
        })();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesStatus &&
        matchesInstructor
      );
    });

    return filtered;
  }, [courses, courseFilters]);

  // Check if any course filters are active
  const hasActiveCourseFilters = useMemo(() => {
    return Object.values(courseFilters).some((value) => value !== "");
  }, [courseFilters]);

  // Reset all course filters
  const resetCourseFilters = () => {
    setCourseFilters({
      search: "",
      category: "",
      priceRange: "",
      status: "",
      instructor: "",
    });
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await onCourseCreate(createCourseForm);
      // Success toast and modal close handled by AdminDashboard
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

 const filterOptions = useMemo(() => {
    const instructors = courses ? [
      ...new Set(
        courses.map((course) => course.instructor?.username).filter(Boolean),
      ),
    ] : [];

    // Dynamic price ranges based on course prices
    const prices = (courses || []).map((c) => parseFloat(c.price) || 0);
    const maxPrice = Math.max(...prices, 0);
    
    let priceRanges = [];
    if (maxPrice === 0) {
      priceRanges = [{ value: "0-0", label: "Free" }];
    } else {
      // Determine a reasonable step based on max price, ensuring it ends with 0
      // We aim for approximately 5 ranges
      let step = Math.ceil(maxPrice / 5 / 10) * 10;
      if (step === 0) step = 10;
      
      for (let i = 0; i < maxPrice; i += step) {
        const lower = i;
        const upper = i + step;
        priceRanges.push({
          value: `${lower}-${upper}`,
          label: `PKR ${lower.toFixed(0)} - ${upper.toFixed(0)}`,
        });
      }
    }

    return {
      instructors: instructors.sort(),
      priceRanges,
    };
  }, [courses]);

  return (
    <div className="space-y-6">
      {/* Course Management Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:justify-end">
          <SearchInput
            value={courseFilters.search}
            onChange={(e) => setCourseFilters({ ...courseFilters, search: e.target.value })}
            onClear={() => setCourseFilters({ ...courseFilters, search: "" })}
            placeholder="Search courses..."
            className="w-full sm:w-56"
          />
          {/* 2-per-row on mobile for category + selects */}
          <div className="grid grid-cols-2 sm:contents gap-2">
          {/* Category filter dropdown with inline add/edit/delete */}
          <div className="relative" ref={catDropdownRef}>
            <button
              onClick={() => setCatDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border border-slate-700/70 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all w-full sm:w-auto sm:min-w-[160px] justify-between"
            >
              <span className="flex items-center gap-1.5 truncate">
                <i className="fas fa-tags text-xs text-indigo-400 shrink-0" />
                <span className="truncate">
                  {courseFilters.category
                    ? (categories.find((c) => c.name.toLowerCase().replace(/\s+/g, "") === courseFilters.category)?.name ?? "Category")
                    : "All Categories"}
                </span>
              </span>
              <i className={`fas fa-chevron-down text-xs text-slate-500 shrink-0 transition-transform duration-200 ${catDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {catDropdownOpen && (
              <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 w-56 overflow-hidden">
                {/* All Categories — fixed, not scrolled */}
                <button
                  onClick={() => { setCourseFilters({ ...courseFilters, category: "" }); setCatDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 text-sm transition flex items-center gap-2 ${courseFilters.category === "" ? "text-indigo-400 bg-indigo-500/10" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                >
                  <i className="fas fa-border-all text-xs opacity-60" />
                  All Categories
                </button>

                {categories.length > 0 && <div className="border-t border-slate-800" />}

                {/* Scrollable category list with fixed height */}
                <div className="max-h-48 overflow-y-auto overscroll-contain">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-800/70 group"
                    >
                      <button
                        onClick={() => { 
                          const normalized = cat.name.toLowerCase().replace(/\s+/g, "");
                          setCourseFilters({ ...courseFilters, category: normalized }); 
                          setCatDropdownOpen(false); 
                        }}
                        className={`flex-1 text-left text-sm px-1.5 py-1 rounded-lg transition truncate ${courseFilters.category === cat.name.toLowerCase().replace(/\s+/g, "") ? "text-indigo-400 font-semibold" : "text-slate-300 group-hover:text-white"}`}
                      >
                        {cat.name}
                      </button>
                      {/* Always visible on mobile, hover-only on desktop */}
                      <button
                        onClick={() => { setCatDropdownOpen(false); setCategoriesOpenWith({ editId: cat.id }); }}
                        title="Rename"
                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-slate-700 transition text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                      >
                        <i className="fas fa-pencil-alt" />
                      </button>
                      <button
                        onClick={() => { setCatDropdownOpen(false); setCategoriesOpenWith({ deleteId: cat.id }); }}
                        title="Delete"
                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800" />

                {/* Add Category — fixed at bottom */}
                <button
                  onClick={() => { setCatDropdownOpen(false); setCategoriesOpenWith({}); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition font-semibold"
                >
                  <i className="fas fa-plus text-xs" />
                  Add Category
                </button>
              </div>
            )}
          </div>

          <FilterSelect
            className="w-full sm:w-auto"
            value={courseFilters.priceRange}
            onChange={(e) => setCourseFilters({ ...courseFilters, priceRange: e.target.value })}
          >
            <option value="">All Prices</option>
                {filterOptions.priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
          </FilterSelect>
          <FilterSelect
            className="w-full sm:w-auto"
            value={courseFilters.status}
            onChange={(e) => setCourseFilters({ ...courseFilters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </FilterSelect>
          <FilterSelect
            className="w-full sm:w-auto"
            value={courseFilters.instructor}
            onChange={(e) => setCourseFilters({ ...courseFilters, instructor: e.target.value })}
          >
            <option value="">All Instructors</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </FilterSelect>
          </div>{/* end 2-col grid */}

          <div className="flex items-center gap-2 flex-wrap">
            <GradingScaleButton />
            <button
              onClick={() => setActiveModal("create-course")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all duration-150"
            >
              <i className="fas fa-plus text-xs"></i>
              <span>Create Course</span>
            </button>
            {hasActiveCourseFilters && (
              <button
                onClick={resetCourseFilters}
                title="Clear all filters"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700/70 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm font-medium transition-all duration-150"
              >
                <i className="fas fa-times text-xs"></i>
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Results Info */}
      {hasActiveCourseFilters && (
        <div className="mb-4 text-sm text-slate-400">
          Showing {filteredCourses.length} of {courses?.length || 0} courses
        </div>
      )}

      {/* Courses List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Course
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Instructor
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-48"></div>
                        <div className="h-3 bg-slate-700 rounded w-64"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                        <div className="h-4 bg-slate-700 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="h-8 bg-slate-700 rounded w-12"></div>
                        <div className="h-8 bg-slate-700 rounded w-12"></div>
                        <div className="h-8 bg-slate-700 rounded w-16"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-800/50 space-y-4">
              {filteredCourses?.map((course) => (
                <div
                  key={course.id}
                  className="p-4 sm:p-6 hover:bg-slate-800/30 transition cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/courses/${course.id}`)
                  }
                >
                  <div className="flex flex-col gap-4">
                    {/* Course Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                        <i className="fas fa-book text-indigo-400 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base mb-1">
                          {course.title}
                        </p>
                        {/* <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {course.description}
                        </p> */}
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-400">
                      {course.instructor ? (
                        <div className="flex items-center gap-2">
                          <i className="fas fa-user text-indigo-400"></i>
                          <span>{course.instructor.username}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <i className="fas fa-user-slash text-slate-500"></i>
                          <span>Not assigned</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <i className="fas fa-tag text-purple-400"></i>
                        <span>{course.category?.name?? course.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-dollar-sign text-amber-400"></i>
                        <span>PKR {course.price?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i
                          className={`fas fa-circle text-xs ${
                            course.status === "published"
                              ? "text-emerald-400"
                              : "text-slate-500"
                          }`}
                        ></i>
                        <span>{course.status}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex flex-col gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onCourseEdit(course.id)}
                        className="bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-600/50 transition flex items-center gap-2"
                      >
                        <i className="fas fa-edit"></i>
                        <span>Edit Course</span>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditCourseForm((prev) => ({
                              ...prev,
                              instructor_id:
                                course.instructor?.id || course.instructor_id || "",
                            }));
                            setActiveModal({
                              type: "assign-instructor",
                              courseId: course.id,
                            });
                          }}
                          className="bg-blue-600/10 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600 hover:text-white transition flex items-center gap-2 flex-1"
                        >
                          <i className="fas fa-user-plus"></i>
                          <span>Assign Instructor</span>
                        </button>
                        <button
                          onClick={() => onCourseDelete(course.id)}
                          disabled={loadingCourseIds.has(course.id)}
                          className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition disabled:opacity-50 flex items-center gap-2 flex-1"
                        >
                          <i className="fas fa-trash"></i>
                          <span>
                            {loadingCourseIds.has(course.id)
                              ? "Deleting..."
                              : "Delete"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden lg:table w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Course
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Instructor
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">
                    Enrolled Students
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredCourses?.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-800/30 transition cursor-pointer"
                    onClick={() =>
                      navigate(`/admin/courses/${course.id}`)
                    }
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-white group-hover:text-indigo-400 transition">
                          {course.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {course.instructor ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-indigo-400 text-xs"></i>
                          </div>
                          <span className="text-slate-300 text-sm">
                            {course.instructor.username}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">
                          Not assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full text-xs font-medium border border-slate-600 md:text-nowrap">
                        {course.category?.name ?? course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        PKR {course.price?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === "published"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-700/50 text-slate-300 border border-slate-600"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        {course.enrolled_students_count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-2 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onCourseEdit(course.id)}
                          className="bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-600/50 transition"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => onCourseDelete(course.id)}
                          disabled={loadingCourseIds.has(course.id)}
                          className="bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/20 transition disabled:opacity-50"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          {loadingCourseIds.has(course.id)
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Results State */}
        {!loading && filteredCourses.length === 0 && hasActiveCourseFilters && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-slate-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-slate-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              No Courses Found
            </h3>
            <p className="text-slate-400 text-center mb-6 max-w-md mx-auto">
              No courses match your current filter criteria. Try adjusting your
              filters or clearing them to see more results.
            </p>
            <button
              onClick={resetCourseFilters}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200"
            >
              <i className="fas fa-times mr-2"></i>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {activeModal === "create-course" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 sm:p-8 w-full max-w-2xl lg:max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">
            <div className="flex flex-col gap-1 mb-8 pb-6 border-b border-white/5 relative">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white tracking-tight">Create New Course</h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              <p className="text-slate-500 text-[12px] font-medium leading-relaxed max-w-2xl">
                Fill in the details below to initialize a new educational course for the platform.
              </p>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <CourseForm
                mode="create"
                formData={createCourseForm}
                onChange={(field, value) => {
                  setCreateCourseForm((prev) => ({ ...prev, [field]: value }));
                  clearCreateCourseFieldError(field);
                }}
                errors={createCourseErrors}
                users={users}
                categories={categories}
              />
              <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-white/5">
                <Button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingCourse}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingCourse ? (
                    <><i className="fas fa-spinner fa-spin"></i> Creating...</>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {activeModal &&
        typeof activeModal === "object" &&
        activeModal.type === "edit-course" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 sm:p-8 w-full max-w-2xl lg:max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl transition-all duration-300">
              <div className="flex flex-col gap-1 mb-8 pb-6 border-b border-white/5 relative">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-white tracking-tight">Edit Course</h3>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <i className="fas fa-times text-lg"></i>
                  </button>
                </div>
                <p className="text-slate-500 text-[12px] font-medium leading-relaxed max-w-2xl">
                  Course content is hidden after completion. Please refer to the <span className="text-indigo-400 font-bold">Evaluations</span> tab for final grades and student performance.
                </p>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await onCourseUpdate(editCourseForm);
                  } catch (error) {
                    console.error("Failed to update course:", error);
                  }
                }}
                className="space-y-4"
              >
                <CourseForm
                  mode="edit"
                  formData={editCourseForm}
                  onChange={(field, value) => {
                    setEditCourseForm((prev) => ({ ...prev, [field]: value }));
                    clearEditCourseFieldError(field);
                  }}
                  errors={editCourseErrors}
                  users={users}
                  categories={categories}
                />
                <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-white/5">
                  <Button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!!updatingCourseId}
                    className="bg-indigo-600 hover:bg-indigo-500"
                  >
                    {updatingCourseId ? "Updating..." : "Update Course"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Assign Instructor Modal */}
      {activeModal &&
        typeof activeModal === "object" &&
        activeModal.type === "assign-instructor" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  Assign Instructor
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await onAssignInstructor(
                      activeModal.courseId,
                      editCourseForm.instructor_id,
                    );
                    setActiveModal(null);
                  } catch (error) {
                    console.error("Failed to assign instructor:", error);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Instructor <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editCourseForm.instructor_id}
                    onChange={(e) => {
                      setEditCourseForm({
                        ...editCourseForm,
                        instructor_id: e.target.value,
                      });
                      clearEditCourseFieldError("instructor_id");
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select an instructor</option>
                    {users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500"
                  >
                    Assign Instructor
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      {categoriesOpenWith !== null && (
        <CourseCategoriesModal
          onClose={() => setCategoriesOpenWith(null)}
          onCategoriesChanged={(updated) => {
            onCategoriesChanged(updated);
            // If the active filter category was deleted, reset to "All"
            if (courseFilters.category && !updated.find((c) => c.id.toString() === courseFilters.category)) {
              setCourseFilters((prev) => ({ ...prev, category: "" }));
            }
          }}
          initialEditId={categoriesOpenWith?.editId}
          initialDeleteId={categoriesOpenWith?.deleteId}
        />
      )}
    </div>
  );
};

export default CoursesTab;
