'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { slideDown } from './onboardingAnimations';

interface OnboardingStepperProps {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  stepIndex?: number;
  onChange: (val: number) => void;
}

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  label,
  sublabel,
  value,
  min,
  max,
  unit,
  onChange,
}) => {
  return (
    <div className="py-3.5 sm:py-4 flex items-center justify-between">
      <div>
        <div className="text-base sm:text-lg font-medium text-white">{label}</div>
        <div className="text-xs sm:text-sm text-zinc-500">{sublabel}</div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors duration-150 active:scale-90"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-14 text-center text-xl font-bold font-mono text-white">
          {value}
          {unit && <span className="text-xs font-normal text-zinc-400 ml-1">{unit}</span>}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors duration-150 active:scale-90"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingStepper;
