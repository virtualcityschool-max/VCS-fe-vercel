import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../store/slices/blogsSlice";
import { SearchInput } from "../../components/ui";
import Reveal from "../../components/ui/Reveal";
import BlogCard from "../../components/blogs/BlogCard";
import VideoEmbed from "../../components/blogs/VideoEmbed";
import { useSeo } from "../../hooks/useSeo";
import { getStorageUrl } from "../../utils/storageUrl";
import { blogVideoId, isVideoBlog } from "../../utils/youtube";

const Blogs = () => {
  const dispatch = useDispatch();
  const { blogs, isLoading } = useSelector((state) => state.blogs);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const setActiveCategory = (cat) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "all") next.delete("category");
    else next.set("category", cat);
    setSearchParams(next, { replace: true });
  };
  // Articles vs video blogs — kept in the URL like the category so the tab
  // survives opening a post and coming back.
  const activeType = searchParams.get("type") || "all";
  const setActiveType = (type) => {
    const next = new URLSearchParams(searchParams);
    if (type === "all") next.delete("type");
    else next.set("type", type);
    setSearchParams(next, { replace: true });
  };

  // Filters are retained ONLY across the "open an article and come back" trip —
  // not when arriving at /blogs from elsewhere. We save the current filter the
  // moment a blog card is opened (below), then restore-and-consume it once here.
  useEffect(() => {
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem("blogs_return_filter") || "null"); } catch { saved = null; }
    if (!saved) return;
    try { sessionStorage.removeItem("blogs_return_filter"); } catch { /* ignore */ }
    if (saved.search) setSearch(saved.search);
    const next = new URLSearchParams(searchParams);
    let changed = false;
    if (saved.category && saved.category !== "all") {
      next.set("category", saved.category);
      changed = true;
    }
    if (saved.type && saved.type !== "all") {
      next.set("type", saved.type);
      changed = true;
    }
    if (changed) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called when a blog card is clicked — stash the filter so the return trip can
  // restore it. Ignores clicks that aren't on an article link.
  const rememberFilterOnBlogOpen = (e) => {
    const link = e.target.closest?.("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (!/^\/blogs\/[^/]+/.test(href)) return; // only real article links
    try {
      sessionStorage.setItem(
        "blogs_return_filter",
        JSON.stringify({ category: activeCategory, type: activeType, search }),
      );
    } catch { /* storage unavailable */ }
  };

  useSeo({
    title: "Blog - Insights, Guides & Updates",
    description:
      "Read the latest articles, learning guides and announcements from Virtual City School - expert insight for Cambridge students, parents and educators.",
    url: typeof window !== "undefined" ? window.location.href : undefined,
  });

  useEffect(() => {
    // Public list: backend returns published only for anonymous users.
    dispatch(fetchBlogs({ ordering: "-published_at" }));
  }, [dispatch]);

  const categories = useMemo(() => {
    const set = new Set(
      blogs.map((b) => (b.category || "").trim()).filter(Boolean),
    );
    return ["all", ...Array.from(set)];
  }, [blogs]);

  const videoCount = useMemo(
    () => blogs.filter((b) => b.post_type === "video").length,
    [blogs],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const matchCat =
        activeCategory === "all" || (b.category || "") === activeCategory;
      const type = b.post_type || "article";
      const matchType = activeType === "all" || type === activeType;
      const matchSearch =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        // Strip HTML tags so content matches on visible text, not markup.
        b.content?.replace(/<[^>]*>/g, " ").toLowerCase().includes(q);
      return matchCat && matchType && matchSearch;
    });
  }, [blogs, search, activeCategory, activeType]);

  const [featured, ...rest] = filtered;

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Aurora + grid backdrop */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-purple-600/10 blur-[150px] rounded-full animate-aurora" style={{ animationDelay: "-6s" }} />
      </div>
      <div className="absolute inset-x-0 top-0 h-[420px] bg-grid pointer-events-none z-0" />

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-24">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-3 animate-fadeInUp">
            The VCS Journal
          </p>
          <h1 className="text-4xl md:text-6xl font-black font-poppins tracking-tight leading-[1.05] animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            Insights & <span className="text-gradient">Stories</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed mt-5 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            Guides, ideas and updates from our educators - crafted to help
            learners and families get the most out of their journey.
          </p>
        </div>

        {/* Format tabs - only worth showing once a video blog exists */}
        {videoCount > 0 && (
          <div className="flex mb-5">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
              {[
                { id: "all", label: "Everything", icon: "fa-layer-group" },
                { id: "article", label: "Articles", icon: "fa-newspaper" },
                { id: "video", label: "Videos", icon: "fa-circle-play" },
              ].map((t) => {
                const active = activeType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveType(t.id)}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap transition-all ${
                      active
                        ? "bg-white text-slate-900 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <i className={`fas ${t.icon} text-[10px]`} />
                    {t.label}
                    {t.id === "video" && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          active ? "bg-slate-900/10 text-slate-700" : "bg-white/10 text-slate-400"
                        }`}
                      >
                        {videoCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          {/* Clean segmented category tabs */}
          {categories.length > 1 && (
            <div className="order-2 md:order-1 -mx-6 px-6 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                {categories.map((cat) => {
                  const active = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`relative px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap transition-all ${
                        active
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-900/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat === "all" ? "All" : cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="order-1 md:order-2 md:w-72 shrink-0 text-end">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or content..."
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && blogs.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl border border-white/5 h-[380px]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <i className="fas fa-newspaper text-slate-600 text-2xl" />
            </div>
            <h3 className="text-lg font-black text-white mb-1.5">
              {activeType === "video" ? "No videos yet" : "No articles yet"}
            </h3>
            <p className="text-slate-500 text-sm">
              {search || activeCategory !== "all" || activeType !== "all"
                ? "Try a different search, format or category."
                : "Check back soon - fresh stories are on the way."}
            </p>
          </div>
        ) : (
          <div onClickCapture={rememberFilterOnBlogOpen}>
            {/* Featured (first published) */}
            {featured && activeCategory === "all" && !search && (
              <Reveal className="mb-14">
                <FeaturedBlog blog={featured} />
              </Reveal>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(activeCategory === "all" && !search ? rest : filtered).map(
                (blog, i) => (
                  <BlogCard key={blog.id} blog={blog} index={i} />
                ),
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

// Large lead card for the newest post. Video posts play in place; the rest of
// the card still links through to the full page.
const FeaturedBlog = ({ blog }) => {
  const cover = getStorageUrl(blog.cover_image);
  const isVideo = isVideoBlog(blog);
  const videoId = blogVideoId(blog);

  const media =
    isVideo && videoId ? (
      <div className="relative flex items-center bg-slate-950 lg:min-h-[280px]">
        <VideoEmbed
          videoId={videoId}
          poster={cover}
          title={blog.title}
          rounded="rounded-none"
        />
      </div>
    ) : (
      <Link
        to={`/blogs/${blog.slug}`}
        className="relative block h-64 lg:h-full min-h-[280px] overflow-hidden bg-slate-900/50"
      >
        {cover ? (
          <img
            src={cover}
            alt={blog.title}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fas fa-newspaper text-slate-700 text-4xl" />
          </div>
        )}
      </Link>
    );

  return (
    <div className="group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[1.75rem] overflow-hidden border border-white/10 bg-[#131a2c]/60 backdrop-blur-xl hover:border-indigo-500/40 transition-all">
      {media}
      <div className="p-8 lg:p-12 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-[9px] font-black uppercase tracking-[0.2em]">
            Featured
          </span>
          {isVideo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[9px] font-black uppercase tracking-[0.2em]">
              <i className="fas fa-play text-[7px]" /> Video
            </span>
          )}
          {blog.category && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {blog.category}
            </span>
          )}
        </div>
        <Link to={`/blogs/${blog.slug}`}>
          <h2 className="text-2xl md:text-3xl font-black font-poppins tracking-tight leading-tight text-white group-hover:text-indigo-300 transition-colors">
            {blog.title}
          </h2>
        </Link>
        {blog.excerpt && (
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mt-4 line-clamp-3">
            {blog.excerpt}
          </p>
        )}
        <div className="mt-6 flex items-center gap-4 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">{blog.author || "Admin"}</span>
          {isVideo ? (
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <i className="fas fa-circle-play text-[9px]" /> Watch now
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <i className="fas fa-clock text-[8px]" /> {blog.read_time || 1} min read
            </span>
          )}
          <Link
            to={`/blogs/${blog.slug}`}
            className="text-indigo-400 hover:text-white font-black uppercase tracking-widest ml-auto flex items-center gap-2 transition"
          >
            {isVideo ? "Details" : "Read"}{" "}
            <i className="fas fa-arrow-right text-[8px] group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
