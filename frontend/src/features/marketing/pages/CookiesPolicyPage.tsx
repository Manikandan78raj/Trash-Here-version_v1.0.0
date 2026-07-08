import React, { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { toast } from '@/common/notifications/toast';

export const CookiesPolicyPage: React.FC = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_analytics', String(analyticsEnabled));
    localStorage.setItem('cookie_marketing', String(marketingEnabled));
    toast.success('Cookie preferences updated successfully.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/cookies"
        title="Cookies Policy & Preference Center — Trash Here"
        description="Manage your cookie settings, analytics telemetry tracking, and privacy preferences on Trash Here."
      />

      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Cookies Policy & Preferences
          </h1>
          <p className="text-sm text-slate-400">
            Control how we use cookies and local storage on your device.
          </p>
        </div>

        {/* Preference Center Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white">Your Cookie Preferences</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-slate-800/80">
              <div>
                <h3 className="font-bold text-white">Strictly Necessary Cookies</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Required for authentication, security tokens, and JWT session persistence. Cannot
                  be disabled.
                </p>
              </div>
              <span className="text-xs font-bold text-[#D7FF43] bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                Always Active
              </span>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-slate-800/80">
              <div>
                <h3 className="font-bold text-white">Analytics & Performance Telemetry</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Allows us to measure Eco Calculator usage and page load speeds to optimize Core
                  Web Vitals.
                </p>
              </div>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="w-6 h-6 rounded bg-slate-950 border-slate-700 text-[#D7FF43] focus:ring-[#D7FF43] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-bold text-white">Marketing & Attribution Cookies</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Used to track newsletter signups and measure campaign effectiveness across partner
                  networks.
                </p>
              </div>
              <input
                type="checkbox"
                checked={marketingEnabled}
                onChange={(e) => setMarketingEnabled(e.target.checked)}
                className="w-6 h-6 rounded bg-slate-950 border-slate-700 text-[#D7FF43] focus:ring-[#D7FF43] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="bg-[#D7FF43] text-slate-950 font-bold px-8 py-3.5 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-lg shadow-[#D7FF43]/20 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            >
              Save Cookie Preferences
            </button>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 leading-relaxed">
          <h2 className="text-2xl font-bold text-white">What are cookies?</h2>
          <p>
            Cookies are small text files stored in your web browser that enable our platform to
            recognize your session, remember your Eco Calculator volume settings, and ensure secure
            JWT communication with our API gateways.
          </p>
        </div>
      </div>
    </div>
  );
};
