'use client';

import React from 'react';
import { 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity 
} from 'lucide-react';
import { AdaptiveStatusResponse } from '@/services/api';

interface MetabolicEngineCardProps {
  status: AdaptiveStatusResponse | null;
}

export const MetabolicEngineCard: React.FC<MetabolicEngineCardProps> = ({ status }) => {
  if (!status) return null;

  const { confidence, expenditure, targets } = status;
  const isHighConfidence = confidence.level === 'HIGH';
  const isCalibrating = confidence.level === 'CALIBRATING';
  const isInsufficient = confidence.level === 'INSUFFICIENT';

  const confidenceBadgeColor = isHighConfidence
    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
    : isCalibrating
    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
    : isInsufficient
    ? 'bg-muted text-muted-foreground border-border'
    : 'bg-blue-500/10 text-blue-500 border-blue-500/30';

  const validPercent = Math.min(100, Math.round((confidence.validFoodDays / 28) * 100));

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Adaptive Metabolic Engine</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${confidenceBadgeColor}`}>
                {confidence.level}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Empirical expenditure solved via thermodynamics and weight velocity.
            </p>
          </div>
        </div>

        {/* Confidence Percentage Chip */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-muted-foreground font-medium">Confidence:</span>
          <span className="text-sm font-black text-foreground">
            {Math.round(confidence.score * 100)}%
          </span>
        </div>
      </div>

      {/* Progress Calibration Bar */}
      <div className="space-y-1.5 bg-muted/20 border border-border rounded-2xl p-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            Calibration Progress ({confidence.validFoodDays}/28 days)
          </span>
          <span className="text-foreground font-semibold">{validPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-primary transition-all duration-500 rounded-full"
            style={{ width: `${validPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground pt-1">
          {confidence.message}
        </p>
      </div>

      {/* 3-Column Expenditure Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Baseline Formula TDEE */}
        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border">
          <span className="text-[11px] text-muted-foreground block mb-0.5">Formula Estimate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-muted-foreground">
              {Math.round(expenditure.formulaBaselineTdee)}
            </span>
            <span className="text-xs text-muted-foreground">kcal</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Mifflin-St Jeor prior</span>
        </div>

        {/* Observed Real TDEE */}
        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border">
          <span className="text-[11px] text-muted-foreground block mb-0.5">Observed Real TDEE</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-foreground">
              {expenditure.observedTdee ? Math.round(expenditure.observedTdee) : '—'}
            </span>
            <span className="text-xs text-foreground">kcal</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Solved from scale &amp; intake</span>
        </div>

        {/* Effective Blended Target */}
        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20">
          <span className="text-[11px] font-bold text-primary block mb-0.5">Active Target Intake</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-foreground">
              {Math.round(targets.recommendedCalories)}
            </span>
            <span className="text-xs text-foreground font-semibold">kcal</span>
            {targets.adjustmentKcal !== 0 && (
              <span className={`ml-auto text-xs font-bold ${targets.adjustmentKcal > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {targets.adjustmentKcal > 0 ? `+${targets.adjustmentKcal}` : targets.adjustmentKcal}
              </span>
            )}
          </div>
          <span className="text-[10px] text-primary/80 font-medium">Anti-whiplash stabilized</span>
        </div>
      </div>
    </div>
  );
};
