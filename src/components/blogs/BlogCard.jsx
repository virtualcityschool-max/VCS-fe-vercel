import React from "react";
import { Link } from "react-router-dom";
import { getStorageUrl } from "../../utils/storageUrl";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

/**
 * BlogCard — public/admin blog preview card in the VCS glass style.
 * Links to the SEO-friendly slug URL. Shows a "Draft" badge when the blog
 * is unpublished (admins are the only ones who ever receive drafts).
 */
const BlogCard = ({ blog, index = 0 }) => {
  const cover = getStorageUrl(blog.cover_image);
  const isDraft = blog.status && blog.status !== "published";

  return (
    <article
      style={{ animationDelay: `${index * 0.05}s` }}
      className="group flex flex-col bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 shadow-lg animate-springyReveal opacity-0 glass-shine hover-lift"
    >
      {/* Cover — fixed, shorter height keeps every card balanced and uniform */}
      <Link to={`/blogs/${blog.slug}`} className="block relative h-36 overflow-hidden bg-slate-900/50 shrink-0">
        {cover ? (
          <img
            src={cover}
            alt={blog.title}
            loading="lazy"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <i className="fas fa-newspaper text-slate-700 text-3xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        {blog.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-sm">
            {blog.category}
          </span>
        )}
        {isDraft && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-sm">
            Draft
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5 gap-3">
        <Link to={`/blogs/${blog.slug}`}>
          <h3 className="text-base font-black font-poppins leading-snug tracking-tight text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
            {blog.title || "Untitled"}
          </h3>
        </Link>
        {blog.excerpt && (
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
          <span className="font-semibold text-slate-400 truncate max-w-[55%]">
            {blog.author || "Admin"}
          </span>
          <span className="flex items-center gap-3 shrink-0">
            {blog.published_at || blog.created_at ? (
              <span>{formatDate(blog.published_at || blog.created_at)}</span>
            ) : null}
            <span className="flex items-center gap-1">
              <i className="fas fa-clock text-[8px]" /> {blog.read_time || 1} min
            </span>
          </span>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
