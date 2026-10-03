'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, ChevronDown, ChevronUp } from 'lucide-react';
import { slideVariants, slideDown } from './onboardingAnimations';
import { OnboardingStepper } from './OnboardingStepper';

interface OnboardingBodyMetricsStepProps {
  age: number;
  setAge: (val: number | ((prev: number) => number)) => void;
  heightCm: number;
  setHeightCm: (val: number | ((prev: number) => number)) => void;
  weightKg: number;
  setWeightKg: (val: number | ((prev: number) => number)) => void;
  bmr: number;
  direction: number;
}

export const OnboardingBodyMetricsStep: React.FC<OnboardingBodyMetricsStepProps> = ({
  age,
  setAge,
  heightCm,
  setHeightCm,
  weightKg,
  setWeightKg,
  bmr,
  direction,
}) => {
  const [showFormulaExplanation, setShowFormulaExplanation] = useState(false);

  return (
    <motion.div
      key="step-2"
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
          Tell us about your body
        </motion.h1>
        <motion.p 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={1}
          className="mt-2 text-sm sm:text-base text-zinc-400"
        >
          Used by the Mifflin-St Jeor equation to estimate resting caloric burn.
        </motion.p>
      </div>

      {/* Full-Width Borderless Rows with Dividers & Steppers */}
      <div className="w-full divide-y divide-zinc-800/60">
        <OnboardingStepper
          label="Age"
          sublabel="Years old"
          value={age}
          min={14}
          max={100}
          stepIndex={2}
          onChange={(val) => setAge(val)}
        />

        <OnboardingStepper
          label="Height"
          sublabel="Standing height (cm)"
          value={heightCm}
          min={100}
          max={250}
          stepIndex={3}
          onChange={(val) => setHeightCm(val)}
        />

        <OnboardingStepper
          label="Weight"
          sublabel="Current body weight (kg)"
          value={weightKg}
          min={30}
          max={250}
          stepIndex={4}
          onChange={(val) => setWeightKg(val)}
        />
      </div>

      {/* Live Metabolic Calculation Pill */}
      <motion.div 
        variants={slideDown} 
        initial="hidden" 
        animate="visible" 
        custom={5}
        className="rounded-2xl bg-[#0E1513] px-4 py-3 flex items-center justify-between shadow-inner"
      >
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Ruler className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-zinc-400">Calculated Basal Metabolic Rate (BMR):</span>
            <span className="text-sm font-semibold font-mono text-white">{bmr} kcal / day at rest</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
          className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>Formula</span>
          {showFormulaExplanation ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </motion.div>

      {showFormulaExplanation && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[#0B1210] p-3 text-xs text-zinc-400 leading-relaxed border border-zinc-800/40"
        >
          Estimated using the clinically validated Mifflin-St Jeor formula (10 × wt + 6.25 × ht - 5 × age + sex constant), calculating the baseline energy needed to sustain life at rest.
        </motion.div>
      )}
    </motion.div>
  );
};

export default OnboardingBodyMetricsStep;
