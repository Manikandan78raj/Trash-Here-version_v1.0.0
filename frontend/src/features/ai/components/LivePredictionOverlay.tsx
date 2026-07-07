import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';
import type { DetectedObject } from '../types/ai.types';

interface LivePredictionOverlayProps {
  imageUrl: string;
  detectedObjects?: DetectedObject[];
  className?: string;
}

export const LivePredictionOverlay: React.FC<LivePredictionOverlayProps> = ({
  imageUrl,
  detectedObjects = [],
  className = '',
}) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 1));

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-zinc-950 shadow-2xl border border-zinc-800/80 ${className}`}>
      {/* Top Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
        <button
          onClick={() => setShowBoxes(!showBoxes)}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          title={showBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
        >
          {showBoxes ? <Eye className="w-3.5 h-3.5 text-[#D7FF43]" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-500" />}
          {showBoxes ? 'Boxes On' : 'Boxes Off'}
        </button>
        <div className="w-px h-3 bg-white/20" />
        <button onClick={handleZoomOut} className="p-1 text-zinc-300 hover:text-white transition-colors" title="Zoom Out">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-mono text-zinc-400">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={handleZoomIn} className="p-1 text-zinc-300 hover:text-white transition-colors" title="Zoom In">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Image & Overlay Container */}
      <div className="relative w-full overflow-auto flex items-center justify-center max-h-[600px] bg-zinc-900/50">
        <div
          className="relative inline-block transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={imageUrl}
            alt="AI Waste Analysis"
            className="block w-full max-w-full h-auto object-contain rounded-2xl"
          />

          {/* Bounding Box Overlays */}
          {showBoxes &&
            detectedObjects.map((obj, index) => {
              const leftPct = obj.xMin * 100;
              const topPct = obj.yMin * 100;
              const widthPct = (obj.xMax - obj.xMin) * 100;
              const heightPct = (obj.yMax - obj.yMin) * 100;
              const confPct = Math.round(obj.confidenceScore * 100);
              const isContaminant = obj.isContaminant;

              return (
                <motion.div
                  key={obj.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={`absolute border-2 transition-all group cursor-pointer ${
                    isContaminant
                      ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'border-[#D7FF43] bg-[#D7FF43]/10 shadow-[0_0_15px_rgba(215,255,67,0.3)]'
                  } rounded-lg`}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                  }}
                >
                  {/* Badge Label */}
                  <div
                    className={`absolute -top-7 left-0 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-t-lg shadow-md whitespace-nowrap ${
                      isContaminant
                        ? 'bg-red-600 text-white'
                        : 'bg-[#D7FF43] text-zinc-950 font-bold'
                    }`}
                  >
                    {isContaminant ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950 shrink-0" />
                    )}
                    <span>{obj.label}</span>
                    <span className="opacity-80">({confPct}%)</span>
                    {isContaminant && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-black/30 rounded text-red-200">
                        Contaminant
                      </span>
                    )}
                  </div>

                  {/* Hover Tooltip for Material Type */}
                  <div className="absolute inset-x-0 bottom-0 p-1 text-[10px] text-center text-white bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-b-md">
                    Material: <span className="font-mono text-[#D7FF43]">{obj.materialType}</span>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
