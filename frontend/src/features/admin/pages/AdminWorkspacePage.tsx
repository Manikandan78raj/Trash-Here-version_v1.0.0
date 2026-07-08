import React, { useState } from 'react';
import { AdminFleetMapPage } from '../components/AdminFleetMapPage';
import { AdminFinancePnLPage } from '../components/AdminFinancePnLPage';
import { AdminAuditLogPage } from '../components/AdminAuditLogPage';
import { AdminConfigPage } from '../components/AdminConfigPage';
import { Navigation, DollarSign, ShieldCheck, Sliders, Activity, ShieldAlert } from 'lucide-react';

export const AdminWorkspacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'finance' | 'audit' | 'config'>('fleet');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8 font-sans">
      {/* High-Density Enterprise Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 rounded-[35px] bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-2xl relative overflow-hidden">
        {/* Subtle Lime Green Background Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D7FF43]/5 blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#D7FF43] text-slate-950 tracking-wider uppercase shadow-md shadow-[#D7FF43]/20">
              SOC 2 Type II Certified
            </span>
            <span className="inline-flex items-center text-xs text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1 inline" />
              RBAC Multi-Tier Governance
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Trash Here <span className="text-[#D7FF43]">Enterprise Admin Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Centralized fleet logistics marketplace, Stripe P&L double-entry ledger reconciliation,
            immutable security auditing, and hot-reload platform configuration.
          </p>
        </div>

        <div className="mt-6 md:mt-0 flex items-center space-x-4 z-10">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase">Operational Status</div>
            <div className="text-lg font-bold text-emerald-400 flex items-center justify-end mt-0.5">
              <Activity className="w-4 h-4 mr-1.5 animate-pulse" />
              System Health: Optimal
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div
        role="tablist"
        className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 w-fit"
      >
        <button
          role="tab"
          onClick={() => setActiveTab('fleet')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
            activeTab === 'fleet'
              ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Fleet & Dispatch Map</span>
        </button>

        <button
          role="tab"
          onClick={() => setActiveTab('finance')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
            activeTab === 'finance'
              ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financial P&L & Ledgers</span>
        </button>

        <button
          role="tab"
          onClick={() => setActiveTab('audit')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
            activeTab === 'audit'
              ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Audit Logs & Security</span>
        </button>

        <button
          role="tab"
          onClick={() => setActiveTab('config')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
            activeTab === 'config'
              ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Platform Configuration</span>
        </button>
      </div>

      {/* Tab Content Rendering */}
      <div className="transition-all duration-300">
        {activeTab === 'fleet' && <AdminFleetMapPage />}
        {activeTab === 'finance' && <AdminFinancePnLPage />}
        {activeTab === 'audit' && <AdminAuditLogPage />}
        {activeTab === 'config' && <AdminConfigPage />}
      </div>
    </div>
  );
};
