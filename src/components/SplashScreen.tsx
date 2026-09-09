'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Sparkles, Activity } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  appName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  appName = 'GramGains',
}) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      const finishTimer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 500);
      return () => clearTimeout(finishTimer);
    }, 1200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F7F9F8] text-[#171C1B] transition-opacity duration-500 ease-out ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#0A7C6E] text-white flex items-center justify-center shadow-md mb-4">
          <Flame className="w-8 h-8" />
        </div>

        {/* Brand Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-[#171C1B] mb-1">
          {appName}
        </h1>

        <p className="text-xs text-[#68716F] flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#0A7C6E]" />
          <span>Precision Indian Nutrition & Calorie Tracking</span>
        </p>

        {/* Loading Spinner / Bar */}
        <div className="mt-6 w-36 h-1.5 bg-[#E6F3F1] rounded-full overflow-hidden border border-[#E1E7E5]">
          <div className="h-full bg-[#0A7C6E] animate-pulse w-full rounded-full" />
        </div>

        <div className="mt-3 flex items-center gap-1 text-[11px] text-[#68716F]">
          <Activity className="w-3 h-3 text-[#0A7C6E]" />
          <span>Initializing metabolic dashboard...</span>
        </div>
      </div>
    </div>
  );
};
