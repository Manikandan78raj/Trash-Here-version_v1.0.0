import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';
import { useSubmitContact } from '../api/marketing.api';
import { sanitizeText } from '@/common/security/sanitization';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState('Enterprise Fleet Integration');
  const [message, setMessage] = useState('');

  const contactMutation = useSubmitContact();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(
      {
        name: sanitizeText(name),
        email: sanitizeText(email),
        phone: sanitizeText(phone),
        company: sanitizeText(company),
        subject: sanitizeText(subject),
        message: sanitizeText(message),
        source: 'contact_page',
      },
      {
        onSuccess: () => {
          setName('');
          setEmail('');
          setPhone('');
          setCompany('');
          setMessage('');
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/contact"
        title="Contact Sales & Enterprise Support — Trash Here"
        description="Get in touch with our enterprise climate engineering team for municipal weighbridge integrations, fleet API access, and B2B waste contracts."
      />

      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>💬 Get in Touch</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Let's Build Sustainable Cities Together
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Have questions about SHA-256 carbon manifests, municipal dispatch contracts, or API
            telemetry? Our solutions team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Office & Direct Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-8 backdrop-blur-md shadow-2xl"
          >
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">Global Headquarters</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Trash Here Technologies Inc.
                <br />
                100 Climate Tech Way, Suite 400
                <br />
                San Francisco, CA 94105, USA
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-800/80 text-sm">
              <div className="flex items-center space-x-3">
                <span className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                  📧
                </span>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Enterprise Sales</p>
                  <a
                    href="mailto:enterprise@trashhere.com"
                    className="text-white font-medium hover:text-[#D7FF43]"
                  >
                    enterprise@trashhere.com
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                  🛠️
                </span>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">API & Telemetry Support</p>
                  <a
                    href="mailto:api-support@trashhere.com"
                    className="text-white font-medium hover:text-[#D7FF43]"
                  >
                    api-support@trashhere.com
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                  📰
                </span>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Press & Media Inquiries</p>
                  <a
                    href="mailto:press@trashhere.com"
                    className="text-white font-medium hover:text-[#D7FF43]"
                  >
                    press@trashhere.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
              ⚡ <strong className="text-slate-200">Spam & Rate Protection Active:</strong> All
              inquiries are screened by our automated keyword classifier and rate-limited to 5
              submissions per minute per IP.
            </div>
          </motion.div>

          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-6 backdrop-blur-md shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white">Send us a Message</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Company / Municipality
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="City of Seattle / Acme Corp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Inquiry Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43]"
                >
                  <option value="Enterprise Fleet Integration">
                    Enterprise Fleet & Municipal Dispatch
                  </option>
                  <option value="Weighbridge IoT Telemetry">
                    Weighbridge IoT Telemetry & Scale Integration
                  </option>
                  <option value="ESG Manifests & Audit">
                    SHA-256 ESG Manifests & Corporate Auditing
                  </option>
                  <option value="General Support">General Platform & Green Points Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your waste volume, existing fleet software, or environmental auditing goals..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#D7FF43] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={contactMutation.isPending}
                className="w-full bg-[#D7FF43] text-slate-950 font-bold py-4 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-xl shadow-[#D7FF43]/20 text-base focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
              >
                {contactMutation.isPending ? 'Sending Message...' : 'Send Message to Engineering →'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
