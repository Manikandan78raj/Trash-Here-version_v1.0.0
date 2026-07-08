import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubscribeNewsletter } from '../api/marketing.api';

export const MarketingFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const subscribeMutation = useSubscribeNewsletter();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email, source: 'footer_signup' });
    setEmail('');
  };

  const footerSections = [
    {
      title: 'Solutions & Hubs',
      links: [
        { label: 'How It Works', path: '/how-it-works' },
        { label: 'For Collectors', path: '/collectors' },
        { label: 'For Recyclers', path: '/recyclers' },
        { label: 'Business Solutions', path: '/business' },
        { label: 'Eco Calculator', path: '/eco-calculator' },
      ],
    },
    {
      title: 'Platform & Tech',
      links: [
        { label: 'Features Showcase', path: '/features' },
        { label: 'Transparent Pricing', path: '/pricing' },
        { label: 'Partner Network', path: '/partners' },
        { label: 'Testimonials', path: '/testimonials' },
        { label: 'FAQ & Support', path: '/faq' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Careers & Jobs', path: '/careers' },
        { label: 'Investor Relations', path: '/investor-relations' },
        { label: 'Blog & Insights', path: '/blog' },
        { label: 'Contact Sales', path: '/contact' },
      ],
    },
    {
      title: 'Legal & Privacy',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms & Conditions', path: '/terms' },
        { label: 'Cookies Policy', path: '/cookies' },
        { label: 'System Status', path: '/status' },
        { label: 'Sitemap XML', path: '/sitemap.xml', external: true },
      ],
    },
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 pt-16 pb-12 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-800/80">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D7FF43] to-[#10b981] flex items-center justify-center shadow-md shadow-[#D7FF43]/20 font-black text-slate-950 text-lg">
                TH
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Trash Here</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Venture-scale climate infrastructure empowering households, collectors, and enterprise
              recyclers to digitize waste logistics and generate SHA-256 carbon offset manifests.
            </p>
            <div className="flex space-x-4 pt-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-medium">
                ⚡ 100/100 Lighthouse SSR
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-medium">
                🛡️ SOC 2 Ready
              </span>
            </div>
          </div>

          <div className="lg:col-span-3 bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-2">
              Subscribe to our Climate Tech Dispatch
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Get weekly updates on municipal recycling rates, algorithmic polyline routing
              advancements, and Green Points economic trends.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D7FF43] transition-all"
                aria-label="Email address for newsletter"
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="bg-[#D7FF43] text-slate-950 font-semibold px-6 py-3 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-md shadow-[#D7FF43]/20 text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
              >
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe →'}
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-slate-800/80">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-[#D7FF43] transition-colors focus:outline-none focus:underline"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-slate-400 hover:text-[#D7FF43] transition-colors focus:outline-none focus:underline"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Trash Here Technologies Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-slate-400">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-400">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-slate-400">
              Cookies Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
