'use client';

import React from 'react';
import { Moon } from 'lucide-react';

interface DinnerCardProps {
  calories: number;
  itemCount: number;
}

export const DinnerCard: React.FC<DinnerCardProps> = ({
  calories,
  itemCount,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
        <Moon className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Night</span>
        <h3 className="text-base font-bold text-slate-900 truncate">Dinner</h3>
        <p className="text-lg font-extrabold text-indigo-700 mt-0.5 truncate">
          {Math.round(calories)} <span className="text-xs font-normal text-slate-500">kcal</span>
        </p>
        <p className="text-[11px] text-slate-400 truncate">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} logged
        </p>
      </div>
    </div>
  );
};
