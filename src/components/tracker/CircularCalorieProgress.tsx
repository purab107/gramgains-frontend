'use client';

import React from 'react';

interface CircularCalorieProgressProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularCalorieProgress({
  consumed,
  target,
  size = 180,
  strokeWidth = 16,
}: CircularCalorieProgressProps) {
  const safeTarget = Math.max(target, 1);
  const percentage = Math.round((consumed / safeTarget) * 100);
  const cappedPercent = Math.min(percentage, 100);

  const center = size / 2;
  const radius = center - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cappedPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#eef2f6"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle stroke */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#169b55"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight leading-none font-sans">
            {Math.round(consumed).toLocaleString()}
          </div>
          <div className="text-sm font-semibold text-slate-500 mt-1">
            kcal
          </div>
          <div className="text-xs font-medium text-slate-400">
            consumed
          </div>
        </div>
      </div>

      {/* Goal text beneath */}
      <div className="mt-3 text-sm">
        <span className="font-extrabold text-[#169b55]">{percentage}%</span>{' '}
        <span className="font-medium text-slate-500">of daily goal</span>
      </div>
    </div>
  );
}
