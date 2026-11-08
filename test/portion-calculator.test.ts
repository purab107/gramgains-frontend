import test from 'node:test';
import assert from 'node:assert/strict';
import type { NormalizedServing, FoodItemInput } from '../src/lib/portion-calculator.ts';
import {
  resolveDensity,
  getUnitFloor,
  getStepDelta,
  stepQuantity,
  calculatePhysicalMass,
  convertUnitPreservingMass,
  calculateNutrientsFromMass,
  resolveDefaultServing,
  createMealLogPayload,
  createQuickAddPayload,
  METRIC_CUP_ML,
  TABLESPOON_ML,
} from '../src/lib/portion-calculator.ts';

// ---------------------------------------------------------------------------
// TEST FIXTURES
// ---------------------------------------------------------------------------

const dalFood: FoodItemInput = {
  id: 'dal-001',
  name: 'Toor Dal Tadka',
  calories: 96.0, // per 100g
  protein: 4.4,
  carbohydrates: 11.5,
  fat: 3.6,
  fiber: 2.5,
};

const gramServing: NormalizedServing = {
  id: 'srv-g',
  originalLabel: 'g',
  cleanUnitName: 'Grams',
  displayLabel: 'Grams (100g)',
  capsuleUnitSuffix: 'g',
  unitType: 'WEIGHT',
  baseQuantity: 100,
  referenceWeightGrams: 100,
  isDefault: false,
};

const katoriServing: NormalizedServing = {
  id: 'srv-katori',
  originalLabel: '1 katori',
  cleanUnitName: 'Katori',
  displayLabel: 'Katori (140g)',
  capsuleUnitSuffix: 'katori',
  unitType: 'HOUSEHOLD',
  baseQuantity: 1,
  referenceWeightGrams: 140,
  isDefault: true,
};

const eggServing: NormalizedServing = {
  id: 'srv-egg',
  originalLabel: '1 whole egg',
  cleanUnitName: 'Egg',
  displayLabel: 'Egg (50g)',
  capsuleUnitSuffix: 'egg',
  unitType: 'COUNT',
  baseQuantity: 1,
  referenceWeightGrams: 50,
  isDefault: true,
  isIntegerOnly: true,
};

const rotiServing: NormalizedServing = {
  id: 'srv-roti',
  originalLabel: '1 medium roti',
  cleanUnitName: 'Roti',
  displayLabel: 'Medium Roti (30g)',
  capsuleUnitSuffix: 'roti',
  unitType: 'COUNT',
  baseQuantity: 1,
  referenceWeightGrams: 30,
  isDefault: true,
  isIntegerOnly: false,
};

const milkVolumeServing: NormalizedServing = {
  id: 'srv-milk-ml',
  originalLabel: '200 ml',
  cleanUnitName: 'ml',
  displayLabel: '200 ml',
  capsuleUnitSuffix: 'ml',
  unitType: 'VOLUME',
  baseQuantity: 200,
  referenceWeightGrams: 206, // Level 1 empirical density = 206/200 = 1.03
  unitVolumeInMl: 1,
  densityGPerMl: 1.03,
  isDefault: true,
};

const milkCupServing: NormalizedServing = {
  id: 'srv-milk-cup',
  originalLabel: '1 cup',
  cleanUnitName: 'Cup',
  displayLabel: 'Cup (250ml)',
  capsuleUnitSuffix: 'cup',
  unitType: 'VOLUME',
  baseQuantity: 1,
  referenceWeightGrams: 257.5, // 250ml * 1.03 = 257.5g
  unitVolumeInMl: METRIC_CUP_ML,
  densityGPerMl: 1.03,
  isDefault: false,
};

const oilTbspServing: NormalizedServing = {
  id: 'srv-oil-tbsp',
  originalLabel: '1 tbsp',
  cleanUnitName: 'Tablespoon',
  displayLabel: 'Tablespoon (15ml)',
  capsuleUnitSuffix: 'tbsp',
  unitType: 'VOLUME',
  baseQuantity: 1,
  referenceWeightGrams: 13.8, // 15ml * 0.92 = 13.8g
  unitVolumeInMl: TABLESPOON_ML,
  densityGPerMl: 0.92,
  isDefault: false,
};

