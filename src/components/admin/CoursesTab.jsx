import React, { useMemo } from "react";
import { Button, Input, Card } from "../../components/ui";
import { BACKEND_CATEGORIES, formatCategoryLabel } from "../../constants";

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
  clearAllEditCourseErrors,
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
      <div className="mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:justify-end lg:items-start gap-6">
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <button
                onClick={() => setShowCourseFilters(!showCourseFilters)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <i
                  className={`fas ${showCourseFilters ? "fa-times" : "fa-filter"} text-sm`}
                ></i>
                <span>{showCourseFilters ? "Hide Filters" : "Filters"}</span>
              </button>
              <button
                onClick={() => setActiveModal("create-course")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus text-sm"></i>
                <span>Create Course</span>
              </button>
            </div>
          </div>

          {/* Course Filters */}
          {showCourseFilters && (
            <div className="mt-6 p-6 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Search
                  </label>
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    value={courseFilters.search}
                    onChange={(e) =>
                      setCourseFilters({
                        ...courseFilters,
                        search: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Category
                  </label>
                  <select
                    value={courseFilters.category}
                    onChange={(e) =>
                      setCourseFilters({
                        ...courseFilters,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Categories</option>
                    {BACKEND_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {formatCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Price Range
                  </label>
                  <select
                    value={courseFilters.priceRange}
                    onChange={(e) =>
                      setCourseFilters({
                        ...courseFilters,
                        priceRange: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Prices</option>
                    <option value="0-50">PKR 0 - 50</option>
                    <option value="51-100">PKR 51 - 100</option>
                    <option value="101-500">PKR 101 - 500</option>
                    <option value="501-1000">PKR 501 - 1000</option>
                    <option value="1000+">PKR 1000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Status
                  </label>
                  <select
                    value={courseFilters.status}
                    onChange={(e) =>
                      setCourseFilters({
                        ...courseFilters,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Instructor
                  </label>
                  <select
                    value={courseFilters.instructor}
                    onChange={(e) =>
                      setCourseFilters({
                        ...courseFilters,
                        instructor: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Instructors</option>
                    {users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={resetCourseFilters}
                  className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-slate-600/50 hover:border-slate-500/50"
                >
                  <i className="fas fa-times text-sm"></i>
                  Clear Filters
                </button>
              </div>
            </div>
          )}
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
            <div className="lg:hidden divide-y divide-slate-800/50">
              {filteredCourses?.map((course) => (
                <div
                  key={course.id}
                  className="p-4 sm:p-6 hover:bg-slate-800/30 transition"
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
                    <div className="flex flex-col gap-2">
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
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredCourses?.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-800/30 transition"
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
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onCourseEdit(course.id)}
                          className="bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-600/50 transition"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setActiveModal({
                              type: "assign-instructor",
                              courseId: course.id,
                            });
                          }}
                          className="bg-blue-600/10 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600 hover:text-white transition"
                        >
                          <i className="fas fa-user-plus mr-1"></i>
                          Assign
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Course Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter course title"
                  value={createCourseForm.title}
                  onChange={(e) => {
                    setCreateCourseForm({
                      ...createCourseForm,
                      title: e.target.value,
                    });
                    clearCreateCourseFieldError("title");
                  }}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    createCourseErrors?.title
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                />
                {createCourseErrors?.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {createCourseErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Describe what students will learn in this course..."
                  value={createCourseForm.description}
                  onChange={(e) => {
                    setCreateCourseForm({
                      ...createCourseForm,
                      description: e.target.value,
                    });
                    clearCreateCourseFieldError("description");
                  }}
                  rows={4}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent ${
                    createCourseErrors?.description
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {createCourseErrors?.description && (
                  <p className="text-red-400 text-xs mt-1">
                    {createCourseErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={createCourseForm.category}
                    onChange={(e) => {
                      setCreateCourseForm({
                        ...createCourseForm,
                        category: e.target.value,
                      });
                      clearCreateCourseFieldError("category");
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      createCourseErrors?.category
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">Select category</option>
                    {BACKEND_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {formatCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                  {createCourseErrors?.category && (
                    <p className="text-red-400 text-xs mt-1">
                      {createCourseErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price (PKR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={createCourseForm.price}
                    onChange={(e) => {
                      setCreateCourseForm({
                        ...createCourseForm,
                        price: e.target.value,
                      });
                      clearCreateCourseFieldError("price");
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      createCourseErrors?.price
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    }`}
                  />
                  {createCourseErrors?.price && (
                    <p className="text-red-400 text-xs mt-1">
                      {createCourseErrors.price}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={createCourseForm.status}
                    onChange={(e) => {
                      setCreateCourseForm({
                        ...createCourseForm,
                        status: e.target.value,
                      });
                      clearCreateCourseFieldError("status");
                      // If changing to draft, clear instructor error since it's no longer required
                      if (e.target.value === "draft") {
                        clearCreateCourseFieldError("instructor_id");
                      }
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      createCourseErrors?.status
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  {createCourseErrors?.status && (
                    <p className="text-red-400 text-xs mt-1">
                      {createCourseErrors.status}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Instructor{" "}
                    {createCourseForm.status === "published" && (
                      <span className="text-red-400">*</span>
                    )}
                  </label>
                  <select
                    value={createCourseForm.instructor_id}
                    onChange={(e) => {
                      setCreateCourseForm({
                        ...createCourseForm,
                        instructor_id: e.target.value,
                      });
                      clearCreateCourseFieldError("instructor_id");
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      createCourseErrors?.instructor_id
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-700 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">Select instructor</option>
                    {users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                  {createCourseErrors?.instructor_id && (
                    <p className="text-red-400 text-xs mt-1">
                      {createCourseErrors.instructor_id}
                    </p>
                  )}
                </div>
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
                  disabled={updatingCourseId === activeModal?.id}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  {updatingCourseId === activeModal?.id
                    ? "Creating..."
                    : "Create Course"}
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
                    setActiveModal(null);
                    setEditCourseForm({});
                    clearAllEditCourseErrors();
                  } catch (error) {
                    console.error("Failed to update course:", error);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Course Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter course title"
                    value={editCourseForm.title}
                    onChange={(e) => {
                      setEditCourseForm({
                        ...editCourseForm,
                        title: e.target.value,
                      });
                      clearEditCourseFieldError("title");
                    }}
                    required
                  />
                  {editCourseErrors?.title && (
                    <p className="text-red-400 text-xs mt-1">
                      {editCourseErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    placeholder="Describe what students will learn in this course..."
                    value={editCourseForm.description}
                    onChange={(e) => {
                      setEditCourseForm({
                        ...editCourseForm,
                        description: e.target.value,
                      });
                      clearEditCourseFieldError("description");
                    }}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent"
                    required
                  />
                  {editCourseErrors?.description && (
                    <p className="text-red-400 text-xs mt-1">
                      {editCourseErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={editCourseForm.category}
                      onChange={(e) => {
                        setEditCourseForm({
                          ...editCourseForm,
                          category: e.target.value,
                        });
                        clearEditCourseFieldError("category");
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select category</option>
                      {BACKEND_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {formatCategoryLabel(cat)}
                        </option>
                      ))}
                    </select>
                    {editCourseErrors?.category && (
                      <p className="text-red-400 text-xs mt-1">
                        {editCourseErrors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Price (PKR) <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      value={editCourseForm.price}
                      onChange={(e) => {
                        setEditCourseForm({
                          ...editCourseForm,
                          price: e.target.value,
                        });
                        clearEditCourseFieldError("price");
                      }}
                      required
                    />
                    {editCourseErrors?.price && (
                      <p className="text-red-400 text-xs mt-1">
                        {editCourseErrors.price}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Status <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={editCourseForm.status}
                      onChange={(e) => {
                        setEditCourseForm({
                          ...editCourseForm,
                          status: e.target.value,
                        });
                        clearEditCourseFieldError("status");
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                    {editCourseErrors?.status && (
                      <p className="text-red-400 text-xs mt-1">
                        {editCourseErrors.status}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Instructor <span className="text-red-400">*</span>
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
                    {editCourseErrors?.instructor_id && (
                      <p className="text-red-400 text-xs mt-1">
                        {editCourseErrors.instructor_id}
                      </p>
                    )}
                  </div>
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
                    disabled={updatingCourseId === activeModal.id}
                    className="bg-indigo-600 hover:bg-indigo-500"
                  >
                    {updatingCourseId === activeModal.id
                      ? "Updating..."
                      : "Update Course"}
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
