import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBlogs,
  deleteBlog,
  updateBlog,
  createBlog,
} from "../../store/slices/blogsSlice";
import { blogsService } from "../../services/blogsService";
import { LoadingSpinner } from "../../components/ui";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { getStorageUrl } from "../../utils/storageUrl";
import { blogVideoId, youTubeThumbnail } from "../../utils/youtube";

const formatDate = (v) => {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const AdminBlogsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  // "/admin/vlogs" and "/admin/blogs" are the same page pre-filtered by the
  // sidebar link that led here (each route remounts this page - see the
  // `key` on the two <Route> entries - so this only runs once per landing).
  const isVlogsRoute = location.pathname.startsWith("/admin/vlogs");
  const { blogs, isLoading } = useSelector((state) => state.blogs);
  // Persist the filters so they're kept when editing a blog and coming back.
  const [search, setSearch] = useState(() => {
    try { return sessionStorage.getItem("admin_blogs_search") || ""; } catch { return ""; }
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    try { return sessionStorage.getItem("admin_blogs_status") || "all"; } catch { return "all"; }
  });
  useEffect(() => {
    try {
      if (search) sessionStorage.setItem("admin_blogs_search", search);
      else sessionStorage.removeItem("admin_blogs_search");
    } catch { /* storage unavailable */ }
  }, [search]);
  useEffect(() => {
    try { sessionStorage.setItem("admin_blogs_status", statusFilter); } catch { /* ignore */ }
  }, [statusFilter]);
  const [typeFilter, setTypeFilter] = useState(() => isVlogsRoute ? "video" : "article");
  const [togglingSlug, setTogglingSlug] = useState(null);
  const [duplicatingSlug, setDuplicatingSlug] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, slug: null, title: "" });
  // Publishing/unpublishing changes what the public site shows, so ask first.
  const [publishConfirm, setPublishConfirm] = useState({
    open: false,
    blog: null,
  });

  useEffect(() => {
    // Admin (authenticated) receives drafts + published from the same endpoint.
    dispatch(fetchBlogs({ ordering: "-created_at" }));
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const matchStatus =
        statusFilter === "all" || b.status === statusFilter;
      const matchType =
        typeFilter === "all" || (b.post_type || "article") === typeFilter;
      const matchSearch =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q);
      return matchStatus && matchType && matchSearch;
    });
  }, [blogs, search, statusFilter, typeFilter]);

  const counts = useMemo(
    () => ({
      all: blogs.length,
      video: blogs.filter((b) => b.post_type === "video").length,
      article: blogs.filter((b) => (b.post_type || "article") === "article").length,
    }),
    [blogs],
  );

  const toggleStatus = async (blog) => {
    const next = blog.status === "published" ? "draft" : "published";
    setPublishConfirm({ open: false, blog: null });
    setTogglingSlug(blog.slug);
    try {
      await dispatch(
        updateBlog({ slug: blog.slug, formData: { status: next } }),
      ).unwrap();
      toastManager.success(
        next === "published" ? "Blog published" : "Moved to draft",
      );
    } catch (e) {
      showApiError(e);
    } finally {
      setTogglingSlug(null);
    }
  };

  // Duplicate an existing blog into a fresh draft so admins can reuse its
  // content instead of rewriting it. The list payload omits the full HTML body,
  // so fetch the complete blog by slug first, then create a copy.
  const duplicateBlog = async (blog) => {
    setDuplicatingSlug(blog.slug);
    try {
      const full = await blogsService.getBlogBySlug(blog.slug);
      const fd = new FormData();
      fd.append("title", `${full.title || "Untitled"} (Copy)`);
      fd.append("excerpt", full.excerpt || "");
      fd.append("category", full.category || "");
      fd.append("author_name", full.author_name || full.author || "");
      fd.append("content", full.content || "");
      fd.append("meta_title", full.meta_title || "");
      fd.append("meta_description", full.meta_description || "");
      fd.append("status", "draft"); // always start a copy as an unpublished draft
      // Carry the format across so a duplicated video blog stays a video blog
      fd.append("post_type", full.post_type || "article");
      fd.append("video_url", full.video_url || "");
      // Copy the original's cover image server-side (no re-upload needed).
      if (full.cover_image) fd.append("copy_cover_from", blog.slug);
      const created = await dispatch(createBlog(fd)).unwrap();
      toastManager.success("Blog duplicated as a draft");
      if (created?.slug) navigate(`/admin/blogs/${created.slug}/edit`);
    } catch (e) {
      showApiError(e);
    } finally {
      setDuplicatingSlug(null);
    }
  };

  const confirmDelete = async () => {
    const { slug } = confirm;
    setConfirm({ open: false, slug: null, title: "" });
    try {
      await dispatch(deleteBlog(slug)).unwrap();
      toastManager.success("Blog deleted");
    } catch (e) {
      showApiError(e);
    }
  };

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-1.5">
            Content
          </p>
          <h1 className="text-2xl md:text-3xl font-black font-poppins tracking-tight text-white">
            Blog Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            Create, publish and manage articles shown on the public site.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/blogs/new")}
          className="btn-glow px-5 py-3 rounded-xl text-white text-[12px] font-black uppercase tracking-wider flex items-center gap-2 self-start"
        >
          <i className="fas fa-plus text-[10px]" /> New Blog
        </button>
      </div>

      {/* Controls - compact grouped tabs in the approvals-page style */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Row 1: format tabs on the left, search pinned right */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {counts.video > 0 && (
            <div className="inline-flex items-center gap-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-1 backdrop-blur-sm self-start">
              {[
                { id: "all", label: "Everything", count: counts.all, icon: "fa-layer-group" },
                { id: "article", label: "Articles", count: counts.article, icon: "fa-newspaper" },
                { id: "video", label: "Videos", count: counts.video, icon: "fa-circle-play" },
              ].map((t) => {
                const active = typeFilter === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id)}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-white text-slate-900 shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <i className={`fas ${t.icon} text-xs`} />
                    {t.label}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        active ? "bg-slate-900/10 text-slate-700" : "bg-slate-700 text-white"
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="relative sm:ml-auto sm:w-72">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-slate-900/70 border border-slate-700/70 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition"
            />
          </div>
        </div>

        {/* Row 2: status tabs */}
        <div className="inline-flex items-center gap-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-1 backdrop-blur-sm self-start">
          {[
            { id: "all", label: "All" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Drafts" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === t.id
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading && blogs.length === 0 ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <i className="fas fa-newspaper text-slate-600 text-xl" />
          </div>
          <h3 className="text-white font-black mb-1">No blogs found</h3>
          <p className="text-slate-500 text-sm mb-5">
            {blogs.length === 0
              ? "Start by writing your first article."
              : "Try a different search or filter."}
          </p>
          {blogs.length === 0 && (
            <button
              onClick={() => navigate("/admin/blogs/new")}
              className="btn-glow px-5 py-2.5 rounded-xl text-white text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-2"
            >
              <i className="fas fa-plus text-[10px]" /> New Blog
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((blog) => {
            const isVideo = blog.post_type === "video";
            // Video posts fall back to the YouTube poster when no cover was set
            const cover =
              getStorageUrl(blog.cover_image) ||
              (isVideo
                ? blog.video_thumbnail || youTubeThumbnail(blogVideoId(blog))
                : "");
            const published = blog.status === "published";
            return (
              <div
                key={blog.id}
                className="group flex items-center gap-4 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 transition"
              >
                {/* Thumb */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center">
                  {cover ? (
                    <img src={cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <i className={`fas ${isVideo ? "fa-circle-play" : "fa-newspaper"} text-slate-600`} />
                  )}
                  {isVideo && cover && (
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
                      <span className="w-7 h-7 rounded-full bg-red-600/90 flex items-center justify-center">
                        <i className="fas fa-play text-white text-[9px] ml-0.5" />
                      </span>
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        published
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-400/30"
                      }`}
                    >
                      {published ? "Published" : "Draft"}
                    </span>
                    {isVideo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-300 border border-red-400/30">
                        <i className="fas fa-play text-[7px]" /> Video
                      </span>
                    )}
                    {blog.category && (
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide truncate">
                        {blog.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-sm truncate">
                    {blog.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {blog.author || "Admin"} ·{" "}
                    {published
                      ? formatDate(blog.published_at || blog.created_at)
                      : `updated ${formatDate(blog.created_at)}`}{" "}
                    · {isVideo ? "Video" : `${blog.read_time || 1} min`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {published && (
                    <a
                      href={`/blogs/${blog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View public page"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
                    >
                      <i className="fas fa-external-link-alt text-xs" />
                    </a>
                  )}
                  <button
                    onClick={() => setPublishConfirm({ open: true, blog })}
                    disabled={togglingSlug === blog.slug}
                    title={published ? "Unpublish" : "Publish"}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition disabled:opacity-50 ${
                      published
                        ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    <i
                      className={`fas ${
                        togglingSlug === blog.slug
                          ? "fa-spinner fa-spin"
                          : published
                            ? "fa-eye-slash"
                            : "fa-paper-plane"
                      } text-xs`}
                    />
                  </button>
                  <button
                    onClick={() => duplicateBlog(blog)}
                    disabled={duplicatingSlug === blog.slug}
                    title="Duplicate this blog (creates an editable draft copy)"
                    className="w-9 h-9 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition disabled:opacity-50"
                  >
                    <i
                      className={`fas ${
                        duplicatingSlug === blog.slug ? "fa-spinner fa-spin" : "fa-copy"
                      } text-xs`}
                    />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/blogs/${blog.slug}/edit`)}
                    title="Edit"
                    className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 flex items-center justify-center transition"
                  >
                    <i className="fas fa-pen text-xs" />
                  </button>
                  <button
                    onClick={() =>
                      setConfirm({ open: true, slug: blog.slug, title: blog.title })
                    }
                    title="Delete"
                    className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition"
                  >
                    <i className="fas fa-trash text-xs" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={publishConfirm.open}
        variant={
          publishConfirm.blog?.status === "published" ? "warning" : "success"
        }
        title={
          publishConfirm.blog?.status === "published"
            ? "Unpublish Blog"
            : "Publish Blog"
        }
        message={
          publishConfirm.blog?.status === "published"
            ? `Move "${publishConfirm.blog?.title}" back to draft? It will no longer be visible on the public site.`
            : `Publish "${publishConfirm.blog?.title}"? It will go live and be visible to everyone on the public site.`
        }
        confirmLabel={
          publishConfirm.blog?.status === "published" ? "Unpublish" : "Publish"
        }
        cancelLabel="Cancel"
        onConfirm={() => toggleStatus(publishConfirm.blog)}
        onCancel={() => setPublishConfirm({ open: false, blog: null })}
      />

      <ConfirmDialog
        open={confirm.open}
        variant="danger"
        title="Delete Blog"
        message={`Delete "${confirm.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false, slug: null, title: "" })}
      />
    </div>
  );
};

export default AdminBlogsPage;
