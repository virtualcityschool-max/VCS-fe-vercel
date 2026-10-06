import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusPill } from '../components/common/StatusPill';
import { ContentPost } from '../types';
import {
  FileText,
  Video,
  Plus,
  Eye,
  Calendar,
  User,
  Clock,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

export const BlogVideosView: React.FC = () => {
  const { posts, addPost, togglePostStatus, openQuickAdd } = useApp();
  const [typeTab, setTypeTab] = useState<'all' | 'Article' | 'Video'>('all');
  const [statusTab, setStatusTab] = useState<'all' | 'Published' | 'Draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const articlesCount = posts.filter((p) => p.type === 'Article').length;
  const videosCount = posts.filter((p) => p.type === 'Video').length;

  const filtered = posts.filter((post) => {
    const matchType = typeTab === 'all' || post.type === typeTab;
    const matchStatus = statusTab === 'all' || post.status === statusTab;
    const matchSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Blog & Video Media Manager"
        subtitle="Unified content publishing center for Cambridge revision articles, masterclass video webinars, and guides."
        primaryAction={{
          label: 'New post',
          onClick: () => openQuickAdd('post'),
          icon: Plus,
        }}
      />

      {/* Tabs Row: Format Type and Publication Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Type Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121831] border border-[#232D52] rounded-xl w-fit">
          <button
            onClick={() => setTypeTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              typeTab === 'all' ? 'bg-[#6D5BFF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Content ({posts.length})
          </button>
          <button
            onClick={() => setTypeTab('Article')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              typeTab === 'Article' ? 'bg-[#6D5BFF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Articles ({articlesCount})</span>
          </button>
          <button
            onClick={() => setTypeTab('Video')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              typeTab === 'Video' ? 'bg-[#6D5BFF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos ({videosCount})</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusTab}
            onChange={(e) => setStatusTab(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#232D52] bg-[#121831] text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All States</option>
            <option value="Published">Published Only</option>
            <option value="Draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Grid of Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-[#232D52] bg-[#121831] overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-600 transition-all group"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative h-44 bg-gradient-to-tr from-[#0F172A] to-[#1E293B] border-b border-[#1E2648] flex items-center justify-center overflow-hidden">
                <div className="text-center p-4">
                  {post.type === 'Video' ? (
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Video className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <span className="text-[11px] font-mono text-slate-400">{post.category}</span>
                </div>

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      post.type === 'Video'
                        ? 'bg-rose-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {post.type}
                  </span>
                  <StatusPill status={post.status} />
                </div>

                <div className="absolute bottom-2.5 right-3 text-[11px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  {post.readTimeOrDuration}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-2.5">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">{post.author}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[#1E2648] bg-[#0E1428] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.views} views</span>
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
