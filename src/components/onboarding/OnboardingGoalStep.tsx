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
      className="w-full text-left space-y-5"
    >
      <div>
        <motion.h1 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={0}
          className="text-3xl sm:text-4xl font-semibold tracking-tight text-white"
        >
          What are you working toward?
        </motion.h1>
        <motion.p 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={1}
          className="mt-2 text-sm sm:text-base text-zinc-400"
        >
          Select your primary target to calibrate daily energy balance.
        </motion.p>
      </div>

      {/* 3 Borderless Goal Tiles Expanded Horizontally */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {GOAL_OPTIONS.map((g, index) => {
          const IconComponent = g.icon;
          const isSelected = goal === g.id;
          return (
            <motion.button
              key={g.id}
              variants={slideDown}
              initial="hidden"
              animate="visible"
              custom={index + 2}
              type="button"
              onClick={() => setGoal(g.id as any)}
              className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden active:scale-[0.98] ${
                isSelected
                  ? 'bg-[#12231E] ring-2 ring-emerald-500 text-white shadow-xl shadow-emerald-950/20'
                  : 'bg-[#0E1513] hover:bg-[#121B19] text-zinc-400'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${
                isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/60 text-zinc-400'
              }`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                {g.label}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {g.desc}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Progressive Disclosure for Pace */}
      <motion.div 
        variants={slideDown} 
        initial="hidden" 
        animate="visible" 
        custom={5}
        className="w-full rounded-2xl bg-[#0E1513] p-4 space-y-2.5 shadow-inner"
      >
        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
          Preferred Pace & Sustainability
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPace('GRADUAL')}
            className={`p-3 rounded-xl text-left transition-all active:scale-[0.98] ${
              pace === 'GRADUAL'
                ? 'bg-[#152B24] ring-1 ring-emerald-500 text-white'
                : 'bg-[#090E0D] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="text-sm font-semibold text-white">Gradual & Consistent</div>
            <div className="text-xs text-zinc-400 mt-0.5">
              {goal === 'WEIGHT_LOSS' ? '0.25 kg / week' : goal === 'BULK' ? '0.2 kg / week' : 'Stable maintenance'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPace('MODERATE')}
            className={`p-3 rounded-xl text-left transition-all active:scale-[0.98] ${
              pace === 'MODERATE'
                ? 'bg-[#152B24] ring-1 ring-emerald-500 text-white'
                : 'bg-[#090E0D] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="text-sm font-semibold text-white">Standard Target</div>
            <div className="text-xs text-zinc-400 mt-0.5">
              {goal === 'WEIGHT_LOSS' ? '0.50 kg / week' : goal === 'BULK' ? '0.35 kg / week' : 'Stable maintenance'}
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingGoalStep;
