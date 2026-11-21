'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { AnalyticsOverviewResponse, AnalyticsPatternsResponse } from '@/services/api';
import { 
  Target, 
  Flame, 
  Clock, 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  SlidersHorizontal,
  Moon,
  Sun
} from 'lucide-react';

export interface AdherenceInsightsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overview: AnalyticsOverviewResponse | null;
  patterns: AnalyticsPatternsResponse | null;
}

export const AdherenceInsightsSheet: React.FC<AdherenceInsightsSheetProps> = ({
  open,
  onOpenChange,
  overview,
  patterns,
}) => {
  const adherence = overview?.adherence;
  const energyBalance = overview?.energyBalance;
  const chronoInsights = patterns?.chronoInsights;
  const weekdayVsWeekend = patterns?.weekdayVsWeekend;
  const activeInsights = patterns?.activeInsights || [];

  const weekendDelta = weekdayVsWeekend?.deltaCalories ?? chronoInsights?.weekendDeltaKcal ?? 0;
  const lateNightPct = chronoInsights?.lateNightCaloriesPercent ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] sm:max-w-[480px] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/80 shadow-2xl h-full overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                Adherence &amp; Behaviour
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-400">
                Insights &amp; Data
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* CARD 1: Chrono-Nutrition & Eating Window */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Chrono-Nutrition &amp; Timing</h4>
              <span className="text-[10px] text-slate-400 font-medium">Daily Rhythm</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Eating Window
                  </span>
                </div>
                <span className="text-xl font-bold font-mono text-foreground">
                  ~11.0 <span className="text-xs font-normal text-muted-foreground">hrs</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Typical 09:30 – 20:30</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Late Night Intake
                  </span>
                </div>
                <span className={`text-xl font-bold font-mono ${lateNightPct > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {lateNightPct}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Calories after 21:00</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {lateNightPct > 15
                ? 'Shifting a greater portion of calories earlier in the day supports restful sleep and metabolic insulin sensitivity.'
                : 'Excellent chrono-nutrition! Limiting late-night calories protects deep sleep phases and overnight fat oxidation.'}
            </p>
          </div>

          {/* CARD 2: Weekday vs Weekend Shift */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Weekday vs. Weekend Intake</h4>
              <span className="text-[10px] text-slate-400 font-medium">Behavioural Drift</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Weekday Average
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {weekdayVsWeekend?.weekdayAvgCalories ? `${weekdayVsWeekend.weekdayAvgCalories}` : '—'} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Mon – Fri disciplined intake</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Weekend Average
                </span>
                <span className={`text-xl font-bold font-mono ${weekendDelta > 200 ? 'text-amber-400' : 'text-foreground'}`}>
                  {weekdayVsWeekend?.weekendAvgCalories ? `${weekdayVsWeekend.weekendAvgCalories}` : '—'} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {weekendDelta > 0 ? `+${weekendDelta} kcal drift` : `${weekendDelta} kcal`}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/80 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Weekend Calorie Delta:</span>
                <span className={`font-bold ${weekendDelta > 200 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {weekendDelta > 0 ? `+${weekendDelta}` : weekendDelta} kcal / weekend day
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                weekendDelta > 300 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {weekendDelta > 300 ? 'Elevated Drift' : 'Consistent'}
              </span>
            </div>
          </div>

          {/* CARD 3: Logging Completeness & Streaks */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-foreground">Logging Consistency</h4>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border text-center">
                <span className="text-[10px] text-slate-400 block mb-1">Target Band</span>
                <span className="text-xl font-black font-mono text-foreground">
                  {adherence?.calorieScore ?? 0}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {adherence?.daysInTargetBand ?? 0}/{adherence?.loggedDaysCount ?? 0} days
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                <span className="text-[10px] text-primary block mb-1">Protein Hit</span>
                <span className="text-xl font-black font-mono text-primary">
                  {adherence?.proteinScore ?? 0}%
                </span>
                <span className="text-[10px] text-primary/80 block mt-0.5">Lean tissue target</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[10px] text-amber-400 block mb-1">Streak</span>
                <span className="text-xl font-black font-mono text-amber-400">
                  {adherence?.currentStreak ?? 0}
                </span>
                <span className="text-[10px] text-amber-400/80 block mt-0.5">consecutive days</span>
              </div>
            </div>
          </div>

          {/* CARD 4: Actionable Insight Recommendations */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-foreground">Actionable Guidance</h4>

            <div className="space-y-2.5">
              {activeInsights.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  Keep logging your meals consistently to generate tailored behavioral advice!
                </p>
              ) : (
                activeInsights.map((insight, idx) => {
                  const isSuccess = insight.level === 'SUCCESS';
                  const isWarning = insight.level === 'WARNING';
                  const Icon = isSuccess ? CheckCircle2 : isWarning ? AlertTriangle : Info;
                  const colorClass = isSuccess 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : isWarning 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400';

                  return (
                    <div key={idx} className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${colorClass}`}>
                      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold text-foreground">{insight.title}</strong>
                        <p className="text-[11px] text-slate-300 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
