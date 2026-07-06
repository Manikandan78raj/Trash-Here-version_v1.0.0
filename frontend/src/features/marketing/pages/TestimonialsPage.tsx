import React from 'react';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';

export const TestimonialsPage: React.FC = () => {
  const testimonials = [
    {
      quote: "Trash Here transformed our municipal recycling collection. By switching from static weekly schedules to AI polyline routing, we reduced fuel emissions by 34% in just three months.",
      author: "David K., Director of Solid Waste",
      company: "City of Portland Metro Area",
      rating: 5,
      avatar: "👨‍💼",
    },
    {
      quote: "As an independent fleet operator, the instant Stripe Connect payouts are a game changer. I get paid the minute my weighbridge ticket clears. No more waiting 60 days on paper invoices.",
      author: "Carlos M., Fleet Owner & Driver",
      company: "Bay Area Logistics LLC",
      rating: 5,
      avatar: "👨‍✈️",
    },
    {
      quote: "Our corporate Scope 3 auditors were blown away by the SHA-256 cryptographic manifests. We can trace every pound of organics from our 15 restaurant locations directly to composting hubs.",
      author: "Sarah T., VP of Sustainability",
      company: "Pacific Dining Group",
      rating: 5,
      avatar: "👩‍💼",
    },
    {
      quote: "My family loves the Green Points rewards! We've already cashed out $120 in Stripe rewards just by sorting our household recyclables and booking on-demand pickups.",
      author: "Jessica R., Pro Citizen Subscriber",
      company: "Seattle Household",
      rating: 5,
      avatar: "👩‍🌾",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/testimonials"
        title="Customer Stories & Citizen Reviews (4.9★) — Trash Here"
        description="See why municipalities, enterprise recyclers, fleet operators, and households rate Trash Here 4.9 out of 5 stars."
      />

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>⭐ 4.9 / 5.0 Average Rating</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Trusted Across the Supply Chain
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Read real feedback from municipal directors, independent collectors, and everyday citizens using our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6 backdrop-blur-md shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex text-[#D7FF43] text-lg">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-base sm:text-lg text-slate-200 italic leading-relaxed">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-6 border-t border-slate-800/80">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                  {item.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{item.author}</h3>
                  <p className="text-xs text-[#D7FF43] font-medium">{item.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
