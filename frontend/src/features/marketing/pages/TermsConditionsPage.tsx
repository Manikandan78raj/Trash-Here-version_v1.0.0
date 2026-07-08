import React from 'react';
import { SeoHead } from '../components/SeoHead';

export const TermsConditionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/terms"
        title="Terms & Conditions of Service — Trash Here Platform"
        description="Review the terms of service, Green Points reward redemption rules, and liability waivers for Trash Here Technologies Inc."
      />

      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Terms & Conditions</h1>
          <p className="text-sm text-slate-400">
            Last Updated: July 6, 2026 // Effective Date: Immediate
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-8 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing the Trash Here web portal, mobile PWA, or IoT weighbridge APIs, you agree
              to be bound by these Terms of Service. If you do not agree to these terms, do not use
              our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">2. Green Points Rewards & Valuation</h2>
            <p>
              Green Points are promotional rewards issued to citizens based on verified landfill
              diversion tonnage. Points have no intrinsic monetary value until explicitly redeemed
              through our Stripe Connect payout gateway or partner reward store. We reserve the
              right to adjust point conversion ratios based on municipal recycling market
              commodities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">
              3. Collector & Fleet Operator Responsibilities
            </h2>
            <p>
              Independent fleet collectors operate as third-party contractors. Collectors must
              maintain active commercial vehicle insurance, valid driver licenses, and comply with
              local municipal solid waste transport ordinances. Trash Here is not liable for vehicle
              infractions or transport delays.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">4. Limitation of Liability</h2>
            <p>
              In no event shall Trash Here Technologies Inc. be liable for indirect, incidental, or
              consequential damages arising out of weighbridge hardware downtime, municipal route
              closures, or delayed payout processing.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
