'use client';

import React, { useEffect, useState } from 'react';
import { ApiService, HeatmapItem } from '../services/api';
import { Flame, Calendar, Info } from 'lucide-react';

interface HeatmapProps {
  daysCount?: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ daysCount = 90 }) => {
  const [data, setData] = useState<HeatmapItem[]>([]);
  const [targetCalories, setTargetCalories] = useState<number>(2200);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredItem, setHoveredItem] = useState<HeatmapItem | null>(null);

  useEffect(() => {
    async function loadHeatmap() {
      try {
        setLoading(true);
        const res = await ApiService.getHeatmap(daysCount);
        setData(res.heatmap);
        setTargetCalories(res.targetCalories);
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
        return 'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/50';
      case 3:
        return 'bg-emerald-600/80 border-emerald-500/60';
      case 2:
        return 'bg-emerald-700/50 border-emerald-600/40';
      case 1:
        return 'bg-emerald-900/40 border-emerald-700/30';
      default:
        return 'bg-slate-900 border-white/5';
    }
  };

  const loggedDaysCount = data.filter((d) => d.count > 0).length;

  return (
    <div className="glass-panel p-5 rounded-2xl bg-slate-900/70 border border-white/10 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-none">
              Meal Consistency Heatmap
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Logged meals on <span className="text-emerald-400 font-semibold">{loggedDaysCount}</span> of the last {daysCount} days
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded bg-slate-900 border border-white/5" />
          <div className="w-3 h-3 rounded bg-emerald-900/40 border border-emerald-700/30" />
          <div className="w-3 h-3 rounded bg-emerald-700/50 border border-emerald-600/40" />
          <div className="w-3 h-3 rounded bg-emerald-600/80 border border-emerald-500/60" />
          <div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400" />
          <span>More</span>
        </div>
      </div>

      {loading ? (
        <div className="h-28 flex items-center justify-center text-xs text-slate-500 animate-pulse">
          Loading logging activity heatmap...
        </div>
      ) : (
        <div>
          {/* Heatmap Grid */}
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {data.map((item) => (
              <div
                key={item.date}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-3.5 h-3.5 rounded-sm border transition-all cursor-pointer hover:scale-125 hover:z-10 ${getLevelColor(
                  item.level
                )}`}
              />
            ))}
          </div>

          {/* Hover Tooltip / Status Footer */}
          <div className="mt-3 min-h-[24px] flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
            {hoveredItem ? (
              <div className="flex items-center gap-2 text-white font-medium animate-fadeIn">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{hoveredItem.date}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-semibold">{hoveredItem.totalCalories} kcal</span>
                <span className="text-slate-500">•</span>
                <span>{hoveredItem.count} meals logged</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Hover over any square to inspect recorded daily calories and meals</span>
              </div>
            )}

            <div className="text-[11px] text-slate-400 font-mono">
              Target: <span className="text-slate-200">{targetCalories} kcal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
