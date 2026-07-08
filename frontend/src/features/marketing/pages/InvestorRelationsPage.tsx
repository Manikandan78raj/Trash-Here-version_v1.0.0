import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const InvestorRelationsPage: React.FC = () => {
  const metrics = [
    { label: 'Annualized Gross Merchandise Value (GMV)', value: '$18.4M', growth: '+240% YoY' },
    { label: 'Net Revenue Retention (NRR)', value: '138%', growth: 'Enterprise Cohorts' },
    { label: 'Active Municipal & B2B Contracts', value: '42', growth: '+18 in Q2' },
    { label: 'Weighbridge IoT Telemetry Nodes', value: '180+', growth: 'Across North America' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/investor-relations"
        title="Investor Relations & Venture Performance — Trash Here"
        description="Access financial growth metrics, ESG impact reports, and venture capital governance updates for Trash Here Technologies Inc."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>📈 Series A Growth Metrics</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Venture-Scale Climate Economics
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            We are building the high-margin, software-defined operating system for the $1.5 trillion
            global waste and recycling industry.
          </p>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2 backdrop-blur-md shadow-xl"
            >
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {item.value}
              </p>
              <p className="text-xs font-bold text-[#D7FF43] uppercase tracking-wider">
                {item.growth}
              </p>
              <p className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-800/80">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Investment Deck Request Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Request Investor Memorandum & Deck
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Accredited venture investors and strategic family offices can request our confidential
            Series A data room and audited financials.
          </p>
          <div className="pt-4">
            <Link
              to="/contact"
              className="inline-block bg-[#D7FF43] text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-xl shadow-[#D7FF43]/20 text-base"
            >
              Request Data Room Access →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
