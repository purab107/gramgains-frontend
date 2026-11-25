'use client';

import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  ComposedChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Scale, SlidersHorizontal, Info, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeightHistoryResponse } from '@/services/api';
import { WeightInsightsSheet } from './WeightInsightsSheet';

interface WeightTrendChartProps {
  data: WeightHistoryResponse | null;
  targetWeightKg?: number | null;
  onOpenHistory?: () => void;
  selectedDays?: number;
  onDaysChange?: (days: number) => void;
  onRefresh?: () => void;
  className?: string;
}

const chartConfig = {
  rawWeight: {
    label: 'Scale Weight',
    color: '#8b5cf6',
  },
  trendWeight: {
    label: 'Trend Weight',
    color: '#c4b5fd',
  },
  goalWeight: {
    label: 'Goal Target',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

const TIME_RANGES = [
  { label: '1W', days: 7 },
  { label: '2W', days: 14 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
];

export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  data,
  targetWeightKg,
  onOpenHistory,
  selectedDays = 30,
  onDaysChange,
  onRefresh,
  className = '',
}) => {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const logs = data?.logs || [];

  // Filter or transform time-series data for chart with client-side slicing
  const chartData = useMemo(() => {
    // Slicing to the selectedDays window for instantaneous, buttery 60fps morphing
    const targetLogs =
      selectedDays && logs.length > selectedDays
        ? logs.slice(-selectedDays)
        : logs;

    return targetLogs.map((l) => {
      const dateObj = new Date(l.date);
      const displayDate = isNaN(dateObj.getTime())
        ? l.date
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        date: l.date,
        displayDate,
        rawWeight: l.isExcluded ? null : l.rawWeightKg,
        trendWeight: l.trendWeightKg,
        isExcluded: l.isExcluded,
        note: l.note,
      };
    });
  }, [logs, selectedDays]);

  // Compute domain bounds for Y-Axis and header KPIs
  const { minWeight, maxWeight, avgWeight, diffKg, dateRangeStr, compactDateRangeStr } = useMemo(() => {
    const validWeights: number[] = [];

    chartData.forEach((d) => {
      if (typeof d.rawWeight === 'number' && d.rawWeight > 0) validWeights.push(d.rawWeight);
      if (typeof d.trendWeight === 'number' && d.trendWeight > 0) validWeights.push(d.trendWeight);
    });

    if (targetWeightKg && targetWeightKg > 0) {
      validWeights.push(targetWeightKg);
    }

    if (validWeights.length === 0) {
      return {
        minWeight: 65,
        maxWeight: 80,
        avgWeight: 75.0,
        diffKg: 0,
        dateRangeStr: 'Calibrating data',
        compactDateRangeStr: 'Calibrating',
      };
    }

    const min = Math.min(...validWeights);
    const max = Math.max(...validWeights);
    const spread = max - min;
    const padding = spread === 0 ? 2 : Math.max(1.2, Math.round(spread * 0.2 * 10) / 10);

    const trendValues = chartData
      .map((d) => d.trendWeight)
      .filter((w): w is number => typeof w === 'number' && w > 0);

    const avg = trendValues.length > 0
      ? Math.round((trendValues.reduce((a, b) => a + b, 0) / trendValues.length) * 10) / 10
      : Math.round(validWeights[0] * 10) / 10;

    // Difference over selected window
    const firstVal = trendValues[0] ?? avg;
    const lastVal = trendValues[trendValues.length - 1] ?? avg;
    const diff = Math.round((lastVal - firstVal) * 10) / 10;

    const firstDate = chartData[0]?.date ? new Date(chartData[0].date) : new Date();
    const lastDate = chartData[chartData.length - 1]?.date ? new Date(chartData[chartData.length - 1].date) : new Date();
    const dateRangeStr = `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const isSameYear = firstDate.getFullYear() === lastDate.getFullYear();
    const isCurrentYear = lastDate.getFullYear() === new Date().getFullYear();
    const compactDateRangeStr = isSameYear && isCurrentYear
      ? `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : dateRangeStr;

    return {
      minWeight: Math.floor(min - padding),
      maxWeight: Math.ceil(max + padding),
      avgWeight: avg,
      diffKg: diff,
      dateRangeStr,
      compactDateRangeStr,
    };
  }, [chartData, targetWeightKg]);

  const hasData = chartData.some((d) => d.trendWeight !== null || d.rawWeight !== null);

  return (
    <>
      <div className={`w-full bg-card border border-border rounded-3xl p-3.5 sm:p-5 shadow-sm flex flex-col justify-start gap-3 ${className}`}>
        {/* ROW 1: Card Title & Insights & Data Action Button */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate">Weight Trend</h3>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/30 shrink-0">
                  Smoothed Signal
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground/90 truncate sm:whitespace-normal">
                Filtered thermodynamic trend vs raw scale volatility.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInsightsOpen(true)}
            className="rounded-xl sm:rounded-2xl gap-1.5 text-xs font-semibold h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 border-border/80 hover:bg-muted/80 shadow-2xs shrink-0 flex items-center justify-center"
            title="Open Weight Insights & Data"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline font-medium">Insights &amp; Data</span>
          </Button>
        </div>

        {/* ROW 2: MacroFactor KPIs (Average, Difference, Window) */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          <div className="flex items-baseline gap-4 sm:gap-6">
            {/* Average KPI */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Average
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-mono">
                  {avgWeight}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
                  kg
                </span>
              </div>
            </div>

            {/* Difference KPI */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Difference
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl sm:text-2xl font-black tracking-tight font-mono ${diffKg <= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {diffKg > 0 ? `+${diffKg}` : diffKg}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Active Date Window Subtitle */}
          <div className="text-right shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
              Window
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-300 font-mono tracking-tight">
              <span className="sm:hidden">{compactDateRangeStr}</span>
              <span className="hidden sm:inline">{dateRangeStr}</span>
            </span>
          </div>
        </div>

        {/* ROW 3: Dual Curve Chart Canvas (Scale Weight vs Trend Weight) */}
        {!hasData ? (
          <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border space-y-2 my-auto">
            <p className="text-xs font-medium text-foreground">
              Calibrating Weight Trend
            </p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Log your morning scale readings to activate Holt exponential smoothing and separate true fat loss from fluid fluctuations.
            </p>
          </div>
        ) : (
          <div className="w-full h-[185px] sm:h-[210px]">
            <ChartContainer 
              config={chartConfig} 
              className="w-full h-[185px] sm:h-[210px] aspect-auto [&_.recharts-wrapper]:[transform:translateZ(0)] [&_.recharts-wrapper]:will-change-transform [&_.recharts-surface]:will-change-transform [&_.recharts-curve]:will-change-transform [&_.recharts-curve]:transition-all [&_.recharts-curve]:duration-500 [&_path]:will-change-transform"
            >
              <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 0, left: -8, bottom: 0 }}
              >
                {/* Horizontal Dashed Gridlines with clear contrast */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255, 255, 255, 0.12)"
                />

                {/* X-Axis Date Ticks */}
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  minTickGap={selectedDays <= 7 ? 14 : selectedDays <= 14 ? 18 : 26}
                />

                {/* Y-Axis Right-Aligned */}
                <YAxis
                  orientation="right"
                  domain={[minWeight, maxWeight]}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  tickMargin={6}
                  tickCount={4}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  tickFormatter={(val) => {
                    const num = Number(val);
                    return Number.isInteger(num) ? `${num}` : num.toFixed(1);
                  }}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      className="bg-card/95 border-border shadow-xl backdrop-blur-md"
                      labelFormatter={(value, payload) => {
                        const item = payload?.[0]?.payload;
                        return item?.date || value;
                      }}
                      formatter={(val, name) => {
                        const label =
                          name === 'rawWeight'
                            ? 'Scale Weight'
                            : name === 'trendWeight'
                            ? 'Trend Weight'
                            : name;
                        return (
                          <div className="flex items-center justify-between gap-3 w-full">
                            <span className="text-muted-foreground text-xs">{label}:</span>
                            <span className="font-bold text-foreground font-mono text-xs">
                              {val !== null ? `${val} kg` : '—'}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />

                {/* Goal Reference Line */}
                {targetWeightKg && targetWeightKg >= minWeight && targetWeightKg <= maxWeight && (
                  <ReferenceLine
                    y={targetWeightKg}
                    stroke="#3b82f6"
                    strokeDasharray="4 4"
                    strokeWidth={1.75}
                    label={{
                      value: `Goal: ${targetWeightKg}kg`,
                      position: 'insideTopLeft',
                      fill: '#60a5fa',
                      fontSize: 11,
                      offset: 8,
                    }}
                  />
                )}

                {/* Raw Scale Weight: Reactive Violet Curve with Dynamic Density-Aware Dots (No White Halo) */}
                <Line
                  type="linear"
                  dataKey="rawWeight"
                  name="rawWeight"
                  stroke="#8b5cf6"
                  strokeWidth={selectedDays >= 90 ? 1.5 : 2}
                  connectNulls={false}
                  dot={
                    selectedDays <= 7
                      ? {
                          r: 3.5,
                          fill: '#8b5cf6',
                          stroke: 'hsl(var(--card))',
                          strokeWidth: 1.5,
                        }
                      : selectedDays <= 14
                      ? {
                          r: 2.5,
                          fill: '#8b5cf6',
                          stroke: 'hsl(var(--card))',
                          strokeWidth: 1,
                        }
                      : selectedDays <= 30
                      ? {
                          r: 2,
                          fill: '#8b5cf6',
                          stroke: 'hsl(var(--card))',
                          strokeWidth: 1,
                        }
                      : false
                  }
                  activeDot={{
                    r: 6,
                    fill: '#a855f7',
                    stroke: 'hsl(var(--card))',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={true}
                  animationDuration={650}
                  animationEasing="spring"
                />

                {/* Smoothed Trend Weight: Thick Glowing Lavender Curve */}
                <Line
                  type="monotone"
                  dataKey="trendWeight"
                  name="trendWeight"
                  stroke="#c4b5fd"
                  strokeWidth={3}
                  connectNulls={true}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: '#c4b5fd',
                    stroke: 'hsl(var(--card))',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={true}
                  animationDuration={650}
                  animationEasing="spring"
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        )}

        {/* ROW 4: Range Pill Selector Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 p-1 rounded-full border border-border/80">
            {TIME_RANGES.map(({ label, days }) => {
              const isActive = selectedDays === days;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onDaysChange?.(days)}
                  className={`px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-bold rounded-full transition-all focus:outline-hidden focus-visible:ring-0 ${
                    isActive
                      ? 'bg-foreground text-background shadow-xs'
                      : 'text-slate-400 hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            <span className="hidden sm:inline">Daily Scale &amp; Smoothed Midpoint</span>
            <span className="sm:hidden text-slate-400">Scale &amp; Midpoint</span>
          </span>
        </div>

        {/* ROW 5: MacroFactor Legend: Scale Weight, Trend Weight, Goal Target */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-slate-300 dark:text-slate-400">
          <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
            {/* Scale Weight Swatch */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="flex items-center">
                <span className="w-1.5 sm:w-2 h-0.5 bg-[#8b5cf6]" />
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#8b5cf6]" />
                <span className="w-1.5 sm:w-2 h-0.5 bg-[#8b5cf6]" />
              </span>
              <span className="font-semibold text-foreground text-[10px] sm:text-[11px]">Scale Weight</span>
            </div>

            {/* Trend Weight Swatch */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 sm:w-3.5 h-1 rounded-full bg-[#c4b5fd] inline-block shrink-0 shadow-[0_0_8px_rgba(196,181,253,0.5)]" />
              <span className="font-semibold text-foreground text-[10px] sm:text-[11px]">Trend Weight</span>
            </div>

            {/* Goal Target Swatch */}
            {targetWeightKg && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-3 sm:w-3.5 h-0.5 border-t border-dashed border-[#3b82f6] inline-block shrink-0" />
                <span className="text-blue-400 font-medium text-[10px] sm:text-[11px]">Goal ({targetWeightKg}kg)</span>
              </div>
            )}
          </div>

          <span className="text-[10px] text-slate-400 italic shrink-0 whitespace-nowrap">
            <span className="sm:hidden">Holt Smoothing</span>
            <span className="hidden sm:inline">Double Exponential Smoothing (Holt)</span>
          </span>
        </div>
      </div>

      {/* Slide-Over Insights & Data Sheet */}
      <WeightInsightsSheet
        open={isInsightsOpen}
        onOpenChange={setIsInsightsOpen}
        data={data}
        targetWeightKg={targetWeightKg}
        onRefresh={onRefresh}
      />
    </>
  );
};
