/**
 * portion-calculator.ts
 *
 * Standalone Canonical Conversion & Stepper Engine for GramGains.
 * Governed by Document Version 3.4.0.
 *
 * Core Invariants:
 * 1. Physical mass in grams (gravimetric) is the canonical input for all macro calculations.
 * 2. Epsilon-safe directional snapping for stepper controls heading in the pressed direction (Q + ε or Q - ε).
 * 3. Generalized Level 1 density calculation for liquids and bulk-density granular solids.
 * 4. Drift-free canonical mass anchoring during unit switching.
 * 5. Distinct per-unit floors.
 */

export type UnitType = 'WEIGHT' | 'VOLUME' | 'COUNT' | 'HOUSEHOLD';
export type NutritionBasis = 'PER_100G' | 'PER_100ML_UNVERIFIED';
export type DensitySource = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | null;

export interface NormalizedServing {
  id: string;
  originalLabel: string;
  cleanUnitName: string;
  descriptor?: string;
  displayLabel: string;
  capsuleUnitSuffix: string;
  unitType: UnitType;
  baseQuantity: number;
  referenceWeightGrams: number;
  unitVolumeInMl?: number;
  densityGPerMl?: number;
  densitySource?: DensitySource;
  isApproximatelyVerified?: boolean;
  isDefault: boolean;
  isSynthetic?: boolean;
  isIntegerOnly?: boolean;
}

export interface FoodItemInput {
  id: string;
  name: string;
  category?: string;
  tags?: string[];
  calories: number; // Stored per 100g physical mass, unless nutritionBasis is PER_100ML_UNVERIFIED
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  nutritionBasis?: NutritionBasis;
  isNutritionApproximate?: boolean;
  isQuarantined?: boolean;
  servings?: NormalizedServing[];
}

export interface CalculatedNutrients {
  resolvedWeightGrams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  isApproximate: boolean;
}

export const METRIC_CUP_ML = 250;
export const TABLESPOON_ML = 15;
export const TEASPOON_ML = 5;
export const FLUID_OUNCE_ML = 29.5735;
export const EPSILON = 1e-6;

/**
 * Standard Curated Scientific Density Registry (Level 2)
 */
export const SCIENTIFIC_DENSITY_REGISTRY: Record<string, number> = {
  // Oils & Fats
  'mustard oil': 0.92,
  'sunflower oil': 0.92,
  'olive oil': 0.92,
  'vegetable oil': 0.92,
  'cooking oil': 0.92,
  'cow ghee': 0.91,
  'ghee': 0.91,
  // Syrups & Sweeteners
  'pure honey': 1.42,
  'honey': 1.42,
  // Dairy & Milks
  'whole cow milk': 1.03,
  'whole milk': 1.03,
  'cow milk': 1.03,
  'milk': 1.03,
  'skim milk': 1.035,
  'toned milk': 1.035,
  'buffalo milk': 1.032,
  // Water & Zero-Cal Infusions
  'water': 1.0,
  'black coffee': 1.0,
  'unsweetened black tea': 1.0,
  'diet soda': 1.0,
};

/**
 * Level 3: Verified Empirical Sub-Category Ranges (Strict curated tag match)
 * Smoothies & blended shakes are intentionally excluded (spread of 1.03-1.10 g/ml
 * cannot be safely assigned a single scalar, falling back to Level 4 scale grams).
 */
export const EMPIRICAL_CATEGORY_DENSITIES: Record<string, number> = {
  'citrus_juice_100': 1.048,
  'standard_curd': 1.05,
  'thin_buttermilk': 1.035,
};

/**
 * Resolve density following the strict 4-level precedence hierarchy:
 * 1. Verified DB serving measurement (mass / volume)
 * 2. Curated scientific registry match
 * 3. Verified empirical sub-category range (strict tag match)
 * 4. Fallback: null (suppress volume synthesis, require grams)
 */
