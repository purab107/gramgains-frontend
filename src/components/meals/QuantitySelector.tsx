'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, FoodServing } from '@/services/api';
import { Minus, Plus, Scale, Sparkles } from 'lucide-react';
import { MACRO_COLORS } from '@/lib/constants';

export interface ServingSelection {
  selectedServing: FoodServing;
  displayQuantity: number;
  displayUnit: string;
  resolvedWeightGrams: number;
}

export interface QuantitySelectorProps {
  food: FoodItem;
  initialServingId?: string;
  initialQuantity?: number;
  onChange: (selection: ServingSelection) => void;
  className?: string;
  compact?: boolean;
}

/**
 * Format a serving pill label cleanly (e.g. "200 ml", "1 glass", "100 g", "1 piece")
 */
function getServingChipLabel(serving: FoodServing): string {
  const qty = serving.displayQuantity !== null && serving.displayQuantity !== undefined
    ? serving.displayQuantity
    : (serving.unitType === 'WEIGHT' ? serving.weightGrams : '');
  const unit = serving.unitLabel || 'g';
  if (qty) {
    return `${qty} ${unit}`.trim();
  }
  return unit;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  food,
  initialServingId,
  initialQuantity,
  onChange,
  className = '',
  compact = false,
}) => {
  // Build normalized list of real servings from food data
  const availableServings: FoodServing[] = useMemo(() => {
    if (food.servings && food.servings.length > 0) {
      return food.servings;
    }
    // Fallback if servings array is empty
    return [
      {
        id: 'default-serving',
        foodId: food.id,
        unitLabel: food.servingUnit || 'g',
        unitType: food.servingUnitType || 'WEIGHT',
        displayQuantity: food.servingDisplayQuantity ?? (food.servingWeight || 100),
        weightGrams: food.servingWeight || 100,
        isDefault: true,
      },
    ];
  }, [food]);

  // Determine initial selected serving
  const initialServing = useMemo(() => {
    if (initialServingId) {
      const found = availableServings.find((s) => s.id === initialServingId);
      if (found) return found;
    }
    const def = availableServings.find((s) => s.isDefault);
    return def || availableServings[0];
  }, [availableServings, initialServingId]);

  const [selectedServing, setSelectedServing] = useState<FoodServing>(initialServing);
  
  // Set initial display quantity based on serving's natural displayQuantity or 1
  const [quantity, setQuantity] = useState<number>(() => {
    if (initialQuantity !== undefined && initialQuantity > 0) return initialQuantity;
    if (selectedServing.displayQuantity !== null && selectedServing.displayQuantity !== undefined && selectedServing.displayQuantity > 0) {
      return selectedServing.displayQuantity;
    }
    return selectedServing.unitType === 'WEIGHT' ? selectedServing.weightGrams : 1;
  });

  // When food changes, reset selected serving
  useEffect(() => {
    const def = availableServings.find((s) => s.isDefault) || availableServings[0];
    setSelectedServing(def);
    const initialQty = def.displayQuantity !== null && def.displayQuantity !== undefined && def.displayQuantity > 0
      ? def.displayQuantity
      : (def.unitType === 'WEIGHT' ? def.weightGrams : 1);
    setQuantity(initialQty);
  }, [food.id]);

  // Calculate resolved mass (weight in grams)
  const resolvedWeightGrams = useMemo(() => {
    const baseServingDisplay = selectedServing.displayQuantity !== null && selectedServing.displayQuantity !== undefined && selectedServing.displayQuantity > 0
      ? selectedServing.displayQuantity
      : (selectedServing.unitType === 'WEIGHT' ? selectedServing.weightGrams : 1);

    if (baseServingDisplay <= 0) return selectedServing.weightGrams;
    const ratio = quantity / baseServingDisplay;
    const mass = ratio * selectedServing.weightGrams;
    return Math.max(0.1, Math.round(mass * 10) / 10);
  }, [selectedServing, quantity]);

  // Notify parent on changes
  useEffect(() => {
    onChange({
      selectedServing,
      displayQuantity: quantity,
      displayUnit: selectedServing.unitLabel || 'g',
      resolvedWeightGrams,
    });
  }, [selectedServing, quantity, resolvedWeightGrams, onChange]);

  // Handle serving pill selection
  const handleSelectServing = (serving: FoodServing) => {
    setSelectedServing(serving);
    // When switching serving, intuitively set default quantity for that unit
    const defQty = serving.displayQuantity !== null && serving.displayQuantity !== undefined && serving.displayQuantity > 0
      ? serving.displayQuantity
      : (serving.unitType === 'WEIGHT' ? serving.weightGrams : 1);
    setQuantity(defQty);
  };

  // Stepper increment/decrement step size
  const step = useMemo(() => {
    if (selectedServing.unitType === 'WEIGHT') {
      return quantity >= 100 ? 50 : 10;
    }
    if (selectedServing.unitType === 'VOLUME' && selectedServing.unitLabel.toLowerCase().includes('ml')) {
      return quantity >= 100 ? 50 : 25;
    }
    return 1;
  }, [selectedServing, quantity]);

  const handleStep = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta * step;
      return Math.max(step >= 1 ? 1 : 0.1, Math.round(next * 10) / 10);
    });
  };

  const handleDirectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val) || val <= 0) {
      setQuantity(0);
    } else {
      setQuantity(val);
    }
  };

  // Macro calculation for live readout
  const nutritionMultiplier = resolvedWeightGrams / 100;
  const liveCalories = Math.round(food.calories * nutritionMultiplier);
  const liveProtein = Math.round(food.protein * nutritionMultiplier * 10) / 10;
  const liveCarbs = Math.round(food.carbohydrates * nutritionMultiplier * 10) / 10;
  const liveFat = Math.round(food.fat * nutritionMultiplier * 10) / 10;

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* 1. SERVING CHIPS / PILLS */}
      {availableServings.length > 1 && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
            Select Serving Option
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {availableServings.map((serving) => {
              const isSelected = selectedServing.id === serving.id;
              const pillLabel = getServingChipLabel(serving);

              return (
                <button
                  key={serving.id}
                  type="button"
                  onClick={() => handleSelectServing(serving)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]'
                      : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span>{pillLabel}</span>
                  {serving.unitType !== 'WEIGHT' && (
                    <span className={`text-[10px] font-mono opacity-80 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                      ({serving.weightGrams}g)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. QUANTITY INPUT & STEPPER */}
      <div className="bg-card border border-border rounded-2xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>Portion Amount</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {selectedServing.unitType || 'WEIGHT'}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              Adjust quantity in {selectedServing.unitLabel || 'g'}
            </div>
          </div>

          {/* Stepper + Input */}
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              className="w-8 h-8 rounded-lg bg-card hover:bg-background text-foreground flex items-center justify-center border border-border shadow-2xs active:scale-90 transition-all"
              title="Decrease quantity"
            >
              <Minus size={14} />
            </button>

            <div className="flex items-center gap-1 px-1 min-w-[4.5rem] justify-center">
              <input
                type="number"
                min="0.1"
                step={step}
                value={quantity === 0 ? '' : quantity}
                onChange={handleDirectInputChange}
                onBlur={() => {
                  if (quantity <= 0) setQuantity(1);
                }}
                className="w-16 h-8 text-center text-sm font-bold font-mono text-foreground bg-transparent outline-none focus:bg-background focus:ring-1 focus:ring-primary rounded"
              />
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                {selectedServing.unitLabel || 'g'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStep(1)}
              className="w-8 h-8 rounded-lg bg-card hover:bg-background text-foreground flex items-center justify-center border border-border shadow-2xs active:scale-90 transition-all"
              title="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* 3. MASS EQUIVALENCY & MACRO PREVIEW */}
        <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
            <Scale size={13} className="text-primary shrink-0" />
            <span>≈ <strong className="text-foreground font-bold">{resolvedWeightGrams}g</strong> mass</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-foreground">{liveCalories} <span className="text-[10px] text-muted-foreground font-normal">kcal</span></span>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold" style={{ color: MACRO_COLORS.protein }}>{liveProtein}g P</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold" style={{ color: MACRO_COLORS.carbs }}>{liveCarbs}g C</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold" style={{ color: MACRO_COLORS.fat }}>{liveFat}g F</span>
          </div>
        </div>
      </div>
    </div>
  );
};
