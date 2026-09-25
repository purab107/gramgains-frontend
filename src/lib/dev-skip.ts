const DEV_SKIP_STORAGE_PREFIX = 'devskip:';

export function isDevSkip(): boolean {
  const envValue = process.env.NEXT_PUBLIC_DEV_SKIP;
  // Debug logging to help troubleshoot
  if (typeof window !== 'undefined') {
    console.log('[DevSkip] NEXT_PUBLIC_DEV_SKIP:', envValue);
    console.log('[DevSkip] isDevSkip:', envValue === 'true');
  }
  return envValue === 'true';
}

const MOCK_STORAGE_KEYS = [
  'devskip:profile',
  'devskip:dashboard',
  'devskip:tracker',
  'devskip:analytics',
  'devskip:weight',
  'devskip:adaptive',
  'devskip:savedMeals',
  'devskip:seeded',
];

export async function seedMockData(): Promise<void> {
  // Dynamic import so mock JSON is tree-shaken in production
  try {
    const { MOCK_DATA } = await import('@/__mocks__');
    for (const [key, value] of Object.entries(MOCK_DATA)) {
      localStorage.setItem(`${DEV_SKIP_STORAGE_PREFIX}${key}`, JSON.stringify(value));
    }
    localStorage.setItem('devskip:seeded', 'true');
    console.log('[DevSkip] Mock data seeded successfully');
  } catch (error) {
    console.error('[DevSkip] Failed to seed mock data:', error);
  }
}

export function clearMockData(): void {
  MOCK_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
}

export function isMockDataSeeded(): boolean {
  return localStorage.getItem('devskip:seeded') === 'true';
}

export function getMockData<T>(key: string): T | null {
  const raw = localStorage.getItem(`${DEV_SKIP_STORAGE_PREFIX}${key}`);
  if (!raw) {
    console.log(`[DevSkip] No mock data found for key: ${key}`);
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as T;
    console.log(`[DevSkip] Retrieved mock data for key: ${key}`);
    return parsed;
  } catch {
    console.error(`[DevSkip] Failed to parse mock data for key: ${key}`);
    return null;
  }
}