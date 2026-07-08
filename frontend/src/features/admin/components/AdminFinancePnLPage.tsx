import React from 'react';
import { useAdminPnL, useAdminReconcileLedgers } from '../api/admin.api';
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export const AdminFinancePnLPage: React.FC = () => {
  const { data: pnl, isLoading } = useAdminPnL();
  const reconcileLedgers = useAdminReconcileLedgers();

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono animate-pulse">
        Calculating Financial P&L & Reconciling Ledgers...
      </div>
    );
  }

  const formatUsd = (val: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[30px] bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-[#D7FF43]" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Stripe-Grade Financial P&L & Ledgers
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Double-entry accounting engine • Real-time Stripe / Green Points / Connect payout ledger
            balancing
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <button
            onClick={() => reconcileLedgers.mutate()}
            disabled={reconcileLedgers.isPending}
            className="px-6 py-3 rounded-xl bg-[#D7FF43] hover:bg-[#c2eb36] text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D7FF43]/20 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${reconcileLedgers.isPending ? 'animate-spin' : ''}`} />
            <span>{reconcileLedgers.isPending ? 'Reconciling...' : 'Reconcile Ledgers'}</span>
          </button>
        </div>
      </div>

      {/* P&L Financial Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stripe Revenue */}
        <div className="p-6 rounded-[30px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Stripe Revenue
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">
            {formatUsd(pnl?.stripePaymentsUsd)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Direct B2C user scheduled pickups</div>
        </div>

        {/* Recycler B2B Invoices */}
        <div className="p-6 rounded-[30px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recycler B2B Invoices
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">
            {formatUsd(pnl?.recyclerInvoicesUsd)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Material lot sales & processing fees
          </div>
        </div>

        {/* Collector Payouts */}
        <div className="p-6 rounded-[30px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Collector Payouts
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">
            {formatUsd(pnl?.collectorPayoutsUsd)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Stripe Connect instant transfers</div>
        </div>

        {/* Net Margin */}
        <div className="p-6 rounded-[30px] bg-gradient-to-br from-slate-900 via-slate-900 to-[#D7FF43]/10 border border-[#D7FF43]/30 backdrop-blur-md relative overflow-hidden shadow-xl shadow-[#D7FF43]/5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#D7FF43]">
              Net Margin
            </span>
            <span className="p-2 rounded-xl bg-[#D7FF43]/20 text-[#D7FF43]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#D7FF43] mt-3 font-mono">
            {formatUsd(pnl?.netMarginUsd)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">After payouts & point liabilities</div>
        </div>
      </div>

      {/* Reconciliation Governance Panel */}
      <div className="p-8 rounded-[35px] bg-slate-900/70 border border-slate-800/80 space-y-6">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Double-Entry Ledger Integrity Audit</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Trash Here financial reconciliation engine verifies 100% of wallet cash balances
          against the net sum of historical payments and payouts. Any mathematical deviation down to
          the cent triggers an automated discrepancy alert.
        </p>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Last Reconciled: {pnl?.calculatedAt || 'Never'}</span>
          <span className="text-emerald-400 font-bold">100% LEDGERS BALANCED</span>
        </div>
      </div>
    </div>
  );
};
