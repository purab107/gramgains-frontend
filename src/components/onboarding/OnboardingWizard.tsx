'use client';

import React, { useState } from 'react';
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
  Loader2
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

  return (
    <div className="dark fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4 sm:p-6 bg-[#070B0A] text-[#E8EDEC] overflow-y-auto">
      {/* Horizontally Expanded Matte Finish Card Container */}
      <div className="w-full max-w-2xl sm:max-w-3xl rounded-2xl border border-[#1E2B29] bg-[#0B100F] p-7 sm:p-10 shadow-2xl text-[#E8EDEC]">
        
        {/* ============================================================== */}
        {/* SCREEN 1 — QUICK INTRODUCTION (NAME & SEX)                      */}
        {/* ============================================================== */}
        {step === 1 && (
          <div key="step-1" className="space-y-6 animate-fade-blur">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Hey! Welcome to GramGains 👋
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Let's personalize your calorie and nutrition targets. A few quick questions and we'll have your starting plan ready.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  What should we call you?
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Hunter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Sex
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'MALE', label: 'Male', emoji: '👨' },
                    { id: 'FEMALE', label: 'Female', emoji: '👩' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setGender(s.id as any)}
                      className={`py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        gender === s.id
                          ? 'border-2 border-primary bg-primary/10 text-foreground font-semibold'
                          : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 flex items-center justify-end border-t border-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="rounded-xl bg-primary py-2.5 px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <span>Let's go</span>
                <ArrowRight className="h-4 w-4" />
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
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Let's get your numbers.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Your age, height and weight help us estimate how much energy your body needs at rest.
              </p>

              {/* Explanatory Why toggle */}
              <button
                type="button"
                onClick={() => setShowFormulaExplanation((prev) => !prev)}
                className="mt-2 text-xs text-primary hover:underline flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>How is this calculated?</span>
                {showFormulaExplanation ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showFormulaExplanation && (
                <div className="mt-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed animate-fade-blur">
                  These measurements are used with the clinically validated Mifflin-St Jeor formula to estimate your Basal Metabolic Rate (BMR) — the calories your body burns every day simply staying alive.
                </div>
              )}
            </div>

            {/* 3-Column Unified Input Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Age
                </label>
                <div className="flex items-baseline justify-center gap-1">
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-14 text-center bg-transparent text-xl font-bold font-mono text-foreground outline-none focus:text-primary"
                  />
                  <span className="text-xs text-muted-foreground">yrs</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Height
                </label>
                <div className="flex items-baseline justify-center gap-1">
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-14 text-center bg-transparent text-xl font-bold font-mono text-foreground outline-none focus:text-primary"
                  />
                  <span className="text-xs text-muted-foreground">cm</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Weight
                </label>
                <div className="flex items-baseline justify-center gap-1">
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-14 text-center bg-transparent text-xl font-bold font-mono text-foreground outline-none focus:text-primary"
                  />
                  <span className="text-xs text-muted-foreground">kg</span>
                </div>
              </div>
            </div>

            {/* Base Metabolic Rate Info Pill */}
            <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Ruler className="h-4 w-4 text-primary" />
                <div className="text-xs text-muted-foreground">
                  Base Metabolic Rate (BMR): <span className="font-mono font-semibold text-foreground">{metabolics.bmr} kcal/day</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">At rest</span>
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-border">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-border bg-muted/40 py-2.5 px-4 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-xl bg-primary py-2.5 px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
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
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                How active is your usual week?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Think about your normal routine, not your most active week.
              </p>
            </div>

            {/* 5 Activity Options */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {[
                { id: 'SEDENTARY', label: 'Mostly sedentary', desc: 'Desk/study job, little exercise', mult: '1.20x' },
                { id: 'LIGHT', label: 'Lightly active', desc: 'Exercise 1–3 days/week', mult: '1.38x' },
                { id: 'MODERATE', label: 'Moderately active', desc: 'Exercise 3–5 days/week', mult: '1.55x' },
                { id: 'VERY_ACTIVE', label: 'Very active', desc: 'Hard exercise 6–7 days/week', mult: '1.73x' },
                { id: 'EXTRA_ACTIVE', label: 'Extremely active', desc: 'Hard training + physically demanding routine', mult: '1.90x' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setActivityLevel(lvl.id as any)}
                  className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-all ${
                    activityLevel === lvl.id
                      ? 'border-2 border-primary bg-primary/10 text-foreground font-semibold'
                      : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">{lvl.label}</div>
                    <div className="text-xs text-muted-foreground">{lvl.desc}</div>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                    {lvl.mult}
                  </span>
                </button>
              ))}
            </div>

            {/* Optional Steps Selector */}
            <div className="pt-2 border-t border-border">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Optional: Average daily steps
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['<4k', '4–7k', '7–10k', '10k+', 'Not sure'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDailySteps(st)}
                    className={`px-3 py-1 rounded-lg text-xs transition-all ${
                      dailySteps === st
                        ? 'border-2 border-primary bg-primary/10 text-foreground font-semibold'
                        : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="pt-3 flex items-center justify-between border-t border-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-xl border border-border bg-muted/40 py-2.5 px-4 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-xl bg-primary py-2.5 px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center gap-1.5"
              >
                <span>That's me</span>
                <ArrowRight className="h-4 w-4" />
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
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                What are you working toward?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Choose your primary focus to calibrate energy balance.
              </p>
            </div>

            {/* 3 Goal Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'WEIGHT_LOSS', label: 'Lose body fat', emoji: '🔥', desc: 'Caloric deficit' },
                { id: 'MAINTAIN', label: 'Maintain weight', emoji: '⚖️', desc: 'Energy equilibrium' },
                { id: 'BULK', label: 'Gain muscle', emoji: '💪', desc: 'Caloric surplus' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id as any)}
                  className={`p-3.5 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    goal === g.id
                      ? 'border-2 border-primary bg-primary/10 text-foreground font-semibold'
                      : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="text-xl">{g.emoji}</span>
                  <div className="text-xs font-semibold text-foreground">{g.label}</div>
                  <div className="text-[11px] text-muted-foreground">{g.desc}</div>
                </button>
              ))}
            </div>

            {/* Progressive Disclosure for Pace */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5 animate-fade-blur">
              {goal === 'WEIGHT_LOSS' && (
                <>
                  <div className="text-xs font-medium text-foreground">
                    How do you want to approach it?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPace('GRADUAL')}
                      className={`p-2.5 rounded-lg text-left text-xs transition-all ${
                        pace === 'GRADUAL'
                          ? 'border-2 border-primary bg-primary/10 text-foreground font-semibold'
                          : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="font-semibold text-foreground">Gradual</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">~0.25 kg/wk · Easy to sustain</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPace('MODERATE')}
                      className={`p-2.5 rounded-lg text-left text-xs transition-all ${
                        pace === 'MODERATE'
                          ? 'border-2 border-primary bg-primary/10 text-foreground font-semibold'
                          : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="font-semibold text-foreground">Moderate</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">~0.50 kg/wk · Recommended</div>
                    </button>
                  </div>
                </>
              )}

              {goal === 'MAINTAIN' && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>We'll aim to keep you right around your estimated maintenance calories.</span>
                </div>
              )}

              {goal === 'BULK' && (
                <>
                  <div className="text-xs font-medium text-foreground">
                    How do you want to approach it?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPace('GRADUAL')}
                      className={`p-2.5 rounded-lg text-left text-xs transition-all ${
                        pace === 'GRADUAL'
                          ? 'border-2 border-primary bg-primary/10 text-foreground font-semibold'
                          : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="font-semibold text-foreground">Gradual</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">~0.20 kg/wk · Lean muscle gain</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPace('MODERATE')}
                      className={`p-2.5 rounded-lg text-left text-xs transition-all ${
                        pace === 'MODERATE'
                          ? 'border-2 border-primary bg-primary/10 text-foreground font-semibold'
                          : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="font-semibold text-foreground">Moderate</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">~0.35 kg/wk · Faster progress</div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="pt-3 flex items-center justify-between border-t border-border">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-xl border border-border bg-muted/40 py-2.5 px-4 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="rounded-xl bg-primary py-2.5 px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center gap-1.5"
              >
                <span>Build my plan</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 5 — THE PAYOFF (CALORIE PRESCIPTION & MACROS)            */}
        {/* ============================================================== */}
        {step === 5 && (
          <div key="step-5" className="space-y-5 animate-fade-blur">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                We've got your starting point, {name || 'Athlete'}.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Based on your body stats and usual activity.
              </p>
            </div>

            {/* Numbers Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Estimated Maintenance */}
              <div className="rounded-xl border border-border bg-card p-4 text-left">
                <div className="text-xs font-medium text-muted-foreground">
                  Estimated maintenance
                </div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  {metabolics.tdee} <span className="text-xs font-normal text-muted-foreground">kcal/day</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Daily expenditure baseline
                </div>
              </div>

              {/* Starting Target */}
              <div className="rounded-xl border-2 border-primary bg-primary/10 p-4 text-left">
                <div className="text-xs font-semibold text-primary">
                  Your starting target
                </div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  {metabolics.targetCalories} <span className="text-xs font-normal text-muted-foreground">kcal/day</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {goal === 'WEIGHT_LOSS' && `~${metabolics.tdee - metabolics.targetCalories} kcal below maintenance`}
                  {goal === 'BULK' && `~${metabolics.targetCalories - metabolics.tdee} kcal above maintenance`}
                  {goal === 'MAINTAIN' && `Exact maintenance match`}
                </div>
              </div>
            </div>

            {/* Daily Nutrition Targets (Macro Cards) */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Your daily nutrition targets
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-xl border border-border bg-card p-2.5 text-center">
                  <span className="text-base">🥩</span>
                  <div className="text-[11px] font-bold text-macro-protein mt-1">PROTEIN</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {metabolics.targetProtein}g
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-2.5 text-center">
                  <span className="text-base">🍚</span>
                  <div className="text-[11px] font-bold text-macro-carb mt-1">CARBS</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {metabolics.targetCarbs}g
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-2.5 text-center">
                  <span className="text-base">🥑</span>
                  <div className="text-[11px] font-bold text-macro-fats mt-1">FAT</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {metabolics.targetFat}g
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-2.5 text-center">
                  <span className="text-base">🌾</span>
                  <div className="text-[11px] font-bold text-foreground mt-1">FIBER</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {metabolics.targetFiber}g
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Transparency Disclaimer */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
              These are starting estimates. As you track your food and weight, GramGains can help you adjust them based on your actual progress.
            </div>

            {/* Footer Navigation */}
            <div className="pt-3 flex items-center justify-between border-t border-border">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-xl border border-border bg-muted/40 py-2.5 px-4 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="rounded-xl bg-primary py-2.5 px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all flex items-center gap-2"
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
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OnboardingWizard;
