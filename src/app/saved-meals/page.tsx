'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ApiService, 
  SavedMeal, 
  FoodItem, 
  UserProfile 
} from '../../services/api';
import { getFoodEmoji } from '../../lib/food-utils';
import { 
  Sidebar,
  Navbar,
  AuthGuard
} from '@/components';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Edit3, 
  Flame, 
  Utensils, 
  Check, 
  X, 
  Search
} from 'lucide-react';

function SavedMealsPage() {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [recipeItems, setRecipeItems] = useState<{ food: FoodItem; weightGrams: number }[]>([]);

  // Food Search in Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [addWeightGrams, setAddWeightGrams] = useState(100);

  // Quick Log Modal State
  const [logMealTarget, setLogMealTarget] = useState<SavedMeal | null>(null);
  const [logMealType, setLogMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('LUNCH');
  const [loggingSuccess, setLoggingSuccess] = useState(false);

  useEffect(() => {
    loadSavedMeals();
  }, []);

  const loadSavedMeals = async () => {
    try {
      setLoading(true);
      const [meals, profile] = await Promise.all([
        ApiService.getSavedMeals(),
        ApiService.getProfile().catch(() => null),
      ]);
      setSavedMeals(meals);
      if (profile) setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load saved meals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && searchQuery) {
      ApiService.searchFoods(searchQuery)
        .then(setSearchResults)
        .catch(console.error);
    }
  }, [searchQuery, isModalOpen]);

  const handleOpenCreateModal = () => {
    setEditingMealId(null);
    setMealName('');
    setMealDescription('');
    setRecipeItems([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meal: SavedMeal) => {
    setEditingMealId(meal.id);
    setMealName(meal.name);
    setMealDescription(meal.description || '');
    setRecipeItems(
      meal.items.map((item) => ({
        food: item.food || {
          id: item.foodId,
          name: 'Food Ingredient',
          aliases: [],
          category: 'General',
          servingUnit: 'g',
          servingWeight: 100,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbohydrates: item.carbs || 0,
          fat: item.fat || 0,
          fiber: item.fiber || 0,
          source: 'Saved',
          layer: 1,
        },
        weightGrams: item.weightGrams,
      }))
    );
    setIsModalOpen(true);
  };

  const handleAddIngredient = () => {
    if (!selectedFood) return;
    setRecipeItems((prev) => [
      ...prev,
      { food: selectedFood, weightGrams: addWeightGrams },
    ]);
    setSelectedFood(null);
    setSearchQuery('');
  };

  const handleRemoveIngredient = (index: number) => {
    setRecipeItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || recipeItems.length === 0) return;

    try {
      const payload = {
        name: mealName.trim(),
        description: mealDescription.trim(),
        items: recipeItems.map((item) => ({
          foodId: item.food.id,
          weightGrams: item.weightGrams,
        })),
      };

      if (editingMealId) {
        await ApiService.updateSavedMeal(editingMealId, payload);
      } else {
        await ApiService.createSavedMeal(payload);
      }

      setIsModalOpen(false);
      loadSavedMeals();
    } catch (err) {
      console.error('Failed to save recipe:', err);
    }
  };

  const handleDeleteSavedMeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved meal?')) return;
    try {
      await ApiService.deleteSavedMeal(id);
      loadSavedMeals();
    } catch (err) {
      console.error('Failed to delete saved meal:', err);
    }
  };

  const handleLogToTracker = async () => {
    if (!logMealTarget) return;
    try {
      await ApiService.logSavedMealToTracker(logMealTarget.id, {
        date: selectedDate,
        mealType: logMealType,
      });
      setLoggingSuccess(true);
      setTimeout(() => {
        setLoggingSuccess(false);
        setLogMealTarget(null);
      }, 1200);
    } catch (err) {
      console.error('Failed logging saved meal to tracker:', err);
    }
  };

  const calcRecipeTotals = () => {
    let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    for (const item of recipeItems) {
      const mult = item.weightGrams / item.food.servingWeight;
      calories += item.food.calories * mult;
      protein += item.food.protein * mult;
      carbs += item.food.carbohydrates * mult;
      fat += item.food.fat * mult;
      fiber += (item.food.fiber || 0) * mult;
    }
    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
    };
  };

  const totals = calcRecipeTotals();

  const filteredSavedMeals = savedMeals.filter((meal) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      meal.name.toLowerCase().includes(q) ||
      (meal.description && meal.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex min-h-screen bg-[#fcfdfe] text-[#171C1B]">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-[#fcfdfe]">
        <Navbar userProfile={userProfile} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Search Bar & Create Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search saved meals..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm outline-none focus:border-[#0f8651] focus:ring-1 focus:ring-[#0f8651] text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all"
              />
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0f8651] hover:bg-[#0d7649] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-[#0f8651] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Meal</span>
            </button>
          </div>

          {/* Saved Meals Grid or Centered Hero Empty State */}
          {loading ? (
            <div className="text-center py-20 text-[#68716F] text-xs animate-pulse">
              Loading your saved recipes...
            </div>
          ) : savedMeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center">
              <div className="w-32 h-32 relative mb-6 flex items-center justify-center">
                <Image
                  src="/images/saved-meal-empty.png"
                  alt="No saved meals"
                  width={140}
                  height={140}
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0f172a] tracking-tight mb-2">
                No saved meals yet
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed font-normal">
                Create custom recipes by combining ingredients and save them for quick logging.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-6 py-3 rounded-xl bg-[#0f8651] hover:bg-[#0d7649] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-[#0f8651]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Meal</span>
              </button>
            </div>
          ) : filteredSavedMeals.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              No saved meals found matching "<span className="font-semibold text-slate-700">{filterQuery}</span>".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSavedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-[#fefeff] p-5 rounded-xl border border-[#e5e7eb] shadow-sm flex flex-col justify-between hover:border-[#0f8651]/40 transition-all group"
                >
                  <div>
                    {/* Meal Title & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-base text-[#171C1B] group-hover:text-[#0f8651] transition-colors">
                          {meal.name}
                        </h3>
                        {meal.description && (
                          <p className="text-xs text-[#68716F] mt-0.5 line-clamp-2">
                            {meal.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(meal)}
                          className="p-1.5 rounded bg-[#fcfdfe] hover:bg-[#e4f7ee] text-[#171C1B] border border-[#e5e7eb] transition-colors"
                          title="Edit Meal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSavedMeal(meal.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-[#f15359] border border-red-200 transition-colors"
                          title="Delete Meal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Total Calorie Banner */}
                    <div className="p-3 rounded-lg bg-[#fcfdfe] border border-[#e5e7eb] my-3 flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#0f8651]" />
                        <span className="text-xs text-[#68716F] font-sans font-medium">Total Calories</span>
                      </div>
                      <span className="text-base font-bold text-[#171C1B]">
                        {Math.round(meal.totalCalories)} kcal
                      </span>
                    </div>

                    {/* Macro Breakdown Pills */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-mono mb-4">
                      <div className="p-2 rounded bg-[#2873e5]/10 border border-[#2873e5]/30">
                        <div className="text-[9px] text-[#2873e5] font-sans font-bold">PRO</div>
                        <div className="font-bold text-[#171C1B]">{Math.round(meal.totalProtein)}g</div>
                      </div>
                      <div className="p-2 rounded bg-[#f15359]/10 border border-[#f15359]/30">
                        <div className="text-[9px] text-[#f15359] font-sans font-bold">CARB</div>
                        <div className="font-bold text-[#171C1B]">{Math.round(meal.totalCarbs)}g</div>
                      </div>
                      <div className="p-2 rounded bg-[#feb111]/10 border border-[#feb111]/30">
                        <div className="text-[9px] text-[#d99605] font-sans font-bold">FAT</div>
                        <div className="font-bold text-[#171C1B]">{Math.round(meal.totalFat)}g</div>
                      </div>
                      <div className="p-2 rounded bg-[#4cd593]/15 border border-[#4cd593]/40">
                        <div className="text-[9px] text-[#0d7649] font-sans font-bold">FIBER</div>
                        <div className="font-bold text-[#171C1B]">{Math.round(meal.totalFiber)}g</div>
                      </div>
                    </div>

                    {/* Ingredient Items List */}
                    <div className="space-y-1 mb-4 max-h-36 overflow-y-auto pr-1">
                      <div className="text-[10px] uppercase font-bold text-[#68716F] mb-1">
                        Ingredients ({meal.items.length})
                      </div>
                      {meal.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#fcfdfe] border border-[#e5e7eb] text-[#171C1B]"
                        >
                          <span className="truncate">{item.food?.name || 'Ingredient'}</span>
                          <span className="font-mono text-[#68716F] text-[11px]">
                            {item.weightGrams}g
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* One-click Log Button */}
                  <button
                    onClick={() => setLogMealTarget(meal)}
                    className="w-full py-2 rounded-lg bg-[#0f8651] hover:bg-[#0d7649] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 border border-[#0f8651]"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Log to Daily Tracker</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT SAVED MEAL MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content max-w-xl bg-[#fefeff] border border-[#e5e7eb]">
            <div className="flex items-center justify-between mb-4 border-b border-[#e5e7eb] pb-3">
              <h2 className="text-base font-bold text-[#171C1B]">
                {editingMealId ? 'Edit Saved Recipe' : 'Create New Saved Recipe'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#68716F] hover:text-[#171C1B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#68716F] mb-1">
                  Meal / Recipe Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Protein Chicken Oats Bowl"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[#171C1B] outline-none focus:border-[#0f8651] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#68716F] mb-1">
                  Description / Preparation Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-workout meal cooked with 1 tsp ghee"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[#171C1B] outline-none focus:border-[#0f8651] text-xs"
                />
              </div>

              {/* Add Ingredient Section */}
              <div className="p-3.5 rounded-xl bg-[#fcfdfe] border border-[#e5e7eb] space-y-3">
                <div className="text-xs font-semibold text-[#0f8651] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add Ingredient to Recipe</span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#68716F]" />
                  <input
                    type="text"
                    placeholder="Search food ingredient (e.g. Oats, Eggs, Chicken)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-xs text-[#171C1B] outline-none focus:border-[#0f8651]"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-2 rounded-lg border border-[#e5e7eb]">
                    {searchResults.map((food) => (
                      <div
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        className={`p-2 rounded-lg text-xs cursor-pointer flex justify-between items-center transition-all ${
                          selectedFood?.id === food.id
                            ? 'bg-[#e4f7ee] text-[#0d7649] font-semibold border border-[#e5e7eb]'
                            : 'hover:bg-[#fcfdfe] text-[#171C1B]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getFoodEmoji(food)}</span>
                          <div>
                            <span className="font-semibold">{food.name}</span>
                            <span className="text-[10px] text-[#68716F] ml-2 font-mono">
                              ({food.calories} kcal / {food.servingWeight}g)
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e4f7ee] text-[#0d7649] border border-[#e5e7eb]">
                          {food.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFood && (
                  <div className="flex items-center gap-3 pt-2 border-t border-[#e5e7eb]">
                    <div className="flex-1">
                      <label className="text-[11px] text-[#68716F]">Weight (grams)</label>
                      <input
                        type="number"
                        min="1"
                        value={addWeightGrams}
                        onChange={(e) => setAddWeightGrams(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#e5e7eb] rounded-lg text-xs text-[#171C1B] font-mono font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="mt-4 px-3 py-1.5 rounded-lg bg-[#0f8651] text-white text-xs font-bold hover:bg-[#0d7649]"
                    >
                      Add Item
                    </button>
                  </div>
                )}
              </div>

              {/* Recipe Ingredients Table */}
              <div>
                <div className="text-xs font-semibold text-[#68716F] mb-2">
                  Selected Ingredients ({recipeItems.length})
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {recipeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#fcfdfe] border border-[#e5e7eb] text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#171C1B]">{item.food.name}</span>
                        <span className="text-[#68716F] ml-2 font-mono">({item.weightGrams}g)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-[#f15359] hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Totals Card */}
              <div className="p-3 rounded-xl bg-[#fcfdfe] border border-[#e5e7eb] flex items-center justify-around text-center font-mono">
                <div>
                  <div className="text-[10px] text-[#68716F] font-sans font-semibold uppercase">Calories</div>
                  <div className="text-sm font-bold text-[#171C1B]">{totals.calories} kcal</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#2873e5] font-sans font-semibold uppercase">Protein</div>
                  <div className="text-sm font-bold text-[#2873e5]">{totals.protein}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#f15359] font-sans font-semibold uppercase">Carbs</div>
                  <div className="text-sm font-bold text-[#f15359]">{totals.carbs}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#d99605] font-sans font-semibold uppercase">Fat</div>
                  <div className="text-sm font-bold text-[#d99605]">{totals.fat}g</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#fcfdfe] text-[#68716F] border border-[#e5e7eb] text-xs font-semibold hover:bg-[#e4f7ee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recipeItems.length === 0}
                  className="px-5 py-2 rounded-lg bg-[#0f8651] hover:bg-[#0d7649] disabled:opacity-50 text-white text-xs font-bold shadow-sm"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK LOG MODAL */}
      {logMealTarget && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm text-center space-y-4 bg-[#fefeff] border border-[#e5e7eb]">
            <div className="w-10 h-10 rounded-xl bg-[#e4f7ee] border border-[#e5e7eb] text-[#0d7649] flex items-center justify-center mx-auto">
              <Utensils className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#171C1B]">Log "{logMealTarget.name}"</h3>
              <p className="text-xs text-[#68716F] mt-0.5 font-mono">
                {Math.round(logMealTarget.totalCalories)} kcal • {Math.round(logMealTarget.totalProtein)}g Protein
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs text-[#68716F] block mb-1 font-semibold">Target Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[#171C1B] text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-[#68716F] block mb-1 font-semibold">Meal Category</label>
                <select
                  value={logMealType}
                  onChange={(e: any) => setLogMealType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[#171C1B] text-xs"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snacks & Extras</option>
                </select>
              </div>
            </div>

            {loggingSuccess ? (
              <div className="p-3 rounded-lg bg-[#e4f7ee] border border-[#e5e7eb] text-[#0d7649] font-bold text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Logged to Daily Tracker!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setLogMealTarget(null)}
                  className="w-1/2 py-2 rounded-lg bg-[#fcfdfe] border border-[#e5e7eb] text-[#68716F] text-xs font-semibold hover:bg-[#e4f7ee]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogToTracker}
                  className="w-1/2 py-2 rounded-lg bg-[#0f8651] hover:bg-[#0d7649] text-white text-xs font-bold shadow-sm"
                >
                  Confirm & Log
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedMealsPageGuarded() {
  return (
    <AuthGuard>
      <SavedMealsPage />
    </AuthGuard>
  );
}
