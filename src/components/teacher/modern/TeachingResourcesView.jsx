import { useState } from "react";
import {
  FolderOpen,
  FileText,
  Video,
  BookOpen,
  Presentation,
  UploadCloud,
  Eye,
  Share2,
  ExternalLink,
  Plus,
  Lock,
  Globe,
  Pin,
  CheckCircle2,
  Search,
  Maximize2,
  X,
  FileCheck
} from "lucide-react";
export const TeachingResourcesView = ({
  courses,
  resources,
  onAddResource,
  onTogglePinResource,
  onBackToDashboard,
  timezone
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [presentingResource, setPresentingResource] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState(courses[0]?.title || "Cambridge O & A Level Physics");
  const [newType, setNewType] = useState("slides");
  const [newVisibility, setNewVisibility] = useState("shared_with_students");
  const [newDescription, setNewDescription] = useState("");
  const [newFileFormat, setNewFileFormat] = useState("PPTX Presentation");
  const newFileSize = "12.5 MB";
  const [newPinned, setNewPinned] = useState(false);
  const filteredResources = resources.filter((res) => {
    const matchTab = activeTab === "all" || res.visibility === activeTab;
    const matchCourse = selectedCourse === "all" || res.courseTitle === selectedCourse;
    const matchType = selectedType === "all" || res.type === selectedType;
    const matchSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || res.description.toLowerCase().includes(searchQuery.toLowerCase()) || res.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchCourse && matchType && matchSearch;
  });
  const sharedCount = resources.filter((r) => r.visibility === "shared_with_students").length;
  const deskCount = resources.filter((r) => r.visibility === "teacher_private_desk").length;
  const pinnedCount = resources.filter((r) => r.pinnedForNextClass).length;
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddResource({
      title: newTitle.trim(),
      courseTitle: newCourse,
      type: newType,
      visibility: newVisibility,
      description: newDescription.trim() || "Class reference material for lecture and student review.",
      fileFormat: newFileFormat,
      fileSize: newFileSize,
      urlOrPreview: `https://virtualcityschool.com/resources/${newTitle.toLowerCase().replace(/\s+/g, "-")}.${newType === "slides" ? "pptx" : newType === "video_movie" ? "mp4" : "pdf"}`,
      pinnedForNextClass: newPinned
    });
    setNewTitle("");
    setNewDescription("");
    setIsAddModalOpen(false);
  };
  const getResourceTypeIcon = (type) => {
    switch (type) {
      case "slides":
        return <Presentation className="w-4 h-4 text-amber-400" />;
      case "pdf_document":
        return <FileText className="w-4 h-4 text-rose-400" />;
      case "video_movie":
        return <Video className="w-4 h-4 text-cyan-400" />;
      case "book_curriculum":
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case "lecture_notes":
        return <FileCheck className="w-4 h-4 text-indigo-400" />;
    }
  };
  const getResourceTypeLabel = (type) => {
    switch (type) {
      case "slides":
        return "Lecture Deck (PPT)";
      case "pdf_document":
        return "PDF Document";
      case "video_movie":
        return "Movie / Video Demo";
      case "book_curriculum":
        return "Annotated Book";
      case "lecture_notes":
        return "Lecture Notes";
    }
  };
  return <div className="space-y-6">
      {
    /* Top Banner & Action Header */
  }
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>CLASS MATERIALS & LECTURE PREPARATION DESK</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Teaching Resources & Student Materials
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Share PowerPoint decks, PDFs, notes & video demonstrations with students, or keep private lecture notes, books & slides ready for upcoming Google Meet classes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
    onClick={onBackToDashboard}
    className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
  >
            ← Back to Bento Dashboard
          </button>
          <button
    onClick={() => setIsAddModalOpen(true)}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
  >
            <Plus className="w-4 h-4" />
            <span>Add Class Resource</span>
          </button>
        </div>
      </div>

      {
    /* Quick Pinned Lecture Banner: Ready for Google Meet */
  }
      {pinnedCount > 0 && <div className="bg-gradient-to-r from-indigo-950/80 via-[#101426] to-cyan-950/60 border border-indigo-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Presentation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-[10px] uppercase tracking-wider border border-indigo-500/30">
                  Ready for Upcoming Lecture
                </span>
                <span>{pinnedCount} Teacher Resources Pinned for Today</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PowerPoint slides, textbook references, and cheat sheets configured to display during live Google Meet.
              </p>
            </div>
          </div>
          <button
    onClick={() => {
      const firstPinned = resources.find((r) => r.pinnedForNextClass);
      if (firstPinned) setPresentingResource(firstPinned);
    }}
    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
  >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Open Lecture Presentation Mode</span>
          </button>
        </div>}

      {
    /* Primary Category Switcher & Stats */
  }
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
    onClick={() => setActiveTab("all")}
    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${activeTab === "all" ? "bg-[#141A33] border-indigo-500/60 shadow-md" : "bg-[#101424] border-[#1E2540] hover:border-slate-700"}`}
  >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">All Class Resources</div>
              <div className="text-[11px] text-slate-400">Total catalogued items</div>
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-white tabular-nums bg-[#1D2545] px-2.5 py-0.5 rounded-lg border border-[#27325C]">
            {resources.length}
          </span>
        </button>

        <button
    onClick={() => setActiveTab("shared_with_students")}
    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${activeTab === "shared_with_students" ? "bg-[#141A33] border-cyan-500/60 shadow-md" : "bg-[#101424] border-[#1E2540] hover:border-slate-700"}`}
  >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Shared with Students</div>
              <div className="text-[11px] text-slate-400">Notes, PPTs, PDFs & Videos</div>
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-cyan-300 tabular-nums bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
            {sharedCount}
          </span>
        </button>

        <button
    onClick={() => setActiveTab("teacher_private_desk")}
    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${activeTab === "teacher_private_desk" ? "bg-[#141A33] border-amber-500/60 shadow-md" : "bg-[#101424] border-[#1E2540] hover:border-slate-700"}`}
  >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Teacher's Private Desk</div>
              <div className="text-[11px] text-slate-400">Lecture slides, books & meet notes</div>
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-amber-300 tabular-nums bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
            {deskCount}
          </span>
        </button>
      </div>

      {
    /* Filter and Class Selector Bar */
  }
      <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {
    /* Class Filter Dropdown */
  }
          <div className="relative min-w-[220px]">
            <select
    value={selectedCourse}
    onChange={(e) => setSelectedCourse(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
  >
              <option value="all">All Classes & Courses ({resources.length})</option>
              {courses.map((c) => <option key={c.id} value={c.title}>
                  {c.title}
                </option>)}
            </select>
          </div>

          {
    /* Type Filter */
  }
          <select
    value={selectedType}
    onChange={(e) => setSelectedType(e.target.value)}
    className="px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-300 focus:outline-none cursor-pointer"
  >
            <option value="all">All Media Types</option>
            <option value="slides">Slides (PowerPoint PPT)</option>
            <option value="pdf_document">PDF Documents</option>
            <option value="video_movie">Movies / Video Recordings</option>
            <option value="book_curriculum">Curriculum Books</option>
            <option value="lecture_notes">Lecture Notes</option>
          </select>
        </div>

        {
    /* Search Input */
  }
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search resources, topics..."
    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
  />
        </div>
      </div>

      {
    /* Class Course Badges: Quick Switcher */
  }
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold mr-1">Filter by Class:</span>
        <button
    onClick={() => setSelectedCourse("all")}
    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${selectedCourse === "all" ? "bg-indigo-600 text-white shadow-sm" : "bg-[#121628] text-slate-400 hover:text-white border border-[#1E2540]"}`}
  >
          All Classes
        </button>
        {courses.map((c) => <button
    key={c.id}
    onClick={() => setSelectedCourse(c.title)}
    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${selectedCourse === c.title ? "bg-indigo-600 text-white shadow-sm" : "bg-[#121628] text-slate-400 hover:text-white border border-[#1E2540]"}`}
  >
            {c.title}
          </button>)}
      </div>

      {
    /* Resources Cards Grid */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => <div
    key={res.id}
    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all relative overflow-hidden ${res.pinnedForNextClass ? "bg-[#12162C] border-indigo-500/40 shadow-lg" : "bg-[#101424] border-[#1E2540] hover:border-slate-700"}`}
  >
            {
    /* Top Tag Row */
  }
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 rounded-lg bg-black/40 border border-white/5">
                    {getResourceTypeIcon(res.type)}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {getResourceTypeLabel(res.type)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
    onClick={() => onTogglePinResource(res.id)}
    title={res.pinnedForNextClass ? "Pinned for upcoming class" : "Pin to lecture desk"}
    className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${res.pinnedForNextClass ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-[#161C33] text-slate-400 border-[#222B4A] hover:text-white"}`}
  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <span
    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${res.visibility === "shared_with_students" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}
  >
                    {res.visibility === "shared_with_students" ? "Shared with Students" : "Teacher Private Desk"}
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-bold text-indigo-400 mt-1">{res.courseTitle}</div>
              <h4 className="text-sm font-bold text-white mt-0.5 leading-snug">{res.title}</h4>
              <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                {res.description}
              </p>
            </div>

            {
    /* Bottom Actions and Metadata */
  }
            <div className="pt-3 mt-4 border-t border-[#181F36] space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{res.fileFormat}</span>
                <span>{res.fileSize}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
    onClick={() => setPresentingResource(res)}
    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-white text-xs font-semibold border border-[#273154] transition-colors cursor-pointer"
  >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview / Open</span>
                </button>

                {res.visibility === "teacher_private_desk" ? <button
    onClick={() => setPresentingResource(res)}
    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-colors cursor-pointer"
  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Meet Ready</span>
                  </button> : <button
    onClick={() => alert(`Resource URL copied: ${res.urlOrPreview}`)}
    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>}
              </div>
            </div>
          </div>)}
      </div>

      {filteredResources.length === 0 && <div className="bg-[#101424] border border-[#1E2540] rounded-2xl p-12 text-center">
          <FolderOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Teaching Resources Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try choosing a different class filter or click "Add Class Resource" to upload PowerPoint slides, notes, or movies.
          </p>
        </div>}

      {
    /* ---------------------------------------------------------------------- */
  }
      {
    /*                    MODAL: ADD NEW CLASS RESOURCE                      */
  }
      {
    /* ---------------------------------------------------------------------- */
  }
      {isAddModalOpen && <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-[#1C233D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload / Add Class Resource</h3>
                  <p className="text-xs text-slate-400">
                    Add PowerPoint slides, books, worksheets, movies, or lecture notes for specific classes.
                  </p>
                </div>
              </div>
              <button
    onClick={() => setIsAddModalOpen(false)}
    className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Class / Course <span className="text-rose-400">*</span>
                  </label>
                  <select
    value={newCourse}
    onChange={(e) => setNewCourse(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none"
  >
                    {courses.map((c) => <option key={c.id} value={c.title}>
                        {c.title}
                      </option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Resource Media Type <span className="text-rose-400">*</span>
                  </label>
                  <select
    value={newType}
    onChange={(e) => {
      const t = e.target.value;
      setNewType(t);
      if (t === "slides") setNewFileFormat("PPTX Presentation");
      else if (t === "video_movie") setNewFileFormat("MP4 Video (1080p)");
      else if (t === "book_curriculum") setNewFileFormat("PDF Textbook");
      else setNewFileFormat("PDF Document");
    }}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none"
  >
                    <option value="slides">PowerPoint Lecture Deck (PPT)</option>
                    <option value="pdf_document">PDF Document / Worksheet</option>
                    <option value="video_movie">Video / Movie Simulation</option>
                    <option value="book_curriculum">Curriculum Textbook (Annotated)</option>
                    <option value="lecture_notes">Google Meet Lecture Notes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Resource Title <span className="text-rose-400">*</span>
                </label>
                <input
    type="text"
    required
    value={newTitle}
    onChange={(e) => setNewTitle(e.target.value)}
    placeholder="e.g. Chapter 4 Newton Laws & Vector Momentum Lecture Deck"
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description / Lecture Guidance
                </label>
                <textarea
    rows={3}
    value={newDescription}
    onChange={(e) => setNewDescription(e.target.value)}
    placeholder="Provide brief context on what this deck, book, or video covers and when to use it during classes..."
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
              </div>

              {
    /* Visibility Choice */
  }
              <div className="p-4 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-3">
                <span className="text-xs font-bold text-white">Audience & Access Level</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
    type="button"
    onClick={() => setNewVisibility("shared_with_students")}
    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${newVisibility === "shared_with_students" ? "bg-emerald-500/15 border-emerald-500/50 text-white" : "bg-[#12162A] border-[#1E2642] text-slate-400"}`}
  >
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <Globe className="w-4 h-4" />
                      <span>Shared with Students</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Students in this course can view, study, and download these notes/slides/movies.
                    </p>
                  </button>

                  <button
    type="button"
    onClick={() => setNewVisibility("teacher_private_desk")}
    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${newVisibility === "teacher_private_desk" ? "bg-amber-500/15 border-amber-500/50 text-white" : "bg-[#12162A] border-[#1E2642] text-slate-400"}`}
  >
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Lock className="w-4 h-4" />
                      <span>Teacher's Private Desk</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Only visible to you. Kept ready for your upcoming lecture or Google Meet screen share.
                    </p>
                  </button>
                </div>
              </div>

              {
    /* Pin for Upcoming Class Checkbox */
  }
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0B0E1A] border border-[#1A223B] cursor-pointer">
                <input
    type="checkbox"
    checked={newPinned}
    onChange={(e) => setNewPinned(e.target.checked)}
    className="rounded text-indigo-500 focus:ring-0"
  />
                <div>
                  <span className="text-xs font-bold text-white">Pin for Upcoming Class (Google Meet Ready)</span>
                  <p className="text-[11px] text-slate-400">
                    Displays at the top of your workspace for instant one-click launch during live lecture.
                  </p>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C233D]">
                <button
    type="button"
    onClick={() => setIsAddModalOpen(false)}
    className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] text-xs font-bold text-white shadow-lg cursor-pointer"
  >
                  Save & Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* ---------------------------------------------------------------------- */
  }
      {
    /*             MODAL: INTERACTIVE LECTURE PRESENTATION MODE               */
  }
      {
    /* ---------------------------------------------------------------------- */
  }
      {presentingResource && <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#0E1222] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#1C233D] flex items-center justify-between bg-[#12162B]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase">
                      Lecture Screen Share Ready
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{presentingResource.courseTitle}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-0.5">{presentingResource.title}</h3>
                </div>
              </div>
              <button
    onClick={() => setPresentingResource(null)}
    className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            {
    /* Slide / Book / Video Interactive Canvas Simulation */
  }
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-[#090B14] via-[#12162E] to-[#1A2244] border border-[#273256] p-8 flex flex-col justify-between shadow-2xl relative">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-cyan-400 uppercase font-bold tracking-wider">
                    Virtual City School · Faculty Lecture Display
                  </span>
                  <span className="font-mono">Timezone: {timezone}</span>
                </div>

                <div className="space-y-3 text-center my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 mx-auto flex items-center justify-center text-indigo-300">
                    {getResourceTypeIcon(presentingResource.type)}
                  </div>
                  <h2 className="text-2xl font-black text-white">{presentingResource.title}</h2>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto">
                    {presentingResource.description}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Formatted & Synced for Google Meet Shared Screen</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-white/10 pt-3">
                  <span className="text-slate-400 font-mono">Format: {presentingResource.fileFormat} · {presentingResource.fileSize}</span>
                  <a
    href="https://meet.google.com/new"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B46F8] hover:bg-[#4C38E6] text-white text-xs font-bold"
  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Google Meet</span>
                  </a>
                </div>
              </div>

              {
    /* Presenter Notes & Lecture Script */
  }
              <div className="p-4 rounded-xl bg-[#0B0E1A] border border-[#1E2642] space-y-2">
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Teacher's In-Lecture Talking Points:</span>
                </h5>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>Review baseline concept formulas before advancing to structured derivations.</li>
                  <li>Pose checkpoint question to students: prompt in chat or audio call-out.</li>
                  <li>Annotate solution steps directly on the digital whiteboard canvas.</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[#1C233D] flex items-center justify-between bg-[#101424]">
              <span className="text-xs text-slate-400 font-mono">Status: Ready to project</span>
              <button
    onClick={() => setPresentingResource(null)}
    className="px-4 py-1.5 rounded-xl bg-[#1E2540] hover:bg-[#283256] text-xs font-semibold text-white cursor-pointer"
  >
                Close Presentation Mode
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
