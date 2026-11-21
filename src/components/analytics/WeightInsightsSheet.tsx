'use client';

import React, { useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { WeightHistoryResponse, ApiService } from '@/services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Scale, 
  EyeOff, 
  Eye, 
  Trash2, 
  Target, 
  SlidersHorizontal,
  Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WeightInsightsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: WeightHistoryResponse | null;
  targetWeightKg?: number | null;
  onRefresh?: () => void;
}

// Mini SVG Sparkline for Weight Changes
const WeightSparkline: React.FC<{ points: number[]; isIncrease: boolean }> = ({ points, isIncrease }) => {
  if (points.length < 2) {
    return <div className="w-16 h-5 bg-muted/40 rounded" />;
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

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <path d={areaD} fill="rgba(139, 92, 246, 0.18)" />
      <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
};

export const WeightInsightsSheet: React.FC<WeightInsightsSheetProps> = ({
  open,
  onOpenChange,
  data,
  targetWeightKg,
  onRefresh,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const logs = data?.logs || [];

  // Filter logs with valid trend weights, sorted ascending by date
  const validLogs = useMemo(() => {
    return [...logs]
      .filter((l) => typeof l.trendWeightKg === 'number' && l.trendWeightKg > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs]);

  const latestTrend = data?.latestTrendKg ?? (validLogs.length > 0 ? validLogs[validLogs.length - 1].trendWeightKg : 75);
  const latestRaw = data?.latestRawKg ?? (validLogs.length > 0 ? validLogs[validLogs.length - 1].rawWeightKg : latestTrend);
  const scaleDeviation = Math.round((latestRaw - latestTrend) * 10) / 10;

  // Calculate changes over 3d, 7d, 14d, 30d, 90d
  const weightChanges = useMemo(() => {
    const intervals = [
      { label: '3-day', days: 3 },
      { label: '7-day', days: 7 },
      { label: '14-day', days: 14 },
      { label: '30-day', days: 30 },
      { label: '90-day', days: 90 },
    ];

    if (validLogs.length === 0) return [];

    return intervals.map(({ label, days }) => {
      const targetIdx = Math.max(0, validLogs.length - 1 - days);
      const pastEntry = validLogs[targetIdx];
      const slice = validLogs.slice(targetIdx).map((s) => s.trendWeightKg);
      const delta = pastEntry ? Math.round((latestTrend - pastEntry.trendWeightKg) * 10) / 10 : 0;
      const isIncrease = delta > 0;
      const isDecrease = delta < 0;

      return {
        label,
        days,
        delta,
        isIncrease,
        slice,
        direction: delta === 0 ? 'No Change' : isIncrease ? 'Increase' : 'Decrease',
      };
    });
  }, [validLogs, latestTrend]);

  // Velocity and Milestone calculations
  const velocity = data?.velocityKgPerWeek ?? 0;
  const milestone = useMemo(() => {
    if (!targetWeightKg || targetWeightKg <= 0) return null;
    const remainingKg = Math.round(Math.abs(latestTrend - targetWeightKg) * 10) / 10;
    const absVelocity = Math.abs(velocity) > 0.05 ? Math.abs(velocity) : 0.35;
    const weeksRemaining = Math.round((remainingKg / absVelocity) * 10) / 10;
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + Math.round(weeksRemaining * 7));

    return {
      targetWeightKg,
      remainingKg,
      weeksRemaining,
      projectedDate: projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }, [targetWeightKg, latestTrend, velocity]);

  // Toggle outlier exclusion
  const handleToggleExclude = async (id?: string) => {
    if (!id) return;
    try {
      setLoadingId(id);
      await ApiService.toggleWeightExclusion(id);
      onRefresh?.();
    } catch (err) {
      console.error('Failed to toggle exclusion', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] sm:max-w-[480px] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/80 shadow-2xl h-full overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                Weight Trend
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-400">
                Insights &amp; Data
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* CARD 1: Weight Changes (Multi-Window Velocity) */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Weight Changes</h4>
              <span className="text-[10px] text-slate-400 font-medium">Trend Momentum</span>
            </div>

            <div className="divide-y divide-border/60">
              {weightChanges.map((change) => {
                const TrendIcon = change.delta === 0 ? Minus : change.isIncrease ? TrendingUp : TrendingDown;
                const trendColor = change.delta === 0 
                  ? 'text-slate-400' 
                  : change.isIncrease 
                  ? 'text-blue-400' 
                  : 'text-emerald-400';

                return (
                  <div key={change.label} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 dark:text-slate-200 w-14">
                      {change.label}
                    </span>

                    <div className="flex items-center gap-3">
                      <WeightSparkline points={change.slice} isIncrease={change.isIncrease} />

                      <span className="font-mono font-bold text-foreground w-20 text-right">
                        {change.delta > 0 ? `+${change.delta}` : change.delta} kg
                      </span>
                    </div>

                    <div className={`flex items-center gap-1 w-24 justify-end font-semibold ${trendColor}`}>
                      <TrendIcon className="w-3.5 h-3.5" />
                      <span>{change.direction}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 2: Current Metrics & Scale Deviation */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-foreground">Current State &amp; Deviation</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Latest Scale
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {latestRaw} <span className="text-xs font-normal text-muted-foreground">kg</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Raw morning weight</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider block mb-0.5">
                  Smoothed Trend
                </span>
                <span className="text-xl font-black font-mono text-violet-200">
                  {latestTrend} <span className="text-xs font-normal text-violet-400">kg</span>
                </span>
                <span className="text-[10px] text-violet-400/90 block mt-0.5">Midpoint true weight</span>
              </div>
            </div>

            {/* Physiological Scale Deviation Note */}
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/80 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Daily Scale Deviation:</span>
                <span className="font-bold text-foreground">
                  {scaleDeviation > 0 ? `+${scaleDeviation}` : scaleDeviation} kg {scaleDeviation > 0 ? 'above trend' : 'below trend'}
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                Math.abs(scaleDeviation) <= 0.4 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : scaleDeviation > 0 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {Math.abs(scaleDeviation) <= 0.4 
                  ? 'Aligned' 
                  : scaleDeviation > 0 
                  ? 'Water/Sodium Spike' 
                  : 'Depletion Drop'}
              </span>
            </div>
          </div>

          {/* CARD 3: Milestone & Velocity Forecast */}
          {milestone && (
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">Goal Trajectory</h4>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <Target className="w-3.5 h-3.5" />
                  <span>Target: {milestone.targetWeightKg} kg</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground block text-sm">
                    {milestone.remainingKg} kg remaining
                  </span>
                  <span className="text-[11px] text-slate-400">
                    At current velocity of {velocity < 0 ? `${velocity} kg/wk` : `-${Math.abs(velocity) || 0.35} kg/wk`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground block font-mono">
                    {milestone.projectedDate}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ~{milestone.weeksRemaining} weeks
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 4: Weigh-In History & Outlier Management */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Weigh-in History</h4>
              <span className="text-[10px] text-slate-400">Filter noisy spikes</span>
            </div>

            <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No weigh-in logs recorded yet.
                </p>
              ) : (
                [...logs].reverse().map((log) => {
                  const dateObj = new Date(log.date);
                  const displayDate = isNaN(dateObj.getTime())
                    ? log.date
                    : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                  return (
                    <div key={log.id || log.date} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-[11px] ${log.isExcluded ? 'line-through text-muted-foreground' : 'text-slate-200'}`}>
                            {displayDate}
                          </span>
                          {log.isExcluded && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                              Excluded
                            </span>
                          )}
                        </div>
                        {log.note && (
                          <span className="text-[10px] text-slate-400 italic block">
                            &quot;{log.note}&quot;
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`font-mono font-bold block ${log.isExcluded ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {log.rawWeightKg} kg
                          </span>
                          <span className="text-[10px] text-violet-400 font-mono">
                            Trend: {log.trendWeightKg} kg
                          </span>
                        </div>

                        {log.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleExclude(log.id)}
                            disabled={loadingId === log.id}
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-foreground"
                            title={log.isExcluded ? 'Include in trend' : 'Exclude from trend'}
                          >
                            {log.isExcluded ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
