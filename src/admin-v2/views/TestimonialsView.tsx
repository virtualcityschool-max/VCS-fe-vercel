import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { MessageSquare, Star, Plus, Eye, EyeOff, Quote, Trash2 } from 'lucide-react';
import { Testimonial } from '../types';

export const TestimonialsView: React.FC = () => {
  const { testimonials, addTestimonial, toggleTestimonialVisibility, deleteTestimonial } = useApp() as any;
  const [modalOpen, setModalOpen] = useState(false);

  // New testimonial form
  const [authorName, setAuthorName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [visible, setVisible] = useState(true);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !quote.trim()) return;

    const saved = await addTestimonial({
      authorName: authorName.trim(),
      roleDescription: roleDescription.trim(),
      quote: quote.trim(),
      rating: Number(rating),
      visibleOnHomepage: visible,
    });
    if (saved === false) return;

    setModalOpen(false);
    setAuthorName('');
    setRoleDescription('');
    setQuote('');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Homepage Testimonials"
        subtitle="Manage verified student and parent recommendations displayed on the public VCS portal."
        primaryAction={{
          label: 'Add testimonial',
          onClick: () => setModalOpen(true),
          icon: Plus,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {testimonials.length === 0 && (
          <div className="md:col-span-2 p-10 rounded-2xl border border-dashed border-[#232D52] text-center text-xs text-slate-400">
            No testimonials yet. Add one and switch it to visible to show it on the home page.
          </div>
        )}
        {testimonials.map((item: Testimonial) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-[#232D52] bg-[#121831] shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-600 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <button
                  onClick={() => toggleTestimonialVisibility(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    item.visibleOnHomepage
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.visibleOnHomepage ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visible on Homepage</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative pl-6">
                <Quote className="w-4 h-4 text-indigo-400 absolute left-0 top-0.5 opacity-70" />
                <p className="text-xs text-slate-200 leading-relaxed italic">"{item.quote}"</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2648] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-100">{item.authorName}</h4>
                <p className="text-[11px] text-slate-400">{item.roleDescription}</p>
              </div>

              <button
                onClick={() => deleteTestimonial(item.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete testimonial"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#232D52] bg-[#121831] p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-slate-100">Add Public Testimonial</h3>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Role & City *</label>
                <input
                  type="text"
                  required
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="e.g. O Level Student, Dubai"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Testimonial Quote *</label>
                <textarea
                  required
                  rows={3}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Share the student or parent's learning experience..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="visibleCheck"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="rounded border-[#232D52] bg-[#0E1428] text-indigo-500 focus:ring-0"
                />
                <label htmlFor="visibleCheck" className="text-slate-300 cursor-pointer">
                  Display immediately on homepage public banner
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2648]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
