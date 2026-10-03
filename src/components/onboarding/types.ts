import { UserProfile } from '@/services/api';

export type GenderType = 'MALE' | 'FEMALE';

export type ActivityLevelType = 
  | 'SEDENTARY' 
  | 'LIGHT' 
  | 'MODERATE' 
  | 'VERY_ACTIVE' 
  | 'EXTRA_ACTIVE';

export type GoalType = 'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK';

export type PaceType = 'GRADUAL' | 'MODERATE';

export interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export interface MetabolicCalculation {
  bmr: number;
  tdee: number;
  targetRateKgPerWeek: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
}
