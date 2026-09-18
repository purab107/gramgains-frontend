'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { CircularCalorieProgress } from './CircularCalorieProgress';
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

  const proteinPercent = Math.min(Math.round((summary.protein / (targetProtein || 1)) * 100), 100);
  const carbsPercent = Math.min(Math.round((summary.carbohydrates / (targetCarbs || 1)) * 100), 100);
  const fatPercent = Math.min(Math.round((summary.fat / (targetFat || 1)) * 100), 100);
  const waterPercent = Math.min(Math.round((waterTotalMl / (targetWater || 1)) * 100), 100);

  const waterLiters = (waterTotalMl / 1000).toFixed(1);
  const targetWaterLiters = (targetWater / 1000).toFixed(1);

  return (
    <Card className="border border-slate-100/90 shadow-sm bg-white rounded-3xl p-5 flex flex-row items-center gap-5 h-full">

      {/* Left: Circular Calorie Progress */}
      <div className="flex items-center justify-center shrink-0">
        <CircularCalorieProgress
          consumed={summary.calories}
          target={targetCalories}
          size={145}
          strokeWidth={13}
        />
      </div>

      {/* Divider */}
      <div className="w-px self-stretch bg-slate-100 shrink-0" />

      {/* Right: Macro Progress Bars */}
      <div className="flex flex-col gap-3 flex-1 min-w-0 justify-center">

        {/* Protein */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#8b5cf618', color: '#8b5cf6' }}
          >
            <Dumbbell className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
              <span className="text-slate-600">Protein</span>
              <span className="text-slate-400 font-medium tabular-nums">{Math.round(summary.protein)}/{targetProtein}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#eef2f6] rounded-full overflow-hidden">
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
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#feb11118', color: '#feb111' }}
          >
            <Wheat className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
              <span className="text-slate-600">Carbs</span>
              <span className="text-slate-400 font-medium tabular-nums">{Math.round(summary.carbohydrates)}/{targetCarbs}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#eef2f6] rounded-full overflow-hidden">
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
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#f1535918', color: '#f15359' }}
          >
            <Droplet className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
              <span className="text-slate-600">Fat</span>
              <span className="text-slate-400 font-medium tabular-nums">{Math.round(summary.fat)}/{targetFat}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#eef2f6] rounded-full overflow-hidden">
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
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#2196f318', color: '#2196f3' }}
          >
            <Droplet className="w-3.5 h-3.5 fill-[#2196f3]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
              <span className="text-slate-600">Water</span>
              <span className="text-slate-400 font-medium tabular-nums">{waterLiters}/{targetWaterLiters}L</span>
            </div>
            <div className="h-1.5 w-full bg-[#eef2f6] rounded-full overflow-hidden">
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
