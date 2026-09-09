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

  const loggedDaysCount = data.filter((d) => d.count > 0).length;

  return (
    <div className="bg-[#FFFFFF] border border-[#E1E7E5] p-5 rounded-xl shadow-sm relative overflow-hidden text-[#171C1B]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#E6F3F1] border border-[#B8E2DC] text-[#075E54]">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#171C1B] text-sm leading-none">
              Meal Consistency Heatmap
            </h3>
            <p className="text-xs text-[#68716F] mt-1">
              Logged meals on <span className="text-[#0A7C6E] font-semibold">{loggedDaysCount}</span> of the last {daysCount} days
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#68716F]">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-[#F7F9F8] border border-[#E1E7E5]" />
          <div className="w-3 h-3 rounded-sm bg-[#E6F3F1] border border-[#B8E2DC]" />
          <div className="w-3 h-3 rounded-sm bg-[#4DACA0] border border-[#0A7C6E]" />
          <div className="w-3 h-3 rounded-sm bg-[#0A7C6E] border border-[#075E54]" />
          <div className="w-3 h-3 rounded-sm bg-[#075E54] border border-[#05443D]" />
          <span>More</span>
        </div>
      </div>

      {loading ? (
        <div className="h-28 flex items-center justify-center text-xs text-[#68716F] animate-pulse">
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
          <div className="mt-3 min-h-[24px] flex items-center justify-between text-xs text-[#68716F] pt-2 border-t border-[#E1E7E5]">
            {hoveredItem ? (
              <div className="flex items-center gap-2 text-[#171C1B] font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#0A7C6E]" />
                <span>{hoveredItem.date}</span>
                <span className="text-[#E1E7E5]">•</span>
                <span className="text-[#075E54] font-bold font-mono">{hoveredItem.totalCalories} kcal</span>
                <span className="text-[#E1E7E5]">•</span>
                <span>{hoveredItem.count} meals logged</span>
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