export function resolveDensity(
  foodName: string,
  serving?: Partial<NormalizedServing> & { weightGrams?: number; displayQuantity?: number },
  tags?: string[]
): {
  density: number | null;
  level: 1 | 2 | 3 | 4;
  densitySource: DensitySource;
  isApproximatelyVerified: boolean;
} {
  // Level 1: Verified DB Measurement
  if (serving && serving.unitType === 'VOLUME') {
    const weight = serving.referenceWeightGrams ?? serving.weightGrams;
    const qty = serving.baseQuantity ?? serving.displayQuantity;
    const unitVol = serving.unitVolumeInMl;
    if (weight !== undefined && qty !== undefined && unitVol !== undefined) {
      const totalVolume = qty * unitVol;
      if (totalVolume > 0 && weight > 0) {
        const derived = Math.round((weight / totalVolume) * 1000) / 1000;
        return {
          density: derived,
          level: 1,
          densitySource: 'LEVEL_1',
          isApproximatelyVerified: false,
        };
      }
    }
  }

  // Level 2: Curated Scientific Registry
  const cleanName = foodName.toLowerCase().trim();
  for (const [key, val] of Object.entries(SCIENTIFIC_DENSITY_REGISTRY)) {
    if (cleanName === key || cleanName.includes(key)) {
      return {
        density: val,
        level: 2,
        densitySource: 'LEVEL_2',
        isApproximatelyVerified: false,
      };
    }
  }

  // Level 3: Verified Empirical Sub-Category Range (via explicit tags)
  if (tags && tags.length > 0) {
    for (const t of tags) {
      if (EMPIRICAL_CATEGORY_DENSITIES[t] !== undefined) {
        return {
          density: EMPIRICAL_CATEGORY_DENSITIES[t],
          level: 3,
          densitySource: 'LEVEL_3',
          isApproximatelyVerified: true, // Marked approximately verified for category averages
        };
      }
    }
  }

  // Level 4: Suppression
  return {
    density: null,
    level: 4,
    densitySource: null,
    isApproximatelyVerified: false,
  };
}

/**
 * Returns distinct per-unit floor to prevent 0.0 logs
 * Note: Household and fractional count stepper floor is 0.5; direct text input allows down to 0.1
 */
export function getUnitFloor(serving: NormalizedServing): number {
  if (serving.unitType === 'WEIGHT') {
    const unit = (serving.cleanUnitName || serving.capsuleUnitSuffix || '').toLowerCase();
    if (unit === 'kg') return 0.05;
    if (unit === '100g') return 0.5; // half-serving pill
    return 1.0; // scale grams (g)
  }

  if (serving.unitType === 'VOLUME') {
    const unit = (serving.cleanUnitName || serving.capsuleUnitSuffix || '').toLowerCase();
    if (unit === 'ml') return 1.0; // minimum 1ml
    if (unit === 'l' || unit === 'liter' || unit === 'litre') return 0.1; // 100ml
    if (unit === 'cup') return 0.5; // 1/2 cup (consistent delta=0.5, floor=0.5)
    if (unit === 'fl oz') return 0.5; // half ounce
    // tbsp, tsp, glass
    return 0.5;
  }

  if (serving.unitType === 'HOUSEHOLD') {
    return 0.5; // Stepper floor 0.5 katori/bowl; direct typed input allows down to 0.1
  }

  if (serving.unitType === 'COUNT') {
    return serving.isIntegerOnly ? 1.0 : 0.5;
  }

  return 0.5;
}

/**
 * Returns stepper delta based on current quantity band and unit
 */
