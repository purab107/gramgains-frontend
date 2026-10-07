'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Scale, Dumbbell } from 'lucide-react';
import { slideVariants, slideDown } from './onboardingAnimations';

interface OnboardingGoalStepProps {
  goal: 'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK';
  setGoal: (goal: 'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK') => void;
  pace: 'GRADUAL' | 'MODERATE';
  setPace: (pace: 'GRADUAL' | 'MODERATE') => void;
  currentlyTracks: boolean;
  setCurrentlyTracks: (tracks: boolean) => void;
  currentCalories: string;
  setCurrentCalories: (cal: string) => void;
  currentProtein: string;
  setCurrentProtein: (pro: string) => void;
  direction: number;
}

const GOAL_OPTIONS = [
  { id: 'WEIGHT_LOSS', label: 'Lose body fat', icon: Flame, desc: 'Caloric deficit' },
  { id: 'MAINTAIN', label: 'Maintain weight', icon: Scale, desc: 'Energy equilibrium' },
  { id: 'BULK', label: 'Gain muscle', icon: Dumbbell, desc: 'Caloric surplus' },
] as const;

export const OnboardingGoalStep: React.FC<OnboardingGoalStepProps> = ({
  goal,
  setGoal,
  pace,
  setPace,
  currentlyTracks,
  setCurrentlyTracks,
  currentCalories,
  setCurrentCalories,
  currentProtein,
  setCurrentProtein,
  direction,
}) => {
  return (
    <motion.div
      key="step-4"
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
          What are you working toward?
        </motion.h1>
        <motion.p 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={1}
          className="mt-1 sm:mt-1.5 text-xs sm:text-base text-zinc-400"
        >
          Select your primary target to calibrate daily energy balance.
        </motion.p>
      </div>

      {/* 3 Borderless Goal Tiles Expanded Horizontally & Compact on Mobile */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        {GOAL_OPTIONS.map((g) => {
          const IconComponent = g.icon;
          const isSelected = goal === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setGoal(g.id as any)}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-colors duration-150 relative overflow-hidden active:scale-[0.98] flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-0 ${
                isSelected
                  ? 'bg-[#12231E] ring-2 ring-emerald-500 text-white shadow-xl shadow-emerald-950/20'
                  : 'bg-[#0E1513] hover:bg-[#121B19] text-zinc-400'
              }`}
            >
              <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 sm:mb-2.5 ${
                isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/60 text-zinc-400'
              }`}>
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm sm:text-base font-semibold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                  {g.label}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {g.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progressive Disclosure for Pace */}
      <div className="w-full rounded-xl sm:rounded-2xl bg-[#0E1513] p-3 sm:p-3.5 space-y-2 shadow-inner">
        <div className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-zinc-400">
          Preferred Pace & Sustainability
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setPace('GRADUAL')}
            className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-left transition-colors duration-150 active:scale-[0.98] ${
              pace === 'GRADUAL'
                ? 'bg-[#152B24] ring-1 ring-emerald-500 text-white'
                : 'bg-[#090E0D] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="text-xs sm:text-sm font-semibold text-white">Gradual & Consistent</div>
            <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              {goal === 'WEIGHT_LOSS' ? '0.25 kg / wk (−275 kcal)' : goal === 'BULK' ? '0.20 kg / wk (+220 kcal)' : 'Stable'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPace('MODERATE')}
            className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-left transition-colors duration-150 active:scale-[0.98] ${
              pace === 'MODERATE'
                ? 'bg-[#152B24] ring-1 ring-emerald-500 text-white'
                : 'bg-[#090E0D] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="text-xs sm:text-sm font-semibold text-white">Standard Target</div>
            <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              {goal === 'WEIGHT_LOSS' ? '0.50 kg / wk (−550 kcal)' : goal === 'BULK' ? '0.35 kg / wk (+385 kcal)' : 'Stable'}
            </div>
          </button>
        </div>
      </div>

      {/* Food Tracking Experience Question */}
      <div className="w-full rounded-xl sm:rounded-2xl bg-[#0E1513] p-3 sm:p-3.5 space-y-2.5 shadow-inner">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs sm:text-sm font-semibold text-white">
              Do you currently track your food?
            </div>
            <div className="text-[11px] sm:text-xs text-zinc-400">
              Optional — helps us transition you without a sudden drastic shift.
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#090E0D] p-1 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setCurrentlyTracks(false)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                !currentlyTracks
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => setCurrentlyTracks(true)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                currentlyTracks
                  ? 'bg-emerald-500 text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Yes
            </button>
          </div>
        </div>

        {currentlyTracks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
          >
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1">
                Current Daily Calories
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 2300"
                  value={currentCalories}
                  onChange={(e) => setCurrentCalories(e.target.value)}
                  className="w-full bg-[#090E0D] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-500">kcal</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1">
                Current Daily Protein <span className="text-zinc-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 140"
                  value={currentProtein}
                  onChange={(e) => setCurrentProtein(e.target.value)}
                  className="w-full bg-[#090E0D] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-500">g</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default OnboardingGoalStep;