const riceCupBulkServing: NormalizedServing = {
  id: 'srv-rice-cup',
  originalLabel: '1 cup cooked',
  cleanUnitName: 'Cup',
  displayLabel: 'Cup Cooked (150g)',
  capsuleUnitSuffix: 'cup',
  unitType: 'VOLUME',
  baseQuantity: 1,
  referenceWeightGrams: 150, // 150g / 250ml = 0.60 g/ml bulk density
  unitVolumeInMl: METRIC_CUP_ML,
  isDefault: true,
};

// ---------------------------------------------------------------------------
// 1. STEPPER SNAPPING TESTS
// ---------------------------------------------------------------------------

test('Snapping: 0.43 katori snaps upward to 0.50 katori, then to 1.00', () => {
  const step1 = stepQuantity(0.43, 1, katoriServing);
  assert.equal(step1, 0.5);

  const step2 = stepQuantity(step1, 1, katoriServing);
  assert.equal(step2, 1.0);

  const step3 = stepQuantity(step2, 1, katoriServing);
  assert.equal(step3, 1.5);
});

test('Snapping: Household katori steps down cleanly 1.5 -> 1.0 -> 0.5, and stops at floor 0.5', () => {
  const stepDown1 = stepQuantity(1.5, -1, katoriServing);
  assert.equal(stepDown1, 1.0);

  const stepDown2 = stepQuantity(stepDown1, -1, katoriServing);
  assert.equal(stepDown2, 0.5);

  // Stepping down at floor 0.5 stays at floor (button disabled in UI)
  const stepDownAtFloor = stepQuantity(stepDown2, -1, katoriServing);
  assert.equal(stepDownAtFloor, 0.5);

  // Irregular 0.43 below stepper floor does not step down
  assert.equal(stepQuantity(0.43, -1, katoriServing), 0.43);
});

test('Snapping: Epsilon safety prevents IEEE 754 precision misfire on 0.3 / 0.1', () => {
  const customServing: NormalizedServing = {
    ...katoriServing,
    unitType: 'COUNT',
  };
  // 0.3 + 0.1 in standard JS is 0.30000000000000004
  const next = stepQuantity(0.3, 1, customServing);
  assert.equal(next, 0.5); // delta for COUNT is 0.5, so 0.3 snaps up to 0.5
});

test('Grams Asymmetric Delta Bands: Upward progression across 100g and 250g boundaries', () => {
  let g = 90;
  g = stepQuantity(g, 1, gramServing);
  assert.equal(g, 100); // 90 -> 100 (Band 1, delta 10)

  g = stepQuantity(g, 1, gramServing);
  assert.equal(g, 125); // 100 -> 125 (Band 2, delta 25)

  g = 225;
  g = stepQuantity(g, 1, gramServing);
  assert.equal(g, 250); // 225 -> 250 (Band 2, delta 25)

  g = stepQuantity(g, 1, gramServing);
  assert.equal(g, 300); // 250 -> 300 (Band 3, delta 50)
});

test('Grams Asymmetric Delta Bands: Downward progression across 250g and 100g boundaries', () => {
  let g = 300;
  g = stepQuantity(g, -1, gramServing);
  assert.equal(g, 250); // 300 -> 250 (Band 3, delta 50)

  g = stepQuantity(g, -1, gramServing);
  assert.equal(g, 225); // 250 -> 225 (Band 2, delta 25)

  g = 125;
  g = stepQuantity(g, -1, gramServing);
  assert.equal(g, 100); // 125 -> 100 (Band 2, delta 25)

  g = stepQuantity(g, -1, gramServing);
  assert.equal(g, 90); // 100 -> 90 (Band 1, delta 10)
});

