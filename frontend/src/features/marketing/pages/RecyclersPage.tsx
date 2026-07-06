import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const RecyclersPage: React.FC = () => {
  const advantages = [
    {
      title: 'Automated Weighbridge Telemetry',
      desc: 'Our edge IoT box connects directly to standard 50-ton industrial truck scales (Mettler Toledo, Avery Weigh-Tronix, Rice Lake), logging gross and tare tonnage without operator manual entry.',
      icon: '⚖️',
    },
    {
      title: 'SHA-256 Cryptographic Audit Trails',
      desc: 'Every intake ticket is cryptographically signed and stored in our Postgres database. Generate Scope 3 ESG compliance manifests for enterprise clients with a single click.',
      icon: '🔒',
    },
    {
      title: 'Guaranteed Inbound Feedstock Quality',
      desc: 'Our AI waste classification models scan incoming loads before arrival, ensuring your facility receives clean, pre-sorted recyclable materials without hazardous contamination.',
      icon: '🔬',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/recyclers"
        title="For Certified Recyclers & MRFs — IoT Weighbridge Telemetry"
        description="Partner with Trash Here to automate weighbridge ticketing, mint SHA-256 ESG manifests, and secure high-quality municipal recycling feedstock."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>🏭 Industrial Recycling Infrastructure</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Automate Your Material Recovery Facility
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            We transform Material Recovery Facilities (MRFs) and scrap yards into digital climate infrastructure nodes with edge IoT scale hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {advantages.map((item, idx) => (
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Access the Recycler Portal</h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Manage incoming weighbridge queues, verify vehicle arrivals, and issue digital intake certificates.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/recycler"
              className="bg-[#D7FF43] text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-xl shadow-[#D7FF43]/20 text-base"
            >
              Open Recycler Workspace →
            </Link>
            <Link
              to="/contact"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base"
            >
              Request Hardware Integration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
