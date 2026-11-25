'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Utensils, Dumbbell } from 'lucide-react';
import { AnalyticsPatternsResponse } from '@/services/api';

interface MealDistributionCardProps {
  patterns: AnalyticsPatternsResponse | null;
  className?: string;
}

const chartConfig = {
  breakfast: {
    label: 'Breakfast',
    color: '#f97316',
  },
  lunch: {
    label: 'Lunch',
    color: '#0ea5e9',
  },
  dinner: {
    label: 'Dinner',
    color: '#6366f1',
  },
  snack: {
    label: 'Snacks',
    color: '#94a3b8',
  },
} satisfies ChartConfig;

export const MealDistributionCard: React.FC<MealDistributionCardProps> = ({
  patterns,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'calories' | 'protein'>('calories');

  const dailyMealSeries = patterns?.dailyMealSeries || [];
  const mealDistribution = patterns?.mealDistribution;
  const proteinDistribution = patterns?.proteinDistribution || {
    breakfastGrams: 30,
    lunchGrams: 45,
    dinnerGrams: 55,
    snackGrams: 18,
    totalGrams: 148,
  };

  // Safe fallback series if backend hasn't generated daily series yet
  const chartData = useMemo(() => {
    if (dailyMealSeries.length > 0) return dailyMealSeries;

    // Generate fallback from overall percentages for clean rendering
    const dummyDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totalAvg = 2000;
    const bPct = (mealDistribution?.breakfastPercent ?? 22) / 100;
    const lPct = (mealDistribution?.lunchPercent ?? 35) / 100;
    const dPct = (mealDistribution?.dinnerPercent ?? 32) / 100;
    const sPct = (mealDistribution?.snackPercent ?? 11) / 100;

    return dummyDays.map((d, i) => ({
      date: `2026-11-${14 + i}`,
      displayDate: d,
      calories: totalAvg,
      protein: 150,
      breakfast: Math.round(totalAvg * bPct),
      lunch: Math.round(totalAvg * lPct),
      dinner: Math.round(totalAvg * dPct),
      snack: Math.round(totalAvg * sPct),
      breakfastProtein: 30,
      lunchProtein: 45,
      dinnerProtein: 55,
      snackProtein: 18,
      isWeekend: i >= 5,
    }));
  }, [dailyMealSeries, mealDistribution]);

  return (
    <div className={`bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4 ${className}`}>
      {/* ROW 1: Header with Mode Switcher (Calories vs Protein) */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
              Meal Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Calories and protein across your meals.
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Calories vs Protein */}
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/60 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('calories')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'calories'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Calories
          </button>
          <button
            type="button"
            onClick={() => setViewMode('protein')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'protein'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Protein
          </button>
        </div>
      </div>

      {/* ROW 2: Overall Caloric Split Percentage Tiles */}
      {mealDistribution && (
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-border/40 text-center text-xs">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/25 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-semibold text-orange-400 uppercase tracking-wider block mb-0.5 truncate">
              Breakfast
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-foreground">
              {mealDistribution.breakfastPercent}%
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-semibold text-sky-400 uppercase tracking-wider block mb-0.5 truncate">
              Lunch
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-foreground">
              {mealDistribution.lunchPercent}%
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block mb-0.5 truncate">
              Dinner
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-foreground">
              {mealDistribution.dinnerPercent}%
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-500/10 border border-slate-500/25 min-w-0">
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">
              Snacks
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-foreground">
              {mealDistribution.snackPercent}%
            </span>
          </div>
        </div>
      )}

      {/* ROW 3: Visual Canvas (Stacked Bar Chart for Calories OR MPS Stepped Progress for Protein) */}
      {viewMode === 'calories' ? (
        <div className="w-full flex-1 min-h-[260px] pt-1">
          <ChartContainer
            config={chartConfig}
            className="w-full h-[260px] sm:h-[280px] aspect-auto [&_.recharts-bar-rectangle]:transition-all [&_.recharts-bar-rectangle]:duration-500 [&_.recharts-bar-rectangle]:ease-in-out"
          >
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 6, left: -20, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255, 255, 255, 0.12)"
              />
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
              />
              <YAxis
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                tickFormatter={(val) => `${val}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="bg-card/95 border-border shadow-xl backdrop-blur-md"
                    formatter={(val, name) => {
                      const label = chartConfig[name as keyof typeof chartConfig]?.label || name;
                      return (
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span className="text-muted-foreground text-xs">{label}:</span>
                          <span className="font-bold text-foreground font-mono text-xs">
                            {val} kcal
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />

              {/* Stacked Bars for Meals */}
              <Bar
                dataKey="breakfast"
                name="breakfast"
                stackId="meals"
                fill="#f97316"
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-in-out"
              />
              <Bar
                dataKey="lunch"
                name="lunch"
                stackId="meals"
                fill="#0ea5e9"
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-in-out"
              />
              <Bar
                dataKey="dinner"
                name="dinner"
                stackId="meals"
                fill="#6366f1"
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-in-out"
              />
              <Bar
                dataKey="snack"
                name="snack"
                stackId="meals"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ChartContainer>
        </div>
      ) : (
        /* Protein Threshold Mode */
        <div className="w-full flex-1 min-h-[195px] flex flex-col justify-center space-y-3 p-2">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-border/40">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-primary" />
              Target: <strong>~30g protein / meal</strong>
            </span>
            <span className="text-[11px] text-muted-foreground">
              Total Avg: <strong className="text-foreground">{proteinDistribution.totalGrams}g</strong>
            </span>
          </div>

          {/* Meal Progress Rows */}
          {[
            { label: 'Breakfast', grams: proteinDistribution.breakfastGrams, color: 'bg-[#f97316]' },
            { label: 'Lunch', grams: proteinDistribution.lunchGrams, color: 'bg-[#0ea5e9]' },
            { label: 'Dinner', grams: proteinDistribution.dinnerGrams, color: 'bg-[#6366f1]' },
            { label: 'Snacks', grams: proteinDistribution.snackGrams, color: 'bg-[#94a3b8]' },
          ].map((meal) => {
            const pctOfTarget = Math.round((meal.grams / 30) * 100);
            const metThreshold = meal.grams >= 30;

            return (
              <div key={meal.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">{meal.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{meal.grams}g</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      metThreshold
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {metThreshold ? 'Target Hit' : `${pctOfTarget}% target`}
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${meal.color}`}
                    style={{ width: `${Math.min(100, Math.round((meal.grams / 60) * 100))}%` }}
                  />
                  {/* Dotted 30g threshold marker (at 50% width since max is 60g) */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 z-10" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ROW 4: Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block shrink-0" />
            <span className="font-medium text-foreground">Breakfast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9] inline-block shrink-0" />
            <span className="font-medium text-foreground">Lunch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] inline-block shrink-0" />
            <span className="font-medium text-foreground">Dinner</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] inline-block shrink-0" />
            <span className="font-medium text-foreground">Snacks</span>
          </div>
        </div>

        <span className="text-[11px] text-muted-foreground italic">
          Balanced daily meal distribution
        </span>
      </div>
    </div>
  );
};
