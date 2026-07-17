import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../store/slices/blogsSlice";
import { SearchInput } from "../../components/ui";
import Reveal from "../../components/ui/Reveal";
import BlogCard from "../../components/blogs/BlogCard";
import { useSeo } from "../../hooks/useSeo";
import { getStorageUrl } from "../../utils/storageUrl";

const Blogs = () => {
  const dispatch = useDispatch();
  const { blogs, isLoading } = useSelector((state) => state.blogs);
  const [search, setSearch] = useState("");
  // Keep the active category in the URL so it is preserved when a reader opens
  // an article and navigates back (browser restores /blogs?category=…).
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const setActiveCategory = (cat) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "all") next.delete("category");
    else next.set("category", cat);
    setSearchParams(next, { replace: true });
  };

  useSeo({
    title: "Blog — Insights, Guides & Updates",
    description:
      "Read the latest articles, learning guides and announcements from Virtual City School — expert insight for Cambridge students, parents and educators.",
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const matchCat =
        activeCategory === "all" || (b.category || "") === activeCategory;
      const matchSearch =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [blogs, search, activeCategory]);

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
            Guides, ideas and updates from our educators — crafted to help
            learners and families get the most out of their journey.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          <div className="md:w-80">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-900/40"
                    : "bg-white/5 text-slate-400 border border-white/5 hover:text-white hover:border-indigo-500/30"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && blogs.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl border border-white/5 h-[360px]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <i className="fas fa-newspaper text-slate-600 text-2xl" />
            </div>
            <h3 className="text-lg font-black text-white mb-1.5">No articles yet</h3>
            <p className="text-slate-500 text-sm">
              {search || activeCategory !== "all"
                ? "Try a different search or category."
                : "Check back soon — fresh stories are on the way."}
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </section>
    </main>
  );
};

// Large lead card for the newest article.
const FeaturedBlog = ({ blog }) => {
  const cover = getStorageUrl(blog.cover_image);
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[1.75rem] overflow-hidden border border-white/10 bg-[#131a2c]/60 backdrop-blur-xl hover:border-indigo-500/40 transition-all"
    >
      <div className="relative h-64 lg:h-full min-h-[280px] overflow-hidden bg-slate-900/50">
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
      </div>
      <div className="p-8 lg:p-12 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-[9px] font-black uppercase tracking-[0.2em]">
            Featured
          </span>
          {blog.category && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {blog.category}
            </span>
          )}
        </div>
        <h2 className="text-2xl md:text-3xl font-black font-poppins tracking-tight leading-tight text-white group-hover:text-indigo-300 transition-colors">
          {blog.title}
        </h2>
        {blog.excerpt && (
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mt-4 line-clamp-3">
            {blog.excerpt}
          </p>
        )}
        <div className="mt-6 flex items-center gap-4 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">{blog.author || "Admin"}</span>
          <span className="flex items-center gap-1">
            <i className="fas fa-clock text-[8px]" /> {blog.read_time || 1} min read
          </span>
          <span className="text-indigo-400 font-black uppercase tracking-widest ml-auto flex items-center gap-2">
            Read <i className="fas fa-arrow-right text-[8px] group-hover:translate-x-1 transition" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Blogs;
