import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Sparkles,
  Leaf,
  Award,
  Activity,
  AlertCircle,
  RefreshCw,
  Layers,
  History,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Cpu,
} from 'lucide-react';
import { usePredictionHistory, useRealtimePrediction, useRetryJob } from '../hooks/useAiQuery';
import { LivePredictionOverlay } from './LivePredictionOverlay';
import { ContaminationAlertCard } from './ContaminationAlertCard';
import type { AiPrediction } from '../types/ai.types';
import { useVirtualizer } from '@tanstack/react-virtual';

interface WasteDetectionDashboardProps {
  onOpenScanner: () => void;
  className?: string;
}

export const WasteDetectionDashboard: React.FC<WasteDetectionDashboardProps> = ({
  onOpenScanner,
  className = '',
}) => {
  // Activate Socket.IO real-time updates
  useRealtimePrediction();

  const { data: predictions = [], isLoading, refetch } = usePredictionHistory(30, 0);
  const retryJobMutation = useRetryJob();

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: predictions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 75,
    overscan: 5,
  });

  const [selectedPrediction, setSelectedPrediction] = useState<AiPrediction | null>(null);
  const [failedJobId, setFailedJobId] = useState<string | null>(null);

  // Set default selected prediction to latest scan
  useEffect(() => {
    if (predictions.length > 0 && !selectedPrediction) {
      setSelectedPrediction(predictions[0]);
    }
  }, [predictions, selectedPrediction]);

  // Aggregate stats
  const totalScans = predictions.length;
  const totalCo2Saved = predictions.reduce((acc, curr) => acc + (curr.co2SavedKg || 0), 0);
  const totalPoints = predictions.reduce((acc, curr) => acc + (curr.greenPointsEarned || 0), 0);
  const avgContamination =
    totalScans > 0
      ? Math.round(
          predictions.reduce((acc, curr) => acc + (curr.contaminationRate || 0), 0) / totalScans,
        )
      : 0;

  // Material Breakdown summary
  const materialCounts: Record<string, number> = {};
  predictions.forEach((pred) => {
    pred.detectedObjects?.forEach((obj) => {
      const mat = obj.materialType || 'OTHER';
      materialCounts[mat] = (materialCounts[mat] || 0) + 1;
    });
  });

  const totalMaterials = Object.values(materialCounts).reduce((a, b) => a + b, 0);

  const handleRetryFailed = async (jobId: string) => {
    try {
      await retryJobMutation.mutateAsync(jobId);
      setFailedJobId(null);
      refetch();
    } catch (err) {
      console.error('Failed to retry job:', err);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#D7FF43]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-wider text-[#D7FF43] bg-[#D7FF43]/10 rounded-full border border-[#D7FF43]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Vision Engine v2.4</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            AI Waste Detection Workspace
          </h1>
          <p className="mt-2 text-sm md:text-base text-zinc-400 max-w-xl">
            Real-time multimodal computer vision auditing. Detect material purities, localize
            contaminants with YOLOv8, and calculate EPA WARM carbon offsets instantly.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-zinc-950 bg-[#D7FF43] rounded-2xl shadow-[0_0_25px_rgba(215,255,67,0.3)] hover:bg-[#c2eb30] transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <Camera className="w-5 h-5" />
            <span>New AI Scan</span>
          </button>
        </div>
      </div>

      {/* Failed Job Banner if any */}
      {failedJobId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-red-900/30 border border-red-500/40 rounded-2xl text-red-200"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-sm">
              An AI inference job encountered an error or timed out during processing.
            </span>
          </div>
          <button
            onClick={() => handleRetryFailed(failedJobId)}
            disabled={retryJobMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-[#D7FF43] rounded-xl hover:bg-[#c2eb30] transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${retryJobMutation.isPending ? 'animate-spin' : ''}`}
            />
            <span>Retry Failed Job</span>
          </button>
        </motion.div>
      )}

      {/* Summary Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Scans
            </span>
            <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {totalScans} <span className="text-lg font-medium text-zinc-400">Scans</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-[#D7FF43]" />
            <span>100% BullMQ Asynchronous</span>
          </div>
        </div>

        <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Carbon Offset
            </span>
            <div className="p-2.5 rounded-2xl bg-[#D7FF43]/20 text-zinc-900 dark:text-[#D7FF43]">
              <Leaf className="w-5 h-5 text-[#97c400] dark:text-[#D7FF43]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {totalCo2Saved.toFixed(2)} <span className="text-lg font-medium text-zinc-400">kg</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>EPA WARM certified model</span>
          </div>
        </div>

        <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Green Points
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            +{totalPoints} <span className="text-lg font-medium text-zinc-400">Pts</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <span>Redeemable in Eco Store</span>
          </div>
        </div>

        <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Avg Contamination
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {avgContamination}%
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <span>Target: &lt;10% clean waste</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Inspection vs Right Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Live Inspection & Contamination Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D7FF43]" />
                <span>AI Vision Overview &amp; Localization</span>
              </h2>
              {selectedPrediction && (
                <span className="text-xs font-mono px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full">
                  Job ID: {selectedPrediction.jobId?.slice(0, 8)}...
                </span>
              )}
            </div>

            {selectedPrediction ? (
              <div className="space-y-6">
                <LivePredictionOverlay
                  imageUrl={
                    selectedPrediction.rawPayload
                      ? JSON.parse(selectedPrediction.rawPayload).imageUrl ||
                        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80'
                      : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80'
                  }
                  detectedObjects={selectedPrediction.detectedObjects || []}
                />
                <ContaminationAlertCard prediction={selectedPrediction} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                <Camera className="w-12 h-12 mb-3 text-zinc-400" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  No Scan Selected
                </h3>
                <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                  Select a past scan from the history timeline on the right, or initiate a new scan
                  to audit waste material purity.
                </p>
                <button
                  onClick={onOpenScanner}
                  className="mt-6 px-6 py-2.5 text-xs font-bold text-zinc-950 bg-[#D7FF43] rounded-full shadow-md hover:bg-[#c2eb30] transition-all"
                >
                  Start Scan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Scan History Timeline & Material Breakdown */}
        <div className="space-y-6">
          {/* Material Breakdown Box */}
          <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D7FF43]" />
              <span>Material Breakdown</span>
            </h3>

            {totalMaterials > 0 ? (
              <div className="space-y-3">
                {Object.entries(materialCounts).map(([mat, count]) => {
                  const pct = Math.round((count / totalMaterials) * 100);
                  return (
                    <div key={mat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-700 dark:text-zinc-300 font-mono">{mat}</span>
                        <span className="text-zinc-500 dark:text-zinc-400">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D7FF43] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 text-center py-4">
                No material data recorded yet.
              </p>
            )}
          </div>

          {/* Scan History Timeline */}
          <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#D7FF43]" />
                <span>Scan History Timeline</span>
              </h3>
              <span className="text-xs font-semibold text-zinc-500">
                {predictions.length} Scans
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-6 h-6 text-[#D7FF43] animate-spin" />
              </div>
            ) : predictions.length > 0 ? (
              <div
                ref={parentRef}
                className="max-h-[500px] overflow-y-auto pr-1"
                style={{ position: 'relative' }}
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const pred = predictions[virtualRow.index];
                    const isSelected = selectedPrediction?.id === pred.id;
                    const isContaminated = pred.isContaminated;

                    return (
                      <div
                        key={pred.id}
                        data-index={virtualRow.index}
                        data-testid="scan-history-item"
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="pb-2.5"
                      >
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedPrediction(pred)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-zinc-900 text-white dark:bg-zinc-800 border-[#D7FF43] shadow-md'
                              : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                                isContaminated
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-[#D7FF43]/20 text-[#97c400] dark:text-[#D7FF43]'
                              }`}
                            >
                              {isContaminated ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">
                                {pred.recommendationText || 'Waste Detection Analysis'}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                                <span>{new Date(pred.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span
                                  className={
                                    isContaminated
                                      ? 'text-red-500 font-semibold'
                                      : 'text-emerald-500 font-semibold'
                                  }
                                >
                                  {pred.contaminationRate}% Contam
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              isSelected ? 'text-[#D7FF43] translate-x-0.5' : 'text-zinc-400'
                            }`}
                          />
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-zinc-500">
                No past scans recorded. Click "New AI Scan" to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
