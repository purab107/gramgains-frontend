'use client';

import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
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
import { AnalyticsTrendsResponse } from '@/services/api';
import { Activity, Flame } from 'lucide-react';

interface MetabolicTdeeHistoryChartProps {
  trends: AnalyticsTrendsResponse | null;
  baselineTdee?: number;
  currentObservedTdee?: number | null;
  selectedDays?: number;
  onDaysChange?: (days: number) => void;
  className?: string;
}

const chartConfig = {
  effectiveTdee: {
    label: 'Effective TDEE',
    color: 'hsl(var(--primary))',
  },
  observedTdee: {
    label: 'Observed Real TDEE',
    color: 'hsl(var(--chart-2, 38 92% 50%))',
  },
  formulaBaseline: {
    label: 'Formula Baseline',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig;

export const MetabolicTdeeHistoryChart: React.FC<MetabolicTdeeHistoryChartProps> = ({
  trends,
  baselineTdee = 2400,
  currentObservedTdee,
  selectedDays = 30,
  onDaysChange,
  className = '',
}) => {
  const series = trends?.series || [];

  // Filter or transform time-series data for chart
  const chartData = useMemo(() => {
    return series.map((item) => {
      const dateObj = new Date(item.date);
      const displayDate = isNaN(dateObj.getTime())
        ? item.date
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        date: item.date,
        displayDate,
        effectiveTdee: item.effectiveTdee ? Math.round(item.effectiveTdee) : null,
        observedTdee: item.observedTdee ? Math.round(item.observedTdee) : null,
        caloriesConsumed: item.caloriesConsumed ? Math.round(item.caloriesConsumed) : null,
      };
    });
  }, [series]);

  // Compute domain bounds for Y-Axis
  const { minTdee, maxTdee, avgEffective, deltaVsBaseline } = useMemo(() => {
    const validValues: number[] = [];
    if (baselineTdee > 0) validValues.push(baselineTdee);

    chartData.forEach((d) => {
      if (typeof d.effectiveTdee === 'number' && d.effectiveTdee > 0) {
        validValues.push(d.effectiveTdee);
      }
      if (typeof d.observedTdee === 'number' && d.observedTdee > 0) {
        validValues.push(d.observedTdee);
      }
    });

    if (validValues.length === 0) {
      return { minTdee: 1800, maxTdee: 2800, avgEffective: baselineTdee, deltaVsBaseline: 0 };
    }

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    const effValues = chartData
      .map((d) => d.effectiveTdee)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const avg = effValues.length > 0
      ? Math.round(effValues.reduce((a, b) => a + b, 0) / effValues.length)
      : baselineTdee;

    const delta = avg - baselineTdee;

    return {
      minTdee: Math.max(800, Math.floor((min - 100) / 50) * 50),
      maxTdee: Math.ceil((max + 100) / 50) * 50,
      avgEffective: avg,
      deltaVsBaseline: delta,
    };
  }, [chartData, baselineTdee]);

  const hasData = chartData.some((d) => d.effectiveTdee !== null);

  return (
    <div className={`bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 ${className}`}>
      {/* Header with Title and Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Expenditure Trend</h3>
            <p className="text-xs text-muted-foreground">
              Real-world metabolic adaptation tracked over time.
            </p>
          </div>
        </div>

        {/* Time-Range Buttons & Stat Pill */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {hasData && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/40 border border-border text-[11px] font-medium text-muted-foreground">
              <span>Avg: <strong className="text-foreground">{avgEffective} kcal</strong></span>
              <span className="text-muted-foreground/60">•</span>
              <span className={deltaVsBaseline >= 0 ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
                {deltaVsBaseline >= 0 ? `+${deltaVsBaseline}` : deltaVsBaseline} vs formula
              </span>
            </div>
          )}

          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => onDaysChange?.(days)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedDays === days
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {!hasData ? (
        <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border space-y-2 my-auto">
          <Flame className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <p className="text-xs font-medium text-foreground">
            Calibrating Expenditure History
          </p>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Log your daily meals and morning scale readings to populate your dynamic thermodynamic curve.
          </p>
        </div>
      ) : (
        <div className="w-full flex-1 min-h-[190px]">
          <ChartContainer config={chartConfig} className="w-full h-52 aspect-auto">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border) / 0.5)"
              />
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                minTickGap={20}
              />
              <YAxis
                domain={[minTdee, maxTdee]}
                tickLine={false}
                axisLine={false}
                tickMargin={6}
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
                          ? 'Effective TDEE'
                          : name === 'observedTdee'
                          ? 'Observed Real TDEE'
                          : name;
                      return (
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span className="text-muted-foreground text-xs">{label}:</span>
                          <span className="font-bold text-foreground font-mono text-xs">
                            {val} kcal
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />

              {/* Formula Baseline Prior Reference Line */}
              {baselineTdee > 0 && (
                <ReferenceLine
                  y={Math.round(baselineTdee)}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Formula: ${Math.round(baselineTdee)}`,
                    position: 'insideTopLeft',
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 10,
                    offset: 8,
                  }}
                />
              )}

              {/* Observed Real TDEE Dots */}
              <Line
                type="monotone"
                dataKey="observedTdee"
                name="observedTdee"
                stroke="hsl(var(--chart-2, 38 92% 50%))"
                strokeWidth={1}
                strokeDasharray="2 3"
                strokeOpacity={0.6}
                connectNulls={false}
                dot={{
                  r: 3.5,
                  fill: 'hsl(var(--chart-2, 38 92% 50%))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 1.5,
                }}
                activeDot={{
                  r: 6,
                  fill: 'hsl(var(--chart-2, 38 92% 50%))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                }}
              />

              {/* Continuous Effective Blended TDEE Curve */}
              <Line
                type="monotone"
                dataKey="effectiveTdee"
                name="effectiveTdee"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                connectNulls={true}
                dot={{
                  r: 3.5,
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 1.5,
                }}
                activeDot={{
                  r: 6,
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/40">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block shrink-0" />
            <span className="font-medium text-foreground">Effective TDEE</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0" />
            <span className="font-medium text-foreground">Observed TDEE</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-t border-dashed border-muted-foreground inline-block shrink-0" />
            <span className="text-muted-foreground">Formula</span>
          </div>
        </div>

        <span className="text-[10px] text-muted-foreground hidden sm:inline italic">
          Empirical adaptation from real-world data
        </span>
      </div>
    </div>
  );
};
