import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const MarketingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Features', path: '/features' },
    { label: 'Eco Calculator', path: '/eco-calculator' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Solutions', path: '/business' },
    { label: 'Blog', path: '/blog' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between"
        role="navigation"
        aria-label="Primary Navigation"
      >
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF43] rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D7FF43] to-[#10b981] flex items-center justify-center shadow-lg shadow-[#D7FF43]/20 font-black text-slate-950 text-xl tracking-tighter">
            TH
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center">
            Trash Here
            <span className="inline-block w-2 h-2 rounded-full bg-[#D7FF43] ml-1 animate-pulse" />
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF43] ${
                isActive(link.path)
                  ? 'bg-slate-800/80 text-[#D7FF43] shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right CTA Button */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/contact"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF43] rounded-lg px-2 py-1"
          >
            Contact Sales
          </Link>
          <Link
            to="/app"
            className="bg-[#D7FF43] text-slate-950 font-semibold px-5 py-2.5 rounded-full hover:bg-[#c2eb31] transition-all shadow-lg shadow-[#D7FF43]/20 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Open Portal →
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800/80 bg-slate-950 px-4 pt-4 pb-6 space-y-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-slate-800 text-[#D7FF43]'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl bg-slate-900 text-slate-200 font-medium hover:bg-slate-800"
              >
                Contact Sales
              </Link>
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl bg-[#D7FF43] text-slate-950 font-bold shadow-lg shadow-[#D7FF43]/20"
              >
                Open Portal →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
