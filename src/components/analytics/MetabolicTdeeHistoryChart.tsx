'use client';

import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  Area,
  ComposedChart,
  ReferenceLine,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AnalyticsTrendsResponse } from '@/services/api';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenditureInsightsSheet } from './ExpenditureInsightsSheet';

interface MetabolicTdeeHistoryChartProps {
  trends: AnalyticsTrendsResponse | null;
  baselineTdee?: number;
  currentObservedTdee?: number | null;
  confidenceLevel?: string;
  confidenceScore?: number;
  selectedDays?: number;
  onDaysChange?: (days: number) => void;
  className?: string;
}

const chartConfig = {
  effectiveTdee: {
    label: 'Expenditure',
    color: '#ff6b4a',
  },
  fluxRange: {
    label: 'Flux Range',
    color: 'rgba(255, 107, 74, 0.18)',
  },
} satisfies ChartConfig;

const TIME_RANGES = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'All', days: 365 },
];

export const MetabolicTdeeHistoryChart: React.FC<MetabolicTdeeHistoryChartProps> = ({
  trends,
  baselineTdee = 2228,
  currentObservedTdee,
  confidenceLevel = 'HIGH',
  confidenceScore = 0.93,
  selectedDays = 30,
  onDaysChange,
  className = '',
}) => {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const series = trends?.series || [];

  // Filter or transform time-series data for chart
  const chartData = useMemo(() => {
    // Flux delta based on confidence
    const fluxDelta = confidenceLevel === 'HIGH' ? 25 : confidenceLevel === 'MODERATE' ? 40 : 60;

    return series.map((item) => {
      const dateObj = new Date(item.date);
      const displayDate = isNaN(dateObj.getTime())
        ? item.date
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const eff = item.effectiveTdee ? Math.round(item.effectiveTdee) : null;

      return {
        date: item.date,
        displayDate,
        effectiveTdee: eff,
        // Range area for Recharts [low, high]
        fluxRange: eff !== null ? [eff - fluxDelta, eff + fluxDelta] : null,
        fluxMin: eff !== null ? eff - fluxDelta : null,
        fluxMax: eff !== null ? eff + fluxDelta : null,
        observedTdee: item.observedTdee ? Math.round(item.observedTdee) : null,
        caloriesConsumed: item.caloriesConsumed ? Math.round(item.caloriesConsumed) : null,
      };
    });
  }, [series, confidenceLevel]);

  // Compute domain bounds for Y-Axis and header KPIs
  const { minTdee, maxTdee, avgEffective, diffKcal, dateRangeStr } = useMemo(() => {
    const validValues: number[] = [];

    chartData.forEach((d) => {
      if (typeof d.effectiveTdee === 'number' && d.effectiveTdee > 0) {
        validValues.push(d.effectiveTdee);
        if (d.fluxMin) validValues.push(d.fluxMin);
        if (d.fluxMax) validValues.push(d.fluxMax);
      }
    });

    if (validValues.length === 0) {
      return {
        minTdee: 1800,
        maxTdee: 2400,
        avgEffective: Math.round(baselineTdee),
        diffKcal: 0,
        dateRangeStr: 'Calibrating data',
      };
    }

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    const effValues = chartData
      .map((d) => d.effectiveTdee)
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const avg = effValues.length > 0
      ? Math.round(effValues.reduce((a, b) => a + b, 0) / effValues.length)
      : Math.round(baselineTdee);

    // Difference over the selected window (latest - earliest)
    const firstVal = effValues[0] ?? avg;
    const lastVal = effValues[effValues.length - 1] ?? avg;
    const diff = lastVal - firstVal;

    // Date range string: e.g. "Oct 22, 2026 – Nov 20, 2026"
    const firstDate = chartData[0]?.date ? new Date(chartData[0].date) : new Date();
    const lastDate = chartData[chartData.length - 1]?.date ? new Date(chartData[chartData.length - 1].date) : new Date();
    const dateRangeStr = `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return {
      minTdee: Math.max(800, Math.floor((min - 80) / 100) * 100),
      maxTdee: Math.ceil((max + 80) / 100) * 100,
      avgEffective: avg,
      diffKcal: diff,
      dateRangeStr,
    };
  }, [chartData, baselineTdee]);

  const hasData = chartData.some((d) => d.effectiveTdee !== null);

  return (
    <>
      <div className={`bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 ${className}`}>
        {/* MacroFactor Header: Average, Difference & Insights Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-baseline gap-6">
              {/* Average KPI */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                  Average
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono">
                    {avgEffective}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    kcal
                  </span>
                </div>
              </div>

              {/* Difference KPI */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                  Difference
                </span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${diffKcal >= 0 ? 'text-emerald-500' : 'text-[#ff6b4a]'}`}>
                    {diffKcal > 0 ? `+${diffKcal}` : diffKcal}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Date Range Subtitle */}
            <p className="text-[11px] text-muted-foreground">
              {dateRangeStr}
            </p>
          </div>

          {/* Top Right: MacroFactor Insights Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInsightsOpen(true)}
            className="rounded-2xl gap-1.5 text-xs font-semibold h-9 px-3 border-border hover:bg-muted/80 shadow-2xs"
            title="Open Expenditure Insights & Data"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff6b4a]" />
            <span className="hidden sm:inline">Insights &amp; Data</span>
          </Button>
        </div>

        {/* MacroFactor Chart Canvas (ComposedChart with Area Flux Range + Coral Smooth Line) */}
        {!hasData ? (
          <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border space-y-2 my-auto">
            <p className="text-xs font-medium text-foreground">
              Calibrating Expenditure History
            </p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Log your daily meals and morning scale readings to populate your dynamic thermodynamic curve.
            </p>
          </div>
        ) : (
          <div className="w-full flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart
                data={chartData}
                margin={{ top: 12, right: 0, left: -20, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border) / 0.4)"
                />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  minTickGap={28}
                />
                <YAxis
                  orientation="right"
                  domain={[minTdee, maxTdee]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(val) => `${val}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      className="bg-card border-border shadow-md"
                      labelFormatter={(value, payload) => {
                        const item = payload?.[0]?.payload;
                        return item?.date || value;
                      }}
                      formatter={(val, name) => {
                        const label =
                          name === 'effectiveTdee'
                            ? 'Expenditure'
                            : name === 'fluxRange'
                            ? 'Flux Range'
                            : name;
                        return (
                          <div className="flex items-center justify-between gap-3 w-full">
                            <span className="text-muted-foreground text-xs">{label}:</span>
                            <span className="font-bold text-foreground font-mono text-xs">
                              {Array.isArray(val) ? `${val[0]} – ${val[1]} kcal` : `${val} kcal`}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />

                {/* MacroFactor Flux Range Shaded Area */}
                <Area
                  type="monotone"
                  dataKey="fluxRange"
                  stroke="transparent"
                  fill="rgba(255, 107, 74, 0.16)"
                  isAnimationActive={false}
                />

                {/* MacroFactor Coral Smooth Line */}
                <Line
                  type="monotone"
                  dataKey="effectiveTdee"
                  name="effectiveTdee"
                  stroke="#ff6b4a"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: '#ff6b4a',
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 2,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* MacroFactor Time-Range Pill Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border">
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
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            Daily TDEE
          </span>
        </div>

        {/* MacroFactor Legend: Flux Range, Updating, Holding */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            {/* Flux Range Icon */}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[rgba(255,107,74,0.25)] border border-[rgba(255,107,74,0.4)] inline-block shrink-0" />
              <span className="font-medium text-foreground">Flux Range</span>
            </div>

            {/* Updating Icon */}
            <div className="flex items-center gap-1.5">
              <span className="flex items-center">
                <span className="w-2.5 h-0.5 bg-[#ff6b4a]" />
                <span className="w-2 h-2 rounded-full border border-[#ff6b4a] bg-background" />
                <span className="w-2.5 h-0.5 bg-[#ff6b4a]" />
              </span>
              <span className="font-medium text-foreground">Updating</span>
            </div>

            {/* Holding Icon */}
            <div className="flex items-center gap-1.5">
              <span className="flex items-center">
                <span className="w-2.5 h-0.5 border-t border-dashed border-muted-foreground" />
                <span className="w-2 h-2 border border-muted-foreground bg-background" />
                <span className="w-2.5 h-0.5 border-t border-dashed border-muted-foreground" />
              </span>
              <span className="text-muted-foreground">Holding</span>
            </div>
          </div>

          <span className="text-[10px] text-muted-foreground italic">
            Thermodynamically smoothed
          </span>
        </div>
      </div>

      {/* Slide-over Insights & Data Sheet */}
      <ExpenditureInsightsSheet
        open={isInsightsOpen}
        onOpenChange={setIsInsightsOpen}
        trends={trends}
        currentExpenditure={avgEffective}
        baselineTdee={baselineTdee}
        confidenceLevel={confidenceLevel}
        confidenceScore={confidenceScore}
      />
    </>
  );
};
