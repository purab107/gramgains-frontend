'use client';

import React from 'react';
import { DashboardSummaryResponse, UserProfile } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Utensils, Zap, Droplet } from 'lucide-react';

interface TodayOverviewCardsProps {
  summary: DashboardSummaryResponse | null;
  userProfile: UserProfile | null;
}

export const TodayOverviewCards: React.FC<TodayOverviewCardsProps> = ({
  summary,
  userProfile,
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

  // SVG Gauge calculations (Larger Circle: r=58, viewBox 140x140)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 w-full">
        {/* Card 1: Today's Calories (Spans 2 columns on desktop) */}
        <Card className="lg:col-span-2 border border-slate-200/80 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between h-full">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-2">
              Today's Calories
            </h3>

            <div className="flex flex-row items-center justify-between gap-4 sm:gap-6 my-auto">
              {/* SVG Gauge with Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative w-36 h-36 sm:w-38 sm:h-38 shrink-0 flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.02]">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                      {/* Background Ring */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth="11"
                        fill="transparent"
                      />
                      {/* Progress Ring */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        className="stroke-[#0d7649] transition-all duration-500 ease-out"
                        strokeWidth="11"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    {/* Gauge Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        {roundedConsumed.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 mt-0.5">kcal</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 text-white font-medium text-xs px-3 py-1.5 rounded-lg">
                  Consumed: {roundedConsumed.toLocaleString()} kcal ({calPercent}% of {roundedTarget.toLocaleString()} kcal goal)
                </TooltipContent>
              </Tooltip>

              {/* Calories Stats */}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Remaining
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  {roundedRemaining.toLocaleString()} kcal
                </div>
                <span className="text-xs text-slate-400 font-medium block mb-2">
                  of {roundedTarget.toLocaleString()} kcal
                </span>

                {/* Progress bar */}
                <Progress 
                  value={calPercent} 
                  className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 [&>div]:bg-[#0d7649] [&>div]:rounded-full" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Protein (Color: #2873e5) */}
        <Card className="lg:col-span-1 border border-slate-200/80 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-4 sm:p-4.5 flex flex-col justify-between h-full">
            <div>
              <div className="w-9 h-9 rounded-2xl bg-[#2873e5]/10 text-[#2873e5] border border-[#2873e5]/20 flex items-center justify-center mb-2.5">
                <Utensils className="w-4.5 h-4.5" />
              </div>

              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-0.5">
                Protein
              </h4>

              <div className="flex items-baseline gap-1 mb-2.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {proteinConsumed} g
                </span>
                <span className="text-xs text-slate-400 font-medium font-mono">
                  / {proteinTarget} g
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Progress 
                value={proteinPct} 
                className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex-1 [&>div]:bg-[#2873e5] [&>div]:rounded-full" 
              />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                {proteinPct}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Carbs (Color: #f15359) */}
        <Card className="lg:col-span-1 border border-slate-200/80 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-4 sm:p-4.5 flex flex-col justify-between h-full">
            <div>
              <div className="w-9 h-9 rounded-2xl bg-[#f15359]/10 text-[#f15359] border border-[#f15359]/20 flex items-center justify-center mb-2.5">
                <Zap className="w-4.5 h-4.5 fill-[#f15359]" />
              </div>

              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-0.5">
                Carbs
              </h4>

              <div className="flex items-baseline gap-1 mb-2.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {carbsConsumed} g
                </span>
                <span className="text-xs text-slate-400 font-medium font-mono">
                  / {carbsTarget} g
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Progress 
                value={carbsPct} 
                className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex-1 [&>div]:bg-[#f15359] [&>div]:rounded-full" 
              />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                {carbsPct}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Fats (Color: #feb111) */}
        <Card className="lg:col-span-1 border border-slate-200/80 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-4 sm:p-4.5 flex flex-col justify-between h-full">
            <div>
              <div className="w-9 h-9 rounded-2xl bg-[#feb111]/10 text-[#feb111] border border-[#feb111]/20 flex items-center justify-center mb-2.5">
                <Droplet className="w-4.5 h-4.5 fill-[#feb111]" />
              </div>

              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-0.5">
                Fats
              </h4>

              <div className="flex items-baseline gap-1 mb-2.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {fatConsumed} g
                </span>
                <span className="text-xs text-slate-400 font-medium font-mono">
                  / {fatTarget} g
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Progress 
                value={fatPct} 
                className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex-1 [&>div]:bg-[#feb111] [&>div]:rounded-full" 
              />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                {fatPct}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
