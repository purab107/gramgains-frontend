'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FoodItem, FoodServing } from '@/services/api';
import { Minus, Plus, Scale, Info, AlertTriangle } from 'lucide-react';
import { MACRO_COLORS } from '@/lib/constants';
import {
  NormalizedServing,
  FoodItemInput,
  resolveDefaultServing,
  stepQuantity,
  getUnitFloor,
  convertUnitPreservingMass,
  calculatePhysicalMass,
  calculateNutrientsFromMass,
  resolveDensity,
  METRIC_CUP_ML,
  TABLESPOON_ML,
  TEASPOON_ML,
  FLUID_OUNCE_ML,
} from '@/lib/portion-calculator';

// ─────────────────────────────────────────────────────────────────────────────
// Public API types
// ─────────────────────────────────────────────────────────────────────────────

export interface ServingSelection {
  selectedServing: FoodServing;
  displayQuantity: number;
  displayUnit: string;
  resolvedWeightGrams: number;
  /** true when serving is a quarantined / PER_100ML_UNVERIFIED item */
  isNutritionApproximate: boolean;
  /** Engine-normalised serving with full density metadata */
  normalizedServing: NormalizedServing;
}

export interface QuantitySelectorProps {
  food: FoodItem;
  initialServingId?: string;
  initialQuantity?: number;
  onChange: (selection: ServingSelection) => void;
  className?: string;
  compact?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapters: api.ts shapes → portion-calculator.ts shapes
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the standard volume (ml) for a unit label string */
function unitVolumeInMl(unitLabel: string): number | undefined {
  const u = unitLabel.toLowerCase();
  if (u === 'ml') return 1;
  if (u === 'l' || u === 'liter' || u === 'litre') return 1000;
  if (u === 'fl oz' || u === 'floz' || u === 'oz fl') return FLUID_OUNCE_ML;
  if (u === 'cup' || u === 'cups') return METRIC_CUP_ML;
  if (u === 'tbsp' || u === 'tablespoon' || u === 'tablespoons') return TABLESPOON_ML;
  if (u === 'tsp' || u === 'teaspoon' || u === 'teaspoons') return TEASPOON_ML;
  if (u === 'glass' || u === 'glasses') return 250;
  return undefined;
}

/** Derive NormalizedServing from a FoodServing (api.ts) + parent food context */
function adaptServing(serving: FoodServing, food: FoodItem, index: number): NormalizedServing {
  const unitType = serving.unitType ?? (serving.unitLabel?.toLowerCase() === 'g' ? 'WEIGHT' : 'HOUSEHOLD');
  const rawLabel = serving.unitLabel || 'g';
  const qty = typeof serving.displayQuantity === 'number' && serving.displayQuantity > 0
    ? serving.displayQuantity
    : (unitType === 'WEIGHT' ? serving.weightGrams : 1);

  // Determine volume in ml for VOLUME servings
  const volInMl = unitType === 'VOLUME' ? unitVolumeInMl(rawLabel) : undefined;

  // Guess display label for pills (e.g. "200 ml Milk" → "200 ml")
  const displayLabel = `${qty} ${rawLabel}`;
  const cleanUnitName = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  // Integer-only: egg, biscuit, piece, tablet, etc.
  const isIntegerOnly = unitType === 'COUNT' && /\b(egg|eggs|biscuit|tablet|capsule|piece|pieces)\b/i.test(rawLabel);

  return {
    id: serving.id,
    originalLabel: rawLabel,
    cleanUnitName,
    displayLabel,
    capsuleUnitSuffix: rawLabel,
    unitType,
    baseQuantity: qty,
    referenceWeightGrams: serving.weightGrams,
    unitVolumeInMl: volInMl,
    densityGPerMl: undefined, // Will be resolved from resolveDensity()
    isDefault: serving.isDefault,
    isIntegerOnly,
    isSynthetic: false,
  };
}

/** Adapt a FoodItem (api.ts) to FoodItemInput (portion-calculator.ts) */
function adaptFood(food: FoodItem): FoodItemInput {
  const adaptedServings: NormalizedServing[] = [];

  if (food.servings && food.servings.length > 0) {
    food.servings.forEach((s, i) => adaptedServings.push(adaptServing(s, food, i)));
  } else {
    // Synthetic fallback serving
    adaptedServings.push({
      id: 'synthetic-100g',
      originalLabel: 'g',
      cleanUnitName: 'Grams',
      displayLabel: 'Grams (100g)',
      capsuleUnitSuffix: 'g',
      unitType: 'WEIGHT',
      baseQuantity: 100,
      referenceWeightGrams: 100,
      isDefault: true,
      isSynthetic: true,
    });
  }

  return {
    id: food.id,
    name: food.name,
    category: food.category,
    tags: undefined,
    calories: food.calories,
    protein: food.protein,
    carbohydrates: food.carbohydrates,
    fat: food.fat,
    fiber: food.fiber ?? 0,
    nutritionBasis: undefined,
    isNutritionApproximate: false,
    isQuarantined: false,
    servings: adaptedServings,
  };
}

/** Back-reference original FoodServing by NormalizedServing.id */
function findOriginalServing(food: FoodItem, normalizedId: string): FoodServing | null {
  return food.servings?.find((s) => s.id === normalizedId) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDisplayQty(qty: number, serving: NormalizedServing): string {
  const u = serving.capsuleUnitSuffix.toLowerCase();
  if (serving.unitType === 'WEIGHT' && u !== 'kg') {
    // grams: integer or 1dp
    return Number.isInteger(qty) ? String(qty) : qty.toFixed(1);
  }
  if (serving.unitType === 'VOLUME' && u === 'ml') {
    return String(Math.round(qty));
  }
  // katori, cup, roti, etc.: 2dp
  return qty.toFixed(2);
}

/** Pill label for unit switcher row */
function getServingPillLabel(serving: NormalizedServing): string {
  if (serving.isSynthetic) return 'Grams';
  const u = serving.cleanUnitName;
  // For WEIGHT/VOLUME servings show just the unit
  if (serving.unitType === 'WEIGHT' || serving.unitType === 'VOLUME') return u;
  // For COUNT/HOUSEHOLD show unit name without base quantity
  return u;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  food,
  initialServingId,
  initialQuantity,
  onChange,
  className = '',
  compact = false,
}) => {
  // ── Adapt food once food.id changes ──────────────────────────────────────
  const adaptedFood = useMemo(() => adaptFood(food), [food]);
  const adaptedServings = adaptedFood.servings ?? [];

  // ── Canonical state: (canonicalWeightGrams, displayQuantity, selectedServing)
  const [selectedServing, setSelectedServing] = useState<NormalizedServing>(() =>
    resolveDefaultServing(adaptedFood, initialServingId)
  );
  const [canonicalWeightGrams, setCanonicalWeightGrams] = useState<number>(() => {
    const s = resolveDefaultServing(adaptedFood, initialServingId);
    if (initialQuantity !== undefined && initialQuantity > 0) {
      return calculatePhysicalMass(initialQuantity, s);
    }
    return calculatePhysicalMass(s.baseQuantity, s);
  });
  const [displayQuantity, setDisplayQuantity] = useState<number>(() => {
    const s = resolveDefaultServing(adaptedFood, initialServingId);
    return initialQuantity !== undefined && initialQuantity > 0
      ? initialQuantity
      : s.baseQuantity;
  });

  // Input ref for autofocus-select behaviour
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Sync inputValue with displayQuantity when not focused
  useEffect(() => {
    if (!isInputFocused) {
      setInputValue(formatDisplayQty(displayQuantity, selectedServing));
    }
  }, [displayQuantity, selectedServing, isInputFocused]);

  // ── Reset when food.id changes ───────────────────────────────────────────
  useEffect(() => {
    const newAdapted = adaptFood(food);
    const defServing = resolveDefaultServing(newAdapted, initialServingId);
    const defMass = calculatePhysicalMass(defServing.baseQuantity, defServing);
    setSelectedServing(defServing);
    setCanonicalWeightGrams(defMass);
    setDisplayQuantity(defServing.baseQuantity);
  }, [food.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resolve density for the currently selected serving ───────────────────
  const densityInfo = useMemo(() => {
    if (selectedServing.unitType !== 'VOLUME') return null;
    return resolveDensity(food.name, selectedServing, adaptedFood.tags);
  }, [food.name, selectedServing, adaptedFood.tags]);

  // Enrich selected serving with resolved density
  const enrichedServing = useMemo<NormalizedServing>(() => {
    if (!densityInfo || densityInfo.density === null) return selectedServing;
    return {
      ...selectedServing,
      densityGPerMl: densityInfo.density,
      densitySource: densityInfo.densitySource,
      isApproximatelyVerified: densityInfo.isApproximatelyVerified,
    };
  }, [selectedServing, densityInfo]);

  // ── Stepper logic ─────────────────────────────────────────────────────────
  const floor = useMemo(() => getUnitFloor(enrichedServing), [enrichedServing]);
  const isMinusDisabled = displayQuantity <= floor;

  const handleStep = useCallback((direction: 1 | -1) => {
    const nextDisplay = stepQuantity(displayQuantity, direction, enrichedServing);
    const nextMass = calculatePhysicalMass(nextDisplay, enrichedServing);
    setDisplayQuantity(nextDisplay);
    setCanonicalWeightGrams(nextMass);
  }, [displayQuantity, enrichedServing]);

  // ── Direct text input ─────────────────────────────────────────────────────
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsInputFocused(true);
    e.target.select();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) {
      // Revert to last valid display quantity
      setInputValue(formatDisplayQty(displayQuantity, enrichedServing));
      return;
    }
    // User committed a new quantity: re-anchor canonical mass
    const newMass = calculatePhysicalMass(val, enrichedServing);
    setDisplayQuantity(val);
    setCanonicalWeightGrams(newMass);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  // ── Unit pill switching ───────────────────────────────────────────────────
  const handleSelectServing = useCallback((targetServing: NormalizedServing) => {
    // Enrich target with resolved density if it's a VOLUME serving
    const targetDensityInfo = targetServing.unitType === 'VOLUME'
      ? resolveDensity(food.name, targetServing, adaptedFood.tags)
      : null;
    const enrichedTarget: NormalizedServing = targetDensityInfo && targetDensityInfo.density !== null
      ? {
          ...targetServing,
          densityGPerMl: targetDensityInfo.density,
          densitySource: targetDensityInfo.densitySource,
          isApproximatelyVerified: targetDensityInfo.isApproximatelyVerified,
        }
      : targetServing;

    // Freeze canonical mass, update display quantity only
    const { displayQuantity: newDisplay } = convertUnitPreservingMass(
      canonicalWeightGrams,
      enrichedTarget
    );
    setSelectedServing(enrichedTarget);
    setDisplayQuantity(newDisplay);
    // canonicalWeightGrams stays frozen — no mutation!
  }, [food.name, adaptedFood.tags, canonicalWeightGrams]);

  // ── Nutrient calculation ──────────────────────────────────────────────────
  const nutrients = useMemo(
    () => calculateNutrientsFromMass(adaptedFood, canonicalWeightGrams),
    [adaptedFood, canonicalWeightGrams]
  );

  // ── Notify parent (onChange) ──────────────────────────────────────────────
  useEffect(() => {
    // Find back-reference to original FoodServing
    const originalServing = findOriginalServing(food, selectedServing.id);
    // Synthesize a FoodServing-compatible object if original not found
    const servingForParent: FoodServing = originalServing ?? {
      id: selectedServing.id,
      foodId: food.id,
      unitLabel: selectedServing.capsuleUnitSuffix,
      unitType: selectedServing.unitType,
      displayQuantity,
      weightGrams: selectedServing.referenceWeightGrams,
      isDefault: selectedServing.isDefault,
    };

    onChange({
      selectedServing: servingForParent,
      displayQuantity,
      displayUnit: selectedServing.capsuleUnitSuffix,
      resolvedWeightGrams: Math.round(canonicalWeightGrams * 10) / 10,
      isNutritionApproximate: nutrients.isApproximate,
      normalizedServing: enrichedServing,
    });
  }, [displayQuantity, canonicalWeightGrams, selectedServing, enrichedServing, nutrients.isApproximate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Density badge logic ───────────────────────────────────────────────────
  const showApproxBadge = adaptedFood.isNutritionApproximate || adaptedFood.isQuarantined;
  const showLevel3Pill =
    !showApproxBadge &&
    densityInfo?.densitySource === 'LEVEL_3' &&
    selectedServing.unitType === 'VOLUME';

  // ── Pill label helper ─────────────────────────────────────────────────────
  const getActiveLabel = () =>
    `${formatDisplayQty(displayQuantity, enrichedServing)} ${enrichedServing.capsuleUnitSuffix}`;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-3 ${className}`}>

      {/* ══════════════════════════════════════════════════
          HERO CAPSULE: [ — ] [ qty unit ] [ + ]
          ══════════════════════════════════════════════════ */}
      <div className="bg-foreground/[0.04] dark:bg-background/60 border border-border rounded-2xl overflow-hidden shadow-xs">

        {/* Top Row: Stepper */}
        <div className="flex items-center gap-0 h-14">

          {/* — Button */}
          <button
            type="button"
            disabled={isMinusDisabled}
            onClick={() => handleStep(-1)}
            className={`w-14 h-full flex items-center justify-center transition-all shrink-0
              ${isMinusDisabled
                ? 'text-muted-foreground/30 cursor-not-allowed'
                : 'text-foreground hover:bg-muted active:scale-90 active:bg-muted/80'
              }`}
            aria-label="Decrease quantity"
          >
            <Minus size={18} strokeWidth={2.5} />
          </button>

          {/* Centre: Input + Unit label */}
          <div className="flex-1 flex flex-col items-center justify-center h-full border-x border-border/40 px-2">
            <div className="flex items-baseline gap-1.5">
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                value={isInputFocused ? inputValue : formatDisplayQty(displayQuantity, enrichedServing)}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="w-20 text-center text-2xl font-black font-mono text-foreground bg-transparent outline-none focus:bg-muted/40 rounded-lg transition-colors leading-none"
                aria-label="Quantity"
              />
              <span className="text-sm font-bold text-muted-foreground font-mono leading-none pb-0.5">
                {enrichedServing.capsuleUnitSuffix}
              </span>
            </div>
          </div>

          {/* + Button */}
          <button
            type="button"
            onClick={() => handleStep(1)}
            className="w-14 h-full flex items-center justify-center text-foreground hover:bg-muted active:scale-90 active:bg-muted/80 transition-all shrink-0"
            aria-label="Increase quantity"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Bottom Row: Mass readout + live macros */}
        <div className="border-t border-border/40 px-3.5 py-2 flex items-center justify-between gap-2 bg-muted/30">
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs shrink-0">
            <Scale size={12} className="text-primary shrink-0" />
            <span>
              ≈ <strong className="text-foreground font-bold">{Math.round(canonicalWeightGrams * 10) / 10}g</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto scrollbar-none">
            <span className="font-bold text-foreground whitespace-nowrap">
              {nutrients.calories} <span className="text-[10px] text-muted-foreground font-normal">kcal</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold whitespace-nowrap" style={{ color: MACRO_COLORS.protein }}>
              {nutrients.protein}g P
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold whitespace-nowrap" style={{ color: MACRO_COLORS.carbs }}>
              {nutrients.carbohydrates}g C
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold whitespace-nowrap" style={{ color: MACRO_COLORS.fat }}>
              {nutrients.fat}g F
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          DENSITY / QUALITY BADGES
          ══════════════════════════════════════════════════ */}
      {showApproxBadge && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <span>
            <strong>Approximate Nutrition:</strong> Packaged per 100 ml. Density unverified; values may vary from scale weight.
          </span>
        </div>
      )}
      {showLevel3Pill && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/8 border border-blue-500/15 text-blue-600 dark:text-blue-400 text-[11px] font-medium w-fit">
          <Info size={11} className="shrink-0" />
          <span>Category Density ~{densityInfo!.density?.toFixed(2)} g/ml</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          UNIT PILLS (bottom row)
          ══════════════════════════════════════════════════ */}
      {adaptedServings.length > 1 && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
            Unit
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {adaptedServings.map((serving) => {
              const isSelected = selectedServing.id === serving.id;
              const pillLabel = getServingPillLabel(serving);
              const refWeightLabel = serving.unitType !== 'WEIGHT'
                ? `${Math.round(serving.referenceWeightGrams / serving.baseQuantity)}g`
                : null;

              return (
                <button
                  key={serving.id}
                  type="button"
                  onClick={() => handleSelectServing(serving)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]'
                      : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span>{pillLabel}</span>
                  {refWeightLabel && (
                    <span
                      className={`text-[10px] font-mono opacity-75 ${
                        isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      ({refWeightLabel})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
