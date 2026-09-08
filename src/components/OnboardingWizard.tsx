'use client';

import React, { useState } from 'react';
import { 
  User, 
  Ruler, 
  Weight, 
  Activity, 
  Target, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Flame
} from 'lucide-react';
import { ApiService, UserProfile } from '../services/api';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  initialProfile,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(initialProfile?.name || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>(initialProfile?.gender || 'MALE');
  const [age, setAge] = useState(initialProfile?.age || 25);
  const [heightCm, setHeightCm] = useState(initialProfile?.heightCm || 175);
  const [weightKg, setWeightKg] = useState(initialProfile?.weightKg || 70);
  const [activityLevel, setActivityLevel] = useState<
    'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE'
  >(initialProfile?.activityLevel || 'MODERATE');
  const [goal, setGoal] = useState<'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK'>(
    initialProfile?.goal || 'MAINTAIN'
  );

  // Formula Calculations
  const calculateMetabolics = () => {
    // Mifflin-St Jeor Equation
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += gender === 'MALE' ? 5 : -161;

    const activityMultipliers = {
      SEDENTARY: 1.2,
      LIGHT: 1.375,
      MODERATE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTRA_ACTIVE: 1.9,
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

    let targetCalories = tdee;
    if (goal === 'WEIGHT_LOSS') targetCalories = Math.max(1200, tdee - 500);
    if (goal === 'BULK') targetCalories = tdee + 350;

    // Macro Ratios: Protein 2g/kg, Fat 25% of calories, Rest Carbs
    const targetProtein = Math.round(weightKg * 2.0);
    const fatCalories = targetCalories * 0.25;
    const targetFat = Math.round(fatCalories / 9);
    const carbCalories = targetCalories - (targetProtein * 4 + fatCalories);
    const targetCarbs = Math.max(50, Math.round(carbCalories / 4));
    const targetFiber = 30;

    return {
      bmr: Math.round(bmr),
      tdee,
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
      const payload: Partial<UserProfile> = {
        name: name.trim() || 'Athlete',
        gender,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        activityLevel,
        goal,
        bmr: metabolics.bmr,
        tdee: metabolics.tdee,
        targetCalories: metabolics.targetCalories,
        targetProtein: metabolics.targetProtein,
        targetCarbs: metabolics.targetCarbs,
        targetFat: metabolics.targetFat,
        targetFiber: metabolics.targetFiber,
      };

      const updated = await ApiService.updateProfile(payload);
      onComplete(updated);
    } catch (err) {
      console.error('Failed to save profile during onboarding:', err);
      // Fallback local completion if backend error
      onComplete({
        id: 'default-user',
        name: name.trim() || 'Athlete',
        gender,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        activityLevel,
        goal,
        bmr: metabolics.bmr,
        tdee: metabolics.tdee,
        targetCalories: metabolics.targetCalories,
        targetProtein: metabolics.targetProtein,
        targetCarbs: metabolics.targetCarbs,
        targetFat: metabolics.targetFat,
        targetFiber: metabolics.targetFiber,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        {/* Glowing aura background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                GramGains Onboarding
              </h2>
              <p className="text-xs text-slate-400">Step {step} of 4</p>
            </div>
          </div>

          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-gradient-to-r from-emerald-400 to-blue-500'
                    : i < step
                    ? 'w-2 bg-emerald-500/50'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Name & Gender */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">What's your name?</h3>
              <p className="text-sm text-slate-400">
                Let's personalize your daily calorie dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name / Athlete Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Purab Sahare"
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Biological Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('MALE')}
                    className={`p-4 rounded-2xl border text-center font-semibold transition-all ${
                      gender === 'MALE'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/50 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    👨 Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('FEMALE')}
                    className={`p-4 rounded-2xl border text-center font-semibold transition-all ${
                      gender === 'FEMALE'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/50 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    👩 Female
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Physical Metrics */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Your Physical Stats</h3>
              <p className="text-sm text-slate-400">
                Used for accurate BMR & TDEE metabolic calculation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age (yrs)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-white font-semibold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-white font-semibold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-white font-semibold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs text-slate-400">Base Metabolic Rate (BMR)</div>
                    <div className="text-lg font-bold text-white">
                      {metabolics.bmr} <span className="text-xs text-slate-400">kcal/day</span>
                    </div>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Activity Level */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Daily Activity Level</h3>
              <p className="text-sm text-slate-400">How active are you on an average week?</p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'SEDENTARY',
                  label: 'Sedentary',
                  desc: 'Desk job, little to no exercise',
                  multiplier: '1.2x',
                },
                {
                  id: 'LIGHT',
                  label: 'Lightly Active',
                  desc: 'Exercise 1-3 times / week',
                  multiplier: '1.375x',
                },
                {
                  id: 'MODERATE',
                  label: 'Moderately Active',
                  desc: 'Exercise 3-5 times / week',
                  multiplier: '1.55x',
                },
                {
                  id: 'VERY_ACTIVE',
                  label: 'Very Active',
                  desc: 'Hard exercise 6-7 days / week',
                  multiplier: '1.725x',
                },
                {
                  id: 'EXTRA_ACTIVE',
                  label: 'Extra Active',
                  desc: 'Physical job or double training',
                  multiplier: '1.9x',
                },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setActivityLevel(lvl.id as any)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    activityLevel === lvl.id
                      ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/10 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-800/40 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm text-white">{lvl.label}</div>
                    <div className="text-xs text-slate-400">{lvl.desc}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-1 bg-slate-900 rounded-lg">
                    {lvl.multiplier}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Goals & Target Recommendation */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Fitness Goal & Targets</h3>
              <p className="text-sm text-slate-400">Select your target strategy.</p>
            </div>

            {/* Goal Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'WEIGHT_LOSS', label: 'Weight Loss', desc: '-500 kcal cut' },
                { id: 'MAINTAIN', label: 'Maintain', desc: 'Stay at TDEE' },
                { id: 'BULK', label: 'Muscle Bulk', desc: '+350 kcal surplus' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id as any)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    goal === g.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-semibold">{g.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>

            {/* Calculated Results Summary Box */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Estimated TDEE Maintenance</div>
                  <div className="text-lg font-bold text-white">{metabolics.tdee} kcal/day</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-400 font-semibold">Recommended Target</div>
                  <div className="text-2xl font-extrabold text-emerald-400">{metabolics.targetCalories} kcal</div>
                </div>
              </div>

              {/* Macro Targets */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">Daily Macro Breakdown</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-400 font-bold">PROTEIN</div>
                    <div className="text-sm font-bold text-white">{metabolics.targetProtein}g</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-blue-500/20">
                    <div className="text-[10px] text-blue-400 font-bold">CARBS</div>
                    <div className="text-sm font-bold text-white">{metabolics.targetCarbs}g</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-purple-500/20">
                    <div className="text-[10px] text-purple-400 font-bold">FAT</div>
                    <div className="text-sm font-bold text-white">{metabolics.targetFat}g</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-amber-500/20">
                    <div className="text-[10px] text-amber-400 font-bold">FIBER</div>
                    <div className="text-sm font-bold text-white">{metabolics.targetFiber}g</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white text-sm font-bold flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
            >
              {loading ? (
                <span>Saving Target...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Launch Dashboard</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
