'use client';

import React from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeeklyCheckInBannerProps {
  onReview: () => void;
  onDismiss?: () => void;
  headline?: string;
  adjustmentKcal?: number;
}

export const WeeklyCheckInBanner: React.FC<WeeklyCheckInBannerProps> = ({
  onReview,
  onDismiss,
  headline = 'Weekly Metabolic Review Ready',
  adjustmentKcal,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-foreground shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 fill-amber-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">
              {headline}
            </h3>
            {adjustmentKcal !== undefined && adjustmentKcal !== 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                adjustmentKcal > 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
              }`}>
                {adjustmentKcal > 0 ? `+${adjustmentKcal}` : adjustmentKcal} kcal
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            We analyzed your recent intake and smoothed weight trends. Check your updated expenditure recommendation.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <Button
          onClick={onReview}
          size="sm"
          className="rounded-xl font-bold gap-1.5 shadow-sm text-xs"
        >
          <span>Review Check-In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
