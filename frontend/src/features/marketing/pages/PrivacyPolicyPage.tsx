import React from 'react';
import { SeoHead } from '../components/SeoHead';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/privacy"
        title="Privacy Policy & GDPR/CCPA Compliance — Trash Here"
        description="Read how Trash Here protects citizen and enterprise data, handles geolocation telemetry, and ensures SOC 2 compliance."
      />

      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-400">
            Last Updated: July 6, 2026 // Effective Date: Immediate
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-8 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect personal identification information (Name, Email, Phone Number, Address)
              when citizens register for curbside waste pickups or subscribe to our newsletter. For
              fleet collectors, we collect real-time background GPS geolocation telemetry while the
              driver is actively logged into the Collector Workspace to power algorithmic polyline
              routing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">
              2. Cryptographic ESG Manifests & Data Sharing
            </h2>
            <p>
              When waste is weighed at an industrial weighbridge, transaction tonnage is
              cryptographically hashed via SHA-256. While aggregated Scope 3 carbon diversion
              metrics are shared with municipal regulators and enterprise auditors, individual
              citizen names and street addresses are strictly anonymized and never sold to
              third-party data brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">3. GDPR, CCPA, and Citizen Rights</h2>
            <p>
              Under GDPR and CCPA regulations, you have the right to request a complete export of
              your personal data, request immediate deletion of your account and historical pickup
              coordinates, or opt out of automated marketing communications at any time by emailing
              privacy@trashhere.com.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">4. Security & SOC 2 Readiness</h2>
            <p>
              All data transmitted between our IoT weighbridge hardware, mobile PWA, and backend
              Postgres clusters is encrypted in transit using TLS 1.3 and at rest using AES-256
              encryption. We undergo routine SOC 2 Type II compliance audits.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
