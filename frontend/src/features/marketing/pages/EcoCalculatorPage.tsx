import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';
import { useTrackAnalyticsEvent } from '../api/marketing.api';

export const EcoCalculatorPage: React.FC = () => {
  const [bagsPerWeek, setBagsPerWeek] = useState<number>(12);
  const [recyclePercentage, setRecyclePercentage] = useState<number>(65);
  const trackMutation = useTrackAnalyticsEvent();

  // Mathematical computations
  const totalLbsPerWeek = bagsPerWeek * 18; // ~18 lbs per bag
  const divertedLbsPerWeek = totalLbsPerWeek * (recyclePercentage / 100);
  const divertedLbsPerYear = Math.round(divertedLbsPerWeek * 52);
  const metricTonsYear = (divertedLbsPerYear / 2204.62).toFixed(2);
  const co2SavedKg = Math.round(divertedLbsPerYear * 1.85);
  const treesPlanted = Math.round(co2SavedKg / 21.77);
  const greenPointsYear = Math.round(divertedLbsPerYear * 12);
  const cashValueUsd = (greenPointsYear / 100).toFixed(2);

  useEffect(() => {
    // Debounced telemetry logging
    const timer = setTimeout(() => {
      trackMutation.mutate({
        eventName: 'ECO_CALCULATOR_COMPUTE',
        route: '/eco-calculator',
        metadata: JSON.stringify({ bagsPerWeek, recyclePercentage, co2SavedKg, greenPointsYear }),
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [bagsPerWeek, recyclePercentage]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/eco-calculator"
        title="Eco Impact & Carbon Offset Calculator — Trash Here"
        description="Calculate your household or enterprise carbon offset, landfill diversion pounds, equivalent trees planted, and Green Points reward earnings in real time."
        jsonLdSchema={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Trash Here Eco Impact Calculator',
          url: 'https://trashhere.com/eco-calculator',
          description: 'Real-time carbon offset and waste diversion calculator.',
          applicationCategory: 'Utility',
        }}
      />

      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>⚡ Interactive Telemetry Engine</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Eco Impact Calculator
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            See exactly how much landfill waste your household or enterprise will divert, the carbon
            emissions you eliminate, and your Green Points cash reward potential.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-8 backdrop-blur-md shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800/80 pb-4">
              1. Adjust Your Weekly Volume
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label htmlFor="bags-slider" className="text-sm font-semibold text-slate-300">
                  Waste Bags / Bins per Week
                </label>
                <span className="text-lg font-bold text-[#D7FF43] bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  {bagsPerWeek} bags (~{totalLbsPerWeek} lbs)
                </span>
              </div>
              <input
                id="bags-slider"
                type="range"
                min={1}
                max={100}
                value={bagsPerWeek}
                onChange={(e) => setBagsPerWeek(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D7FF43] focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
              />
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>1 bag (Small Apt)</span>
                <span>50 bags (Restaurant)</span>
                <span>100 bags (Enterprise)</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800/60">
              <div className="flex justify-between items-center">
                <label htmlFor="recycle-slider" className="text-sm font-semibold text-slate-300">
                  Recyclable / Composable Percentage
                </label>
                <span className="text-lg font-bold text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  {recyclePercentage}%
                </span>
              </div>
              <input
                id="recycle-slider"
                type="range"
                min={10}
                max={100}
                step={5}
                value={recyclePercentage}
                onChange={(e) => setRecyclePercentage(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>10% (Basic Mixed)</span>
                <span>65% (Eco Citizen Avg)</span>
                <span>100% (Zero Waste)</span>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
              💡 <strong className="text-slate-200">How we compute:</strong> Calculations utilize
              EPA WARM (Waste Reduction Model) emission coefficients: 1.85 kg CO₂e avoided per pound
              of recycled organics and rigid plastics.
            </div>
          </motion.div>

          {/* Results Scorecard Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-6 bg-gradient-to-br from-slate-900/90 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-8 space-y-6 backdrop-blur-md shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D7FF43]/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800/80 pb-4">
              2. Your Annual Environmental Impact
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-1">
                <p className="text-xs text-slate-400 font-medium">Landfill Diversion</p>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {divertedLbsPerYear.toLocaleString()}{' '}
                  <span className="text-sm font-normal text-slate-400">lbs</span>
                </p>
                <p className="text-xs text-emerald-400 font-semibold">
                  {metricTonsYear} Metric Tons
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-1">
                <p className="text-xs text-slate-400 font-medium">CO₂ Emissions Saved</p>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {co2SavedKg.toLocaleString()}{' '}
                  <span className="text-sm font-normal text-slate-400">kg</span>
                </p>
                <p className="text-xs text-emerald-400 font-semibold">EPA WARM Standard</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-1">
                <p className="text-xs text-slate-400 font-medium">Equivalent Trees Planted</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                  🌳 {treesPlanted.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 font-medium">10-Year Urban Canopy</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-1">
                <p className="text-xs text-slate-400 font-medium">Green Points Earned</p>
                <p className="text-2xl sm:text-3xl font-black text-[#D7FF43]">
                  {greenPointsYear.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 font-semibold">~${cashValueUsd} USD Value</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => (window.location.href = '/app')}
                className="w-full bg-[#D7FF43] text-slate-950 font-bold py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-xl shadow-[#D7FF43]/20 text-center block focus:outline-none focus:ring-2 focus:ring-white"
              >
                Claim Your Green Points Portal →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