export function getStepDelta(quantity: number, serving: NormalizedServing): number {
  if (serving.unitType === 'WEIGHT') {
    const unit = (serving.cleanUnitName || serving.capsuleUnitSuffix || '').toLowerCase();
    // 10/25/50 bands strictly apply when active unit is scale grams (g)
    if (unit === 'g' || unit === 'gram' || unit === 'grams') {
      if (quantity < 100) return 10;
      if (quantity < 250) return 25;
      return 50;
    }
    if (unit === 'kg') return 0.05; // 50g increments
    if (unit === '100g' || serving.baseQuantity === 100) return 0.5; // half serving multiplier
    return 1.0;
  }

  if (serving.unitType === 'VOLUME') {
    const unit = (serving.cleanUnitName || serving.capsuleUnitSuffix || '').toLowerCase();
    // 25/50 bands strictly apply when active unit is millilitres (ml)
    if (unit === 'ml') {
      return quantity < 100 ? 25 : 50;
    }
    if (unit === 'l' || unit === 'liter' || unit === 'litre') {
      return 0.1; // 100ml steps
    }
    if (unit === 'fl oz') {
      return 1.0;
    }
    // Volumetric culinary spoons or cups (tbsp, tsp, cup, glass)
    return 0.5;
  }

  // COUNT and HOUSEHOLD (katori, roti, bowl)
  if (serving.isIntegerOnly) return 1.0;
  return 0.5;
}

/**
 * Directional Epsilon-Safe Stepper Snapping
 *
 * Snaps irregular decimal quantities cleanly to the next interval of delta
 * in the direction pressed.
 */
export function stepQuantity(
  currentQuantity: number,
  direction: 1 | -1,
  serving: NormalizedServing
): number {
  const floor = getUnitFloor(serving);
  const q = Math.max(0, currentQuantity);

  if (direction === 1) {
    // Upward Step: evaluate delta at heading band (q + EPSILON)
    const delta = getStepDelta(q + EPSILON, serving);
    const quotient = (q + EPSILON) / delta;
    const nextQuotient = Math.floor(quotient) + 1;
    const next = nextQuotient * delta;
    return Math.round(next * 100) / 100;
  } else {
    // Downward Step: if already at or below stepper floor, cannot step down further
    if (q <= floor) {
      return q;
    }

    // Evaluate delta at heading band (q - EPSILON)
    const delta = getStepDelta(q - EPSILON, serving);
    const quotient = (q - EPSILON) / delta;
    const nextQuotient = Math.ceil(quotient - 1);
    const candidate = nextQuotient * delta;
    const stepped = Math.max(floor, candidate);
    return Math.round(stepped * 100) / 100;
  }
}

/**
 * Calculate physical mass in grams for a given unit quantity.
 */
export function calculatePhysicalMass(
  quantity: number,
  serving: NormalizedServing,
  fallbackDensity = 1.0
): number {
  const q = Math.max(0, quantity);

  switch (serving.unitType) {
    case 'WEIGHT':
      return q;

    case 'VOLUME': {
      const unitVol = serving.unitVolumeInMl || 1.0;
      const density = serving.densityGPerMl || fallbackDensity;
      const totalMl = q * unitVol;
      return Math.round(totalMl * density * 100) / 100;
    }

    case 'COUNT': {
      const pieceWeight = serving.referenceWeightGrams / (serving.baseQuantity || 1);
      return Math.round(q * pieceWeight * 100) / 100;
    }

    case 'HOUSEHOLD': {
      const containerWeight = serving.referenceWeightGrams / (serving.baseQuantity || 1);
      return Math.round(q * containerWeight * 100) / 100;
    }

    default:
      return q;
  }
}

/**
 * Drift-Free Unit Switching (Canonical Mass Anchoring)
 *
 * Keeps internal canonical mass frozen while calculating clean display quantity
 * for the newly selected target unit.
 */
