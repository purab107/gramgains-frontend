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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Loader2, 
  Utensils, 
  Flame, 
  UploadCloud, 
  ImageIcon, 
  Check, 
  Sparkles,
  Info,
  Scale
} from 'lucide-react';
import { MACRO_COLORS } from '@/lib/constants';
import { getFoodIcon } from '@/lib/food-utils';
import { QuantitySelector, ServingSelection } from './QuantitySelector';

export interface SaveMealSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMeal?: SavedMeal | null;
  onMealSaved: (savedMeal: SavedMeal) => void;
}

type SearchTab = 'all' | 'raw' | 'recipes' | 'high-protein';

interface RecipeIngredient {
  food: FoodItem;
  weightGrams: number;
  displayQuantity?: number | null;
  displayUnit?: string;
  selectedServingId?: string;
}

export function SaveMealSheet({
  open,
  onOpenChange,
  editingMeal,
  onMealSaved,
}: SaveMealSheetProps) {
  // Form fields
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);
  const [recipeItems, setRecipeItems] = useState<RecipeIngredient[]>([]);

  // Image Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search Engine state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedServingFood, setSelectedServingFood] = useState<FoodItem | null>(null);
  const [pendingServingSelection, setPendingServingSelection] = useState<ServingSelection | null>(null);

  // Submitting state
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search Caching & AbortController
  const searchCacheRef = useRef<Record<string, FoodItem[]>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset form when sheet opens or editingMeal changes
  useEffect(() => {
    if (open) {
      if (editingMeal) {
        setMealName(editingMeal.name || '');
        setMealDescription(editingMeal.description || '');
        setImageUrl(editingMeal.imageUrl || null);
        setImagePublicId(editingMeal.imagePublicId || null);
        setRecipeItems(
          editingMeal.items?.map((item) => ({
            food: item.food || {
              id: item.foodId,
              name: 'Food Ingredient',
              aliases: [],
              category: 'General',
              servingUnit: item.displayUnit || item.unitLabel || 'g',
              servingWeight: item.weightGrams,
              calories: item.calories || 0,
              protein: item.protein || 0,
              carbohydrates: item.carbs || 0,
              fat: item.fat || 0,
              fiber: item.fiber || 0,
              source: 'Saved',
              layer: 1,
            },
            weightGrams: item.weightGrams,
            displayQuantity: item.displayQuantity,
            displayUnit: item.displayUnit || item.unitLabel || 'g',
          })) || []
        );
      } else {
        setMealName('');
        setMealDescription('');
        setImageUrl(null);
        setImagePublicId(null);
        setRecipeItems([]);
      }
      setSearchQuery('');
      setSearchResults([]);
      setSelectedServingFood(null);
      setPendingServingSelection(null);
      setImageUploadError(null);
      setErrorMessage(null);
    }
  }, [open, editingMeal]);

  // Search engine execution with debouncing & layer filtering
  const performSearch = async (query: string, tab: SearchTab) => {
    const trimmed = query.trim();
    const cacheKey = `${tab}:${trimmed.toLowerCase()}`;

    if (searchCacheRef.current[cacheKey]) {
      setSearchResults(searchCacheRef.current[cacheKey]);
      setLoadingSearch(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoadingSearch(true);
      let layerParam: number | undefined = undefined;
      if (tab === 'raw') layerParam = 1;
      if (tab === 'recipes') layerParam = 2;

      const results = await ApiService.searchFoods(trimmed, layerParam);
      let filtered = results || [];

      if (tab === 'high-protein') {
        filtered = filtered.filter((item) => (item.protein || 0) >= 12);
      }

      if (!trimmed) {
        filtered.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      }

      const topResults = filtered.slice(0, 30);
      searchCacheRef.current[cacheKey] = topResults;
      setSearchResults(topResults);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Food search failed:', err);
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery, activeTab);
    }, searchQuery ? 250 : 0);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, activeTab, open]);

  // Cloudinary image upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setImageUploadError(null);
    setUploadingImage(true);

    try {
      const result = await ApiService.uploadImage(file);
      setImageUrl(result.url);
      setImagePublicId(result.publicId);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setImageUploadError(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImagePublicId(null);
    setImageUploadError(null);
  };

  // Recipe item operations
  const handleAddIngredient = (food: FoodItem, selection?: ServingSelection | null) => {
    const defaultServing = food.servings?.find((s) => s.isDefault) || food.servings?.[0];
    const weightGrams = selection ? selection.resolvedWeightGrams : (food.servingWeight || 100);
    const displayQuantity = selection
      ? selection.displayQuantity
      : (defaultServing?.displayQuantity ?? (defaultServing?.unitType === 'WEIGHT' ? (food.servingWeight || 100) : 1));
    const displayUnit = selection ? selection.displayUnit : (defaultServing?.unitLabel || food.servingUnit || 'g');
    const selectedServingId = selection ? selection.selectedServing.id : defaultServing?.id;

    setRecipeItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.food.id === food.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].weightGrams += weightGrams;
        if (updated[existingIdx].displayQuantity !== null && updated[existingIdx].displayQuantity !== undefined) {
          updated[existingIdx].displayQuantity = (updated[existingIdx].displayQuantity || 0) + (displayQuantity || 0);
        }
        return updated;
      }
      return [
        ...prev,
        {
          food,
          weightGrams,
          displayQuantity,
          displayUnit,
          selectedServingId,
        },
      ];
    });
    setSelectedServingFood(null);
    setPendingServingSelection(null);
  };

  const handleUpdateItemQuantity = (index: number, delta: number) => {
    setRecipeItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const currentQty = item.displayQuantity !== null && item.displayQuantity !== undefined && item.displayQuantity > 0
        ? item.displayQuantity
        : item.weightGrams;
      const step = item.displayUnit === 'g' ? (currentQty >= 100 ? 50 : 25) : 1;
      const newQty = Math.max(step >= 1 ? 1 : 0.1, Math.round((currentQty + delta * step) * 10) / 10);

      // Scale weight proportionally
      const ratio = newQty / currentQty;
      const newWeight = Math.max(1, Math.round(item.weightGrams * ratio));

      updated[index] = {
        ...item,
        displayQuantity: newQty,
        weightGrams: newWeight,
      };
      return updated;
    });
  };

  const handleDirectItemWeightChange = (index: number, newWeight: number) => {
    if (newWeight <= 0) return;
    setRecipeItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], weightGrams: Math.round(newWeight) };
      return updated;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setRecipeItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate live totals for the recipe
  const liveTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;
    let totalWeight = 0;

    for (const item of recipeItems) {
      const ratio = (item.weightGrams || 100) / 100;
      calories += (item.food.calories || 0) * ratio;
      protein += (item.food.protein || 0) * ratio;
      carbs += (item.food.carbohydrates || 0) * ratio;
      fat += (item.food.fat || 0) * ratio;
      fiber += (item.food.fiber || 0) * ratio;
      totalWeight += item.weightGrams;
    }

    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
      totalWeight: Math.round(totalWeight),
    };
  }, [recipeItems]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) {
      setErrorMessage('Please enter a recipe name.');
      return;
    }
    if (recipeItems.length === 0) {
      setErrorMessage('Please add at least one ingredient to the recipe.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      name: mealName.trim(),
      description: mealDescription.trim() || undefined,
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
      items: recipeItems.map((item) => ({
        foodId: item.food.id,
        weightGrams: item.weightGrams,
        displayQuantity: item.displayQuantity ?? (item.displayUnit === 'g' || !item.displayUnit ? item.weightGrams : null),
        displayUnit: item.displayUnit || item.food.servingUnit || 'g',
        unitLabel: item.displayUnit || item.food.servingUnit || 'g',
      })),
    };

    try {
      let savedResult: SavedMeal;
      if (editingMeal) {
        savedResult = await ApiService.updateSavedMeal(editingMeal.id, payload);
      } else {
        savedResult = await ApiService.createSavedMeal(payload);
      }
      onMealSaved(savedResult);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to save recipe:', err);
      setErrorMessage(err?.message || 'Failed to save recipe. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] sm:max-w-[540px] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/80 shadow-2xl h-full"
      >
        {/* HEADER */}
        <SheetHeader className="px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                {editingMeal ? 'Edit Saved Recipe' : 'Create Saved Recipe'}
                {editingMeal && (
                  <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                    Editing
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Build high-protein combos and custom meals with accurate macro tracking.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button type="button" onClick={() => setErrorMessage(null)} className="text-destructive/70 hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* MEAL BASICS: NAME & DESCRIPTION */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
                Recipe / Meal Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Muscle Oats & Peanut Butter Bowl"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="bg-card border-border/70 text-foreground text-sm font-medium focus-visible:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
                Description / Notes <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Cook with 200ml milk, top with honey & seeds"
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                className="bg-card border-border/70 text-foreground text-xs focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* IMAGE UPLOAD WITH CLOUDINARY */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-foreground/80">
              Meal Cover Image <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {imageUrl ? (
              <div className="relative group rounded-2xl overflow-hidden border border-border/80 bg-card shadow-sm">
                <img
                  src={imageUrl}
                  alt={mealName || 'Recipe Preview'}
                  className="w-full h-44 object-cover object-center transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex items-end justify-between p-3">
                  <span className="text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    Uploaded via Cloudinary
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-md"
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveImage}
                      className="h-8 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadingImage && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  uploadingImage
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-card/40'
                }`}
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center justify-center py-3 space-y-2">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <span className="text-xs font-semibold text-primary">Uploading to Cloudinary...</span>
                    <span className="text-[10px] text-muted-foreground">Optimizing image size & quality</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Click to upload meal photo
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Supports JPEG, PNG, WEBP (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {imageUploadError && (
              <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                <Info className="w-3.5 h-3.5" /> {imageUploadError}
              </p>
            )}
          </div>

          {/* FOOD SEARCH ENGINE */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Search & Add Ingredients
              </label>
              <span className="text-[11px] font-mono text-muted-foreground">
                {recipeItems.length} ingredient{recipeItems.length === 1 ? '' : 's'} added
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search raw foods, brand items, recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-card border-border/70 text-xs h-10 rounded-xl focus-visible:ring-primary/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: 'all', label: 'All Foods' },
                  { id: 'raw', label: 'Raw Ingredients' },
                  { id: 'recipes', label: 'Dishes' },
                  { id: 'high-protein', label: 'High-Protein (≥12g)' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                      : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Results List */}
            {loadingSearch ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-xs">Searching food database...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-56 overflow-y-auto space-y-1.5 p-1 rounded-xl bg-muted/20 border border-border/50">
                {searchResults.map((food) => {
                  const FoodIcon = getFoodIcon(food);
                  const isAlreadyAdded = recipeItems.some((item) => item.food.id === food.id);
                  const isSelectedForServing = selectedServingFood?.id === food.id;

                  return (
                    <div
                      key={food.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isSelectedForServing
                          ? 'bg-primary/10 border-primary/30 shadow-sm'
                          : 'bg-card border-border/60 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (isSelectedForServing) {
                              setSelectedServingFood(null);
                              setPendingServingSelection(null);
                            } else {
                              setSelectedServingFood(food);
                              setPendingServingSelection(null);
                            }
                          }}
                        >
                          <div className="p-1.5 rounded-lg bg-muted text-muted-foreground shrink-0">
                            <FoodIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {food.name}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span className="font-mono text-primary font-bold">
                                {food.calories} kcal
                              </span>
                              <span>•</span>
                              <span>P: {food.protein}g</span>
                              <span>•</span>
                              <span>C: {food.carbohydrates}g</span>
                              <span>•</span>
                              <span>F: {food.fat}g</span>
                              <span className="text-[9px] text-muted-foreground/70 font-mono">
                                (per {food.servingWeight || 100}g)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isAlreadyAdded && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20">
                              Added
                            </Badge>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant={isSelectedForServing ? 'default' : 'outline'}
                            onClick={() => {
                              if (isSelectedForServing) {
                                handleAddIngredient(food, pendingServingSelection);
                              } else {
                                handleAddIngredient(food, null);
                              }
                            }}
                            className="h-7 px-2.5 text-xs font-semibold rounded-lg"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>

                      {/* Serving Customizer Expand */}
                      {isSelectedForServing && (
                        <div className="mt-2.5 pt-2.5 border-t border-border/50 space-y-2 animate-in fade-in">
                          <QuantitySelector
                            food={food}
                            compact
                            onChange={setPendingServingSelection}
                          />
                          <div className="flex justify-end pt-1">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleAddIngredient(food, pendingServingSelection)}
                              className="h-7 text-xs px-3 font-semibold"
                            >
                              Add {pendingServingSelection ? `${pendingServingSelection.displayQuantity} ${pendingServingSelection.displayUnit}` : 'Ingredient'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : searchQuery ? (
              <div className="py-6 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-border/40">
                No food items match &ldquo;{searchQuery}&rdquo;. Try another ingredient name.
              </div>
            ) : null}
          </div>

          {/* SELECTED RECIPE INGREDIENTS */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-primary" />
                Recipe Ingredients ({recipeItems.length})
              </label>
              {recipeItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRecipeItems([])}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {recipeItems.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border/70 text-center bg-card/40 space-y-1.5">
                <Utensils className="w-6 h-6 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-semibold text-foreground/80">No ingredients added yet</p>
                <p className="text-[11px] text-muted-foreground">
                  Search above and click &ldquo;+ Add&rdquo; to include items in this recipe.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recipeItems.map((item, index) => {
                  const FoodIcon = getFoodIcon(item.food);
                  const ratio = (item.weightGrams || 100) / 100;
                  const itemCalories = Math.round((item.food.calories || 0) * ratio);
                  const itemProtein = Math.round((item.food.protein || 0) * ratio * 10) / 10;
                  const itemCarbs = Math.round((item.food.carbohydrates || 0) * ratio * 10) / 10;
                  const itemFat = Math.round((item.food.fat || 0) * ratio * 10) / 10;
                  const displayQty = item.displayQuantity ?? (item.displayUnit === 'g' || !item.displayUnit ? item.weightGrams : 1);
                  const displayUnit = item.displayUnit || item.food.servingUnit || 'g';

                  return (
                    <div
                      key={`${item.food.id}-${index}`}
                      className="p-3 rounded-xl bg-card border border-border/70 shadow-sm flex flex-col gap-2 transition-all hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                            <FoodIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {item.food.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {item.food.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-primary">
                            {itemCalories} kcal
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quantity Control & Macro Breakdown */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                          <span className="text-purple-400 font-mono">P: {itemProtein}g</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-mono">C: {itemCarbs}g</span>
                          <span>•</span>
                          <span className="text-amber-400 font-mono">F: {itemFat}g</span>
                          {displayUnit !== 'g' && (
                            <>
                              <span>•</span>
                              <span className="text-muted-foreground font-mono">({item.weightGrams}g)</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(index, -1)}
                            className="w-6 h-6 rounded-md bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center text-xs font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <div className="flex items-center gap-1 font-mono">
                            <span className="px-1 text-center font-bold text-xs text-foreground min-w-[2.5rem]">
                              {displayQty} {displayUnit}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(index, 1)}
                            className="w-6 h-6 rounded-md bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center text-xs font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* STICKY LIVE TOTALS & ACTION FOOTER */}
        <div className="p-4 border-t border-border/80 bg-card/90 backdrop-blur-md space-y-3 shrink-0">
          {/* Live Macro Summary Card */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> Total Nutrition
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {liveTotals.totalWeight}g total
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-background/80 border border-border/40">
                <p className="text-[9px] font-medium text-muted-foreground uppercase">Calories</p>
                <p className="text-sm font-extrabold font-mono text-primary mt-0.5">
                  {liveTotals.calories}
                </p>
              </div>

              <div className="p-2 rounded-xl bg-background/80 border border-border/40">
                <p className="text-[9px] font-medium text-purple-400 uppercase">Protein</p>
                <p className="text-sm font-extrabold font-mono text-purple-400 mt-0.5">
                  {liveTotals.protein}g
                </p>
              </div>

              <div className="p-2 rounded-xl bg-background/80 border border-border/40">
                <p className="text-[9px] font-medium text-cyan-400 uppercase">Carbs</p>
                <p className="text-sm font-extrabold font-mono text-cyan-400 mt-0.5">
                  {liveTotals.carbs}g
                </p>
              </div>

              <div className="p-2 rounded-xl bg-background/80 border border-border/40">
                <p className="text-[9px] font-medium text-amber-400 uppercase">Fat</p>
                <p className="text-sm font-extrabold font-mono text-amber-400 mt-0.5">
                  {liveTotals.fat}g
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="text-xs h-9 px-4 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !mealName.trim() || recipeItems.length === 0}
              className="text-xs h-9 px-5 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  {editingMeal ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  {editingMeal ? 'Update Recipe' : 'Save Recipe'}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
