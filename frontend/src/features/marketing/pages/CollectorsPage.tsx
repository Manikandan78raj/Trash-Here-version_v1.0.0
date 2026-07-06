import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const CollectorsPage: React.FC = () => {
  const benefits = [
    {
      title: 'Algorithmic Route Optimization',
      desc: 'No more driving in circles searching for scrap or waste. Our Uber-style dispatch engine assigns clustered pickups directly along your trajectory with Euclidean ETA scoring.',
      icon: '🗺️',
    },
    {
      title: 'Instant Stripe Connect Payouts',
      desc: 'Get paid the second your load is verified at the weighbridge. Our automated double-entry ledger transfers earnings directly to your debit card or bank account.',
      icon: '💳',
    },
    {
      title: 'Zero Brokerage or Franchise Fees',
      desc: 'Unlike traditional waste hauling brokers who take a 40% cut, Trash Here charges zero commission on independent collector earnings.',
      icon: '⚡',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/collectors"
        title="For Fleet Collectors & Drivers — Instant Payouts & AI Dispatch"
        description="Join Trash Here as an independent waste logistics collector. Enjoy AI polyline route clustering, zero broker fees, and instant Stripe Connect payouts."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>🚚 Fleet Operations Network</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Drive, Collect, and Earn Instantly
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Whether you operate a single pickup truck or a commercial fleet of 50 residential compactors, Trash Here maximizes your hourly yield.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 backdrop-blur-md shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
                {item.icon}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{item.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Join the Fleet?</h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Access the Collector Workspace to upload vehicle credentials and start receiving dispatch orders today.
          </p>
          <div className="pt-4">
            <Link
              to="/collector"
              className="inline-block bg-[#D7FF43] text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-xl shadow-[#D7FF43]/20 text-base"
            >
              Open Collector Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
