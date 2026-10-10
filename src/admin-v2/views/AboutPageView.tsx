import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { Globe, Save, Eye, Check, ExternalLink, X } from 'lucide-react';

export const AboutPageView: React.FC = () => {
  const { aboutPage, updateAboutPage, addToast } = useApp();
  const [formData, setFormData] = useState(aboutPage);
  const [previewOpen, setPreviewOpen] = useState(false);
  // Fill the form once the saved content arrives from the server.
  useEffect(() => setFormData(aboutPage), [aboutPage]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutPage(formData);
  };

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto animate-in fade-in duration-150 pb-20">
      <PageHeader
        title="About Page Content CMS"
        subtitle="Manage the public school identity, vision statement, international mission, and contact information."
        primaryAction={{
          label: 'Preview page',
          onClick: () => setPreviewOpen(true),
          icon: Eye,
        }}
      />

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Vision & Mission */}
        <div className="p-5 rounded-2xl border border-[#232D52] bg-[#121831] space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 border-b border-[#1E2648] pb-2.5">
            Institutional Vision & Mission
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Educational Vision</label>
            <textarea
              rows={3}
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              className="w-full p-3 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">School Mission</label>
            <textarea
              rows={3}
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="w-full p-3 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: About Story */}
        <div className="p-5 rounded-2xl border border-[#232D52] bg-[#121831] space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 border-b border-[#1E2648] pb-2.5">
            About Virtual City School (Detailed Narrative)
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Full Story & Accreditation</label>
            <textarea
              rows={4}
              value={formData.aboutText}
              onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
              className="w-full p-3 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 3: Contact & Regional Addresses */}
        <div className="p-5 rounded-2xl border border-[#232D52] bg-[#121831] space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 border-b border-[#1E2648] pb-2.5">
            Official Contact & Regional Desks
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Official Inquiries Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Phone Line</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Admissions WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Social Channels */}
        <div className="p-5 rounded-2xl border border-[#232D52] bg-[#121831] space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 border-b border-[#1E2648] pb-2.5">
            Public Channels & Social Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Facebook</label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Instagram</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">X / Twitter</label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">LinkedIn</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">YouTube Channel</label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#232D52] bg-[#0E1428] text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="fixed bottom-0 inset-x-0 z-20 bg-[#0E1428]/95 backdrop-blur-md border-t border-[#1E2648] py-3.5 px-6">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between">
            <span className="text-xs text-slate-400">All modifications immediately update live landing page</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white border border-[#232D52] hover:bg-slate-800 transition-colors"
              >
                Preview Public Page
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-[#6D5BFF] hover:bg-[#5B47FB] text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Public Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-[#232D52] bg-[#0B1020] shadow-2xl overflow-y-auto text-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2648] pb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Public Page Live Preview</h3>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center py-6 border-b border-[#1E2648]">
                <h2 className="text-2xl font-bold tracking-tight text-white">Virtual City School</h2>
                <p className="text-sm text-indigo-400 mt-1 font-medium">
                  Live Cambridge Online School (Gulf & Pakistan)
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Vision</h4>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">{formData.vision}</p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Mission</h4>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">{formData.mission}</p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">About Us</h4>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">{formData.aboutText}</p>
              </div>

              <div className="pt-4 border-t border-[#1E2648] grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Regional Office</span>
                  <span className="text-slate-300 font-medium">{formData.address}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Desk</span>
                  <span className="text-slate-300 font-medium">{formData.email} · {formData.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E2648] text-right">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
