'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { slideVariants, slideDown } from './onboardingAnimations';

interface OnboardingIdentityStepProps {
  name: string;
  setName: (name: string) => void;
  gender: 'MALE' | 'FEMALE';
  setGender: (gender: 'MALE' | 'FEMALE') => void;
  direction: number;
  canProceed: boolean;
  onEnterNext: () => void;
}

export const OnboardingIdentityStep: React.FC<OnboardingIdentityStepProps> = ({
  name,
  setName,
  gender,
  setGender,
  direction,
  canProceed,
  onEnterNext,
}) => {
  return (
    <motion.div
      key="step-1"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full text-left space-y-6"
    >
      <div>
        <motion.h1 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={0}
          className="text-2xl sm:text-4xl font-semibold tracking-tight text-white"
        >
          Welcome to GramGains
        </motion.h1>
        <motion.p 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={1}
          className="mt-1.5 sm:mt-2 text-xs sm:text-base text-zinc-400"
        >
          Let's personalize your targets. What should we call you?
        </motion.p>
      </div>

      {/* Left-Aligned, Expanded Inputs */}
      <div className="space-y-4 sm:space-y-5 max-w-2xl">
        {/* Name Input */}
        <motion.div 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={2}
          className="space-y-1.5"
        >
          <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
            Your Name or Nickname
          </label>
          <input
            type="text"
            autoFocus
            required
            placeholder="e.g. Alex Hunter"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canProceed && onEnterNext()}
            className="w-full bg-[#0E1513] text-base sm:text-xl font-medium text-white placeholder-zinc-600 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 transition-colors shadow-inner"
          />
        </motion.div>

        {/* Biological Sex Selection */}
        <motion.div 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={3}
          className="space-y-1.5"
        >
          <label className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
            Biological Sex (for metabolic baseline)
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {[
              { id: 'MALE', label: 'Male', desc: 'Calibrated metabolic constant' },
              { id: 'FEMALE', label: 'Female', desc: 'Calibrated metabolic constant' },
            ].map((item) => {
              const isSelected = gender === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGender(item.id as any)}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-colors duration-150 relative overflow-hidden active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#12231E] ring-2 ring-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                      : 'bg-[#0E1513] hover:bg-[#121B19] text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                      {item.label}
                    </span>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OnboardingIdentityStep;
