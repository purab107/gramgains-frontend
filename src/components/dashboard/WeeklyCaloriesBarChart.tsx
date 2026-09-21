'use client';

import React, { useEffect, useState } from 'react';
import { ApiService, HeatmapItem } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Flame, Calendar, CheckCircle2 } from 'lucide-react';

interface WeeklyCaloriesBarChartProps {
  initialDays?: number;
}

interface ChartDayData {
  date: string;
  dayName: string;
  displayDate: string;
  calories: number;
  meals: number;
  target: number;
  isToday: boolean;
  isFuture: boolean;
}

const chartConfig = {
  calories: {
    label: 'Calories',
    color: '#169b55',
  },
} satisfies ChartConfig;

export const WeeklyCaloriesBarChart: React.FC<WeeklyCaloriesBarChartProps> = ({
  initialDays = 7,
}) => {
  const [data, setData] = useState<ChartDayData[]>([]);
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadWeeklyData() {
      try {
        setLoading(true);
        const res = await ApiService.getHeatmap(initialDays);
        setTargetCalories(res.targetCalories || 2000);

        const todayStr = new Date().toISOString().split('T')[0];

        const formatted: ChartDayData[] = (res.heatmap || []).map((item: HeatmapItem) => {
          // Parse date in YYYY-MM-DD
          const [year, month, day] = item.date.split('-').map(Number);
          const d = new Date(year, month - 1, day);

          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          const displayDate = d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return {
            date: item.date,
            dayName,
            displayDate,
            calories: item.totalCalories || 0,
            meals: item.count || 0,
            target: res.targetCalories || 2000,
            isToday: item.date === todayStr,
            isFuture: !!item.isFuture,
          };
        });

        setData(formatted);
      } catch (err) {
        console.error('Failed to load 7-day calorie data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWeeklyData();
  }, [initialDays]);

  // Derived stats
  const loggedDays = data.filter((d) => !d.isFuture && d.calories > 0);
  const totalCalories = loggedDays.reduce((acc, d) => acc + d.calories, 0);
  const dailyAverage = loggedDays.length > 0 ? Math.round(totalCalories / loggedDays.length) : 0;
  const onTargetDays = data.filter(
    (d) => !d.isFuture && targetCalories > 0 && d.calories >= targetCalories * 0.9
  ).length;

  const dateRangeString =
    data.length > 0
      ? `${data[0].displayDate} – ${data[data.length - 1].displayDate}`
      : 'Last 7 Days';

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-3xl bg-card overflow-hidden">
      <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-accent flex items-center justify-center text-primary shrink-0 border border-border">
              <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base sm:text-lg tracking-tight leading-tight">
                7-Day Calorie Intake
              </h3>
              <span className="text-xs text-muted-foreground font-medium">
                {dateRangeString}
              </span>
            </div>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium flex items-center gap-1.5 border border-border/50">
              <span className="text-muted-foreground/80">Avg:</span>
              <span className="font-bold text-foreground">
                {dailyAverage.toLocaleString()} kcal
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium flex items-center gap-1 border border-border/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {onTargetDays}/{data.length} Goal Hit
              </span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="w-full pt-2">
          {loading ? (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-xs animate-pulse">
              Loading 7-day intake graph...
            </div>
          ) : data.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-xs">
              No calorie data logged for this period.
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[240px] w-full aspect-auto">
              <BarChart
                data={data}
                margin={{ top: 18, right: 8, left: -16, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border"
                />

                <XAxis
                  dataKey="dayName"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[11px] font-medium text-muted-foreground"
                  tick={({ x, y, payload }) => {
                    const item = data.find((d) => d.dayName === payload.value);
                    const isToday = item?.isToday;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={12}
                          textAnchor="middle"
                          className={`text-[11px] font-semibold ${
                            isToday
                              ? 'fill-primary font-bold'
                              : 'fill-muted-foreground'
                          }`}
                        >
                          {payload.value}
                        </text>
                        {item && (
                          <text
                            x={0}
                            y={0}
                            dy={24}
                            textAnchor="middle"
                            className={`text-[10px] font-medium ${
                              isToday
                                ? 'fill-primary'
                                : 'fill-muted-foreground/70'
                            }`}
                          >
                            {item.date.split('-')[2]}
                          </text>
                        )}
                      </g>
                    );
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  domain={[0, (dataMax: number) => Math.max(targetCalories * 1.15, dataMax * 1.15)]}
                  tickFormatter={(val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
                  className="text-[10px] font-medium text-slate-400"
                />

                {/* Daily Goal Reference Line */}
                {targetCalories > 0 && (
                  <ReferenceLine
                    y={targetCalories}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Goal ${targetCalories.toLocaleString()}`,
                      fill: '#10b981',
                      position: 'top',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                )}

                {/* Custom Tooltip */}
                <ChartTooltip
                  cursor={{ fill: 'rgba(15, 134, 81, 0.05)', radius: 8 }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload as ChartDayData;
                    const pctOfGoal =
                      item.target > 0
                        ? Math.round((item.calories / item.target) * 100)
                        : 0;

                    return (
                      <div className="bg-slate-900 text-white px-3 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[170px]">
                        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
                          <span className="font-semibold text-slate-200">
                            {item.displayDate} ({item.dayName})
                          </span>
                          {item.isToday && (
                            <span className="px-1.5 py-0.5 rounded bg-[#169b55]/30 text-[#4cd593] text-[10px] font-bold">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="pt-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Consumed:</span>
                            <span className="font-bold text-white">
                              {item.calories.toLocaleString()} kcal
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Target:</span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              {item.target.toLocaleString()} kcal
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-slate-400">Goal %:</span>
                            <span
                              className={`font-semibold ${
                                pctOfGoal >= 90 && pctOfGoal <= 110
                                  ? 'text-[#4cd593]'
                                  : pctOfGoal > 110
                                  ? 'text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              {pctOfGoal}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-slate-800/80">
                            <span>Meals logged:</span>
                            <span className="font-medium text-slate-300">
                              {item.meals} {item.meals === 1 ? 'meal' : 'meals'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />

                {/* Bars with dynamic fill */}
                <Bar
                  dataKey="calories"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={38}
                  animationDuration={800}
                >
                  {data.map((entry, index) => {
                    const isMet = targetCalories > 0 && entry.calories >= targetCalories * 0.9;
                    const isZero = entry.calories === 0;

                    let fillColor = '#169b55'; // Vibrant green
                    if (isZero) fillColor = '#e2e8f0'; // Light slate when no meals
                    else if (entry.isToday) fillColor = '#0f7646'; // Slightly deeper focus green for today
                    else if (isMet) fillColor = '#169b55';
                    else fillColor = '#48bb78'; // Soft green

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillColor}
                        className="transition-colors duration-200 hover:opacity-85"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </div>

        {/* Footer info pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#169b55] inline-block" />
            <span>Calories Consumed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 border-b-2 border-dashed border-[#10b981] inline-block" />
            <span>Daily Goal Line</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
