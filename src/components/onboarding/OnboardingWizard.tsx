'use client';

import React, { useState } from 'react';
import { 
  User, 
  Ruler, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Flame,
  Info,
  Scale,
  Zap,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Compass
} from 'lucide-react';
import { ApiService, UserProfile } from '@/services/api';
import { MACRO_COLORS } from '@/lib/constants';
import { isDevSkip } from '@/lib/dev-skip';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  initialProfile,
}) => {
  // 5 Screens flow based on onboarding specification
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  // Accurate Mifflin-St Jeor metabolic computation aligned with backend
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
    const targetProtein = Math.round(weightKg * 2.0); // 2g per kg
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
      // Fallback for offline / dev mock mode
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

  const handleDevSkipAdvance = () => {
    if (!name) setName('Purab Sahare');
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
      {/* Ambient gradient lights behind card */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Dark Card */}
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-slate-100 ring-1 ring-white/10 transition-all">
        {/* Header Navigation & Segmented Progress */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
                GramGains Setup
              </h2>
              <p className="text-[11px] text-slate-400">Personalize starting target</p>
            </div>
          </div>

          {/* Dev Skip & 5-Segment Progress Bar */}
          <div className="flex items-center gap-3">
            {isDevSkip() && (
              <button
                type="button"
                onClick={handleDevSkipAdvance}
                className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 text-[11px] font-bold flex items-center gap-1 transition-all"
                title="Dev Skip Onboarding Step"
              >
                <span>DEV SKIP ⏭️</span>
              </button>
            )}

            {/* Segmented Progress Indicator */}
            <div className="flex items-center gap-1.5" title={`Step ${step} of 5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-6 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : i < step
                      ? 'w-2 bg-emerald-500/50'
                      : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SCREEN 1 — QUICK INTRODUCTION (NAME & SEX)                      */}
        {/* ============================================================== */}
        {step === 1 && (
          <div key="step-1" className="space-y-6 animate-fade-blur">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight mb-1.5">
                Hey! Welcome to GramGains 👋
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Let's personalize your calorie and nutrition targets. A few quick questions and we'll have your starting plan ready.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  What should we call you?
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Purab Sahare"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Sex
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'MALE', label: 'Male', icon: '👨' },
                    { id: 'FEMALE', label: 'Female', icon: '👩' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setGender(s.id as any)}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                        gender === s.id
                          ? 'bg-emerald-500/15 border-emerald-500/70 text-emerald-400 shadow-[0_0_15px_-2px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base">{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 flex items-center justify-end border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <span>Let's go</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 2 — YOUR BODY (AGE, HEIGHT, WEIGHT)                      */}
        {/* ============================================================== */}
        {step === 2 && (
          <div key="step-2" className="space-y-6 animate-fade-blur">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight mb-1.5">
                Let's get your numbers.
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your age, height and weight help us estimate how much energy your body needs at rest.
              </p>

              {/* Explanatory Why toggle */}
              <button
                type="button"
                onClick={() => setShowFormulaExplanation((prev) => !prev)}
                className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
              >
                <Info className="w-3 h-3" />
                <span>How is this calculated?</span>
                {showFormulaExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showFormulaExplanation && (
                <div className="mt-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/25 text-[11px] text-emerald-300/90 leading-relaxed animate-fade-blur">
                  These measurements calibrate your Basal Metabolic Rate (BMR) using the Mifflin-St Jeor formula — the baseline calories your body burns every 24 hours just staying alive.
                </div>
              )}
            </div>

            {/* 3-Field Unified Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Age
                </label>
                <div className="flex items-baseline justify-center gap-1">
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-14 text-center bg-transparent text-xl font-bold font-mono text-slate-100 outline-none focus:text-emerald-400"
                  />
                  <span className="text-xs text-slate-500">yrs</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Height
                </label>
                <div className="flex items-baseline justify-center gap-1">
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-14 text-center bg-transparent text-xl font-bold font-mono text-slate-100 outline-none focus:text-emerald-400"
                  />
                  <span className="text-xs text-slate-500">cm</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Weight
                </label>
                <div className="flex items-baseline justify-center gap-1">
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-14 text-center bg-transparent text-xl font-bold font-mono text-slate-100 outline-none focus:text-emerald-400"
                  />
                  <span className="text-xs text-slate-500">kg</span>
                </div>
              </div>
            </div>

            {/* Quick Live Preview Pill */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Ruler className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Calculated Base Rate (BMR)
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    <span className="font-mono text-emerald-400 font-bold">{metabolics.bmr}</span> kcal burned at complete rest
                  </div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-500/60" />
            </div>

            {/* Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 3 — USUAL WEEK ACTIVITY                                  */}
        {/* ============================================================== */}
        {step === 3 && (
          <div key="step-3" className="space-y-5 animate-fade-blur">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight mb-1.5">
                How active is your usual week?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Think about your normal routine, not your most active week.
              </p>
            </div>

            {/* 5 Activity Level Options */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {[
                { id: 'SEDENTARY', label: 'Mostly sedentary', desc: 'Desk/study job, little exercise', multiplier: '1.20x' },
                { id: 'LIGHT', label: 'Lightly active', desc: 'Exercise 1–3 days/week', multiplier: '1.38x' },
                { id: 'MODERATE', label: 'Moderately active', desc: 'Exercise 3–5 days/week', multiplier: '1.55x' },
                { id: 'VERY_ACTIVE', label: 'Very active', desc: 'Hard exercise 6–7 days/week', multiplier: '1.73x' },
                { id: 'EXTRA_ACTIVE', label: 'Extremely active', desc: 'Hard training + physically demanding routine', multiplier: '1.90x' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setActivityLevel(lvl.id as any)}
                  className={`w-full p-2.5 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    activityLevel === lvl.id
                      ? 'bg-emerald-500/15 border-emerald-500/70 text-slate-100 shadow-[0_0_15px_-2px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-100">{lvl.label}</div>
                    <div className="text-[11px] text-slate-400">{lvl.desc}</div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    activityLevel === lvl.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {lvl.multiplier}
                  </span>
                </button>
              ))}
            </div>

            {/* Optional Small Field: Daily Steps */}
            <div className="pt-2 border-t border-slate-800/60">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Optional: Average daily steps
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['<4k', '4–7k', '7–10k', '10k+', 'Not sure'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDailySteps(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      dailySteps === st
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <span>That's me</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 4 — GOAL & PACE (+ PROGRESSIVE DISCLOSURE)               */}
        {/* ============================================================== */}
        {step === 4 && (
          <div key="step-4" className="space-y-5 animate-fade-blur">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight mb-1.5">
                What are you working toward?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your primary objective to calibrate your energy balance.
              </p>
            </div>

            {/* 3 Goal Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'WEIGHT_LOSS', label: 'Lose body fat', icon: '🔥', desc: 'Caloric deficit' },
                { id: 'MAINTAIN', label: 'Maintain weight', icon: '⚖️', desc: 'Energy equilibrium' },
                { id: 'BULK', label: 'Gain muscle', icon: '💪', desc: 'Caloric surplus' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    goal === g.id
                      ? 'bg-emerald-500/15 border-emerald-500/70 text-slate-100 shadow-[0_0_15px_-2px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <div className="text-xs font-bold text-slate-100">{g.label}</div>
                  <div className="text-[10px] text-slate-400">{g.desc}</div>
                </button>
              ))}
            </div>

            {/* Progressive Disclosure: Approach & Pace */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5 animate-fade-blur">
              {goal === 'WEIGHT_LOSS' && (
                <>
                  <div className="text-xs font-semibold text-slate-200">
                    How do you want to approach it?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPace('GRADUAL')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        pace === 'GRADUAL'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">Gradual</div>
                      <div className="text-[10px] opacity-80 mt-0.5">~0.25 kg/wk · Easy to sustain</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPace('MODERATE')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        pace === 'MODERATE'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">Moderate</div>
                      <div className="text-[10px] opacity-80 mt-0.5">~0.50 kg/wk · Recommended</div>
                    </button>
                  </div>
                </>
              )}

              {goal === 'MAINTAIN' && (
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>We'll aim to keep you right around your estimated maintenance energy.</span>
                </div>
              )}

              {goal === 'BULK' && (
                <>
                  <div className="text-xs font-semibold text-slate-200">
                    How do you want to approach it?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPace('GRADUAL')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        pace === 'GRADUAL'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">Gradual</div>
                      <div className="text-[10px] opacity-80 mt-0.5">~0.20 kg/wk · Lean muscle focus</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPace('MODERATE')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        pace === 'MODERATE'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">Moderate</div>
                      <div className="text-[10px] opacity-80 mt-0.5">~0.35 kg/wk · Solid gain rate</div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <span>Build my plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 5 — THE PAYOFF (RESULTS & DAILY TARGETS)                  */}
        {/* ============================================================== */}
        {step === 5 && (
          <div key="step-5" className="space-y-5 animate-fade-blur">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">
                We've got your starting point, {name || 'Athlete'}.
              </h3>
              <p className="text-xs text-slate-400">
                Calculated from your body stats and activity level.
              </p>
            </div>

            {/* Big Numbers Comparison Card */}
            <div className="grid grid-cols-2 gap-3">
              {/* Estimated Maintenance */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Estimated Maintenance
                </div>
                <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                  {metabolics.tdee} <span className="text-xs font-normal text-slate-500">kcal/day</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Base energy expenditure
                </div>
              </div>

              {/* Starting Target */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-left shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Your Daily Target
                </div>
                <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                  {metabolics.targetCalories} <span className="text-xs font-normal text-emerald-400/70">kcal/day</span>
                </div>
                <div className="text-[10px] text-emerald-400/90 font-medium mt-1">
                  {goal === 'WEIGHT_LOSS' && `~${metabolics.tdee - metabolics.targetCalories} kcal deficit`}
                  {goal === 'BULK' && `~${metabolics.targetCalories - metabolics.tdee} kcal surplus`}
                  {goal === 'MAINTAIN' && `Exact maintenance match`}
                </div>
              </div>
            </div>

            {/* Daily Nutrition Macro Targets */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Your Daily Macro Targets
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <span className="text-sm">🥩</span>
                  <div className="text-[10px] font-bold mt-1" style={{ color: MACRO_COLORS.protein }}>
                    PROTEIN
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {metabolics.targetProtein}g
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <span className="text-sm">🍚</span>
                  <div className="text-[10px] font-bold mt-1" style={{ color: MACRO_COLORS.carbs }}>
                    CARBS
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {metabolics.targetCarbs}g
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <span className="text-sm">🥑</span>
                  <div className="text-[10px] font-bold mt-1" style={{ color: MACRO_COLORS.fat }}>
                    FAT
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {metabolics.targetFat}g
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <span className="text-sm">🌾</span>
                  <div className="text-[10px] font-bold mt-1" style={{ color: MACRO_COLORS.fiber }}>
                    FIBER
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {metabolics.targetFiber}g
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Transparency Note */}
            <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/70 text-[11px] text-slate-400 leading-relaxed">
              These are starting estimates. As you track your food and weight, GramGains will dynamically adjust them based on your actual metabolic rate.
            </div>

            {/* Footer Navigation */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                {loading ? (
                  <span>Calibrating...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Enter GramGains →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
