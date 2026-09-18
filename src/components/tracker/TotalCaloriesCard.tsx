'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dumbbell, Wheat, Droplet } from 'lucide-react';

interface TotalCaloriesCardProps {
  summary: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    water?: number;
  };
  waterTotalMl?: number;
}

export const TotalCaloriesCard: React.FC<TotalCaloriesCardProps> = ({
  summary,
  targets,
  waterTotalMl = 0,
}) => {
  const targetCalories = targets.calories || 2200;
  const targetProtein = targets.protein || 150;
  const targetCarbs = targets.carbs || 300;
  const targetFat = targets.fat || 70;
  const targetWater = targets.water || 2500;

  const calPercent = targetCalories > 0 ? Math.min(100, Math.round((summary.calories / targetCalories) * 100)) : 0;
  const remaining = Math.max(0, targetCalories - summary.calories);

  const proteinPercent = Math.min(Math.round((summary.protein / (targetProtein || 1)) * 100), 100);
  const carbsPercent = Math.min(Math.round((summary.carbohydrates / (targetCarbs || 1)) * 100), 100);
  const fatPercent = Math.min(Math.round((summary.fat / (targetFat || 1)) * 100), 100);
  const waterPercent = Math.min(Math.round((waterTotalMl / (targetWater || 1)) * 100), 100);

  const waterLiters = (waterTotalMl / 1000).toFixed(1);
  const targetWaterLiters = (targetWater / 1000).toFixed(1);

  // SVG Gauge — exact same values as TodayOverviewCards on home page
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  const [gaugeHovered, setGaugeHovered] = useState(false);

  return (
    <Card className="border border-slate-100/90 shadow-sm bg-white rounded-3xl p-5 flex flex-row items-center gap-5 h-full">

      {/* Left: Circular Calorie Progress — same sizing as home dashboard card */}
      <div className="flex flex-col items-center justify-center shrink-0">
        <div
          className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setGaugeHovered(true)}
          onMouseLeave={() => setGaugeHovered(false)}
        >
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {/* Background Ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#e8edf5"
              strokeWidth="13"
              fill="transparent"
            />
            {/* Progress Ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#169b55"
              strokeWidth="13"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Default text — fades out on hover */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 transition-all duration-300 ease-in-out"
            style={{ opacity: gaugeHovered ? 0 : 1, transform: gaugeHovered ? 'scale(0.88)' : 'scale(1)' }}
          >
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
              {Math.round(summary.calories).toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 mt-0.5">kcal</span>
            <span className="text-[10px] font-medium text-slate-400">consumed</span>
          </div>

          {/* Hover text — fades in on hover */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 transition-all duration-300 ease-in-out"
            style={{ opacity: gaugeHovered ? 1 : 0, transform: gaugeHovered ? 'scale(1)' : 'scale(0.88)' }}
          >
            <span className="text-2xl sm:text-3xl font-extrabold text-[#169b55] tracking-tight leading-none tabular-nums">
              {Math.round(remaining).toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5">kcal</span>
            <span className="text-[10px] font-medium text-slate-400">remaining</span>
          </div>
        </div>

        {/* % of daily goal label */}
        <div className="mt-2 text-xs text-center">
          <span className="font-extrabold text-[#169b55]">{calPercent}%</span>{' '}
          <span className="font-medium text-slate-500">of daily goal</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px self-stretch bg-slate-100 shrink-0" />

      {/* Right: Macro Progress Bars */}
      <div className="flex flex-col gap-3 flex-1 min-w-0 justify-center">

        {/* Protein */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#8b5cf618', color: '#8b5cf6' }}
          >
            <Dumbbell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Protein</span>
              <span className="text-slate-400 font-medium tabular-nums">{Math.round(summary.protein)}/{targetProtein}g</span>
            </div>
            <div className="h-3 w-full bg-[#eef2f6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${proteinPercent}%`, backgroundColor: '#8b5cf6' }}
              />
            </div>
          </div>
        </div>

        {/* Carbs */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#feb11118', color: '#feb111' }}
          >
            <Wheat className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Carbs</span>
              <span className="text-slate-400 font-medium tabular-nums">{Math.round(summary.carbohydrates)}/{targetCarbs}g</span>
            </div>
            <div className="h-3 w-full bg-[#eef2f6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${carbsPercent}%`, backgroundColor: '#feb111' }}
              />
            </div>
          </div>
        </div>

        {/* Fat */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#f1535918', color: '#f15359' }}
          >
            <Droplet className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Fat</span>
              <span className="text-slate-400 font-medium tabular-nums">{Math.round(summary.fat)}/{targetFat}g</span>
            </div>
            <div className="h-3 w-full bg-[#eef2f6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${fatPercent}%`, backgroundColor: '#f15359' }}
              />
            </div>
          </div>
        </div>

        {/* Water */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#2196f318', color: '#2196f3' }}
          >
            <Droplet className="w-4 h-4 fill-[#2196f3]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Water</span>
              <span className="text-slate-400 font-medium tabular-nums">{waterLiters}/{targetWaterLiters}L</span>
            </div>
            <div className="h-3 w-full bg-[#eef2f6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%`, backgroundColor: '#2196f3' }}
              />
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};
