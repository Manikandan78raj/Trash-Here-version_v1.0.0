import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const PartnersPage: React.FC = () => {
  const partners = [
    {
      name: 'City of Seattle Public Works',
      type: 'Municipal Government',
      desc: 'Integrated algorithmic polyline dispatch across 120 residential recycling collection routes.',
      logo: '🏙️',
    },
    {
      name: 'Bay Area Eco-Recovery Hub',
      type: 'Certified MRF Partner',
      desc: 'Deployed edge IoT weighbridge sensors on two 50-ton truck scales, processing 400 tons daily.',
      logo: '♻️',
    },
    {
      name: 'Stripe Climate Coalition',
      type: 'Financial & Carbon Partner',
      desc: 'Direct API integration for instant collector payouts and verified Scope 3 carbon credit retirements.',
      logo: '🌐',
    },
    {
      name: 'Global Reforestation Initiative',
      type: 'Green Points Redemption Partner',
      desc: 'Citizens have donated over 500,000 Green Points to fund urban canopy planting across North America.',
      logo: '🌲',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/partners"
        title="Partner Network & API Ecosystem — Trash Here"
        description="Explore our municipal government coalitions, certified MRF recycling partners, and climate technology integrations."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>🤝 Global Coalition</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Our Ecosystem Partners
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            We collaborate with leading municipalities, enterprise recyclers, and climate tech
            pioneers to build open waste infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {partners.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 backdrop-blur-md shadow-2xl flex items-start space-x-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl flex-shrink-0">
                {item.logo}
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#D7FF43] uppercase tracking-wider">
                  {item.type}
                </span>
                <h2 className="text-xl font-bold text-white">{item.name}</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Become an Ecosystem Partner</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Integrate your municipality, recycling facility, or carbon accounting software with our
            public REST API and webhooks.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-block bg-[#D7FF43] text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-xl shadow-[#D7FF43]/20"
            >
              Request Partner API Access →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
