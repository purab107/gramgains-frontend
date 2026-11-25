'use client';

import React, { useState } from 'react';
import { 
  Target, 
  SlidersHorizontal 
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
      <div className={`bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4 ${className}`}>
        {/* ROW 1: Header & Insights Action Button */}
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                Adherence &amp; Balance
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target consistency and net calorie balance.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInsightsOpen(true)}
            className="h-8 rounded-xl gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors shadow-2xs shrink-0 px-2.5 sm:px-3"
            title="Open Adherence Insights & Data"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Insights &amp; Data</span>
          </Button>
        </div>

        {/* ROW 2: 3-Column Adherence Gauges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1 border-t border-border/40">
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-muted/30 border border-border/80 text-center flex flex-col justify-between min-w-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1 truncate">
              Calorie Target
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-foreground">
              {adherence?.calorieScore ?? 0}%
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
              {adherence?.daysInTargetBand ?? 0}/{adherence?.loggedDaysCount ?? 0} days
            </span>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-center flex flex-col justify-between min-w-0">
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block mb-1 truncate">
              Protein Target
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-primary">
              {adherence?.proteinScore ?? 0}%
            </span>
            <span className="text-[10px] text-primary/80 block mt-0.5 truncate">
              ≥90% goal
            </span>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center flex flex-col justify-between min-w-0">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1 truncate">
              Streak
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              {adherence?.currentStreak ?? 0}
            </span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5 truncate">
              consecutive
            </span>
          </div>
        </div>

        {/* ROW 3: Net Energy Balance Differential Box */}
        {energyBalance && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Food Consumed ({overview?.windowDays}d):</span>
              <strong className="text-foreground font-mono">{energyBalance.totalConsumedKcal.toLocaleString()} kcal</strong>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Calories Burned:</span>
              <strong className="text-foreground font-mono">{energyBalance.totalExpendedKcal.toLocaleString()} kcal</strong>
            </div>
            <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-semibold text-foreground">Net Balance:</span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className={`font-black font-mono text-sm ${energyBalance.netDeficitKcal <= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {energyBalance.netDeficitKcal > 0 ? `+${energyBalance.netDeficitKcal}` : energyBalance.netDeficitKcal} kcal
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  (~{Math.abs(energyBalance.predictedLossKg)} kg {energyBalance.netDeficitKcal <= 0 ? 'fat loss' : 'surplus'})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ROW 4: Weekday vs Weekend Comparison Progress Bars */}
        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Weekday vs. Weekend
            </span>
            <span className={`text-[11px] font-bold ${weekendDelta > 200 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {weekendDelta > 0 ? `+${weekendDelta} kcal on weekends` : `${weekendDelta} kcal`}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {/* Weekday Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Weekday Average (Mon – Fri)</span>
                <span className="font-mono text-foreground">{weekdayAvg} kcal</span>
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
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Weekend Average (Sat – Sun)</span>
                <span className={`font-mono ${weekendDelta > 200 ? 'text-amber-400 font-bold' : 'text-foreground'}`}>
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
