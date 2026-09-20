'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sun, SunMedium, Cookie, Moon } from 'lucide-react';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MACRO_COLORS } from '@/lib/constants';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER';

export interface MealMacros {
  protein: number;
  carbs: number;
  fat: number;
}

interface MealCalorieCardProps {
  mealType: MealType;
  calories: number;
  itemCount: number;
  /** Daily calorie target — used to compute % of daily goal */
  dailyCalorieTarget: number;
  /** Macronutrients breakdown for this meal */
  macros?: MealMacros;
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

const chartConfig = {
  protein: {
    label: 'Protein',
    color: MACRO_COLORS.protein,
  },
  carbs: {
    label: 'Carbs',
    color: MACRO_COLORS.carbs,
  },
  fat: {
    label: 'Fat',
    color: MACRO_COLORS.fat,
  },
} satisfies ChartConfig;

export const MealCalorieCard: React.FC<MealCalorieCardProps> = ({
  mealType,
  calories,
  itemCount,
  dailyCalorieTarget,
  macros = { protein: 0, carbs: 0, fat: 0 },
}) => {
  const [hovered, setHovered] = useState(false);
  const { label, sublabel, color, icon } = MEAL_CONFIG[mealType];

  const percentage = dailyCalorieTarget > 0
    ? Math.min(Math.round((calories / dailyCalorieTarget) * 100), 100)
    : 0;

  const proteinG = Math.round(macros.protein || 0);
  const carbsG = Math.round(macros.carbs || 0);
  const fatG = Math.round(macros.fat || 0);
  const totalMacroG = proteinG + carbsG + fatG;

  const proteinPct = totalMacroG > 0 ? Math.round((proteinG / totalMacroG) * 100) : 0;
  const carbsPct = totalMacroG > 0 ? Math.round((carbsG / totalMacroG) * 100) : 0;
  const fatPct = totalMacroG > 0 ? Math.round((fatG / totalMacroG) * 100) : 0;

  const pieData = [
    { name: 'Protein', value: proteinG, color: MACRO_COLORS.protein },
    { name: 'Carbs', value: carbsG, color: MACRO_COLORS.carbs },
    { name: 'Fat', value: fatG, color: MACRO_COLORS.fat },
  ].filter((d) => d.value > 0);

  const hasMacros = pieData.length > 0;

  return (
    <Card
      className="border border-slate-200/80 shadow-sm rounded-2xl bg-card h-full cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent className="relative p-4 sm:p-5 h-full min-h-[175px] overflow-hidden rounded-2xl">
        
        {/* ── DEFAULT VIEW ── Fades out on hover */}
        <div
          className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ease-in-out"
          style={{
            opacity: hovered ? 0 : 1,
            transform: hovered ? 'scale(0.95)' : 'scale(1)',
            pointerEvents: hovered ? 'none' : 'auto',
          }}
        >
          {/* Top: Icon + Labels + Value */}
          <div>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 shadow-xs"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {icon}
            </div>

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {sublabel}
            </span>

            <h4 className="font-semibold text-slate-700 text-sm sm:text-base mt-0.5 capitalize">
              {label}
            </h4>

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
        </div>

        {/* ── HOVER VIEW: MACRO PIE CHART & DIRECT SLICE LABELS ── Fades in on hover */}
        <div
          className="absolute inset-0 p-3.5 sm:p-4 flex flex-col justify-between bg-white rounded-2xl transition-all duration-300 ease-in-out shadow-xs"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'scale(1)' : 'scale(0.95)',
            pointerEvents: hovered ? 'auto' : 'none',
          }}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between pb-1 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs font-bold text-slate-800 capitalize">
                {label} Macros
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {Math.round(calories)} kcal
            </span>
          </div>

          {/* Content: Centered Donut with Thick Slices & Instant Direct Labels */}
          {hasMacros ? (
            <div className="flex-1 flex flex-col items-center justify-center w-full py-1">
              {/* Donut Chart with Direct Slice Gram Labels */}
              <div className="relative w-full flex-1 flex items-center justify-center min-h-[105px]">
                <ChartContainer config={chartConfig} className="w-full h-full max-h-[125px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={56}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={false}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }: any) => {
                          if (!value || (percent ?? 0) < 0.05) return null;
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="#ffffff"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize={11}
                              fontWeight={700}
                              className="pointer-events-none select-none drop-shadow-xs"
                            >
                              {value}g
                            </text>
                          );
                        }}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Center label inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold text-slate-800 leading-none">
                    {totalMacroG}g
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 leading-tight mt-0.5">
                    total
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[10px] font-semibold mb-1">
                0g
              </div>
              <span className="text-[11px] text-slate-400 font-medium">No macros logged</span>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};
