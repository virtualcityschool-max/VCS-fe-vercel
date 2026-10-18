import { useCallback, useEffect, useState } from "react";
import {
  FolderOpen,
  Search,
  UploadCloud,
  X,
  Link2,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { teacherService } from "../../../services/teacherService";
import { getStorageUrl } from "../../../utils/storageUrl";
import { extractApiErrorMessage } from "../../../utils/apiErrorHandler";
import { toastManager } from "../../../utils/toastManager";
import ConfirmDialog from "../../common/ConfirmDialog";

const AddResourceModal = ({ courses, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [visibility, setVisibility] = useState("students");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError("Please enter a title.");
    if (!courseId) return setError("Please choose a course.");
    if (!file && !link.trim()) return setError("Attach a file or paste a link.");
    setSaving(true);
    setError(null);
    try {
      const created = await teacherService.createResource({
        course: courseId,
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        visibility,
        file
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(extractApiErrorMessage(err) || "Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#101424] border border-[#242D4C] rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-5 py-4 border-b border-[#1C233D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Add Class Resource</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Title *</label>
            <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Chapter 4 slides"
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course</label>
            <select
    value={courseId}
    onChange={(e) => setCourseId(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none cursor-pointer"
  >
              {courses.length === 0 && <option value="">No courses assigned</option>}
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description (optional)</label>
            <textarea
    rows={2}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
          </div>
          <div className="p-3.5 rounded-xl bg-[#0B0E1A] border border-[#1A223B] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-300 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-indigo-400" /> File (max 25 MB)</span>
              <label className="px-3 py-1 rounded-lg bg-[#182038] hover:bg-[#202B4C] text-xs font-semibold text-slate-200 border border-[#273254] cursor-pointer max-w-[220px] truncate">
                <span>{file ? file.name : "Choose File"}</span>
                <input
    type="file"
    className="hidden"
    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.zip,.mp3,.mp4"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
  />
              </label>
            </div>
            <div>
              <span className="text-xs text-slate-300 flex items-center gap-1.5 mb-1.5"><Link2 className="w-3.5 h-3.5 text-indigo-400" /> or a link (YouTube, Google Drive…)</span>
              <input
    type="url"
    value={link}
    onChange={(e) => setLink(e.target.value)}
    placeholder="https://"
    className="w-full px-3 py-1.5 rounded-lg bg-[#121628] border border-[#1E2642] text-xs text-white focus:outline-none focus:border-indigo-500"
  />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
    { id: "students", label: "Share with students", icon: <Eye className="w-3.5 h-3.5" /> },
    { id: "private", label: "Keep private", icon: <EyeOff className="w-3.5 h-3.5" /> }
  ].map((v) => <button
    key={v.id}
    type="button"
    onClick={() => setVisibility(v.id)}
    className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${visibility === v.id ? "bg-indigo-600/20 border-indigo-500 text-white" : "bg-[#12162A] border-[#1E2642] text-slate-400 hover:text-slate-200"}`}
  >
                {v.icon}
                {v.label}
              </button>)}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#161C30] text-xs font-semibold text-slate-300 cursor-pointer">
              Cancel
            </button>
            <button
    type="submit"
    disabled={saving}
    className="px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4B36E6] disabled:opacity-60 text-xs font-bold text-white cursor-pointer"
  >
              {saving ? "Uploading…" : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>;
};

export const TeachingResourcesView = ({
  courses,
  onBackToDashboard,
  timezone
}) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    return teacherService
      .getResources()
      .then((data) => {
        setResources(Array.isArray(data) ? data : data?.results || []);
        setLoadError(null);
      })
      .catch((err) => setLoadError(extractApiErrorMessage(err) || "Could not load resources."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleVisibility = async (res) => {
    const next = res.visibility === "students" ? "private" : "students";
    try {
      const updated = await teacherService.updateResource(res.id, { visibility: next });
      setResources((prev) => prev.map((r) => (r.id === res.id ? updated : r)));
      toastManager.success(next === "students" ? "Now visible to students" : "Hidden from students");
    } catch (err) {
      toastManager.error(extractApiErrorMessage(err) || "Could not change sharing");
    }
  };

  const confirmDelete = async () => {
    const res = deleting;
    setDeleting(null);
    try {
      await teacherService.deleteResource(res.id);
      setResources((prev) => prev.filter((r) => r.id !== res.id));
      toastManager.success("Resource deleted");
    } catch (err) {
      toastManager.error(extractApiErrorMessage(err) || "Could not delete");
    }
  };

  const q = searchQuery.toLowerCase();
  const filtered = resources.filter((r) =>
    (visibilityFilter === "all" || r.visibility === visibilityFilter) &&
    (selectedCourse === "all" || String(r.course) === String(selectedCourse)) &&
    (r.title.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q))
  );
  const sharedCount = resources.filter((r) => r.visibility === "students").length;

  return <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101424] border border-[#1E2540] rounded-2xl p-5 shadow-lg">
        <div>
          <div className="text-xs font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>TEACHING RESOURCES</span>
            {timezone && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#1B223C] text-xs text-slate-300 font-mono border border-[#283256]">{timezone}</span>}
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Teaching Resources & Desk</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload files or links for a course. Shared items appear in your students' Resources tab.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
    onClick={onBackToDashboard}
    className="px-3.5 py-2 rounded-xl bg-[#171D33] hover:bg-[#1E2642] text-xs font-semibold text-slate-300 border border-[#273154] transition-colors cursor-pointer"
  >
            ← Back to Bento Dashboard
          </button>
          <button
    onClick={() => setIsAddOpen(true)}
    disabled={courses.length === 0}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B46F8] hover:bg-[#4C38E6] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
  >
            <UploadCloud className="w-4 h-4" />
            <span>Add Class Resource</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E1220] border border-[#1C233D] rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
    { id: "all", label: `All (${resources.length})` },
    { id: "students", label: `Shared (${sharedCount})` },
    { id: "private", label: `Private (${resources.length - sharedCount})` }
  ].map((f) => <button
    key={f.id}
    onClick={() => setVisibilityFilter(f.id)}
    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${visibilityFilter === f.id ? "bg-[#5B46F8] text-white" : "text-slate-400 hover:text-white hover:bg-[#161C30]"}`}
  >
              {f.label}
            </button>)}
        </div>
        <div className="flex items-center gap-3">
          <select
    value={selectedCourse}
    onChange={(e) => setSelectedCourse(e.target.value)}
    className="px-3 py-1.5 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 focus:outline-none"
  >
            <option value="all">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search…"
    className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0B0E1A] border border-[#1E2642] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
  />
          </div>
        </div>
      </div>

      {loading ? <div className="p-10 text-center text-xs text-slate-400">Loading resources…</div> : loadError ? <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{loadError}</div> : filtered.length === 0 ? <div className="p-12 rounded-2xl bg-[#101424] border border-[#1E2540] text-center">
          <FolderOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <div className="text-sm font-bold text-white">{resources.length === 0 ? "No resources yet" : "Nothing matches these filters"}</div>
          <p className="text-xs text-slate-400 mt-1">Click "Add Class Resource" to upload slides, worksheets or links.</p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((res) => {
    const href = res.file_url ? getStorageUrl(res.file_url) : res.link;
    return <div key={res.id} className="p-4 rounded-2xl bg-[#101424] border border-[#1E2540] flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-indigo-400 truncate">{res.course_title}</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase border ${res.visibility === "students" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                      {res.visibility === "students" ? "Shared" : "Private"}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{res.title}</h3>
                  {res.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{res.description}</p>}
                  <div className="text-xs text-slate-500 mt-2 truncate">
                    {res.file_name || res.link}
                  </div>
                </div>
                <div className="pt-3 border-t border-[#181F36] flex items-center justify-between gap-2">
                  <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
    >
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                  <div className="flex items-center gap-1.5">
                    <button
      onClick={() => toggleVisibility(res)}
      title={res.visibility === "students" ? "Hide from students" : "Share with students"}
      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C30] cursor-pointer"
    >
                      {res.visibility === "students" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
      onClick={() => setDeleting(res)}
      title="Delete"
      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>;
  })}
        </div>}

      {isAddOpen && <AddResourceModal
    courses={courses}
    onClose={() => setIsAddOpen(false)}
    onCreated={(created) => {
      setResources((prev) => [created, ...prev]);
      toastManager.success(`"${created.title}" added`);
    }}
  />}

      <ConfirmDialog
    open={Boolean(deleting)}
    variant="danger"
    title="Delete this resource?"
    message={deleting ? `"${deleting.title}" will be removed for you and your students.` : ""}
    confirmLabel="Delete"
    cancelLabel="Cancel"
    onConfirm={confirmDelete}
    onCancel={() => setDeleting(null)}
  />
    </div>;
};
