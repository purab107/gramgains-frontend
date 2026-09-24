import { isGuestSession, GuestStorageService } from '@/lib/guest-session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: 'include',
  });
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  heightCm: number;
  weightKg: number;
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';
  goal: 'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK';
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
  targetWeightKg?: number | null;
  targetRateKgPerWeek?: number;
  adaptiveTdee?: number | null;
  confidenceLevel?: 'INSUFFICIENT' | 'CALIBRATING' | 'MODERATE' | 'HIGH';
  confidenceDays?: number;
  isAdaptiveEnabled?: boolean;
  macroPreset?: 'BALANCED' | 'HIGH_PROTEIN' | 'KETO' | 'LOW_CARB' | 'CUSTOM';
  proteinGramsPerKg?: number;
  fatPercent?: number;
  checkInDayOfWeek?: number;
  lastCheckInDate?: string | null;
  updatedAt?: string;
}

export interface WeightLogEntry {
  id?: string;
  date: string;
  rawWeightKg: number;
  trendWeightKg: number;
  isExcluded: boolean;
  note?: string | null;
}

export interface WeightHistoryResponse {
  windowDays: number;
  latestRawKg: number;
  latestTrendKg: number;
  velocityKgPerDay: number;
  velocityKgPerWeek: number;
  logs: WeightLogEntry[];
}

export interface AdaptiveStatusResponse {
  isAdaptiveEnabled: boolean;
  confidence: {
    level: 'INSUFFICIENT' | 'CALIBRATING' | 'MODERATE' | 'HIGH';
    score: number;
    validFoodDays: number;
    validWeightDays: number;
    evaluationWindowDays: number;
    message: string;
  };
  expenditure: {
    formulaBaselineTdee: number;
    observedTdee: number | null;
    effectiveTdee: number;
    dailyEnergySurplusKcal: number;
    unit: string;
  };
  weightTrend: {
    latestRawKg: number;
    latestTrendKg: number;
    velocityKgPerDay: number;
    velocityKgPerWeek: number;
    targetVelocityKgPerWeek: number;
  };
  targets: {
    currentCalories: number;
    recommendedCalories: number;
    adjustmentKcal: number;
    isBelowSafetyFloor: boolean;
    safetyFloorKcal: number;
    isAggressiveRate: boolean;
    recommendedMacros: {
      proteinGrams: number;
      carbsGrams: number;
      fatGrams: number;
      fiberGrams: number;
      macroRatios: { protein: number; carbs: number; fat: number };
    };
    isCheckInAvailable: boolean;
    pendingCheckInId: string | null;
  };
}

export interface AdaptiveCheckInResponse {
  id: string;
  date: string;
  status: 'PENDING' | 'ACCEPTED' | 'ADJUSTED' | 'DISMISSED';
  startWeightKg: number;
  endWeightKg: number;
  trendChangeKg: number;
  avgIntakeKcal: number;
  adherenceScore: number;
  currentCalories: number;
  suggestedCalories: number;
  suggestedProtein: number;
  suggestedCarbs: number;
  suggestedFat: number;
  adjustmentKcal: number;
  headline: string;
  rationaleText: string;
  confidenceLevel: string;
}

export interface AnalyticsOverviewResponse {
  windowDays: number;
  adherence: {
    calorieScore: number;
    proteinScore: number;
    daysInTargetBand: number;
    loggedDaysCount: number;
    currentStreak: number;
  };
  energyBalance: {
    totalConsumedKcal: number;
    totalExpendedKcal: number;
    netDeficitKcal: number;
    predictedLossKg: number;
    actualTrendLossKg: number;
  };
  milestoneProjection?: {
    targetWeightKg: number;
    currentTrendKg: number;
    remainingKg: number;
    estimatedWeeksRemaining: number;
    projectedDate: string;
  } | null;
}

export interface AnalyticsTrendsResponse {
  windowDays: number;
  seriesCount: number;
  series: Array<{
    date: string;
    rawWeightKg: number | null;
    trendWeightKg: number | null;
    caloriesConsumed: number | null;
    targetCalories: number;
    proteinGrams: number | null;
    carbsGrams: number | null;
    fatGrams: number | null;
    observedTdee: number | null;
    effectiveTdee: number;
  }>;
}

export interface AnalyticsPatternsResponse {
  windowDays: number;
  mealDistribution: {
    breakfastPercent: number;
    lunchPercent: number;
    dinnerPercent: number;
    snackPercent: number;
  };
  macroAverages: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
  };
  chronoInsights: {
    lateNightCaloriesPercent: number;
    avgWeekdayCalories: number | null;
    avgWeekendCalories: number | null;
    weekendDeltaKcal: number;
  };
  activeInsights: Array<{
    type: string;
    level: 'SUCCESS' | 'WARNING' | 'INFO';
    title: string;
    message: string;
  }>;
}

export interface FoodServing {
  id: string;
  foodId?: string;
  unitLabel: string;
  weightGrams: number;
  isDefault: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  brand?: string;
  servingUnit: string;
  servingWeight: number;
  servings?: FoodServing[];
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  source: string;
  layer: number;
}

