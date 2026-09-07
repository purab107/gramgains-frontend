'use client';

import React from 'react';
import { MealLogItem, ApiService } from '../services/api';
import { Trash2, Utensils } from 'lucide-react';

interface DailyTimelineProps {
  logs: MealLogItem[];
  onLogDeleted: () => void;
}

const MEAL_TYPES = [
  { key: 'BREAKFAST', label: 'Breakfast', icon: '🍳' },
  { key: 'LUNCH', label: 'Lunch', icon: '🍲' },
  { key: 'DINNER', label: 'Dinner', icon: '🍽️' },
  { key: 'SNACK', label: 'Snacks & Extras', icon: '🍎' },
];

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ logs, onLogDeleted }) => {
  const handleDelete = async (id: string) => {
    try {
      await ApiService.deleteLog(id);
      onLogDeleted();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {MEAL_TYPES.map(({ key, label, icon }) => {
        const mealLogs = logs.filter((log) => log.mealType === key);
        const mealCalories = mealLogs.reduce((sum, item) => sum + item.calories, 0);

        return (
          <div key={key} className="glass-panel" style={{ padding: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifySpace: 'between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.6rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{label}</h3>
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {Math.round(mealCalories)} kcal
              </span>
            </div>

            {mealLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '0.4rem 0' }}>
                No food logged for {label.toLowerCase()} yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {mealLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{log.food.name}</span>
                        <span className={log.food.layer === 1 ? 'badge badge-layer1' : 'badge badge-layer2'}>
                          {log.food.source}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {log.weightGrams}g ({log.servings} serving{log.servings !== 1 ? 's' : ''}) • P: {log.protein}g | C: {log.carbohydrates}g | F: {log.fat}g
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-orange)', fontSize: '0.95rem' }}>
                        {log.calories} kcal
                      </span>
                      <button onClick={() => handleDelete(log.id)} className="btn-icon" title="Delete log">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
