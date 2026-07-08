import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const Custom404Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <SeoHead
        route="/404"
        title="404 — Page Not Found // Trash Here"
        description="The requested page or municipal route could not be found."
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-10 text-center space-y-6 backdrop-blur-md shadow-2xl"
      >
        <div className="w-20 h-20 rounded-3xl bg-slate-800 mx-auto flex items-center justify-center text-4xl border border-slate-700 shadow-inner">
          🛰️
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#D7FF43] uppercase tracking-wider">
            Error 404 // Route Not Found
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Off the Grid</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            We couldn't find the page or municipal collection route you're looking for. It may have
            been moved or archived.
          </p>
        </div>

        <div className="pt-4 flex flex-col space-y-3">
          <Link
            to="/"
            className="w-full bg-[#D7FF43] text-slate-950 font-bold py-3.5 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-lg shadow-[#D7FF43]/20 text-sm block"
          >
            ← Return to Homepage
          </Link>
          <Link
            to="/eco-calculator"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-2xl transition-all text-sm block"
          >
            Try Eco Calculator
          </Link>
          <Link to="/contact" className="text-xs text-slate-500 hover:text-slate-300 pt-2 block">
            Report Broken Link →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
