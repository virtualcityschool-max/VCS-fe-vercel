import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectEnrolledCourses } from "../../../store/slices/studentDashboardSlice";
import { toastManager } from "../../../utils/toastManager";

const ResourcesTab = () => {
  const navigate = useNavigate();
  const enrolledCourses = useSelector(selectEnrolledCourses) || [];
  const [activeDocSubject, setActiveDocSubject] = useState("all");
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Documents & Notes Repository
  const documents = [
    {
      id: 1,
      title: "Chapter 4: Derivatives & Differentiation",
      subject: "Mathematics",
      time: "2 hrs ago",
      type: "PDF",
      size: "3.4 MB",
      icon: "fa-file-pdf text-red-400",
      url: "https://virtual-city-school.s3.us-east-2.amazonaws.com/course_attachments/2026/05/Virtual_City_School__Product_Scope__PRD_ZtoTtiY.pdf",
    },
    {
      id: 2,
      title: "Midterm Comprehensive Study Guide",
      subject: "History",
      time: "2 days ago",
      type: "DOCX",
      size: "1.8 MB",
      icon: "fa-file-word text-blue-400",
      url: "https://virtual-city-school.s3.us-east-2.amazonaws.com/course_attachments/2026/05/Virtual_City_School__Product_Scope__PRD_ZtoTtiY.pdf",
    },
    {
      id: 3,
      title: "Lab Safety & Apparatus Handling Manual",
      subject: "Physics",
      time: "1 week ago",
      type: "PDF",
      size: "4.2 MB",
      icon: "fa-file-pdf text-red-400",
      url: "https://virtual-city-school.s3.us-east-2.amazonaws.com/course_attachments/2026/05/Virtual_City_School__Product_Scope__PRD_ZtoTtiY.pdf",
    },
    {
      id: 4,
      title: "Organic Reactions & Mechanisms Summary",
      subject: "Chemistry",
      time: "2 weeks ago",
      type: "PDF",
      size: "2.1 MB",
      icon: "fa-file-pdf text-red-400",
      url: "https://virtual-city-school.s3.us-east-2.amazonaws.com/course_attachments/2026/05/Virtual_City_School__Product_Scope__PRD_ZtoTtiY.pdf",
    },
    {
      id: 5,
      title: "Cambridge IGCSE Curriculum Syllabus 2025/26",
      subject: "General",
      time: "3 weeks ago",
      type: "PDF",
      size: "5.6 MB",
      icon: "fa-file-alt text-amber-400",
      url: "https://virtual-city-school.s3.us-east-2.amazonaws.com/course_attachments/2026/05/Virtual_City_School__Product_Scope__PRD_ZtoTtiY.pdf",
    },
  ];

  // Recorded Lectures
  const recordings = [
    {
      id: 11,
      title: "Lecture 12: Atomic Structure & Periodicity",
      subject: "Chemistry",
      tutor: "VCS Faculty Chemistry",
      date: "Yesterday",
      duration: "58 mins",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 12,
      title: "Pakistan Study: Week 5 Constitutional History",
      subject: "Pakistan Study",
      tutor: "VCS Faculty Pakistan Studies",
      date: "3 days ago",
      duration: "52 mins",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 13,
      title: "Calculus: Definite Integrals & Area under Curves",
      subject: "Mathematics",
      tutor: "VCS Faculty Mathematics",
      date: "5 days ago",
      duration: "1 hr 12 mins",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 14,
      title: "Introduction to Special Relativity & Kinematics",
      subject: "Physics",
      tutor: "VCS Faculty Physics",
      date: "1 week ago",
      duration: "1 hr 05 mins",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  ];

  const handleDownload = (doc) => {
    toastManager.info(`Downloading ${doc.title}...`);
    window.open(doc.url, "_blank");
  };

  const filteredDocs = documents.filter((d) => {
    if (activeDocSubject === "all") return true;
    return d.subject.toLowerCase() === activeDocSubject.toLowerCase();
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Latest Notes & Docs */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <i className="fas fa-file-alt text-indigo-400 text-sm" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Latest Notes & Docs ({filteredDocs.length})
              </h3>
            </div>
            <select
              value={activeDocSubject}
              onChange={(e) => setActiveDocSubject(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="history">History</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <i className={`fas ${doc.icon} text-base`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-300">{doc.subject}</span>
                      <span>•</span>
                      <span>{doc.time}</span>
                      <span>•</span>
                      <span className="font-mono">{doc.size}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(doc)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer shadow-sm"
                  title="Download File"
                >
                  <i className="fas fa-download text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recorded Lectures */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <i className="fas fa-play-circle text-blue-400 text-sm" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Recorded Lectures ({recordings.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
              Past Video Archive
            </span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    <i className="fas fa-play text-xs" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition">
                      {rec.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-300">{rec.subject}</span>
                      <span>•</span>
                      <span>{rec.tutor}</span>
                      <span>•</span>
                      <span>{rec.date}</span>
                      <span>•</span>
                      <span className="font-mono">{rec.duration}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toastManager.info(`Playing ${rec.title}`);
                    setActiveVideoModal(rec);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fas fa-play text-[10px]" />
                  Watch
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Callout Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          className="shrink-0 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-2"
        >
          <i className="fas fa-book-open text-xs" />
          <span>Browse Course Library</span>
        </button>
      </div>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white">{activeVideoModal.title}</h4>
                <p className="text-xs text-slate-400">{activeVideoModal.subject} • {activeVideoModal.tutor}</p>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-xl bg-black overflow-hidden flex items-center justify-center">
              <div className="text-center p-6 text-slate-400">
                <i className="fas fa-video text-4xl text-blue-400 mb-2 block" />
                <p className="text-sm font-bold text-white">Lecture Video Stream</p>
                <p className="text-xs text-slate-500 mt-1">Archived session recording is ready for streaming.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesTab;
