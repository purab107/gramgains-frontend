'use client';

import React, { useState } from 'react';
import { 
  Target, 
  Flame, 
  Calendar, 
  Award, 
  SlidersHorizontal, 
  TrendingDown, 
  TrendingUp,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AnalyticsOverviewResponse, 
  AnalyticsPatternsResponse 
} from '@/services/api';
import { AdherenceInsightsSheet } from './AdherenceInsightsSheet';

interface AdherenceEnergyBalanceCardProps {
  overview: AnalyticsOverviewResponse | null;
  patterns: AnalyticsPatternsResponse | null;
  className?: string;
}

export const AdherenceEnergyBalanceCard: React.FC<AdherenceEnergyBalanceCardProps> = ({
  overview,
  patterns,
  className = '',
}) => {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const adherence = overview?.adherence;
  const energyBalance = overview?.energyBalance;
  const milestone = overview?.milestoneProjection;
  const weekdayVsWeekend = patterns?.weekdayVsWeekend;
  const weekendDelta = weekdayVsWeekend?.deltaCalories ?? patterns?.chronoInsights?.weekendDeltaKcal ?? 0;

  const weekdayAvg = weekdayVsWeekend?.weekdayAvgCalories ?? patterns?.chronoInsights?.avgWeekdayCalories ?? 2000;
  const weekendAvg = weekdayVsWeekend?.weekendAvgCalories ?? patterns?.chronoInsights?.avgWeekendCalories ?? 2000;
  const maxCal = Math.max(weekdayAvg, weekendAvg, 2500);

  return (
    <>
      <div className={`bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 ${className}`}>
        {/* ROW 1: Header & Insights Action Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Adherence &amp; Energy Balance</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Target Band
                </span>
              </div>
              <p className="text-xs text-muted-foreground/90">
                Consistency within your calorie band and cumulative thermodynamic deficit.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInsightsOpen(true)}
            className="rounded-2xl gap-1.5 text-xs font-semibold h-9 px-3 border-border/80 hover:bg-muted/80 shadow-2xs shrink-0"
            title="Open Adherence Insights & Data"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-medium">Insights &amp; Data</span>
          </Button>
        </div>

        {/* ROW 2: 3-Column Adherence Gauges */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 border-t border-border/40">
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Calorie Band (±10%)
            </span>
            <span className="text-2xl font-black font-mono text-foreground">
              {adherence?.calorieScore ?? 0}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {adherence?.daysInTargetBand ?? 0}/{adherence?.loggedDaysCount ?? 0} days
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-center">
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block mb-1">
              Protein Target (≥90%)
            </span>
            <span className="text-2xl font-black font-mono text-primary">
              {adherence?.proteinScore ?? 0}%
            </span>
            <span className="text-[10px] text-primary/80 block mt-0.5">Lean tissue focus</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
              Current Streak
            </span>
            <span className="text-2xl font-black font-mono text-amber-400">
              {adherence?.currentStreak ?? 0}
            </span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">consecutive days</span>
          </div>
        </div>

        {/* ROW 3: Net Energy Balance Differential Box */}
        {energyBalance && (
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Total Consumed ({overview?.windowDays}d):</span>
              <strong className="text-foreground font-mono">{energyBalance.totalConsumedKcal.toLocaleString()} kcal</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Total Expended (TDEE × days):</span>
              <strong className="text-foreground font-mono">{energyBalance.totalExpendedKcal.toLocaleString()} kcal</strong>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="font-semibold text-foreground">Net Energy Differential:</span>
              <span className={`font-black font-mono text-sm ${energyBalance.netDeficitKcal <= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                {energyBalance.netDeficitKcal > 0 ? `+${energyBalance.netDeficitKcal}` : energyBalance.netDeficitKcal} kcal
                <span className="text-[11px] font-normal text-slate-400 ml-1.5">
                  (~{Math.abs(energyBalance.predictedLossKg)} kg {energyBalance.netDeficitKcal <= 0 ? 'fat loss' : 'surplus'})
                </span>
              </span>
            </div>
          </div>
        )}

        {/* ROW 4: Weekday vs Weekend Comparison Progress Bars */}
        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Weekday vs. Weekend Intake
            </span>
            <span className={`text-[11px] font-bold ${weekendDelta > 200 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {weekendDelta > 0 ? `+${weekendDelta} kcal on weekends` : `${weekendDelta} kcal`}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {/* Weekday Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Weekday Average (Mon – Fri)</span>
                <span className="font-mono text-slate-200">{weekdayAvg} kcal</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((weekdayAvg / maxCal) * 100))}%` }}
                />
              </div>
            </div>

            {/* Weekend Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Weekend Average (Sat – Sun)</span>
                <span className={`font-mono ${weekendDelta > 200 ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
                  {weekendAvg} kcal
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${weekendDelta > 200 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, Math.round((weekendAvg / maxCal) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 5: Milestone Countdown */}
        {milestone && (
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Goal Milestone</span>
              <p className="text-xs font-bold text-foreground mt-0.5">
                {milestone.remainingKg} kg to reach {milestone.targetWeightKg} kg
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-foreground font-mono">
                {new Date(milestone.projectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                ~{milestone.estimatedWeeksRemaining} weeks remaining
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Insights & Data Sheet */}
      <AdherenceInsightsSheet
        open={isInsightsOpen}
        onOpenChange={setIsInsightsOpen}
        overview={overview}
        patterns={patterns}
      />
    </>
  );
};