export function convertUnitPreservingMass(
  canonicalWeightGrams: number,
  targetServing: NormalizedServing,
  fallbackDensity = 1.0
): { displayQuantity: number; canonicalWeightGrams: number } {
  const mass = Math.max(0, canonicalWeightGrams);

  let targetDisplay = 1.0;

  switch (targetServing.unitType) {
    case 'WEIGHT':
      targetDisplay = mass;
      break;

    case 'VOLUME': {
      const unitVol = targetServing.unitVolumeInMl || 1.0;
      const density = targetServing.densityGPerMl || fallbackDensity;
      const totalMl = density > 0 ? mass / density : mass;
      targetDisplay = unitVol > 0 ? totalMl / unitVol : totalMl;
      break;
    }

    case 'COUNT': {
      const pieceWeight = targetServing.referenceWeightGrams / (targetServing.baseQuantity || 1);
      targetDisplay = pieceWeight > 0 ? mass / pieceWeight : 1;
      break;
    }

    case 'HOUSEHOLD': {
      const containerWeight = targetServing.referenceWeightGrams / (targetServing.baseQuantity || 1);
      targetDisplay = containerWeight > 0 ? mass / containerWeight : 1;
      break;
    }
  }

  // Round display quantity cleanly for user viewing according to unit precision specification:
  // - WEIGHT: grams rounded to 1 decimal if fractional, or integer (e.g. 60g)
  // - VOLUME ml: integer (e.g. 200ml)
  // - Other (katori, roti, cup, tbsp): 2 decimal places (e.g. 0.43 katori, 0.5 cup)
  let cleanDisplay: number;
  if (targetServing.unitType === 'WEIGHT') {
    cleanDisplay = Math.round(targetDisplay * 10) / 10;
  } else if (targetServing.unitType === 'VOLUME' && targetServing.cleanUnitName.toLowerCase() === 'ml') {
    cleanDisplay = Math.round(targetDisplay);
  } else {
    cleanDisplay = Math.round(targetDisplay * 100) / 100;
  }

  return {
    displayQuantity: cleanDisplay,
    canonicalWeightGrams: mass, // Immutable anchor preserved with zero drift!
  };
}

/**
 * Scientific Macronutrient Calculation from Mass
 */
export function calculateNutrientsFromMass(
  food: FoodItemInput,
  resolvedWeightGrams: number
): CalculatedNutrients {
  const m = Math.max(0, resolvedWeightGrams);
  const multiplier = m / 100.0;

  const r = (val?: number) => Math.round(((val || 0) * multiplier) * 10) / 10;

  const isApprox = Boolean(
    food.isNutritionApproximate ||
    food.nutritionBasis === 'PER_100ML_UNVERIFIED' ||
    food.isQuarantined
  );

  return {
    resolvedWeightGrams: Math.round(m * 10) / 10,
    calories: Math.round(food.calories * multiplier),
    protein: r(food.protein),
    carbohydrates: r(food.carbohydrates),
    fat: r(food.fat),
    fiber: r(food.fiber),
    isApproximate: isApprox,
  };
}

/**
 * First-Open Default Unit Selection Hierarchy:
 * 1. User Preference: If a remembered preference exists, use it.
 * 2. Natural Count First: If food has discrete countable servings (COUNT, e.g. Roti, Egg, Idli, Puri),
 *    select the default COUNT serving, or tie-break by smallest baseQuantity.
 * 3. Fluids with Resolved Density (Levels 1 to 3): Default to ml or verified volume serving.
 * 4. Scale Mass by Default: For all other foods (dal, sabzi, curries, rice, loose solids, Level 4 liquids),
 *    select scale Grams (WEIGHT) at 100g base.
 * 5. Synthetic Fallback: If no servings exist, synthesize 100g WEIGHT serving.
 */
