'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ApiService, 
  SavedMeal, 
  UserProfile 
} from '../../services/api';
import { getFoodIcon } from '../../lib/food-utils';
import { MACRO_COLORS } from '@/lib/constants';
import { 
  Sidebar,
  Navbar,
  AuthGuard,
  SaveMealSheet
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
  Search,
  ImageIcon
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

  // Side Panel Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<SavedMeal | null>(null);

  // Quick Log Modal State
  const [logMealTarget, setLogMealTarget] = useState<SavedMeal | null>(null);
  const [logMealType, setLogMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('LUNCH');
  const [loggingSuccess, setLoggingSuccess] = useState(false);

  useEffect(() => {
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

  const handleOpenCreateSheet = () => {
    setEditingMeal(null);
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (meal: SavedMeal) => {
    setEditingMeal(meal);
    setIsSheetOpen(true);
  };

  const handleMealSaved = (saved: SavedMeal) => {
    setSavedMeals((prev) => {
      const idx = prev.findIndex((m) => m.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteSavedMeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved recipe?')) return;
    try {
      await ApiService.deleteSavedMeal(id);
      setSavedMeals((prev) => prev.filter((m) => m.id !== id));
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
      }, 1500);
    } catch (err) {
      console.error('Failed to log saved meal:', err);
    }
  };

  const filteredSavedMeals = savedMeals.filter((meal) => {
    const query = filterQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      meal.name.toLowerCase().includes(query) ||
      meal.description?.toLowerCase().includes(query) ||
      meal.items.some((i) => i.food?.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar userProfile={userProfile} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar userProfile={userProfile} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                    Saved Recipes & Meals
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                    Create reusable meal templates with photos and one-click daily logging.
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={handleOpenCreateSheet}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-primary/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Meal</span>
            </button>
          </div>

          {/* SEARCH & FILTER BAR */}
          {savedMeals.length > 0 && (
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by recipe name or ingredient..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                />
                {filterQuery && (
                  <button
                    onClick={() => setFilterQuery('')}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

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
                  </defs>

                  <path d="M662 574 C653 529 636 484 612 445 C582 395 547 353 511 326" stroke="#54B96E" strokeWidth="13" strokeLinecap="round" fill="none"/>
                  <path d="M662 574 C653 529 636 484 612 445 C582 395 547 353 511 326" stroke="#8EE89B" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8"/>
                  <path d="M640 548 C587 548 533 525 494 491 C456 458 434 414 428 362 C426 339 439 325 462 324 C517 321 570 342 609 376 C646 408 666 453 671 503 C674 527 663 544 640 548Z" fill="url(#leafGradient)" stroke="#087A4A" strokeWidth="5"/>
                  <path d="M531 411 C570 445 610 482 653 533" stroke="#B5F2B1" strokeWidth="10" strokeLinecap="round" opacity="0.65"/>
                  <path d="M672 508 C645 475 631 432 633 390 C636 345 655 303 681 277 C693 266 707 268 719 281 C747 311 756 353 749 397 C742 443 719 481 689 510 C682 517 676 516 672 508Z" fill="url(#leafGradient)" stroke="#087A4A" strokeWidth="5"/>
                  <path d="M686 456 C687 419 690 383 698 344" stroke="#A8EEA6" strokeWidth="9" strokeLinecap="round" opacity="0.7"/>
                  <path d="M752 460 C762 410 788 354 827 315 C862 280 907 259 943 264 C965 267 975 282 974 305 C974 354 954 402 920 436 C884 472 837 487 784 484 C762 483 750 475 752 460Z" fill="url(#leafLight)" stroke="#16804D" strokeWidth="5"/>
                  <path d="M814 435 C835 398 861 361 892 333" stroke="#D0F7C8" strokeWidth="10" strokeLinecap="round" opacity="0.8"/>
                  <path d="M735 535 C737 500 751 472 775 451 C800 429 831 423 854 429 C865 433 869 442 866 454 C857 487 834 514 803 532 C776 548 751 550 735 535Z" fill="#70D27C" opacity="0.72"/>
                  <path d="M278 594 C276 581 286 570 302 570 L1055 570 C1071 570 1082 582 1080 597 L1057 774 C1050 841 1014 897 958 931 C912 960 857 976 799 982 L614 982 C555 978 501 964 452 939 C389 906 350 853 336 788 L281 620 C277 609 276 600 278 594Z" fill="url(#bowlOuter)" stroke="#55C974" strokeWidth="7" filter="url(#shadow)"/>
                  <path d="M315 600 L1017 600 C1018 600 1019 602 1018 605 C1008 659 993 706 969 751 C928 828 855 881 772 900 C691 918 603 912 526 883 C441 851 377 794 344 713 C330 678 319 639 315 600Z" fill="url(#bowlInner)"/>
                  <path d="M315 600 L1017 600 C1011 620 1005 641 997 660 C965 746 908 813 830 852 C759 888 676 901 596 884 C508 866 431 818 383 747 C350 698 330 650 315 600Z" fill="url(#highlight)"/>
                  <path d="M364 658 C372 701 392 749 423 786" stroke="#F2FFF0" strokeWidth="34" strokeLinecap="round" opacity="0.65"/>
                  <path d="M317 600 L1015 600" stroke="#D5F6D7" strokeWidth="7" opacity="0.8"/>
                  <path d="M458 912 C536 954 630 967 721 960 C808 953 885 924 947 877" stroke="#8CE19A" strokeWidth="9" strokeLinecap="round" opacity="0.45" fill="none"/>
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">
                No saved meals yet
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed font-normal">
                Create custom recipes by combining ingredients and save them for quick logging.
              </p>
              <button
                onClick={handleOpenCreateSheet}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Recipe</span>
              </button>
            </div>
          ) : filteredSavedMeals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No saved meals found matching &ldquo;<span className="font-semibold text-foreground">{filterQuery}</span>&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSavedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-card rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all group overflow-hidden"
                >
                  <div>
                    {/* MEAL COVER IMAGE IF AVAILABLE */}
                    {meal.imageUrl ? (
                      <div className="relative w-full h-36 bg-muted/40 overflow-hidden">
                        <img
                          src={meal.imageUrl}
                          alt={meal.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/30" />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          <button
                            onClick={() => handleOpenEditSheet(meal)}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-colors"
                            title="Edit Recipe"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSavedMeal(meal.id)}
                            className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md border border-red-500/30 transition-colors"
                            title="Delete Recipe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="p-5">
                      {/* Meal Title & Actions (if no image, show actions here) */}
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
                        {!meal.imageUrl && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditSheet(meal)}
                              className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 text-foreground border border-border transition-colors"
                              title="Edit Recipe"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSavedMeal(meal.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors"
                              title="Delete Recipe"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Total Calorie Banner */}
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/70 my-3 flex items-center justify-between font-mono">
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
                        <div className="p-2 rounded-xl border" style={{ backgroundColor: `${MACRO_COLORS.protein}15`, borderColor: `${MACRO_COLORS.protein}35` }}>
                          <div className="text-[9px] font-sans font-bold" style={{ color: MACRO_COLORS.protein }}>PRO</div>
                          <div className="font-bold text-foreground">{Math.round(meal.totalProtein)}g</div>
                        </div>
                        <div className="p-2 rounded-xl border" style={{ backgroundColor: `${MACRO_COLORS.carbs}15`, borderColor: `${MACRO_COLORS.carbs}35` }}>
                          <div className="text-[9px] font-sans font-bold" style={{ color: MACRO_COLORS.carbs }}>CARB</div>
                          <div className="font-bold text-foreground">{Math.round(meal.totalCarbs)}g</div>
                        </div>
                        <div className="p-2 rounded-xl border" style={{ backgroundColor: `${MACRO_COLORS.fat}15`, borderColor: `${MACRO_COLORS.fat}35` }}>
                          <div className="text-[9px] font-sans font-bold" style={{ color: MACRO_COLORS.fat }}>FAT</div>
                          <div className="font-bold text-foreground">{Math.round(meal.totalFat)}g</div>
                        </div>
                        <div className="p-2 rounded-xl border" style={{ backgroundColor: `${MACRO_COLORS.fiber}15`, borderColor: `${MACRO_COLORS.fiber}35` }}>
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
                            className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-muted/40 border border-border/60 text-foreground"
                          >
                            <span className="truncate">{item.food?.name || 'Ingredient'}</span>
                            <span className="font-mono text-muted-foreground text-[11px]">
                              {item.weightGrams}g
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* One-click Log Button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => setLogMealTarget(meal)}
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 border border-primary/20"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Log to Daily Tracker</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT SAVED MEAL SIDE PANEL SHEET */}
      <SaveMealSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        editingMeal={editingMeal}
        onMealSaved={handleMealSaved}
      />

      {/* QUICK LOG MODAL */}
      {logMealTarget && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm text-center space-y-4 bg-card border border-border p-5 rounded-2xl shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <Utensils className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-base text-foreground">Log &ldquo;{logMealTarget.name}&rdquo;</h3>
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
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl text-foreground text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-semibold">Meal Category</label>
                <select
                  value={logMealType}
                  onChange={(e: any) => setLogMealType(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl text-foreground text-xs"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snacks & Extras</option>
                </select>
              </div>
            </div>

            {loggingSuccess ? (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Logged to Daily Tracker!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setLogMealTarget(null)}
                  className="w-1/2 py-2 rounded-xl bg-muted border border-border text-muted-foreground text-xs font-semibold hover:bg-muted/80 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogToTracker}
                  className="w-1/2 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm"
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
