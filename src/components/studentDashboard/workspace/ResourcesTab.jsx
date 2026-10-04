import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectEnrolledCourses } from "../../../store/slices/studentDashboardSlice";
import { handleFileDownload, getStorageUrl } from "../../../utils/storageUrl";
import { toastManager } from "../../../utils/toastManager";

const getFileIcon = (url = "") => {
  const match = (url || "").split("?")[0].match(/\.([a-z0-9]{1,5})$/i);
  const ext = match ? match[1].toLowerCase() : "";
  switch (ext) {
    case "pdf":
      return "fa-file-pdf text-rose-400";
    case "doc":
    case "docx":
      return "fa-file-word text-blue-400";
    case "ppt":
    case "pptx":
      return "fa-file-powerpoint text-amber-400";
    case "xls":
    case "xlsx":
    case "csv":
      return "fa-file-excel text-emerald-400";
    case "zip":
    case "rar":
      return "fa-file-zipper text-purple-400";
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      return "fa-file-image text-cyan-400";
    default:
      return "fa-file-lines text-emerald-400";
  }
};

const ResourcesTab = () => {
  const navigate = useNavigate();
  const rawEnrolledCourses = useSelector(selectEnrolledCourses);
  const enrolledCourses = useMemo(
    () => rawEnrolledCourses || [],
    [rawEnrolledCourses]
  );

  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract real official attachments from enrolled courses (de-duplicated by course ID)
  const documents = useMemo(() => {
    const docs = [];
    const seenCourseIds = new Set();
    enrolledCourses.forEach((c) => {
      const courseObj = c.course || c;
      if (courseObj?.id && !seenCourseIds.has(courseObj.id)) {
        seenCourseIds.add(courseObj.id);
        if (courseObj.attachment) {
          const match = courseObj.attachment.split("?")[0].match(/\.([a-z0-9]{1,5})$/i);
          const ext = match ? match[1].toUpperCase() : "PDF";
          docs.push({
            id: `course_att_${courseObj.id}`,
            title: `${courseObj.title || "Course"} — Official Syllabus & Study Pack`,
            description: courseObj.description || "Official course curriculum outline and syllabus pack.",
            courseId: String(courseObj.id),
            courseTitle: courseObj.title || "Enrolled Course",
            subject: courseObj.category || "Academics",
            url: courseObj.attachment,
            fileType: ext,
            icon: getFileIcon(courseObj.attachment),
          });
        }
      }
    });
    return docs;
  }, [enrolledCourses]);

  // Extract enrolled course options for filter dropdown (de-duplicated by course ID)
  const courseOptions = useMemo(() => {
    const seenIds = new Set();
    const opts = [];
    enrolledCourses.forEach((c) => {
      const courseObj = c.course || c;
      const idStr = String(courseObj?.id || "");
      if (idStr && !seenIds.has(idStr)) {
        seenIds.add(idStr);
        opts.push({
          id: idStr,
          title: courseObj.title || "Enrolled Course",
        });
      }
    });
    return opts;
  }, [enrolledCourses]);

  // Filter documents based on course and search
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (selectedCourseId !== "all" && doc.courseId !== selectedCourseId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesDesc = doc.description.toLowerCase().includes(q);
        const matchesCourse = doc.courseTitle.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCourse) return false;
      }
      return true;
    });
  }, [documents, selectedCourseId, searchQuery]);

  const handleDownload = (doc) => {
    toastManager.info(`Downloading ${doc.title}...`);
    handleFileDownload(doc.url, `${doc.courseTitle}_Syllabus.${doc.fileType.toLowerCase()}`);
  };

  const handlePreview = (doc) => {
    const fullUrl = getStorageUrl(doc.url);
    if (fullUrl) {
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    } else {
      toastManager.info("Preview not available. Please click Download.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-folder-open text-emerald-400 text-lg" />
              <h2 className="text-xl font-black font-poppins text-white tracking-tight">
                Course Learning Materials
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Download the official syllabus pack and learning materials for each enrolled course.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Enrolled Course */}
            {courseOptions.length > 0 && (
              <div className="relative min-w-[200px]">
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer transition"
                >
                  <option value="all">All Enrolled Courses</option>
                  {courseOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Resources Grid or Empty State */}
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    <i className={`fas ${doc.icon} text-xl`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {doc.subject || "Academics"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Official Pack
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {doc.fileType}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-300 transition">
                      {doc.title}
                    </h4>

                    {doc.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {doc.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2 font-medium">
                      <span className="text-slate-400">Course: {doc.courseTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => handlePreview(doc)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <i className="fas fa-eye text-[11px]" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 hover:scale-[1.02] cursor-pointer"
                  >
                    <i className="fas fa-download text-[11px]" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center mx-auto text-slate-500 text-2xl shadow-xl">
              <i className="fas fa-folder-open text-emerald-400/60" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">
                No Learning Materials Uploaded Yet
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedCourseId !== "all"
                  ? "Your instructors have not uploaded curriculum files or syllabus packs for this course yet."
                  : "Your course instructors have not uploaded curriculum files or syllabus packs for your enrolled courses yet. When attachments are added, you can download them directly here."}
              </p>
            </div>
            {selectedCourseId !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCourseId("all")}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-emerald-500/20 transition cursor-pointer"
              >
                View All Courses
              </button>
            )}
          </div>
        )}
      </div>

      {/* Course Catalog Revision Callout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white">
            Need additional learning resources or past papers?
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Access Cambridge syllabus specifications, solved past papers, and revision notes across our curriculum catalog.
          </p>
        </div>
        <button
          onClick={() => navigate("/courses")}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center gap-2"
        >
          <i className="fas fa-book-open text-xs" />
          <span>Browse Course Library</span>
        </button>
      </div>
    </div>
  );
};

export default ResourcesTab;
