import React, { useState } from 'react';
import {
  useRecyclerQueue,
  useStartProcessing,
  useCompleteProcessing,
  type ProcessingQueueItemDto,
} from '../api/recycler.api';
import { Cog, Play, CheckCircle, Cpu } from 'lucide-react';

export const ManufacturingQueueBoard: React.FC = () => {
  const { data: queue = [], isLoading } = useRecyclerQueue();
  const startMutation = useStartProcessing();
  const completeMutation = useCompleteProcessing();

  const [showStartModal, setShowStartModal] = useState(false);
  const [batchId, setBatchId] = useState('batch-uuid-1');
  const [machineId, setMachineId] = useState('SHREDDER-LINE-01');
  const [processStage, setProcessStage] = useState('SHREDDING');
  const [inputWeightKg, setInputWeightKg] = useState(2000);

  const [completingQueueId, setCompletingQueueId] = useState<string | null>(null);
  const [outputWeightKg, setOutputWeightKg] = useState(1950);
  const [wasteLossKg, setWasteLossKg] = useState(50);

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startMutation.mutate(
      { batchId, machineId, processStage, inputWeightKg },
      {
        onSuccess: () => {
          setShowStartModal(false);
        },
      },
    );
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingQueueId) return;
    completeMutation.mutate(
      { queueId: completingQueueId, data: { outputWeightKg, wasteLossKg } },
      {
        onSuccess: () => {
          setCompletingQueueId(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Shop-Floor Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Cog className="w-8 h-8 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Shop-Floor Manufacturing Board</h3>
            <p className="text-sm text-slate-400 mt-1">
              Real-time machine processing queues, evaporation waste loss, and yield analytics.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          className="mt-4 md:mt-0 px-6 py-3 rounded-2xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#D7FF43]/20 flex items-center space-x-2 active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Machine Line</span>
        </button>
      </div>

      {/* Active Queue Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400 animate-pulse">
            Loading machine processing queues...
          </div>
        ) : queue.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-[30px] bg-slate-900/40 border border-slate-800/50">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No manufacturing machine lines currently active.</p>
            <p className="text-xs text-slate-500 mt-1">Click "Start Machine Line" to assign lot stock to shredding or washing units.</p>
          </div>
        ) : (
          queue.map((item: ProcessingQueueItemDto) => (
            <div
              key={item.id}
              className="p-6 rounded-[30px] bg-slate-900/70 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#D7FF43]/10 text-[#D7FF43] border border-[#D7FF43]/20">
                    <Cpu className="w-3.5 h-3.5 mr-1" />
                    {item.machineId}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">{item.processStage}</h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Lot: <span className="text-slate-200">{item.batch?.batchNumber || item.batchId}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Input Weight:</span>
                  <span className="text-white font-bold">{item.inputWeightKg.toLocaleString()} kg</span>
                </div>
                {item.outputWeightKg !== undefined && item.outputWeightKg > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Output Yield:</span>
                    <span className="text-emerald-400 font-bold">{item.outputWeightKg.toLocaleString()} kg</span>
                  </div>
                )}
                {item.wasteLossKg !== undefined && item.wasteLossKg > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Waste Loss / Evap:</span>
                    <span className="text-rose-400 font-bold">{item.wasteLossKg.toLocaleString()} kg</span>
                  </div>
                )}
              </div>

              {item.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => setCompletingQueueId(item.id)}
                  className="w-full py-2.5 rounded-2xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Run & Record Yield</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Start Machine Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Play className="w-5 h-5 text-[#D7FF43]" />
                <span>Start Machine Line</span>
              </h3>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleStartSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Lot Batch ID / UUID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. batch-uuid-1"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Machine Line ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SHREDDER-LINE-01"
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Processing Stage</label>
                <select
                  value={processStage}
                  onChange={(e) => setProcessStage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#D7FF43]"
                >
                  <option value="SHREDDING">SHREDDING — Mechanical Grinding</option>
                  <option value="WASHING">WASHING — Hot Water & Detergent Bath</option>
                  <option value="PELLETIZING">PELLETIZING — Extrusion & Granulation</option>
                  <option value="BALING">BALING — Hydraulic Compacting</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Input Weight (kg)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={inputWeightKg}
                  onChange={(e) => setInputWeightKg(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={startMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-sm transition-all shadow"
                >
                  {startMutation.isPending ? 'Starting...' : 'Confirm Machine Line'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Process Modal */}
      {completingQueueId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Complete Machine Run</span>
              </h3>
              <button
                onClick={() => setCompletingQueueId(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Output Yield Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={outputWeightKg}
                  onChange={(e) => setOutputWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Waste Loss / Evaporation (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={wasteLossKg}
                  onChange={(e) => setWasteLossKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCompletingQueueId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completeMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition-all shadow"
                >
                  {completeMutation.isPending ? 'Completing...' : 'Save Yield & Loss'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
