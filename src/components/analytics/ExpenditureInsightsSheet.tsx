'use client';

import React, { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { AnalyticsTrendsResponse } from '@/services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Info,
  SlidersHorizontal 
} from 'lucide-react';

export interface ExpenditureInsightsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trends: AnalyticsTrendsResponse | null;
  currentExpenditure?: number;
  baselineTdee?: number;
  confidenceLevel?: string;
  confidenceScore?: number;
}

// Helper to render a mini SVG sparkline
const Sparkline: React.FC<{ points: number[]; isIncrease: boolean }> = ({ points, isIncrease }) => {
  if (points.length < 2) {
    return <div className="w-16 h-5 bg-muted/30 rounded" />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 64;
  const height = 20;

  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${coords.join(' L ')}`;
  const areaD = `M ${coords[0]} L ${coords.join(' L ')} L ${width},${height} L 0,${height} Z`;
  const strokeColor = isIncrease ? '#ff6b4a' : '#ff6b4a';
  const fillColor = isIncrease ? 'rgba(255, 107, 74, 0.15)' : 'rgba(255, 107, 74, 0.15)';

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <path d={areaD} fill={fillColor} />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const ExpenditureInsightsSheet: React.FC<ExpenditureInsightsSheetProps> = ({
  open,
  onOpenChange,
  trends,
  currentExpenditure = 2181,
  baselineTdee = 2228,
  confidenceLevel = 'HIGH',
  confidenceScore = 0.93,
}) => {
  const series = trends?.series || [];

  // Filter series with valid effectiveTdee
  const validSeries = useMemo(() => {
    return series
      .filter((s) => typeof s.effectiveTdee === 'number' && s.effectiveTdee > 0)
      .map((s) => ({
        date: s.date,
        tdee: Math.round(s.effectiveTdee as number),
        observedTdee: s.observedTdee ? Math.round(s.observedTdee) : null,
      }));
  }, [series]);

  const latestTdee = validSeries.length > 0 ? validSeries[validSeries.length - 1].tdee : currentExpenditure;

  // Calculate changes over 3d, 7d, 14d, 30d, 90d
  const expenditureChanges = useMemo(() => {
    const intervals = [
      { label: '3-day', days: 3 },
      { label: '7-day', days: 7 },
      { label: '14-day', days: 14 },
      { label: '30-day', days: 30 },
      { label: '90-day', days: 90 },
    ];

    if (validSeries.length === 0) return [];

    return intervals.map(({ label, days }) => {
      const targetIdx = Math.max(0, validSeries.length - 1 - days);
      const pastEntry = validSeries[targetIdx];
      const slice = validSeries.slice(targetIdx).map((s) => s.tdee);
      const delta = pastEntry ? latestTdee - pastEntry.tdee : 0;
      const isIncrease = delta >= 0;

      return {
        label,
        days,
        delta,
        isIncrease,
        slice,
        direction: delta === 0 ? 'Holding' : isIncrease ? 'Increase' : 'Decrease',
      };
    });
  }, [validSeries, latestTdee]);

  // Reverse series for the historical daily log (latest first)
  const recentLogs = useMemo(() => {
    return [...validSeries].reverse().slice(0, 30).map((curr, idx, arr) => {
      const next = arr[idx + 1];
      const dailyDelta = next ? curr.tdee - next.tdee : 0;
      const dateObj = new Date(curr.date);
      const displayDate = isNaN(dateObj.getTime())
        ? curr.date
        : dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

      return {
        date: curr.date,
        displayDate,
        tdee: curr.tdee,
        dailyDelta,
        strategy: 'Updating',
      };
    });
  }, [validSeries]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] sm:max-w-[480px] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/80 shadow-2xl h-full overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-[#ff6b4a]" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                Expenditure
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Insights &amp; Data
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CARD 1: Expenditure Changes */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-foreground">Expenditure Changes</h4>
            <div className="divide-y divide-border/60">
              {expenditureChanges.map((change) => {
                const TrendIcon = change.delta === 0 ? Minus : change.isIncrease ? TrendingUp : TrendingDown;
                const trendColor = change.delta === 0 ? 'text-muted-foreground' : change.isIncrease ? 'text-[#ff6b4a]' : 'text-amber-500';

                return (
                  <div key={change.label} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground w-14">
                      {change.label}
                    </span>

                    <div className="flex items-center gap-3">
                      <Sparkline points={change.slice} isIncrease={change.isIncrease} />

                      <span className="font-mono font-bold text-foreground w-20 text-right">
                        {change.delta > 0 ? `+${change.delta.toFixed(1)}` : change.delta.toFixed(1)} kcal
                      </span>
                    </div>

                    <div className={`flex items-center gap-1 w-20 justify-end font-semibold ${trendColor}`}>
                      <TrendIcon className="w-3.5 h-3.5" />
                      <span>{change.direction}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 2: Current Expenditure */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center shrink-0 min-w-[100px]">
              <span className="text-2xl font-black text-foreground block font-mono">
                {latestTdee}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                kcal
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Current Expenditure</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                The latest estimate of your daily energy expenditure based on your weight trend and nutrition data.
              </p>
            </div>
          </div>

          {/* CARD 3: Current Strategy */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center shrink-0 min-w-[100px]">
              <span className="text-sm font-bold text-[#ff6b4a] block">
                Updating
              </span>
              <span className="text-[10px] text-muted-foreground">
                Strategy
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Current Strategy</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                GramGains is actively analyzing your weight and nutrition data to update your expenditure estimate.
              </p>
            </div>
          </div>

          {/* CARD 4: Recent History (Last 30 Days) */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-foreground">Last 30 Days</h4>
            <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
              {recentLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No historical entries available yet.
                </p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.date} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-foreground block text-[11px]">
                        {log.displayDate}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {log.strategy}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-foreground">
                        {log.tdee} kcal
                      </span>
                      {log.dailyDelta !== 0 && (
                        <span className={`block text-[10px] font-semibold ${log.dailyDelta > 0 ? 'text-[#ff6b4a]' : 'text-amber-500'}`}>
                          {log.dailyDelta > 0 ? `+${log.dailyDelta}` : log.dailyDelta} kcal
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
