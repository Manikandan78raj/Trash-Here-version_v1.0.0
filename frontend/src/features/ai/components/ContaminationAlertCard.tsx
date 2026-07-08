import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, Leaf, Award, ShieldAlert } from 'lucide-react';
import type { AiPrediction } from '../types/ai.types';

interface ContaminationAlertCardProps {
  prediction: AiPrediction;
  className?: string;
}

export const ContaminationAlertCard: React.FC<ContaminationAlertCardProps> = ({
  prediction,
  className = '',
}) => {
  const {
    isContaminated,
    contaminationRate,
    recommendationType,
    recommendationText,
    co2SavedKg,
    greenPointsEarned,
    overallConfidence,
  } = prediction;

  const getSeverity = () => {
    if (contaminationRate <= 5)
      return {
        label: 'Clean & Ready',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        icon: CheckCircle,
        badge: 'Low Severity',
      };
    if (contaminationRate <= 15)
      return {
        label: 'Moderate Contamination',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        icon: Info,
        badge: 'Moderate Severity',
      };
    if (contaminationRate <= 40)
      return {
        label: 'High Contamination',
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        icon: AlertTriangle,
        badge: 'High Severity',
      };
    return {
      label: 'Severe Contamination',
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      icon: ShieldAlert,
      badge: 'Severe Severity',
    };
  };

  const severity = getSeverity();
  const IconComponent = severity.icon;

  const formatRecommendation = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`p-6 rounded-3xl backdrop-blur-xl border transition-all ${
        isContaminated
          ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/40 shadow-[0_10px_30px_-10px_rgba(239,68,68,0.15)]'
          : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]'
      } ${className}`}
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${severity.color}`}
        >
          <IconComponent className="w-4 h-4 shrink-0" />
          <span>{severity.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Conf: {Math.round(overallConfidence * 100)}%
          </span>
          <span
            className={`px-2.5 py-0.5 text-[11px] font-medium rounded-md ${
              isContaminated
                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            }`}
          >
            {severity.badge}
          </span>
        </div>
      </div>

      {/* Main Contamination % Metric */}
      <div className="flex items-baseline gap-2 mb-6">
        <span
          className={`text-4xl font-extrabold tracking-tight ${
            isContaminated ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'
          }`}
        >
          {contaminationRate}%
        </span>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Contamination Rate by Weight
        </span>
      </div>

      {/* Actionable Recommendation Box */}
      <div className="p-4 mb-6 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50">
        <div className="flex items-center gap-2 mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span>Recommendation: {formatRecommendation(recommendationType)}</span>
        </div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {recommendationText}
        </p>
      </div>

      {/* Eco & Wallet Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              +{greenPointsEarned} Pts
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Green Points Reward</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#D7FF43]/10 dark:bg-[#D7FF43]/5 border border-[#D7FF43]/20 dark:border-[#D7FF43]/10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D7FF43]/20 text-zinc-900 dark:text-[#D7FF43]">
            <Leaf className="w-5 h-5 text-[#97c400] dark:text-[#D7FF43]" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              {co2SavedKg} kg CO₂
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">EPA WARM Savings</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
