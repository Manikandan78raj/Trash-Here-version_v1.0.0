import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const BusinessSolutionsPage: React.FC = () => {
  const solutions = [
    {
      title: 'Commercial Properties & Retail Hubs',
      desc: 'Automate waste pickup schedules across multi-tenant retail centers and office towers. Our smart IoT bin sensors trigger collection only when dumpsters reach 80% capacity, cutting monthly waste utility bills by 25%.',
      icon: '🏢',
      metric: '25% Utility Bill Reduction',
    },
    {
      title: 'Hospitality & Restaurant Chains',
      desc: 'Tackle organic food waste and grease trap logistics with specialized composting fleets. Receive daily Scope 3 carbon diversion manifests to showcase sustainability to environmentally conscious dining guests.',
      icon: '🍽️',
      metric: '100% Organics Traceability',
    },
    {
      title: 'Municipal Governments & Smart Cities',
      desc: 'Deploy city-wide algorithmic polyline routing for municipal garbage trucks. Gain real-time GIS heatmaps of neighborhood recycling rates and illegal dumping alerts.',
      icon: '🏛️',
      metric: 'City-Wide GIS Heatmaps',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/business"
        title="Enterprise B2B & Municipal Waste Solutions — Trash Here"
        description="Transform commercial property waste management, restaurant organics, and municipal garbage fleets with AI routing and IoT weighbridges."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>💼 Enterprise & B2B Solutions</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Decarbonize Commercial Waste Operations
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Purpose-built infrastructure for property managers, retail chains, and municipal
            sustainability directors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6 backdrop-blur-md shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                  {item.metric}
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">{item.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-6 border-t border-slate-800/80">
                <Link
                  to="/contact"
                  className="text-sm font-bold text-[#D7FF43] hover:underline flex items-center"
                >
                  Request Solution Brief →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Need a Custom Municipal Pilot?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Our engineering team deploys dedicated edge IoT telemetry hardware and custom webhook
            integrations within 14 days.
          </p>
          <div className="pt-4">
            <Link
              to="/contact"
              className="inline-block bg-[#D7FF43] text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-xl shadow-[#D7FF43]/20 text-base"
            >
              Contact Enterprise Sales →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
