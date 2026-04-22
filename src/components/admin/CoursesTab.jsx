import React, { useMemo, useState } from "react";
import { Button, Card, Input, FilterSelect, SearchInput } from "../../components/ui";
import { BACKEND_CATEGORIES, formatCategoryLabel } from "../../constants";
import CourseStudentsModal from "../courses/CourseStudentsModal";
import CourseForm from "./CourseForm";

const CoursesTab = ({
  courses,
  users,
  loading,
  loadingCourseIds,
  updatingCourseId,
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
  const [studentsModal, setStudentsModal] = useState(null);

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
        course.category
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase()) ||
        course.description
          ?.toLowerCase()
          .includes(courseFilters.search.toLowerCase());

      // Category filter
      const matchesCategory =
        courseFilters.category === "" ||
        course.category === courseFilters.category;

      // Price range filter
      const matchesPrice =
        courseFilters.priceRange === "" ||
        (() => {
          const price = parseFloat(course.price) || 0;
          switch (courseFilters.priceRange) {
            case "0-50":
              return price >= 0 && price <= 50;
            case "51-100":
              return price >= 51 && price <= 100;
            case "101-500":
              return price >= 101 && price <= 500;
            case "501-1000":
              return price >= 501 && price <= 1000;
            case "1000+":
              return price >= 1000;
            default:
              return true;
          }
        })();

      // Status filter
      const matchesStatus =
        courseFilters.status === "" || course.status === courseFilters.status;

      // Instructor filter
      const matchesInstructor =
        courseFilters.instructor === "" ||
        course.instructor?.id?.toString() === courseFilters.instructor;

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

  return (
    <div className="space-y-6">
      {/* Course Management Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <SearchInput
            value={courseFilters.search}
            onChange={(e) => setCourseFilters({ ...courseFilters, search: e.target.value })}
            onClear={() => setCourseFilters({ ...courseFilters, search: "" })}
            placeholder="Search courses..."
            className="w-full sm:w-56"
          />
          <FilterSelect
            value={courseFilters.category}
            onChange={(e) => setCourseFilters({ ...courseFilters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {BACKEND_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{formatCategoryLabel(cat)}</option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={courseFilters.priceRange}
            onChange={(e) => setCourseFilters({ ...courseFilters, priceRange: e.target.value })}
          >
            <option value="">All Prices</option>
            <option value="0-50">PKR 0–50</option>
            <option value="51-100">PKR 51–100</option>
            <option value="101-500">PKR 101–500</option>
            <option value="501-1000">PKR 501–1000</option>
            <option value="1000+">PKR 1000+</option>
          </FilterSelect>
          <FilterSelect
            value={courseFilters.status}
            onChange={(e) => setCourseFilters({ ...courseFilters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </FilterSelect>
          <FilterSelect
            value={courseFilters.instructor}
            onChange={(e) => setCourseFilters({ ...courseFilters, instructor: e.target.value })}
          >
            <option value="">All Instructors</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </FilterSelect>
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
          <button
            onClick={() => setActiveModal("create-course")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all duration-150"
          >
            <i className="fas fa-plus text-xs"></i>
            <span className="hidden sm:inline">Create Course</span>
            <span className="sm:hidden">+</span>
          </button>
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
                    setStudentsModal({ id: course.id, title: course.title })
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
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {course.description}
                        </p>
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
                        <span>{formatCategoryLabel(course.category)}</span>
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
                      setStudentsModal({ id: course.id, title: course.title })
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
                      <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full text-xs font-medium border border-slate-600">
                        {formatCategoryLabel(course.category)}
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
            <p className="text-slate-400 text-center mb-6 max-w-md">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Create New Course
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
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
              />
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
                  Create Course
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Edit Course</h3>
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
                />
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

      {/* Enrolled Students Modal */}
      {studentsModal && (
        <CourseStudentsModal
          courseId={studentsModal.id}
          courseTitle={studentsModal.title}
          onClose={() => setStudentsModal(null)}
          canUnenroll={true}
        />
      )}

      {/* Assign Instructor Modal */}
      {activeModal &&
        typeof activeModal === "object" &&
        activeModal.type === "assign-instructor" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
    </div>
  );
};

export default CoursesTab;
