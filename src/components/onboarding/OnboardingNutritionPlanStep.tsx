'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Beef, Wheat, Droplets, Leaf, ShieldCheck } from 'lucide-react';
import { slideVariants, slideDown } from './onboardingAnimations';
import { CalorieLeadUpSchedule } from '@/utils/calorieTransition';

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

export interface OnboardingNutritionPlanStepProps {
  name: string;
  goal: 'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK';
  metabolics: MetabolicsData;
  currentlyTracks?: boolean;
  currentCalories?: string;
  leadUpSchedule?: CalorieLeadUpSchedule;
  direction: number;
}

export const OnboardingNutritionPlanStep: React.FC<OnboardingNutritionPlanStepProps> = ({
  name,
  goal,
  metabolics,
  currentlyTracks,
  currentCalories,
  leadUpSchedule,
  direction,
}) => {
  const effectiveRate =
    metabolics.effectiveRateKgPerWeek !== undefined
      ? metabolics.effectiveRateKgPerWeek
      : metabolics.targetRateKgPerWeek;

  const hasLeadUp = Boolean(leadUpSchedule?.hasLeadUp && leadUpSchedule.steps.length > 0);
  const activeCalories = hasLeadUp
    ? leadUpSchedule!.steps[0].targetCalories
    : metabolics.targetCalories;

  // Recalculate macro breakdown for active week calories if lead-up is active
  const refWeight = metabolics.referenceWeightKg || 70;
  const activeProtein = metabolics.targetProtein;
  const rawFat = Math.round((activeCalories * 0.28) / 9);
  const minFat = Math.round(refWeight * 0.6);
  const activeFat = Math.max(rawFat, minFat);
  const remainingCals = activeCalories - activeProtein * 4 - activeFat * 9;
  const activeCarbs = Math.round(Math.max(0, remainingCals) / 4);
  const activeFiber = Math.min(38, Math.max(20, Math.round((activeCalories / 1000) * 14)));

  const currentCalNum = currentCalories ? parseFloat(currentCalories) : null;
  const calShift = currentCalNum ? Math.round(activeCalories - currentCalNum) : null;

  return (
    <motion.div
      key="step-5"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full text-left space-y-3.5 sm:space-y-4 max-h-[calc(100dvh-170px)] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div>
        <motion.h1
          variants={slideDown}
          initial="hidden"
          animate="visible"
          custom={0}
          className="text-2xl sm:text-4xl font-semibold tracking-tight text-white"
        >
          {hasLeadUp ? `Your transition plan, ${name || 'Athlete'}.` : `Here is your starting blueprint, ${name || 'Athlete'}.`}
        </motion.h1>
        <motion.p
          variants={slideDown}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mt-1 sm:mt-1.5 text-xs sm:text-base text-zinc-400"
        >
          {hasLeadUp
            ? 'We detected a difference between your current intake and your goal target. We will guide you there in manageable weekly steps.'
            : 'These are initial estimates — we will personalize them dynamically as you log.'}
        </motion.p>
      </div>

      {/* THREE-ANCHOR CALORIE COMPARISON ROW (When Lead-Up Active) */}
      {hasLeadUp && leadUpSchedule && (
        <motion.div
          variants={slideDown}
          initial="hidden"
          animate="visible"
          custom={2}
          className="w-full rounded-xl sm:rounded-2xl bg-[#0E1513] border border-emerald-900/30 p-3 sm:p-4 space-y-2.5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Three Calorie Anchors
            </span>
            <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700/50">
              {leadUpSchedule.gapClass} GAP ({Math.abs(leadUpSchedule.gapCalories)} kcal)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Anchor A: Current Intake */}
            <div className="rounded-lg bg-[#070B0A] p-2 sm:p-2.5 border border-zinc-800/60 flex flex-col justify-between">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Your Intake</div>
              <div className="text-base sm:text-xl font-bold font-mono text-zinc-200 my-0.5">
                {leadUpSchedule.currentIntake}
              </div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500">Current avg</div>
            </div>

            {/* Anchor C: Estimated Maintenance (TDEE) */}
            <div className="rounded-lg bg-[#070B0A] p-2 sm:p-2.5 border border-zinc-800/60 flex flex-col justify-between">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Maintenance</div>
              <div className="text-base sm:text-xl font-bold font-mono text-zinc-200 my-0.5">
                {leadUpSchedule.estimatedMaintenance}
              </div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500">Estimated TDEE</div>
            </div>

            {/* Anchor B: Calculated Goal Target */}
            <div className="rounded-lg bg-[#070B0A] p-2 sm:p-2.5 border border-emerald-800/40 bg-emerald-950/20 flex flex-col justify-between">
              <div className="text-[10px] sm:text-[11px] text-emerald-300 font-medium">Goal Target</div>
              <div className="text-base sm:text-xl font-bold font-mono text-emerald-400 my-0.5">
                {leadUpSchedule.calculatedTarget}
              </div>
              <div className="text-[9px] sm:text-[10px] text-emerald-500/80">Final destination</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* High Impact Numbers Summary Cards */}
      <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* Estimated Maintenance */}
        <motion.div
          variants={slideDown}
          initial="hidden"
          animate="visible"
          custom={hasLeadUp ? 3 : 2}
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

        {/* Active Target Card (Week 1 Target or Daily Target) */}
        <motion.div
          variants={slideDown}
          initial="hidden"
          animate="visible"
          custom={hasLeadUp ? 3 : 3}
          className="rounded-xl sm:rounded-2xl bg-[#12231E] ring-1 ring-emerald-500/80 p-3.5 sm:p-5 text-left shadow-lg shadow-emerald-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-emerald-400">
                {hasLeadUp ? 'Week 1 Target' : 'Daily Target'}
              </span>
              {metabolics.isFloorApplied && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Floor active
                </span>
              )}
            </div>
            <div className="text-xl sm:text-3xl font-bold font-mono text-white mt-1">
              {activeCalories} <span className="text-xs sm:text-sm font-normal text-emerald-300">kcal</span>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <div className="text-[11px] sm:text-xs text-zinc-300 font-medium">
              {hasLeadUp ? (
                <span className="text-emerald-400 font-semibold">
                  Step 1 of {leadUpSchedule?.steps.length} • Gradual Lead-Up
                </span>
              ) : (
                <>
                  {goal === 'WEIGHT_LOSS' && `${metabolics.targetCalories - metabolics.tdee} kcal deficit`}
                  {goal === 'BULK' && `+${metabolics.targetCalories - metabolics.tdee} kcal surplus`}
                  {goal === 'MAINTAIN' && `Exact expenditure match`}
                </>
              )}
            </div>

            {currentlyTracks && calShift !== null && (
              <div className="text-[10px] sm:text-[11px] text-emerald-400/90 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 inline-block">
                ~{currentCalNum} kcal now → shift of {calShift > 0 ? `+${calShift}` : `${calShift}`} kcal
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* GRADUAL LEAD-UP TIMELINE SCHEDULE (When Lead-Up Active) */}
      {hasLeadUp && leadUpSchedule && (
        <motion.div
          variants={slideDown}
          initial="hidden"
          animate="visible"
          custom={4}
          className="w-full rounded-xl sm:rounded-2xl bg-[#0E1513] border border-zinc-800/80 p-3.5 sm:p-4 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-zinc-400">
              Adjustment Timeline
            </span>
            <span className="text-[10px] text-zinc-500">7 days per step</span>
          </div>

          <div className="space-y-2">
            {leadUpSchedule.steps.map((s, idx) => (
              <div
                key={s.weekNumber}
                className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl border ${
                  idx === 0
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-[#070B0A] border-zinc-800/60 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-mono ${
                      idx === 0
                        ? 'bg-emerald-500 text-black'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {s.weekNumber}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                      <span>Week {s.weekNumber}</span>
                      {idx === 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active Now
                        </span>
                      )}
                      {s.isInitialTarget && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Goal Target Reached
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs sm:text-sm font-bold font-mono text-white">
                    {s.targetCalories} kcal
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {s.deltaFromPrevious > 0 ? `+${s.deltaFromPrevious}` : `${s.deltaFromPrevious}`} kcal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Macro Tiles (4-Column Balanced Grid) */}
      <motion.div
        variants={slideDown}
        initial="hidden"
        animate="visible"
        custom={hasLeadUp ? 5 : 4}
        className="w-full space-y-2"
      >
        <div className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-zinc-500 flex items-center justify-between">
          <span>{hasLeadUp ? 'Week 1 Macronutrient Allocation' : 'Daily Macronutrient Breakdown'}</span>
          {hasLeadUp && (
            <span className="text-[10px] text-zinc-500 lowercase">scales as calories advance</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Protein */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0E1513] p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-1">
              <Beef className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold tracking-wider text-purple-400">PROTEIN</div>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
              {activeProtein}g
            </div>
          </div>

          {/* Carbs */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0E1513] p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-1">
              <Wheat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold tracking-wider text-rose-400">CARBS</div>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
              {activeCarbs}g
            </div>
          </div>

          {/* Fat */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0E1513] p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-1">
              <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold tracking-wider text-amber-400">FAT</div>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
              {activeFat}g
            </div>
          </div>

          {/* Fiber */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0E1513] p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1">
              <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold tracking-wider text-emerald-400">FIBER</div>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
              {activeFiber}g
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expected Weekly Rate Card */}
      <motion.div
        variants={slideDown}
        initial="hidden"
        animate="visible"
        custom={hasLeadUp ? 6 : 5}
        className="w-full rounded-xl sm:rounded-2xl bg-[#0E1513] px-3.5 py-2.5 sm:py-3 flex items-center justify-between shadow-inner"
      >
        <span className="text-xs text-zinc-400">Target weekly rate</span>
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
        custom={hasLeadUp ? 7 : 6}
        className="w-full rounded-xl sm:rounded-2xl bg-[#0B1210] p-3 text-[11px] sm:text-xs text-zinc-400 leading-relaxed border border-zinc-800/40 flex items-start gap-2.5"
      >
        <div className="text-emerald-400 shrink-0 font-bold text-sm leading-none mt-0.5">ⓘ</div>
        <div>
          {hasLeadUp
            ? 'Your calorie targets step towards your goal each week. As you log meals and scale weight, GramGains calibrates your true metabolic expenditure in parallel.'
            : 'These are starting estimates. Human metabolism varies by ±15%. GramGains will calibrate your targets automatically as you log your weight and food over 2–4 weeks.'}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingNutritionPlanStep;
