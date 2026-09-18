'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { CircularCalorieProgress } from './CircularCalorieProgress';
import { Dumbbell, Wheat, Droplet, Flame } from 'lucide-react';

interface TrackerOverviewCardProps {
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

export function TrackerOverviewCard({
  summary,
  targets,
  waterTotalMl = 0,
}: TrackerOverviewCardProps) {
  const targetCalories = targets.calories || 2200;
  const targetProtein = targets.protein || 150;
  const targetCarbs = targets.carbs || 300;
  const targetFat = targets.fat || 70;
  const targetWater = targets.water || 2500;

  const proteinPercent = Math.min(Math.round((summary.protein / (targetProtein || 1)) * 100), 100);
  const carbsPercent = Math.min(Math.round((summary.carbohydrates / (targetCarbs || 1)) * 100), 100);
  const fatPercent = Math.min(Math.round((summary.fat / (targetFat || 1)) * 100), 100);
  const waterPercent = Math.min(Math.round((waterTotalMl / (targetWater || 1)) * 100), 100);

  // Convert ml to liters for water display (e.g. 1.2 / 2.5 L)
  const waterLiters = (waterTotalMl / 1000).toFixed(1);
  const targetWaterLiters = (targetWater / 1000).toFixed(1);

  return (
    <Card className="border border-slate-100/90 shadow-sm bg-white rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        
        {/* Left: Circular Calorie Progress Gauge matching reference UI */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <CircularCalorieProgress
            consumed={summary.calories}
            target={targetCalories}
            size={200}
            strokeWidth={18}
          />
        </div>

        {/* Right: Macro & Water Progress Rows matching reference UI layout */}
        <div className="flex-1 w-full flex flex-col justify-center space-y-5">
          
          {/* 1. Protein (#8b5cf6 - Predefined Purple) */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#8b5cf618', color: '#8b5cf6' }}
            >
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-700">Protein</span>
                <span className="text-slate-500 font-medium">
                  {Math.round(summary.protein)} / {targetProtein} g
                </span>
              </div>
              <div className="h-2.5 w-full bg-[#eef2f6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%`, backgroundColor: '#8b5cf6' }}
                />
              </div>
            </div>
          </div>

          {/* 2. Carbs (#feb111 - Predefined Amber/Gold) */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#feb11118', color: '#feb111' }}
            >
              <Wheat className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-700">Carbs</span>
                <span className="text-slate-500 font-medium">
                  {Math.round(summary.carbohydrates)} / {targetCarbs} g
                </span>
              </div>
              <div className="h-2.5 w-full bg-[#eef2f6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${carbsPercent}%`, backgroundColor: '#feb111' }}
                />
              </div>
            </div>
          </div>

          {/* 3. Fat (#f15359 - Predefined Red/Coral) */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#f1535918', color: '#f15359' }}
            >
              <Droplet className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-700">Fat</span>
                <span className="text-slate-500 font-medium">
                  {Math.round(summary.fat)} / {targetFat} g
                </span>
              </div>
              <div className="h-2.5 w-full bg-[#eef2f6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${fatPercent}%`, backgroundColor: '#f15359' }}
                />
              </div>
            </div>
          </div>

          {/* 4. Water (#2196f3 - Predefined Sky Blue) */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#2196f318', color: '#2196f3' }}
            >
              <Droplet className="w-5 h-5 fill-[#2196f3]" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-700">Water</span>
                <span className="text-slate-500 font-medium">
                  {waterLiters} / {targetWaterLiters} L
                </span>
              </div>
              <div className="h-2.5 w-full bg-[#eef2f6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${waterPercent}%`, backgroundColor: '#2196f3' }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </Card>
  );
}
