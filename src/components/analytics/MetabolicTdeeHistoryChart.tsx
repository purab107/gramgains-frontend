'use client';

import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AnalyticsTrendsResponse } from '@/services/api';
import { Activity, SlidersHorizontal, Flame } from 'lucide-react';
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

    // Locally slice series to selectedDays window for instantaneous, buttery 60fps morphing
    const targetSlice =
      selectedDays && series.length > selectedDays
        ? series.slice(-selectedDays)
        : series;

    return targetSlice.map((item) => {
      const dateObj = new Date(item.date);
      const displayDate = isNaN(dateObj.getTime())
        ? item.date
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const eff = item.effectiveTdee ? Math.round(item.effectiveTdee) : null;

      return {
        date: item.date,
        displayDate,
        effectiveTdee: eff,
        fluxRange: eff !== null ? [eff - fluxDelta, eff + fluxDelta] : null,
        fluxMin: eff !== null ? eff - fluxDelta : null,
        fluxMax: eff !== null ? eff + fluxDelta : null,
        observedTdee: item.observedTdee ? Math.round(item.observedTdee) : null,
        caloriesConsumed: item.caloriesConsumed ? Math.round(item.caloriesConsumed) : null,
      };
    });
  }, [series, confidenceLevel, selectedDays]);

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
      minTdee: Math.max(800, Math.floor((min - 60) / 100) * 100),
      maxTdee: Math.ceil((max + 60) / 100) * 100,
      avgEffective: avg,
      diffKcal: diff,
      dateRangeStr,
    };
  }, [chartData, baselineTdee]);

  const hasData = chartData.some((d) => d.effectiveTdee !== null);

  return (
    <>
      <div className={`bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-3.5 ${className}`}>
        {/* ROW 1: Card Title & Insights Action Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 text-[#ff6b4a] flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Expenditure Trend</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-orange-500/10 text-[#ff6b4a] border-[#ff6b4a]/30">
                  Adaptive TDEE
                </span>
              </div>
              <p className="text-xs text-muted-foreground/90">
                Thermodynamic burn solved from intake and weight velocity.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInsightsOpen(true)}
            className="rounded-2xl gap-1.5 text-xs font-semibold h-9 px-3 border-border/80 hover:bg-muted/80 shadow-2xs shrink-0"
            title="Open Expenditure Insights & Data"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff6b4a]" />
            <span className="hidden sm:inline font-medium">Insights &amp; Data</span>
          </Button>
        </div>

        {/* ROW 2: Compact MacroFactor KPIs (Average, Difference, Date Range) */}
        <div className="flex flex-wrap items-end justify-between gap-3 pt-1 border-t border-border/40">
          <div className="flex items-baseline gap-6">
            {/* Average KPI */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Average
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono">
                  {avgEffective}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  kcal
                </span>
              </div>
            </div>

            {/* Difference KPI */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Difference
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${diffKcal >= 0 ? 'text-emerald-400' : 'text-[#ff6b4a]'}`}>
                  {diffKcal > 0 ? `+${diffKcal}` : diffKcal}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  kcal
                </span>
              </div>
            </div>
          </div>

          {/* Date Range Subtitle */}
          <span className="text-xs font-medium text-slate-300 dark:text-slate-400 pb-1">
            {dateRangeStr}
          </span>
        </div>

        {/* ROW 3: MacroFactor Chart Canvas (Optimized for Dark Theme Visibility) */}
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
          <div className="w-full flex-1 min-h-[260px] pt-1">
            <ChartContainer 
              config={chartConfig} 
              className="w-full h-[260px] sm:h-[280px] aspect-auto [&_.recharts-curve]:transition-all [&_.recharts-curve]:duration-500 [&_.recharts-curve]:ease-in-out [&_path]:will-change-transform"
            >
              <ComposedChart
                data={chartData}
                margin={{ top: 12, right: 6, left: -20, bottom: 4 }}
              >
                {/* Horizontal Dashed Gridlines with clear contrast */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255, 255, 255, 0.12)"
                />

                {/* X-Axis Date Ticks: High visibility slate-300 */}
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  minTickGap={20}
                />

                {/* Y-Axis Right-Aligned: High visibility slate-300 */}
                <YAxis
                  orientation="right"
                  domain={[minTdee, maxTdee]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
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

                {/* Shaded Flux Range Area: 60fps Morphing Animation */}
                <Area
                  type="monotone"
                  dataKey="fluxRange"
                  stroke="rgba(255, 107, 74, 0.35)"
                  strokeWidth={1.5}
                  fill="rgba(255, 107, 74, 0.20)"
                  isAnimationActive={true}
                  animationDuration={600}
                  animationEasing="ease-in-out"
                />

                {/* Smooth Coral Expenditure Line: 60fps Morphing Animation */}
                <Line
                  type="monotone"
                  dataKey="effectiveTdee"
                  name="effectiveTdee"
                  stroke="#ff6b4a"
                  strokeWidth={3.5}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={600}
                  animationEasing="ease-in-out"
                  activeDot={{
                    r: 7.5,
                    fill: '#ff6b4a',
                    stroke: '#ffffff',
                    strokeWidth: 2.5,
                  }}
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
            Daily TDEE
          </span>
        </div>

        {/* ROW 5: MacroFactor Legend: Flux Range, Updating, Holding */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/40 text-xs text-slate-300 dark:text-slate-400">
          <div className="flex items-center gap-4">
            {/* Flux Range Icon */}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[rgba(255,107,74,0.3)] border border-[#ff6b4a] inline-block shrink-0" />
              <span className="font-semibold text-foreground">Flux Range</span>
            </div>

            {/* Updating Icon */}
            <div className="flex items-center gap-1.5">
              <span className="flex items-center">
                <span className="w-2.5 h-0.5 bg-[#ff6b4a]" />
                <span className="w-2 h-2 rounded-full border-2 border-[#ff6b4a] bg-background" />
                <span className="w-2.5 h-0.5 bg-[#ff6b4a]" />
              </span>
              <span className="font-semibold text-foreground">Updating</span>
            </div>

            {/* Holding Icon */}
            <div className="flex items-center gap-1.5">
              <span className="flex items-center">
                <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400" />
                <span className="w-2 h-2 border border-slate-400 bg-background" />
                <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400" />
              </span>
              <span className="font-medium text-slate-400">Holding</span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 italic">
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
