'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FoodItem, ApiService } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Plus, 
  Check, 
  Loader2, 
  X, 
  Scale, 
  ChevronUp, 
  Utensils,
  Sunrise,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';

import { MealTypeKey } from './MealSectionCard';
import { MACRO_COLORS } from '@/lib/constants';

export function getCurrentTimeMealType(): MealTypeKey {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const time = hour + minute / 60;

  if (time >= 5 && time < 11.5) return 'BREAKFAST';
  if (time >= 11.5 && time < 16) return 'LUNCH';
  if (time >= 16 && time < 19.5) return 'SNACK';
  return 'DINNER';
}

interface FoodSearchBlockProps {
  selectedDate: string;
  defaultMealType?: MealTypeKey;
  onFoodLogged: () => void;
  onMealTypeChange?: (mealType: MealTypeKey) => void;
}

export function FoodSearchBlock({
  selectedDate,
  defaultMealType,
  onFoodLogged,
  onMealTypeChange,
}: FoodSearchBlockProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'raw' | 'recipes' | 'high-protein'>('all');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealTypeKey>(defaultMealType || getCurrentTimeMealType());
  const [servings, setServings] = useState<number>(1);
  const [customWeightGrams, setCustomWeightGrams] = useState<string>('');
  const [logging, setLogging] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync defaultMealType when changed from parent (e.g. clicking "+ Add Lunch")
  useEffect(() => {
    if (defaultMealType) {
      setSelectedMealType(defaultMealType);
    }
  }, [defaultMealType]);

  const handleMealTypeSelect = (type: MealTypeKey) => {
    setSelectedMealType(type);
    if (onMealTypeChange) {
      onMealTypeChange(type);
    }
  };

  // Load initial foods (or search results) and sort alphabetically
  const fetchAndFilterFoods = async (searchQuery: string, tab: string) => {
    try {
      setLoading(true);
      let layerParam: number | undefined = undefined;
      if (tab === 'raw') layerParam = 1;
      if (tab === 'recipes') layerParam = 2;

      const data = await ApiService.searchFoods(searchQuery.trim(), layerParam);
      let filtered = data || [];
      if (tab === 'high-protein') {
        filtered = filtered.filter((item) => (item.protein || 0) >= 12);
      }

      // Sort alphabetically by name (A-Z) only when browsing without a search query;
      // preserve backend relevance ranking during search
      if (!searchQuery.trim()) {
        filtered.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      }

      setResults(filtered.slice(0, 30));
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount or when activeTab changes, and debounced when query changes
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      fetchAndFilterFoods(query, activeTab);
    }, query ? 280 : 0);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, activeTab]);

  const handleSelectFood = (food: FoodItem) => {
    if (selectedFood?.id === food.id) {
      setSelectedFood(null);
    } else {
      setSelectedFood(food);
      setServings(1);
      setCustomWeightGrams(food.servingWeight ? String(food.servingWeight) : '100');
    }
  };

  const calculateMacros = (food: FoodItem) => {
    const baseWeight = food.servingWeight || 100;
    const currentWeight = customWeightGrams ? parseFloat(customWeightGrams) || baseWeight : baseWeight * (servings || 1);
    // Scientific standard: food.calories & nutrients are stored per 100g
    const multiplier = currentWeight / 100;

    return {
      weight: Math.round(currentWeight),
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbohydrates * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
    };
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;
    try {
      setLogging(true);
      const weight = parseFloat(customWeightGrams);
      await ApiService.logMeal({
        date: selectedDate,
        mealType: selectedMealType,
        foodId: selectedFood.id,
        servings: servings,
        customWeightGrams: isNaN(weight) ? undefined : weight,
      });

      setSuccessToast(`Logged ${selectedFood.name} to ${selectedMealType}!`);
      setTimeout(() => setSuccessToast(null), 3000);
      setSelectedFood(null);
      onFoodLogged();
    } catch (err) {
      console.error('Failed to log meal:', err);
      alert('Failed to log meal. Please try again.');
    } finally {
      setLogging(false);
    }
  };

  const getMealLabel = (type: MealTypeKey) => {
    switch (type) {
      case 'BREAKFAST': return 'Morning';
      case 'LUNCH': return 'Afternoon';
      case 'SNACK': return 'Evening';
      case 'DINNER': return 'Dinner';
    }
  };

  return (
    <Card className="border border-border shadow-sm bg-card text-card-foreground rounded-2xl h-[550px] flex flex-col overflow-hidden">
      {/* Fixed Card Header */}
      <CardHeader className="pb-3 border-b border-border bg-muted/30 px-5 pt-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground leading-tight">
                Search &amp; Log Food
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">Adding to <strong className="text-foreground font-semibold">{getMealLabel(selectedMealType)}</strong></p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30 bg-primary/10">
            A-Z List
          </Badge>
        </div>
      </CardHeader>

      {/* Fixed Card Content with internal scrollable area */}
      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col overflow-hidden min-h-0 space-y-3">
        
        {/* Quick Meal Type Selector Pill Bar */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl shrink-0 border border-border">
          <button
            onClick={() => handleMealTypeSelect('BREAKFAST')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              selectedMealType === 'BREAKFAST'
                ? 'bg-card text-foreground shadow-2xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sunrise className="w-3.5 h-3.5 text-amber-500" />
            <span>Morning</span>
          </button>

          <button
            onClick={() => handleMealTypeSelect('LUNCH')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              selectedMealType === 'LUNCH'
                ? 'bg-card text-foreground shadow-2xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-orange-500" />
            <span>Afternoon</span>
          </button>

          <button
            onClick={() => handleMealTypeSelect('SNACK')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              selectedMealType === 'SNACK'
                ? 'bg-card text-foreground shadow-2xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-purple-500" />
            <span>Evening</span>
          </button>

          <button
            onClick={() => handleMealTypeSelect('DINNER')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              selectedMealType === 'DINNER'
                ? 'bg-card text-foreground shadow-2xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dinner</span>
          </button>
        </div>

        {/* Search Bar Input (Fixed) */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food by name, ingredient, dish..."
            className="w-full pl-10 pr-10 py-2 bg-background/50 border border-input rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills (Fixed) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              activeTab === 'raw'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            Raw Foods
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              activeTab === 'recipes'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            Cooked Dishes
          </button>
          <button
            onClick={() => setActiveTab('high-protein')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              activeTab === 'high-protein' ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={{
              backgroundColor: activeTab === 'high-protein' ? MACRO_COLORS.protein : undefined,
            }}
          >
            High Protein
          </button>
        </div>

        {/* Success Toast Notification (Fixed) */}
        {successToast && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in slide-in-from-top-2 shrink-0">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Strictly Scrollable Results / Suggestions Container */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-medium">Loading items...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 text-center">
              <Utensils className="w-8 h-8 text-slate-300 stroke-1" />
              <p className="text-xs font-medium text-slate-600">No food items found matching &quot;{query}&quot;</p>
              <p className="text-[11px] text-slate-400">Try searching for other food items or ingredients</p>
            </div>
          ) : (
            results.map((food) => {
              const isSelected = selectedFood?.id === food.id;
              const calculated = isSelected ? calculateMacros(food) : null;

              return (
                <div
                  key={food.id}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/20 shadow-sm'
                      : 'border-border bg-card hover:bg-muted/50 hover:border-primary/30'
                  }`}
                >
                  <div
                    onClick={() => handleSelectFood(food)}
                    className="p-2.5 cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground truncate">
                          {food.name}
                        </span>
                        {food.layer === 2 ? (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/40 bg-amber-500/10 text-amber-500">
                            Recipe
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/40 bg-primary/10 text-primary">
                            Raw
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                        <span>{food.servingWeight || 100}{food.servingUnit || 'g'}</span>
                        <span>•</span>
                        <span className="font-bold text-foreground">{food.calories} kcal</span>
                        <span>•</span>
                        <span className="font-semibold" style={{ color: MACRO_COLORS.protein }}>P: {food.protein}g</span>
                        <span className="font-semibold" style={{ color: MACRO_COLORS.carbs }}>C: {food.carbohydrates}g</span>
                        <span className="font-semibold" style={{ color: MACRO_COLORS.fat }}>F: {food.fat}g</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        className="h-7 px-2.5 text-xs rounded-lg"
                      >
                        {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span className="ml-1">{isSelected ? 'Close' : 'Add'}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Portion & Meal Log Selector */}
                  {isSelected && calculated && (
                    <div className="p-3 pt-0 border-t border-border mt-1 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                        {/* Target Meal Type */}
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                            Target Meal
                          </label>
                          <select
                            value={selectedMealType}
                            onChange={(e) => handleMealTypeSelect(e.target.value as MealTypeKey)}
                            className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="BREAKFAST">Morning (Breakfast)</option>
                            <option value="LUNCH">Afternoon (Lunch)</option>
                            <option value="SNACK">Evening (Snack)</option>
                            <option value="DINNER">Dinner</option>
                          </select>
                        </div>

                        {/* Custom Weight (Grams) */}
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                            Weight (grams)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={customWeightGrams}
                              onChange={(e) => setCustomWeightGrams(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Scale className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      {/* Calculated Macros Tally */}
                      <div className="bg-muted/50 p-2 rounded-lg border border-border flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-muted-foreground">Portion:</span>
                        <div className="flex items-center gap-2 font-mono font-bold">
                          <span className="text-primary">{calculated.calories} kcal</span>
                          <span style={{ color: MACRO_COLORS.protein }}>P:{calculated.protein}g</span>
                          <span style={{ color: MACRO_COLORS.carbs }}>C:{calculated.carbs}g</span>
                          <span style={{ color: MACRO_COLORS.fat }}>F:{calculated.fat}g</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleLogFood}
                        disabled={logging}
                        className="w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5"
                      >
                        {logging ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Log to {getMealLabel(selectedMealType)}</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
