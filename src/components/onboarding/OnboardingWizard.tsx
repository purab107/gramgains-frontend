'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Ruler, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Flame,
  Scale,
  Dumbbell,
  Beef,
  Wheat,
  Droplets,
  Leaf,
  Minus,
  Plus,
  X,
  Check
} from 'lucide-react';
import { ApiService, UserProfile } from '@/services/api';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  initialProfile,
}) => {
  // 5 Screens conversational flow
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Form State
  const [name, setName] = useState(initialProfile?.name || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>(initialProfile?.gender || 'MALE');
  const [age, setAge] = useState(initialProfile?.age || 24);
  const [heightCm, setHeightCm] = useState(initialProfile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState(initialProfile?.weightKg || 75);
  const [activityLevel, setActivityLevel] = useState<
    'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE'
  >(initialProfile?.activityLevel || 'MODERATE');
  const [dailySteps, setDailySteps] = useState<string>('7–10k');
  const [goal, setGoal] = useState<'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK'>(
    initialProfile?.goal || 'WEIGHT_LOSS'
  );
  const [pace, setPace] = useState<'GRADUAL' | 'MODERATE'>('MODERATE');
  const [showFormulaExplanation, setShowFormulaExplanation] = useState(false);

  // Navigation handlers with direction tracking for smooth slide left/right
  const goToNextStep = () => {
    if (step < 5) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  // Accurate Mifflin-St Jeor metabolic calculation aligned with backend
  const calculateMetabolics = () => {
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += gender === 'FEMALE' ? -161 : 5;

    const activityMultipliers: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHT: 1.375,
      MODERATE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTRA_ACTIVE: 1.9,
    };

    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

    let targetRateKgPerWeek = 0;
    let targetCalories = tdee;

    if (goal === 'WEIGHT_LOSS') {
      targetRateKgPerWeek = pace === 'GRADUAL' ? -0.25 : -0.5;
      const delta = Math.round((targetRateKgPerWeek * 7700) / 7);
      const floor = gender === 'FEMALE' ? 1200 : 1500;
      targetCalories = Math.max(floor, tdee + delta);
    } else if (goal === 'BULK') {
      targetRateKgPerWeek = pace === 'GRADUAL' ? 0.2 : 0.35;
      const delta = Math.round((targetRateKgPerWeek * 7700) / 7);
      targetCalories = tdee + delta;
    } else {
      targetRateKgPerWeek = 0;
      targetCalories = tdee;
    }

    // Macro allocation (matches backend allocateMacros)
    const targetProtein = Math.round(weightKg * 2.0); // 2.0g per kg
    const fatCalories = targetCalories * 0.25; // 25% fat
    const targetFat = Math.round(fatCalories / 9);
    const carbCalories = targetCalories - (targetProtein * 4 + targetFat * 9);
    const targetCarbs = Math.max(50, Math.round(carbCalories / 4));
    const targetFiber = 30;

    return {
      bmr: Math.round(bmr),
      tdee,
      targetRateKgPerWeek,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      targetFiber,
    };
  };

  const metabolics = calculateMetabolics();

  const handleFinish = async () => {
    try {
      setLoading(true);
      const updated = await ApiService.updateProfile({
        name: name.trim() || 'Athlete',
        gender,
        age,
        heightCm,
        weightKg,
        activityLevel,
        goal,
        targetRateKgPerWeek: metabolics.targetRateKgPerWeek,
        targetCalories: metabolics.targetCalories,
        targetProtein: metabolics.targetProtein,
        targetCarbs: metabolics.targetCarbs,
        targetFat: metabolics.targetFat,
        targetFiber: metabolics.targetFiber,
      });

      onComplete(updated);
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Fallback for offline or dev mock mode
      onComplete({
        id: 'dev-user-001',
        name: name.trim() || 'Athlete',
        email: 'athlete@gramgains.app',
        gender,
        age,
        heightCm,
        weightKg,
        activityLevel,
        goal,
        targetCalories: metabolics.targetCalories,
        targetProtein: metabolics.targetProtein,
        targetCarbs: metabolics.targetCarbs,
        targetFat: metabolics.targetFat,
        targetFiber: metabolics.targetFiber,
        onboardingCompleted: true,
      } as any);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndExit = async () => {
    await handleFinish();
  };

  // Can the user proceed from current step?
  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return age > 0 && heightCm > 0 && weightKg > 0;
    return true;
  };

  // Horizontal slide variants for questions
  const slideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 32 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 32 },
        opacity: { duration: 0.18 },
      },
    }),
  };

  // Slide down animation for cards, rows and input fields
  const slideDown: any = {
    hidden: { opacity: 0, y: -10 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.04,
        duration: 0.32,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  return (
    <div className="dark fixed inset-0 z-50 flex flex-col justify-between bg-[#070B0A] text-[#E8EDEC] h-screen max-h-screen overflow-hidden select-none font-sans">
      
      {/* ============================================================== */}
      {/* AIRBNB-STYLE TOP HEADER                                        */}
      {/* ============================================================== */}
      <header className="w-full px-8 sm:px-16 lg:px-24 py-4 sm:py-5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-emerald-950/40">
            ⚡
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">
            GramGains
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="px-4 py-2 rounded-full border border-zinc-800 bg-[#0E1513] text-xs sm:text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
          >
            Questions?
          </button>
          <button
            type="button"
            onClick={handleSaveAndExit}
            className="px-4 py-2 rounded-full border border-zinc-800 bg-[#0E1513] text-xs sm:text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all active:scale-95"
          >
            Save & exit
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN STAGE (EXPANDED HORIZONTALLY, LEFT-ALIGNED, NO SCROLL)    */}
      {/* ============================================================== */}
      <main className="flex-1 w-full max-w-4xl lg:max-w-5xl mx-auto px-8 sm:px-16 lg:px-24 flex flex-col justify-center items-start overflow-hidden">
        <div className="w-full">
          <AnimatePresence mode="wait" custom={direction}>
            
            {/* ============================================================== */}
            {/* SCREEN 1 — WELCOME & ATHLETE IDENTITY                          */}
            {/* ============================================================== */}
            {step === 1 && (
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
                    className="text-3xl sm:text-4xl font-semibold tracking-tight text-white"
                  >
                    Welcome to GramGains
                  </motion.h1>
                  <motion.p 
                    variants={slideDown} 
                    initial="hidden" 
                    animate="visible" 
                    custom={1}
                    className="mt-2 text-sm sm:text-base text-zinc-400"
                  >
                    Let's personalize your targets. What should we call you?
                  </motion.p>
                </div>

                {/* Left-Aligned, Expanded Inputs */}
                <div className="space-y-5 max-w-2xl">
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
                      onKeyDown={(e) => e.key === 'Enter' && canProceed() && goToNextStep()}
                      className="w-full bg-[#0E1513] text-lg sm:text-xl font-medium text-white placeholder-zinc-600 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 transition-all shadow-inner"
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
                    <div className="grid grid-cols-2 gap-3">
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
                            className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden active:scale-[0.98] ${
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
            )}

            {/* ============================================================== */}
            {/* SCREEN 2 — BODY METRICS WITH AIRBNB STEPPERS                   */}
            {/* ============================================================== */}
            {step === 2 && (
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
                  {/* Age Row */}
                  <motion.div 
                    variants={slideDown} 
                    initial="hidden" 
                    animate="visible" 
                    custom={2}
                    className="py-3.5 sm:py-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-base sm:text-lg font-medium text-white">Age</div>
                      <div className="text-xs sm:text-sm text-zinc-500">Years old</div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setAge((prev) => Math.max(14, prev - 1))}
                        disabled={age <= 14}
                        className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-14 text-center text-xl font-bold font-mono text-white">
                        {age}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAge((prev) => Math.min(100, prev + 1))}
                        disabled={age >= 100}
                        className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>

                  {/* Height Row */}
                  <motion.div 
                    variants={slideDown} 
                    initial="hidden" 
                    animate="visible" 
                    custom={3}
                    className="py-3.5 sm:py-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-base sm:text-lg font-medium text-white">Height</div>
                      <div className="text-xs sm:text-sm text-zinc-500">Standing height (cm)</div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setHeightCm((prev) => Math.max(100, prev - 1))}
                        disabled={heightCm <= 100}
                        className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-14 text-center text-xl font-bold font-mono text-white">
                        {heightCm}
                      </span>
                      <button
                        type="button"
                        onClick={() => setHeightCm((prev) => Math.min(250, prev + 1))}
                        disabled={heightCm >= 250}
                        className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>

                  {/* Weight Row */}
                  <motion.div 
                    variants={slideDown} 
                    initial="hidden" 
                    animate="visible" 
                    custom={4}
                    className="py-3.5 sm:py-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-base sm:text-lg font-medium text-white">Weight</div>
                      <div className="text-xs sm:text-sm text-zinc-500">Current body weight (kg)</div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setWeightKg((prev) => Math.max(30, prev - 1))}
                        disabled={weightKg <= 30}
                        className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-14 text-center text-xl font-bold font-mono text-white">
                        {weightKg}
                      </span>
                      <button
                        type="button"
                        onClick={() => setWeightKg((prev) => Math.min(250, prev + 1))}
                        disabled={weightKg >= 250}
                        className="h-10 w-10 rounded-full border border-zinc-700/80 bg-[#0E1513] flex items-center justify-center text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
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
                      <span className="text-sm font-semibold font-mono text-white">{metabolics.bmr} kcal / day at rest</span>
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
            )}

            {/* ============================================================== */}
            {/* SCREEN 3 — USUAL WEEK ACTIVITY LEVEL (NO SCROLLBAR)            */}
            {/* ============================================================== */}
            {step === 3 && (
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
                  {[
                    { id: 'SEDENTARY', label: 'Mostly sedentary', desc: 'Desk or study job, little to no workout', mult: '1.20x' },
                    { id: 'LIGHT', label: 'Lightly active', desc: 'Light workout or sports 1–3 days/week', mult: '1.38x' },
                    { id: 'MODERATE', label: 'Moderately active', desc: 'Moderate exercise or training 3–5 days/week', mult: '1.55x' },
                    { id: 'VERY_ACTIVE', label: 'Very active', desc: 'Intense training or sports 6–7 days/week', mult: '1.73x' },
                    { id: 'EXTRA_ACTIVE', label: 'Extremely active', desc: 'Hard training + physical labor occupation', mult: '1.90x' },
                  ].map((lvl, index) => {
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
                    {['<4k', '4–7k', '7–10k', '10k+', 'Not sure'].map((st) => (
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
            )}

            {/* ============================================================== */}
            {/* SCREEN 4 — PRIMARY GOAL & APPROACH PACE                        */}
            {/* ============================================================== */}
            {step === 4 && (
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
                  {[
                    { id: 'WEIGHT_LOSS', label: 'Lose body fat', icon: Flame, desc: 'Caloric deficit' },
                    { id: 'MAINTAIN', label: 'Maintain weight', icon: Scale, desc: 'Energy equilibrium' },
                    { id: 'BULK', label: 'Gain muscle', icon: Dumbbell, desc: 'Caloric surplus' },
                  ].map((g, index) => {
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
            )}

            {/* ============================================================== */}
            {/* SCREEN 5 — THE PAYOFF (CALORIE TARGET & MACROS)                */}
            {/* ============================================================== */}
            {step === 5 && (
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
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ============================================================== */}
      {/* AIRBNB-STYLE STICKY FOOTER (NO PROGRESS PILLS)                 */}
      {/* ============================================================== */}
      <footer className="w-full px-8 sm:px-16 lg:px-24 py-4 sm:py-5 flex items-center justify-between border-t border-zinc-900 shrink-0 bg-[#070B0A] z-10">
        {/* Back Button */}
        {step > 1 ? (
          <button
            type="button"
            onClick={goToPrevStep}
            className="text-sm font-medium text-zinc-300 hover:text-white underline underline-offset-4 transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {/* Next / Finish Button */}
        {step < 5 ? (
          <button
            type="button"
            onClick={goToNextStep}
            disabled={!canProceed()}
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm sm:text-base px-8 py-3.5 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Next</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={loading}
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm sm:text-base px-8 py-3.5 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Entering...</span>
              </>
            ) : (
              <>
                <span>Enter GramGains →</span>
              </>
            )}
          </button>
        )}
      </footer>

      {/* ============================================================== */}
      {/* CONTEXTUAL HELP MODAL                                          */}
      {/* ============================================================== */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-blur">
          <div className="w-full max-w-md rounded-3xl bg-[#0E1513] border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">How GramGains Works</h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="h-8 w-8 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              GramGains uses your biological sex, age, height, weight, and lifestyle to determine your Total Daily Energy Expenditure (TDEE).
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We then formulate a high-protein macronutrient plan designed to preserve lean muscle while adjusting for fat loss or caloric surplus.
            </p>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-full bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default OnboardingWizard;
