'use client';

import React from 'react';
import { MealLogItem, ApiService } from '@/services/api';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MACRO_COLORS } from '@/lib/constants';

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
    <div className="flex flex-col gap-4">
      {MEAL_TYPES.map(({ key, label, icon }) => {
        const mealLogs = logs.filter((log) => log.mealType === key);
        const mealCalories = mealLogs.reduce((sum, item) => sum + item.calories, 0);

        return (
          <Card key={key} className="border border-[var(--border)] bg-[var(--surface-2)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <CardTitle className="text-sm text-[var(--text-primary)]">{label}</CardTitle>
                </div>
                <Badge variant="outline" className="font-mono normal-case tracking-normal bg-[var(--surface-3)] border-[var(--border)] text-[var(--accent)] font-semibold">
                  {Math.round(mealCalories)} kcal
                </Badge>
              </div>
            </CardHeader>

            <Separator className="bg-[var(--border)]" />

            <CardContent className="pt-3">
              {mealLogs.length === 0 ? (
                <p className="text-[var(--text-muted)] text-xs italic py-1">
                  No food logged for {label.toLowerCase()} yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {mealLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex justify-between items-center bg-[var(--surface-3)] border border-[var(--border)] p-3 rounded-lg hover:border-[var(--accent-border)] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-[var(--text-primary)]">
                            {log.food.name}
                          </span>
                          <Badge variant="outline" className="normal-case tracking-normal font-mono bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]">
                            {log.food.source}
                          </Badge>
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)] mt-1">
                          {log.weightGrams}g ({log.servings} serving{log.servings !== 1 ? 's' : ''})
                          {' '}• <span className="font-semibold" style={{ color: MACRO_COLORS.protein }}>P: {log.protein}g</span> | <span className="font-semibold" style={{ color: MACRO_COLORS.carbs }}>C: {log.carbohydrates}g</span> | <span className="font-semibold" style={{ color: MACRO_COLORS.fat }}>F: {log.fat}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold font-mono text-xs text-[var(--text-primary)]">
                          {log.calories} kcal
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(log.id)}
                          title="Delete log"
                          className="text-[var(--text-muted)] hover:text-red-400 hover:bg-red-950/20"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
