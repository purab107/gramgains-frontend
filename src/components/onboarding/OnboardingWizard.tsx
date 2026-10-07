'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ApiService, UserProfile } from '@/services/api';
import { buildLeadUpSchedule } from '@/utils/calorieTransition';

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
  const [goal, setGoal] = useState<'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK'>(
    initialProfile?.goal || 'WEIGHT_LOSS'
  );
  const [pace, setPace] = useState<'GRADUAL' | 'MODERATE'>('MODERATE');
  const [currentlyTracks, setCurrentlyTracks] = useState(false);
  const [currentCalories, setCurrentCalories] = useState('');
  const [currentProtein, setCurrentProtein] = useState('');

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

  // Accurate Mifflin-St Jeor metabolic calculation aligned with canonical rules
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
    if (goal === 'WEIGHT_LOSS') {
      targetRateKgPerWeek = pace === 'GRADUAL' ? -0.25 : -0.5;
    } else if (goal === 'BULK') {
      targetRateKgPerWeek = pace === 'GRADUAL' ? 0.2 : 0.35;
    } else {
      targetRateKgPerWeek = 0;
    }

    const delta = Math.round((targetRateKgPerWeek * 7700) / 7);
    const rawTargetCalories = tdee + delta;
    const clinicalFloor = gender === 'FEMALE' ? 1200 : 1500;
    const targetCalories = Math.max(clinicalFloor, rawTargetCalories);
    const isFloorApplied = rawTargetCalories < clinicalFloor;
    const effectiveRateKgPerWeek = isFloorApplied
      ? Math.round(((targetCalories - tdee) * 7 / 7700) * 100) / 100
      : targetRateKgPerWeek;

    // Canonical reference weight (BMI <= 25: actual; otherwise fallback 23.0 * heightM^2)
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const referenceWeightKg = bmi <= 25 ? weightKg : Math.round(23.0 * heightM * heightM * 10) / 10;

    // Canonical Macro allocation
    const targetProtein = Math.round(referenceWeightKg * 1.8);
    const rawFatGrams = Math.round((targetCalories * 0.28) / 9);
    const minFatGrams = Math.round(referenceWeightKg * 0.6);
    const targetFat = Math.max(rawFatGrams, minFatGrams);

    const remainingCalories = targetCalories - (targetProtein * 4) - (targetFat * 9);
    const targetCarbs = Math.round(Math.max(0, remainingCalories) / 4);

    const targetFiber = Math.min(38, Math.max(20, Math.round((targetCalories / 1000) * 14)));

    return {
      bmr: Math.round(bmr),
      tdee,
      targetRateKgPerWeek,
      effectiveRateKgPerWeek,
      isFloorApplied,
      referenceWeightKg,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      targetFiber,
    };
  };

  const metabolics = calculateMetabolics();
  const clinicalFloor = gender === 'FEMALE' ? 1200 : 1500;
  const leadUpSchedule = buildLeadUpSchedule({
    currentIntake: currentCalories ? parseFloat(currentCalories) : 0,
    calculatedTarget: metabolics.targetCalories,
    estimatedMaintenance: metabolics.tdee,
    safetyFloor: clinicalFloor,
    currentlyTracksFood: currentlyTracks,
    daysSinceOnboarding: 0,
  });

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
        targetRateKgPerWeek: metabolics.effectiveRateKgPerWeek ?? metabolics.targetRateKgPerWeek,
        targetCalories: metabolics.targetCalories,
        targetProtein: metabolics.targetProtein,
        targetCarbs: metabolics.targetCarbs,
        targetFat: metabolics.targetFat,
        targetFiber: metabolics.targetFiber,
        currentlyTracksFood: currentlyTracks,
        currentTrackedCalories: currentCalories ? parseFloat(currentCalories) : null,
        currentTrackedProtein: currentProtein ? parseFloat(currentProtein) : null,
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
        targetRateKgPerWeek: metabolics.effectiveRateKgPerWeek ?? metabolics.targetRateKgPerWeek,
        targetCalories: metabolics.targetCalories,
        targetProtein: metabolics.targetProtein,
        targetCarbs: metabolics.targetCarbs,
        targetFat: metabolics.targetFat,
        targetFiber: metabolics.targetFiber,
        currentlyTracksFood: currentlyTracks,
        currentTrackedCalories: currentCalories ? parseFloat(currentCalories) : null,
        currentTrackedProtein: currentProtein ? parseFloat(currentProtein) : null,
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
                direction={direction}
              />
            )}

            {step === 4 && (
              <OnboardingGoalStep
                goal={goal}
                setGoal={setGoal}
                pace={pace}
                setPace={setPace}
                currentlyTracks={currentlyTracks}
                setCurrentlyTracks={setCurrentlyTracks}
                currentCalories={currentCalories}
                setCurrentCalories={setCurrentCalories}
                currentProtein={currentProtein}
                setCurrentProtein={setCurrentProtein}
                direction={direction}
              />
            )}

            {step === 5 && (
              <OnboardingNutritionPlanStep
                name={name}
                goal={goal}
                metabolics={metabolics}
                currentlyTracks={currentlyTracks}
                currentCalories={currentCalories}
                leadUpSchedule={leadUpSchedule}
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
