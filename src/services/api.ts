const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

export class ApiService {
  static async searchFoods(query: string = '', layer?: number): Promise<FoodItem[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (layer) params.append('layer', layer.toString());

    const res = await fetch(`${API_BASE_URL}/food/search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch foods');
    const json = await res.json();
    return json.data;
  }

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

  static async deleteLog(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tracker/log/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete log');
  }
}
