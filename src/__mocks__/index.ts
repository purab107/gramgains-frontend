import profile from './profile.mock.json';
import dashboard from './dashboard.mock.json';
import tracker from './tracker.mock.json';
import analytics from './analytics.mock.json';
import weight from './weight.mock.json';
import adaptive from './adaptive.mock.json';
import savedMeals from './saved-meals.mock.json';

export const MOCK_DATA = {
  profile,
  dashboard,
  tracker,
  analytics,
  weight,
  adaptive,
  savedMeals,
} as const;

export type MockDataKey = keyof typeof MOCK_DATA;