'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { slideVariants, slideDown } from './onboardingAnimations';

interface OnboardingActivityStepProps {
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';
  setActivityLevel: (lvl: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE') => void;
  direction: number;
}

const ACTIVITY_LEVELS = [
  { id: 'SEDENTARY', label: 'Mostly sedentary', desc: 'Desk or study job, little to no exercise' },
  { id: 'LIGHT', label: 'Lightly active', desc: 'Light workout or sports 1–3 days/week' },
  { id: 'MODERATE', label: 'Moderately active', desc: 'Moderate training 3–5 days/week' },
  { id: 'VERY_ACTIVE', label: 'Very active', desc: 'Intense training 6–7 days/week' },
  { id: 'EXTRA_ACTIVE', label: 'Extremely active', desc: 'Hard training + physically demanding routine' },
] as const;

export const OnboardingActivityStep: React.FC<OnboardingActivityStepProps> = ({
  activityLevel,
  setActivityLevel,
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
          className="text-2xl sm:text-4xl font-semibold tracking-tight text-white"
        >
          How active is your usual week?
        </motion.h1>
        <motion.p 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={1}
          className="mt-1 sm:mt-1.5 text-xs sm:text-base text-zinc-400"
        >
          Select the option that reflects your normal baseline routine. Daily movement and training are factored in automatically.
        </motion.p>
      </div>

      {/* Expanded Borderless Rows (Compact height to guarantee zero scroll) */}
      <div className="w-full divide-y divide-zinc-800/60">
        {ACTIVITY_LEVELS.map((lvl) => {
          const isSelected = activityLevel === lvl.id;
          return (
            <div
              key={lvl.id}
              onClick={() => setActivityLevel(lvl.id as any)}
              className={`py-2.5 sm:py-3 px-3 sm:px-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors duration-150 active:scale-[0.99] ${
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
              <div className="flex items-center">
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500 text-black' 
                    : 'border-zinc-700 bg-transparent'
                }`}>
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default OnboardingActivityStep;
