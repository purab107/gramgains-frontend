'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { slideVariants, slideDown } from './onboardingAnimations';

interface OnboardingActivityStepProps {
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';
  setActivityLevel: (lvl: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE') => void;
  dailySteps: string;
  setDailySteps: (steps: string) => void;
  direction: number;
}

const ACTIVITY_LEVELS = [
  { id: 'SEDENTARY', label: 'Mostly sedentary', desc: 'Desk or study job, little to no workout', mult: '1.20x' },
  { id: 'LIGHT', label: 'Lightly active', desc: 'Light workout or sports 1–3 days/week', mult: '1.38x' },
  { id: 'MODERATE', label: 'Moderately active', desc: 'Moderate exercise or training 3–5 days/week', mult: '1.55x' },
  { id: 'VERY_ACTIVE', label: 'Very active', desc: 'Intense training or sports 6–7 days/week', mult: '1.73x' },
  { id: 'EXTRA_ACTIVE', label: 'Extremely active', desc: 'Hard training + physical labor occupation', mult: '1.90x' },
] as const;

const STEP_OPTIONS = ['<4k', '4–7k', '7–10k', '10k+', 'Not sure'];

export const OnboardingActivityStep: React.FC<OnboardingActivityStepProps> = ({
  activityLevel,
  setActivityLevel,
  dailySteps,
  setDailySteps,
  direction,
}) => {
  return (
    <motion.div
      key="step-3"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full text-left space-y-4"
    >
      <div>
        <motion.h1 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={0}
          className="text-3xl sm:text-4xl font-semibold tracking-tight text-white"
        >
          How active is your usual week?
        </motion.h1>
        <motion.p 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={1}
          className="mt-1.5 text-sm sm:text-base text-zinc-400"
        >
          Select the option that reflects your normal baseline routine.
        </motion.p>
      </div>

      {/* Expanded Borderless Rows (Compact height to guarantee zero scroll) */}
      <div className="w-full divide-y divide-zinc-800/60">
        {ACTIVITY_LEVELS.map((lvl, index) => {
          const isSelected = activityLevel === lvl.id;
          return (
            <motion.div
              key={lvl.id}
              variants={slideDown}
              initial="hidden"
              animate="visible"
              custom={index + 2}
              onClick={() => setActivityLevel(lvl.id as any)}
              className={`py-3 px-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                isSelected
                  ? 'bg-[#12231E] ring-1 ring-emerald-500/80 shadow-md'
                  : 'hover:bg-[#0D1513]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                <div className={`text-base font-medium ${isSelected ? 'text-white font-semibold' : 'text-zinc-200'}`}>
                  {lvl.label}
                </div>
                <div className="text-xs sm:text-sm text-zinc-400">
                  {lvl.desc}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-full ${
                  isSelected 
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold' 
                    : 'bg-zinc-800/80 text-zinc-400'
                }`}>
                  {lvl.mult}
                </span>
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500 text-black' 
                    : 'border-zinc-700 bg-transparent'
                }`}>
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Steps Selector Row (Compact & Horizontal) */}
      <motion.div 
        variants={slideDown} 
        initial="hidden" 
        animate="visible" 
        custom={7}
        className="pt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4"
      >
        <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500 shrink-0">
          Average Daily Steps:
        </label>
        <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
          {STEP_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setDailySteps(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                dailySteps === st
                  ? 'bg-emerald-500 text-black font-semibold shadow-md shadow-emerald-950/30'
                  : 'bg-[#0E1513] text-zinc-400 hover:text-white hover:bg-[#121B19]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingActivityStep;
