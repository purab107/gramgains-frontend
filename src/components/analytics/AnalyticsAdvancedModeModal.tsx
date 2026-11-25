'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  CartesianGrid,
  Line,
  Bar,
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
import { Button } from '@/components/ui/button';
import {
  WeightHistoryResponse,
  AnalyticsTrendsResponse,
  AdaptiveStatusResponse,
  UserProfile,
  ApiService,
} from '@/services/api';
import {
  X,
  Download,
  Calendar,
  Scale,
  Flame,
  Activity,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  ArrowUpDown,
  Utensils,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface AnalyticsAdvancedModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  weightHistory: WeightHistoryResponse | null;
  trends: AnalyticsTrendsResponse | null;
  adaptiveStatus: AdaptiveStatusResponse | null;
  userProfile?: UserProfile | null;
}

interface ProcessedDataPoint {
  date: string;
  displayDate: string;
  periodLabel: string;
  rawWeight: number | null;
  trendWeight: number | null;
  intake: number | null;
  tdee: number | null;
  targetCalories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  deficit: number | null;
}

type TimeHorizon = '6M' | '1Y' | 'LIFETIME';
type AggregationMode = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type PrimaryTab = 'WEIGHT' | 'EXPENDITURE' | 'ENERGY_BALANCE' | 'MACROS';
type SecondaryMetric = 'NONE' | 'INTAKE' | 'TDEE' | 'TARGET' | 'PROTEIN';

const chartConfig = {
  primary: {
    label: 'Primary Signal',
    color: '#8b5cf6',
  },
  trendWeight: {
    label: 'Trend Weight',
    color: '#c4b5fd',
  },
  rawWeight: {
    label: 'Scale Weight',
    color: '#8b5cf6',
  },
  effectiveTdee: {
    label: 'TDEE Burn',
    color: '#ff6b4a',
  },
  caloriesConsumed: {
    label: 'Intake',
    color: '#10b981',
  },
  secondary: {
    label: 'Comparative Overlay',
    color: '#38bdf8',
  },
} satisfies ChartConfig;