export interface MealLogItem {
  id: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodId: string;
  food: FoodItem;
  servings: number;
  weightGrams: number;
  unitLabel?: string | null;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  createdAt: string;
}

export interface WaterLogItem {
  id: string;
  userId: string;
  amountMl: number;
  date: string;
  createdAt: string;
}

export interface WaterSummary {
  date: string;
  totalMl: number;
  logs: WaterLogItem[];
}

export interface DailySummary {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}

export interface DailyTrackerResponse {
  date: string;
  summary: DailySummary;
  logs: MealLogItem[];
  water?: WaterSummary;
}

export interface DashboardSummaryResponse {
  date: string;
  calories: {
    target: number;
    consumed: number;
    remaining: number;
    percentageDone: number;
  };
  macros: {
    protein: { consumed: number; target: number; unit: string };
    carbohydrates: { consumed: number; target: number; unit: string };
    fat: { consumed: number; target: number; unit: string };
    fiber: { consumed: number; target: number; unit: string };
  };
  water?: {
    consumed: number;
    target: number;
    unit: string;
    percentageDone: number;
  };
  totalMealsLogged: number;
}

export interface HeatmapItem {
  date: string;
  count: number;
  totalCalories: number;
  level: number;
  isFuture?: boolean;
}

export interface HeatmapResponse {
  daysCount: number;
  targetCalories: number;
  heatmap: HeatmapItem[];
  accountCreatedAt?: string | null;
}

export interface SavedMealItem {
  id?: string;
  foodId: string;
  food?: FoodItem;
  weightGrams: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface SavedMeal {
  id: string;
  name: string;
  description?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  items: SavedMealItem[];
  createdAt?: string;
  updatedAt?: string;
}

export class ApiService {
  // --- PROFILE ---
  static async getProfile(): Promise<UserProfile> {
    if (isGuestSession()) return GuestStorageService.getProfile();
    const res = await apiFetch(`${API_BASE_URL}/profile`);
    if (!res.ok) throw new Error('Failed to fetch user profile');
    const json = await res.json();
    return json.data;
  }

  static async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiFetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const json = await res.json();
    return json.data;
  }