test('Grams Snapping: Irregular 63g snaps to 70g upward and 60g downward', () => {
  assert.equal(stepQuantity(63, 1, gramServing), 70);
  assert.equal(stepQuantity(63, -1, gramServing), 60);
});

// ---------------------------------------------------------------------------
// 2. PER-UNIT FLOORS
// ---------------------------------------------------------------------------

test('Per-Unit Floors: Enforces 1g for grams, 1ml for ml, 0.5 for katori, 1.0 for egg', () => {
  assert.equal(getUnitFloor(gramServing), 1.0);
  assert.equal(getUnitFloor(milkVolumeServing), 1.0);
  assert.equal(getUnitFloor(katoriServing), 0.5);
  assert.equal(getUnitFloor(eggServing), 1.0);
  assert.equal(getUnitFloor(rotiServing), 0.5);

  // Stepping down from near-floor stops at floor
  assert.equal(stepQuantity(5, -1, gramServing), 1.0);
  assert.equal(stepQuantity(1.8, -1, eggServing), 1.0);
  assert.equal(stepQuantity(0.9, -1, katoriServing), 0.5);
});

// ---------------------------------------------------------------------------
// 3. DRIFT-FREE CANONICAL MASS ANCHORING (ROUND-TRIP UNIT SWITCHING)
// ---------------------------------------------------------------------------

test('Mass Anchoring: 60g Dal converts to 0.43 katori, and back to 60g with ZERO drift', () => {
  const initialMass = 60.0;

  // Switch to Katori (140g)
  const toKatori = convertUnitPreservingMass(initialMass, katoriServing);
  assert.equal(toKatori.displayQuantity, 0.43);
  assert.equal(toKatori.canonicalWeightGrams, 60.0); // Mass anchor remains perfectly frozen!

  // Switch back to Grams without user mutation
  const backToGrams = convertUnitPreservingMass(toKatori.canonicalWeightGrams, gramServing);
  assert.equal(backToGrams.displayQuantity, 60.0);
  assert.equal(backToGrams.canonicalWeightGrams, 60.0);
});

test('Mutation Re-anchoring: User stepping + on 0.43 katori re-anchors mass to 70g', () => {
  const initialMass = 60.0;
  const toKatori = convertUnitPreservingMass(initialMass, katoriServing);

  // User presses "+" stepper button -> snaps 0.43 to 0.50 katori
  const newQty = stepQuantity(toKatori.displayQuantity, 1, katoriServing);
  assert.equal(newQty, 0.5);

  // Explicit user mutation triggers re-anchoring
  const reanchoredMass = calculatePhysicalMass(newQty, katoriServing);
  assert.equal(reanchoredMass, 70.0); // 0.5 * 140g = 70.0g

  // Switching back to Grams now displays 70g
  const backToGrams = convertUnitPreservingMass(reanchoredMass, gramServing);
  assert.equal(backToGrams.displayQuantity, 70.0);
  assert.equal(backToGrams.canonicalWeightGrams, 70.0);
});

// ---------------------------------------------------------------------------
// 4. LEVEL 1 GENERALIZED DENSITY & CULINARY VOLUMETRIC MEASURES
// ---------------------------------------------------------------------------

test('Level 1 Density: Resolves 200ml milk weighing 206g to 1.03 g/ml', () => {
  const res = resolveDensity('Milk', {
    unitType: 'VOLUME',
    weightGrams: 206,
    displayQuantity: 200,
    unitVolumeInMl: 1,
  });
  assert.equal(res.level, 1);
  assert.equal(res.density, 1.03);
});

test('Level 1 Density: Resolves 1 cup milk (250ml) weighing 257.5g to 1.03 g/ml', () => {
  const res = resolveDensity('Milk', {
    unitType: 'VOLUME',
    weightGrams: 257.5,
    displayQuantity: 1,
    unitVolumeInMl: METRIC_CUP_ML,
  });
  assert.equal(res.level, 1);
  assert.equal(res.density, 1.03);
});

