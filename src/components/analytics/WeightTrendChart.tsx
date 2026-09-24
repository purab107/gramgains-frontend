'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Scatter, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { Scale, TrendingDown, TrendingUp, Minus, SlidersHorizontal, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeightHistoryResponse } from '@/services/api';

interface WeightTrendChartProps {
  data: WeightHistoryResponse | null;
  targetWeightKg?: number | null;
  onOpenHistory?: () => void;
  selectedDays?: number;
  onDaysChange?: (days: number) => void;
}

export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  data,
  targetWeightKg,
  onOpenHistory,
  selectedDays = 30,
  onDaysChange,
}) => {
  const [showTooltipInfo, setShowTooltipInfo] = useState(false);

  const logs = data?.logs || [];
  const chartData = logs.map((l) => ({
    date: l.date,
    displayDate: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rawWeight: l.isExcluded ? null : l.rawWeightKg,
    trendWeight: l.trendWeightKg,
    isExcluded: l.isExcluded,
    note: l.note,
  }));

  const allWeights = logs
    .flatMap((l) => [l.rawWeightKg, l.trendWeightKg])
    .filter((w): w is number => typeof w === 'number' && !isNaN(w) && w > 0);

  const minWeight = allWeights.length > 0 ? Math.floor(Math.min(...allWeights) - 1) : 65;
  const maxWeight = allWeights.length > 0 ? Math.ceil(Math.max(...allWeights) + 1) : 80;

  const velocity = data?.velocityKgPerWeek ?? 0;
  const velocityColor = velocity < 0 ? 'text-emerald-500' : velocity > 0 ? 'text-blue-500' : 'text-muted-foreground';
  const VelocityIcon = velocity < 0 ? TrendingDown : velocity > 0 ? TrendingUp : Minus;

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Weight Trend vs. Scale Reality</h3>
              <button 
                type="button" 
                onClick={() => setShowTooltipInfo(!showTooltipInfo)} 
                className="text-muted-foreground hover:text-foreground"
                aria-label="Toggle info"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Dots indicate daily scale weigh-ins; the green curve isolates sustained tissue change.
            </p>
          </div>
        </div>

        {/* Time Window Buttons & History Drawer Button */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border">
            {[14, 30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => onDaysChange?.(d)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedDays === d
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          {onOpenHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHistory}
              className="h-8 rounded-xl gap-1 text-xs"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Logs</span>
            </Button>
          )}
        </div>
      </div>

      {showTooltipInfo && (
        <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-150">
          Scale weight naturally fluctuates by 1–3 kg due to sodium intake, hydration, and glycogen binding (1g carb binds 3–4g water). GramGains filters out this noise using Holt’s Double Exponential Smoothing to determine your true rate of tissue loss or gain.
        </div>
      )}

      {/* KPI Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-muted/20 border border-border">
          <span className="text-[11px] text-muted-foreground block">Latest Scale</span>
          <span className="text-lg font-bold text-foreground">
            {data?.latestRawKg ? `${data.latestRawKg} kg` : '—'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-muted/20 border border-border">
          <span className="text-[11px] text-muted-foreground block">Smoothed Trend</span>
          <span className="text-lg font-bold text-primary">
            {data?.latestTrendKg ? `${data.latestTrendKg} kg` : '—'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-muted/20 border border-border">
          <span className="text-[11px] text-muted-foreground block">Current Velocity</span>
          <div className="flex items-center gap-1">
            <VelocityIcon className={`w-4 h-4 ${velocityColor}`} />
            <span className={`text-lg font-bold ${velocityColor}`}>
              {velocity > 0 ? `+${velocity}` : velocity} <span className="text-xs font-normal">kg/wk</span>
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-muted/20 border border-border">
          <span className="text-[11px] text-muted-foreground block">Goal Weight</span>
          <span className="text-lg font-bold text-foreground">
            {targetWeightKg ? `${targetWeightKg} kg` : 'Maintenance'}
          </span>
        </div>
      </div>

      {/* Chart Visual */}
      <div className="h-64 sm:h-72 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
            <Scale className="w-8 h-8 opacity-40" />
            <span>No weight records found in this window. Log your morning weight to activate the trend curve!</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} 
              />
              <YAxis 
                domain={[minWeight, maxWeight]} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }} 
                unit="kg"
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Target Goal Weight Reference Line */}
              {targetWeightKg && targetWeightKg >= minWeight && targetWeightKg <= maxWeight && (
                <ReferenceLine 
                  y={targetWeightKg} 
                  stroke="#3b82f6" 
                  strokeDasharray="4 4" 
                  label={{ value: `Goal: ${targetWeightKg}kg`, position: 'right', fill: '#3b82f6', fontSize: 10 }} 
                />
              )}

              {/* Raw Scale Weight Dots */}
              <Scatter 
                dataKey="rawWeight" 
                fill="#94a3b8" 
                shape="circle" 
                name="Scale Reading"
              />

              {/* Smoothed Trend Weight Line */}
              <Line
                type="monotone"
                dataKey="trendWeight"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={false}
                name="Smoothed Trend"
                activeDot={{ r: 5, fill: '#16a34a' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend & Outlier Note */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            <span>Raw Scale Reading</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
            <span>Smoothed Trend Weight</span>
          </div>
        </div>
        <span>Double Exponential Smoothing (Holt)</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const diff = data.rawWeight !== null && data.trendWeight !== null 
      ? Math.round((data.rawWeight - data.trendWeight) * 10) / 10 
      : null;

    return (
      <div className="p-3 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg text-xs space-y-1 text-foreground">
        <p className="font-semibold text-muted-foreground border-b border-border/60 pb-1">
          {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="space-y-0.5 pt-0.5">
          {data.rawWeight !== null && (
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Scale Weight:</span>
              <strong className="text-foreground">{data.rawWeight} kg</strong>
            </p>
          )}
          <p className="flex justify-between gap-4">
            <span className="text-emerald-600 font-medium">Smoothed Trend:</span>
            <strong className="text-emerald-600">{data.trendWeight} kg</strong>
          </p>
          {diff !== null && (
            <p className="flex justify-between gap-4 text-[10px] text-muted-foreground">
              <span>Scale Deviation:</span>
              <span>{diff > 0 ? `+${diff}` : diff} kg</span>
            </p>
          )}
          {data.note && (
            <p className="text-[10px] italic text-muted-foreground pt-1 border-t border-border/40">
              &quot;{data.note}&quot;
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};
