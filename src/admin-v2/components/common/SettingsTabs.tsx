// Platform Settings holds three pages behind one menu link (founder, 2026-11-01): the settings themselves,
// course Levels and the public About Us page. Each page shows these tabs at the top; a tab appears only for staff
// whose role may open that page.
import React from 'react';
import { Sliders, Layers, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SETTINGS_PAGES = [
  { id: 'settings', label: 'Platform Settings', icon: Sliders },
  { id: 'levels', label: 'Levels', icon: Layers },
  { id: 'about', label: 'About Us page', icon: Globe },
] as const;

export const SettingsTabs: React.FC = () => {
  const { currentView, setCurrentView, canView } = useApp() as any;
  const tabs = SETTINGS_PAGES.filter((t) => !canView || canView(t.id));
  if (tabs.length < 2) return null;
  return (
    <nav aria-label="Platform settings sections" className="flex flex-wrap gap-2 border-b border-[#1E2648] pb-3">
      {tabs.map(({ id, label, icon: Icon }) => {
        const on = currentView === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setCurrentView(id)}
            aria-current={on ? 'page' : undefined}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              on ? 'bg-[#6D5BFF] text-white shadow-md shadow-indigo-600/25' : 'border border-[#232D52] text-slate-300 hover:border-[#6D5BFF] hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </nav>
  );
};
