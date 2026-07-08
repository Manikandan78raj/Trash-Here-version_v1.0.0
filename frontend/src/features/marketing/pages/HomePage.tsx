import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const HomePage: React.FC = () => {
  const stats = [
    { label: 'Metric Tons Diverted', value: '52,840+' },
    { label: 'Green Points Issued', value: '$1.42M' },
    { label: 'Active Collectors', value: '4,890+' },
    { label: 'SHA-256 Manifests', value: '100%' },
  ];

  const features = [
    {
      title: 'Algorithmic Polyline Dispatch',
      desc: 'Real-time Euclidean ETA scoring and geofenced pickup consolidation reducing municipal collection CO2 by 38%.',
      icon: '🛰️',
      link: '/features',
    },
    {
      title: 'Weighbridge IoT Telemetry',
      desc: 'Direct 50-ton scale integration generating immutable SHA-256 ESG manifests for B2B recyclers and corporate auditors.',
      icon: '⚖️',
      link: '/recyclers',
    },
    {
      title: 'Stripe & Connect Payouts',
      desc: 'Automated double-entry ledger reconciliation balancing citizen Green Points rewards and instant collector earnings.',
      icon: '💳',
      link: '/collectors',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <SeoHead
        route="/"
        title="Trash Here — Venture-Scale Smart Waste Logistics & Climate Infrastructure"
        description="AI-powered weighbridge telemetry, algorithmic polyline fleet routing, and SHA-256 ESG manifests for households, collectors, and enterprise recyclers."
        jsonLdSchema={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Trash Here',
          url: 'https://trashhere.com',
          logo: 'https://trashhere.com/assets/logo.png',
          description: 'Venture-scale smart waste logistics platform.',
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-48 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Decorative Glowing Gradients */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#D7FF43]/20 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-[#D7FF43] tracking-wide uppercase shadow-inner">
            <span>🌱 Certified Venture-Scale Climate Infrastructure</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Smart Waste Logistics. <br />
            <span className="bg-gradient-to-r from-[#D7FF43] via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Zero Landfill Footprint.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            We digitize urban waste logistics with AI polyline fleet routing, 50-ton weighbridge IoT
            telemetry, and SHA-256 carbon offset manifests for households, collectors, and
            enterprise recyclers.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="w-full sm:w-auto bg-[#D7FF43] text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-xl shadow-[#D7FF43]/20 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Open App Portal →
            </Link>
            <Link
              to="/eco-calculator"
              className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF43]"
            >
              Calculate Your Offset
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live Stats Banner */}
      <section className="border-y border-slate-800/80 bg-slate-900/40 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Enterprise Scale
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Our platform merges fintech precision with industrial recycling telemetry to eliminate
            inefficiencies across the waste supply chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-8 flex flex-col justify-between backdrop-blur-md shadow-2xl transition-all group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/60">
                <Link
                  to={item.link}
                  className="text-sm font-semibold text-[#D7FF43] hover:text-white flex items-center transition-colors"
                >
                  Learn more{' '}
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-[36px] p-10 sm:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D7FF43]/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to digitize your waste logistics operations?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
            Join thousands of households, fleet operators, and certified recyclers building a
            circular economy.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/contact"
              className="bg-[#D7FF43] text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-lg shadow-[#D7FF43]/20 text-base"
            >
              Request Enterprise Demo
            </Link>
            <Link
              to="/how-it-works"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
