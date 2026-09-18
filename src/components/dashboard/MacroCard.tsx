import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Utensils, Zap, Flame, Salad, Droplet } from 'lucide-react';
import { MACRO_COLORS } from '@/lib/constants';

interface MacroCardProps {
  label: string;
  value: number;
  unit: string;
  target?: number;
  color?: string;
  icon?: React.ReactNode;
}

export const MacroCard: React.FC<MacroCardProps> = ({ label, value, unit, target, color, icon }) => {
  const [hovered, setHovered] = useState(false);
  const percentage = target ? Math.min(Math.round((value / target) * 100), 100) : 0;

  const getMacroDetails = () => {
    const l = label.toUpperCase();
    if (l.includes('PROTEIN')) return { color: color || MACRO_COLORS.protein, defaultIcon: <Utensils className="w-5 h-5" /> };
    if (l.includes('CARB')) return { color: color || MACRO_COLORS.carbs, defaultIcon: <Zap className="w-5 h-5" style={{ fill: MACRO_COLORS.carbs }} /> };
    if (l.includes('FAT')) return { color: color || MACRO_COLORS.fat, defaultIcon: <Flame className="w-5 h-5" style={{ fill: MACRO_COLORS.fat }} /> };
    if (l.includes('WATER')) return { color: color || MACRO_COLORS.water, defaultIcon: <Droplet className="w-5 h-5" style={{ fill: MACRO_COLORS.water }} /> };
    return { color: color || '#169b55', defaultIcon: <Salad className="w-5 h-5" /> };
  };

  const { color: macroColor, defaultIcon } = getMacroDetails();
  const displayIcon = icon || defaultIcon;

  // SVG circle gauge values
  const r = 41;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;

  return (
    <Card
      className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card cursor-default"
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
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 shadow-xs"
              style={{
                backgroundColor: `${macroColor}18`,
                color: macroColor,
              }}
            >
              {displayIcon}
            </div>

            {/* Label */}
            <h4 className="font-semibold text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-1 capitalize">
              {label.toLowerCase()}
            </h4>

            {/* Value & Target Stacked */}
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {value} {unit}
              </span>
              {target !== undefined && (
                <span className="text-sm sm:text-[15px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                  / {target} {unit}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar (Percentage visible on hover) */}
          {target !== undefined && (
            <div className="pt-2">
              <Progress
                value={percentage}
                className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 w-full [&>div]:rounded-full"
                indicatorStyle={{ backgroundColor: macroColor }}
              />
            </div>
          )}
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
              <circle
                cx="50" cy="50" r={r}
                fill="none"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="7.5"
              />
              <circle
                cx="50" cy="50" r={r}
                fill="none"
                stroke={macroColor}
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
                style={{ color: macroColor }}
              >
                {percentage}%
              </span>
            </div>
          </div>

          {/* Label below the ring */}
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 capitalize">
            {label.toLowerCase()}
          </span>
          {target !== undefined && (
            <span className="text-[11px] text-slate-400 font-mono mt-0.5">
              {value} {unit} / {target} {unit}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


