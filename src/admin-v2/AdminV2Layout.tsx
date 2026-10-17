import React, { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { CommandPalette } from './components/common/CommandPalette';
import { DetailDrawer } from './components/common/DetailDrawer';
import { QuickAddModal } from './components/common/QuickAddModal';
import { ToastContainer } from './components/common/ToastContainer';
import './admin-v2.css';

const FONTS_ID = 'vcs-admin-fonts';
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';

// Admin area shell, identical to the AI Studio prototype's App: sidebar,
// top bar, routed page, and the global palette / drawer / quick add / toasts.
const AdminV2Layout: React.FC = () => {
  // Only the page area scrolls, so the sidebar and top bar stay put. (The site's
  // global overflow-x rule on html/body stops position: sticky from working.)
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  useEffect(() => { mainRef.current?.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    if (document.getElementById(FONTS_ID)) return;
    const link = document.createElement('link');
    link.id = FONTS_ID;
    link.rel = 'stylesheet';
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  return (
    <AppProvider>
      <div className="vcs-admin-v2 h-screen overflow-hidden flex bg-[#0B1020] text-slate-100 antialiased selection:bg-[#6D5BFF] selection:text-white">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col bg-[#0B1020] text-slate-100 h-screen">
          <TopBar />
          <main ref={mainRef} className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <Suspense fallback={<div className="h-40 rounded-2xl bg-[#121831] animate-pulse max-w-[1400px] mx-auto" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
        <CommandPalette />
        <DetailDrawer />
        <QuickAddModal />
        <ToastContainer />
      </div>
    </AppProvider>
  );
};

export default AdminV2Layout;
