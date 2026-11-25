'use client';

import React, { useState } from 'react';
import { 
  Ruler, 
  TrendingDown, 
  TrendingUp, 
  Minus 
} from 'lucide-react';

interface BodyMeasurementEntry {
  part: string;
  currentCm: number;
  previousCm: number;
  targetDelta?: string;
  notes?: string;
}

const DEFAULT_MEASUREMENTS: BodyMeasurementEntry[] = [
  { part: 'Waist (Navel)', currentCm: 81.5, previousCm: 84.0, targetDelta: 'Reduction' },
  { part: 'Chest', currentCm: 102.5, previousCm: 101.5, targetDelta: 'Preservation / Growth' },
  { part: 'Arms (Flexed)', currentCm: 38.0, previousCm: 37.5, targetDelta: 'Growth' },
  { part: 'Hips', currentCm: 96.0, previousCm: 98.0, targetDelta: 'Reduction' },
  { part: 'Thighs', currentCm: 58.5, previousCm: 59.5, targetDelta: 'Reduction' },
];

export const BodyProgressCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [measurements] = useState<BodyMeasurementEntry[]>(DEFAULT_MEASUREMENTS);

  return (
    <div className={`w-full bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Ruler className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
              Body Measurements
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track size changes alongside scale weight.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <span className="text-xs text-muted-foreground font-medium bg-muted/40 border border-border/60 px-2.5 py-1 rounded-xl whitespace-nowrap inline-flex items-center gap-1">
            Last: <strong className="text-foreground font-semibold">Nov 15</strong>
          </span>
        </div>
      </div>

      {/* Grid of Circumference Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 pt-1">
        {measurements.map((m) => {
          const delta = Math.round((m.currentCm - m.previousCm) * 10) / 10;
          const isDecrease = delta < 0;
          const isIncrease = delta > 0;
          const TrendIcon = delta === 0 ? Minus : isDecrease ? TrendingDown : TrendingUp;
          const deltaColor = delta === 0 ? 'text-muted-foreground' : isDecrease ? 'text-emerald-400' : 'text-blue-400';

          return (
            <div key={m.part} className="p-3 sm:p-3.5 rounded-2xl bg-muted/30 border border-border/80 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block truncate">
                {m.part}
              </span>

              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-foreground">
                  {m.currentCm}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  cm
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                <div className={`flex items-center gap-1 font-semibold ${deltaColor}`}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  <span>{delta > 0 ? `+${delta}` : delta} cm</span>
                </div>
                <span className="text-[10px] text-muted-foreground">30d</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Footer */}
      <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
        <p className="leading-relaxed">
          💡 <strong className="text-foreground">Tip:</strong> Waist size often drops before scale weight when building muscle and losing fat.
        </p>
      </div>
    </div>
  );
};
