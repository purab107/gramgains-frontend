import test from 'node:test';
import assert from 'node:assert/strict';
import { getPrimaryServingInfo, getServingSubtitle } from '../src/lib/food-utils.ts';

test('Serving Subtitle: Fixes "per 11 katori" double-prefix bug', () => {
  const alooBhurji: any = {
    id: 'aloo-bhurji',
    name: 'Aloo bhurji (dry aloo sabzi)',
    aliases: [],
    category: 'Vegetables & Sabzis',
    servingUnit: '1 katori',
    servingWeight: 150,
    servingDisplayQuantity: 1,
    calories: 123, // per 100g
    protein: 1.5,
    carbohydrates: 18.3,
    fat: 4.8,
    fiber: 2.1,
    source: 'INDB',
    layer: 2,
  };

  const info = getPrimaryServingInfo(alooBhurji);
  assert.equal(info.servingLabel, '1 katori (150g)');
  assert.equal(info.displaySubtitle, 'per 1 katori (150g)');
  assert.equal(getServingSubtitle(alooBhurji), 'per 1 katori (150g)');
  // Scaled macros for 150g (1.5x)
  assert.equal(info.calories, Math.round(123 * 1.5)); // 185
  assert.equal(info.protein, 2.3);
  assert.equal(info.carbs, 27.5);
  assert.equal(info.fat, 7.2);
});

test('Serving Subtitle: Fixes "per 22 medium" for Amla', () => {
  const amla: any = {
    id: 'amla',
    name: 'Amla (Indian gooseberry)',
    aliases: [],
    category: 'Fruits',
    servingUnit: '2 medium',
    servingWeight: 40,
    servingDisplayQuantity: 2,
    calories: 44, // per 100g
    protein: 0.9,
    carbohydrates: 10.2,
    fat: 0.6,
    fiber: 3.4,
    source: 'INDB',
    layer: 1,
  };

  const info = getPrimaryServingInfo(amla);
  assert.equal(info.servingLabel, '2 medium (40g)');
  assert.equal(info.displaySubtitle, 'per 2 medium (40g)');
  // Scaled macros for 40g (0.4x)
  assert.equal(info.calories, Math.round(44 * 0.4)); // 18
});

test('Serving Subtitle: Fixes "per 0.51/2 medium" for Avocado', () => {
  const avocado: any = {
    id: 'avocado',
    name: 'Avocado',
    aliases: [],
    category: 'Fruits',
    servingUnit: '1/2 medium',
    servingWeight: 100,
    servingDisplayQuantity: 0.5,
    calories: 160,
    protein: 2.0,
    carbohydrates: 8.5,
    fat: 14.7,
    fiber: 6.7,
    source: 'USDA',
    layer: 1,
  };

  const info = getPrimaryServingInfo(avocado);
  assert.equal(info.servingLabel, '1/2 medium (100g)');
  assert.equal(info.displaySubtitle, 'per 1/2 medium (100g)');
  assert.equal(info.calories, 160);
});

test('Serving Subtitle: Formats plain gram item as "per 100g"', () => {
  const looseItem: any = {
    id: 'loose-dal',
    name: 'Dal Tadka',
    aliases: [],
    category: 'Dals & Lentils',
    servingUnit: 'g',
    servingWeight: 100,
    calories: 120,
    protein: 6.0,
    carbohydrates: 16.0,
    fat: 3.5,
    fiber: 4.0,
    source: 'INDB',
    layer: 2,
  };

  const info = getPrimaryServingInfo(looseItem);
  assert.equal(info.servingLabel, '100g');
  assert.equal(info.displaySubtitle, 'per 100g');
  assert.equal(info.calories, 120);
});
