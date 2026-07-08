import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';
import { useGetCareerJobs } from '../api/marketing.api';

export const CareersListingPage: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const { data: jobsResponse, isLoading, isError } = useGetCareerJobs(selectedDept);

  const departments = [
    'ALL',
    'Core Platform & Infrastructure',
    'Engineering & AI',
    'Operations & Logistics',
    'Product & Design',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/careers"
        title="Careers & Venture-Scale Opportunities — Trash Here"
        description="Join our world-class engineering, AI, and operations team building the planetary infrastructure for circular waste logistics."
      />

      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>🚀 Venture-Scale Team & Culture</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Build the Future of Planetary Infrastructure
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            We are solving one of humanity's most urgent physical challenges with distributed
            systems, AI vision models, and real-time logistics optimization.
          </p>
        </div>

        {/* Culture & Perks Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2">
            <p className="text-2xl">🌍</p>
            <h3 className="font-bold text-white">Remote-First & Global</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Work from anywhere with top-tier asynchronous collaboration and quarterly engineering
              summits.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2">
            <p className="text-2xl">📈</p>
            <h3 className="font-bold text-white">Venture Equity & Compensation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Top-of-market salary bands paired with significant early equity ownership in a
              hyper-growth venture.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-2">
            <p className="text-2xl">🔬</p>
            <h3 className="font-bold text-white">Deep Tech & Autonomous AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tackle hard technical problems across Rust systems, YOLOv8 vision models, and IoT
              weighbridges.
            </p>
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800/80 pb-6"
          role="tablist"
        >
          {departments.map((dept) => (
            <button
              key={dept}
              role="tab"
              aria-selected={selectedDept === dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#D7FF43] ${
                selectedDept === dept
                  ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Job Listings */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 h-28 animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-3xl p-8 text-center text-red-300">
            Failed to load open positions. Please check back soon or email careers@trashhere.com.
          </div>
        )}

        {!isLoading && !isError && (!jobsResponse?.data || jobsResponse.data.length === 0) && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <p className="text-xl font-bold text-white">No open roles found in this department.</p>
            <p className="text-sm text-slate-400">
              We are always looking for exceptional talent. Send your resume to
              talent@trashhere.com!
            </p>
          </div>
        )}

        {!isLoading && !isError && jobsResponse?.data && jobsResponse.data.length > 0 && (
          <div className="space-y-4">
            {jobsResponse.data.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.3 }}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-md shadow-xl transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-[#D7FF43] font-medium">
                      {job.department}
                    </span>
                    <span className="text-xs text-slate-400">
                      📍 {job.location} ({job.workplaceType})
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-[#D7FF43] transition-colors">
                    <Link to={`/careers/${job.slug}`} className="focus:outline-none">
                      {job.title}
                    </Link>
                  </h2>
                  {job.salaryRange && (
                    <p className="text-sm font-semibold text-emerald-400">{job.salaryRange}</p>
                  )}
                </div>

                <div className="flex items-center sm:self-center">
                  <Link
                    to={`/careers/${job.slug}`}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-[#D7FF43] text-white hover:text-slate-950 font-bold px-6 py-3.5 rounded-2xl transition-all text-sm text-center shadow-md focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
                  >
                    View Role & Apply →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
