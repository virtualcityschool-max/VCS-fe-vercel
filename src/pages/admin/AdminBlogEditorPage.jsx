import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createBlog, updateBlog } from "../../store/slices/blogsSlice";
import { blogsService } from "../../services/blogsService";
import QuillEditor from "../../components/common/QuillEditor";
import { LoadingSpinner } from "../../components/ui";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import { getStorageUrl } from "../../utils/storageUrl";
import { parseYouTubeId, youTubeThumbnail } from "../../utils/youtube";
import VideoEmbed from "../../components/blogs/VideoEmbed";

const MAX_IMAGE_MB = 5;
const EMPTY_FORM = {
  title: "",
  excerpt: "",
  category: "",
  author_name: "",
  content: "",
  meta_title: "",
  meta_description: "",
  status: "draft",
  post_type: "article",
  video_url: "",
};

const labelCls = "block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400";
const inputCls =
  "w-full bg-slate-900/70 border border-slate-700/70 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition";

const AdminBlogEditorPage = () => {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const fileRef = useRef(null);

  // Blogs are published by admins, so default the author to the signed-in admin.
  const authUser = useSelector((s) => s.auth.user || s.auth.profile);
  const adminName = useMemo(() => {
    if (!authUser) return "";
    const full = `${authUser.first_name || ""} ${authUser.last_name || ""}`.trim();
    return full || authUser.username || "";
  }, [authUser]);

  // Pre-select the post type based on which manager (Blogs/Vlogs) linked here,
  // same as the New Blog/New Vlog button that navigated to this page.
  const [form, setForm] = useState(() =>
    isEdit ? EMPTY_FORM : { ...EMPTY_FORM, post_type: location.state?.post_type || "article" },
  );
  const [errors, setErrors] = useState({});
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null); // existing url
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);
  // Author is locked by default (auto-filled) and only editable after the admin
  // clicks the lock icon - prevents accidental edits to the published byline.
  const [authorLocked, setAuthorLocked] = useState(true);

  // Load existing blog when editing.
  useEffect(() => {
    let alive = true;
    if (!isEdit) return;
    setLoading(true);
    blogsService
      .getBlogBySlug(slug)
      .then((b) => {
        if (!alive) return;
        setForm({
          title: b.title || "",
          excerpt: b.excerpt || "",
          category: b.category || "",
          author_name: b.author_name || b.author || "",
          content: b.content || "",
          meta_title: b.meta_title || "",
          meta_description: b.meta_description || "",
          status: b.status || "draft",
          post_type: b.post_type || "article",
          video_url: b.video_url || "",
        });
        setCoverPreview(getStorageUrl(b.cover_image));
      })
      .catch((e) => {
        showApiError(e);
        navigate("/admin/blogs");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug, isEdit, navigate]);

  // Auto-fill the author with the admin's name on a new post (once we know it).
  useEffect(() => {
    if (isEdit || !adminName) return;
    setForm((f) => (f.author_name ? f : { ...f, author_name: adminName }));
  }, [isEdit, adminName]);

  const onChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
      toastManager.error("Please choose a JPG, PNG, WEBP or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toastManager.error(`Image must be under ${MAX_IMAGE_MB}MB.`);
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setDirty(true);
  };

  const isVideoPost = form.post_type === "video";
  // Live-parsed id drives the preview while the admin is still typing.
  const previewVideoId = useMemo(
    () => parseYouTubeId(form.video_url),
    [form.video_url],
  );
  const videoUrlTouched = Boolean(form.video_url.trim());
  const videoUrlInvalid = videoUrlTouched && !previewVideoId;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.trim().length < 4) e.title = "Title is too short";
    if (form.meta_description && form.meta_description.length > 320)
      e.meta_description = "Keep the meta description under 320 characters";
    if (isVideoPost) {
      if (!form.video_url.trim())
        e.video_url = "A YouTube video link is required for a video blog";
      else if (!previewVideoId)
        e.video_url = "That doesn't look like a YouTube link";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = (status) => {
    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("excerpt", form.excerpt.trim());
    fd.append("category", form.category.trim());
    fd.append("author_name", form.author_name.trim());
    fd.append("content", form.content || "");
    fd.append("meta_title", form.meta_title.trim());
    fd.append("meta_description", form.meta_description.trim());
    fd.append("status", status);
    fd.append("post_type", form.post_type);
    // Always sent so switching a video post back to an article clears the link.
    fd.append("video_url", isVideoPost ? form.video_url.trim() : "");
    if (coverFile instanceof File) fd.append("cover_image", coverFile);
    return fd;
  };

  const save = async (status) => {
    if (!validate()) {
      toastManager.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await dispatch(
          updateBlog({ slug, formData: buildPayload(status) }),
        ).unwrap();
        toastManager.success(
          status === "published" ? "Blog published" : "Blog saved",
        );
      } else {
        await dispatch(createBlog(buildPayload(status))).unwrap();
        toastManager.success(
          status === "published" ? "Blog published" : "Draft saved",
        );
      }
      setDirty(false);
      navigate("/admin/blogs");
    } catch (e) {
      showApiError(e);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (dirty) setLeaveConfirm(true);
    else navigate("/admin/blogs");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sticky action bar - no divider so the page header stays clean */}
      <div className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-[11px] font-black uppercase tracking-widest transition"
          >
            <i className="fas fa-arrow-left text-[10px]" /> Blogs
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => save("draft")}
              disabled={saving}
              className="px-4 sm:px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => save("published")}
              disabled={saving}
              className="btn-glow px-5 sm:px-6 py-2.5 rounded-xl text-white text-[12px] font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
            >
              <i className="fas fa-paper-plane text-[10px]" />
              {form.status === "published" ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-1.5">
            {isEdit ? "Edit" : "New"} {isVideoPost ? "Video Blog" : "Article"}
          </p>
          <h1 className="text-2xl md:text-3xl font-black font-poppins tracking-tight">
            {isEdit
              ? isVideoPost ? "Edit Vlog Post" : "Edit Blog Post"
              : isVideoPost ? "Create a Vlog Post" : "Create a Blog Post"}
          </h1>
        </div>

        {/* Post type - decides whether this post leads with a cover or a player */}
        <div className="mb-8">
          <label className={`${labelCls} mb-2`}>Post Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {[
              {
                id: "article",
                icon: "fa-newspaper",
                title: "Article",
                blurb: "A written post with a cover image.",
              },
              {
                id: "video",
                icon: "fa-circle-play",
                title: "Video Blog",
                blurb: "A YouTube video that plays on the blog page.",
              },
            ].map((t) => {
              const active = form.post_type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChange("post_type", t.id)}
                  className={`text-left rounded-2xl border p-4 transition ${
                    active
                      ? "border-indigo-500/60 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                      : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <i
                      className={`fas ${t.icon} text-sm ${
                        active ? "text-indigo-400" : "text-slate-500"
                      }`}
                    />
                    <span className="text-sm font-black text-white">{t.title}</span>
                    {active && (
                      <i className="fas fa-check-circle text-indigo-400 text-xs ml-auto" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t.blurb}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main column */}
          <div className="space-y-6">
            {isVideoPost && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fab fa-youtube text-red-500" />
                  <label className={`${labelCls} mb-0`}>YouTube Video Link</label>
                  <span className="text-red-400 text-xs">*</span>
                </div>

                <div className="relative">
                  <input
                    className={`${inputCls} pr-11 ${
                      errors.video_url || videoUrlInvalid ? "border-red-500/70" : ""
                    } ${previewVideoId ? "border-emerald-500/50" : ""}`}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    value={form.video_url}
                    onChange={(e) => onChange("video_url", e.target.value)}
                  />
                  {videoUrlTouched && (
                    <i
                      className={`fas ${
                        previewVideoId
                          ? "fa-circle-check text-emerald-400"
                          : "fa-circle-exclamation text-red-400"
                      } absolute right-4 top-1/2 -translate-y-1/2 text-sm`}
                    />
                  )}
                </div>

                {errors.video_url ? (
                  <p className="text-red-400 text-xs mt-1.5">{errors.video_url}</p>
                ) : videoUrlInvalid ? (
                  <p className="text-red-400 text-xs mt-1.5">
                    That doesn't look like a YouTube link. Paste a watch, youtu.be,
                    shorts or embed URL.
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-600 mt-1.5">
                    Works with watch, youtu.be, shorts, live and embed links -
                    extra parameters are fine.
                  </p>
                )}

                {/* Live preview - appears the moment a valid link is pasted */}
                {previewVideoId ? (
                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">
                        <i className="fas fa-eye text-[10px]" /> Live preview
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">
                        ID: {previewVideoId}
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-700/70 max-w-xl">
                      <VideoEmbed
                        videoId={previewVideoId}
                        title={form.title || "Video preview"}
                        rounded="rounded-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2">
                      This is exactly how the video appears to visitors - press
                      play to check you pasted the right one.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 max-w-xl aspect-video flex flex-col items-center justify-center text-center px-6">
                    <i className="fab fa-youtube text-slate-700 text-3xl mb-3" />
                    <p className="text-slate-500 text-xs font-semibold">
                      Paste a YouTube link to see the preview
                    </p>
                    <p className="text-slate-600 text-[10px] mt-1">
                      The player will appear here instantly
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className={labelCls}>Title</label>
              <input
                className={`${inputCls} text-lg font-bold ${errors.title ? "border-red-500/70" : ""}`}
                placeholder="An attention-grabbing headline"
                value={form.title}
                onChange={(e) => onChange("title", e.target.value)}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1.5">{errors.title}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Excerpt / Subtitle</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                maxLength={300}
                placeholder="A short summary shown on cards and used for SEO (optional - auto-generated if left blank)."
                value={form.excerpt}
                onChange={(e) => onChange("excerpt", e.target.value)}
              />
              <p className="text-[10px] text-slate-600 mt-1 text-right">
                {form.excerpt.length}/300
              </p>
            </div>

            <div>
              <label className={labelCls}>
                {isVideoPost ? "Description (optional)" : "Content"}
              </label>
              <div className="bg-slate-900/60 border border-slate-700/70 rounded-xl overflow-hidden blog-editor-shell">
                <QuillEditor
                  value={form.content}
                  onChange={(val) => onChange("content", val)}
                  placeholder={
                    isVideoPost
                      ? "Add notes, chapters or a summary shown under the video…"
                      : "Write your article - use the H1/H2/H3 buttons for headings…"
                  }
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-2">
                <i className="fas fa-shield-halved mr-1" /> Content is sanitized on
                save - unsafe HTML/scripts are automatically removed.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Current status (read-only indicator - actions live in the top bar) */}
            {isEdit && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    form.status === "published"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                      : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                  }`}
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                    Current status
                  </p>
                  <p className="text-sm font-bold text-white capitalize">
                    {form.status === "published" ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
            )}

            {/* Cover image */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <label className={labelCls}>
                {isVideoPost ? "Cover Image (optional)" : "Cover Image"}
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative h-40 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-900/60 cursor-pointer overflow-hidden flex items-center justify-center transition group"
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        <i className="fas fa-camera mr-1.5" /> Change
                      </span>
                    </div>
                  </>
                ) : isVideoPost && previewVideoId ? (
                  /* No upload yet - show the YouTube thumbnail that will be used */
                  <>
                    <img
                      src={youTubeThumbnail(previewVideoId)}
                      alt="video thumbnail"
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center text-center px-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                        Using video thumbnail
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Click to upload your own
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-500">
                    <i className="fas fa-image text-2xl mb-2" />
                    <p className="text-[11px] font-semibold">Click to upload</p>
                    <p className="text-[10px] text-slate-600">JPG/PNG/WEBP · under {MAX_IMAGE_MB}MB</p>
                  </div>
                )}
              </div>
              {isVideoPost && (
                <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                  Leave empty to use the video's own thumbnail as the poster.
                </p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                className="hidden"
                onChange={onPickImage}
              />
            </div>

            {/* Meta */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <label className={labelCls}>Category</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Study Tips"
                  value={form.category}
                  onChange={(e) => onChange("category", e.target.value)}
                />
              </div>
              <div>
                <div className="flex gap-1.5 mb-2">
                  <label className={`${labelCls} mb-0`}>Author</label>
                  {/* Info tooltip: explains that this value is the public byline. */}
                  <span className="group relative inline-flex">
                    <i className="fas fa-circle-info text-slate-500 hover:text-indigo-400 text-[11px] cursor-pointer" />
                    <span className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-52 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-[11px] font-medium normal-case tracking-normal text-slate-200 leading-snug opacity-0 group-hover:opacity-100 transition z-20 shadow-xl">
                      This name is shown publicly as the article's author. It
                      defaults to your admin name.
                    </span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-10 ${authorLocked ? "opacity-70 cursor-not-allowed" : ""}`}
                    placeholder="Defaults to your admin name"
                    value={form.author_name}
                    readOnly={authorLocked}
                    onChange={(e) => onChange("author_name", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setAuthorLocked((v) => !v)}
                    title={authorLocked ? "Unlock to edit the author" : "Lock the author"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
                  >
                    <i className={`fas ${authorLocked ? "fa-lock" : "fa-lock-open"} text-[11px]`} />
                  </button>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-magnifying-glass text-indigo-400 text-xs" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-300">
                  SEO
                </span>
              </div>
              <div>
                <label className={labelCls}>Meta Title</label>
                <input
                  className={inputCls}
                  maxLength={200}
                  placeholder="Defaults to the title"
                  value={form.meta_title}
                  onChange={(e) => onChange("meta_title", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Meta Description</label>
                <textarea
                  className={`${inputCls} resize-none ${errors.meta_description ? "border-red-500/70" : ""}`}
                  rows={3}
                  maxLength={320}
                  placeholder="Defaults to the excerpt"
                  value={form.meta_description}
                  onChange={(e) => onChange("meta_description", e.target.value)}
                />
                <p className="text-[10px] text-slate-600 mt-1 text-right">
                  {form.meta_description.length}/320
                </p>
                {errors.meta_description && (
                  <p className="text-red-400 text-xs mt-1">{errors.meta_description}</p>
                )}
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                The public URL is generated from the title as a clean, SEO-friendly
                slug.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={leaveConfirm}
        variant="danger"
        title="Discard changes?"
        message="You have unsaved changes. Leaving now will discard them."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          setLeaveConfirm(false);
          navigate("/admin/blogs");
        }}
        onCancel={() => setLeaveConfirm(false)}
      />
    </div>
  );
};

export default AdminBlogEditorPage;
