import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusPill } from '../components/common/StatusPill';
import { FileText, Plus, Eye, Calendar, User, Clock, Search } from 'lucide-react';

export const BlogsView: React.FC = () => {
  const { posts, openQuickAdd, togglePostStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Published' | 'Draft'>('all');

  const articles = posts.filter((p) => p.type === 'Article');

  const filtered = articles.filter((post) => {
    const matchStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Blogs & Editorial Articles"
        subtitle="Manage Cambridge exam preparation guides, curriculum comparisons, and school announcements."
        primaryAction={{
          label: 'New blog post',
          onClick: () => openQuickAdd('post'),
          icon: Plus,
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search article title or author..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#232D52] bg-[#121831] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121831] border border-[#232D52] rounded-xl">
          {(['all', 'Published', 'Draft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === s ? 'bg-[#6D5BFF] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s === 'all' ? `All (${articles.length})` : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-[#232D52] bg-[#121831] overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-600 transition-all group"
          >
            <div>
              <div className="h-40 bg-gradient-to-tr from-[#0F172A] to-[#1E293B] border-b border-[#1E2648] p-5 flex flex-col justify-between relative">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white font-mono">
                    Article
                  </span>
                  <StatusPill status={post.status} />
                </div>

                <div className="text-xs text-indigo-300 font-mono flex items-center gap-1">
                  <span>{post.category}</span>
                </div>

                <div className="absolute bottom-3 right-4 text-[11px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                  {post.readTimeOrDuration}
                </div>
              </div>

              <div className="p-5 space-y-2.5">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                  <span className="truncate">{post.author}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#1E2648] bg-[#0E1428] flex items-center justify-between text-xs">
              <span className="flex items-center gap-3">
                <a
                  href={`/admin/blogs/${post.slug}/edit`}
                  className="text-indigo-300 hover:text-indigo-200 font-semibold"
                >
                  Edit
                </a>
                {post.status === 'Published' && (
                  <a
                    href={`/blogs/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View on site
                  </a>
                )}
              </span>
              <button
                onClick={() => togglePostStatus(post.id)}
                className="px-3 py-1 rounded-lg border border-[#232D52] text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {post.status === 'Published' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