  // --- DASHBOARD ---
  static async getDashboardSummary(date: string): Promise<DashboardSummaryResponse> {
    if (isGuestSession()) return GuestStorageService.getDashboardSummary(date);
    const res = await apiFetch(`${API_BASE_URL}/dashboard/summary?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    const json = await res.json();
    return json.data;
  }

  static async getHeatmap(days: number = 90): Promise<HeatmapResponse> {
    if (isGuestSession()) return GuestStorageService.getHeatmap(days);
    const res = await apiFetch(`${API_BASE_URL}/dashboard/heatmap?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch heatmap');
    const json = await res.json();
    return json.data;
  }

  // --- FOOD DATABASE ---
  static async searchFoods(query: string = '', layer?: number): Promise<FoodItem[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (layer) params.append('layer', layer.toString());

    const res = await apiFetch(`${API_BASE_URL}/food/search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch foods');
    const json = await res.json();
    return json.data;
  }

  // --- DAILY TRACKER ---
  static async getDailyLogs(date: string): Promise<DailyTrackerResponse> {
    if (isGuestSession()) return GuestStorageService.getDailyLogs(date);
    const res = await apiFetch(`${API_BASE_URL}/tracker/daily?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch daily logs');
    const json = await res.json();
    return json.data;
  }

  static async getRecentFoods(limit: number = 30): Promise<FoodItem[]> {
    if (isGuestSession()) return GuestStorageService.getRecentFoods(limit);
    const res = await apiFetch(`${API_BASE_URL}/tracker/recent-foods?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch recent foods');
    const json = await res.json();
    return json.data;
  }


  static async logMeal(payload: {
    date: string;
    mealType: string;
    foodId: string;
    servings?: number;
    customWeightGrams?: number;
    unitLabel?: string;
  }): Promise<MealLogItem> {
    if (isGuestSession()) return GuestStorageService.logMeal(payload);
    const res = await apiFetch(`${API_BASE_URL}/tracker/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log meal');
    const json = await res.json();
    return json.data;
  }

  static async updateLog(
    id: string,
    payload: { servings?: number; customWeightGrams?: number; mealType?: string; unitLabel?: string }
  ): Promise<MealLogItem> {
    if (isGuestSession()) return GuestStorageService.updateLog(id, payload);
    const res = await apiFetch(`${API_BASE_URL}/tracker/log/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update log');
    const json = await res.json();
    return json.data;
  }

  static async deleteLog(id: string): Promise<void> {
    if (isGuestSession()) { GuestStorageService.deleteLog(id); return; }
    const res = await apiFetch(`${API_BASE_URL}/tracker/log/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete log');
  }

  // --- WATER TRACKING ---
  static async getDailyWater(date: string): Promise<WaterSummary> {
    if (isGuestSession()) return GuestStorageService.getDailyWater(date);
    const res = await apiFetch(`${API_BASE_URL}/tracker/water?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch water logs');
    const json = await res.json();
    return json.data;
  }

  static async logWater(payload: { date: string; amountMl: number }): Promise<WaterLogItem> {
    if (isGuestSession()) return GuestStorageService.logWater(payload);
    const res = await apiFetch(`${API_BASE_URL}/tracker/water`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log water');
    const json = await res.json();
    return json.data;
  }

  static async deleteWater(id: string): Promise<void> {
    if (isGuestSession()) { GuestStorageService.deleteWater(id); return; }
    const res = await apiFetch(`${API_BASE_URL}/tracker/water/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete water log');
  }

  // --- SAVED MEALS ---
  static async getSavedMeals(): Promise<SavedMeal[]> {
    if (isGuestSession()) return GuestStorageService.getSavedMeals();
    const res = await apiFetch(`${API_BASE_URL}/saved-meals`);
    if (!res.ok) throw new Error('Failed to fetch saved meals');
    const json = await res.json();
    return json.data;
  }

  static async getSavedMealById(id: string): Promise<SavedMeal> {
    const res = await apiFetch(`${API_BASE_URL}/saved-meals/${id}`);
    if (!res.ok) throw new Error('Failed to fetch saved meal');
    const json = await res.json();
    return json.data;
  }

  static async createSavedMeal(payload: {
    name: string;
    description?: string;
    items: { foodId: string; weightGrams: number }[];
  }): Promise<SavedMeal> {
    const res = await apiFetch(`${API_BASE_URL}/saved-meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create saved meal');
    const json = await res.json();
    return json.data;
  }

  static async updateSavedMeal(
    id: string,
    payload: {
      name?: string;
      description?: string;
      items?: { foodId: string; weightGrams: number }[];
    }
  ): Promise<SavedMeal> {
    const res = await apiFetch(`${API_BASE_URL}/saved-meals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update saved meal');
    const json = await res.json();
    return json.data;
  }

  static async deleteSavedMeal(id: string): Promise<void> {
    const res = await apiFetch(`${API_BASE_URL}/saved-meals/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete saved meal');
  }

  static async logSavedMealToTracker(
    id: string,
    payload: { date: string; mealType: string }
  ): Promise<{ message: string; count: number; logs: MealLogItem[] }> {
    const res = await apiFetch(`${API_BASE_URL}/saved-meals/${id}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log saved meal to tracker');
    return res.json();
  }

  // --- WEIGHT TRACKING ---
  static async getWeightLogs(days: number = 90): Promise<WeightHistoryResponse> {
    const res = await apiFetch(`${API_BASE_URL}/tracker/weight?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch weight logs');
    const json = await res.json();
    return json.data;
  }

  static async logWeight(payload: { date: string; weightKg: number; note?: string; isExcluded?: boolean }): Promise<WeightLogEntry> {
    const res = await apiFetch(`${API_BASE_URL}/tracker/weight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log weight');
    const json = await res.json();
    return json.data;
  }

  static async toggleWeightExclusion(id: string): Promise<WeightLogEntry> {
    const res = await apiFetch(`${API_BASE_URL}/tracker/weight/${id}/exclude`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to toggle weight exclusion');
    const json = await res.json();
    return json.data;
  }

  static async deleteWeightLog(id: string): Promise<void> {
    const res = await apiFetch(`${API_BASE_URL}/tracker/weight/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete weight log');
  }

  // --- ADAPTIVE METABOLIC ENGINE ---
  static async getAdaptiveStatus(): Promise<AdaptiveStatusResponse> {
    const res = await apiFetch(`${API_BASE_URL}/adaptive/status`);
    if (!res.ok) throw new Error('Failed to fetch adaptive status');
    const json = await res.json();
    return json.data;
  }

  static async getCheckIn(): Promise<AdaptiveCheckInResponse> {
    const res = await apiFetch(`${API_BASE_URL}/adaptive/check-in`);
    if (!res.ok) throw new Error('Failed to fetch check-in');
    const json = await res.json();
    return json.data;
  }

  static async applyCheckIn(payload: { checkInId: string; action: string; customCalories?: number }): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/adaptive/check-in/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to apply check-in recommendation');
    return res.json();
  }

  // --- USER ANALYTICS ---
  static async getAnalyticsOverview(days: number = 30): Promise<AnalyticsOverviewResponse> {
    const res = await apiFetch(`${API_BASE_URL}/analytics/overview?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch analytics overview');
    const json = await res.json();
    return json.data;
  }

  static async getAnalyticsTrends(days: number = 60): Promise<AnalyticsTrendsResponse> {
    const res = await apiFetch(`${API_BASE_URL}/analytics/trends?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch analytics trends');
    const json = await res.json();
    return json.data;
  }

  static async getAnalyticsPatterns(days: number = 14): Promise<AnalyticsPatternsResponse> {
    const res = await apiFetch(`${API_BASE_URL}/analytics/patterns?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch nutrition patterns');
    const json = await res.json();
    return json.data;
  }
}
