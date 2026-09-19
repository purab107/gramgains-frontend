import { FoodItem } from '../services/api';

/**
 * Maps a food item name/category to an intuitive, contextual food emoji.
 */
export function getFoodEmoji(food: Pick<FoodItem, 'name' | 'category'>): string {
  const name = food.name.toLowerCase();
  const category = (food.category || '').toLowerCase();

  // Non-veg / Poultry / Meat / Seafood
  if (name.includes('chicken') || name.includes('murgh') || name.includes('kebab') || name.includes('tikka')) {
    return '🍗';
  }
  if (name.includes('egg') || name.includes('anda') || name.includes('omelet') || name.includes('omlette')) {
    return '🥚';
  }
  if (name.includes('fish') || name.includes('prawn') || name.includes('shrimp') || name.includes('machli') || category.includes('fish') || category.includes('seafood')) {
    return '🐟';
  }
  if (name.includes('mutton') || name.includes('gosht') || name.includes('lamb') || name.includes('keema') || name.includes('beef') || name.includes('pork') || category.includes('meat')) {
    return '🥩';
  }

  // Rice & Biryanis
  if (name.includes('biryani') || name.includes('pulao') || name.includes('pulav') || name.includes('rice') || name.includes('khichdi') || category.includes('rice')) {
    return '🍚';
  }

  // Dairy & Paneer
  if (name.includes('paneer') || name.includes('cheese')) {
    return '🧀';
  }
  if (name.includes('milk') || name.includes('curd') || name.includes('dahi') || name.includes('yogurt') || name.includes('raita') || name.includes('buttermilk') || name.includes('lassi')) {
    return '🥛';
  }

  // Breads / Rotis
  if (name.includes('roti') || name.includes('chapati') || name.includes('naan') || name.includes('paratha') || name.includes('kulcha') || name.includes('puri') || name.includes('bread') || category.includes('bread')) {
    return '🫓';
  }

  // South Indian / Breakfast
  if (name.includes('dosa') || name.includes('idli') || name.includes('vada') || name.includes('uttapam') || name.includes('upma') || name.includes('poha')) {
    return '🥞';
  }

  // Dal / Pulses / Soups / Gravies / Curries
  if (name.includes('soup') || category.includes('soup')) {
    return '🥣';
  }
  if (name.includes('dal') || name.includes('daal') || name.includes('sambar') || name.includes('rasam') || name.includes('chana') || name.includes('rajma') || name.includes('curry') || category.includes('dal') || category.includes('curry')) {
    return '🍲';
  }

  // Snacks / Fast food
  if (name.includes('samosa') || name.includes('pakora') || name.includes('kachori') || name.includes('snack') || name.includes('chaat') || category.includes('snack')) {
    return '🥟';
  }

  // Sweets & Desserts
  if (name.includes('halwa') || name.includes('kheer') || name.includes('gulab jamun') || name.includes('laddu') || name.includes('ladoo') || name.includes('sweet') || name.includes('cake') || name.includes('barfi') || category.includes('dessert') || category.includes('sweet')) {
    return '🍯';
  }

  // Beverages
  if (name.includes('tea') || name.includes('chai') || name.includes('coffee') || category.includes('beverage')) {
    return '☕';
  }
  if (name.includes('juice') || name.includes('shake') || name.includes('smoothie')) {
    return '🥤';
  }

  // Vegetables & Salads
  if (name.includes('salad') || name.includes('subzi') || name.includes('sabzi') || name.includes('bhaji') || name.includes('gobi') || name.includes('palak') || name.includes('methi') || name.includes('potato') || name.includes('aloo') || name.includes('vegetable') || category.includes('vegetable')) {
    return '🥦';
  }

  // Fruits
  if (name.includes('apple') || name.includes('banana') || name.includes('mango') || name.includes('orange') || category.includes('fruit')) {
    return '🍎';
  }

  // Default fallback
  return '🥗';
}

/**
 * Returns a human-friendly provenance/category subtitle (e.g. "Indian • Prepared Dish").
 */
export function getCleanCategoryLabel(food: FoodItem): string {
  if (food.category && food.category !== 'General') {
    if (food.source && food.source.includes('INDB')) {
      return `Indian • ${food.category}`;
    }
    if (food.source && food.source.includes('IFCT')) {
      return `Raw Ingredient • ${food.category}`;
    }
    return food.category;
  }
  if (food.layer === 2) {
    return 'Indian • Prepared Dish';
  }
  return 'Food Ingredient';
}

/**
 * Standardized 100g nutrition values for a food item (since database canonical base is per 100g).
 */
export function calculatePer100g(food: FoodItem) {
  return {
    calories: Math.round(food.calories),
    protein: Math.round(food.protein * 10) / 10,
    carbs: Math.round(food.carbohydrates * 10) / 10,
    fat: Math.round(food.fat * 10) / 10,
    fiber: Math.round((food.fiber || 0) * 10) / 10,
  };
}
