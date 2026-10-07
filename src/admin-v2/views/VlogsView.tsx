import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusPill } from '../components/common/StatusPill';
import { Video, Plus, Eye, Play, Search, Clock } from 'lucide-react';

export const VlogsView: React.FC = () => {
  const { posts, openQuickAdd, togglePostStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Published' | 'Draft'>('all');

  const vlogs = posts.filter((p) => p.type === 'Video');

  const filtered = vlogs.filter((post) => {
    const matchStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150">
      <PageHeader
        title="Vlogs & Video Masterclasses"
        subtitle="Publish Cambridge past paper walk-throughs, laboratory demonstrations, and recorded webinars."
        primaryAction={{
          label: 'New vlog / masterclass',
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
            placeholder="Search vlog title or teacher..."
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
              {s === 'all' ? `All (${vlogs.length})` : s}
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
              <div className="h-44 bg-gradient-to-tr from-[#0F172A] to-[#1E293B] border-b border-[#1E2648] relative flex items-center justify-center overflow-hidden">
                {post.thumbnailUrl && (
                  <img src={post.thumbnailUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                )}
                <div className="relative w-12 h-12 rounded-full bg-rose-500/20 backdrop-blur-sm text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white font-mono">
                    Video Vlog
                  </span>
                  <StatusPill status={post.status} />
                </div>

                <div className="absolute bottom-2.5 right-3 text-[11px] font-mono text-slate-300 bg-black/70 px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-400" />
                  <span>{post.readTimeOrDuration}</span>
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
