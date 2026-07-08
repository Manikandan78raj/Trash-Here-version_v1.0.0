import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';
import { useGetCareerJobBySlug, useApplyJob } from '../api/marketing.api';

export const CareerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: jobResponse, isLoading, isError } = useGetCareerJobBySlug(slug || '');
  const job = jobResponse?.data;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const applyMutation = useApplyJob();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    applyMutation.mutate(
      {
        jobId: job.id,
        fullName,
        email,
        phone,
        resumeUrl,
        coverLetter,
        linkedinUrl,
        portfolioUrl,
      },
      {
        onSuccess: () => {
          setFullName('');
          setEmail('');
          setPhone('');
          setResumeUrl('');
          setCoverLetter('');
          setLinkedinUrl('');
          setPortfolioUrl('');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-24 px-4 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-14 bg-slate-800 rounded w-3/4" />
        <div className="h-96 bg-slate-800 rounded-3xl w-full" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-24 px-4 max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Job Opening Not Found</h1>
        <p className="text-slate-400">This role may have been filled or closed.</p>
        <Link
          to="/careers"
          className="inline-block bg-[#D7FF43] text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-[#c2eb31] transition-all"
        >
          ← Back to Careers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route={`/careers/${job.slug}`}
        title={`${job.title} (${job.location}) — Careers at Trash Here`}
        description={`Apply for ${job.title} in ${job.department} at Trash Here. ${job.description.slice(0, 150)}...`}
        jsonLdSchema={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.description,
          datePosted: new Date().toISOString(),
          employmentType: job.employmentType,
          hiringOrganization: {
            '@type': 'Organization',
            name: 'Trash Here',
            sameAs: 'https://trashhere.com',
            logo: 'https://trashhere.com/assets/logo.png',
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.location,
            },
          },
        }}
        breadcrumbSchema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trashhere.com' },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Careers',
              item: 'https://trashhere.com/careers',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: job.title,
              item: `https://trashhere.com/careers/${job.slug}`,
            },
          ],
        }}
      />

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Job Details Column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Link to="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link to="/careers" className="hover:text-white">
                Careers
              </Link>
              <span>/</span>
              <span className="text-[#D7FF43]">{job.department}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="px-3.5 py-1.5 rounded-full bg-slate-800 text-[#D7FF43] text-xs font-semibold">
                📍 {job.location} ({job.workplaceType})
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                💼 {job.employmentType}
              </span>
              {job.salaryRange && (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  💰 {job.salaryRange}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-slate-800/80">
            <h2 className="text-xl font-bold text-white">About the Role</h2>
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-800/80">
              <h2 className="text-xl font-bold text-white">Key Responsibilities & Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm text-slate-300">
                    <span className="text-[#D7FF43] font-bold mt-0.5">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Application Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-2xl sticky top-28"
        >
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Apply for this Position</h3>
            <p className="text-xs text-slate-400">
              Submit your credentials directly to our hiring team.
            </p>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resume / CV URL *
              </label>
              <input
                type="url"
                required
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://linkedin.com/in/janedoe or drive link"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Portfolio / GitHub
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cover Letter / Note
              </label>
              <textarea
                rows={3}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you are passionate about smart waste logistics..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={applyMutation.isPending}
              className="w-full bg-[#D7FF43] text-slate-950 font-bold py-3.5 rounded-xl hover:bg-[#c2eb31] transition-all shadow-lg shadow-[#D7FF43]/20 text-sm focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
            >
              {applyMutation.isPending ? 'Submitting Application...' : 'Submit Application →'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
