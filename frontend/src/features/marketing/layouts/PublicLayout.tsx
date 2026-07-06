import React from 'react';
import { Outlet } from 'react-router-dom';
import { MarketingNavbar } from '../components/MarketingNavbar';
import { MarketingFooter } from '../components/MarketingFooter';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 font-sans selection:bg-[#D7FF43] selection:text-slate-950">
      {/* Skip to Content Accessibility Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-[#D7FF43] text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg"
      >
        Skip to main content
      </a>

      {/* Header Navigation */}
      <MarketingNavbar />

      {/* Main Content Workspace */}
      <main id="main-content" role="main" className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* Global Footer */}
      <MarketingFooter />
    </div>
  );
};
