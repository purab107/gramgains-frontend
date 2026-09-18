'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sun, SunMedium, Cookie, Moon } from 'lucide-react';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER';

interface MealCalorieCardProps {
  mealType: MealType;
  calories: number;
  itemCount: number;
  /** Daily calorie target — used to compute % of daily goal */
  dailyCalorieTarget: number;
}

const MEAL_CONFIG: Record<
  MealType,
  { label: string; sublabel: string; color: string; icon: React.ReactNode }
> = {
  BREAKFAST: {
    label: 'Breakfast',
    sublabel: 'Morning',
    color: '#f59e0b',
    icon: <Sun className="w-5 h-5" />,
  },
  LUNCH: {
    label: 'Lunch',
    sublabel: 'Afternoon',
    color: '#169b55',
    icon: <SunMedium className="w-5 h-5" />,
  },
  SNACK: {
    label: 'Snacks',
    sublabel: 'Evening',
    color: '#f97316',
    icon: <Cookie className="w-5 h-5" />,
  },
  DINNER: {
    label: 'Dinner',
    sublabel: 'Night',
    color: '#6366f1',
    icon: <Moon className="w-5 h-5" />,
  },
};

export const MealCalorieCard: React.FC<MealCalorieCardProps> = ({
  mealType,
  calories,
  itemCount,
  dailyCalorieTarget,
}) => {
  const { label, sublabel, color, icon } = MEAL_CONFIG[mealType];
  const percentage = dailyCalorieTarget > 0
    ? Math.min(Math.round((calories / dailyCalorieTarget) * 100), 100)
    : 0;

  return (
    <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-card h-full">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full min-h-[160px]">

        {/* Top: Icon + Labels + Value */}
        <div>
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 shadow-xs"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {icon}
          </div>

          {/* Sublabel */}
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {sublabel}
          </span>

          {/* Meal name */}
          <h4 className="font-semibold text-slate-700 text-sm sm:text-base mt-0.5 capitalize">
            {label}
          </h4>

          {/* Calorie value */}
          <div className="flex flex-col mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {Math.round(calories)}{' '}
              <span className="text-sm font-normal text-slate-400">kcal</span>
            </span>
            <span className="text-[12px] text-slate-400 font-medium mt-0.5">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} logged
            </span>
          </div>
        </div>

        {/* Bottom: Progress bar */}
        <div className="pt-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
            <span>of daily goal</span>
            <span style={{ color }}>{percentage}%</span>
          </div>
          <Progress
            value={percentage}
            className="h-2.5 rounded-full bg-slate-100 [&>div]:rounded-full"
            indicatorStyle={{ backgroundColor: color }}
          />
        </div>

      </CardContent>
    </Card>
  );
};
