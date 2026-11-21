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
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'All', days: 365 },
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
  const { minWeight, maxWeight, avgWeight, diffKg, dateRangeStr } = useMemo(() => {
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
      };
    }

    const min = Math.min(...validWeights);
    const max = Math.max(...validWeights);
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

    return {
      minWeight: Math.floor(min - 1),
      maxWeight: Math.ceil(max + 1),
      avgWeight: avg,
      diffKg: diff,
      dateRangeStr,
    };
  }, [chartData, targetWeightKg]);

  const hasData = chartData.some((d) => d.trendWeight !== null || d.rawWeight !== null);

  return (
    <>
      <div className={`w-full bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-3.5 ${className}`}>
        {/* ROW 1: Card Title & Insights & Data Action Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Weight Trend</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/30">
                  Smoothed Signal
                </span>
              </div>
              <p className="text-xs text-muted-foreground/90">
                Filtered thermodynamic trend vs raw scale volatility.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInsightsOpen(true)}
            className="rounded-2xl gap-1.5 text-xs font-semibold h-9 px-3 border-border/80 hover:bg-muted/80 shadow-2xs shrink-0"
            title="Open Weight Insights & Data"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline font-medium">Insights &amp; Data</span>
          </Button>
        </div>

        {/* ROW 2: MacroFactor KPIs (Average, Difference, Date Range) */}
        <div className="flex flex-wrap items-end justify-between gap-3 pt-1 border-t border-border/40">
          <div className="flex items-baseline gap-6">
            {/* Average KPI */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Average
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono">
                  {avgWeight}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  kg
                </span>
              </div>
            </div>

            {/* Difference KPI */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Difference
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${diffKg <= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {diffKg > 0 ? `+${diffKg}` : diffKg}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Date Range Subtitle */}
          <span className="text-xs font-medium text-slate-300 dark:text-slate-400 pb-1">
            {dateRangeStr}
          </span>
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
          <div className="w-full flex-1 min-h-[220px] pt-1">
            <ChartContainer 
              config={chartConfig} 
              className="w-full h-[220px] aspect-auto [&_.recharts-curve]:transition-all [&_.recharts-curve]:duration-500 [&_.recharts-curve]:ease-in-out [&_path]:will-change-transform"
            >
              <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 6, left: -20, bottom: 2 }}
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
                  tickMargin={6}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  minTickGap={24}
                />

                {/* Y-Axis Right-Aligned */}
                <YAxis
                  orientation="right"
                  domain={[minWeight, maxWeight]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  tickFormatter={(val) => `${val}`}
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
                    strokeWidth={1.5}
                    label={{
                      value: `Goal: ${targetWeightKg}kg`,
                      position: 'insideTopLeft',
                      fill: '#60a5fa',
                      fontSize: 10,
                      offset: 8,
                    }}
                  />
                )}

                {/* Raw Scale Weight: Reactive Violet Curve with Dots */}
                <Line
                  type="linear"
                  dataKey="rawWeight"
                  name="rawWeight"
                  stroke="#8b5cf6"
                  strokeWidth={1.75}
                  connectNulls={false}
                  dot={{
                    r: 2.5,
                    fill: '#8b5cf6',
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 5,
                    fill: '#8b5cf6',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={true}
                  animationDuration={600}
                  animationEasing="ease-in-out"
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
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={true}
                  animationDuration={600}
                  animationEasing="ease-in-out"
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        )}

        {/* ROW 4: Range Pill Selector Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/80">
            {TIME_RANGES.map(({ label, days }) => {
              const isActive = selectedDays === days;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onDaysChange?.(days)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
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

          <span className="text-xs font-medium text-slate-400 hidden sm:inline">
            Daily Scale &amp; Smoothed Midpoint
          </span>
        </div>

        {/* ROW 5: MacroFactor Legend: Scale Weight, Trend Weight, Goal Target */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/40 text-xs text-slate-300 dark:text-slate-400">
          <div className="flex items-center gap-4">
            {/* Scale Weight Swatch */}
            <div className="flex items-center gap-1.5">
              <span className="flex items-center">
                <span className="w-2.5 h-0.5 bg-[#8b5cf6]" />
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                <span className="w-2.5 h-0.5 bg-[#8b5cf6]" />
              </span>
              <span className="font-semibold text-foreground">Scale Weight</span>
            </div>

            {/* Trend Weight Swatch */}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded-full bg-[#c4b5fd] inline-block shrink-0 shadow-[0_0_8px_rgba(196,181,253,0.5)]" />
              <span className="font-semibold text-foreground">Trend Weight</span>
            </div>

            {/* Goal Target Swatch */}
            {targetWeightKg && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t border-dashed border-[#3b82f6] inline-block shrink-0" />
                <span className="text-blue-400 font-medium">Goal ({targetWeightKg}kg)</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-slate-400 italic">
            Double Exponential Smoothing (Holt)
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
