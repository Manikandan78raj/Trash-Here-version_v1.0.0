import React from 'react';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const FeaturesPage: React.FC = () => {
  const featureBlocks = [
    {
      title: 'Algorithmic Polyline Fleet Dispatching',
      subtitle: 'Real-Time Euclidean ETA Scoring & Geofenced Routing',
      desc: 'Our dispatch engine continuously recalculates collector trajectories using custom polyline algorithms. By clustering active pickups within dynamic geofences, we minimize deadhead mileage and reduce municipal collection fuel emissions by up to 38%.',
      icon: '🛰️',
      metrics: ['38% Less Fuel Burned', 'Sub-4 Min ETA Accuracy', 'Zero Deadhead Mileage'],
    },
    {
      title: 'Industrial Weighbridge IoT Telemetry',
      subtitle: 'Direct 50-Ton Scale Integration & RFID Container Tracking',
      desc: 'When a collector vehicle drives onto a certified recycler weighbridge, our edge IoT telemetry box captures gross and tare weights in real time. No manual data entry, zero human error, and instant transmission to our cloud Postgres cluster.',
      icon: '⚖️',
      metrics: ['50-Ton Scale Precision', '< 200ms Telemetry Sync', 'Tamper-Proof Hardware'],
    },
    {
      title: 'SHA-256 Cryptographic ESG Manifests',
      subtitle: 'Immutable Carbon Offset Proofs for Corporate Compliance',
      desc: 'Every completed recycling dropoff generates a cryptographically signed SHA-256 manifest detailing exact material breakdown, GPS timestamps, and avoided landfill greenhouse gas emissions. Perfect for Scope 3 ESG auditing and municipal compliance.',
      icon: '🔒',
      metrics: ['SHA-256 Cryptographic Hash', 'Scope 3 Audit Ready', 'Instant PDF Generation'],
    },
    {
      title: 'Stripe & Connect Financial Ledger',
      subtitle: 'Automated Double-Entry Reconciled Wallet & Rewards',
      desc: 'Our financial engine reconciles thousands of daily transactions across citizen Green Points wallets, municipal recycling invoices, and instant Stripe Connect payouts for fleet collectors without a single penny of discrepancy.',
      icon: '💳',
      metrics: ['Double-Entry Ledger', 'Instant Connect Payouts', 'Automated Reconciliation'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/features"
        title="Platform Features & Technical Architecture — Trash Here"
        description="Explore our AI polyline dispatch engine, 50-ton weighbridge IoT telemetry, SHA-256 carbon manifests, and Stripe Connect financial reconciliation."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>⚙️ Deep Tech Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Engineered for Industrial Reliability
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            From edge IoT sensors on 50-ton weighbridges to real-time WebSocket fleet tracking, discover the technology powering our venture-scale platform.
          </p>
        </div>

        <div className="space-y-12">
          {featureBlocks.map((block, idx) => (
            <motion.div
              key={block.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 backdrop-blur-md shadow-2xl flex flex-col ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              } items-center gap-12`}
            >
              <div className="flex-1 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                  {block.icon}
                </div>
                <p className="text-xs font-bold text-[#D7FF43] tracking-wider uppercase">{block.subtitle}</p>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{block.title}</h2>
                <p className="text-base text-slate-300 leading-relaxed">{block.desc}</p>
                <div className="pt-4 flex flex-wrap gap-3">
                  {block.metrics.map((m) => (
                    <span key={m} className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200">
                      ⚡ {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full bg-slate-950/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-4 font-mono text-xs text-slate-400 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-500">
                  <span>TELEMETRY_STREAM // {block.title.toUpperCase().slice(0, 15)}</span>
                  <span className="text-emerald-400">● LIVE</span>
                </div>
                <pre className="overflow-x-auto text-slate-300 leading-relaxed">
                  {`{
  "timestamp": "${new Date().toISOString()}",
  "system": "TrashHere_OS_v1.0",
  "status": "VERIFIED_OK",
  "integrity_hash": "e3b0c44298fc1c149afbf4c8996fb924..."
}`}
                </pre>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
