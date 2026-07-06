import React, { useState } from 'react';
import { WeighbridgeIntakeCard } from '../components/WeighbridgeIntakeCard';
import { WarehouseInventoryMatrix } from '../components/WarehouseInventoryMatrix';
import { ManufacturingQueueBoard } from '../components/ManufacturingQueueBoard';
import { EsgSustainabilityScorecard } from '../components/EsgSustainabilityScorecard';
import { Truck, Package, Cpu, Globe, ShieldCheck, Activity } from 'lucide-react';

export const RecyclerWorkspacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'intake' | 'inventory' | 'manufacturing' | 'esg'>('intake');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8 font-sans">
      {/* High-Density Enterprise B2B Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 rounded-[35px] bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-2xl relative overflow-hidden">
        {/* Subtle Lime Green Background Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D7FF43]/5 blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#D7FF43] text-slate-950 tracking-wider uppercase shadow-md shadow-[#D7FF43]/20">
              B2B Enterprise Portal
            </span>
            <span className="inline-flex items-center text-xs text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1 inline" />
              EPA / GHG Protocol Compliant
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Trash Here <span className="text-[#D7FF43]">Recycler Hub</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Integrated weighbridge telemetry, FIFO material lot traceability, shop-floor manufacturing queues, and tamper-proof SHA-256 ESG audit manifests.
          </p>
        </div>

        <div className="mt-6 md:mt-0 flex items-center space-x-4 z-10">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase">Facility Status</div>
            <div className="text-lg font-bold text-emerald-400 flex items-center justify-end mt-0.5">
              <Activity className="w-4 h-4 mr-1.5 animate-pulse" />
              ACTIVE OPERATIONAL
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex space-x-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 w-fit">
        <button
          onClick={() => setActiveTab('intake')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
            activeTab === 'intake'
              ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Weighbridge Intake</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
            activeTab === 'inventory'
              ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Warehouse Stock & Lots</span>
        </button>

        <button
          onClick={() => setActiveTab('manufacturing')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
            activeTab === 'manufacturing'
              ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Shop-Floor Manufacturing</span>
        </button>

        <button
          onClick={() => setActiveTab('esg')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
            activeTab === 'esg'
              ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>ESG & Legal Manifests</span>
        </button>
      </div>

      {/* Active Tab Component Render */}
      <div className="transition-all duration-300">
        {activeTab === 'intake' && <WeighbridgeIntakeCard />}
        {activeTab === 'inventory' && <WarehouseInventoryMatrix />}
        {activeTab === 'manufacturing' && <ManufacturingQueueBoard />}
        {activeTab === 'esg' && <EsgSustainabilityScorecard />}
      </div>
    </div>
  );
};
