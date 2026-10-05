'use client';

import React from 'react';
import { MealLogItem, ApiService } from '@/services/api';
import { Trash2, Plus, Sunrise, Sun, Moon, Sunset } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MACRO_COLORS } from '@/lib/constants';

interface DailyTimelineProps {
  logs: MealLogItem[];
  onLogDeleted: () => void;
  onAddMeal?: (mealType?: string) => void;
}

const MEAL_TYPES = [
  { key: 'BREAKFAST', label: 'Breakfast',       Icon: Sunrise },
  { key: 'LUNCH',     label: 'Lunch',           Icon: Sun     },
  { key: 'DINNER',    label: 'Dinner',          Icon: Moon    },
  { key: 'SNACK',     label: 'Snacks & Extras', Icon: Sunset  },
];

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ logs, onLogDeleted, onAddMeal }) => {
  const handleDelete = async (id: string) => {
    try {
      await ApiService.deleteLog(id);
      onLogDeleted();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {MEAL_TYPES.map(({ key, label, Icon }) => {
        const mealLogs = logs.filter((log) => log.mealType === key);
        const mealCalories = mealLogs.reduce((sum, item) => sum + item.calories, 0);
        const hasLogs = mealLogs.length > 0;

        return (
          <Card
            key={key}
            className="border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl bg-card overflow-hidden transition-all duration-200"
          >
            {/* Meal Category Header */}
            <div className="p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-muted-foreground">
                  <Icon className="w-4 h-4" />
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-foreground">
                    {label}
                  </h3>
                  {hasLogs && (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {mealLogs.length} {mealLogs.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasLogs ? (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {Math.round(mealCalories)} kcal
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-muted-foreground/60">
                    0 kcal
                  </span>
                )}

                {onAddMeal && (
                  <button
                    onClick={() => onAddMeal(key)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-95 transition-colors"
                    title={`Log food for ${label}`}
                    aria-label={`Log food for ${label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Meal Content / Food items */}
            <CardContent className="px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
              {!hasLogs ? (
                <div className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-900/30 border border-dashed border-slate-200/70 dark:border-slate-800/70 text-[11px] text-muted-foreground/70">
                  <span>Nothing logged yet</span>
                  {onAddMeal && (
                    <button
                      onClick={() => onAddMeal(key)}
                      className="text-primary hover:underline font-semibold text-[11px] flex items-center gap-0.5"
                    >
                      <span>+ Add</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {mealLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/80 hover:border-primary/40 transition-colors shadow-2xs"
                    >
                      {/* Top Row: Food Name & Weight on left, Calories & Delete on right */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs sm:text-sm text-foreground block truncate">
                            {log.food.name}
                          </span>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {Math.round(log.weightGrams)}g · {log.servings} serving{log.servings !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold font-mono text-xs text-foreground bg-background px-2 py-0.5 rounded-lg border border-border/70 shadow-2xs">
                            {Math.round(log.calories)}{' '}
                            <span className="text-[10px] font-normal text-muted-foreground">
                              kcal
                            </span>
                          </span>
                          <button
                            onClick={() => handleDelete(log.id)}
                            title="Delete log"
                            aria-label={`Delete ${log.food.name}`}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Color-coded Macro Pills */}
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${MACRO_COLORS.protein}18`,
                            color: MACRO_COLORS.protein,
                          }}
                        >
                          P: {Math.round(log.protein)}g
                        </span>
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${MACRO_COLORS.carbs}18`,
                            color: MACRO_COLORS.carbs,
                          }}
                        >
                          C: {Math.round(log.carbohydrates)}g
                        </span>
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${MACRO_COLORS.fat}18`,
                            color: MACRO_COLORS.fat,
                          }}
                        >
                          F: {Math.round(log.fat)}g
                        </span>
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
