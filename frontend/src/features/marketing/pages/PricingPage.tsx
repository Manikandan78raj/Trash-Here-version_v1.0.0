import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const PricingPage: React.FC = () => {
  const [annualBilling, setAnnualBilling] = useState(false);

  const plans = [
    {
      name: 'Basic Citizen',
      price: '$0',
      period: 'Forever Free',
      desc: 'Perfect for eco-conscious households looking to recycle responsibly and earn rewards.',
      features: [
        'On-demand residential scheduling',
        'Standard Green Points earning rate (1x)',
        'Basic environmental impact dashboard',
        'Community forum access',
      ],
      cta: 'Start Free',
      link: '/app',
      popular: false,
    },
    {
      name: 'Pro Citizen',
      price: annualBilling ? '$7.99' : '$9.99',
      period: 'per month',
      desc: 'Supercharged rewards and priority dispatch for dedicated urban recyclers and families.',
      features: [
        'Everything in Basic Citizen',
        '2x Green Points earning multiplier',
        'Priority algorithmic dispatching (Sub-15 min)',
        'Verified SHA-256 Scope 3 individual certificates',
        'Zero pickup service fees',
      ],
      cta: 'Upgrade to Pro',
      link: '/app/subscriptions',
      popular: true,
    },
    {
      name: 'Enterprise Recycler',
      price: 'Custom',
      period: 'B2B & Municipal',
      desc: 'Industrial weighbridge IoT integration, API telemetry access, and municipal Scope 3 compliance.',
      features: [
        'Direct 50-ton weighbridge IoT edge hardware',
        'Automated double-entry Stripe Connect ledger',
        'Dedicated API telemetry and webhook access',
        'Custom municipal ESG compliance reporting',
        '24/7 dedicated engineering support SLA',
      ],
      cta: 'Contact Enterprise Sales',
      link: '/contact',
      popular: false,
    },
  ];

  const faqs = [
    {
      q: 'How do Green Points convert to cash or rewards?',
      a: 'Green Points accumulate in your digital wallet at an average exchange rate of 100 points = $1.00 USD. You can redeem points directly to your Stripe bank account, convert them to municipal transit passes, or donate them to global reforestation projects.',
    },
    {
      q: 'Is there any hardware installation required for households?',
      a: 'No! Households simply use our web app or mobile PWA to scan standard recycling bags or schedule curbside pickups. Our IoT weighbridge hardware is installed exclusively at commercial recycling facilities and sorting hubs.',
    },
    {
      q: 'How does the SHA-256 carbon manifest work?',
      a: 'When your waste is weighed at a certified recycler, our database computes the avoided methane and carbon emissions using EPA WARM coefficients. We generate a cryptographic SHA-256 hash of this data, making your environmental offset immutable and audit-proof.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/pricing"
        title="Transparent Pricing & Subscription Plans — Trash Here"
        description="Explore free household recycling plans, Pro Citizen multipliers, and Custom Enterprise Recycler weighbridge contracts."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>💳 Predictable Economics</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Plans for Every Scale of Impact
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            From free household curbside recycling to industrial 50-ton weighbridge telemetry contracts.
          </p>

          {/* Billing Toggle */}
          <div className="pt-4 flex items-center justify-center space-x-4">
            <span className={`text-sm font-semibold ${!annualBilling ? 'text-white' : 'text-slate-400'}`}>Monthly Billing</span>
            <button
              type="button"
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-14 h-8 rounded-full bg-slate-800 border border-slate-700 p-1 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
              aria-label="Toggle annual billing discount"
            >
              <div className={`w-6 h-6 rounded-full bg-[#D7FF43] transition-transform ${annualBilling ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-semibold flex items-center ${annualBilling ? 'text-white' : 'text-slate-400'}`}>
              Annual Billing <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-xs">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`rounded-3xl p-8 flex flex-col justify-between backdrop-blur-md shadow-2xl transition-all relative ${
                plan.popular
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-[#D7FF43] scale-105 z-10'
                  : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#D7FF43] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-400 font-medium">{plan.period}</span>
                </div>

                <ul className="space-y-3 pt-6 border-t border-slate-800/80">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start space-x-3 text-sm text-slate-300">
                      <span className="text-[#D7FF43] font-bold mt-0.5">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-800/60">
                <Link
                  to={plan.link}
                  className={`w-full py-4 rounded-2xl font-bold text-sm text-center block transition-all shadow-lg ${
                    plan.popular
                      ? 'bg-[#D7FF43] text-slate-950 hover:bg-[#c2eb31] shadow-[#D7FF43]/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {plan.cta} →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing FAQ Section */}
        <div className="space-y-8 pt-12 border-t border-slate-800/80 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-2">
                <h3 className="font-bold text-white text-base">{faq.q}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
