'use client';

import React, { useEffect, useState } from 'react';
import { ApiService, HeatmapItem } from '../services/api';
import { Flame, Calendar, Info } from 'lucide-react';

interface HeatmapProps {
  initialDaysCount?: number;
}

const TIMEFRAME_OPTIONS = [
  { label: 'This Week', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '60 Days', days: 60 },
  { label: '90 Days', days: 90 },
];

export const Heatmap: React.FC<HeatmapProps> = ({ initialDaysCount = 30 }) => {
  const [daysCount, setDaysCount] = useState<number>(initialDaysCount);
  const [data, setData] = useState<HeatmapItem[]>([]);
  const [targetCalories, setTargetCalories] = useState<number>(2200);
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredItem, setHoveredItem] = useState<HeatmapItem | null>(null);

  useEffect(() => {
    async function loadHeatmap() {
      try {
        setLoading(true);
        const res = await ApiService.getHeatmap(daysCount);
        setData(res.heatmap);
        setTargetCalories(res.targetCalories);
        setAccountCreatedAt(res.accountCreatedAt || null);
      } catch (err) {
        console.error('Failed to load activity heatmap:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHeatmap();
  }, [daysCount]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-[#075E54] border-[#05443D]';
      case 3:
        return 'bg-[#0A7C6E] border-[#075E54]';
      case 2:
        return 'bg-[#4DACA0] border-[#0A7C6E]';
      case 1:
        return 'bg-[#E6F3F1] border-[#B8E2DC]';
      default:
        return 'bg-[#F7F9F8] border-[#E1E7E5]';
    }
  };

  const loggedDaysCount = data.filter((d) => !d.isFuture && d.count > 0).length;
  const realDaysCount = data.filter((d) => !d.isFuture).length;

  // Helper to format weekday for short view
  const getWeekdayName = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' });
  };

  // Helper to get formatted date string for tooltip/cards
  const getFormattedDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  // Dynamic grid & pill size styling based on requested daysCount
  const getPillSizeClass = () => {
    switch (daysCount) {
      case 30:
        return 'w-full h-7 sm:h-9 rounded-md';
      case 60:
        return 'w-full h-5.5 sm:h-7 rounded-sm';
      case 90:
      default:
        return 'w-full h-4.5 sm:h-5.5 rounded-xs';
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E1E7E5] p-5 rounded-xl shadow-sm relative overflow-hidden text-[#171C1B]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#E6F3F1] border border-[#B8E2DC] text-[#075E54]">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#171C1B] text-sm leading-none">
              Meal Consistency Heatmap
            </h3>
            <p className="text-xs text-[#68716F] mt-1">
              Logged meals on <span className="text-[#0A7C6E] font-semibold">{loggedDaysCount}</span> of {realDaysCount} active day{realDaysCount === 1 ? '' : 's'}
              {accountCreatedAt && (
                <span className="text-[11px] text-[#8C9694] ml-1">(Account created: {accountCreatedAt})</span>
              )}
            </p>
          </div>
        </div>

        {/* Timeframe Toggles & Legend Container */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Toggle Buttons */}
          <div className="flex items-center p-1 bg-[#F4F7F6] border border-[#E1E7E5] rounded-lg">
            {TIMEFRAME_OPTIONS.map((opt) => {
              const isActive = daysCount === opt.days;
              return (
                <button
                  key={opt.days}
                  onClick={() => setDaysCount(opt.days)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-[#075E54] text-white shadow-xs'
                      : 'text-[#68716F] hover:text-[#171C1B] hover:bg-[#E6F3F1]/50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-[#68716F]">
            <span>Less</span>
            <div className="w-3 h-3 rounded-xs bg-[#F7F9F8] border border-[#E1E7E5]" />
            <div className="w-3 h-3 rounded-xs bg-[#E6F3F1] border border-[#B8E2DC]" />
            <div className="w-3 h-3 rounded-xs bg-[#4DACA0] border border-[#0A7C6E]" />
            <div className="w-3 h-3 rounded-xs bg-[#0A7C6E] border border-[#075E54]" />
            <div className="w-3 h-3 rounded-xs bg-[#075E54] border border-[#05443D]" />
            <span>More</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-28 flex items-center justify-center text-xs text-[#68716F] animate-pulse">
          Loading logging activity heatmap...
        </div>
      ) : (
        <div>
          {/* Heatmap Grid — Adaptive for 7 Days vs 30/60/90 Days */}
          {daysCount === 7 ? (
            /* 7 Days Single Row Card Layout */
            <div className="grid grid-cols-7 gap-2.5 pb-1">
              {data.map((item) => (
                <div
                  key={item.date}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                    item.isFuture
                      ? 'bg-[#F7F9F8] border-[#E1E7E5] opacity-50 cursor-not-allowed'
                      : `hover:scale-105 hover:shadow-sm ${getLevelColor(item.level)}`
                  }`}
                >
                  <span className="text-[11px] font-semibold opacity-75">{getWeekdayName(item.date)}</span>
                  <span className="text-xs font-bold font-mono mt-0.5">
                    {item.isFuture ? 'Future' : item.totalCalories > 0 ? `${item.totalCalories}` : '-'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Multi-row 30/60/90 Day Layout — Auto-stretching Equal-width Columns */
            <div className="grid grid-flow-col grid-rows-7 auto-cols-fr w-full gap-1.5 sm:gap-2 pb-1">
              {data.map((item) => (
                <div
                  key={item.date}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`border transition-all cursor-pointer ${getPillSizeClass()} ${
                    item.isFuture
                      ? 'bg-[#F7F9F8] border-[#E1E7E5] opacity-50 cursor-not-allowed'
                      : `hover:scale-105 hover:z-10 ${getLevelColor(item.level)}`
                  }`}
                />
              ))}
            </div>
          )}

          {/* Hover Tooltip / Status Footer */}
          <div className="mt-3 min-h-[24px] flex items-center justify-between text-xs text-[#68716F] pt-2 border-t border-[#E1E7E5]">
            {hoveredItem ? (
              <div className="flex items-center gap-2 text-[#171C1B] font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#0A7C6E]" />
                <span>{getFormattedDate(hoveredItem.date)}</span>
                <span className="text-[#E1E7E5]">•</span>
                {hoveredItem.isFuture ? (
                  <span className="text-[#8C9694] italic">Future / Unreached Day</span>
                ) : (
                  <>
                    <span className="text-[#075E54] font-bold font-mono">{hoveredItem.totalCalories} kcal</span>
                    <span className="text-[#E1E7E5]">•</span>
                    <span>{hoveredItem.count} meal{hoveredItem.count === 1 ? '' : 's'} logged</span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#68716F] text-[11px]">
                <Info className="w-3.5 h-3.5 text-[#68716F]" />
                <span>Hover over any square to inspect recorded daily calories and meals</span>
              </div>
            )}

            <div className="text-[11px] text-[#68716F] font-mono">
              Target: <span className="text-[#171C1B] font-semibold">{targetCalories} kcal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
