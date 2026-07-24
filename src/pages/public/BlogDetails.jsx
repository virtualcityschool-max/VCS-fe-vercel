import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogBySlug, fetchBlogs, clearCurrentBlog } from "../../store/slices/blogsSlice";
import { LoadingSpinner } from "../../components/ui";
import QuillViewer from "../../components/common/QuillViewer";
import Reveal from "../../components/ui/Reveal";
import BlogCard from "../../components/blogs/BlogCard";
import { getStorageUrl } from "../../utils/storageUrl";
import { useSeo } from "../../hooks/useSeo";
import { toastManager } from "../../utils/toastManager";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const BlogDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentBlog: blog, blogs, isLoading, error } = useSelector(
    (state) => state.blogs,
  );

  useEffect(() => {
    dispatch(fetchBlogBySlug(slug));
    if (blogs.length === 0) dispatch(fetchBlogs({ ordering: "-published_at" }));
    return () => dispatch(clearCurrentBlog());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, slug]);

  const found = blog && blog.slug === slug;

  useSeo({
    title: found ? blog.meta_title || blog.title : "Blog",
    description: found ? blog.meta_description || blog.excerpt : undefined,
    image: found ? getStorageUrl(blog.cover_image) : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    type: "article",
  });

  if (isLoading && !found) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  if (error && !found) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <i className="fas fa-ghost text-slate-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-black font-poppins mb-2">Article not found</h1>
          <p className="text-slate-500 text-sm mb-6">
            This story may have been unpublished or moved.
          </p>
          <Link
            to="/blogs"
            className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
          >
            <i className="fas fa-arrow-left text-xs" /> Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  if (!found) return null;

  const cover = getStorageUrl(blog.cover_image);
  const related = blogs.filter((b) => b.slug !== blog.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Aurora backdrop */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>

      <article className="relative z-10 max-w-3xl mx-auto px-6 pt-12 md:pt-16 pb-24">
        {/* Breadcrumb / back */}
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-[11px] font-black uppercase tracking-widest transition mb-8"
        >
          <i className="fas fa-arrow-left text-[9px]" /> Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          {blog.category && (
            <span className="inline-block px-3 py-1 mb-5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">
              {blog.category}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-[1.1] text-white">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mt-5">
              {blog.excerpt}
            </p>
          )}
        </header>

        {/* Cover */}
        {cover && (
          <div className="rounded-[1.5rem] overflow-hidden border border-white/10 mb-10 shadow-2xl">
            <img src={cover} alt={blog.title} className="w-full object-cover" />
          </div>
        )}

        {/* Body */}
        <div className="blog-content">
          <QuillViewer value={blog.content || ""} />
        </div>

        {/* Article metadata - kept at the end so it never interrupts reading. */}
        <div className="mt-12 pt-8 border-t border-white/5 flex items-center flex-wrap gap-x-5 gap-y-2 text-[12px] text-slate-500">
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-[11px] font-black text-white">
              {(blog.author || "A").charAt(0).toUpperCase()}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] uppercase tracking-widest text-slate-600">
                Posted by
              </span>
              <span className="font-semibold text-slate-300">{blog.author || "Admin"}</span>
            </span>
          </span>
          {(blog.published_at || blog.created_at) && (
            <span className="flex items-center gap-1.5">
              <i className="fas fa-calendar-day text-[9px]" />
              {formatDate(blog.published_at || blog.created_at)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <i className="fas fa-clock text-[9px]" /> {blog.read_time || 1} min read
          </span>
        </div>

        {/* Footer CTA */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
          <Link
            to="/blogs"
            onClick={() => {
              // "All Articles" is a fresh start - drop the retained filter so the
              // list opens on the "All" tab with no filter.
              try {
                sessionStorage.removeItem("blogs_return_filter");
              } catch { /* storage unavailable */ }
            }}
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-white text-[11px] font-black uppercase tracking-widest transition"
          >
            <i className="fas fa-arrow-left text-[9px]" /> All Articles
          </Link>
          <div className="flex items-center gap-2">
            {/* Info tooltip clarifying what the Share button does. */}
            <span className="group relative inline-flex">
              <i className="fas fa-circle-info text-slate-500 hover:text-indigo-400 text-xs cursor-pointer" />
              <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-56 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-[11px] font-medium normal-case tracking-normal text-slate-200 leading-snug opacity-0 group-hover:opacity-100 transition z-20 shadow-xl">
                Shares this article using your device's share menu, or copies the
                link to your clipboard.
              </span>
            </span>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({ title: blog.title, url: window.location.href })
                    .catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  toastManager.success("Link copied to clipboard");
                }
              }}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-[11px] font-black uppercase tracking-widest transition"
            >
              <i className="fas fa-share-nodes text-[10px]" /> Share
            </button>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
          <Reveal className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">
              Keep Reading
            </p>
            <h2 className="text-2xl md:text-3xl font-black font-poppins tracking-tight">
              More from the Blog
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((b, i) => (
              <BlogCard key={b.id} blog={b} index={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default BlogDetails;
