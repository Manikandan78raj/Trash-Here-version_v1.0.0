import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Recycle, ArrowLeft, ShieldCheck, Sparkles, Leaf } from 'lucide-react';

export const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#D7FF43] selection:text-slate-950">
      {/* Dynamic Ambient Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#D7FF43]/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link
          to="/"
          className="flex items-center space-x-3 group transition-transform duration-200 hover:scale-105"
        >
          <div className="h-10 w-10 rounded-2xl bg-[#D7FF43] flex items-center justify-center text-slate-950 shadow-lg shadow-[#D7FF43]/20 transition-all duration-300 group-hover:rotate-6">
            <Recycle className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Trash Here <span className="text-xs px-2 py-0.5 rounded-full bg-[#D7FF43]/20 text-[#D7FF43] font-semibold">ENTERPRISE</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-[#D7FF43] transition-colors bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 px-4 py-2 rounded-2xl backdrop-blur-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10 w-full max-w-7xl mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero / Brand Feature Panel (Visible on LG screens) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D7FF43]/10 border border-[#D7FF43]/30 text-[#D7FF43] text-xs font-semibold uppercase tracking-wider w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Venture-Scale Waste Infrastructure</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Transforming Urban Logistics into <span className="text-[#D7FF43]">Net-Zero Rewards</span>.
            </h1>

            <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
              Connect households, commercial waste producers, and certified sorting facilities with automated weight verification, instant payouts, and verifiable carbon ESG credentials.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 max-w-lg">
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-[#D7FF43]/10 text-[#D7FF43]">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">500 Bonus Points</div>
                  <div className="text-xs text-slate-400 mt-0.5">Instant signup reward</div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Bank-Grade Security</div>
                  <div className="text-xs text-slate-400 mt-0.5">NIST & GDPR compliant</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Form Card Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 lg:col-span-6 flex justify-center w-full"
          >
            <div className="w-full max-w-md">
              {children || <Outlet />}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 z-10 flex flex-col sm:flex-row items-center justify-between border-t border-slate-900 gap-4">
        <div>
          &copy; {new Date().getFullYear()} Trash Here Enterprise Inc. All rights reserved.
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-slate-300 transition-colors">Support</Link>
        </div>
      </footer>
    </div>
  );
};
