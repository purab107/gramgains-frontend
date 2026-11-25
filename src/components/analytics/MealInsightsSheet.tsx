'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { AnalyticsPatternsResponse } from '@/services/api';
import { 
  Utensils, 
  Clock, 
  Dumbbell, 
  Moon, 
  Sun, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export interface MealInsightsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patterns: AnalyticsPatternsResponse | null;
}

export const MealInsightsSheet: React.FC<MealInsightsSheetProps> = ({
  open,
  onOpenChange,
  patterns,
}) => {
  const mealDistribution = patterns?.mealDistribution;
  const proteinDistribution = patterns?.proteinDistribution || {
    breakfastGrams: 30,
    lunchGrams: 45,
    dinnerGrams: 55,
    snackGrams: 18,
    totalGrams: 148,
  };
  const chronoInsights = patterns?.chronoInsights;
  const lateNightPct = chronoInsights?.lateNightCaloriesPercent ?? 0;

  const meals = [
    {
      name: 'Breakfast',
      percent: mealDistribution?.breakfastPercent ?? 28,
      protein: proteinDistribution.breakfastGrams,
      color: '#f97316',
      badgeClass: 'bg-orange-500/10 border-orange-500/25 text-orange-400',
      timeSlot: 'Morning (07:00 – 10:00)',
    },
    {
      name: 'Lunch',
      percent: mealDistribution?.lunchPercent ?? 17,
      protein: proteinDistribution.lunchGrams,
      color: '#0ea5e9',
      badgeClass: 'bg-sky-500/10 border-sky-500/25 text-sky-400',
      timeSlot: 'Midday (12:00 – 14:30)',
    },
    {
      name: 'Dinner',
      percent: mealDistribution?.dinnerPercent ?? 42,
      protein: proteinDistribution.dinnerGrams,
      color: '#6366f1',
      badgeClass: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
      timeSlot: 'Evening (18:30 – 21:00)',
    },
    {
      name: 'Snacks',
      percent: mealDistribution?.snackPercent ?? 13,
      protein: proteinDistribution.snackGrams,
      color: '#94a3b8',
      badgeClass: 'bg-slate-500/10 border-slate-500/25 text-slate-400',
      timeSlot: 'Between Meals / Late',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] sm:max-w-[480px] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/80 shadow-2xl h-full overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                Meal Distribution &amp; Timing
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Chrono-Nutrition &amp; Meal Pacing
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* CARD 1: Eating Window & Chrono Timing */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Chrono-Nutrition &amp; Timing</h4>
              <span className="text-[10px] text-muted-foreground font-medium">Daily Rhythm</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Eating Window
                  </span>
                </div>
                <span className="text-xl font-bold font-mono text-foreground">
                  ~11.0 <span className="text-xs font-normal text-muted-foreground">hrs</span>
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Typical 09:30 – 20:30</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Late Night Intake
                  </span>
                </div>
                <span className={`text-xl font-bold font-mono ${lateNightPct > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {lateNightPct}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Calories after 21:00</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              {lateNightPct > 15
                ? 'Shifting more calories earlier in the day supports restful sleep and metabolic insulin sensitivity.'
                : 'Great timing! Keeping late-night calories low protects sleep quality and overnight recovery.'}
            </p>
          </div>

          {/* CARD 2: Meal-by-Meal Distribution Breakdown */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Meal Breakdown</h4>
              <span className="text-[10px] text-muted-foreground font-medium">Calorie Share</span>
            </div>

            <div className="space-y-2.5">
              {meals.map((m) => (
                <div
                  key={m.name}
                  className="p-3 rounded-2xl bg-muted/30 border border-border/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: m.color }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {m.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        {m.timeSlot}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right shrink-0">
                    <div>
                      <span className="text-xs font-mono font-bold text-foreground block">
                        {m.percent}%
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        of calories
                      </span>
                    </div>

                    <div className="pl-3 border-l border-border/60">
                      <span className="text-xs font-mono font-bold text-foreground block">
                        {m.protein}g
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        protein
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 3: Protein Pacing & Muscle Recovery */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">Protein Pacing</h4>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                Total Avg: {proteinDistribution.totalGrams}g
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Consuming at least <strong>~30g protein per meal</strong> triggers optimal muscle protein synthesis (MPS). Distributing intake across 3–4 meals is more effective than eating the majority in a single meal.
            </p>

            <div className="space-y-2 pt-1">
              {meals.map((m) => {
                const met = m.protein >= 30;
                return (
                  <div key={m.name} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">{m.protein}g</span>
                      {met ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Target Met
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                          {Math.round((m.protein / 30) * 100)}% of 30g
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