export const AnalyticsAdvancedModeModal: React.FC<AnalyticsAdvancedModeModalProps> = ({
  isOpen,
  onClose,
  weightHistory,
  trends,
  adaptiveStatus,
  userProfile,
}) => {
  const [horizon, setHorizon] = useState<TimeHorizon>('6M');
  const [aggregation, setAggregation] = useState<AggregationMode>('WEEKLY');
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('WEIGHT');
  const [secondaryMetric, setSecondaryMetric] = useState<SecondaryMetric>('INTAKE');
  const [sortField, setSortField] = useState<string>('period');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Expanded fetched trends for 6M/1Y/Lifetime
  const [longRangeTrends, setLongRangeTrends] = useState<AnalyticsTrendsResponse | null>(null);
  const [isLoadingLongData, setIsLoadingLongData] = useState<boolean>(false);

  // Horizon in days
  const horizonDays = horizon === '6M' ? 180 : horizon === '1Y' ? 365 : 3650;

  // Listen to Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch longer time horizons when user toggles
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchLongHistory = async () => {
      setIsLoadingLongData(true);
      try {
        const res = await ApiService.getAnalyticsTrends(horizonDays).catch(() => null);
        if (isMounted && res) {
          setLongRangeTrends(res);
        }
      } catch (err) {
        console.error('Failed to load extended analytics trends:', err);
      } finally {
        if (isMounted) setIsLoadingLongData(false);
      }
    };

    fetchLongHistory();
    return () => {
      isMounted = false;
    };
  }, [isOpen, horizonDays]);

  // Source series combined from trends or longRangeTrends
  const rawSeries = useMemo(() => {
    const activeData = longRangeTrends || trends;
    if (!activeData?.series || activeData.series.length === 0) return [];
    
    // Slice to horizon days
    const sliceCount = Math.min(activeData.series.length, horizonDays);
    return activeData.series.slice(-sliceCount);
  }, [longRangeTrends, trends, horizonDays]);

  // Process data based on AggregationMode (Daily, Weekly, Monthly)
  const processedData = useMemo<ProcessedDataPoint[]>(() => {
    if (rawSeries.length === 0) return [];

    if (aggregation === 'DAILY') {
      return rawSeries.map((item) => {
        const d = new Date(item.date);
        const displayDate = isNaN(d.getTime())
          ? item.date
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return {
          date: item.date,
          displayDate,
          periodLabel: displayDate,
          rawWeight: item.rawWeightKg,
          trendWeight: item.trendWeightKg,
          intake: item.caloriesConsumed,
          tdee: item.effectiveTdee,
          targetCalories: item.targetCalories,
          protein: item.proteinGrams,
          carbs: item.carbsGrams,
          fat: item.fatGrams,
          deficit:
            item.caloriesConsumed && item.effectiveTdee
              ? Math.round(item.caloriesConsumed - item.effectiveTdee)
              : null,
        };
      });
    }

    if (aggregation === 'WEEKLY') {
      // Group by 7-day chunks
      const chunks: typeof rawSeries[] = [];
      const chunkSize = 7;
      for (let i = 0; i < rawSeries.length; i += chunkSize) {
        chunks.push(rawSeries.slice(i, i + chunkSize));
      }

      return chunks.map((chunk) => {
        const first = chunk[0];
        const last = chunk[chunk.length - 1];
        const startDate = new Date(first.date);
        const endDate = new Date(last.date);
        const displayDate = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        // Averages
        const validRaw = chunk.map((c) => c.rawWeightKg).filter((w): w is number => typeof w === 'number' && w > 0);
        const validTrend = chunk.map((c) => c.trendWeightKg).filter((w): w is number => typeof w === 'number' && w > 0);
        const validIntake = chunk.map((c) => c.caloriesConsumed).filter((c): c is number => typeof c === 'number' && c > 0);
        const validTdee = chunk.map((c) => c.effectiveTdee).filter((t): t is number => typeof t === 'number' && t > 0);
        const validProtein = chunk.map((c) => c.proteinGrams).filter((p): p is number => typeof p === 'number' && p > 0);

        const avgRaw = validRaw.length ? Math.round((validRaw.reduce((a, b) => a + b, 0) / validRaw.length) * 10) / 10 : null;
        const avgTrend = validTrend.length ? Math.round((validTrend.reduce((a, b) => a + b, 0) / validTrend.length) * 10) / 10 : null;
        const avgIntake = validIntake.length ? Math.round(validIntake.reduce((a, b) => a + b, 0) / validIntake.length) : null;
        const avgTdee = validTdee.length ? Math.round(validTdee.reduce((a, b) => a + b, 0) / validTdee.length) : null;
        const avgProtein = validProtein.length ? Math.round(validProtein.reduce((a, b) => a + b, 0) / validProtein.length) : null;

        return {
          date: last.date,
          displayDate,
          periodLabel: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          rawWeight: avgRaw,
          trendWeight: avgTrend,
          intake: avgIntake,
          tdee: avgTdee,
          targetCalories: last.targetCalories,
          protein: avgProtein,
          carbs: null,
          fat: null,
          deficit: avgIntake && avgTdee ? Math.round(avgIntake - avgTdee) : null,
        };
      });
    }

    // MONTHLY
    const monthlyGroups: Record<string, typeof rawSeries> = {};
    rawSeries.forEach((item) => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyGroups[key]) monthlyGroups[key] = [];
      monthlyGroups[key].push(item);
    });

    return Object.entries(monthlyGroups).map(([monthKey, items]) => {
      const [year, month] = monthKey.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1, 1);
      const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const validRaw = items.map((c) => c.rawWeightKg).filter((w): w is number => typeof w === 'number' && w > 0);
      const validTrend = items.map((c) => c.trendWeightKg).filter((w): w is number => typeof w === 'number' && w > 0);
      const validIntake = items.map((c) => c.caloriesConsumed).filter((c): c is number => typeof c === 'number' && c > 0);
      const validTdee = items.map((c) => c.effectiveTdee).filter((t): t is number => typeof t === 'number' && t > 0);
      const validProtein = items.map((c) => c.proteinGrams).filter((p): p is number => typeof p === 'number' && p > 0);

      const avgRaw = validRaw.length ? Math.round((validRaw.reduce((a, b) => a + b, 0) / validRaw.length) * 10) / 10 : null;
      const avgTrend = validTrend.length ? Math.round((validTrend.reduce((a, b) => a + b, 0) / validTrend.length) * 10) / 10 : null;
      const avgIntake = validIntake.length ? Math.round(validIntake.reduce((a, b) => a + b, 0) / validIntake.length) : null;
      const avgTdee = validTdee.length ? Math.round(validTdee.reduce((a, b) => a + b, 0) / validTdee.length) : null;
      const avgProtein = validProtein.length ? Math.round(validProtein.reduce((a, b) => a + b, 0) / validProtein.length) : null;

      return {
        date: items[items.length - 1].date,
        displayDate,
        periodLabel: dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        rawWeight: avgRaw,
        trendWeight: avgTrend,
        intake: avgIntake,
        tdee: avgTdee,
        targetCalories: items[items.length - 1].targetCalories,
        protein: avgProtein,
        carbs: null,
        fat: null,
        deficit: avgIntake && avgTdee ? Math.round(avgIntake - avgTdee) : null,
      };
    });
  }, [rawSeries, aggregation]);

  // Overall Statistics for KPI cards
  const stats = useMemo(() => {
    if (processedData.length === 0) {
      return {
        startWeight: 0,
        endWeight: 0,
        netDeltaKg: 0,
        avgTdee: 0,
        avgIntake: 0,
        cumulativeDeficit: 0,
        avgProtein: 0,
      };
    }

    const validTrend = processedData.map((d) => d.trendWeight).filter((w): w is number => typeof w === 'number' && w > 0);
    const startW = validTrend[0] ?? 0;
    const endW = validTrend[validTrend.length - 1] ?? startW;
    const deltaW = Math.round((endW - startW) * 10) / 10;

    const validTdees = processedData.map((d) => d.tdee).filter((t): t is number => typeof t === 'number' && t > 0);
    const avgT = validTdees.length ? Math.round(validTdees.reduce((a, b) => a + b, 0) / validTdees.length) : 0;

    const validIntakes = processedData.map((d) => d.intake).filter((i): i is number => typeof i === 'number' && i > 0);
    const avgI = validIntakes.length ? Math.round(validIntakes.reduce((a, b) => a + b, 0) / validIntakes.length) : 0;

    const totalDeficit = processedData.reduce((acc, curr) => acc + (curr.deficit ?? 0), 0);

    const validProteins = processedData.map((d) => d.protein).filter((p): p is number => typeof p === 'number' && p > 0);
    const avgP = validProteins.length ? Math.round(validProteins.reduce((a, b) => a + b, 0) / validProteins.length) : 0;

    return {
      startWeight: startW,
      endWeight: endW,
      netDeltaKg: deltaW,
      avgTdee: avgT,
      avgIntake: avgI,
      cumulativeDeficit: totalDeficit,
      avgProtein: avgP,
    };
  }, [processedData]);

  // Primary Y-Axis Domain Bounds
  const primaryDomain = useMemo(() => {
    if (primaryTab === 'WEIGHT') {
      const weights = processedData.flatMap((d) => [d.rawWeight, d.trendWeight]).filter((w): w is number => typeof w === 'number' && w > 0);
      if (weights.length === 0) return [60, 80];
      const min = Math.floor(Math.min(...weights) - 1.5);
      const max = Math.ceil(Math.max(...weights) + 1.5);
      return [min, max];
    }
    if (primaryTab === 'EXPENDITURE' || primaryTab === 'ENERGY_BALANCE') {
      const cals = processedData.flatMap((d) => [d.tdee, d.intake]).filter((c): c is number => typeof c === 'number' && c > 0);
      if (cals.length === 0) return [1500, 3000];
      const min = Math.max(1000, Math.floor((Math.min(...cals) - 100) / 100) * 100);
      const max = Math.ceil((Math.max(...cals) + 100) / 100) * 100;
      return [min, max];
    }
    // MACROS
    const proteins = processedData.map((d) => d.protein).filter((p): p is number => typeof p === 'number' && p > 0);
    if (proteins.length === 0) return [50, 200];
    return [Math.floor(Math.min(...proteins) * 0.8), Math.ceil(Math.max(...proteins) * 1.2)];
  }, [processedData, primaryTab]);

  // Secondary Y-Axis Domain Bounds (e.g. Calories or Protein)
  const secondaryDomain = useMemo(() => {
    if (secondaryMetric === 'INTAKE' || secondaryMetric === 'TDEE' || secondaryMetric === 'TARGET') {
      const vals = processedData.flatMap((d) => [d.intake, d.tdee, d.targetCalories]).filter((v): v is number => typeof v === 'number' && v > 0);
      if (vals.length === 0) return [1500, 3000];
      return [Math.floor((Math.min(...vals) - 100) / 100) * 100, Math.ceil((Math.max(...vals) + 100) / 100) * 100];
    }
    if (secondaryMetric === 'PROTEIN') {
      const p = processedData.map((d) => d.protein).filter((v): v is number => typeof v === 'number' && v > 0);
      if (p.length === 0) return [50, 200];
      return [Math.floor(Math.min(...p) * 0.8), Math.ceil(Math.max(...p) * 1.2)];
    }
    return [0, 100];
  }, [processedData, secondaryMetric]);

  // Table Data with sorting
  const sortedTableData = useMemo(() => {
    const list = [...processedData];
    list.sort((a, b) => {
      let valA: any = a[sortField as keyof typeof a];
      let valB: any = b[sortField as keyof typeof b];

      if (valA === null || valA === undefined) valA = 0;
      if (valB === null || valB === undefined) valB = 0;

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
    return list;
  }, [processedData, sortField, sortAsc]);

  // Handle Sort Toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (processedData.length === 0) return;

    const headers = ['Date', 'Period', 'Trend Weight (kg)', 'Scale Weight (kg)', 'Intake (kcal)', 'TDEE (kcal)', 'Net Balance (kcal)', 'Protein (g)'];
    const rows = processedData.map((d) => [
      d.date,
      `"${d.periodLabel || d.displayDate}"`,
      d.trendWeight ?? '',
      d.rawWeight ?? '',
      d.intake ?? '',
      d.tdee ?? '',
      d.deficit ?? '',
      d.protein ?? '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gramgains-advanced-analytics-${horizon.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col text-foreground overflow-y-auto">
      {/* ─── WORKBENCH TOP HEADER BAR ─── */}
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-foreground">
                Advanced Analytics Workbench
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/30">
                PRO VIEW
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Multi-horizon time-series, dual-axis comparative metrics, and granular period audit.
            </p>
          </div>
        </div>

        {/* Right Actions: Time Horizon Pills, Aggregation, Export, Exit */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Time Horizon Selector (6M, 1Y, LIFETIME) */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            {(['6M', '1Y', 'LIFETIME'] as TimeHorizon[]).map((hz) => (
              <button
                key={hz}
                onClick={() => setHorizon(hz)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  horizon === hz
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {hz === '6M' ? '6 Months' : hz === '1Y' ? '1 Year' : 'Lifetime'}
              </button>
            ))}
          </div>

          {/* Aggregation Mode Selector */}
          <div className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as AggregationMode[]).map((ag) => (
              <button
                key={ag}
                onClick={() => setAggregation(ag)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  aggregation === ag
                    ? 'bg-card text-foreground border border-border/80 shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {ag === 'DAILY' ? 'Daily' : ag === 'WEEKLY' ? 'Weekly Rolling' : 'Monthly'}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl gap-1.5 text-xs font-semibold h-8.5 px-3 border-border hover:bg-muted/80 shadow-2xs"
            title="Export CSV Dataset"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          {/* Close Workbench Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl h-8.5 w-8.5 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Exit Advanced Mode (Esc)"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* ─── WORKBENCH MAIN CONTENT ─── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* ROW 1: YouTube-Style Primary Metric Header Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Weight & Composition */}
          <button
            type="button"
            onClick={() => setPrimaryTab('WEIGHT')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              primaryTab === 'WEIGHT'
                ? 'bg-violet-500/10 border-violet-500/40 ring-1 ring-violet-500/30'
                : 'bg-card border-border hover:border-border/80 hover:bg-muted/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Weight Trajectory</span>
              <Scale className={`w-3.5 h-3.5 ${primaryTab === 'WEIGHT' ? 'text-violet-400' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {stats.endWeight} kg
              </span>
              <span className={`text-xs font-bold font-mono ${stats.netDeltaKg <= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                {stats.netDeltaKg > 0 ? `+${stats.netDeltaKg}` : stats.netDeltaKg} kg
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              From {stats.startWeight}kg ({horizon})
            </p>
          </button>

          {/* Card 2: Metabolic Expenditure (TDEE) */}
          <button
            type="button"
            onClick={() => setPrimaryTab('EXPENDITURE')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              primaryTab === 'EXPENDITURE'
                ? 'bg-orange-500/10 border-orange-500/40 ring-1 ring-orange-500/30'
                : 'bg-card border-border hover:border-border/80 hover:bg-muted/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Observed Burn (TDEE)</span>
              <Flame className={`w-3.5 h-3.5 ${primaryTab === 'EXPENDITURE' ? 'text-[#ff6b4a]' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {stats.avgTdee}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">kcal/day avg</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Thermodynamic empirical burn
            </p>
          </button>

          {/* Card 3: Cumulative Energy Balance */}
          <button
            type="button"
            onClick={() => setPrimaryTab('ENERGY_BALANCE')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              primaryTab === 'ENERGY_BALANCE'
                ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                : 'bg-card border-border hover:border-border/80 hover:bg-muted/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Cumulative Deficit</span>
              <Activity className={`w-3.5 h-3.5 ${primaryTab === 'ENERGY_BALANCE' ? 'text-emerald-400' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl sm:text-2xl font-black font-mono ${stats.cumulativeDeficit <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.cumulativeDeficit > 0 ? `+${stats.cumulativeDeficit.toLocaleString()}` : stats.cumulativeDeficit.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">kcal</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Net thermodynamic debt/surplus
            </p>
          </button>

          {/* Card 4: Macro Partitioning */}
          <button
            type="button"
            onClick={() => setPrimaryTab('MACROS')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              primaryTab === 'MACROS'
                ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30'
                : 'bg-card border-border hover:border-border/80 hover:bg-muted/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Daily Protein Anchor</span>
              <Utensils className={`w-3.5 h-3.5 ${primaryTab === 'MACROS' ? 'text-blue-400' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {stats.avgProtein} g
              </span>
              <span className="text-xs font-semibold text-muted-foreground">daily avg</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Intake anchor: {stats.avgIntake} kcal
            </p>
          </button>
        </div>

        {/* ROW 2: Primary Comparative Visualization Card */}
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          {/* Chart Header & Comparison Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
            <div>
              <h2 className="text-base font-bold text-foreground">
                {primaryTab === 'WEIGHT'
                  ? 'Weight Trajectory & Fluctuations'
                  : primaryTab === 'EXPENDITURE'
                  ? 'Thermodynamic Expenditure History'
                  : primaryTab === 'ENERGY_BALANCE'
                  ? 'Caloric Intake vs Observed TDEE'
                  : 'Macronutrient Protein Stability'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {aggregation === 'DAILY' ? 'Daily readings' : aggregation === 'WEEKLY' ? '7-day rolling aggregates' : 'Monthly milestone averages'} across {horizon === '6M' ? 'the past 6 months' : horizon === '1Y' ? 'the past year' : 'lifetime history'}.
              </p>
            </div>

            {/* Compare Secondary Metric Pill Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Compare:
              </span>
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
                {(['NONE', 'INTAKE', 'TDEE', 'PROTEIN'] as SecondaryMetric[]).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSecondaryMetric(sec)}
                    className={`px-2 py-0.5 text-xs font-medium rounded-lg transition-all ${
                      secondaryMetric === sec
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sec === 'NONE' ? 'None' : sec === 'INTAKE' ? '+ Intake' : sec === 'TDEE' ? '+ Burn' : '+ Protein'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dual-Axis Wide Chart Canvas */}
          <div className="w-full h-[360px] sm:h-[400px]">
            <ChartContainer
              config={chartConfig}
              className="w-full h-[360px] sm:h-[400px] aspect-auto [&_.recharts-wrapper]:[transform:translateZ(0)] [&_.recharts-wrapper]:will-change-transform [&_.recharts-surface]:will-change-transform [&_.recharts-curve]:will-change-transform [&_.recharts-curve]:transition-all [&_.recharts-curve]:duration-500 [&_path]:will-change-transform"
            >
              <ComposedChart
                data={processedData}
                margin={{ top: 12, right: secondaryMetric !== 'NONE' ? 12 : 0, left: -6, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255, 255, 255, 0.08)"
                />

                {/* X-Axis Date Ticks */}
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  minTickGap={24}
                />

                {/* Left Y-Axis: Primary Metric */}
                <YAxis
                  yAxisId="primary"
                  orientation="left"
                  domain={primaryDomain}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  tickMargin={6}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  tickFormatter={(val) => `${Number.isInteger(Number(val)) ? val : Number(val).toFixed(1)}`}
                />

                {/* Right Y-Axis: Comparative Secondary Metric */}
                {secondaryMetric !== 'NONE' && (
                  <YAxis
                    yAxisId="secondary"
                    orientation="right"
                    domain={secondaryDomain}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickMargin={6}
                    tick={{ fontSize: 11, fill: '#38bdf8', fontWeight: 500 }}
                    tickFormatter={(val) => `${Math.round(val)}`}
                  />
                )}

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      className="bg-card/95 border-border shadow-2xl backdrop-blur-md"
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload;
                        return item?.periodLabel || item?.displayDate || item?.date;
                      }}
                      formatter={(val, name) => {
                        let label = String(name);
                        let unit = '';
                        if (name === 'trendWeight') { label = 'Trend Weight'; unit = ' kg'; }
                        if (name === 'rawWeight') { label = 'Scale Weight'; unit = ' kg'; }
                        if (name === 'tdee') { label = 'Observed TDEE'; unit = ' kcal'; }
                        if (name === 'intake') { label = 'Intake'; unit = ' kcal'; }
                        if (name === 'protein') { label = 'Protein'; unit = ' g'; }
                        if (name === 'deficit') { label = 'Net Balance'; unit = ' kcal'; }

                        return (
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span className="text-muted-foreground text-xs">{label}:</span>
                            <span className="font-bold text-foreground font-mono text-xs">
                              {val !== null ? `${val}${unit}` : '—'}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />

                {/* Primary Metric Curves */}
                {primaryTab === 'WEIGHT' && (
                  <>
                    <Line
                      yAxisId="primary"
                      type="linear"
                      dataKey="rawWeight"
                      name="rawWeight"
                      stroke="#8b5cf6"
                      strokeWidth={1.5}
                      connectNulls={false}
                      dot={aggregation === 'DAILY' ? false : { r: 2.5, fill: '#8b5cf6' }}
                      isAnimationActive={true}
                      animationDuration={650}
                      animationEasing="spring"
                    />
                    <Line
                      yAxisId="primary"
                      type="monotone"
                      dataKey="trendWeight"
                      name="trendWeight"
                      stroke="#c4b5fd"
                      strokeWidth={3}
                      connectNulls={true}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={650}
                      animationEasing="spring"
                    />
                  </>
                )}

                {primaryTab === 'EXPENDITURE' && (
                  <Line
                    yAxisId="primary"
                    type="monotone"
                    dataKey="tdee"
                    name="tdee"
                    stroke="#ff6b4a"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={650}
                    animationEasing="spring"
                  />
                )}

                {primaryTab === 'ENERGY_BALANCE' && (
                  <>
                    <Bar
                      yAxisId="primary"
                      dataKey="intake"
                      name="intake"
                      fill="rgba(16, 185, 129, 0.4)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="primary"
                      type="monotone"
                      dataKey="tdee"
                      name="tdee"
                      stroke="#ff6b4a"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={650}
                      animationEasing="spring"
                    />
                  </>
                )}

                {primaryTab === 'MACROS' && (
                  <Line
                    yAxisId="primary"
                    type="monotone"
                    dataKey="protein"
                    name="protein"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={650}
                    animationEasing="spring"
                  />
                )}

                {/* Secondary Comparative Overlay Curves */}
                {secondaryMetric === 'INTAKE' && (
                  <Line
                    yAxisId="secondary"
                    type="monotone"
                    dataKey="intake"
                    name="intake"
                    stroke="#34d399"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={650}
                    animationEasing="spring"
                  />
                )}

                {secondaryMetric === 'TDEE' && (
                  <Line
                    yAxisId="secondary"
                    type="monotone"
                    dataKey="tdee"
                    name="tdee"
                    stroke="#fb923c"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={650}
                    animationEasing="spring"
                  />
                )}

                {secondaryMetric === 'PROTEIN' && (
                  <Line
                    yAxisId="secondary"
                    type="monotone"
                    dataKey="protein"
                    name="protein"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={650}
                    animationEasing="spring"
                  />
                )}
              </ComposedChart>
            </ChartContainer>
          </div>

          {/* Chart Legend Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-4 flex-wrap">
              {primaryTab === 'WEIGHT' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded-full bg-[#8b5cf6]" />
                    <span className="font-semibold text-foreground text-[11px]">Scale Weight</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-1.5 rounded-full bg-[#c4b5fd]" />
                    <span className="font-semibold text-foreground text-[11px]">Holt Trend Weight</span>
                  </div>
                </>
              )}

              {secondaryMetric !== 'NONE' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-0.5 border-t border-dashed border-sky-400" />
                  <span className="font-semibold text-sky-400 text-[11px]">
                    Comparative: {secondaryMetric}
                  </span>
                </div>
              )}
            </div>

            <span className="text-[11px] text-muted-foreground italic">
              Powered by Holt-Winters exponential smoothing &amp; thermodynamic mass-balance
            </span>
          </div>
        </div>

        {/* ROW 3: YouTube-Style Granular Historical Breakdown Table */}
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/50">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Period Performance Breakdown
              </h3>
              <p className="text-xs text-muted-foreground">
                Granular statistical breakdown grouped by {aggregation.toLowerCase()} intervals.
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {sortedTableData.length} Intervals Recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Period</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('trendWeight')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Trend Weight</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('rawWeight')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Scale Weight</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('intake')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Avg Intake</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('tdee')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Avg TDEE</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('deficit')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Net Balance</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-foreground text-right"
                    onClick={() => handleSort('protein')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Protein</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-mono">
                {sortedTableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 font-sans font-medium text-foreground">
                      {row.periodLabel || row.displayDate}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-foreground">
                      {row.trendWeight !== null ? `${row.trendWeight} kg` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-muted-foreground">
                      {row.rawWeight !== null ? `${row.rawWeight} kg` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-400">
                      {row.intake !== null ? `${row.intake} kcal` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-[#ff6b4a]">
                      {row.tdee !== null ? `${row.tdee} kcal` : '—'}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${
                      (row.deficit ?? 0) <= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {row.deficit !== null
                        ? `${row.deficit > 0 ? `+${row.deficit}` : row.deficit} kcal`
                        : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-sky-400">
                      {row.protein !== null ? `${row.protein} g` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
