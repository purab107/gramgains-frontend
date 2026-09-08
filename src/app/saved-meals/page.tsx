'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  SavedMeal, 
  FoodItem, 
  UserProfile 
} from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Edit3, 
  Flame, 
  Utensils, 
  Check, 
  X, 
  Search,
  Sparkles,
  Calendar
} from 'lucide-react';

export default function SavedMealsPage() {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);

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

  // Recipe totals calculator
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

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl bg-slate-900/80 border border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <Bookmark className="w-4 h-4" />
                <span>Custom Saved Recipes</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Saved Meals & Meal Prep Recipes
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Create reusable meal templates and log them to your daily tracker with one click.
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Saved Meal</span>
            </button>
          </div>

          {/* Saved Meals Grid */}
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
              Loading your saved recipes...
            </div>
          ) : savedMeals.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl bg-slate-900/40 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No Saved Meals Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create custom meal templates like "High Protein Breakfast Bowl" or "Post-Workout Smoothie" for instant logging.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold"
              >
                Build First Meal Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="glass-panel p-5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
                >
                  <div>
                    {/* Meal Title & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                          {meal.name}
                        </h3>
                        {meal.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                            {meal.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(meal)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Edit Meal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSavedMeal(meal.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Meal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Total Calorie Banner */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 my-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-slate-400">Total Calories</span>
                      </div>
                      <span className="text-base font-extrabold text-amber-400">
                        {Math.round(meal.totalCalories)} kcal
                      </span>
                    </div>

                    {/* Macro Breakdown Pills */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] mb-4">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-[9px] text-emerald-400 font-bold">PRO</div>
                        <div className="font-bold text-white">{Math.round(meal.totalProtein)}g</div>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="text-[9px] text-blue-400 font-bold">CARB</div>
                        <div className="font-bold text-white">{Math.round(meal.totalCarbs)}g</div>
                      </div>
                      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="text-[9px] text-purple-400 font-bold">FAT</div>
                        <div className="font-bold text-white">{Math.round(meal.totalFat)}g</div>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="text-[9px] text-amber-400 font-bold">FIBER</div>
                        <div className="font-bold text-white">{Math.round(meal.totalFiber)}g</div>
                      </div>
                    </div>

                    {/* Ingredient Items List */}
                    <div className="space-y-1 mb-4 max-h-36 overflow-y-auto pr-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Ingredients ({meal.items.length})
                      </div>
                      {meal.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-950/40 text-slate-300"
                        >
                          <span className="truncate">{item.food?.name || 'Ingredient'}</span>
                          <span className="font-mono text-slate-400 text-[11px]">
                            {item.weightGrams}g
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* One-click Log Button */}
                  <button
                    onClick={() => setLogMealTarget(meal)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all active:scale-95"
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
          <div className="modal-content max-w-xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">
                {editingMealId ? 'Edit Saved Recipe' : 'Create New Saved Recipe'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meal / Recipe Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Protein Chicken Oats Bowl"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Preparation Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-workout meal cooked with 1 tsp ghee"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Add Ingredient Section */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-3">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add Ingredient to Recipe</span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search food ingredient (e.g. Oats, Eggs, Chicken)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-28 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-lg border border-white/10">
                    {searchResults.map((food) => (
                      <div
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        className={`p-2 rounded text-xs cursor-pointer flex justify-between items-center ${
                          selectedFood?.id === food.id
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-semibold">{food.name}</span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            ({food.calories} kcal / {food.servingWeight}g)
                          </span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800">
                          {food.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFood && (
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    <div className="flex-1">
                      <label className="text-[11px] text-slate-400">Weight (grams)</label>
                      <input
                        type="number"
                        min="1"
                        value={addWeightGrams}
                        onChange={(e) => setAddWeightGrams(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-white font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400"
                    >
                      Add Item
                    </button>
                  </div>
                )}
              </div>

              {/* Recipe Ingredients Table */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Selected Ingredients ({recipeItems.length})
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {recipeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-white/5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{item.food.name}</span>
                        <span className="text-slate-400 ml-2">({item.weightGrams}g)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Totals Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-around text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Calories</div>
                  <div className="text-sm font-bold text-amber-400">{totals.calories} kcal</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Protein</div>
                  <div className="text-sm font-bold text-emerald-400">{totals.protein}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Carbs</div>
                  <div className="text-sm font-bold text-blue-400">{totals.carbs}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Fat</div>
                  <div className="text-sm font-bold text-purple-400">{totals.fat}g</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recipeItems.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-bold"
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
          <div className="modal-content max-w-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Utensils className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-white">Log "{logMealTarget.name}"</h3>
              <p className="text-xs text-slate-400 mt-1">
                {Math.round(logMealTarget.totalCalories)} kcal • {Math.round(logMealTarget.totalProtein)}g Protein
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Meal Category</label>
                <select
                  value={logMealType}
                  onChange={(e: any) => setLogMealType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-xs"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snacks & Extras</option>
                </select>
              </div>
            </div>

            {loggingSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Logged to Daily Tracker!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setLogMealTarget(null)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogToTracker}
                  className="w-1/2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold"
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