test('Level 1 Density: Resolves 1 tbsp oil (15ml) weighing 13.8g to 0.92 g/ml', () => {
  const res = resolveDensity('Mustard Oil', {
    unitType: 'VOLUME',
    weightGrams: 13.8,
    displayQuantity: 1,
    unitVolumeInMl: TABLESPOON_ML,
  });
  assert.equal(res.level, 1);
  assert.equal(res.density, 0.92);
});

test('Level 1 Bulk Density: Resolves 1 cup cooked rice (250ml) weighing 150g to 0.60 g/ml bulk', () => {
  const res = resolveDensity('Cooked Basmati Rice', {
    unitType: 'VOLUME',
    weightGrams: 150,
    displayQuantity: 1,
    unitVolumeInMl: METRIC_CUP_ML,
  });
  assert.equal(res.level, 1);
  assert.equal(res.density, 0.6);
});

test('Level 3 Curated Category: Resolves 100% Citrus Juice via curated tag', () => {
  const res = resolveDensity('Tropicana Pure Orange Juice', undefined, ['citrus_juice_100']);
  assert.equal(res.level, 3);
  assert.equal(res.density, 1.048);
});

test('Level 4 Suppression: Smoothie drops to Level 4 (requires scale grams)', () => {
  const res = resolveDensity('Berry Blast Smoothie', undefined, ['smoothie']);
  assert.equal(res.level, 4);
  assert.equal(res.density, null);
});

// ---------------------------------------------------------------------------
// 5. NUTRITION CALCULATION FROM MASS (DAL TADKA TEST CASE)
// ---------------------------------------------------------------------------

test('Nutrition Math: 60g scale entry of Dal Tadka calculates exact macros', () => {
  const macros = calculateNutrientsFromMass(dalFood, 60.0);
  assert.equal(macros.resolvedWeightGrams, 60.0);
  assert.equal(macros.calories, 58); // 96 * 0.60 = 57.6 -> 58
  assert.equal(macros.protein, 2.6); // 4.4 * 0.60 = 2.64 -> 2.6
  assert.equal(macros.carbohydrates, 6.9); // 11.5 * 0.60 = 6.9
  assert.equal(macros.fat, 2.2); // 3.6 * 0.60 = 2.16 -> 2.2
});

test('Nutrition Math: 1 katori (140g) of Dal Tadka calculates exact macros', () => {
  const macros = calculateNutrientsFromMass(dalFood, 140.0);
  assert.equal(macros.resolvedWeightGrams, 140.0);
  assert.equal(macros.calories, 134); // 96 * 1.40 = 134.4 -> 134
  assert.equal(macros.protein, 6.2); // 4.4 * 1.40 = 6.16 -> 6.2
  assert.equal(macros.carbohydrates, 16.1); // 11.5 * 1.40 = 16.1
  assert.equal(macros.fat, 5.0); // 3.6 * 1.40 = 5.04 -> 5.0
});

// ---------------------------------------------------------------------------
// 6. QUARANTINE, APPROXIMATE FLAGS & UNIT STEPPER SCOPE
// ---------------------------------------------------------------------------

test('Quarantine: Unverified per-100ml liquid is flagged approximate in calculation', () => {
  const unverifiedJuice: FoodItemInput = {
    id: 'juice-unverified',
    name: 'Exotic Fruit Blend',
    calories: 45,
    protein: 0.5,
    carbohydrates: 10.5,
    fat: 0.1,
    nutritionBasis: 'PER_100ML_UNVERIFIED',
    isQuarantined: true,
  };

  const macros = calculateNutrientsFromMass(unverifiedJuice, 100);
  assert.equal(macros.isApproximate, true);
});

test('Gram Bands Scope: 10/25/50 bands apply strictly to grams, not kg or 100g multiplier', () => {
  const kgServing: NormalizedServing = {
    ...gramServing,
    cleanUnitName: 'kg',
    capsuleUnitSuffix: 'kg',
  };
  // 0.25 kg steps by 0.05, not by 10/25/50 grams delta
  const delta = getStepDelta(0.25, kgServing);
  assert.equal(delta, 0.05);
});

