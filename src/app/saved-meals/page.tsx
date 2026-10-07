'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ApiService, 
  SavedMeal, 
  FoodItem, 
  UserProfile 
} from '../../services/api';
import { getFoodIcon } from '../../lib/food-utils';
import { MACRO_COLORS } from '@/lib/constants';
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
import { useDevSkip } from '@/components/dev-skip';
import { isDevSkip } from '@/lib/dev-skip';

function SavedMealsPage() {
  const devSkip = useDevSkip();
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
    // Remove loading class to prevent flash of unstyled content
    document.body.classList.remove('loading');
    loadSavedMeals();
  }, []);

  // React to DevSkip Stage or Override changes
  useEffect(() => {
    if (!isDevSkip()) return;
    loadSavedMeals();
  }, [devSkip.activeStageId, devSkip.activeOverrides]);

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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Navbar userProfile={userProfile} />

        <main className="flex-1 p-4 pb-24 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Search Bar & Create Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search saved meals..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground shadow-2xs transition-all"
              />
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-primary/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Meal</span>
            </button>
          </div>

          {/* Saved Meals Grid or Centered Hero Empty State */}
          {loading ? (
            <div className="text-center py-20 text-muted-foreground text-xs animate-pulse">
              Loading your saved recipes...
            </div>
          ) : savedMeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center">
              <div className="w-36 h-36 relative mb-6 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1366 1151"
                  fill="none"
                  className="w-full h-full"
                  aria-label="No saved meals"
                >
                  <defs>
                    <linearGradient id="bowlOuter" x1="310" y1="570" x2="1010" y2="1000" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#5ED47D"/>
                      <stop offset="0.5" stopColor="#4FC875"/>
                      <stop offset="1" stopColor="#35A95F"/>
                    </linearGradient>
                    <linearGradient id="bowlInner" x1="400" y1="620" x2="850" y2="900" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#D9F5D9"/>
                      <stop offset="0.55" stopColor="#BCE8C2"/>
                      <stop offset="1" stopColor="#A9DFB2"/>
                    </linearGradient>
                    <linearGradient id="leafGradient" x1="470" y1="300" x2="750" y2="550" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#15965B"/>
                      <stop offset="1" stopColor="#087A48"/>
                    </linearGradient>
                    <linearGradient id="leafLight" x1="760" y1="270" x2="930" y2="450" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#31A968"/>
                      <stop offset="1" stopColor="#168650"/>
                    </linearGradient>

                    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
                      <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#37C96A" floodOpacity="0.45"/>
                    </filter>
                    <linearGradient id="highlight" x1="370" y1="650" x2="950" y2="850" gradientUnits="userSpaceOnUse">
                      <stop id="hlStop0" offset="0" stopColor="#FFFFFF" stopOpacity="0.55"/>
                      <stop id="hlStop1" offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
                    </linearGradient>
                    <style>{`
                      .dark #bowlInner stop:nth-child(1) { stop-color: #122B1A; }
                      .dark #bowlInner stop:nth-child(2) { stop-color: #0E2415; }
                      .dark #bowlInner stop:nth-child(3) { stop-color: #0B1E11; }
                      .dark #hlStop0 { stop-opacity: 0; }
                      .dark #hlStop1 { stop-opacity: 0; }
                      .dark .svg-left-highlight { stroke: #1A4228; }
                      .dark .svg-top-edge { stroke: #1E4A2E; }
                      .dark #leafGradient stop:nth-child(1) { stop-color: #0A5535; }
                      .dark #leafGradient stop:nth-child(2) { stop-color: #063D24; }
                      .dark #leafLight stop:nth-child(1) { stop-color: #175C37; }
                      .dark #leafLight stop:nth-child(2) { stop-color: #0C4529; }
                      .dark .svg-rear-leaf { fill: #1E5C2A; }
                      .dark .svg-stem-dark { stroke: #1A4A2A; }
                      .dark .svg-stem-light { stroke: #245733; }
                      .dark .svg-vein { stroke: #2A5C34; }
                    `}</style>
                  </defs>

                  <path d="M662 574 C653 529 636 484 612 445 C582 395 547 353 511 326" className="svg-stem-dark" stroke="#54B96E" strokeWidth="13" strokeLinecap="round" fill="none"/>
                  <path d="M662 574 C653 529 636 484 612 445 C582 395 547 353 511 326" className="svg-stem-light" stroke="#8EE89B" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8"/>
                  <path d="M640 548 C587 548 533 525 494 491 C456 458 434 414 428 362 C426 339 439 325 462 324 C517 321 570 342 609 376 C646 408 666 453 671 503 C674 527 663 544 640 548Z" fill="url(#leafGradient)" stroke="#087A4A" strokeWidth="5"/>
                  <path d="M531 411 C570 445 610 482 653 533" className="svg-vein" stroke="#B5F2B1" strokeWidth="10" strokeLinecap="round" opacity="0.65"/>
                  <path d="M672 508 C645 475 631 432 633 390 C636 345 655 303 681 277 C693 266 707 268 719 281 C747 311 756 353 749 397 C742 443 719 481 689 510 C682 517 676 516 672 508Z" fill="url(#leafGradient)" stroke="#087A4A" strokeWidth="5"/>
                  <path d="M686 456 C687 419 690 383 698 344" className="svg-vein" stroke="#A8EEA6" strokeWidth="9" strokeLinecap="round" opacity="0.7"/>
                  <path d="M752 460 C762 410 788 354 827 315 C862 280 907 259 943 264 C965 267 975 282 974 305 C974 354 954 402 920 436 C884 472 837 487 784 484 C762 483 750 475 752 460Z" fill="url(#leafLight)" stroke="#16804D" strokeWidth="5"/>
                  <path d="M814 435 C835 398 861 361 892 333" className="svg-vein" stroke="#D0F7C8" strokeWidth="10" strokeLinecap="round" opacity="0.8"/>
                  <path d="M735 535 C737 500 751 472 775 451 C800 429 831 423 854 429 C865 433 869 442 866 454 C857 487 834 514 803 532 C776 548 751 550 735 535Z" className="svg-rear-leaf" fill="#70D27C" opacity="0.72"/>
                  <path d="M278 594 C276 581 286 570 302 570 L1055 570 C1071 570 1082 582 1080 597 L1057 774 C1050 841 1014 897 958 931 C912 960 857 976 799 982 L614 982 C555 978 501 964 452 939 C389 906 350 853 336 788 L281 620 C277 609 276 600 278 594Z" fill="url(#bowlOuter)" stroke="#55C974" strokeWidth="7" filter="url(#shadow)"/>
                  <path d="M315 600 L1017 600 C1018 600 1019 602 1018 605 C1008 659 993 706 969 751 C928 828 855 881 772 900 C691 918 603 912 526 883 C441 851 377 794 344 713 C330 678 319 639 315 600Z" fill="url(#bowlInner)"/>
                  <path d="M315 600 L1017 600 C1011 620 1005 641 997 660 C965 746 908 813 830 852 C759 888 676 901 596 884 C508 866 431 818 383 747 C350 698 330 650 315 600Z" fill="url(#highlight)"/>
                  <path d="M364 658 C372 701 392 749 423 786" className="svg-left-highlight" stroke="#F2FFF0" strokeWidth="34" strokeLinecap="round" opacity="0.65"/>
                  <path d="M317 600 L1015 600" className="svg-top-edge" stroke="#D5F6D7" strokeWidth="7" opacity="0.8"/>
                  <path d="M458 912 C536 954 630 967 721 960 C808 953 885 924 947 877" stroke="#8CE19A" strokeWidth="9" strokeLinecap="round" opacity="0.45" fill="none"/>
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">
                No saved meals yet
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed font-normal">
                Create custom recipes by combining ingredients and save them for quick logging.
              </p>
            </div>
          ) : filteredSavedMeals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No saved meals found matching "<span className="font-semibold text-foreground">{filterQuery}</span>".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSavedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all group"
                >
                  <div>
                    {/* Meal Title & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {meal.name}
                        </h3>
                        {meal.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {meal.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(meal)}
                          className="p-1.5 rounded bg-muted hover:bg-primary/10 text-foreground border border-border transition-colors"
                          title="Edit Meal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSavedMeal(meal.id)}
                          className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors"
                          title="Delete Meal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Total Calorie Banner */}
                    <div className="p-3 rounded-lg bg-muted/40 border border-border my-3 flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground font-sans font-medium">Total Calories</span>
                      </div>
                      <span className="text-base font-bold text-foreground">
                        {Math.round(meal.totalCalories)} kcal
                      </span>
                    </div>

                    {/* Macro Breakdown Pills */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-mono mb-4">
                      <div className="p-2 rounded border" style={{ backgroundColor: `${MACRO_COLORS.protein}15`, borderColor: `${MACRO_COLORS.protein}35` }}>
                        <div className="text-[9px] font-sans font-bold" style={{ color: MACRO_COLORS.protein }}>PRO</div>
                        <div className="font-bold text-foreground">{Math.round(meal.totalProtein)}g</div>
                      </div>
                      <div className="p-2 rounded border" style={{ backgroundColor: `${MACRO_COLORS.carbs}15`, borderColor: `${MACRO_COLORS.carbs}35` }}>
                        <div className="text-[9px] font-sans font-bold" style={{ color: MACRO_COLORS.carbs }}>CARB</div>
                        <div className="font-bold text-foreground">{Math.round(meal.totalCarbs)}g</div>
                      </div>
                      <div className="p-2 rounded border" style={{ backgroundColor: `${MACRO_COLORS.fat}15`, borderColor: `${MACRO_COLORS.fat}35` }}>
                        <div className="text-[9px] font-sans font-bold" style={{ color: MACRO_COLORS.fat }}>FAT</div>
                        <div className="font-bold text-foreground">{Math.round(meal.totalFat)}g</div>
                      </div>
                      <div className="p-2 rounded border" style={{ backgroundColor: `${MACRO_COLORS.fiber}15`, borderColor: `${MACRO_COLORS.fiber}35` }}>
                        <div className="text-[9px] font-sans font-bold" style={{ color: MACRO_COLORS.fiber }}>FIBER</div>
                        <div className="font-bold text-foreground">{Math.round(meal.totalFiber)}g</div>
                      </div>
                    </div>

                    {/* Ingredient Items List */}
                    <div className="space-y-1 mb-4 max-h-36 overflow-y-auto pr-1">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                        Ingredients ({meal.items.length})
                      </div>
                      {meal.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/40 border border-border text-foreground"
                        >
                          <span className="truncate">{item.food?.name || 'Ingredient'}</span>
                          <span className="font-mono text-muted-foreground text-[11px]">
                            {item.weightGrams}g
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* One-click Log Button */}
                  <button
                    onClick={() => setLogMealTarget(meal)}
                    className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 border border-primary/20"
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
          <div className="modal-content max-w-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">
                {editingMealId ? 'Edit Saved Recipe' : 'Create New Saved Recipe'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Meal / Recipe Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Protein Chicken Oats Bowl"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Description / Preparation Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-workout meal cooked with 1 tsp ghee"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground outline-none focus:border-primary text-xs"
                />
              </div>

              {/* Add Ingredient Section */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-3">
                <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add Ingredient to Recipe</span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search food ingredient (e.g. Oats, Eggs, Chicken)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 bg-card p-2 rounded-lg border border-border">
                    {searchResults.map((food) => (
                      <div
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        className={`p-2 rounded-lg text-xs cursor-pointer flex justify-between items-center transition-all ${
                          selectedFood?.id === food.id
                            ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {(() => { const FoodIcon = getFoodIcon(food); return <FoodIcon className="w-4 h-4 text-muted-foreground" />; })()}
                          <div>
                            <span className="font-semibold">{food.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                              ({food.calories} kcal / {food.servingWeight}g)
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {food.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFood && (
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="flex-1">
                      <label className="text-[11px] text-muted-foreground">Weight (grams)</label>
                      <input
                        type="number"
                        min="1"
                        value={addWeightGrams}
                        onChange={(e) => setAddWeightGrams(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg text-xs text-foreground font-mono font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="mt-4 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
                    >
                      Add Item
                    </button>
                  </div>
                )}
              </div>

              {/* Recipe Ingredients Table */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  Selected Ingredients ({recipeItems.length})
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {recipeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{item.food.name}</span>
                        <span className="text-muted-foreground ml-2 font-mono">({item.weightGrams}g)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-red-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Totals Card */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-around text-center font-mono">
                <div>
                  <div className="text-[10px] text-muted-foreground font-sans font-semibold uppercase">Calories</div>
                  <div className="text-sm font-bold text-foreground">{totals.calories} kcal</div>
                </div>
                <div>
                  <div className="text-[10px] font-sans font-semibold uppercase" style={{ color: MACRO_COLORS.protein }}>Protein</div>
                  <div className="text-sm font-bold" style={{ color: MACRO_COLORS.protein }}>{totals.protein}g</div>
                </div>
                <div>
                  <div className="text-[10px] font-sans font-semibold uppercase" style={{ color: MACRO_COLORS.carbs }}>Carbs</div>
                  <div className="text-sm font-bold" style={{ color: MACRO_COLORS.carbs }}>{totals.carbs}g</div>
                </div>
                <div>
                  <div className="text-[10px] font-sans font-semibold uppercase" style={{ color: MACRO_COLORS.fat }}>Fat</div>
                  <div className="text-sm font-bold" style={{ color: MACRO_COLORS.fat }}>{totals.fat}g</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-muted text-muted-foreground border border-border text-xs font-semibold hover:bg-muted/80 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recipeItems.length === 0}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-bold shadow-sm"
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
          <div className="modal-content max-w-sm text-center space-y-4 bg-card border border-border">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <Utensils className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-base text-foreground">Log "{logMealTarget.name}"</h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {Math.round(logMealTarget.totalCalories)} kcal • {Math.round(logMealTarget.totalProtein)}g Protein
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">Target Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">Meal Category</label>
                <select
                  value={logMealType}
                  onChange={(e: any) => setLogMealType(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snacks & Extras</option>
                </select>
              </div>
            </div>

            {loggingSuccess ? (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Logged to Daily Tracker!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setLogMealTarget(null)}
                  className="w-1/2 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-xs font-semibold hover:bg-muted/80 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogToTracker}
                  className="w-1/2 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm"
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
