'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ApiService, UserProfile } from '@/services/api';

import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingFooter } from './OnboardingFooter';
import { OnboardingHelpModal } from './OnboardingHelpModal';
import { OnboardingIdentityStep } from './OnboardingIdentityStep';
import { OnboardingBodyMetricsStep } from './OnboardingBodyMetricsStep';
import { OnboardingActivityStep } from './OnboardingActivityStep';
import { OnboardingGoalStep } from './OnboardingGoalStep';
import { OnboardingNutritionPlanStep } from './OnboardingNutritionPlanStep';

export interface OnboardingWizardProps {
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

  React.useEffect(() => {
    if (initialProfile?.name && (!name || name === 'Athlete')) {
      setName(initialProfile.name);
    }
  }, [initialProfile]);

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
        onboardingCompleted: true,
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

  return (
    <div className="dark fixed inset-0 z-50 flex flex-col justify-between bg-[#070B0A] text-[#E8EDEC] h-[100dvh] max-h-[100dvh] overflow-hidden select-none font-sans">
      
      {/* Top Header */}
      <OnboardingHeader
        onOpenHelp={() => setShowHelpModal(true)}
        onSaveAndExit={handleSaveAndExit}
      />

      {/* Main Focus Stage (Centered on Screen) */}
      <main className="flex-1 min-h-0 w-full px-5 sm:px-12 flex flex-col justify-center items-center overflow-y-auto sm:overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full max-w-2xl lg:max-w-3xl mx-auto my-auto text-left py-4 sm:py-6">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <OnboardingIdentityStep
                name={name}
                setName={setName}
                gender={gender}
                setGender={setGender}
                direction={direction}
                canProceed={canProceed()}
                onEnterNext={goToNextStep}
              />
            )}

            {step === 2 && (
              <OnboardingBodyMetricsStep
                age={age}
                setAge={setAge}
                heightCm={heightCm}
                setHeightCm={setHeightCm}
                weightKg={weightKg}
                setWeightKg={setWeightKg}
                bmr={metabolics.bmr}
                direction={direction}
              />
            )}

            {step === 3 && (
              <OnboardingActivityStep
                activityLevel={activityLevel}
                setActivityLevel={setActivityLevel}
                dailySteps={dailySteps}
                setDailySteps={setDailySteps}
                direction={direction}
              />
            )}

            {step === 4 && (
              <OnboardingGoalStep
                goal={goal}
                setGoal={setGoal}
                pace={pace}
                setPace={setPace}
                direction={direction}
              />
            )}

            {step === 5 && (
              <OnboardingNutritionPlanStep
                name={name}
                goal={goal}
                metabolics={metabolics}
                direction={direction}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <OnboardingFooter
        step={step}
        loading={loading}
        canProceed={canProceed()}
        onBack={goToPrevStep}
        onNext={goToNextStep}
        onFinish={handleFinish}
      />

      {/* Contextual Help Modal */}
      <OnboardingHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

    </div>
  );
};

export default OnboardingWizard;
