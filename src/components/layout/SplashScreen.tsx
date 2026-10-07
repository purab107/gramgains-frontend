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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-opacity duration-500 ease-out ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg mb-4">
          <Flame className="w-8 h-8" />
        </div>

        {/* Brand Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">
          {appName}
        </h1>

        <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Precision Indian Nutrition & Calorie Tracking</span>
        </p>

        {/* Loading Spinner / Bar */}
        <div className="mt-6 w-36 h-1.5 bg-muted rounded-full overflow-hidden border border-border">
          <div className="h-full bg-primary animate-pulse w-full rounded-full" />
        </div>

        <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Activity className="w-3 h-3 text-primary" />
          <span>Initializing metabolic dashboard...</span>
        </div>
      </div>
    </div>
  );
};
