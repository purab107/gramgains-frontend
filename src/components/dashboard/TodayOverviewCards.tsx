'use client';

import React, { useState } from 'react';
import { DashboardSummaryResponse, UserProfile } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Utensils, Zap, Droplet, Flame, Salad, Target } from 'lucide-react';
import { MACRO_COLORS } from '@/lib/constants';

// ─── MacroCard Sub-component ────────────────────────────────────────────────

interface MacroCardProps {
  color: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  target: string;
  pct: number;
}

const MacroCard: React.FC<MacroCardProps> = ({ color, icon, label, value, target, pct }) => {
  const [hovered, setHovered] = useState(false);

  // SVG circle gauge values
  const r = 39;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <Card
      className="col-span-1 lg:col-span-1 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl sm:rounded-3xl bg-card cursor-default transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent className="relative p-3.5 sm:p-5 flex flex-col justify-between h-full min-h-[145px] sm:min-h-[160px] rounded-2xl sm:rounded-3xl overflow-hidden">

        {/* ── DEFAULT VIEW ── */}
        <div className="flex flex-col justify-between h-full w-full">
          <div>
            {/* Top Row: Icon on left, Percentage Badge on right */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-transparent shadow-2xs shrink-0"
                style={{
                  backgroundColor: `${color}18`,
                  color,
                }}
              >
                {icon}
              </div>
              <span
                className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${color}18`,
                  color,
                }}
              >
                {pct}%
              </span>
            </div>

            {/* Label */}
            <h4 className="font-semibold text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-0.5 sm:mb-1">
              {label}
            </h4>

            {/* Value & Target */}
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {value}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate">
                {target}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2.5 sm:pt-3">
            <Progress
              value={pct}
              className="h-2 sm:h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 w-full [&>div]:rounded-full"
              indicatorStyle={{ backgroundColor: color }}
            />
          </div>
        </div>

        {/* ── HOVER VIEW (DESKTOP ONLY) ── */}
        <div
          className={`absolute inset-0 hidden sm:flex flex-col items-center justify-center gap-0 bg-card rounded-2xl sm:rounded-3xl transition-all duration-300 ease-in-out ${
            hovered ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
          }`}
        >
          {/* Circle gauge */}
          <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ transform: 'rotate(-90deg)' }}
            >
              {/* Track */}
              <circle
                cx="50" cy="50" r={r}
                fill="none"
                className="stroke-slate-100 dark:stroke-[#1e293b]"
                strokeWidth="12"
              />
              {/* Progress arc */}
              <circle
                cx="50" cy="50" r={r}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={hovered ? offset : circ}
                style={{
                  transition: hovered
                    ? 'stroke-dashoffset 0.65s cubic-bezier(0.4, 0, 0.2, 1)'
                    : 'none',
                }}
              />
            </svg>

            {/* Percentage label centred inside the ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-xl sm:text-2xl font-bold leading-none tracking-tight"
                style={{ color }}
              >
                {pct}%
              </span>
            </div>
          </div>

          {/* Label below the ring */}
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {label}
          </span>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5">
            {value} {target}
          </span>
        </div>

      </CardContent>
    </Card>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

interface TodayOverviewCardsProps {
  summary: DashboardSummaryResponse | null;
  userProfile: UserProfile | null;
  waterTotalMl?: number;
  targetWaterMl?: number;
}

export const TodayOverviewCards: React.FC<TodayOverviewCardsProps> = ({
  summary,
  userProfile,
  waterTotalMl,
  targetWaterMl,
}) => {
  const targetCals = summary?.calories.target ?? userProfile?.targetCalories ?? 2000;
  const consumedCals = summary?.calories.consumed ?? 0;
  const remainingCals = Math.max(0, targetCals - consumedCals);
  const calPercent = targetCals > 0 ? Math.min(100, Math.round((consumedCals / targetCals) * 100)) : 0;

  // Formatted integer numbers (no decimals)
  const roundedConsumed = Math.round(consumedCals);
  const roundedRemaining = Math.round(remainingCals);
  const roundedTarget = Math.round(targetCals);

  // Macro stats
  const proteinConsumed = Math.round(summary?.macros.protein.consumed ?? 0);
  const proteinTarget = Math.round(summary?.macros.protein.target ?? userProfile?.targetProtein ?? 150);
  const proteinPct = proteinTarget > 0 ? Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100)) : 0;

  const carbsConsumed = Math.round(summary?.macros.carbohydrates.consumed ?? 0);
  const carbsTarget = Math.round(summary?.macros.carbohydrates.target ?? userProfile?.targetCarbs ?? 250);
  const carbsPct = carbsTarget > 0 ? Math.min(100, Math.round((carbsConsumed / carbsTarget) * 100)) : 0;

  const fatConsumed = Math.round(summary?.macros.fat.consumed ?? 0);
  const fatTarget = Math.round(summary?.macros.fat.target ?? userProfile?.targetFat ?? 70);
  const fatPct = fatTarget > 0 ? Math.min(100, Math.round((fatConsumed / fatTarget) * 100)) : 0;

  // Water stats
  const consumedWater = Math.round(summary?.water?.consumed ?? waterTotalMl ?? 0);
  const targetWater = Math.round(summary?.water?.target ?? targetWaterMl ?? 2500);
  const waterPct = targetWater > 0 ? Math.min(100, Math.round((consumedWater / targetWater) * 100)) : 0;

  // SVG Gauge calculations (Circle: r=54, viewBox 140x140, strokeWidth 13)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  // Hover state for calorie gauge text cross-fade
  const [gaugeHovered, setGaugeHovered] = useState(false);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 w-full">

        {/* Card 1: Today's Calories (Spans both columns on mobile, 2 of 6 on desktop) */}
        <Card className="col-span-2 lg:col-span-2 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl sm:rounded-3xl bg-card">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#169b55] stroke-[2.3]" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg tracking-tight">
                  Today&apos;s Calories
                </h3>
              </div>
              {/* Mobile percentage badge */}
              <span className="sm:hidden text-xs font-bold px-2.5 py-1 rounded-full bg-[#169b55]/15 text-[#169b55]">
                {calPercent}%
              </span>
            </div>

            <div className="flex flex-row items-center justify-between gap-3.5 min-[400px]:gap-5 sm:gap-8 my-auto">
              {/* Gauge Left Column */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="relative w-36 h-36 min-[400px]:w-40 min-[400px]:h-40 sm:w-44 sm:h-44 shrink-0 flex items-center justify-center cursor-pointer"
                      onMouseEnter={() => setGaugeHovered(true)}
                      onMouseLeave={() => setGaugeHovered(false)}
                    >
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                        {/* Background Ring */}
                        <circle
                          cx="70"
                          cy="70"
                          r={radius}
                          className="stroke-[#e8edf5] dark:stroke-slate-800"
                          strokeWidth="12"
                          fill="transparent"
                        />
                        {/* Progress Ring */}
                        <circle
                          cx="70"
                          cy="70"
                          r={radius}
                          className="stroke-[#169b55] transition-all duration-700 ease-out"
                          strokeWidth="12"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>

                      {/* ── DEFAULT TEXT ── fades out on hover */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 sm:p-2 transition-all duration-300 ease-in-out"
                        style={{
                          opacity: gaugeHovered ? 0 : 1,
                          transform: gaugeHovered ? 'scale(0.88)' : 'scale(1)',
                          pointerEvents: 'none',
                        }}
                      >
                        <span className="text-2xl sm:text-3xl font-bold text-[#0f172a] dark:text-white tracking-tight leading-none">
                          {roundedConsumed.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                          kcal
                        </span>
                        <span className="text-[10px] sm:text-xs font-normal text-slate-400 dark:text-slate-500">
                          consumed
                        </span>
                      </div>

                      {/* ── HOVER TEXT ── fades in on hover */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 sm:p-2 transition-all duration-300 ease-in-out"
                        style={{
                          opacity: gaugeHovered ? 1 : 0,
                          transform: gaugeHovered ? 'scale(1)' : 'scale(0.88)',
                          pointerEvents: 'none',
                        }}
                      >
                        <span className="text-3xl sm:text-4xl font-bold text-[#169b55] tracking-tight leading-none">
                          {calPercent}%
                        </span>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                          complete
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 text-white font-medium text-xs px-3 py-1.5 rounded-lg">
                    Consumed: {roundedConsumed.toLocaleString()} kcal ({calPercent}% of {roundedTarget.toLocaleString()} kcal goal)
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Stats Right Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-2.5 sm:gap-4">
                {/* Row 1: Remaining */}
                <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-0 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 sm:bg-transparent sm:dark:bg-transparent border border-slate-200/60 dark:border-slate-800/60 sm:border-none">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-full bg-[#e8f8f0] dark:bg-emerald-950/50 flex items-center justify-center text-[#169b55] shrink-0">
                    <Salad className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block leading-tight">
                      Remaining
                    </span>
                    <div className="text-base sm:text-xl font-bold text-[#0f172a] dark:text-white tracking-tight leading-tight">
                      {roundedRemaining.toLocaleString()}{' '}
                      <span className="text-xs sm:text-sm font-normal text-slate-400 dark:text-slate-500 font-sans">
                        kcal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Daily goal */}
                <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-0 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 sm:bg-transparent sm:dark:bg-transparent border border-slate-200/60 dark:border-slate-800/60 sm:border-none">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-full bg-[#f1f4f9] dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Target className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block leading-tight">
                      Daily goal
                    </span>
                    <div className="text-base sm:text-xl font-bold text-[#0f172a] dark:text-white tracking-tight leading-tight">
                      {roundedTarget.toLocaleString()}{' '}
                      <span className="text-xs sm:text-sm font-normal text-slate-400 dark:text-slate-500 font-sans">
                        kcal
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Card 2: Protein (Mobile Row 2 Left) */}
        <MacroCard
          color={MACRO_COLORS.protein}
          icon={<Utensils className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Protein"
          value={`${proteinConsumed} g`}
          target={`/ ${proteinTarget} g`}
          pct={proteinPct}
        />

        {/* Card 3: Carbs (Mobile Row 2 Right) */}
        <MacroCard
          color={MACRO_COLORS.carbs}
          icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" style={{ fill: MACRO_COLORS.carbs }} />}
          label="Carbs"
          value={`${carbsConsumed} g`}
          target={`/ ${carbsTarget} g`}
          pct={carbsPct}
        />

        {/* Card 4: Fats (Mobile Row 3 Left) */}
        <MacroCard
          color={MACRO_COLORS.fat}
          icon={<Flame className="w-4 h-4 sm:w-5 sm:h-5" style={{ fill: MACRO_COLORS.fat }} />}
          label="Fats"
          value={`${fatConsumed} g`}
          target={`/ ${fatTarget} g`}
          pct={fatPct}
        />

        {/* Card 5: Water (Mobile Row 3 Right) */}
        <MacroCard
          color={MACRO_COLORS.water}
          icon={<Droplet className="w-4 h-4 sm:w-5 sm:h-5" style={{ fill: MACRO_COLORS.water }} />}
          label="Water"
          value={`${consumedWater} ml`}
          target={`/ ${targetWater} ml`}
          pct={waterPct}
        />

      </div>
    </TooltipProvider>
  );
};
