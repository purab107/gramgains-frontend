'use client';

import React from 'react';
import { Activity, Sparkles, Scale, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalibratePlanCardProps {
  confidenceLevel?: 'INSUFFICIENT' | 'CALIBRATING' | 'MODERATE' | 'HIGH';
  confidenceDays?: number;
  onLogWeight?: () => void;
}

export const CalibratePlanCard: React.FC<CalibratePlanCardProps> = ({
  confidenceLevel = 'INSUFFICIENT',
  confidenceDays = 0,
  onLogWeight,
}) => {
  // Hide completely once the plan is fully calibrated (HIGH confidence)
  if (confidenceLevel === 'HIGH') {
    return null;
  }

  let statusLabel = 'Gathering baseline';
  let bodyText =
    'Log your scale weight and meals daily — your personalized plan calibrates over 2–4 weeks.';
  let badgeColor = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  let progressPercent = Math.min(100, Math.round((confidenceDays / 21) * 100));

  if (confidenceLevel === 'CALIBRATING') {
    statusLabel = 'Calibrating your plan';
    bodyText =
      "We're detecting your metabolic response. Your first adaptive adjustment will appear at your weekly check-in.";
    badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (confidenceLevel === 'MODERATE') {
    statusLabel = 'Refining targets';
    bodyText =
      'Good progress. Your targets are being refined based on your real-world data.';
    badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }

  return (
    <div className="w-full rounded-2xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs transition-all relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -right-12 -top-12 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badgeColor}`}
            >
              <Activity className="w-3 h-3" />
              <span>{statusLabel}</span>
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Day {confidenceDays} of ~21
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {bodyText}
          </p>
        </div>

        {onLogWeight && (
          <div className="shrink-0 self-start sm:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={onLogWeight}
              className="h-8 rounded-xl font-medium text-xs gap-1.5 hover:border-primary/50 hover:bg-primary/5"
            >
              <Scale className="w-3.5 h-3.5 text-primary" />
              <span>Log today&apos;s weight</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>

      {/* Progress track */}
      <div className="mt-3.5 pt-3 border-t border-border/40 flex items-center gap-3">
        <div className="flex-1 bg-muted/60 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
          {progressPercent}% calibrated
        </span>
      </div>
    </div>
  );
};

export default CalibratePlanCard;
