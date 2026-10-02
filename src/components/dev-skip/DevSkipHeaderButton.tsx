'use client';

import React, { useState } from 'react';
import { useDevSkip } from './DevSkipProvider';
import { isDevSkip } from '@/lib/dev-skip';
import { 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal, 
  Minimize2, 
  Maximize2,
  Flame,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

export function DevSkipHeaderButton() {
  if (!isDevSkip()) {
    return null;
  }

  const { activeStage, advanceStage, openPanel, totalStages } = useDevSkip();
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <aside aria-label="Dev Skip Minimized Controls" className="fixed top-2.5 left-1/2 -translate-x-1/2 z-[9990] animate-in fade-in slide-in-from-top-2 duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 dark:bg-slate-950/90 
                     text-amber-400 border border-amber-500/40 shadow-xl backdrop-blur-md 
                     hover:border-amber-400 transition-all text-xs font-semibold"
          title="Expand Dev Skip Header"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Stage {activeStage.id}/{totalStages}</span>
          <Maximize2 className="h-3 w-3 text-slate-400 ml-1" />
        </button>
      </aside>
    );
  }

  return (
    <header aria-label="Dev Skip Top Navigation" className="fixed top-2.5 left-1/2 -translate-x-1/2 z-[9990] animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="flex items-center gap-1.5 p-1 pl-2.5 rounded-full bg-slate-900/92 dark:bg-slate-950/92 
                      text-white border border-slate-700/60 shadow-2xl backdrop-blur-md">
        
        {/* Stage Badge & Title */}
        <button
          onClick={openPanel}
          className="flex items-center gap-2 pr-2 text-left group hover:opacity-85 transition-opacity"
          title="Click to view full Dev Journey & State Matrix"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Sparkles className="h-3 w-3" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Step {activeStage.id}/{totalStages}
              </span>
              <span className="text-[11px] font-semibold text-slate-200 line-clamp-1 max-w-[130px] sm:max-w-[200px]">
                {activeStage.name.replace(/^\d+\.\s*/, '')}
              </span>
            </div>
          </div>
        </button>

        {/* Vertical divider */}
        <div className="h-4 w-[1px] bg-slate-700/60" />

        {/* Primary DEV SKIP Action Button */}
        <button
          onClick={advanceStage}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 
                     text-white font-bold text-xs shadow-md transition-all active:scale-95 border border-emerald-400/40"
          title={`Advance to next step: ${activeStage.actionButtonLabel}`}
        >
          <span className="tracking-wide">DEV SKIP</span>
          <span className="text-[11px] font-medium opacity-90 hidden sm:inline">
            ({activeStage.actionButtonLabel})
          </span>
          <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>

        {/* Panel trigger */}
        <button
          onClick={openPanel}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Open Dev Skip HUD & States"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>

        {/* Minimize button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Minimize bar"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
