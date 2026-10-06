'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Beef, Wheat, Droplets, Leaf } from 'lucide-react';
import { slideVariants, slideDown } from './onboardingAnimations';

interface MetabolicsData {
  bmr: number;
  tdee: number;
  targetRateKgPerWeek: number;
  effectiveRateKgPerWeek?: number;
  isFloorApplied?: boolean;
  referenceWeightKg?: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
}

interface OnboardingNutritionPlanStepProps {
  name: string;
  goal: 'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK';
  metabolics: MetabolicsData;
  currentlyTracks?: boolean;
  currentCalories?: string;
  direction: number;
}

export const OnboardingNutritionPlanStep: React.FC<OnboardingNutritionPlanStepProps> = ({
  name,
  goal,
  metabolics,
  currentlyTracks,
  currentCalories,
  direction,
}) => {
  const effectiveRate = metabolics.effectiveRateKgPerWeek !== undefined
    ? metabolics.effectiveRateKgPerWeek
    : metabolics.targetRateKgPerWeek;

  const currentCalNum = currentCalories ? parseFloat(currentCalories) : null;
  const calShift = currentCalNum ? Math.round(metabolics.targetCalories - currentCalNum) : null;

  return (
    <motion.div
      key="step-5"
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
          Here is your starting blueprint, {name || 'Athlete'}.
        </motion.h1>
        <motion.p 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={1}
          className="mt-1 sm:mt-1.5 text-xs sm:text-base text-zinc-400"
        >
          These are initial estimates — we will personalize them dynamically as you log.
        </motion.p>
      </div>

      {/* High Impact Numbers Summary Cards */}
      <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* Estimated Maintenance */}
        <motion.div 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={2}
          className="rounded-xl sm:rounded-2xl bg-[#0E1513] p-3.5 sm:p-5 text-left shadow-inner flex flex-col justify-between"
        >
          <div>
            <div className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Estimated Maintenance
            </div>
            <div className="text-xl sm:text-3xl font-bold font-mono text-white mt-1">
              {metabolics.tdee} <span className="text-xs sm:text-sm font-normal text-zinc-400">kcal</span>
            </div>
          </div>
          <div className="text-[11px] sm:text-xs text-zinc-500 mt-2">
            Baseline daily expenditure
          </div>
        </motion.div>

        {/* Daily Target */}
        <motion.div 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={3}
          className="rounded-xl sm:rounded-2xl bg-[#12231E] ring-1 ring-emerald-500/80 p-3.5 sm:p-5 text-left shadow-lg shadow-emerald-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-emerald-400">
                Daily Target
              </span>
              {metabolics.isFloorApplied && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Floor active
                </span>
              )}
            </div>
            <div className="text-xl sm:text-3xl font-bold font-mono text-white mt-1">
              {metabolics.targetCalories} <span className="text-xs sm:text-sm font-normal text-emerald-300">kcal</span>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <div className="text-[11px] sm:text-xs text-zinc-300 font-medium">
              {goal === 'WEIGHT_LOSS' && `${metabolics.targetCalories - metabolics.tdee} kcal deficit`}
              {goal === 'BULK' && `+${metabolics.targetCalories - metabolics.tdee} kcal surplus`}
              {goal === 'MAINTAIN' && `Exact expenditure match`}
            </div>

            {currentlyTracks && calShift !== null && (
              <div className="text-[10px] sm:text-[11px] text-emerald-400/90 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 inline-block">
                ~{currentCalNum} kcal now → shift of {calShift > 0 ? `+${calShift}` : `${calShift}`} kcal
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Macro Tiles (4-Column Balanced Grid) */}
      <motion.div 
        variants={slideDown} 
        initial="hidden" 
        animate="visible" 
        custom={4}
        className="w-full space-y-2"
      >
        <div className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-zinc-500">
          Daily Macronutrient Breakdown
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Protein */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0E1513] p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-1">
              <Beef className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold tracking-wider text-purple-400">PROTEIN</div>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
              {metabolics.targetProtein}g
            </div>
          </div>

          {/* Carbs */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0E1513] p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-1">
              <Wheat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold tracking-wider text-rose-400">CARBS</div>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
              {metabolics.targetCarbs}g
            </div>
          </div>

          {/* Fat */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0E1513] p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-1">
              <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold tracking-wider text-amber-400">FAT</div>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
              {metabolics.targetFat}g
            </div>
          </div>

          {/* Fiber */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0E1513] p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1">
              <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold tracking-wider text-emerald-400">FIBER</div>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
              {metabolics.targetFiber}g
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expected Weekly Rate Card */}
      <motion.div 
        variants={slideDown} 
        initial="hidden" 
        animate="visible" 
        custom={5}
        className="w-full rounded-xl sm:rounded-2xl bg-[#0E1513] px-3.5 py-2.5 sm:py-3 flex items-center justify-between shadow-inner"
      >
        <span className="text-xs text-zinc-400">Expected weekly rate</span>
        <span className="text-xs sm:text-sm font-semibold font-mono text-white">
          {effectiveRate < 0 && `~${Math.abs(effectiveRate).toFixed(2)} kg loss / week`}
          {effectiveRate > 0 && `~${effectiveRate.toFixed(2)} kg gain / week`}
          {effectiveRate === 0 && 'Maintenance (0.00 kg / week)'}
        </span>
      </motion.div>

      {/* Calibration Transparency Disclaimer */}
      <motion.div 
        variants={slideDown} 
        initial="hidden" 
        animate="visible" 
        custom={6}
        className="w-full rounded-xl sm:rounded-2xl bg-[#0B1210] p-3 text-[11px] sm:text-xs text-zinc-400 leading-relaxed border border-zinc-800/40 flex items-start gap-2.5"
      >
        <div className="text-emerald-400 shrink-0 font-bold text-sm leading-none mt-0.5">ⓘ</div>
        <div>
          These are starting estimates. Human metabolism varies by ±15%. GramGains will calibrate your targets automatically as you log your weight and food over 2–4 weeks.
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingNutritionPlanStep;
