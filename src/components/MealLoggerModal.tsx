'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, FoodItem } from '../services/api';
import { Search, X, Plus, Sparkles } from 'lucide-react';

interface MealLoggerModalProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onLogged: () => void;
}

export const MealLoggerModal: React.FC<MealLoggerModalProps> = ({
  date,
  isOpen,
  onClose,
  onLogged,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<number | undefined>(undefined);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('LUNCH');
  const [useCustomWeight, setUseCustomWeight] = useState(false);
  const [servings, setServings] = useState<number>(1);
  const [customWeightGrams, setCustomWeightGrams] = useState<number>(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFoods();
    }
  }, [isOpen, searchQuery, selectedLayer]);

  const fetchFoods = async () => {
    try {
      const data = await ApiService.searchFoods(searchQuery, selectedLayer);
      setFoods(data);
      if (data.length > 0 && !selectedFood) {
        setSelectedFood(data[0]);
        setCustomWeightGrams(data[0].servingWeight);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setCustomWeightGrams(food.servingWeight);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    setLoading(true);
    try {
      await ApiService.logMeal({
        date,
        mealType,
        foodId: selectedFood.id,
        servings: useCustomWeight ? undefined : servings,
        customWeightGrams: useCustomWeight ? customWeightGrams : undefined,
      });
      onLogged();
      onClose();
    } catch (err) {
      console.error('Failed to log meal', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Compute calculated preview values
  const multiplier = selectedFood
    ? useCustomWeight
      ? customWeightGrams / selectedFood.servingWeight
      : servings
    : 1;

  const previewCalories = selectedFood ? Math.round(selectedFood.calories * multiplier) : 0;
  const previewProtein = selectedFood ? Math.round(selectedFood.protein * multiplier * 10) / 10 : 0;
  const previewCarbs = selectedFood ? Math.round(selectedFood.carbohydrates * multiplier * 10) / 10 : 0;
  const previewFat = selectedFood ? Math.round(selectedFood.fat * multiplier * 10) / 10 : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Log Food Entry</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search ingredient or recipe (e.g., Paneer, Dal, Rice)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.4rem', marginBottom: 0 }}
            />
          </div>
        </div>

        {/* Layer Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setSelectedLayer(undefined)}
            style={{
              padding: '0.35rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: selectedLayer === undefined ? 'var(--accent-blue)' : 'transparent',
              color: '#fff',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            All Foods
          </button>
          <button
            onClick={() => setSelectedLayer(1)}
            style={{
              padding: '0.35rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: selectedLayer === 1 ? 'var(--accent-green)' : 'transparent',
              color: '#fff',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Layer 1 (IFCT 2017 Ingredients)
          </button>
          <button
            onClick={() => setSelectedLayer(2)}
            style={{
              padding: '0.35rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: selectedLayer === 2 ? 'var(--accent-purple)' : 'transparent',
              color: '#fff',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Layer 2 (INDB Recipes)
          </button>
        </div>

        {/* Food Results List */}
        <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: '1.2rem', paddingRight: '0.2rem' }}>
          {foods.map((food) => {
            const isSelected = selectedFood?.id === food.id;
            return (
              <div
                key={food.id}
                onClick={() => handleFoodSelect(food)}
                style={{
                  padding: '0.65rem 0.8rem',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid var(--accent-blue)' : '1px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '0.4rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{food.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {food.calories} kcal / {food.servingWeight}{food.servingUnit} • {food.category}
                  </div>
                </div>
                <span className={food.layer === 1 ? 'badge badge-layer1' : 'badge badge-layer2'}>
                  {food.source}
                </span>
              </div>
            );
          })}
        </div>

        {selectedFood && (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Meal Category</label>
                <select
                  value={mealType}
                  onChange={(e: any) => setMealType(e.target.value)}
                  className="select-field"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snack</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Input Mode</label>
                <select
                  value={useCustomWeight ? 'weight' : 'servings'}
                  onChange={(e) => setUseCustomWeight(e.target.value === 'weight')}
                  className="select-field"
                >
                  <option value="servings">Servings ({selectedFood.servingUnit})</option>
                  <option value="weight">Custom Weight (Grams)</option>
                </select>
              </div>
            </div>

            <div>
              {useCustomWeight ? (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weight in Grams</label>
                  <input
                    type="number"
                    value={customWeightGrams}
                    onChange={(e) => setCustomWeightGrams(Math.max(1, Number(e.target.value)))}
                    className="input-field"
                  />
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Number of Servings ({selectedFood.servingUnit})</label>
                  <input
                    type="number"
                    step="0.25"
                    value={servings}
                    onChange={(e) => setServings(Math.max(0.1, Number(e.target.value)))}
                    className="input-field"
                  />
                </div>
              )}
            </div>

            {/* Calculated Macros Preview Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                marginBottom: '1.2rem',
                display: 'flex',
                justifyContent: 'space-around',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calories</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
                  {previewCalories} kcal
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protein</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                  {previewProtein}g
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carbs</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  {previewCarbs}g
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fat</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                  {previewFat}g
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> {loading ? 'Logging...' : 'Add to Daily Tracker'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
