import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, FilterSelect, SearchInput } from "../../components/ui";
import CourseForm from "./CourseForm";
import { PageHeader, SegmentedTabs, FilterBar, DataTable, StatusPill, DeptPill, Avatar, IconButton } from "./ui";
import { DEPARTMENTS, departmentOf } from "./ui/departments";
import { coursesService } from "../../services/coursesService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { getDisplayName } from "../../utils/userDisplay";

import { GradingScaleButton } from "./GradingScaleModal";
import CourseStudentsModal from "../courses/CourseStudentsModal";

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
              Course Levels
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Add, rename, or delete course levels</p>
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
            Add New Level
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

// Subject department definitions matching VCS standard
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
  courseFilters,
  setCourseFilters,
}) => {
  const navigate = useNavigate();

  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [categoriesOpenWith, setCategoriesOpenWith] = useState(null); // null | { editId?, deleteId? }
  const [selectedRosterCourse, setSelectedRosterCourse] = useState(null); // null | { id, title }
  // Filter courses based on search term, filters, and department
  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    const filtered = courses.filter((course) => {
      // Search filter (title, instructor, category, description)
      const matchesSearch =
        courseFilters.search === "" ||
        course.title
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        getDisplayName(course.instructor)
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        (typeof course.category === "object" ? course.category?.name : course.category)
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        course.description
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase());

      // Category / Level filter - compare by normalized name
      const matchesCategory =
        courseFilters.category === "" ||
        (() => {
          const cat = course.category;
          if (!cat) return false;
          const catName = typeof cat === "object" ? cat.name : String(cat);
          return (catName || "").toLowerCase().replace(/\s+/g, "") === courseFilters.category;
        })();

      // Department quick filter
      const matchesDept =
        selectedDepartment === "all" ||
        (() => {
          return departmentOf(course.title).id === selectedDepartment;
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
          const instId = typeof inst === "object" ? inst.id : inst;
          return String(instId) === courseFilters.instructor;
        })();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDept &&
        matchesPrice &&
        matchesStatus &&
        matchesInstructor
      );
    });

    return filtered;
  }, [courses, courseFilters, selectedDepartment]);

  // Check if any course filters are active
  const hasActiveCourseFilters = useMemo(() => {
    return Object.values(courseFilters).some((value) => value !== "") || selectedDepartment !== "all";
  }, [courseFilters, selectedDepartment]);

  // Reset all course filters
  const resetCourseFilters = () => {
    setCourseFilters({
      search: "",
      category: "",
      priceRange: "",
      status: "",
      instructor: "",
    });
    setSelectedDepartment("all");
  };

  // Course metrics
  const courseMetrics = useMemo(() => {
    let published = 0;
    let draft = 0;
    let paid = 0;
    let free = 0;
    (courses || []).forEach((c) => {
      if (c.status === "published") published++;
      else draft++;
      if (c.is_paid) paid++;
      else free++;
    });
    return {
      total: courses?.length || 0,
      published,
      draft,
      paid,
      free,
    };
  }, [courses]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await onCourseCreate(createCourseForm);
      // Success toast and modal close handled by AdminDashboard
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  const [sort, setSort] = useState("title");
  const statusTab = courseFilters.status || "all";
  const levelOptions = (categories || []).map((c) => ({
    label: c.name,
    value: (c.name || "").toLowerCase().replace(/\s+/g, ""),
    count: (courses || []).filter((x) => ((typeof x.category === "object" ? x.category?.name : x.category) || "").toLowerCase().replace(/\s+/g, "") === (c.name || "").toLowerCase().replace(/\s+/g, "")).length,
  }));
  const teacherOptions = [...new Map((courses || []).filter((c) => c.instructor?.id).map((c) => [String(c.instructor.id), getDisplayName(c.instructor)])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ value, label }));
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sort === "students") return (b.enrolled_students_count || 0) - (a.enrolled_students_count || 0);
    if (sort === "price") return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
    if (sort === "unassigned") return (a.instructor ? 1 : 0) - (b.instructor ? 1 : 0);
    return (a.title || "").localeCompare(b.title || "");
  });

  const openAssign = (course) => {
    setEditCourseForm((prev) => ({ ...prev, instructor_id: course.instructor?.id || "" }));
    setActiveModal({ type: "assign-instructor", courseId: course.id });
  };

  const subjectColumns = [
    {
      header: "Subject",
      cell: (c) => (
        <div className="min-w-[220px] max-w-[320px]">
          <div className="font-semibold text-slate-100 truncate">{c.title}</div>
          <div className="text-[11px] text-slate-400 truncate">{(c.description || "").replace(/<[^>]+>/g, "").slice(0, 80)}</div>
        </div>
      ),
    },
    { header: "Department", cell: (c) => <DeptPill dept={departmentOf(c.title)} /> },
    { header: "Level", cell: (c) => <span className="text-slate-300 whitespace-nowrap">{(typeof c.category === "object" ? c.category?.name : c.category) || "—"}</span> },
    {
      header: "Teacher",
      cell: (c) =>
        c.instructor ? (
          <button type="button" onClick={(e) => { e.stopPropagation(); openAssign(c); }} className="flex items-center gap-2 text-left hover:text-indigo-300" title="Change teacher">
            <Avatar name={getDisplayName(c.instructor)} />
            <span className="text-slate-200 whitespace-nowrap">{getDisplayName(c.instructor)}</span>
          </button>
        ) : (
          <button type="button" onClick={(e) => { e.stopPropagation(); openAssign(c); }} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 whitespace-nowrap">
            + Assign teacher
          </button>
        ),
    },
    { header: "Price", align: "right", cell: (c) => <span className="tabular-nums font-semibold text-slate-200 whitespace-nowrap">{c.is_paid && parseFloat(c.price) > 0 ? `$${parseFloat(c.price)}/mo` : <span className="text-emerald-400">Free</span>}</span> },
    {
      header: "Students",
      align: "right",
      cell: (c) => (
        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedRosterCourse({ id: c.id, title: c.title }); }} className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 tabular-nums text-xs font-semibold" title="See enrolled students">
          <i className="fas fa-users text-[10px] mr-1" aria-hidden="true" />{c.enrolled_students_count ?? 0}
        </button>
      ),
    },
    { header: "Status", cell: (c) => <StatusPill status={c.status === "published" ? "Published" : "Draft"} /> },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Subjects"
        subtitle={`${courseMetrics.total} subjects · ${courseMetrics.published} published · ${courseMetrics.draft} draft · ${courseMetrics.paid} paid, ${courseMetrics.free} free`}
        primaryAction={{ label: "New subject", icon: "fa-book-medical", onClick: () => setActiveModal("create-course") }}
        extraActions={
          <button type="button" onClick={() => setCategoriesOpenWith({})} className="h-10 px-4 rounded-xl border border-[#232D52] bg-[#121831] text-slate-200 hover:border-indigo-500/40 text-sm font-semibold flex items-center gap-2">
            <i className="fas fa-layer-group text-xs" aria-hidden="true" /> Levels
          </button>
        }
      />

      <SegmentedTabs
        tabs={[
          { id: "all", label: "All", count: courseMetrics.total },
          { id: "published", label: "Published", count: courseMetrics.published },
          { id: "draft", label: "Draft", count: courseMetrics.draft },
        ]}
        value={statusTab}
        onChange={(v) => setCourseFilters((prev) => ({ ...prev, status: v === "all" ? "" : v }))}
      />

      <FilterBar
        search={courseFilters.search}
        onSearch={(v) => setCourseFilters((prev) => ({ ...prev, search: v }))}
        placeholder="Search subject, teacher or level…"
        filters={[
          {
            id: "dept",
            label: "Department",
            value: selectedDepartment,
            onChange: setSelectedDepartment,
            options: DEPARTMENTS.map((d) => ({ label: d.name, value: d.id, count: (courses || []).filter((c) => departmentOf(c.title).id === d.id).length })),
          },
          { id: "level", label: "Level", value: courseFilters.category || "all", onChange: (v) => setCourseFilters((prev) => ({ ...prev, category: v === "all" ? "" : v })), options: levelOptions },
          { id: "teacher", label: "Teacher", value: courseFilters.instructor || "all", onChange: (v) => setCourseFilters((prev) => ({ ...prev, instructor: v === "all" ? "" : v })), options: teacherOptions },
        ]}
        sortOptions={[
          { label: "Name (A–Z)", value: "title" },
          { label: "Most students", value: "students" },
          { label: "Price (lowest)", value: "price" },
          { label: "No teacher first", value: "unassigned" },
        ]}
        sort={sort}
        onSort={setSort}
      />

      {loading && (courses || []).length === 0 ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-[#121831] animate-pulse" />)}</div>
      ) : (
        <DataTable
          columns={subjectColumns}
          rows={sortedCourses}
          onRowClick={(c) => navigate(`/admin/courses/${c.id}`)}
          rowActions={(c) => (
            <>
              <IconButton icon="fa-eye" label="Open subject" onClick={() => navigate(`/admin/courses/${c.id}`)} />
              <IconButton icon="fa-pen" label="Edit" onClick={() => onCourseEdit(c.id)} tone="hover:text-emerald-300" disabled={loadingCourseIds?.has?.(c.id) || updatingCourseId === c.id} />
              <IconButton icon="fa-trash" label="Delete" onClick={() => onCourseDelete(c.id)} tone="hover:text-rose-300" />
            </>
          )}
          empty={
            <div className="py-16 text-center rounded-2xl border border-[#232D52] bg-[#121831]">
              <p className="text-sm text-slate-400">No subjects match these filters.</p>
              {hasActiveCourseFilters && (
                <button type="button" onClick={resetCourseFilters} className="mt-3 text-xs text-indigo-300 hover:text-indigo-200 underline">Clear all filters</button>
              )}
            </div>
          }
        />
      )}

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
                  Assign Teacher
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
                    Select Teacher <span className="text-red-400">*</span>
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
                    <option value="">Select a teacher</option>
                    {users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {getDisplayName(user)}
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
                    Assign Teacher
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

      {selectedRosterCourse && (
        <CourseStudentsModal
          courseId={selectedRosterCourse.id}
          courseTitle={selectedRosterCourse.title}
          onClose={() => setSelectedRosterCourse(null)}
          canUnenroll={true}
        />
      )}
    </div>
  );
};

export default CoursesTab;
