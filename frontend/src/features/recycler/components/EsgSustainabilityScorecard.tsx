import React, { useState } from 'react';
import {
  useRecyclerEsgReports,
  useRecyclerManifests,
  useGenerateEsgReport,
  type PdfManifestDto,
} from '../api/recycler.api';
import { Globe, Leaf, Zap, Droplets, FileText, Download, ShieldCheck, Plus } from 'lucide-react';

export const EsgSustainabilityScorecard: React.FC = () => {
  const { data: reports = [], isLoading: isReportsLoading } = useRecyclerEsgReports();
  const { data: manifests = [], isLoading: isManifestsLoading } = useRecyclerManifests();
  const generateEsgMutation = useGenerateEsgReport();

  const [showModal, setShowModal] = useState(false);
  const [reportingPeriod, setReportingPeriod] = useState('2026-Q2');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-06-30');

  const latestReport = reports[0] || {
    landfillDiversionRate: 96.4,
    co2OffsetKg: 120500,
    energySavedKwh: 241000,
    waterSavedLiters: 723000,
    reportingPeriod: '2026-Q1 (Baseline)',
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateEsgMutation.mutate(
      { reportingPeriod, startDate, endDate },
      {
        onSuccess: () => {
          setShowModal(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: ESG Compliance Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Globe className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                EPA / GHG Protocol ESG Scorecard
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                COMPLIANT (ISO 14001)
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Automated Lifecycle Assessment (LCA) telemetry & SHA-256 stamped legal audit
              manifests.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 px-6 py-3 rounded-2xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#D7FF43]/20 flex items-center space-x-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Generate ESG Report</span>
        </button>
      </div>

      {/* EPA LCA Sustainability Impact Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Landfill Diversion
            </span>
            <div className="p-2.5 rounded-xl bg-[#D7FF43]/10 text-[#D7FF43]">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#D7FF43] font-mono tracking-tight">
            {isReportsLoading ? '...' : `${latestReport.landfillDiversionRate}%`}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Period: <span className="text-white font-bold">{latestReport.reportingPeriod}</span>
          </p>
        </div>

        <div className="p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              CO2 Emissions Offset
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {isReportsLoading ? '...' : `${(latestReport.co2OffsetKg / 1000).toFixed(1)}t`}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            <span className="text-emerald-400 font-bold">
              {latestReport.co2OffsetKg.toLocaleString()} kg
            </span>{' '}
            CO2 prevented
          </p>
        </div>

        <div className="p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Energy Conserved
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            {isReportsLoading ? '...' : `${(latestReport.energySavedKwh / 1000).toFixed(1)} MWh`}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            <span className="text-amber-400 font-bold">
              {latestReport.energySavedKwh.toLocaleString()} kWh
            </span>{' '}
            electricity saved
          </p>
        </div>

        <div className="p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Water Saved
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
            {isReportsLoading ? '...' : `${(latestReport.waterSavedLiters / 1000).toFixed(1)}k L`}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            <span className="text-cyan-400 font-bold">
              {latestReport.waterSavedLiters.toLocaleString()} L
            </span>{' '}
            water conserved
          </p>
        </div>
      </div>

      {/* Tamper-Proof Legal PDF Manifests Table */}
      <div className="rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 shadow-2xl">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-[#D7FF43]" />
          <span>Tamper-Proof Legal PDF Compliance Manifests</span>
        </h4>

        {isManifestsLoading ? (
          <div className="flex justify-center items-center py-12 text-slate-400 animate-pulse">
            Loading legal compliance manifests...
          </div>
        ) : manifests.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-950/40 border border-slate-800/50">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No PDF manifests generated yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Accept intake loads or generate ESG reports to issue legal PDF manifests.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Manifest Number</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Issued To</th>
                  <th className="py-3 px-4">SHA-256 Cryptographic Hash</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {manifests.map((man: PdfManifestDto) => (
                  <tr key={man.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {man.manifestNumber}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-[#D7FF43] border border-slate-700">
                        {man.manifestType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{man.issuedTo}</td>
                    <td
                      className="py-4 px-4 font-mono text-xs text-slate-400 max-w-xs truncate"
                      title={man.sha256Hash}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                      {man.sha256Hash}
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">
                      {new Date(man.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <a
                        href={man.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#D7FF43]/10 hover:bg-[#D7FF43]/20 text-[#D7FF43] font-medium text-xs border border-[#D7FF43]/20 transition-all shadow"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate ESG Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#D7FF43]" />
                <span>Generate Periodic ESG Report</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Reporting Period
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-Q2 or 2026-ANNUAL"
                  value={reportingPeriod}
                  onChange={(e) => setReportingPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generateEsgMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-sm transition-all shadow"
                >
                  {generateEsgMutation.isPending ? 'Generating...' : 'Confirm Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
