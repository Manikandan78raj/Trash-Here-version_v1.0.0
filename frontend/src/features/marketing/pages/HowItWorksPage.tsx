import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Schedule or Automate Pickups',
      desc: 'Citizens or commercial property managers schedule an on-demand pickup via our web PWA or set up automated smart sensors that trigger collection when bins reach 80% capacity.',
      icon: '📱',
    },
    {
      step: '02',
      title: 'Algorithmic Fleet Dispatch',
      desc: 'Our dispatch engine assigns the nearest verified collector using polyline routing algorithms, ensuring minimal wait times and zero deadhead transit mileage.',
      icon: '🚚',
    },
    {
      step: '03',
      title: 'Weighbridge IoT Verification',
      desc: 'Upon arrival at a certified recycler facility, our edge IoT telemetry box records exact gross and tare tonnage directly from industrial 50-ton scales.',
      icon: '⚖️',
    },
    {
      step: '04',
      title: 'SHA-256 Manifest & Green Points',
      desc: 'An immutable SHA-256 carbon offset manifest is minted instantly. The citizen or business receives cash-convertible Green Points while collectors get instant Stripe Connect payouts.',
      icon: '🌱',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/how-it-works"
        title="How It Works — 4-Step Smart Waste Lifecycle"
        description="See how Trash Here connects citizens, collectors, and recyclers through automated dispatching, weighbridge telemetry, and Green Points rewards."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>🔄 The Circular Lifecycle</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            How Trash Here Works
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            A seamless, transparent 4-step loop engineered to eliminate landfill waste and reward sustainable action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 backdrop-blur-md shadow-2xl relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-slate-700">{item.step}</span>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Experience the Loop Live</h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Schedule your first collection today and earn your initial 500 Green Points sign-up bonus.
          </p>
          <div className="pt-4">
            <Link
              to="/app/book"
              className="inline-block bg-[#D7FF43] text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-xl shadow-[#D7FF43]/20 text-base"
            >
              Book a Pickup Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
