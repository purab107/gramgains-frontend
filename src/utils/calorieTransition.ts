export interface LeadUpStep {
  weekNumber: number;
  targetCalories: number;
  deltaFromPrevious: number;
  isInitialTarget: boolean;
}

export interface CalorieLeadUpSchedule {
  hasLeadUp: boolean;
  currentIntake: number;
  calculatedTarget: number;
  estimatedMaintenance: number;
  gapCalories: number;
  gapClass: 'NEGLIGIBLE' | 'SMALL' | 'MEDIUM' | 'LARGE';
  steps: LeadUpStep[];
  activeStepIndex: number;
}

export const GAP_THRESHOLDS = {
  NEGLIGIBLE: 150,
  SMALL: 350,
  MEDIUM: 700,
} as const;

export const STEP_COUNTS = {
  NEGLIGIBLE: 0,
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
} as const;

export function classifyGap(gap: number): 'NEGLIGIBLE' | 'SMALL' | 'MEDIUM' | 'LARGE' {
  const absGap = Math.abs(Number(gap) || 0);
  if (absGap < GAP_THRESHOLDS.NEGLIGIBLE) return 'NEGLIGIBLE';
  if (absGap <= GAP_THRESHOLDS.SMALL) return 'SMALL';
  if (absGap <= GAP_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LARGE';
}

export function computeActiveStepIndex(
  schedule: { steps: LeadUpStep[] },
  daysSinceOnboarding = 0
): number {
  if (!schedule || !schedule.steps || schedule.steps.length === 0) {
    return 0;
  }
  const days = Math.max(0, Number(daysSinceOnboarding) || 0);
  const index = Math.floor(days / 7);
  return Math.min(index, schedule.steps.length - 1);
}

export function buildLeadUpSchedule({
  currentIntake,
  calculatedTarget,
  estimatedMaintenance = 0,
  safetyFloor = 0,
  currentlyTracksFood = true,
  daysSinceOnboarding = 0,
}: {
  currentIntake: number;
  calculatedTarget: number;
  estimatedMaintenance?: number;
  safetyFloor?: number;
  currentlyTracksFood?: boolean;
  daysSinceOnboarding?: number;
}): CalorieLeadUpSchedule {
  const intake = Math.round(Number(currentIntake) || 0);
  const target = Math.round(Number(calculatedTarget) || 0);
  const maintenance = Math.round(Number(estimatedMaintenance) || 0);
  const floor = Math.round(Number(safetyFloor) || 0);

  const effectiveTarget = floor > 0 ? Math.max(floor, target) : target;
  const gapCalories = effectiveTarget - intake;
  const gapClass = classifyGap(gapCalories);

  const isEligible = Boolean(
    currentlyTracksFood &&
      intake > 0 &&
      gapClass !== 'NEGLIGIBLE' &&
      (floor === 0 || intake >= floor)
  );

  if (!isEligible) {
    return {
      hasLeadUp: false,
      currentIntake: intake,
      calculatedTarget: effectiveTarget,
      estimatedMaintenance: maintenance,
      gapCalories,
      gapClass,
      steps: [],
      activeStepIndex: 0,
    };
  }

  const stepCount = STEP_COUNTS[gapClass];
  const stepDelta = Math.round(gapCalories / stepCount);

  const steps: LeadUpStep[] = [];
  let prevCalories = intake;

  for (let i = 1; i <= stepCount; i++) {
    const isLast = i === stepCount;
    let stepTarget: number;

    if (isLast) {
      stepTarget = effectiveTarget;
    } else {
      stepTarget = intake + stepDelta * i;
      if (floor > 0) {
        stepTarget = Math.max(floor, stepTarget);
      }
    }

    const deltaFromPrevious = stepTarget - prevCalories;
    prevCalories = stepTarget;

    steps.push({
      weekNumber: i,
      targetCalories: stepTarget,
      deltaFromPrevious,
      isInitialTarget: isLast,
    });
  }

  const activeStepIndex = computeActiveStepIndex({ steps }, daysSinceOnboarding);

  return {
    hasLeadUp: true,
    currentIntake: intake,
    calculatedTarget: effectiveTarget,
    estimatedMaintenance: maintenance,
    gapCalories,
    gapClass,
    steps,
    activeStepIndex,
  };
}
