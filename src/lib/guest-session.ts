import { useState, useEffect } from 'react';
import type { 
  UserProfile, 
  DailyTrackerResponse, 
  DashboardSummaryResponse, 
  MealLogItem, 
  WaterSummary, 
  WaterLogItem, 
  HeatmapResponse, 
  SavedMeal, 
  FoodItem 
} from '../services/api';

const GUEST_SESSION_KEY = 'gramgains_guest_session';
const GUEST_LOGS_KEY = 'gramgains_guest_logs';
const GUEST_WATER_KEY = 'gramgains_guest_water';

export function isGuestSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(GUEST_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function startGuestSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(GUEST_SESSION_KEY, 'true');
    window.dispatchEvent(new Event('gramgains-guest-change'));
  } catch (e) {
    console.error('Failed to start guest session:', e);
  }
}

export function endGuestSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
    sessionStorage.removeItem(GUEST_LOGS_KEY);
    sessionStorage.removeItem(GUEST_WATER_KEY);
    window.dispatchEvent(new Event('gramgains-guest-change'));
  } catch (e) {
    console.error('Failed to end guest session:', e);
  }
}

export function useIsGuest(): boolean {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    setIsGuest(isGuestSession());

    const handleGuestChange = () => {
      setIsGuest(isGuestSession());
    };

    window.addEventListener('gramgains-guest-change', handleGuestChange);
    window.addEventListener('storage', handleGuestChange);
    return () => {
      window.removeEventListener('gramgains-guest-change', handleGuestChange);
      window.removeEventListener('storage', handleGuestChange);
    };
  }, []);

  return isGuest;
}

const foodCache = new Map<string, FoodItem>();

export class GuestStorageService {
  static cacheFood(food: FoodItem) {
    if (food && food.id) {
      foodCache.set(food.id, food);
    }
  }

  static getProfile(): UserProfile {
    return {
      id: 'guest-session-user',
      name: 'Guest Explorer',
      age: 25,
      gender: 'MALE',
      heightCm: 175,
      weightKg: 70,
      activityLevel: 'MODERATE',
      goal: 'MAINTAIN',
      bmr: 1650,
      tdee: 2200,
      targetCalories: 2200,
      targetProtein: 140,
      targetCarbs: 250,
      targetFat: 65,
      targetFiber: 30,
    };
  }

  private static getStoredLogs(): MealLogItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = sessionStorage.getItem(GUEST_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static saveLogs(logs: MealLogItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(GUEST_LOGS_KEY, JSON.stringify(logs));
      window.dispatchEvent(new Event('gramgains-guest-logs-updated'));
    } catch (e) {
      console.error('Failed to save guest logs:', e);
    }
  }

  private static getStoredWater(): WaterLogItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = sessionStorage.getItem(GUEST_WATER_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static saveWater(logs: WaterLogItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(GUEST_WATER_KEY, JSON.stringify(logs));
      window.dispatchEvent(new Event('gramgains-guest-water-updated'));
    } catch (e) {
      console.error('Failed to save guest water logs:', e);
    }
  }

  static getDailyLogs(date: string): DailyTrackerResponse {
    const allLogs = this.getStoredLogs();
    const dayLogs = allLogs.filter((l) => l.date === date);

    const summary = dayLogs.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: Math.round((acc.protein + (item.protein || 0)) * 10) / 10,
        carbohydrates: Math.round((acc.carbohydrates + (item.carbohydrates || 0)) * 10) / 10,
        fat: Math.round((acc.fat + (item.fat || 0)) * 10) / 10,
        fiber: Math.round((acc.fiber + (item.fiber || 0)) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
    );

    const water = this.getDailyWater(date);

    return {
      date,
      summary,
      logs: dayLogs,
      water,
    };
  }

