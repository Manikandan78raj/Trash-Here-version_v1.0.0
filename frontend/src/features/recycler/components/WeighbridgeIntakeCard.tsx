import React, { useState } from 'react';
import {
  useRecyclerLoads,
  useCheckInLoad,
  useRecordWeighIn,
  useRecordInspection,
  useRecordWeighOut,
  useIssueManifest,
  type IncomingLoadDto,
} from '../api/recycler.api';
import {
  Scale,
  Truck,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const WeighbridgeIntakeCard: React.FC = () => {
  const { data: loads = [], isLoading } = useRecyclerLoads();
  const checkInMutation = useCheckInLoad();
  const weighInMutation = useRecordWeighIn();
  const inspectMutation = useRecordInspection();
  const weighOutMutation = useRecordWeighOut();
  const issueManifestMutation = useIssueManifest();

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [truckPlate, setTruckPlate] = useState('');
  const [driverName, setDriverName] = useState('');

  const [inspectingLoadId, setInspectingLoadId] = useState<string | null>(null);
  const [overallGrade, setOverallGrade] = useState('GRADE_A_PURE');
  const [moisturePercent, setMoisturePercent] = useState(2.0);
  const [contaminationRate, setContaminationRate] = useState(0.5);

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckPlate.trim() || !driverName.trim()) return;
    checkInMutation.mutate(
      { truckPlate, driverName },
      {
        onSuccess: () => {
          setTruckPlate('');
          setDriverName('');
          setShowCheckInModal(false);
        },
      },
    );
  };

  const handleInspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingLoadId) return;
    inspectMutation.mutate(
      {
        loadId: inspectingLoadId,
        data: { overallGrade, moisturePercent, contaminationRate },
      },
      {
        onSuccess: () => {
          setInspectingLoadId(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: IoT Scale Status & Action Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-[#D7FF43]/10 border border-[#D7FF43]/20 text-[#D7FF43] flex items-center justify-center">
            <Scale className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                IoT Weighbridge Hub #01
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                ONLINE (Modbus TCP)
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Live weighbridge sensor telemetry & HMAC-SHA256 cryptographic weight verification.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCheckInModal(true)}
          className="mt-4 md:mt-0 px-6 py-3 rounded-2xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#D7FF43]/20 flex items-center space-x-2 active:scale-95"
        >
          <Truck className="w-4 h-4" />
          <span>Gate Check-In Vehicle</span>
        </button>
      </div>

      {/* Live Delivery Loads Matrix */}
      <div className="rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 shadow-2xl">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-[#D7FF43]" />
          <span>Active Facility Intake Loads</span>
        </h4>

        {isLoading ? (
          <div className="flex justify-center items-center py-12 text-slate-400 animate-pulse">
            Loading facility intake telemetry...
          </div>
        ) : loads.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-950/40 border border-slate-800/50">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">
              No active collection trucks currently at the facility.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Click "Gate Check-In Vehicle" when a collection truck arrives at gate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Manifest / Plate</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Gross (kg)</th>
                  <th className="py-3 px-4">Tare (kg)</th>
                  <th className="py-3 px-4">Net Weight</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {loads.map((load: IncomingLoadDto) => (
                  <tr key={load.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-white">
                      <div className="font-bold">{load.manifestNumber}</div>
                      <div className="text-xs text-[#D7FF43] font-mono mt-0.5">
                        {load.truckPlate}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{load.driverName}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          load.status === 'ACCEPTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : load.status === 'REJECTED' || load.status === 'CONTAMINATED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {load.status === 'ACCEPTED' && (
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        )}
                        {load.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                        {load.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {load.scaleRecord
                        ? `${load.scaleRecord.grossWeightKg.toLocaleString()} kg`
                        : '—'}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {load.scaleRecord && load.scaleRecord.tareWeightKg > 0
                        ? `${load.scaleRecord.tareWeightKg.toLocaleString()} kg`
                        : '—'}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#D7FF43]">
                      {load.scaleRecord && load.scaleRecord.netWeightKg > 0 ? (
                        <div className="flex items-center space-x-1.5">
                          <span>{load.scaleRecord.netWeightKg.toLocaleString()} kg</span>
                          <span
                            title="HMAC-SHA256 Digital Seal Verified"
                            className="text-emerald-400"
                          >
                            <ShieldCheck className="w-4 h-4 inline" />
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {load.status === 'ARRIVED' && (
                        <button
                          onClick={() =>
                            weighInMutation.mutate({ loadId: load.id, scaleId: 'SCALE-01' })
                          }
                          disabled={weighInMutation.isPending}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#D7FF43] font-medium text-xs border border-slate-700 transition-all shadow"
                        >
                          Weigh In Gross
                        </button>
                      )}
                      {load.status === 'WEIGHING_IN' && (
                        <button
                          onClick={() => setInspectingLoadId(load.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium text-xs border border-amber-500/30 transition-all shadow"
                        >
                          Quality Inspect
                        </button>
                      )}
                      {load.status === 'INSPECTING' && (
                        <button
                          onClick={() =>
                            weighOutMutation.mutate({ loadId: load.id, scaleId: 'SCALE-01' })
                          }
                          disabled={weighOutMutation.isPending}
                          className="px-3.5 py-1.5 rounded-xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-xs transition-all shadow"
                        >
                          Weigh Out Tare & Net
                        </button>
                      )}
                      {load.status === 'ACCEPTED' && (
                        <button
                          onClick={() =>
                            issueManifestMutation.mutate({
                              loadId: load.id,
                              manifestType: 'WEIGHT_CERTIFICATE',
                              issuedTo: load.driverName,
                            })
                          }
                          disabled={issueManifestMutation.isPending}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all shadow"
                        >
                          Issue Weight Certificate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gate Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Truck className="w-5 h-5 text-[#D7FF43]" />
                <span>Gate Check-In Vehicle</span>
              </h3>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Truck License Plate
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRK-9988"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Driver Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkInMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-sm transition-all shadow"
                >
                  {checkInMutation.isPending ? 'Checking In...' : 'Confirm Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quality Inspection Modal */}
      {inspectingLoadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Quality Inspection Grading</span>
              </h3>
              <button
                onClick={() => setInspectingLoadId(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInspectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Material Purity Grade
                </label>
                <select
                  value={overallGrade}
                  onChange={(e) => setOverallGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#D7FF43]"
                >
                  <option value="GRADE_A_PURE">Grade A — Pure / Premium Yield (&gt;98%)</option>
                  <option value="GRADE_B_MINOR_SORT">
                    Grade B — Minor Sorting Required (90-98%)
                  </option>
                  <option value="GRADE_C_HEAVY_SORT">
                    Grade C — Heavy Contamination (&lt;90%)
                  </option>
                  <option value="REJECTED_HAZARDOUS">Rejected — Hazardous / Unsafe Material</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Moisture %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Contaminant %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={contaminationRate}
                    onChange={(e) => setContaminationRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setInspectingLoadId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inspectMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow"
                >
                  {inspectMutation.isPending ? 'Recording...' : 'Save Inspection Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
