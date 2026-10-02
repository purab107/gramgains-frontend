import { DEV_SKIP_STAGES, DevSkipStage, SCENARIO_DATA } from './dev-skip-scenarios';

const DEV_SKIP_STORAGE_PREFIX = 'devskip:';
const STAGE_KEY = 'devskip:current_stage';
const OVERRIDES_KEY = 'devskip:overrides';
const SEEDED_KEY = 'devskip:seeded';

export function isDevSkip(): boolean {
  if (typeof window !== 'undefined') {
    // Check if manually toggled on via localStorage or via env
    const forceEnabled = localStorage.getItem('devskip:force_enabled');
    if (forceEnabled === 'true') return true;
    if (forceEnabled === 'false') return false;
  }
  return process.env.NEXT_PUBLIC_DEV_SKIP === 'true';
}

export function setDevSkipForce(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('devskip:force_enabled', enabled ? 'true' : 'false');
  notifyDevSkipChange();
}

export function getCurrentStageId(): number {
  if (typeof window === 'undefined') return 3; // Default to Day 1
  const stored = localStorage.getItem(STAGE_KEY);
  const parsed = stored ? parseInt(stored, 10) : 3;
  return isNaN(parsed) ? 3 : Math.min(Math.max(parsed, 1), 12);
}

export function getActiveStage(): DevSkipStage {
  const currentId = getCurrentStageId();
  return DEV_SKIP_STAGES.find((s) => s.id === currentId) || DEV_SKIP_STAGES[2];
}

export function getOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setOverride(key: string, value: string) {
  if (typeof window === 'undefined') return;
  const current = getOverrides();
  current[key] = value;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(current));
  notifyDevSkipChange();
}

export function clearOverrides() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OVERRIDES_KEY);
  notifyDevSkipChange();
}

export function setStage(stageId: number): DevSkipStage {
  const target = DEV_SKIP_STAGES.find((s) => s.id === stageId) || DEV_SKIP_STAGES[0];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STAGE_KEY, stageId.toString());
    // Auto sync stage mock state into overrides
    const stageMockState = target.mockState;
    localStorage.setItem(
      OVERRIDES_KEY,
      JSON.stringify({
        dashboardState: stageMockState.dashboardState,
        trackerState: stageMockState.trackerState,
        analyticsState: stageMockState.analyticsState,
        savedMealsState: stageMockState.savedMealsState,
        hasPendingWeight: stageMockState.hasPendingWeight ? 'true' : 'false',
        hasPendingCheckIn: stageMockState.hasPendingCheckIn ? 'true' : 'false',
        showOnboarding: stageMockState.showOnboarding ? 'true' : 'false',
        onboardingStep: stageMockState.onboardingStep?.toString() || '1',
      })
    );
    notifyDevSkipChange();
  }
  return target;
}

export function advanceToNextStage(): DevSkipStage {
  const active = getActiveStage();
  const nextId = active.nextStageId || 1;
  return setStage(nextId);
}

export function revertToPrevStage(): DevSkipStage {
  const active = getActiveStage();
  const prevId = active.prevStageId || 12;
  return setStage(prevId);
}

export function notifyDevSkipChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gramgains:devskip-change'));
  }
}

export function getMockData<T>(key: string): T | null {
  const overrides = getOverrides();
  const activeStage = getActiveStage();

  // Dynamic context-aware scenario resolution
  if (key === 'dashboard') {
    const stateKey = (overrides.dashboardState || activeStage.mockState.dashboardState) as keyof typeof SCENARIO_DATA.dashboard;
    const data = SCENARIO_DATA.dashboard[stateKey] || SCENARIO_DATA.dashboard.complete;
    return data as unknown as T;
  }

  if (key === 'tracker') {
    const stateKey = (overrides.trackerState || activeStage.mockState.trackerState) as keyof typeof SCENARIO_DATA.tracker;
    const data = SCENARIO_DATA.tracker[stateKey] || SCENARIO_DATA.tracker.complete;
    return data as unknown as T;
  }

  if (key === 'savedMeals') {
    const stateKey = (overrides.savedMealsState || activeStage.mockState.savedMealsState) as keyof typeof SCENARIO_DATA.savedMeals;
    const data = SCENARIO_DATA.savedMeals[stateKey] || SCENARIO_DATA.savedMeals.populated;
    return data as unknown as T;
  }

  if (key === 'adaptive') {
    return SCENARIO_DATA.adaptive as unknown as T;
  }

  if (key === 'analytics') {
    const stateKey = (overrides.analyticsState === 'empty' ? 'empty' : 'populated') as keyof typeof SCENARIO_DATA.analytics;
    const data = SCENARIO_DATA.analytics[stateKey] || SCENARIO_DATA.analytics.populated;
    return data as unknown as T;
  }

  if (key === 'profile') {
    return {
      id: 'dev-user-001',
      name: 'Purab Sahare',
      email: 'purab@gramgains.dev',
      gender: 'MALE',
      age: 26,
      heightCm: 178,
      weightKg: 78.4,
      activityLevel: 'MODERATE',
      goal: 'WEIGHT_LOSS',
      targetCalories: 2000,
      targetProtein: 160,
      targetCarbs: 200,
      targetFat: 60,
      onboardingCompleted: overrides.showOnboarding === 'true' ? false : true,
      checkInDay: 'SUNDAY',
    } as unknown as T;
  }

  // Fallback to localStorage or generic seed
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(`${DEV_SKIP_STORAGE_PREFIX}${key}`);
    if (raw) {
      try {
        return JSON.parse(raw) as T;
      } catch {}
    }
  }
  return null;
}

export async function seedMockData(): Promise<void> {
  if (typeof window === 'undefined') return;
  setStage(7); // Seed to Stage 7: Goals Met
  localStorage.setItem(SEEDED_KEY, 'true');
  notifyDevSkipChange();
}

export function clearMockData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STAGE_KEY);
  localStorage.removeItem(OVERRIDES_KEY);
  localStorage.removeItem(SEEDED_KEY);
  setStage(3); // Reset to Day 1 Zero State
  notifyDevSkipChange();
}

export function isMockDataSeeded(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SEEDED_KEY) === 'true';
}