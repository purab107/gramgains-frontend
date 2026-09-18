'use client';

import React from 'react';
import { Sun } from 'lucide-react';

interface BreakfastCardProps {
  calories: number;
  itemCount: number;
}

export const BreakfastCard: React.FC<BreakfastCardProps> = ({
  calories,
  itemCount,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 h-full">
      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
        <Sun className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Morning</span>
        <h3 className="text-base font-bold text-slate-900 truncate">Breakfast</h3>
        <p className="text-lg font-extrabold text-amber-700 mt-0.5 truncate">
          {Math.round(calories)} <span className="text-xs font-normal text-slate-500">kcal</span>
        </p>
        <p className="text-[11px] text-slate-400 truncate">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} logged
        </p>
      </div>
    </div>
  );
};
