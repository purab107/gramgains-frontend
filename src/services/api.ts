const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  updatedAt?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  servingUnit: string;
  servingWeight: number;
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
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  createdAt: string;
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
  totalMealsLogged: number;
}

export interface HeatmapItem {
  date: string;
  count: number;
  totalCalories: number;
  level: number;
}

export interface HeatmapResponse {
  daysCount: number;
  targetCalories: number;
  heatmap: HeatmapItem[];
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
    const res = await fetch(`${API_BASE_URL}/profile`);
    if (!res.ok) throw new Error('Failed to fetch user profile');
    const json = await res.json();
    return json.data;
  }

  static async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
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
    const res = await fetch(`${API_BASE_URL}/dashboard/summary?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    const json = await res.json();
    return json.data;
  }

  static async getHeatmap(days: number = 90): Promise<HeatmapResponse> {
    const res = await fetch(`${API_BASE_URL}/dashboard/heatmap?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch heatmap');
    const json = await res.json();
    return json.data;
  }

  // --- FOOD DATABASE ---
  static async searchFoods(query: string = '', layer?: number): Promise<FoodItem[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (layer) params.append('layer', layer.toString());

    const res = await fetch(`${API_BASE_URL}/food/search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch foods');
    const json = await res.json();
    return json.data;
  }

  // --- DAILY TRACKER ---
  static async getDailyLogs(date: string): Promise<DailyTrackerResponse> {
    const res = await fetch(`${API_BASE_URL}/tracker/daily?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch daily logs');
    const json = await res.json();
    return json.data;
  }

  static async logMeal(payload: {
    date: string;
    mealType: string;
    foodId: string;
    servings?: number;
    customWeightGrams?: number;
  }): Promise<MealLogItem> {
    const res = await fetch(`${API_BASE_URL}/tracker/log`, {
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
    payload: { servings?: number; customWeightGrams?: number; mealType?: string }
  ): Promise<MealLogItem> {
    const res = await fetch(`${API_BASE_URL}/tracker/log/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update log');
    const json = await res.json();
    return json.data;
  }

  static async deleteLog(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tracker/log/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete log');
  }

  // --- SAVED MEALS ---
  static async getSavedMeals(): Promise<SavedMeal[]> {
    const res = await fetch(`${API_BASE_URL}/saved-meals`);
    if (!res.ok) throw new Error('Failed to fetch saved meals');
    const json = await res.json();
    return json.data;
  }

  static async getSavedMealById(id: string): Promise<SavedMeal> {
    const res = await fetch(`${API_BASE_URL}/saved-meals/${id}`);
    if (!res.ok) throw new Error('Failed to fetch saved meal');
    const json = await res.json();
    return json.data;
  }

  static async createSavedMeal(payload: {
    name: string;
    description?: string;
    items: { foodId: string; weightGrams: number }[];
  }): Promise<SavedMeal> {
    const res = await fetch(`${API_BASE_URL}/saved-meals`, {
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
    const res = await fetch(`${API_BASE_URL}/saved-meals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update saved meal');
    const json = await res.json();
    return json.data;
  }

  static async deleteSavedMeal(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/saved-meals/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete saved meal');
  }

  static async logSavedMealToTracker(
    id: string,
    payload: { date: string; mealType: string }
  ): Promise<{ message: string; loggedCount: number }> {
    const res = await fetch(`${API_BASE_URL}/saved-meals/${id}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log saved meal to tracker');
    return res.json();
  }
}

