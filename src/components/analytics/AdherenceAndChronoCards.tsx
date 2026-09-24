'use client';

import React from 'react';
import { 
  Target, 
  Flame, 
  Calendar, 
  Award, 
  Clock, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  PieChart as PieIcon 
} from 'lucide-react';
import { 
  AnalyticsOverviewResponse, 
  AnalyticsPatternsResponse 
} from '@/services/api';

interface AdherenceAndChronoCardsProps {
  overview: AnalyticsOverviewResponse | null;
  patterns: AnalyticsPatternsResponse | null;
}

export const AdherenceAndChronoCards: React.FC<AdherenceAndChronoCardsProps> = ({
  overview,
  patterns,
}) => {
  if (!overview && !patterns) return null;

  const adherence = overview?.adherence;
  const energyBalance = overview?.energyBalance;
  const milestone = overview?.milestoneProjection;
  const mealDistribution = patterns?.mealDistribution;
  const chronoInsights = patterns?.chronoInsights;
  const activeInsights = patterns?.activeInsights || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* CARD 1: Adherence & Energy Balance */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Adherence &amp; Energy Balance</h3>
            <p className="text-xs text-muted-foreground">
              Consistency within your target calorie band and net thermodynamic deficit.
            </p>
          </div>
        </div>

        {/* Adherence Gauges */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-muted/20 border border-border text-center">
            <span className="text-[10px] text-muted-foreground block mb-1">Calorie Band (±10%)</span>
            <span className="text-xl font-black text-foreground">
              {adherence?.calorieScore ?? 0}%
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              {adherence?.daysInTargetBand ?? 0}/{adherence?.loggedDaysCount ?? 0} days
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border text-center">
            <span className="text-[10px] text-muted-foreground block mb-1">Protein Target (≥90%)</span>
            <span className="text-xl font-black text-primary">
              {adherence?.proteinScore ?? 0}%
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Lean tissue priority</span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/20 border border-border text-center">
            <span className="text-[10px] text-muted-foreground block mb-1">Current Streak</span>
            <span className="text-xl font-black text-amber-500">
              {adherence?.currentStreak ?? 0}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">consecutive days</span>
          </div>
        </div>

        {/* Energy Balance Net Box */}
        {energyBalance && (
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Total Consumed ({overview?.windowDays}d):</span>
              <strong className="text-foreground">{energyBalance.totalConsumedKcal.toLocaleString()} kcal</strong>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Total Expended (TDEE × days):</span>
              <strong className="text-foreground">{energyBalance.totalExpendedKcal.toLocaleString()} kcal</strong>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="font-semibold text-foreground">Net Energy Differential:</span>
              <span className={`font-bold ${energyBalance.netDeficitKcal <= 0 ? 'text-emerald-500' : 'text-blue-500'}`}>
                {energyBalance.netDeficitKcal > 0 ? `+${energyBalance.netDeficitKcal}` : energyBalance.netDeficitKcal} kcal
                <span className="text-[11px] font-normal text-muted-foreground ml-1">
                  (~{Math.abs(energyBalance.predictedLossKg)} kg {energyBalance.netDeficitKcal <= 0 ? 'loss' : 'surplus'})
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Milestone Countdown */}
        {milestone && (
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Goal Milestone</span>
              <p className="text-xs font-bold text-foreground mt-0.5">
                {milestone.remainingKg} kg to reach {milestone.targetWeightKg} kg
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-foreground">
                {new Date(milestone.projectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                ~{milestone.estimatedWeeksRemaining} weeks remaining
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CARD 2: Chrono-Nutrition & Actionable Insights */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Meal Patterns &amp; Insights</h3>
            <p className="text-xs text-muted-foreground">
              Nutrient distribution, chrono-nutrition timing, and behavioural cues.
            </p>
          </div>
        </div>

        {/* Meal Split Distribution Bars */}
        {mealDistribution && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground block">Caloric Split by Meal</span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border">
                <span className="text-[10px] text-muted-foreground block">Breakfast</span>
                <span className="text-sm font-bold text-foreground">{mealDistribution.breakfastPercent}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border">
                <span className="text-[10px] text-muted-foreground block">Lunch</span>
                <span className="text-sm font-bold text-foreground">{mealDistribution.lunchPercent}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border">
                <span className="text-[10px] text-muted-foreground block">Dinner</span>
                <span className="text-sm font-bold text-foreground">{mealDistribution.dinnerPercent}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border">
                <span className="text-[10px] text-muted-foreground block">Snacks</span>
                <span className="text-sm font-bold text-foreground">{mealDistribution.snackPercent}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Chrono Timing Callout */}
        {chronoInsights && chronoInsights.weekendDeltaKcal !== 0 && (
          <div className="p-3 rounded-2xl bg-muted/30 border border-border text-xs flex items-center justify-between">
            <span className="text-muted-foreground">Weekend vs. Weekday Intake:</span>
            <strong className={chronoInsights.weekendDeltaKcal > 200 ? 'text-amber-500' : 'text-foreground'}>
              {chronoInsights.weekendDeltaKcal > 0 ? `+${chronoInsights.weekendDeltaKcal}` : chronoInsights.weekendDeltaKcal} kcal on weekends
            </strong>
          </div>
        )}

        {/* Dynamic Actionable Insights */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground block">Actionable Insights</span>
          {activeInsights.length === 0 ? (
            <div className="p-3 rounded-2xl bg-muted/20 text-xs text-muted-foreground text-center">
              Continue logging meals to generate customized dietary pattern insights!
            </div>
          ) : (
            activeInsights.map((insight, idx) => {
              const isSuccess = insight.level === 'SUCCESS';
              const isWarning = insight.level === 'WARNING';
              const Icon = isSuccess ? CheckCircle2 : isWarning ? AlertTriangle : Info;
              const colorClass = isSuccess 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : isWarning 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' 
                : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';

              return (
                <div key={idx} className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs ${colorClass}`}>
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">{insight.title}</strong>
                    <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
