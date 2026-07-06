import React from 'react';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const AboutPage: React.FC = () => {
  const leadership = [
    { name: 'Dr. Elena Rostova', role: 'Chief Executive Officer & Co-Founder', bio: 'Former Staff Engineering Lead at Google Cloud and PhD in Environmental Systems Engineering.', avatar: '👩‍💻' },
    { name: 'Marcus Vance', role: 'Chief Technology Officer & Co-Founder', bio: 'Ex-Uber Fleet Systems Architect specializing in algorithmic polyline routing and distributed Rust engines.', avatar: '👨‍💻' },
    { name: 'Aria Montgomery', role: 'VP of Climate Policy & ESG', bio: 'Former EPA Carbon Accounting Advisor and lead author on urban circular waste logistics standards.', avatar: '👩‍🔬' },
    { name: 'Kenji Takahashi', role: 'Head of IoT & Hardware Engineering', bio: 'Pioneered industrial weighbridge telemetry and automated RFID container scanning at Tesla.', avatar: '👨‍🔧' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/about"
        title="About Us — Planetary Waste Logistics Infrastructure"
        description="Learn about Trash Here's mission to eliminate urban landfill footprints through AI polyline routing and SHA-256 carbon offset manifests."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>🌍 Our Planetary Mission</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Rewiring Urban Waste for a Circular Economy
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            We believe waste is just unindexed inventory. By pairing algorithmic fleet dispatching with immutable industrial weighbridges, we turn environmental liability into verifiable economic reward.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 backdrop-blur-md shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">🛰️</div>
            <h2 className="text-2xl font-bold text-white">The Problem We Solve</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Traditional waste collection relies on rigid, static schedules that burn diesel hauling empty dumpsters while letting overflowing bins contaminate urban streets. Worse, carbon accounting in recycling is plagued by opaque manual paper tickets and unverified claims.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 backdrop-blur-md shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">⚡</div>
            <h2 className="text-2xl font-bold text-white">Our Infrastructure Solution</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Trash Here deploys dynamic Euclidean ETA dispatching to route collectors only when waste is ready. At certified recycling facilities, our IoT weighbridge sensors automatically log exact tonnage, minting SHA-256 cryptographic manifests that reward citizens with Green Points.
            </p>
          </motion.div>
        </div>

        {/* Leadership Team */}
        <div className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Leadership Team</h2>
            <p className="text-sm text-slate-400">Backed by Tier-1 venture capital and led by veterans from Google, Uber, Tesla, and the EPA.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader) => (
              <div key={leader.name} className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 text-center space-y-3 hover:border-slate-700 transition-all">
                <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-3xl border border-slate-700 shadow-inner">
                  {leader.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{leader.name}</h3>
                  <p className="text-xs text-[#D7FF43] font-medium">{leader.role}</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60">
                  {leader.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
