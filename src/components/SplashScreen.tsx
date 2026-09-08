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
      }, 600);
      return () => clearTimeout(finishTimer);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0F19] transition-opacity duration-700 ease-out ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Glow Backplate */}
        <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-full blur-2xl animate-pulse" />

        {/* Brand Icon */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-6 transform transition-transform animate-bounce">
          <Flame className="w-10 h-10 text-white" />
        </div>

        {/* Brand Title */}
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-2">
          {appName}
        </h1>

        <p className="text-sm text-slate-400 flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Precision Indian Nutrition & Calorie Tracking</span>
        </p>

        {/* Loading Spinner / Bar */}
        <div className="mt-8 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-pulse w-full rounded-full" />
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>Initializing your metabolic dashboard...</span>
        </div>
      </div>
    </div>
  );
};
