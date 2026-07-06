import React, { useState } from 'react';
import { useAdminFleetMap, useAdminReassignRoute } from '../api/admin.api';
import { MapPin, Navigation, Truck, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AdminFleetMapPage: React.FC = () => {
  const { data: fleetData, isLoading } = useAdminFleetMap();
  const reassignRoute = useAdminReassignRoute();

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [pickupRequestId, setPickupRequestId] = useState('');
  const [newCollectorId, setNewCollectorId] = useState('');
  const [reason, setReason] = useState('');

  const handleConfirmReassignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupRequestId || !newCollectorId || !reason) return;
    reassignRoute.mutate(
      { pickupRequestId, newCollectorId, reason },
      {
        onSuccess: () => {
          setShowReassignModal(false);
          setPickupRequestId('');
          setNewCollectorId('');
          setReason('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono animate-pulse">
        Loading Live Fleet Telemetry & Dispatch...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner & Telemetry Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[30px] bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#D7FF43] animate-ping inline-block" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Live Fleet Telemetry & Dispatch
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Algorithmic marketplace routing • Euclidean ETA scoring • Automated 30s TTL offer expiration
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <button
            onClick={() => setShowReassignModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reassign Route</span>
          </button>
        </div>
      </div>

      {/* Dispatch Statistics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-[30px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Unassigned Jobs</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2 font-mono">
            {fleetData?.unassignedJobsCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending algorithmic dispatch matching</div>
        </div>

        <div className="p-6 rounded-[30px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">In Progress</div>
          <div className="text-3xl font-extrabold text-[#D7FF43] mt-2 font-mono">
            {fleetData?.inProgressJobsCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active collector route execution</div>
        </div>

        <div className="p-6 rounded-[30px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Today</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
            {fleetData?.completedTodayCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Verified weighbridge / drop-off deliveries</div>
        </div>
      </div>

      {/* Simulated Live Map & Active Collectors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulated Telemetry Map View */}
        <div className="lg:col-span-2 min-h-[400px] rounded-[30px] bg-slate-950 border border-slate-800/80 relative overflow-hidden flex flex-col items-center justify-center p-8 text-center shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <div className="z-10 space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-[#D7FF43]/10 border border-[#D7FF43]/30 flex items-center justify-center mx-auto text-[#D7FF43] shadow-xl shadow-[#D7FF43]/5">
              <Navigation className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Live Fleet Telemetry Map</h3>
            <p className="text-xs text-slate-400">
              Interactive GPS tracking enabled for 100% of active vehicles. Polylines indicate real-time routing to residential pick-up coordinates.
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Telemetry Sync: {fleetData?.timestamp || 'Live'}</span>
            </div>
          </div>
        </div>

        {/* Active Collectors List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider px-2">
            Active Collectors ({fleetData?.activeCollectors?.length || 0})
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {fleetData?.activeCollectors?.map((col) => (
              <div
                key={col.id}
                className="p-5 rounded-[25px] bg-slate-900/70 border border-slate-800/80 hover:border-[#D7FF43]/40 transition-all space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white text-sm">{col.fullName}</div>
                    <div className="text-xs text-slate-400 font-mono">{col.phone}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      col.isOnline
                        ? 'bg-[#D7FF43]/10 text-[#D7FF43] border border-[#D7FF43]/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {col.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">VEHICLE</span>
                    <span className="text-slate-300 font-mono font-semibold">{col.vehiclePlate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">RATING</span>
                    <span className="text-amber-400 font-bold">★ {col.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Route Reassignment Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-8 rounded-[35px] bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Manual Route Reassignment</span>
              </h3>
              <button
                onClick={() => setShowReassignModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Dispatcher override allows reassigning an active pickup request to a new collector when emergencies or vehicle breakdowns occur.
            </p>

            <form onSubmit={handleConfirmReassignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Pickup Request ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pickup-job-101"
                  value={pickupRequestId}
                  onChange={(e) => setPickupRequestId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D7FF43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  New Collector ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. col-fleet-2"
                  value={newCollectorId}
                  onChange={(e) => setNewCollectorId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D7FF43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Reassignment Reason
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vehicle breakdown"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D7FF43]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassignRoute.isPending}
                  className="px-6 py-2.5 rounded-xl bg-[#D7FF43] hover:bg-[#c2eb36] text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-[#D7FF43]/20"
                >
                  {reassignRoute.isPending ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
