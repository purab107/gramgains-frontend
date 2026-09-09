'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, FoodItem } from '../services/api';
import { getFoodEmoji, getCleanCategoryLabel, calculatePer100g } from '../lib/food-utils';
import { 
  Search, 
  X, 
  Plus, 
  ArrowLeft, 
  Minus, 
  Check, 
  Flame, 
  Sparkles,
  Utensils
} from 'lucide-react';

interface MealLoggerModalProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onLogged: () => void;
}

export const MealLoggerModal: React.FC<MealLoggerModalProps> = ({
  date,
  isOpen,
  onClose,
  onLogged,
}) => {
  const [view, setView] = useState<'search' | 'detail'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('LUNCH');
  const [useCustomWeight, setUseCustomWeight] = useState(false);
  const [servings, setServings] = useState<number>(1);
  const [customWeightGrams, setCustomWeightGrams] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setView('search');
      fetchFoods();
    } else {
      setSearchQuery('');
      setSelectedFood(null);
      setServings(1);
      setUseCustomWeight(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchFoods();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCategory]);

  const fetchFoods = async () => {
    try {
      setSearching(true);
      const data = await ApiService.searchFoods(searchQuery);
      
      let filtered = data;
      if (selectedCategory !== 'ALL') {
        filtered = data.filter((item) => {
          const cat = (item.category || '').toLowerCase();
          const name = item.name.toLowerCase();
          if (selectedCategory === 'DISHES') return item.layer === 2 || cat.includes('dish') || cat.includes('curry') || cat.includes('rice');
          if (selectedCategory === 'BREADS') return cat.includes('bread') || name.includes('roti') || name.includes('naan') || name.includes('paratha');
          if (selectedCategory === 'CURRIES') return cat.includes('curry') || cat.includes('dal') || name.includes('curry') || name.includes('dal') || name.includes('sambar');
          if (selectedCategory === 'SNACKS') return cat.includes('snack') || cat.includes('dessert') || cat.includes('sweet');
          if (selectedCategory === 'DRINKS') return cat.includes('beverage') || name.includes('tea') || name.includes('coffee') || name.includes('shake') || name.includes('juice');
          return true;
        });
      }

      setFoods(filtered);
    } catch (err) {
      console.error('Failed to search foods:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setServings(1);
    setCustomWeightGrams(food.servingWeight || 100);
    setUseCustomWeight(false);
    setView('detail');
  };

  const handleBackToSearch = () => {
    setView('search');
  };

  const handleAdjustServings = (delta: number) => {
    setServings((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      return next > 0.1 ? next : 0.1;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    setLoading(true);
    try {
      await ApiService.logMeal({
        date,
        mealType,
        foodId: selectedFood.id,
        servings: useCustomWeight ? undefined : servings,
        customWeightGrams: useCustomWeight ? customWeightGrams : undefined,
      });
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        onLogged();
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to log meal:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Active Multiplier & Dynamic Macros
  const servingBaseWeight = selectedFood?.servingWeight || 100;
  const activeWeight = selectedFood
    ? useCustomWeight
      ? customWeightGrams
      : Math.round(servingBaseWeight * servings)
    : 100;

  const multiplier = selectedFood
    ? useCustomWeight
      ? customWeightGrams / servingBaseWeight
      : servings
    : 1;

  const activeCalories = selectedFood ? Math.round(selectedFood.calories * multiplier) : 0;
  const activeProtein = selectedFood ? Math.round(selectedFood.protein * multiplier * 10) / 10 : 0;
  const activeCarbs = selectedFood ? Math.round(selectedFood.carbohydrates * multiplier * 10) / 10 : 0;
  const activeFat = selectedFood ? Math.round(selectedFood.fat * multiplier * 10) / 10 : 0;
  const activeFiber = selectedFood ? Math.round((selectedFood.fiber || 0) * multiplier * 10) / 10 : 0;

  // Standard 100g Nutrition Reference
  const per100g = selectedFood ? calculatePer100g(selectedFood) : null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-[#E1E7E5] flex items-center justify-between bg-white sticky top-0 z-10">
          {view === 'detail' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBackToSearch}
                className="p-1.5 -ml-1.5 rounded-lg hover:bg-[#F7F9F8] text-[#68716F] hover:text-[#171C1B] transition-colors"
                title="Back to search results"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-sm font-bold text-[#171C1B]">Nutrition & Portion</h2>
                <p className="text-[11px] text-[#68716F]">Adjust serving before logging</p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-base font-bold text-[#171C1B] flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#0A7C6E]" />
                <span>Search Food</span>
              </h2>
              <p className="text-[11px] text-[#68716F]">Select a dish or raw ingredient to log</p>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F7F9F8] text-[#68716F] hover:text-[#171C1B] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: ABSTRACTED SEARCH RESULTS VIEW                                     */}
        {/* ========================================================================= */}
        {view === 'search' && (
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-[#68716F]" />
              <input
                type="text"
                autoFocus
                placeholder="Search food (e.g., biryani, paneer, roti, dal)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-[#F7F9F8] focus:bg-white border border-[#E1E7E5] rounded-xl text-xs text-[#171C1B] placeholder-[#68716F] outline-none focus:border-[#0A7C6E] focus:ring-2 focus:ring-[#0A7C6E]/10 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[#68716F] hover:text-[#171C1B]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Quick Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'ALL', label: 'All Foods' },
                { id: 'DISHES', label: 'Dishes' },
                { id: 'CURRIES', label: 'Curries & Dal' },
                { id: 'BREADS', label: 'Breads & Roti' },
                { id: 'SNACKS', label: 'Snacks & Sweets' },
                { id: 'DRINKS', label: 'Beverages' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap border ${
                    selectedCategory === cat.id
                      ? 'bg-[#0A7C6E] text-white border-[#0A7C6E] shadow-sm'
                      : 'bg-white text-[#68716F] border-[#E1E7E5] hover:border-[#B8E2DC] hover:text-[#075E54] hover:bg-[#E6F3F1]/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Results Counter / Heading */}
            <div className="flex items-center justify-between text-[11px] text-[#68716F] font-medium px-0.5">
              <span>{searchQuery ? `Results for "${searchQuery}"` : 'Popular & Recent Foods'}</span>
              <span>{foods.length} items</span>
            </div>

            {/* Food Results List (Clean & Abstracted) */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {searching ? (
                <div className="py-12 text-center text-xs text-[#68716F] animate-pulse">
                  Searching food database...
                </div>
              ) : foods.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#E6F3F1] text-[#075E54] flex items-center justify-center mx-auto text-lg">
                    🔍
                  </div>
                  <p className="text-xs font-semibold text-[#171C1B]">No foods found</p>
                  <p className="text-[11px] text-[#68716F]">Try searching with a different dish name or keyword.</p>
                </div>
              ) : (
                foods.map((food) => {
                  const emoji = getFoodEmoji(food);
                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="p-3 rounded-xl border border-[#E1E7E5] bg-white hover:border-[#0A7C6E] hover:bg-[#F7F9F8] transition-all cursor-pointer flex items-center justify-between group shadow-sm active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#F7F9F8] group-hover:bg-[#E6F3F1] border border-[#E1E7E5] group-hover:border-[#B8E2DC] flex items-center justify-center text-lg shrink-0 transition-colors">
                          {emoji}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-[#171C1B] group-hover:text-[#0A7C6E] truncate transition-colors">
                            {food.name}
                          </h4>
                          <div className="text-[11px] text-[#68716F] font-mono mt-0.5">
                            {food.servingWeight}{food.servingUnit} · <span className="font-semibold text-[#171C1B]">{food.calories} kcal</span>
                          </div>
                          <div className="text-[10px] text-[#68716F] font-mono mt-0.5 flex items-center gap-1.5">
                            <span>P <strong className="text-[#075E54] font-semibold">{food.protein}g</strong></span>
                            <span>·</span>
                            <span>C <strong className="text-[#171C1B] font-semibold">{food.carbohydrates}g</strong></span>
                            <span>·</span>
                            <span>F <strong className="text-[#68716F] font-semibold">{food.fat}g</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className="text-[11px] font-semibold text-[#0A7C6E] bg-[#E6F3F1] px-2 py-1 rounded-lg border border-[#B8E2DC] group-hover:bg-[#0A7C6E] group-hover:text-white transition-all">
                          Select
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: FOOD DETAIL & PORTION NUTRITION SCREEN                            */}
        {/* ========================================================================= */}
        {view === 'detail' && selectedFood && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Header: Title + Emoji + Clean Category Subtitle */}
            <div className="bg-[#FFFFFF] border border-[#E1E7E5] rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#E6F3F1] border border-[#B8E2DC] flex items-center justify-center text-2xl shrink-0">
                  {getFoodEmoji(selectedFood)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#171C1B] leading-tight">
                    {selectedFood.name}
                  </h3>
                  <div className="text-xs text-[#68716F] mt-0.5 font-medium">
                    {getCleanCategoryLabel(selectedFood)}
                  </div>
                </div>
              </div>

              {/* Dynamic Calorie Hero Badge */}
              <div className="mt-4 pt-3.5 border-t border-[#E1E7E5] flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black text-[#171C1B] font-mono tracking-tight flex items-baseline gap-1">
                    {activeCalories} <span className="text-sm font-semibold text-[#68716F]">kcal</span>
                  </div>
                  <div className="text-[11px] text-[#68716F] mt-0.5">
                    per {activeWeight}g serving
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F3F1] text-[#075E54] border border-[#B8E2DC] text-[11px] font-semibold">
                  <Flame size={13} className="text-[#0A7C6E]" />
                  <span>Calculated Macros</span>
                </div>
              </div>
            </div>

            {/* ──────────────────── MACROS SECTION ──────────────────── */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#68716F] uppercase tracking-wider px-1">
                MACROS
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono text-center">
                <div className="p-2.5 rounded-xl bg-[#E6F3F1] border border-[#B8E2DC]">
                  <div className="text-[10px] text-[#075E54] font-sans font-bold uppercase">Protein</div>
                  <div className="text-base font-bold text-[#075E54] mt-0.5">{activeProtein}g</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-[#E1E7E5]">
                  <div className="text-[10px] text-[#68716F] font-sans font-bold uppercase">Carbs</div>
                  <div className="text-base font-bold text-[#171C1B] mt-0.5">{activeCarbs}g</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-[#E1E7E5]">
                  <div className="text-[10px] text-[#68716F] font-sans font-bold uppercase">Fat</div>
                  <div className="text-base font-bold text-[#171C1B] mt-0.5">{activeFat}g</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-[#E1E7E5]">
                  <div className="text-[10px] text-[#68716F] font-sans font-bold uppercase">Fiber</div>
                  <div className="text-base font-bold text-[#171C1B] mt-0.5">{activeFiber}g</div>
                </div>
              </div>
            </div>

            {/* ──────────────────── SERVING SECTION ──────────────────── */}
            <div className="bg-[#FFFFFF] border border-[#E1E7E5] rounded-2xl p-4 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#68716F] uppercase tracking-wider">
                  SERVING PORTION
                </span>
                {/* Toggle Servings vs Grams */}
                <div className="flex items-center bg-[#F7F9F8] p-0.5 rounded-lg border border-[#E1E7E5] text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setUseCustomWeight(false)}
                    className={`px-2 py-1 rounded-md transition-all ${
                      !useCustomWeight
                        ? 'bg-[#0A7C6E] text-white shadow-xs'
                        : 'text-[#68716F] hover:text-[#171C1B]'
                    }`}
                  >
                    Servings
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomWeight(true)}
                    className={`px-2 py-1 rounded-md transition-all ${
                      useCustomWeight
                        ? 'bg-[#0A7C6E] text-white shadow-xs'
                        : 'text-[#68716F] hover:text-[#171C1B]'
                    }`}
                  >
                    Custom Grams
                  </button>
                </div>
              </div>

              {!useCustomWeight ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F9F8] border border-[#E1E7E5]">
                  <div>
                    <div className="text-xs font-bold text-[#171C1B]">
                      {servings} {servings === 1 ? 'serving' : 'servings'}
                    </div>
                    <div className="text-[11px] text-[#68716F] font-mono mt-0.5">
                      ≈ {activeWeight}g total portion
                    </div>
                  </div>

                  {/* Stepper Controls: [ - ] count [ + ] */}
                  <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-xl border border-[#E1E7E5] shadow-xs font-mono">
                    <button
                      type="button"
                      onClick={() => handleAdjustServings(-0.5)}
                      className="p-1 rounded-lg hover:bg-[#E6F3F1] text-[#171C1B] hover:text-[#075E54] active:scale-90 transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2 font-bold text-sm text-[#171C1B] min-w-[2.5rem] text-center">
                      {servings}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustServings(0.5)}
                      className="p-1 rounded-lg hover:bg-[#E6F3F1] text-[#171C1B] hover:text-[#075E54] active:scale-90 transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#F7F9F8] border border-[#E1E7E5] space-y-1.5">
                  <label className="text-[11px] text-[#68716F] font-medium block">
                    Custom Portion Weight in Grams
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={customWeightGrams}
                      onChange={(e) => setCustomWeightGrams(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-white border border-[#E1E7E5] rounded-lg text-xs text-[#171C1B] font-mono font-bold outline-none focus:border-[#0A7C6E]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-[#68716F] font-mono">
                      grams
                    </span>
                  </div>
                </div>
              )}

              {/* Meal Category Segmented Selector */}
              <div>
                <label className="text-[11px] font-semibold text-[#68716F] block mb-1.5">
                  Log to Meal Time
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'BREAKFAST', label: 'Breakfast' },
                    { id: 'LUNCH', label: 'Lunch' },
                    { id: 'DINNER', label: 'Dinner' },
                    { id: 'SNACK', label: 'Snack' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMealType(m.id as any)}
                      className={`py-2 rounded-lg font-semibold text-center border text-[11px] transition-all ${
                        mealType === m.id
                          ? 'bg-[#0A7C6E] text-white border-[#0A7C6E] shadow-xs'
                          : 'bg-white text-[#171C1B] border-[#E1E7E5] hover:bg-[#E6F3F1]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ──────────────────── PER 100g SECTION ──────────────────── */}
            {per100g && (
              <div className="bg-[#FFFFFF] border border-[#E1E7E5] rounded-2xl p-4 shadow-sm space-y-2 font-mono">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[11px] font-bold text-[#68716F] uppercase tracking-wider">
                    PER 100g REFERENCE
                  </span>
                  <span className="text-xs font-bold text-[#171C1B] font-mono">
                    {per100g.calories} kcal
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1 border-t border-[#E1E7E5]/70">
                  <div>
                    <div className="text-[9px] text-[#68716F] font-sans uppercase">Protein</div>
                    <div className="font-bold text-[#075E54] mt-0.5">{per100g.protein}g</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#68716F] font-sans uppercase">Carbs</div>
                    <div className="font-bold text-[#171C1B] mt-0.5">{per100g.carbs}g</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#68716F] font-sans uppercase">Fat</div>
                    <div className="font-bold text-[#68716F] mt-0.5">{per100g.fat}g</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#68716F] font-sans uppercase">Fiber</div>
                    <div className="font-bold text-[#68716F] mt-0.5">{per100g.fiber}g</div>
                  </div>
                </div>
              </div>
            )}

            {/* Source Footnote */}
            <div className="flex items-center justify-between text-[11px] text-[#68716F] px-1 font-mono">
              <span>Database Provenance:</span>
              <span className="px-2 py-0.5 rounded bg-[#E6F3F1] text-[#075E54] border border-[#B8E2DC] font-semibold">
                {selectedFood.source || 'INDB 2024'}
              </span>
            </div>

            {/* Success Toast / CTA Button */}
            {successToast ? (
              <div className="p-3.5 rounded-xl bg-[#E6F3F1] border border-[#B8E2DC] text-[#075E54] font-bold text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-[#0A7C6E]" />
                <span>Added to {mealType.toLowerCase()} tracker!</span>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#0A7C6E] hover:bg-[#075E54] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] border border-[#0A7C6E]"
                >
                  <Plus size={16} />
                  <span>{loading ? 'Adding to Meal...' : 'Add to Meal'}</span>
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
