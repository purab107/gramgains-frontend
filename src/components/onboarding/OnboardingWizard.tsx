'use client';

import React, { useState } from 'react';
import { 
  User, 
  Ruler, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Flame
} from 'lucide-react';
import { ApiService, UserProfile } from '@/services/api';
import { MACRO_COLORS } from '@/lib/constants';

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

  const calculateMetabolics = () => {
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

    const targetProtein = Math.round(weightKg * 2.0);
    const fatCalories = targetCalories * 0.25;
    const targetFat = Math.round(fatCalories / 9);
    const carbCalories = targetCalories - (targetProtein * 4 + targetFat * 9);
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
      const updated = await ApiService.updateProfile({
        name: name || 'Athlete',
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
      });

      onComplete(updated);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F7F9F8]/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white border border-[#E1E7E5] rounded-2xl p-6 sm:p-8 shadow-xl text-[#171C1B]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E1E7E5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0A7C6E] text-white flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#171C1B] tracking-tight">
                GramGains Onboarding
              </h2>
              <p className="text-xs text-[#68716F]">Step {step} of 4</p>
            </div>
          </div>

          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-[#0A7C6E]'
                    : i < step
                    ? 'w-2 bg-[#0A7C6E]/40'
                    : 'w-2 bg-[#E1E7E5]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Name & Gender */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#171C1B] mb-1">What's your name?</h3>
              <p className="text-xs text-[#68716F]">
                Let's personalize your daily calorie dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#68716F] uppercase tracking-wider mb-2">
                  Full Name / Athlete Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#68716F]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Purab Sahare"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E1E7E5] rounded-lg text-xs text-[#171C1B] placeholder-[#68716F] focus:outline-none focus:border-[#0A7C6E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#68716F] uppercase tracking-wider mb-2">
                  Biological Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('MALE')}
                    className={`p-3.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      gender === 'MALE'
                        ? 'bg-[#0A7C6E] border-[#0A7C6E] text-white'
                        : 'bg-white border-[#E1E7E5] text-[#171C1B] hover:bg-[#E6F3F1]'
                    }`}
                  >
                    👨 Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('FEMALE')}
                    className={`p-3.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      gender === 'FEMALE'
                        ? 'bg-[#0A7C6E] border-[#0A7C6E] text-white'
                        : 'bg-white border-[#E1E7E5] text-[#171C1B] hover:bg-[#E6F3F1]'
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
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#171C1B] mb-1">Your Physical Stats</h3>
              <p className="text-xs text-[#68716F]">
                Used for accurate BMR & TDEE metabolic calculation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#68716F] mb-1">
                    Age (yrs)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E1E7E5] rounded-lg text-xs font-semibold text-[#171C1B] outline-none focus:border-[#0A7C6E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#68716F] mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E1E7E5] rounded-lg text-xs font-semibold text-[#171C1B] outline-none focus:border-[#0A7C6E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#68716F] mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E1E7E5] rounded-lg text-xs font-semibold text-[#171C1B] outline-none focus:border-[#0A7C6E]"
                  />
                </div>
              </div>

              {/* Quick Preview Card */}
              <div className="p-4 rounded-xl bg-[#E6F3F1] border border-[#B8E2DC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-[#0A7C6E]" />
                  <div>
                    <div className="text-xs text-[#075E54]">Base Metabolic Rate (BMR)</div>
                    <div className="text-base font-bold text-[#171C1B] font-mono">
                      {metabolics.bmr} <span className="text-xs font-normal text-[#68716F]">kcal/day</span>
                    </div>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-[#0A7C6E]" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Activity Level */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#171C1B] mb-1">Daily Activity Level</h3>
              <p className="text-xs text-[#68716F]">How active are you on an average week?</p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'SEDENTARY', label: 'Sedentary', desc: 'Desk job, little to no exercise', multiplier: '1.2x' },
                { id: 'LIGHT', label: 'Lightly Active', desc: 'Exercise 1-3 times / week', multiplier: '1.375x' },
                { id: 'MODERATE', label: 'Moderately Active', desc: 'Exercise 3-5 times / week', multiplier: '1.55x' },
                { id: 'VERY_ACTIVE', label: 'Very Active', desc: 'Hard exercise 6-7 days / week', multiplier: '1.725x' },
                { id: 'EXTRA_ACTIVE', label: 'Extra Active', desc: 'Physical job or double training', multiplier: '1.9x' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setActivityLevel(lvl.id as any)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    activityLevel === lvl.id
                      ? 'bg-[#0A7C6E] border-[#0A7C6E] text-white'
                      : 'bg-white border-[#E1E7E5] text-[#171C1B] hover:bg-[#E6F3F1]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs">{lvl.label}</div>
                    <div className={`text-[11px] ${activityLevel === lvl.id ? 'text-teal-100' : 'text-[#68716F]'}`}>{lvl.desc}</div>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    activityLevel === lvl.id ? 'bg-[#075E54] text-white' : 'bg-[#E6F3F1] text-[#075E54]'
                  }`}>
                    {lvl.multiplier}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Goals & Target Recommendation */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#171C1B] mb-1">Fitness Goal & Targets</h3>
              <p className="text-xs text-[#68716F]">Select your target strategy.</p>
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
                  className={`p-3 rounded-xl border text-center transition-all ${
                    goal === g.id
                      ? 'bg-[#0A7C6E] border-[#0A7C6E] text-white font-bold'
                      : 'bg-white border-[#E1E7E5] text-[#171C1B] hover:bg-[#E6F3F1]'
                  }`}
                >
                  <div className="text-xs font-semibold">{g.label}</div>
                  <div className={`text-[10px] mt-0.5 ${goal === g.id ? 'text-teal-100' : 'text-[#68716F]'}`}>{g.desc}</div>
                </button>
              ))}
            </div>

            {/* Calculated Results Summary Box */}
            <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E1E7E5] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E1E7E5] pb-3">
                <div>
                  <div className="text-xs text-[#68716F] font-medium">Estimated TDEE</div>
                  <div className="text-sm font-bold text-[#171C1B] font-mono">{metabolics.tdee} kcal/day</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#0A7C6E] font-medium">Recommended Target</div>
                  <div className="text-xl font-extrabold text-[#075E54] font-mono">{metabolics.targetCalories} kcal</div>
                </div>
              </div>

              {/* Macro Targets */}
              <div>
                <div className="text-xs font-semibold text-[#171C1B] mb-2">Daily Macro Breakdown</div>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 rounded-lg bg-white border border-[#E1E7E5]">
                    <div className="text-[10px] font-sans font-bold" style={{ color: MACRO_COLORS.protein }}>PROTEIN</div>
                    <div className="text-xs font-bold text-[#171C1B] mt-0.5">{metabolics.targetProtein}g</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#E1E7E5]">
                    <div className="text-[10px] font-sans font-bold" style={{ color: MACRO_COLORS.carbs }}>CARBS</div>
                    <div className="text-xs font-bold text-[#171C1B] mt-0.5">{metabolics.targetCarbs}g</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#E1E7E5]">
                    <div className="text-[10px] font-sans font-bold" style={{ color: MACRO_COLORS.fat }}>FAT</div>
                    <div className="text-xs font-bold text-[#171C1B] mt-0.5">{metabolics.targetFat}g</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#E1E7E5]">
                    <div className="text-[10px] font-sans font-bold" style={{ color: MACRO_COLORS.fiber }}>FIBER</div>
                    <div className="text-xs font-bold text-[#171C1B] mt-0.5">{metabolics.targetFiber}g</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#E1E7E5]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg border border-[#E1E7E5] text-[#171C1B] hover:bg-[#E6F3F1] text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
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
              className="px-5 py-2 rounded-lg bg-[#0A7C6E] hover:bg-[#075E54] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#0A7C6E] hover:bg-[#075E54] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <span>Saving Target...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
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
