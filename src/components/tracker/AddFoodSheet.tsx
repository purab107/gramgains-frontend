'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Minus,
  X, 
  Loader2, 
  Utensils, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  ChevronDown, 
  ChevronLeft,
  ArrowLeft,
  Check,
  History,
  Bookmark,
  Sparkles,
  Scale
} from 'lucide-react';
import { MealTypeKey } from './MealSectionCard';
import { MACRO_COLORS } from '@/lib/constants';

export interface AddFoodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  mealType: MealTypeKey;
  onMealTypeChange?: (mealType: MealTypeKey) => void;
  onFoodLogged?: () => void;
  onAddFoodClick?: (item: FoodItem | SavedMeal, type: 'food' | 'saved_meal') => void;
}

type FilterTab = 'all' | 'history' | 'saved_meals';
type SheetView = 'search' | 'add_food';

interface ServingOption {
  id: string;
  label: string;
  weightGrams: number;
}

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
  selectedDate,
  mealType,
  onMealTypeChange,
  onFoodLogged,
  onAddFoodClick,
}: AddFoodSheetProps) {
  // Navigation State
  const [sheetView, setSheetView] = useState<SheetView>('search');
  const [currentMeal, setCurrentMeal] = useState<MealTypeKey>(mealType || 'BREAKFAST');
  const [mealPickerOpen, setMealPickerOpen] = useState(false);

  // Search State
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [historyFoods, setHistoryFoods] = useState<FoodItem[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Add Food Detail State
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingsInput, setServingsInput] = useState<string>('1');
  const [selectedServingOptionId, setSelectedServingOptionId] = useState<string>('1g');
  const [customUnitWeight, setCustomUnitWeight] = useState<string>('100');
  const [servingDropdownOpen, setServingDropdownOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync prop mealType
  useEffect(() => {
    if (mealType) {
      setCurrentMeal(mealType);
    }
  }, [mealType]);

  // Reset view when sheet opens or closes
  useEffect(() => {
    if (open) {
      setMealPickerOpen(false);
      setServingDropdownOpen(false);
    } else {
      // Delay reset so exit animation is clean
      const timer = setTimeout(() => {
        setSheetView('search');
        setSelectedFood(null);
        setSuccessToast(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSelectMealType = (type: MealTypeKey) => {
    setCurrentMeal(type);
    setMealPickerOpen(false);
    if (onMealTypeChange) {
      onMealTypeChange(type);
    }
  };

  // Fetch foods for Search View
  const fetchData = async (searchQuery: string, tab: FilterTab) => {
    try {
      setLoading(true);
      const trimmed = searchQuery.trim();

      if (tab === 'all') {
        const results = await ApiService.searchFoods(trimmed);
        const sorted = trimmed
          ? (results || [])
          : (results || []).sort((a, b) =>
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

  useEffect(() => {
    if (!open || sheetView !== 'search') return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      fetchData(query, activeTab);
    }, query ? 250 : 0);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, activeTab, open, sheetView]);

  // Transition to Add Food view when clicking the plus button
  const handleFoodPlusClick = (food: FoodItem) => {
    setSelectedFood(food);

    // Natural, industry-standard default:
    // If food has a defined serving (e.g. 40g, 200g bowl), select that serving with count = 1.
    // Otherwise, default to standard 100g with count = 1.
    const hasCustomServing = food.servingWeight && food.servingWeight !== 100 && food.servingWeight !== 1;
    if (hasCustomServing) {
      setSelectedServingOptionId('package_serving');
    } else {
      setSelectedServingOptionId('100g');
    }
    setServingsInput('1');
    setMealPickerOpen(false);
    setServingDropdownOpen(false);
    setSheetView('add_food');

    if (onAddFoodClick) {
      onAddFoodClick(food, 'food');
    }
  };

  const handleSavedMealPlusClick = async (meal: SavedMeal) => {
    if (onAddFoodClick) {
      onAddFoodClick(meal, 'saved_meal');
    }
    // Direct log for saved meal
    try {
      setIsLogging(true);
      await ApiService.logSavedMealToTracker(meal.id, {
        date: selectedDate,
        mealType: currentMeal,
      });
      setSuccessToast(`Added ${meal.name} to ${MEAL_DETAILS[currentMeal].label}!`);
      setTimeout(() => {
        setSuccessToast(null);
      }, 1200);
      onFoodLogged?.();
    } catch (err) {
      console.error('Failed to log saved meal:', err);
      alert('Could not log saved meal. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  // Available serving options for the selected food
  const servingOptions: ServingOption[] = useMemo(() => {
    if (!selectedFood) return [];
    const opts: ServingOption[] = [];

    // Package or default portion
    if (selectedFood.servingWeight && selectedFood.servingWeight !== 100 && selectedFood.servingWeight !== 1) {
      opts.push({
        id: 'package_serving',
        label: `1 serving (${selectedFood.servingWeight}${selectedFood.servingUnit || 'g'})`,
        weightGrams: selectedFood.servingWeight,
      });
    }

    // Additional servings defined on food if any
    if (selectedFood.servings && selectedFood.servings.length > 0) {
      selectedFood.servings.forEach((s) => {
        if (s.weightGrams !== 100 && s.weightGrams !== 1 && s.weightGrams !== selectedFood.servingWeight) {
          opts.push({
            id: `serving_${s.id}`,
            label: `1 ${s.unitLabel || 'serving'} (${s.weightGrams}g)`,
            weightGrams: s.weightGrams,
          });
        }
      });
    }

    // Standard 100g option
    opts.push({ id: '100g', label: '100g', weightGrams: 100.0 });

    // Precision 1.0g scale weight
    opts.push({ id: '1g', label: '1.0g', weightGrams: 1.0 });

    // Custom size option
    opts.push({
      id: 'custom',
      label: 'Custom size',
      weightGrams: parseFloat(customUnitWeight) || 100,
    });

    return opts;
  }, [selectedFood, customUnitWeight]);

  const activeServingOption = useMemo(() => {
    return (
      servingOptions.find((o) => o.id === selectedServingOptionId) ||
      servingOptions[0] || { id: '100g', label: '100g', weightGrams: 100.0 }
    );
  }, [servingOptions, selectedServingOptionId]);

  // Switch serving option while preserving or adjusting the quantity intuitively
  const handleSelectServingOption = (option: ServingOption) => {
    const currentServings = parseFloat(servingsInput) || 1;
    const currentWeight = currentServings * activeServingOption.weightGrams;

    setSelectedServingOptionId(option.id);
    setServingDropdownOpen(false);

    // Intuitively update number of servings to preserve current consumed weight
    const targetUnitWeight = option.id === 'custom' ? (parseFloat(customUnitWeight) || 100) : option.weightGrams;
    if (targetUnitWeight > 0) {
      if (option.id === '1g') {
        setServingsInput(String(Math.round(currentWeight)));
      } else if (option.id === '100g') {
        setServingsInput(String(Math.round((currentWeight / 100) * 10) / 10));
      } else {
        const newCount = Math.round((currentWeight / targetUnitWeight) * 10) / 10;
        setServingsInput(String(newCount > 0 ? newCount : 1));
      }
    }
  };

  // Real-time scientific macro calculations
  const calculated = useMemo(() => {
    if (!selectedFood) {
      return {
        calories: 0,
        carbs: 0,
        fat: 0,
        protein: 0,
        totalWeight: 0,
        carbsPercent: 0,
        fatPercent: 0,
        proteinPercent: 0,
      };
    }

    const servings = Math.max(0, parseFloat(servingsInput) || 0);
    const totalWeight = servings * activeServingOption.weightGrams;

    // Scientific standard: Food table stores nutrition per 100g
    const multiplier = totalWeight / 100;

    const calories = Math.round(selectedFood.calories * multiplier);
    const carbs = Math.round((selectedFood.carbohydrates || 0) * multiplier * 10) / 10;
    const fat = Math.round((selectedFood.fat || 0) * multiplier * 10) / 10;
    const protein = Math.round((selectedFood.protein || 0) * multiplier * 10) / 10;

    // Caloric contribution: Carbs = 4 kcal/g, Fat = 9 kcal/g, Protein = 4 kcal/g
    const cCal = carbs * 4;
    const fCal = fat * 9;
    const pCal = protein * 4;
    const totCal = cCal + fCal + pCal;

    let carbsPercent = 0;
    let fatPercent = 0;
    let proteinPercent = 0;

    if (totCal > 0) {
      carbsPercent = Math.round((cCal / totCal) * 100);
      fatPercent = Math.round((fCal / totCal) * 100);
      proteinPercent = Math.max(0, 100 - carbsPercent - fatPercent);
    }

    return {
      calories,
      carbs,
      fat,
      protein,
      totalWeight,
      carbsPercent,
      fatPercent,
      proteinPercent,
    };
  }, [selectedFood, servingsInput, activeServingOption]);

  // Stepper adjustments for number of servings
  const handleStepServings = (delta: number) => {
    const current = parseFloat(servingsInput) || 0;
    const nextVal = Math.max(0.1, Math.round((current + delta) * 10) / 10);
    setServingsInput(String(nextVal));
  };

  // Log food submission
  const handleLogFood = async () => {
    if (!selectedFood) return;
    try {
      setIsLogging(true);
      const servings = parseFloat(servingsInput) || 1;
      await ApiService.logMeal({
        date: selectedDate,
        mealType: currentMeal,
        foodId: selectedFood.id,
        servings: servings,
        customWeightGrams: calculated.totalWeight > 0 ? calculated.totalWeight : undefined,
        unitLabel: activeServingOption.label,
      });

      setSuccessToast(`Added ${selectedFood.name} to ${MEAL_DETAILS[currentMeal].label}!`);
      onFoodLogged?.();

      setTimeout(() => {
        setSuccessToast(null);
        setSheetView('search');
        setSelectedFood(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to log meal:', err);
      alert('Failed to log food item. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const activeMealInfo = MEAL_DETAILS[currentMeal] || MEAL_DETAILS.BREAKFAST;
  const ActiveIcon = activeMealInfo.icon;

  // SVG Donut slice calculation
  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ~226.19
  const carbsDash = (calculated.carbsPercent / 100) * circumference;
  const fatDash = (calculated.fatPercent / 100) * circumference;
  const proteinDash = (calculated.proteinPercent / 100) * circumference;
  const fatOffset = -carbsDash;
  const proteinOffset = -(carbsDash + fatDash);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] sm:max-w-[480px] h-full flex flex-col p-0 bg-card text-card-foreground border-l border-border shadow-2xl z-50 overflow-hidden"
      >
        {sheetView === 'search' ? (
          /* ============================================================
             VIEW 1: SEARCH FOOD ITEMS
             ============================================================ */
          <>
            {/* Top Header: Meal Name with clickable option to change it */}
            <SheetHeader className="h-16 px-5 border-b border-border bg-card/95 shrink-0 flex flex-row items-center justify-between space-y-0 relative">
              <div className="flex items-center justify-between w-full pr-10">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMealPickerOpen((prev) => !prev)}
                    className="group flex items-center gap-2 px-2 py-1 -ml-1 rounded-xl hover:bg-muted/80 transition-all border border-transparent hover:border-border active:scale-98 text-left"
                    title="Click to switch meal"
                  >
                    <div className={`p-1.5 rounded-lg bg-card border border-border shadow-2xs ${activeMealInfo.color}`}>
                      <ActiveIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <SheetTitle className="text-base sm:text-lg font-extrabold text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                          {activeMealInfo.label}
                        </SheetTitle>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform duration-200 ${mealPickerOpen ? 'rotate-180' : ''}`} />
                      </div>
                      <SheetDescription className="text-[11px] text-muted-foreground font-medium mt-0.5 leading-none">
                        Click to change meal
                      </SheetDescription>
                    </div>
                  </button>

                  {/* Meal Selector Dropdown Menu */}
                  {mealPickerOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-popover text-popover-foreground rounded-2xl border border-border shadow-xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
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
                                  ? 'bg-primary/10 text-primary border border-primary/20'
                                  : 'text-foreground hover:bg-muted hover:text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${item.color}`} />
                                <span>{item.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SheetHeader>

            {/* Search Bar & Filters Section */}
            <div className="p-4 sm:p-5 pb-3 space-y-3 shrink-0 border-b border-border bg-card">
              {/* Simple Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search food item by name..."
                  className="w-full pl-10 pr-10 py-2 bg-muted/40 border border-input rounded-xl text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs'
                      : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border'
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
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs'
                      : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border'
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
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs'
                      : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border'
                  }`}
                >
                  <Bookmark className="w-3 h-3 mr-1.5 text-emerald-400" />
                  <span>Saved Meals</span>
                </Button>
              </div>
            </div>

            {/* Food Items List Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 min-h-0 bg-background/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs font-medium">Searching food items...</span>
                </div>
              ) : activeTab === 'saved_meals' ? (
                savedMeals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2 text-center">
                    <Bookmark className="w-8 h-8 text-muted-foreground/40 stroke-1" />
                    <p className="text-xs font-semibold text-foreground">No saved meals found</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
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
                        className="p-3 bg-card rounded-xl border border-border shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                              {meal.name}
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20 bg-primary/10 text-primary font-bold shrink-0">
                              Saved
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium mt-1">
                            <span>{cal} cal, </span>
                            <span className="font-semibold" style={{ color: MACRO_COLORS.protein }}>
                              {p} p
                            </span>
                            <span>, </span>
                            <span className="font-semibold" style={{ color: MACRO_COLORS.carbs }}>
                              {c} c
                            </span>
                            <span>, </span>
                            <span className="font-semibold" style={{ color: MACRO_COLORS.fat }}>
                              {f} f
                            </span>
                            <span>{totalWeight > 0 ? `, ${Math.round(totalWeight)} g` : ''}</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleSavedMealPlusClick(meal)}
                          disabled={isLogging}
                          className="h-8 w-8 rounded-lg border-border text-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 shadow-2xs shrink-0 transition-all active:scale-95"
                          title="Add saved meal"
                        >
                          {isLogging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    );
                  })
                )
              ) : (
                (() => {
                  const currentList = activeTab === 'history' ? historyFoods : foods;

                  if (currentList.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2 text-center">
                        <Utensils className="w-8 h-8 text-muted-foreground/40 stroke-1" />
                        <p className="text-xs font-semibold text-foreground">No food items found</p>
                        <p className="text-[11px] text-muted-foreground max-w-xs">
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
                        className="p-3 bg-card rounded-xl border border-border shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                              {food.name}
                            </span>
                            {food.brand ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-border/80 bg-muted/60 text-muted-foreground font-medium shrink-0 truncate max-w-[130px]"
                              >
                                {food.brand}
                              </Badge>
                            ) : null}
                            {food.layer === 2 ? (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium shrink-0">
                                Recipe
                              </span>
                            ) : null}
                          </div>

                          <div className="text-[11px] text-muted-foreground font-medium mt-1">
                            <span>{cal} cal, </span>
                            <span className="font-semibold" style={{ color: MACRO_COLORS.protein }}>
                              {p} p
                            </span>
                            <span>, </span>
                            <span className="font-semibold" style={{ color: MACRO_COLORS.carbs }}>
                              {c} c
                            </span>
                            <span>, </span>
                            <span className="font-semibold" style={{ color: MACRO_COLORS.fat }}>
                              {f} f
                            </span>
                            <span>, {weight} g</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleFoodPlusClick(food)}
                          className="h-8 w-8 rounded-lg border-border text-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 shadow-2xs shrink-0 transition-all active:scale-95"
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
          </>
        ) : (
          /* ============================================================
             VIEW 2: ADD FOOD ITEM DETAILS VIEW
             ============================================================ */
          selectedFood && (
            <div className="h-full flex flex-col min-h-0">
              {/* Header with Back Arrow Button and "Add Food" Title */}
              <SheetHeader className="h-16 px-5 border-b border-border bg-card/95 shrink-0 flex flex-row items-center justify-between space-y-0 relative">
                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSheetView('search')}
                    className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors -ml-1"
                    title="Back to search"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                  <SheetTitle className="text-base sm:text-lg font-extrabold text-foreground tracking-tight leading-none">
                    Add Food
                  </SheetTitle>
                </div>
              </SheetHeader>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0 bg-background/50">
                
                {/* Food Item Name */}
                <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                        {selectedFood.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {selectedFood.category && <span>{selectedFood.category}</span>}
                        {selectedFood.brand && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-foreground">{selectedFood.brand}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {selectedFood.layer === 2 ? (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 border-amber-500/20">
                        Recipe
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                        Raw
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Serving & Meal Control Group */}
                <div className="bg-card rounded-2xl border border-border shadow-2xs divide-y divide-border overflow-visible">
                  
                  {/* Row 1: Meal Type */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between relative">
                    <span className="text-xs font-semibold text-muted-foreground">Meal</span>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMealPickerOpen((prev) => !prev)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-bold text-foreground transition-all active:scale-98"
                      >
                        <ActiveIcon className={`w-3.5 h-3.5 ${activeMealInfo.color}`} />
                        <span>{activeMealInfo.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${mealPickerOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown for meal switch */}
                      {mealPickerOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-48 bg-popover text-popover-foreground rounded-2xl border border-border shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
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
                                    ? 'bg-primary/10 text-primary font-bold'
                                    : 'text-foreground hover:bg-muted'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                                  <span>{item.label}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Number of Servings */}
                  <div className="p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Number of servings
                      </span>

                      {/* Interactive Stepper & Direct Input */}
                      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStepServings(-1)}
                          className="h-7 w-7 rounded-lg hover:bg-card text-foreground"
                          title="Decrease servings"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>

                        <Input
                          type="number"
                          step="any"
                          min="0.1"
                          value={servingsInput}
                          onChange={(e) => setServingsInput(e.target.value)}
                          className="w-16 h-7 text-center font-bold text-xs text-foreground bg-card border-border rounded-lg shadow-2xs p-0 focus-visible:ring-1"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStepServings(1)}
                          className="h-7 w-7 rounded-lg hover:bg-card text-foreground"
                          title="Increase servings"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Quick Pick Servings Multipliers */}
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-muted-foreground mr-1">Quick:</span>
                      {[0.5, 1, 1.5, 2, 40].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setServingsInput(String(val))}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            parseFloat(servingsInput) === val
                              ? 'bg-primary text-primary-foreground shadow-2xs'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 3: Serving Size Selector */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between relative">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Serving Size
                    </span>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setServingDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-bold text-foreground transition-all active:scale-98"
                      >
                        <Scale className="w-3.5 h-3.5 text-primary" />
                        <span>{activeServingOption.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${servingDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown with Industry Standard Options */}
                      {servingDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-60 bg-popover text-popover-foreground rounded-2xl border border-border shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                            Choose Serving Size
                          </div>
                          {servingOptions.map((opt) => {
                            const isSelected = opt.id === activeServingOption.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectServingOption(opt)}
                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-primary/10 text-primary font-bold'
                                    : 'text-foreground hover:bg-muted'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                              </button>
                            );
                          })}

                          {/* Custom size input if selected */}
                          {selectedServingOptionId === 'custom' && (
                            <div className="p-2 pt-1 border-t border-border">
                              <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                                Custom grams per serving:
                              </label>
                              <Input
                                type="number"
                                min="1"
                                value={customUnitWeight}
                                onChange={(e) => setCustomUnitWeight(e.target.value)}
                                className="h-7 text-xs font-bold border-border bg-background text-foreground"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Macros Breakdown Card */}
                <Card className="border border-border shadow-sm rounded-2xl bg-card overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Nutritional Breakdown
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-center">
                      
                      {/* Left Side: Donut Pie Chart with total calories in middle */}
                      <div className="col-span-5 flex flex-col items-center justify-center">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            {/* Track background */}
                            <circle
                              cx="50"
                              cy="50"
                              r={radius}
                              stroke="hsl(var(--muted))"
                              strokeWidth="9"
                              fill="transparent"
                            />

                            {/* Carbs slice */}
                            {calculated.carbsPercent > 0 && (
                              <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                stroke={MACRO_COLORS.carbs}
                                strokeWidth="9"
                                strokeDasharray={`${carbsDash} ${circumference}`}
                                strokeDashoffset={0}
                                strokeLinecap="round"
                                fill="transparent"
                                className="transition-all duration-300"
                              />
                            )}

                            {/* Fat slice */}
                            {calculated.fatPercent > 0 && (
                              <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                stroke={MACRO_COLORS.fat}
                                strokeWidth="9"
                                strokeDasharray={`${fatDash} ${circumference}`}
                                strokeDashoffset={fatOffset}
                                strokeLinecap="round"
                                fill="transparent"
                                className="transition-all duration-300"
                              />
                            )}

                            {/* Protein slice */}
                            {calculated.proteinPercent > 0 && (
                              <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                stroke={MACRO_COLORS.protein}
                                strokeWidth="9"
                                strokeDasharray={`${proteinDash} ${circumference}`}
                                strokeDashoffset={proteinOffset}
                                strokeLinecap="round"
                                fill="transparent"
                                className="transition-all duration-300"
                              />
                            )}
                          </svg>

                          {/* Center Text: Total Calories */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-none">
                              {calculated.calories}
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                              cal
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-muted-foreground mt-1">
                          {Math.round(calculated.totalWeight)}g total
                        </span>
                      </div>

                      {/* Right Side: Macro Breakdown Columns (71% | 15% | 14%) */}
                      <div className="col-span-7 pl-2 border-l border-border">
                        <div className="grid grid-cols-3 gap-1 text-center py-1">
                          
                          {/* Carbs Column */}
                          <div className="space-y-1">
                            <div className="text-sm sm:text-base font-extrabold text-foreground leading-tight">
                              {calculated.carbsPercent}%
                            </div>
                            <div className="text-xs font-bold text-muted-foreground font-mono">
                              {calculated.carbs}g
                            </div>
                            <div
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: MACRO_COLORS.carbs }}
                            >
                              carbs
                            </div>
                          </div>

                          {/* Fat Column */}
                          <div className="space-y-1 border-x border-border px-1">
                            <div className="text-sm sm:text-base font-extrabold text-foreground leading-tight">
                              {calculated.fatPercent}%
                            </div>
                            <div className="text-xs font-bold text-muted-foreground font-mono">
                              {calculated.fat}g
                            </div>
                            <div
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: MACRO_COLORS.fat }}
                            >
                              fat
                            </div>
                          </div>

                          {/* Protein Column */}
                          <div className="space-y-1">
                            <div className="text-sm sm:text-base font-extrabold text-foreground leading-tight">
                              {calculated.proteinPercent}%
                            </div>
                            <div className="text-xs font-bold text-muted-foreground font-mono">
                              {calculated.protein}g
                            </div>
                            <div
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: MACRO_COLORS.protein }}
                            >
                              protein
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>

                {/* Success Feedback Toast */}
                {successToast && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold animate-in fade-in slide-in-from-top-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{successToast}</span>
                  </div>
                )}
              </div>

              {/* Fixed Footer: Add Button */}
              <div className="p-4 sm:p-5 border-t border-border bg-card shrink-0">
                <Button
                  type="button"
                  onClick={handleLogFood}
                  disabled={isLogging}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  {isLogging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Logging to {activeMealInfo.label}...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to {activeMealInfo.label}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        )}
      </SheetContent>
    </Sheet>
  );
}
