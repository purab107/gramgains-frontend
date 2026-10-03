'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Beef, Wheat, Droplets, Leaf } from 'lucide-react';
import { slideVariants, slideDown } from './onboardingAnimations';

interface MetabolicsData {
  bmr: number;
  tdee: number;
  targetRateKgPerWeek: number;
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
  direction: number;
}

export const OnboardingNutritionPlanStep: React.FC<OnboardingNutritionPlanStepProps> = ({
  name,
  goal,
  metabolics,
  direction,
}) => {
  return (
    <motion.div
      key="step-5"
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
          Here is your starting blueprint, {name || 'Athlete'}.
        </motion.h1>
        <motion.p 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={1}
          className="mt-2 text-sm sm:text-base text-zinc-400"
        >
          Scientifically calculated for your energy expenditure and goals.
        </motion.p>
      </div>

      {/* High Impact Numbers Summary Cards */}
      <div className="w-full grid grid-cols-2 gap-4">
        {/* Maintenance TDEE */}
        <motion.div 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={2}
          className="rounded-2xl bg-[#0E1513] p-4 sm:p-5 text-left shadow-inner"
        >
          <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
            Maintenance TDEE
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
            {metabolics.tdee} <span className="text-xs sm:text-sm font-normal text-zinc-400">kcal/day</span>
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Baseline daily expenditure
          </div>
        </motion.div>

        {/* Starting Target Calories */}
        <motion.div 
          variants={slideDown} 
          initial="hidden" 
          animate="visible" 
          custom={3}
          className="rounded-2xl bg-[#12231E] ring-1 ring-emerald-500/80 p-4 sm:p-5 text-left shadow-lg shadow-emerald-950/20"
        >
          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
            Daily Calorie Target
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
            {metabolics.targetCalories} <span className="text-xs sm:text-sm font-normal text-emerald-300">kcal/day</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {goal === 'WEIGHT_LOSS' && `~${metabolics.tdee - metabolics.targetCalories} kcal deficit`}
            {goal === 'BULK' && `~${metabolics.targetCalories - metabolics.tdee} kcal surplus`}
            {goal === 'MAINTAIN' && `Exact expenditure match`}
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
        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
          Daily Macronutrient Breakdown
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Protein */}
          <div className="rounded-2xl bg-[#0E1513] p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-7 w-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-1">
              <Beef className="h-4 w-4" />
            </div>
            <div className="text-xs font-bold tracking-wider text-purple-400">PROTEIN</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {metabolics.targetProtein}g
            </div>
          </div>

          {/* Carbs */}
          <div className="rounded-2xl bg-[#0E1513] p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-7 w-7 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-1">
              <Wheat className="h-4 w-4" />
            </div>
            <div className="text-xs font-bold tracking-wider text-rose-400">CARBS</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {metabolics.targetCarbs}g
            </div>
          </div>

          {/* Fat */}
          <div className="rounded-2xl bg-[#0E1513] p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-7 w-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-1">
              <Droplets className="h-4 w-4" />
            </div>
            <div className="text-xs font-bold tracking-wider text-amber-400">FAT</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {metabolics.targetFat}g
            </div>
          </div>

          {/* Fiber */}
          <div className="rounded-2xl bg-[#0E1513] p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1">
              <Leaf className="h-4 w-4" />
            </div>
            <div className="text-xs font-bold tracking-wider text-emerald-400">FIBER</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {metabolics.targetFiber}g
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transparency Note */}
      <motion.div 
        variants={slideDown} 
        initial="hidden" 
        animate="visible" 
        custom={5}
        className="w-full rounded-2xl bg-[#0B1210] p-3 text-xs text-zinc-400 leading-relaxed border border-zinc-800/40"
      >
        These are your baseline estimates. As you log your food and weigh-ins, GramGains dynamically refines your calorie and macro prescription.
      </motion.div>
    </motion.div>
  );
};

export default OnboardingNutritionPlanStep;