// ---------------------------------------------------------------------------
// 7. LOGGED WEIGHT FROM canonicalWeightGrams (not display × unit weight)
// ---------------------------------------------------------------------------

test('MealLog Payload: logged customWeightGrams is canonicalWeightGrams, not display × unitWeight', () => {
  // User enters 60g, switches to katori (displays 0.43), does not press stepper.
  // displayQuantity = 0.43, but canonicalWeightGrams is still frozen at 60g.
  const toKatori = convertUnitPreservingMass(60.0, katoriServing);
  assert.equal(toKatori.canonicalWeightGrams, 60.0); // Frozen at exact 60g

  // Build the payload: customWeightGrams MUST come from canonicalWeightGrams (60g)
  // NOT from 0.43 × 140g = 60.2g
  const payload = createMealLogPayload(dalFood, katoriServing, toKatori.displayQuantity, toKatori.canonicalWeightGrams);
  assert.equal(payload.customWeightGrams, 60.0); // Exactly 60.0, zero drift!
  assert.notEqual(payload.customWeightGrams, 60.2); // Would have been drift if recomputed
});

test('MealLog Payload: logs carry approximate flag for quarantined items (Quick Add too)', () => {
  const unverifiedItem: FoodItemInput = {
    id: 'liquid-001',
    name: 'Mystery Juice',
    calories: 50,
    protein: 0.3,
    carbohydrates: 12.0,
    fat: 0.0,
    nutritionBasis: 'PER_100ML_UNVERIFIED',
    isQuarantined: true,
    servings: [katoriServing],
  };

  const payload = createMealLogPayload(unverifiedItem, katoriServing, 1.0, 140.0);
  assert.equal(payload.isNutritionApproximate, true);
});

// ---------------------------------------------------------------------------
// 8. DENSITY SOURCE AND APPROXIMATELY VERIFIED FLAG
// ---------------------------------------------------------------------------

test('resolveDensity: Level 1 returns densitySource LEVEL_1, isApproximatelyVerified false', () => {
  const result = resolveDensity('Milk', {
    unitType: 'VOLUME',
    referenceWeightGrams: 206,
    baseQuantity: 200,
    unitVolumeInMl: 1,
  });
  assert.equal(result.level, 1);
  assert.equal(result.densitySource, 'LEVEL_1');
  assert.equal(result.isApproximatelyVerified, false);
});

test('resolveDensity: Level 2 returns densitySource LEVEL_2, isApproximatelyVerified false', () => {
  const result = resolveDensity('honey');
  assert.equal(result.level, 2);
  assert.equal(result.densitySource, 'LEVEL_2');
  assert.equal(result.isApproximatelyVerified, false);
  assert.equal(result.density, 1.42);
});

test('resolveDensity: Level 3 returns densitySource LEVEL_3, isApproximatelyVerified TRUE (category average)', () => {
  const result = resolveDensity('Fresh Orange Juice', undefined, ['citrus_juice_100']);
  assert.equal(result.level, 3);
  assert.equal(result.densitySource, 'LEVEL_3');
  assert.equal(result.isApproximatelyVerified, true); // Category value, not exact!
  assert.equal(result.density, 1.048);
});

test('resolveDensity: Level 4 returns densitySource null, density null', () => {
  const result = resolveDensity('Berry Smoothie');
  assert.equal(result.level, 4);
  assert.equal(result.densitySource, null);
  assert.equal(result.density, null);
});

// ---------------------------------------------------------------------------
// 9. FIRST-OPEN DEFAULT UNIT SELECTION
// ---------------------------------------------------------------------------