export function resolveDefaultServing(
  food: FoodItemInput,
  userPreferredUnitId?: string
): NormalizedServing {
  const servings = food.servings || [];

  // Tier 1: User Preference
  if (userPreferredUnitId) {
    const preferred = servings.find((s) => s.id === userPreferredUnitId);
    if (preferred) return preferred;
  }

  // Tier 2: Natural Count First (Roti, Egg, Puri, Idli, Bread Slice)
  // Tie-breaker: 1st by isDefault, then by smallest baseQuantity (e.g. 1 small puri vs 2 puris)
  const countServings = servings.filter((s) => s.unitType === 'COUNT');
  if (countServings.length > 0) {
    const defaultCount = countServings.find((s) => s.isDefault);
    if (defaultCount) return defaultCount;
    // Sort by baseQuantity ascending
    countServings.sort((a, b) => (a.baseQuantity || 1) - (b.baseQuantity || 1));
    return countServings[0];
  }

  // Tier 3: Fluids with Resolved Density (Levels 1 to 3) -> Open in ml / Volume
  // Concrete "is a liquid" test: Food must resolve to a valid density AND have at least one VOLUME serving
  const volumeServings = servings.filter((s) => s.unitType === 'VOLUME');
  if (volumeServings.length > 0) {
    const densityResult = resolveDensity(food.name, volumeServings[0], food.tags);
    const hasResolvedDensity = densityResult.density !== null && (densityResult.level === 1 || densityResult.level === 2 || densityResult.level === 3);

    if (hasResolvedDensity) {
      // Find ml unit first, then default volume serving
      const mlServing = volumeServings.find(
        (s) => (s.cleanUnitName || s.capsuleUnitSuffix || '').toLowerCase() === 'ml'
      );
      if (mlServing) return mlServing;
      const defaultVol = volumeServings.find((s) => s.isDefault);
      if (defaultVol) return defaultVol;
      return volumeServings[0];
    }
  }

  // Tier 4: Scale Mass by Default (Dal, Sabzi, Rice, loose items, Level 4 unverified liquids)
  const weightServing = servings.find(
    (s) => s.unitType === 'WEIGHT' && (s.cleanUnitName.toLowerCase() === 'grams' || s.cleanUnitName.toLowerCase() === 'g')
  );
  if (weightServing) {
    return weightServing;
  }

  // Default serving if specified
  const defaultServing = servings.find((s) => s.isDefault);
  if (defaultServing) {
    return defaultServing;
  }

  // Fallback synthetic 100g
  return {
    id: 'synthetic-100g',
    originalLabel: '100g',
    cleanUnitName: 'Grams',
    displayLabel: 'Grams (100g)',
    capsuleUnitSuffix: 'g',
    unitType: 'WEIGHT',
    baseQuantity: 100,
    referenceWeightGrams: 100,
    isDefault: true,
    isSynthetic: true,
  };
}

/**
 * Creates Quick Add payload for logging 1 verified default portion of food.
 * Uses resolveDefaultServing to ensure correct portion selection (e.g. 100g for aloo sabzi, 1 roti for roti).
 */
export function createQuickAddPayload(
  food: FoodItemInput,
  userPreferredUnitId?: string,
  mealType = 'LUNCH'
): MealLogPayload {
  const serving = resolveDefaultServing(food, userPreferredUnitId);
  const baseQty = serving.baseQuantity || 1;
  const canonicalMass = calculatePhysicalMass(baseQty, serving);

  return createMealLogPayload(food, serving, baseQty, canonicalMass, mealType);
}

export interface MealLogPayload {
  foodId: string;
  mealType: string;
  servings: number;
  customWeightGrams: number; // MUST be canonicalWeightGrams to prevent rounding drift!
  displayQuantity: number;
  displayUnit: string;
  unitLabel: string;
  isNutritionApproximate?: boolean;
}

/**
 * Creates API payload for logging food, enforcing that the logged mass
 * strictly originates from canonicalWeightGrams rather than displayQuantity * unitWeight.
 */
export function createMealLogPayload(
  food: FoodItemInput,
  serving: NormalizedServing,
  displayQuantity: number,
  canonicalWeightGrams: number,
  mealType = 'LUNCH'
): MealLogPayload {
  return {
    foodId: food.id,
    mealType,
    servings: 1,
    customWeightGrams: Math.round(canonicalWeightGrams * 10) / 10, // Strictly canonical mass!
    displayQuantity,
    displayUnit: serving.cleanUnitName,
    unitLabel: serving.capsuleUnitSuffix,
    isNutritionApproximate: Boolean(
      food.isNutritionApproximate ||
      food.nutritionBasis === 'PER_100ML_UNVERIFIED' ||
      food.isQuarantined
    ),
  };
}

