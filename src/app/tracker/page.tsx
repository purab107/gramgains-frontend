'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  DailyTrackerResponse, 
  UserProfile,
  DashboardSummaryResponse,
  MealLogItem
} from '@/services/api';
import { 
  Sidebar,
  Navbar,
  AuthGuard,
  TodayOverviewCards,
  MealSectionCard,
  WaterTrackerSection,
  AddFoodSheet,
  type MealTypeKey
} from '@/components';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevSkip } from '@/components/dev-skip';
import { isDevSkip } from '@/lib/dev-skip';
import { 
  getLocalDateString, 
  addDaysToDateString, 
  formatDisplayDate,
  formatDMY,
} from '@/lib/date-utils';

function TrackerPage() {
  const devSkip = useDevSkip();
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [trackerData, setTrackerData] = useState<DailyTrackerResponse | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealTypeKey>('BREAKFAST');
  const [editingLog, setEditingLog] = useState<MealLogItem | null>(null);

  const handleOpenAddFood = (type: MealTypeKey) => {
    setEditingLog(null);
    setActiveMealType(type);
    setIsAddFoodOpen(true);
  };

  const handleEditMeal = (log: MealLogItem) => {
    setEditingLog(log);
    setActiveMealType(log.mealType);
    setIsAddFoodOpen(true);
  };

  // React to DevSkip Modal Triggers
  useEffect(() => {
    if (!devSkip.activeModalTrigger) return;
    if (devSkip.activeModalTrigger === 'food') {
      setIsAddFoodOpen(true);
      devSkip.triggerModal(null);
    }
  }, [devSkip.activeModalTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, profile] = await Promise.all([
        ApiService.getDailyLogs(selectedDate),
        ApiService.getProfile().catch(() => null),
      ]);
      setTrackerData(data);
      if (profile) setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // React to DevSkip Stage or Override changes
  useEffect(() => {
    if (!isDevSkip()) return;
    loadData();
  }, [devSkip.activeStageId, devSkip.activeOverrides]);

  const todayStr = getLocalDateString();
  const isToday = selectedDate >= todayStr;

  const changeDateBy = (days: number) => {
    const nextDate = addDaysToDateString(selectedDate, days);
    if (nextDate > todayStr) return;
    setSelectedDate(nextDate);
  };

  const summary = trackerData?.summary || {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
  };

  const targets = {
    calories: userProfile?.targetCalories ?? 2200,
    protein: userProfile?.targetProtein ?? 140,
    carbs: userProfile?.targetCarbs ?? 250,
    fat: userProfile?.targetFat ?? 65,
    fiber: userProfile?.targetFiber ?? 30,
    water: 3000,
  };

  const logs = trackerData?.logs || [];
  const morningLogs = logs.filter((l) => l.mealType === 'BREAKFAST');
  const afternoonLogs = logs.filter((l) => l.mealType === 'LUNCH');
  const eveningLogs = logs.filter((l) => l.mealType === 'SNACK');
  const dinnerLogs = logs.filter((l) => l.mealType === 'DINNER');

  const getMealMacros = (mealLogs: typeof logs) =>
    mealLogs.reduce(
      (acc, l) => ({
        protein: acc.protein + (l.protein || 0),
        carbs: acc.carbs + (l.carbohydrates || 0),
        fat: acc.fat + (l.fat || 0),
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

  const waterTotalMl = trackerData?.water?.totalMl || 0;
  const waterLogs = trackerData?.water?.logs || [];

  const dashSummary: DashboardSummaryResponse = {
    date: selectedDate,
    calories: {
      target: targets.calories,
      consumed: summary.calories,
      remaining: Math.max(0, targets.calories - summary.calories),
      percentageDone: targets.calories > 0 ? Math.min(100, Math.round((summary.calories / targets.calories) * 100)) : 0,
    },
    macros: {
      protein: { consumed: summary.protein, target: targets.protein, unit: 'g' },
      carbohydrates: { consumed: summary.carbohydrates, target: targets.carbs, unit: 'g' },
      fat: { consumed: summary.fat, target: targets.fat, unit: 'g' },
      fiber: { consumed: summary.fiber, target: targets.fiber, unit: 'g' },
    },
    water: {
      consumed: waterTotalMl,
      target: targets.water,
      unit: 'ml',
      percentageDone: targets.water > 0 ? Math.min(100, Math.round((waterTotalMl / targets.water) * 100)) : 0,
    },
    totalMealsLogged: logs.length,
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
          onOpenLogModal={() => handleOpenAddFood('BREAKFAST')}
        />

        <main className="flex-1 p-4 pb-24 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Top Control Bar: Date Navigation & Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                {formatDisplayDate(selectedDate)}
              </h2>
              <span className="text-xs font-normal text-muted-foreground font-mono">
                ({formatDMY(selectedDate)})
              </span>
            </div>

            {/* Date Navigation Bar */}
            <div className="inline-flex items-center gap-1 bg-muted/40 border border-border/80 p-1 rounded-xl shadow-xs">
              <Button
                onClick={() => changeDateBy(-1)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="relative flex items-center justify-center gap-2 px-3 h-8 bg-card rounded-lg border border-border shadow-xs cursor-pointer select-none">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-mono font-bold tracking-wider text-foreground">
                  {formatDMY(selectedDate)}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    setSelectedDate(val > todayStr ? todayStr : val);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              <Button
                onClick={() => changeDateBy(1)}
                variant="ghost"
                size="sm"
                disabled={isToday}
                className="h-8 w-8 p-0 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                title={isToday ? 'Cannot navigate to future dates' : 'Next Day'}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Updating tracker entries...</span>
            </div>
          )}

          {/* Modern Overview Cards (Today's Calories + Protein, Carbs, Fats, Water) — Identical to Home */}
          <TodayOverviewCards
            summary={dashSummary}
            userProfile={userProfile}
            waterTotalMl={waterTotalMl}
            targetWaterMl={targets.water}
          />

          {/* Full-Width Stacked Meal Section Cards */}
          <div className="space-y-4">
            <MealSectionCard
              mealType="BREAKFAST"
              logs={morningLogs}
              onAddMealClick={handleOpenAddFood}
              onEditMealClick={handleEditMeal}
              onLogDeleted={loadData}
            />

            <MealSectionCard
              mealType="LUNCH"
              logs={afternoonLogs}
              onAddMealClick={handleOpenAddFood}
              onEditMealClick={handleEditMeal}
              onLogDeleted={loadData}
            />

            <MealSectionCard
              mealType="SNACK"
              logs={eveningLogs}
              onAddMealClick={handleOpenAddFood}
              onEditMealClick={handleEditMeal}
              onLogDeleted={loadData}
            />

            <MealSectionCard
              mealType="DINNER"
              logs={dinnerLogs}
              onAddMealClick={handleOpenAddFood}
              onEditMealClick={handleEditMeal}
              onLogDeleted={loadData}
            />
          </div>

          {/* Water Tracking Section */}
          <WaterTrackerSection
            selectedDate={selectedDate}
            waterLogs={waterLogs}
            waterTotalMl={waterTotalMl}
            targetMl={targets.water}
            onWaterUpdated={loadData}
          />

          {/* Right-Side Search & Add Food Panel */}
          <AddFoodSheet
            open={isAddFoodOpen}
            onOpenChange={(open) => {
              setIsAddFoodOpen(open);
              if (!open) setEditingLog(null);
            }}
            selectedDate={selectedDate}
            mealType={activeMealType}
            onMealTypeChange={setActiveMealType}
            onFoodLogged={loadData}
            editingLog={editingLog}
          />


        </main>
      </div>
    </div>
  );
}

export default function TrackerPageGuarded() {
  return (
    <AuthGuard>
      <TrackerPage />
    </AuthGuard>
  );
}
