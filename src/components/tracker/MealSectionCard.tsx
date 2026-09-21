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
    <Card className={`border border-border shadow-sm bg-card text-card-foreground overflow-hidden rounded-2xl transition-all ${config.borderAccent}`}>
      {/* Meal Header */}
      <CardHeader className="pb-3 border-b border-border bg-muted/30 px-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-card border border-border shadow-sm ${config.accentColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground leading-none">
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
          <div className="flex items-center gap-2 text-xs font-mono bg-card px-3 py-1.5 rounded-xl border border-border shadow-2xs self-start sm:self-auto">
            <div className="flex items-center gap-1 font-bold text-foreground">
              <span className="text-primary">{Math.round(totalCalories)}</span>
              <span className="text-[10px] text-muted-foreground font-sans font-normal">kcal</span>
            </div>
            <span className="text-muted-foreground/60">|</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-bold" style={{ color: MACRO_COLORS.protein }}>{Math.round(totalProtein)}g P</span>
              <span className="font-bold" style={{ color: MACRO_COLORS.carbs }}>{Math.round(totalCarbs)}g C</span>
              <span className="font-bold" style={{ color: MACRO_COLORS.fat }}>{Math.round(totalFat)}g F</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Logged Items List */}
        {logs.length > 0 ? (
          <div className="divide-y divide-border rounded-xl border border-border bg-muted/20 overflow-hidden">
            {logs.map((item) => {
              const isDeleting = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground truncate">
                        {item.food?.name || 'Unknown Food Item'}
                      </span>
                      {item.food?.layer === 2 ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                          Recipe
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground font-mono">
                      <span className="font-semibold text-foreground">
                        {item.unitLabel
                          ? `${item.unitLabel} (${Math.round(item.weightGrams)}g)`
                          : `${Math.round(item.weightGrams)}g`}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-foreground">{Math.round(item.calories)} kcal</span>
                      <span>•</span>
                      <span className="font-medium" style={{ color: MACRO_COLORS.protein }}>P: {item.protein}g</span>
                      <span className="font-medium" style={{ color: MACRO_COLORS.carbs }}>C: {item.carbohydrates}g</span>
                      <span className="font-medium" style={{ color: MACRO_COLORS.fat }}>F: {item.fat}g</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                      title="Delete food entry"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-80 group-hover:opacity-100 active:scale-95"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 px-3 rounded-xl border border-dashed border-border text-center bg-muted/20">
            <UtensilsCrossed className="w-6 h-6 mx-auto text-muted-foreground/60 stroke-1 mb-1" />
            <p className="text-xs font-medium text-muted-foreground">No food logged for {config.title.toLowerCase()} yet</p>
          </div>
        )}

        {/* Prominent Centered Add Meal Button */}
        <div className="pt-1 flex justify-center">
          <Button
            onClick={() => onAddMealClick(mealType)}
            variant="outline"
            className="w-full sm:w-auto min-w-[220px] px-6 py-2 h-9 rounded-xl border-dashed border-border hover:border-primary bg-card hover:bg-primary/10 text-foreground hover:text-primary font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 group"
          >
            <div className="w-5 h-5 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
            </div>
            <span>+ Add {config.title} Meal</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
