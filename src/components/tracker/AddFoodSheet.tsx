'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FoodItem, 
  SavedMeal, 
  ApiService 
} from '@/services/api';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  X, 
  Loader2, 
  Utensils, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  ChevronDown, 
  Check,
  History,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { MealTypeKey } from './MealSectionCard';

export interface AddFoodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  mealType: MealTypeKey;
  onMealTypeChange?: (mealType: MealTypeKey) => void;
  onAddFoodClick?: (item: FoodItem | SavedMeal, type: 'food' | 'saved_meal') => void;
}

type FilterTab = 'all' | 'history' | 'saved_meals';

const MEAL_DETAILS: Record<MealTypeKey, { label: string; sub: string; icon: React.ElementType; color: string; badgeClass: string }> = {
  BREAKFAST: {
    label: 'Breakfast',
    sub: 'Morning Fuel',
    icon: Sunrise,
    color: 'text-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  LUNCH: {
    label: 'Lunch',
    sub: 'Afternoon Fuel',
    icon: Sun,
    color: 'text-orange-500',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  SNACK: {
    label: 'Snacks',
    sub: 'Evening Energy',
    icon: Sunset,
    color: 'text-purple-500',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  DINNER: {
    label: 'Dinner',
    sub: 'Night Meal',
    icon: Moon,
    color: 'text-indigo-500',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
};

const ALL_MEAL_KEYS: MealTypeKey[] = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];

export function AddFoodSheet({
  open,
  onOpenChange,
  mealType,
  onMealTypeChange,
  onAddFoodClick,
}: AddFoodSheetProps) {
  const [currentMeal, setCurrentMeal] = useState<MealTypeKey>(mealType || 'BREAKFAST');
  const [mealPickerOpen, setMealPickerOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [historyFoods, setHistoryFoods] = useState<FoodItem[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync prop mealType with internal state
  useEffect(() => {
    if (mealType) {
      setCurrentMeal(mealType);
    }
  }, [mealType]);

  const handleSelectMealType = (type: MealTypeKey) => {
    setCurrentMeal(type);
    setMealPickerOpen(false);
    if (onMealTypeChange) {
      onMealTypeChange(type);
    }
  };

  // Fetch foods based on active tab and query
  const fetchData = async (searchQuery: string, tab: FilterTab) => {
    try {
      setLoading(true);
      const trimmed = searchQuery.trim();

      if (tab === 'all') {
        const results = await ApiService.searchFoods(trimmed);
        const sorted = (results || []).sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setFoods(sorted);
      } else if (tab === 'history') {
        const recent = await ApiService.getRecentFoods();
        const filtered = (recent || []).filter((item) =>
          !trimmed || item.name.toLowerCase().includes(trimmed.toLowerCase())
        );
        setHistoryFoods(filtered);
      } else if (tab === 'saved_meals') {
        const meals = await ApiService.getSavedMeals();
        const filtered = (meals || []).filter((item) =>
          !trimmed || item.name.toLowerCase().includes(trimmed.toLowerCase())
        );
        setSavedMeals(filtered);
      }
    } catch (err) {
      console.error('Error loading foods in AddFoodSheet:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced query and tab change listener
  useEffect(() => {
    if (!open) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      fetchData(query, activeTab);
    }, query ? 250 : 0);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, activeTab, open]);

  // Reset when panel opens
  useEffect(() => {
    if (open) {
      setMealPickerOpen(false);
    }
  }, [open]);

  const activeMealInfo = MEAL_DETAILS[currentMeal] || MEAL_DETAILS.BREAKFAST;
  const ActiveIcon = activeMealInfo.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md lg:max-w-lg h-full flex flex-col p-0 bg-white border-l border-slate-200/90 shadow-2xl z-50 overflow-hidden"
      >
        {/* Top Header: Meal Name with clickable option to change it */}
        <SheetHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 via-slate-50/40 to-white shrink-0 relative">
          <div className="flex items-center justify-between pr-8">
            <div className="relative">
              {/* Clickable Meal Name Button */}
              <button
                type="button"
                onClick={() => setMealPickerOpen((prev) => !prev)}
                className="group flex items-center gap-2 px-2.5 py-1.5 -ml-2 rounded-xl hover:bg-slate-100/90 transition-all border border-transparent hover:border-slate-200/80 active:scale-98 text-left"
                title="Click to switch meal"
              >
                <div className={`p-1.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs ${activeMealInfo.color}`}>
                  <ActiveIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <SheetTitle className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                      {activeMealInfo.label}
                    </SheetTitle>
                    <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform duration-200 ${mealPickerOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <SheetDescription className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Click to change meal
                  </SheetDescription>
                </div>
              </button>

              {/* Meal Selector Dropdown Menu */}
              {mealPickerOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Select Meal
                  </div>
                  <div className="space-y-1">
                    {ALL_MEAL_KEYS.map((key) => {
                      const item = MEAL_DETAILS[key];
                      const Icon = item.icon;
                      const isSelected = key === currentMeal;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectMealType(key)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${item.color}`} />
                            <span>{item.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 hidden sm:inline-flex ${activeMealInfo.badgeClass}`}>
              Add Food
            </Badge>
          </div>
        </SheetHeader>

        {/* Search Bar & Filters Section */}
        <div className="p-4 sm:p-5 pb-3 space-y-3 shrink-0 border-b border-slate-100 bg-white">
          {/* Simple Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food item by name..."
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Options: All, History, Saved Meals */}
          <div className="flex items-center gap-2 text-xs">
            <Button
              type="button"
              variant={activeTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className={`rounded-xl text-xs font-semibold h-8 px-3 transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 mr-1.5 text-amber-400" />
              <span>All</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === 'history' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className={`rounded-xl text-xs font-semibold h-8 px-3 transition-all ${
                activeTab === 'history'
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <History className="w-3 h-3 mr-1.5 text-blue-400" />
              <span>History</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === 'saved_meals' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('saved_meals')}
              className={`rounded-xl text-xs font-semibold h-8 px-3 transition-all ${
                activeTab === 'saved_meals'
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Bookmark className="w-3 h-3 mr-1.5 text-emerald-400" />
              <span>Saved Meals</span>
            </Button>
          </div>
        </div>

        {/* Food Items List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 min-h-0 bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-medium">Searching food items...</span>
            </div>
          ) : activeTab === 'saved_meals' ? (
            /* Saved Meals List */
            savedMeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 text-center">
                <Bookmark className="w-8 h-8 text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-700">No saved meals found</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  {query ? `No saved meals match "${query}"` : 'You have not created any saved meals yet.'}
                </p>
              </div>
            ) : (
              savedMeals.map((meal) => {
                const totalWeight = meal.items?.reduce((acc, it) => acc + (it.weightGrams || 0), 0) || 0;
                const cal = Math.round(meal.totalCalories);
                const p = Math.round((meal.totalProtein || 0) * 10) / 10;
                const c = Math.round((meal.totalCarbs || 0) * 10) / 10;
                const f = Math.round((meal.totalFat || 0) * 10) / 10;

                return (
                  <div
                    key={meal.id}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Left: Food name on top, macros line below */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {meal.name}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-200 bg-emerald-50 text-emerald-700 font-bold shrink-0">
                          Saved
                        </Badge>
                      </div>

                      {/* Format: 152 cal, 5.7 p, 6.6 c, 1.0 f, 40 g */}
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        {cal} cal, {p} p, {c} c, {f} f{totalWeight > 0 ? `, ${Math.round(totalWeight)} g` : ''}
                      </div>
                    </div>

                    {/* Right: Add Button (plus icon) */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onAddFoodClick?.(meal, 'saved_meal')}
                      className="h-8 w-8 rounded-lg border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-2xs shrink-0 transition-all active:scale-95 group-hover:border-slate-300"
                      title="Add food item"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            )
          ) : (
            /* Standard Foods List (All or History) */
            (() => {
              const currentList = activeTab === 'history' ? historyFoods : foods;

              if (currentList.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 text-center">
                    <Utensils className="w-8 h-8 text-slate-300 stroke-1" />
                    <p className="text-xs font-semibold text-slate-700">No food items found</p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      {activeTab === 'history'
                        ? 'No previously logged foods in history yet.'
                        : query
                        ? `No items match "${query}". Try searching by another name or ingredient.`
                        : 'No food items available in database.'}
                    </p>
                  </div>
                );
              }

              return currentList.map((food) => {
                const cal = Math.round(food.calories);
                const p = Math.round((food.protein || 0) * 10) / 10;
                const c = Math.round((food.carbohydrates || 0) * 10) / 10;
                const f = Math.round((food.fat || 0) * 10) / 10;
                const weight = Math.round(food.servingWeight || 100);

                return (
                  <div
                    key={food.id}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Left: Food name on top, macros line below */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {food.name}
                        </span>
                        {food.layer === 2 ? (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/60 font-medium shrink-0">
                            Recipe
                          </span>
                        ) : null}
                      </div>

                      {/* Format: 152 cal, 5.7 p, 6.6 c, 1.0 f, 40 g */}
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        {cal} cal, {p} p, {c} c, {f} f, {weight} g
                      </div>
                    </div>

                    {/* Right: Add Button (plus icon) */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onAddFoodClick?.(food, 'food')}
                      className="h-8 w-8 rounded-lg border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-2xs shrink-0 transition-all active:scale-95 group-hover:border-slate-300"
                      title="Add food item"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                );
              });
            })()
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
