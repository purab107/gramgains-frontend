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
    <div className="bg-card text-card-foreground border border-border p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 h-full">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
        <SunMedium className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Afternoon</span>
        <h3 className="text-base font-bold text-foreground truncate">Lunch</h3>
        <p className="text-lg font-extrabold text-emerald-500 mt-0.5 truncate">
          {Math.round(calories)} <span className="text-xs font-normal text-muted-foreground">kcal</span>
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} logged
        </p>
      </div>
    </div>
  );
};
