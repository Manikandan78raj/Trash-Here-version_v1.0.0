import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What makes Trash Here different from traditional waste hauling companies?',
      a: 'Traditional waste haulers rely on fixed weekly schedules and paper tickets. Trash Here is an AI-powered logistics platform that routes fleet collectors dynamically using Euclidean ETA scoring and connects directly to 50-ton weighbridge IoT sensors to generate immutable SHA-256 carbon manifests.',
    },
    {
      q: 'How do I earn and redeem Green Points?',
      a: 'When you schedule a residential pickup or drop off recyclables at a certified hub, our weighbridge logs the net weight. You earn 10 Green Points per pound of diverted waste. Points can be redeemed for direct cash deposits via Stripe, transit vouchers, or carbon offset donations.',
    },
    {
      q: 'How do independent collectors get paid?',
      a: 'We partner with Stripe Connect to power instant, automated payouts. The moment a weighbridge operator verifies an inbound load, our double-entry ledger transfers the collector earnings directly to their linked debit card or bank account.',
    },
    {
      q: 'What is the SHA-256 carbon manifest and how does it help with ESG compliance?',
      a: 'Our database computes greenhouse gas avoidance using EPA WARM coefficients for every verified recycling dropoff. We generate a SHA-256 cryptographic hash of the transaction metadata, providing corporations and municipalities with an tamper-proof audit trail for Scope 3 ESG reporting.',
    },
    {
      q: 'How can our municipality or commercial property run a pilot program?',
      a: 'Our enterprise solutions team can deploy edge IoT hardware on your existing truck scales and set up custom webhook integrations within 14 business days. Visit our Contact page or email enterprise@trashhere.com to request a pilot brief.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/faq"
        title="Frequently Asked Questions (FAQ) — Trash Here Platform"
        description="Find answers about algorithmic waste routing, Green Points cash redemption, SHA-256 ESG manifests, and Stripe Connect collector payouts."
        jsonLdSchema={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        }}
      />

      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>❓ Knowledge Base</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Everything you need to know about our climate infrastructure, rewards wallet, and fleet
            dispatching.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-md transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 sm:p-8 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-[#D7FF43] rounded-3xl"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {faq.q}
                  </span>
                  <span
                    className={`text-2xl text-[#D7FF43] transition-transform ${isOpen ? 'rotate-45' : ''}`}
                  >
                    +
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6 sm:px-8 sm:pb-8 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
