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
  const r = 41;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <Card
      className="lg:col-span-1 border border-[var(--border)] shadow-xs rounded-2xl bg-[var(--surface-2)] cursor-default transition-all duration-200 hover:border-[var(--accent-border)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent className="relative p-0 h-full min-h-[160px] overflow-hidden rounded-2xl">

        {/* ── DEFAULT VIEW ── fades out on hover */}
        <div
          className="absolute inset-0 p-4.5 sm:p-5 flex flex-col justify-between transition-all duration-300 ease-in-out"
          style={{
            opacity: hovered ? 0 : 1,
            transform: hovered ? 'scale(0.95)' : 'scale(1)',
            pointerEvents: hovered ? 'none' : 'auto',
          }}
        >
          <div>
            {/* Icon Container */}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 border border-transparent shadow-xs"
              style={{
                backgroundColor: `${color}18`,
                color,
              }}
            >
              {icon}
            </div>

            {/* Label */}
            <h4 className="font-semibold text-[var(--text-secondary)] text-sm sm:text-base mb-1">
              {label}
            </h4>

            {/* Value & Target Stacked */}
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                {value}
              </span>
              <span className="text-sm sm:text-[15px] text-[var(--text-muted)] font-medium mt-1">
                {target}
              </span>
            </div>
          </div>

          {/* Progress Bar (Percentage visible on hover) */}
          <div className="pt-2">
            <Progress
              value={pct}
              className="h-3 rounded-full bg-[var(--surface-3)] w-full [&>div]:rounded-full"
              indicatorStyle={{ backgroundColor: color }}
            />
          </div>
        </div>

        {/* ── HOVER VIEW ── fades in on hover */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-0 transition-all duration-300 ease-in-out"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'scale(1)' : 'scale(0.94)',
            pointerEvents: hovered ? 'auto' : 'none',
          }}
        >
          {/* Circle gauge */}
          <div className="relative flex items-center justify-center w-28 h-28">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ transform: 'rotate(-90deg)' }}
            >
              {/* Track */}
              <circle
                cx="50" cy="50" r={r}
                fill="none"
                className="stroke-[var(--surface-3)]"
                strokeWidth="7.5"
              />
              {/* Progress arc */}
              <circle
                cx="50" cy="50" r={r}
                fill="none"
                stroke={color}
                strokeWidth="7.5"
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
                className="text-2xl font-bold leading-none tracking-tight"
                style={{ color }}
              >
                {pct}%
              </span>
            </div>
          </div>

          {/* Label below the ring */}
          <span className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
            {label}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 w-full">

        {/* Card 1: Today's Calories (Spans 2 columns on desktop) */}
        <Card className="lg:col-span-2 border border-[var(--border)] shadow-xs rounded-3xl bg-[var(--surface-2)]">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
              <Flame className="w-6 h-6 text-[var(--accent)] stroke-[2.3]" />
              <h3 className="font-bold text-[var(--text-primary)] text-lg tracking-tight">
                Today's Calories
              </h3>
            </div>

            <div className="flex flex-row items-center justify-between gap-3 sm:gap-6 my-auto">
              {/* Gauge Left Column */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center cursor-pointer"
                      onMouseEnter={() => setGaugeHovered(true)}
                      onMouseLeave={() => setGaugeHovered(false)}
                    >
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                        {/* Background Ring */}
                        <circle
                          cx="70"
                          cy="70"
                          r={radius}
                          className="stroke-[var(--surface-3)]"
                          strokeWidth="13"
                          fill="transparent"
                        />
                        {/* Progress Ring */}
                        <circle
                          cx="70"
                          cy="70"
                          r={radius}
                          className="stroke-[var(--accent)] transition-all duration-700 ease-out"
                          strokeWidth="13"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>

                      {/* ── DEFAULT TEXT ── fades out on hover */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 transition-all duration-300 ease-in-out"
                        style={{
                          opacity: gaugeHovered ? 0 : 1,
                          transform: gaugeHovered ? 'scale(0.88)' : 'scale(1)',
                          pointerEvents: 'none',
                        }}
                      >
                        <span className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight leading-none">
                          {roundedConsumed.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-1">
                          kcal
                        </span>
                        <span className="text-[11px] sm:text-xs font-normal text-[var(--text-muted)]">
                          consumed
                        </span>
                      </div>

                      {/* ── HOVER TEXT ── fades in on hover */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 transition-all duration-300 ease-in-out"
                        style={{
                          opacity: gaugeHovered ? 1 : 0,
                          transform: gaugeHovered ? 'scale(1)' : 'scale(0.88)',
                          pointerEvents: 'none',
                        }}
                      >
                        <span className="text-3xl sm:text-4xl font-bold text-[var(--accent)] tracking-tight leading-none">
                          {calPercent}%
                        </span>
                        <span className="text-xs font-medium text-[var(--text-secondary)] mt-1.5">
                          complete
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border)] font-medium text-xs px-3 py-1.5 rounded-lg shadow-lg">
                    Consumed: {roundedConsumed.toLocaleString()} kcal ({calPercent}% of {roundedTarget.toLocaleString()} kcal goal)
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Stats Right Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-5 sm:gap-6 pl-1 sm:pl-2">
                {/* Row 1: Remaining */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-muted)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] shrink-0">
                    <Salad className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-normal text-[var(--text-secondary)] block leading-tight">
                      Remaining
                    </span>
                    <div className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
                      {roundedRemaining.toLocaleString()}{' '}
                      <span className="text-xs sm:text-sm font-normal text-[var(--text-muted)] font-sans">
                        kcal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Daily goal */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-3)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                    <Target className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-normal text-[var(--text-secondary)] block leading-tight">
                      Daily goal
                    </span>
                    <div className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight">
                      {roundedTarget.toLocaleString()}{' '}
                      <span className="text-xs sm:text-sm font-normal text-[var(--text-muted)] font-sans">
                        kcal
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Card 2: Protein */}
        <MacroCard
          color={MACRO_COLORS.protein}
          icon={<Utensils className="w-5 h-5" />}
          label="Protein"
          value={`${proteinConsumed} g`}
          target={`/ ${proteinTarget} g`}
          pct={proteinPct}
        />

        {/* Card 3: Carbs */}
        <MacroCard
          color={MACRO_COLORS.carbs}
          icon={<Zap className="w-5 h-5" style={{ fill: MACRO_COLORS.carbs }} />}
          label="Carbs"
          value={`${carbsConsumed} g`}
          target={`/ ${carbsTarget} g`}
          pct={carbsPct}
        />

        {/* Card 4: Fats */}
        <MacroCard
          color={MACRO_COLORS.fat}
          icon={<Flame className="w-5 h-5" style={{ fill: MACRO_COLORS.fat }} />}
          label="Fats"
          value={`${fatConsumed} g`}
          target={`/ ${fatTarget} g`}
          pct={fatPct}
        />

        {/* Card 5: Water */}
        <MacroCard
          color={MACRO_COLORS.water}
          icon={<Droplet className="w-5 h-5" style={{ fill: MACRO_COLORS.water }} />}
          label="Water"
          value={`${consumedWater} ml`}
          target={`/ ${targetWater} ml`}
          pct={waterPct}
        />

      </div>
    </TooltipProvider>
  );
};