  static async logMeal(payload: {
    date: string;
    mealType: string;
    foodId: string;
    servings?: number;
    customWeightGrams?: number;
    unitLabel?: string;
  }): Promise<MealLogItem> {
    let food = foodCache.get(payload.foodId);
    if (!food) {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/food/${payload.foodId}`);
        if (res.ok) {
          const json = await res.json();
          food = json.data;
          if (food) foodCache.set(food.id, food);
        }
      } catch (err) {
        console.warn('Could not fetch food details for guest log:', err);
      }
    }

    const fallbackFood: FoodItem = food || {
      id: payload.foodId,
      name: 'Logged Food',
      aliases: [],
      category: 'Food',
      servingUnit: payload.unitLabel || 'g',
      servingWeight: payload.customWeightGrams || 100,
      calories: 100,
      protein: 5,
      carbohydrates: 15,
      fat: 2,
      fiber: 1,
      source: 'guest',
      layer: 1,
    };

    const servings = payload.servings || 1;
    const weightGrams = payload.customWeightGrams || servings * (fallbackFood.servingWeight || 100);
    const multiplier = weightGrams / 100;

    const calories = Math.round(fallbackFood.calories * multiplier);
    const protein = Math.round(fallbackFood.protein * multiplier * 10) / 10;
    const carbohydrates = Math.round(fallbackFood.carbohydrates * multiplier * 10) / 10;
    const fat = Math.round(fallbackFood.fat * multiplier * 10) / 10;
    const fiber = Math.round((fallbackFood.fiber || 0) * multiplier * 10) / 10;

    const newLog: MealLogItem = {
      id: 'guest-log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      date: payload.date,
      mealType: payload.mealType as any,
      foodId: payload.foodId,
      food: fallbackFood,
      servings,
      weightGrams,
      unitLabel: payload.unitLabel || null,
      calories,
      protein,
      carbohydrates,
      fat,
      fiber,
      createdAt: new Date().toISOString(),
    };

    const logs = this.getStoredLogs();
    logs.push(newLog);
    this.saveLogs(logs);

    return newLog;
  }

  static updateLog(
    id: string,
    payload: { servings?: number; customWeightGrams?: number; mealType?: string; unitLabel?: string }
  ): MealLogItem {
    const logs = this.getStoredLogs();
    const index = logs.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new Error('Log not found in guest session');
    }

    const current = logs[index];
    const food = current.food;
    const servings = payload.servings !== undefined ? payload.servings : current.servings;
    const weightGrams = payload.customWeightGrams !== undefined 
      ? payload.customWeightGrams 
      : servings * (food?.servingWeight || 100);
    const multiplier = weightGrams / 100;

    const updated: MealLogItem = {
      ...current,
      mealType: (payload.mealType || current.mealType) as any,
      servings,
      weightGrams,
      unitLabel: payload.unitLabel !== undefined ? payload.unitLabel : current.unitLabel,
      calories: food ? Math.round(food.calories * multiplier) : current.calories,
      protein: food ? Math.round(food.protein * multiplier * 10) / 10 : current.protein,
      carbohydrates: food ? Math.round(food.carbohydrates * multiplier * 10) / 10 : current.carbohydrates,
      fat: food ? Math.round(food.fat * multiplier * 10) / 10 : current.fat,
      fiber: food ? Math.round((food.fiber || 0) * multiplier * 10) / 10 : current.fiber,
    };

    logs[index] = updated;
    this.saveLogs(logs);
    return updated;
  }

  static deleteLog(id: string): void {
    const logs = this.getStoredLogs().filter((l) => l.id !== id);
    this.saveLogs(logs);
  }

  static getDailyWater(date: string): WaterSummary {
    const logs = this.getStoredWater().filter((w) => w.date === date);
    const totalMl = logs.reduce((sum, item) => sum + (item.amountMl || 0), 0);
    return {
      date,
      totalMl,
      logs,
    };
  }

  static logWater(payload: { date: string; amountMl: number }): WaterLogItem {
    const newWater: WaterLogItem = {
      id: 'guest-water-' + Date.now(),
      userId: 'guest-session-user',
      amountMl: payload.amountMl,
      date: payload.date,
      createdAt: new Date().toISOString(),
    };
    const logs = this.getStoredWater();
    logs.push(newWater);
    this.saveWater(logs);
    return newWater;
  }

  static deleteWater(id: string): void {
    const logs = this.getStoredWater().filter((w) => w.id !== id);
    this.saveWater(logs);
  }

  static getDashboardSummary(date: string): DashboardSummaryResponse {
    const dayData = this.getDailyLogs(date);
    const targetCalories = 2200;
    const targetProtein = 140;
    const targetCarbs = 250;
    const targetFat = 65;
    const targetFiber = 30;
    const targetWater = 3000;

    const consumedCalories = dayData.summary.calories;
    const remainingCalories = Math.max(0, targetCalories - consumedCalories);
    const percentageDone = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

    return {
      date,
      calories: {
        target: targetCalories,
        consumed: consumedCalories,
        remaining: remainingCalories,
        percentageDone,
      },
      macros: {
        protein: {
          consumed: dayData.summary.protein,
          target: targetProtein,
          unit: 'g',
        },
        carbohydrates: {
          consumed: dayData.summary.carbohydrates,
          target: targetCarbs,
          unit: 'g',
        },
        fat: {
          consumed: dayData.summary.fat,
          target: targetFat,
          unit: 'g',
        },
        fiber: {
          consumed: dayData.summary.fiber,
          target: targetFiber,
          unit: 'g',
        },
      },
      water: {
        consumed: dayData.water?.totalMl || 0,
        target: targetWater,
        unit: 'ml',
        percentageDone: Math.min(100, Math.round(((dayData.water?.totalMl || 0) / targetWater) * 100)),
      },
      totalMealsLogged: dayData.logs.length,
    };
  }

  static getHeatmap(days: number = 90): HeatmapResponse {
    const today = new Date().toISOString().split('T')[0];
    const dayData = this.getDailyLogs(today);

    return {
      daysCount: days,
      targetCalories: 2200,
      accountCreatedAt: new Date().toISOString(),
      heatmap: [
        {
          date: today,
          count: dayData.logs.length,
          totalCalories: dayData.summary.calories,
          level: dayData.logs.length > 0 ? 2 : 0,
        },
      ],
    };
  }

  static getRecentFoods(limit: number = 30): FoodItem[] {
    const logs = this.getStoredLogs();
    const seen = new Set<string>();
    const foods: FoodItem[] = [];

    for (let i = logs.length - 1; i >= 0; i--) {
      const f = logs[i].food;
      if (f && !seen.has(f.id)) {
        seen.add(f.id);
        foods.push(f);
        if (foods.length >= limit) break;
      }
    }
    return foods;
  }

  static getSavedMeals(): SavedMeal[] {
    return [];
  }
}
