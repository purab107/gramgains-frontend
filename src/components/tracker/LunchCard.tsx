'use client';

import React from 'react';
import { SunMedium } from 'lucide-react';

interface LunchCardProps {
  calories: number;
  itemCount: number;
}

export const LunchCard: React.FC<LunchCardProps> = ({
  calories,
  itemCount,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
        <SunMedium className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Afternoon</span>
        <h3 className="text-base font-bold text-slate-900 truncate">Lunch</h3>
        <p className="text-lg font-extrabold text-emerald-700 mt-0.5 truncate">
          {Math.round(calories)} <span className="text-xs font-normal text-slate-500">kcal</span>
        </p>
        <p className="text-[11px] text-slate-400 truncate">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} logged
        </p>
      </div>
    </div>
  );
};
