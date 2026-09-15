'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  MealLogItem, 
  DailyTrackerResponse, 
  UserProfile 
} from '../../services/api';
import { 
  Sidebar,
  Navbar,
  AuthGuard,
  MealLoggerModal,
  DailyTimeline,
  MacroCard
} from '@/components';
import { 
  UtensilsCrossed, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  Flame
} from 'lucide-react';

function TrackerPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [trackerData, setTrackerData] = useState<DailyTrackerResponse | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

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

  const changeDateBy = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const summary = trackerData?.summary || {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
  };

  const targetCals = userProfile?.targetCalories ?? 2200;
  const targetProtein = userProfile?.targetProtein ?? 140;
  const targetCarbs = userProfile?.targetCarbs ?? 250;
  const targetFat = userProfile?.targetFat ?? 65;

  return (
    <div className="flex min-h-screen bg-[#fcfdfe] text-[#171C1B]">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-[#fcfdfe]">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
          onOpenLogModal={() => setIsLogModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fefeff] border border-[#e5e7eb] p-6 rounded-xl shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0f8651] uppercase tracking-wider mb-1">
                <UtensilsCrossed className="w-4 h-4 text-[#0f8651]" />
                <span>Daily Meal Logger</span>
              </div>
              <h1 className="text-2xl font-bold text-[#171C1B] tracking-tight">
                Log Your Meals & Track Macros
              </h1>
              <p className="text-xs text-[#68716F] mt-1">
                Search Indian food database (IFCT 2017 & INDB recipes) and log custom portions.
              </p>
            </div>

            {/* Date Navigator Bar */}
            <div className="flex items-center gap-2 bg-[#fcfdfe] border border-[#e5e7eb] p-1.5 rounded-lg">
              <button
                onClick={() => changeDateBy(-1)}
                className="p-1.5 rounded bg-white hover:bg-[#e4f7ee] border border-[#e5e7eb] text-[#171C1B] transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2 text-xs font-mono font-semibold text-[#171C1B]">
                <Calendar className="w-4 h-4 text-[#0f8651]" />
                <span>{selectedDate}</span>
              </div>

              <button
                onClick={() => changeDateBy(1)}
                className="p-1.5 rounded bg-white hover:bg-[#e4f7ee] border border-[#e5e7eb] text-[#171C1B] transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Target Macro Bars */}
          <div className="grid-macros">
            <MacroCard
              label="TOTAL CALORIES"
              value={Math.round(summary.calories)}
              unit="kcal"
              target={targetCals}
              color="#0f8651"
            />
            <MacroCard
              label="PROTEIN"
              value={Math.round(summary.protein)}
              unit="g"
              target={targetProtein}
              color="#2873e5"
            />
            <MacroCard
              label="CARBS"
              value={Math.round(summary.carbohydrates)}
              unit="g"
              target={targetCarbs}
              color="#f15359"
            />
            <MacroCard
              label="FAT"
              value={Math.round(summary.fat)}
              unit="g"
              target={targetFat}
              color="#feb111"
            />
          </div>

          {/* Quick Search CTA & Timeline */}
          <div className="bg-[#fefeff] p-5 rounded-xl border border-[#e5e7eb] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#e4f7ee] text-[#0d7649] border border-[#e5e7eb]">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#171C1B] text-sm">Quick Search Food Database</h3>
                <p className="text-xs text-[#68716F]">Search raw ingredients, prepared Indian dishes, or custom items.</p>
              </div>
            </div>

            <button
              onClick={() => setIsLogModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#0f8651] hover:bg-[#0d7649] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-[#0f8651]"
            >
              <Plus className="w-4 h-4" />
              <span>Search & Add Food</span>
            </button>
          </div>

          {/* Meals Timeline */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#171C1B] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#0f8651]" />
              <span>Meals Logged for {selectedDate}</span>
            </h2>
            <DailyTimeline logs={trackerData?.logs || []} onLogDeleted={loadData} />
          </div>
        </main>
      </div>

      <MealLoggerModal
        date={selectedDate}
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onLogged={loadData}
      />
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
