'use client';

import React, { useState } from 'react';
import { MealLogItem, ApiService } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Plus, 
  Trash2, 
  Loader2, 
  UtensilsCrossed, 
  Clock 
} from 'lucide-react';
import { MACRO_COLORS } from '@/lib/constants';

export type MealTypeKey = 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER';

interface MealConfig {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
}

const MEAL_CONFIGS: Record<MealTypeKey, MealConfig> = {
  BREAKFAST: {
    title: 'Morning',
    subtitle: 'Breakfast & Early Fuel',
    icon: Sunrise,
    accentColor: 'text-amber-600',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700 border-amber-200',
    borderAccent: 'hover:border-amber-200',
  },
  LUNCH: {
    title: 'Afternoon',
    subtitle: 'Lunch & Midday Energy',
    icon: Sun,
    accentColor: 'text-orange-600',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700 border-orange-200',
    borderAccent: 'hover:border-orange-200',
  },
  SNACK: {
    title: 'Evening',
    subtitle: 'Snacks, Pre/Post Workout',
    icon: Sunset,
    accentColor: 'text-purple-600',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700 border-purple-200',
    borderAccent: 'hover:border-purple-200',
  },
  DINNER: {
    title: 'Dinner',
    subtitle: 'Night Meal & Recovery',
    icon: Moon,
    accentColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700 border-indigo-200',
    borderAccent: 'hover:border-indigo-200',
  },
};

interface MealSectionCardProps {
  mealType: MealTypeKey;
  logs: MealLogItem[];
  onAddMealClick: (mealType: MealTypeKey) => void;
  onLogDeleted: () => void;
}

export function MealSectionCard({
  mealType,
  logs,
  onAddMealClick,
  onLogDeleted,
}: MealSectionCardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const config = MEAL_CONFIGS[mealType] || MEAL_CONFIGS.BREAKFAST;
  const Icon = config.icon;

  // Calculate meal totals
  const totalCalories = logs.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = logs.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalCarbs = logs.reduce((sum, item) => sum + (item.carbohydrates || 0), 0);
  const totalFat = logs.reduce((sum, item) => sum + (item.fat || 0), 0);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await ApiService.deleteLog(id);
      onLogDeleted();
    } catch (err) {
      console.error('Failed to delete meal log:', err);
      alert('Could not delete meal log. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className={`border border-border shadow-xs bg-card text-card-foreground overflow-hidden rounded-2xl transition-all ${config.borderAccent}`}>
      {/* Meal Header */}
      <CardHeader className="p-3.5 sm:px-5 sm:pt-4 sm:pb-3 border-b border-border bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center shadow-2xs shrink-0 ${config.accentColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-foreground leading-none">
                  {config.title}
                </CardTitle>
                <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 ${config.badgeBg} ${config.badgeText}`}>
                  {logs.length} {logs.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{config.subtitle}</p>
            </div>
          </div>

          {/* Subtotal Macro Badges */}
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-mono bg-card px-2.5 sm:px-3 py-1.5 rounded-xl border border-border shadow-2xs self-start sm:self-auto">
            <div className="flex items-center gap-1 font-bold text-foreground">
              <span className="text-primary">{Math.round(totalCalories)}</span>
              <span className="text-[10px] text-muted-foreground font-sans font-normal">kcal</span>
            </div>
            <span className="text-muted-foreground/40">|</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-bold" style={{ color: MACRO_COLORS.protein }}>{Math.round(totalProtein)}g P</span>
              <span className="font-bold" style={{ color: MACRO_COLORS.carbs }}>{Math.round(totalCarbs)}g C</span>
              <span className="font-bold" style={{ color: MACRO_COLORS.fat }}>{Math.round(totalFat)}g F</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-3">
        {/* Logged Items List */}
        {logs.length > 0 ? (
          <div className="flex flex-col gap-2">
            {logs.map((item) => {
              const isDeleting = deletingId === item.id;
              const displayServing = !item.unitLabel || item.unitLabel.toLowerCase() === 'g' || item.unitLabel.toLowerCase() === 'grams'
                ? `${Math.round(item.weightGrams)}g`
                : `${item.unitLabel} (${Math.round(item.weightGrams)}g)`;

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/80 hover:border-primary/40 transition-colors shadow-2xs"
                >
                  {/* Top Row: Food Name & Weight on left, Calories & Delete on right */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                          {item.food?.name || 'Unknown Food Item'}
                        </span>
                        {item.food?.layer === 2 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                            Recipe
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                        {displayServing} · {item.servings} serving{item.servings !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-bold font-mono text-xs text-foreground bg-background px-2 py-0.5 rounded-lg border border-border/70 shadow-2xs">
                        {Math.round(item.calories)}{' '}
                        <span className="text-[10px] font-normal text-muted-foreground font-sans">
                          kcal
                        </span>
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        title="Delete food entry"
                        aria-label={`Delete ${item.food?.name || 'entry'}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-colors"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
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
                      P: {Math.round(item.protein)}g
                    </span>
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${MACRO_COLORS.carbs}18`,
                        color: MACRO_COLORS.carbs,
                      }}
                    >
                      C: {Math.round(item.carbohydrates)}g
                    </span>
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${MACRO_COLORS.fat}18`,
                        color: MACRO_COLORS.fat,
                      }}
                    >
                      F: {Math.round(item.fat)}g
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-3.5 px-3 rounded-xl border border-dashed border-border/80 text-center bg-muted/10">
            <UtensilsCrossed className="w-5 h-5 mx-auto text-muted-foreground/50 stroke-1 mb-1" />
            <p className="text-xs font-medium text-muted-foreground">No food logged for {config.title.toLowerCase()} yet</p>
          </div>
        )}

        {/* Prominent Centered Add Meal Button */}
        <div className="pt-0.5 flex justify-center">
          <Button
            onClick={() => onAddMealClick(mealType)}
            variant="outline"
            className="w-full sm:w-auto min-w-[200px] px-5 py-2 h-9 rounded-xl border-dashed border-border hover:border-primary bg-card hover:bg-primary/10 text-foreground hover:text-primary font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 group"
          >
            <div className="w-5 h-5 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
            </div>
            <span>Add {config.title} Meal</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
