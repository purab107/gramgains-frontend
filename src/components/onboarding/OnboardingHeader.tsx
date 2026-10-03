'use client';

import React from 'react';

interface OnboardingHeaderProps {
  onOpenHelp: () => void;
  onSaveAndExit: () => void;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  onOpenHelp,
  onSaveAndExit,
}) => {
  return (
    <header className="w-full px-8 sm:px-16 lg:px-24 py-4 sm:py-5 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-emerald-950/40">
          ⚡
        </div>
        <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">
          GramGains
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenHelp}
          className="px-4 py-2 rounded-full border border-zinc-800 bg-[#0E1513] text-xs sm:text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
        >
          Questions?
        </button>
        <button
          type="button"
          onClick={onSaveAndExit}
          className="px-4 py-2 rounded-full border border-zinc-800 bg-[#0E1513] text-xs sm:text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
        >
          Save & exit
        </button>
      </div>
    </header>
  );
};

export default OnboardingHeader;
