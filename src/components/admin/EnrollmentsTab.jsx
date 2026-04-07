import React, { useState, useMemo } from "react";
import { Button } from "../../components/ui";

const EnrollmentsTab = ({ enrollments, loading, error, onRefresh }) => {
  const [searchInput, setSearchInput] = useState("");

  // Filter enrollments based on search using useMemo instead of useEffect
  const filteredEnrollments = useMemo(() => {
    if (!enrollments) {
      return [];
    }

    let filtered = enrollments;

    if (searchInput.trim()) {
      const searchLower = searchInput.toLowerCase();
      filtered = filtered.filter((enrollment) => {
        return (
          enrollment.student?.username?.toLowerCase().includes(searchLower) ||
          enrollment.student?.email?.toLowerCase().includes(searchLower) ||
          enrollment.course?.title?.toLowerCase().includes(searchLower) ||
          enrollment.course?.category?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [enrollments, searchInput]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case "inactive":
        return "bg-slate-500/20 text-slate-400 border-slate-500/20";
      case "cancelled":
        return "bg-rose-500/20 text-rose-400 border-rose-500/20";
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/20";
    }
  };

  const getTypeColor = (isPrivate) => {
    return isPrivate
      ? "bg-purple-500/20 text-purple-400 border-purple-500/20"
      : "bg-blue-500/20 text-blue-400 border-blue-500/20";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Enrollments</h2>
          <div className="h-10 bg-slate-700 rounded-lg w-64 animate-pulse"></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Enrollment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Enrolled At
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-800 animate-pulse"
                >
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded w-8"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-32"></div>
                      <div className="h-3 bg-slate-700 rounded w-48"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-36"></div>
                      <div className="h-3 bg-slate-700 rounded w-24"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-700 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-700 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded w-24"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-exclamation-triangle text-rose-400 text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Unable to Load Enrollments
        </h3>
        <p className="text-slate-400 text-center mb-6 max-w-md">{error}</p>
        <button
          onClick={onRefresh}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
        >
          <i className="fas fa-redo"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search enrollments..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
          </div>
          <button
            onClick={onRefresh}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <i className="fas fa-sync"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {filteredEnrollments.map((enrollment, index) => (
            <div
              key={enrollment.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800/70 transition"
            >
              {/* Index */}
              <div className="text-xs text-slate-500 mb-3">#{index + 1}</div>

              {/* Student Info */}
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-300 mb-1">
                  Student
                </div>
                <div className="text-white font-medium">
                  {enrollment.student?.username || "Unknown"}
                </div>
                <div className="text-xs text-slate-500 break-all">
                  {enrollment.student?.email || "No email"}
                </div>
              </div>

              {/* Course Info */}
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-300 mb-1">
                  Course
                </div>
                <div className="text-white font-medium">
                  {enrollment.course?.title || "Unknown Course"}
                </div>
                <div className="text-xs text-slate-500">
                  {enrollment.course?.category || "No category"} • PKR{" "}
                  {enrollment.course?.price || "0"}
                </div>
              </div>

              {/* Type and Status */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-slate-300 mb-1">
                    Type
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getTypeColor(
                      enrollment.is_private,
                    )}`}
                  >
                    {enrollment.is_private ? "Private" : "Normal"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-300 mb-1">
                    Status
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(
                      enrollment.status,
                    )}`}
                  >
                    {enrollment.status || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Enrolled At */}
              <div className="text-xs text-slate-500">
                Enrolled: {formatDate(enrollment.enrolled_at)}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Enrollment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                  Enrolled At
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment, index) => (
                <tr key={enrollment.id} className="border-b border-slate-800">
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">
                        {enrollment.student?.username || "Unknown"}
                      </div>
                      <div className="text-sm text-slate-400">
                        {enrollment.student?.email || "No email"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">
                        {enrollment.course?.title || "Unknown Course"}
                      </div>
                      <div className="text-sm text-slate-400">
                        {enrollment.course?.category || "No category"} • PKR{" "}
                        {enrollment.course?.price || "0"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getTypeColor(
                        enrollment.is_private,
                      )}`}
                    >
                      {enrollment.is_private ? "Private" : "Normal"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(
                        enrollment.status,
                      )}`}
                    >
                      {enrollment.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {formatDate(enrollment.enrolled_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEnrollments.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center p-16">
            <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-user-graduate text-slate-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchInput ? "No Matching Enrollments" : "No Enrollments Found"}
            </h3>
            <p className="text-slate-400 text-center mb-6 max-w-md">
              {searchInput
                ? "Try adjusting your search terms to find what you're looking for."
                : "There are no enrollments in the system yet."}
            </p>
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentsTab;