test('First-Open Default: Food with COUNT serving selects COUNT first (Roti -> Roti unit)', () => {
  const rotiFood: FoodItemInput = {
    id: 'roti-001',
    name: 'Wheat Roti',
    calories: 71,
    protein: 2.7,
    carbohydrates: 14.6,
    fat: 0.4,
    servings: [gramServing, katoriServing, rotiServing],
  };

  const defaultServing = resolveDefaultServing(rotiFood);
  assert.equal(defaultServing.unitType, 'COUNT');
  assert.equal(defaultServing.cleanUnitName, 'Roti');
});

test('First-Open Default: Food without COUNT serving defaults to scale Grams (Dal -> Grams)', () => {
  const dalWithServings: FoodItemInput = {
    ...dalFood,
    servings: [gramServing, katoriServing], // no COUNT serving
  };

  const defaultServing = resolveDefaultServing(dalWithServings);
  assert.equal(defaultServing.unitType, 'WEIGHT');
  assert.equal(defaultServing.cleanUnitName, 'Grams');
});

test('First-Open Default: User preference overrides COUNT-first rule', () => {
  const rotiFood: FoodItemInput = {
    id: 'roti-001',
    name: 'Wheat Roti',
    calories: 71,
    protein: 2.7,
    carbohydrates: 14.6,
    fat: 0.4,
    servings: [gramServing, katoriServing, rotiServing],
  };

  // User remembers they prefer grams for this food
  const defaultServing = resolveDefaultServing(rotiFood, 'srv-g');
  assert.equal(defaultServing.unitType, 'WEIGHT');
  assert.equal(defaultServing.id, 'srv-g');
});

test('First-Open Default: Food with no servings falls back to synthetic 100g serving', () => {
  const bareFood: FoodItemInput = {
    id: 'bare-001',
    name: 'Unknown Item',
    calories: 100,
    protein: 5.0,
    carbohydrates: 10.0,
    fat: 2.0,
    servings: [],
  };

  const defaultServing = resolveDefaultServing(bareFood);
  assert.equal(defaultServing.isSynthetic, true);
  assert.equal(defaultServing.referenceWeightGrams, 100);
  assert.equal(defaultServing.unitType, 'WEIGHT');
});

test('First-Open Default: COUNT tie-break prefers isDefault, then smallest baseQuantity', () => {
  const smallPuri: NormalizedServing = {
    ...rotiServing,
    id: 'puri-sm',
    cleanUnitName: 'Small Puri',
    baseQuantity: 1,
    referenceWeightGrams: 20,
    isDefault: false,
  };
  const largePuri: NormalizedServing = {
    ...rotiServing,
    id: 'puri-lg',
    cleanUnitName: 'Large Puri',
    baseQuantity: 2,
    referenceWeightGrams: 50,
    isDefault: false,
  };
  const puriFood: FoodItemInput = {
    id: 'puri-001',
    name: 'Puri',
    calories: 120,
    protein: 2.0,
    carbohydrates: 15.0,
    fat: 6.0,
    servings: [largePuri, smallPuri, gramServing],
  };

  const selected = resolveDefaultServing(puriFood);
  assert.equal(selected.id, 'puri-sm'); // smallest baseQuantity wins tie
});

test('First-Open Default: Liquids with resolved density default to ml, Level 4 liquids default to grams', () => {
  const milkFood: FoodItemInput = {
    id: 'milk-001',
    name: 'Cow Milk',
    calories: 62,
    protein: 3.2,
    carbohydrates: 4.8,
    fat: 3.5,
    servings: [gramServing, milkVolumeServing, milkCupServing],
  };

  const selectedMilk = resolveDefaultServing(milkFood);
  assert.equal(selectedMilk.cleanUnitName, 'ml'); // opens in ml

  // Level 4 liquid without resolved density (no tags, name not in registry, no weightGrams on serving)
  const unverifiedShake: FoodItemInput = {
    id: 'shake-001',
    name: 'Custom Berry Shake',
    calories: 150,
    protein: 8,
    carbohydrates: 20,
    fat: 3,
    servings: [
      gramServing,
      {
        id: 'shake-glass',
        originalLabel: '1 glass',
        cleanUnitName: 'Glass',
        displayLabel: 'Glass',
        capsuleUnitSuffix: 'glass',
        unitType: 'VOLUME',
        baseQuantity: 1,
        referenceWeightGrams: 0, // unmeasured
        unitVolumeInMl: 250,
        isDefault: false,
      },
    ],
  };

  const selectedShake = resolveDefaultServing(unverifiedShake);
  assert.equal(selectedShake.cleanUnitName, 'Grams'); // Level 4 opens in grams!
});

