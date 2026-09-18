'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  DailyTrackerResponse, 
  UserProfile 
} from '@/services/api';
import { 
  Sidebar,
  Navbar,
  AuthGuard,
  TrackerOverviewCard,
  MealSectionCard,
  MealTypeKey,
  WaterTrackerSection
} from '@/components';
import { 
  UtensilsCrossed, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Loader2,
  Sun,
  SunMedium,
  Cookie,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function formatDisplayDate(dateStr: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    if (dateStr === tomorrow) return 'Tomorrow';

    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function TrackerPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [trackerData, setTrackerData] = useState<DailyTrackerResponse | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const changeDateBy = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleJumpToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
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

  const breakfastCalories = morningLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const lunchCalories = afternoonLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const snackCalories = eveningLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const dinnerCalories = dinnerLogs.reduce((sum, l) => sum + (l.calories || 0), 0);

  const waterTotalMl = trackerData?.water?.totalMl || 0;
  const waterLogs = trackerData?.water?.logs || [];

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ========================================================= */}
            {/* LEFT COLUMN: Total Overview Card */}
            {/* ========================================================= */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
              <TrackerOverviewCard
                summary={summary}
                targets={targets}
                waterTotalMl={waterTotalMl}
              />
            </div>

            {/* ========================================================= */}
            {/* RIGHT COLUMN: Date Toggle + 4 Meal Summary Cards + Detail Logs */}
            {/* ========================================================= */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Header & Date Toggle Navigator */}
              <div className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                    <span>Daily Meal Logs</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {formatDisplayDate(selectedDate)}
                    <span className="text-xs sm:text-sm font-normal text-slate-500 ml-2 font-mono">
                      ({selectedDate})
                    </span>
                  </h1>
                </div>

                {/* Date Navigation Bar */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl self-start sm:self-auto">
                  <Button
                    onClick={() => changeDateBy(-1)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-2xs"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-slate-800 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedDate}</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>

                  <Button
                    onClick={() => changeDateBy(1)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-2xs"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {!isToday && (
                    <Button
                      onClick={handleJumpToday}
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-bold rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 ml-1"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Today
                    </Button>
                  )}
                </div>
              </div>

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating tracker entries...</span>
                </div>
              )}

              {/* 4 Meal Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Breakfast Card */}
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Morning</span>
                    <h3 className="text-base font-bold text-slate-900">Breakfast</h3>
                    <p className="text-lg font-extrabold text-amber-700 mt-0.5">
                      {Math.round(breakfastCalories)} <span className="text-xs font-normal text-slate-500">kcal</span>
                    </p>
                    <p className="text-[11px] text-slate-400">{morningLogs.length} {morningLogs.length === 1 ? 'item' : 'items'} logged</p>
                  </div>
                </div>

                {/* 2. Lunch Card */}
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <SunMedium className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Afternoon</span>
                    <h3 className="text-base font-bold text-slate-900">Lunch</h3>
                    <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                      {Math.round(lunchCalories)} <span className="text-xs font-normal text-slate-500">kcal</span>
                    </p>
                    <p className="text-[11px] text-slate-400">{afternoonLogs.length} {afternoonLogs.length === 1 ? 'item' : 'items'} logged</p>
                  </div>
                </div>

                {/* 3. Snacks Card */}
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                    <Cookie className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Evening</span>
                    <h3 className="text-base font-bold text-slate-900">Snacks</h3>
                    <p className="text-lg font-extrabold text-orange-700 mt-0.5">
                      {Math.round(snackCalories)} <span className="text-xs font-normal text-slate-500">kcal</span>
                    </p>
                    <p className="text-[11px] text-slate-400">{eveningLogs.length} {eveningLogs.length === 1 ? 'item' : 'items'} logged</p>
                  </div>
                </div>

                {/* 4. Dinner Card */}
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Night</span>
                    <h3 className="text-base font-bold text-slate-900">Dinner</h3>
                    <p className="text-lg font-extrabold text-indigo-700 mt-0.5">
                      {Math.round(dinnerCalories)} <span className="text-xs font-normal text-slate-500">kcal</span>
                    </p>
                    <p className="text-[11px] text-slate-400">{dinnerLogs.length} {dinnerLogs.length === 1 ? 'item' : 'items'} logged</p>
                  </div>
                </div>
              </div>

              {/* Stacked Meal Sections */}
              <div className="space-y-4">
                {/* 1. Morning (Breakfast) */}
                <MealSectionCard
                  mealType="BREAKFAST"
                  logs={morningLogs}
                  onAddMealClick={() => {}}
                  onLogDeleted={loadData}
                />

                {/* 2. Afternoon (Lunch) */}
                <MealSectionCard
                  mealType="LUNCH"
                  logs={afternoonLogs}
                  onAddMealClick={() => {}}
                  onLogDeleted={loadData}
                />

                {/* 3. Evening (Snack) */}
                <MealSectionCard
                  mealType="SNACK"
                  logs={eveningLogs}
                  onAddMealClick={() => {}}
                  onLogDeleted={loadData}
                />

                {/* 4. Dinner */}
                <MealSectionCard
                  mealType="DINNER"
                  logs={dinnerLogs}
                  onAddMealClick={() => {}}
                  onLogDeleted={loadData}
                />
              </div>

              {/* Water Adding & Tracking Section Beneath Meal Logs */}
              <WaterTrackerSection
                selectedDate={selectedDate}
                waterLogs={waterLogs}
                waterTotalMl={waterTotalMl}
                targetMl={targets.water}
                onWaterUpdated={loadData}
              />
            </div>

          </div>
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