// ---------------------------------------------------------------------------
// 10. STEPPER FLOOR BOUNDARY JUMPS (CUP, FL OZ, GRAMS)
// ---------------------------------------------------------------------------

test('Stepper Floor: Cup floor is 0.5; steps 1.5 -> 1.0 -> 0.5 (stops at floor)', () => {
  const cupServing: NormalizedServing = {
    ...milkCupServing,
    cleanUnitName: 'cup',
    capsuleUnitSuffix: 'cup',
  };
  assert.equal(getUnitFloor(cupServing), 0.5);

  let q = 1.5;
  q = stepQuantity(q, -1, cupServing);
  assert.equal(q, 1.0);
  q = stepQuantity(q, -1, cupServing);
  assert.equal(q, 0.5); // stops cleanly at floor 0.5, no 0.25 odd jump!
  q = stepQuantity(q, -1, cupServing);
  assert.equal(q, 0.5); // no-op at floor
});

test('Stepper Floor: Grams downward boundary jump from 10g lands on 1g floor', () => {
  // At 10g, (10 - eps) evaluates to delta=10, ceil((9.999999/10) - 1) = 0 -> candidate 0.
  // max(floor=1, 0) lands cleanly on 1g floor!
  const stepFrom10 = stepQuantity(10, -1, gramServing);
  assert.equal(stepFrom10, 1.0);

  // At 1g floor, pressing - is a no-op
  const stepFrom1 = stepQuantity(1, -1, gramServing);
  assert.equal(stepFrom1, 1.0);
});

test('Stepper Floor: Fl oz downward boundary jump from 1.0 lands on 0.5 floor', () => {
  const flOzServing: NormalizedServing = {
    ...milkVolumeServing,
    cleanUnitName: 'fl oz',
    capsuleUnitSuffix: 'fl oz',
  };
  assert.equal(getUnitFloor(flOzServing), 0.5);

  const stepFrom1 = stepQuantity(1.0, -1, flOzServing);
  assert.equal(stepFrom1, 0.5);

  const stepFromHalf = stepQuantity(0.5, -1, flOzServing);
  assert.equal(stepFromHalf, 0.5); // no-op at floor
});

test('Quick Add Payload: logs 100g for aloo sabzi (scale default) and 1 piece for roti (count default)', () => {
  // Aloo Sabzi (solid without count servings)
  const alooFood: FoodItemInput = {
    id: 'aloo-001',
    name: 'Aloo Sabzi',
    calories: 120,
    protein: 2.0,
    carbohydrates: 20.0,
    fat: 4.0,
    servings: [gramServing, katoriServing],
  };

  const alooPayload = createQuickAddPayload(alooFood);
  assert.equal(alooPayload.displayUnit, 'Grams');
  assert.equal(alooPayload.displayQuantity, 100);
  assert.equal(alooPayload.customWeightGrams, 100); // 100g scale default, not 1 katori!

  // Roti (food with count serving)
  const rotiFood: FoodItemInput = {
    id: 'roti-001',
    name: 'Roti',
    calories: 70,
    protein: 2.5,
    carbohydrates: 14.0,
    fat: 0.5,
    servings: [gramServing, rotiServing],
  };

  const rotiPayload = createQuickAddPayload(rotiFood);
  assert.equal(rotiPayload.displayUnit, 'Roti');
  assert.equal(rotiPayload.displayQuantity, 1);
  assert.equal(rotiPayload.customWeightGrams, 30); // 30g roti mass
});
