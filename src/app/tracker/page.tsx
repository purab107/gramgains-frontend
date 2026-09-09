'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  MealLogItem, 
  DailyTrackerResponse, 
  UserProfile 
} from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { MealLoggerModal } from '../../components/MealLoggerModal';
import { DailyTimeline } from '../../components/DailyTimeline';
import { MacroCard } from '../../components/MacroCard';
import { 
  UtensilsCrossed, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  Flame
} from 'lucide-react';

export default function TrackerPage() {
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
    <div className="flex min-h-screen bg-[#F7F9F8] text-[#171C1B]">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-[#F7F9F8]">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
          onOpenLogModal={() => setIsLogModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E1E7E5] p-6 rounded-xl shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0A7C6E] uppercase tracking-wider mb-1">
                <UtensilsCrossed className="w-4 h-4 text-[#0A7C6E]" />
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
            <div className="flex items-center gap-2 bg-[#F7F9F8] border border-[#E1E7E5] p-1.5 rounded-lg">
              <button
                onClick={() => changeDateBy(-1)}
                className="p-1.5 rounded bg-white hover:bg-[#E6F3F1] border border-[#E1E7E5] text-[#171C1B] transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2 text-xs font-mono font-semibold text-[#171C1B]">
                <Calendar className="w-4 h-4 text-[#0A7C6E]" />
                <span>{selectedDate}</span>
              </div>

              <button
                onClick={() => changeDateBy(1)}
                className="p-1.5 rounded bg-white hover:bg-[#E6F3F1] border border-[#E1E7E5] text-[#171C1B] transition-colors"
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
            />
            <MacroCard
              label="PROTEIN"
              value={Math.round(summary.protein)}
              unit="g"
              target={targetProtein}
            />
            <MacroCard
              label="CARBS"
              value={Math.round(summary.carbohydrates)}
              unit="g"
              target={targetCarbs}
            />
            <MacroCard
              label="FAT"
              value={Math.round(summary.fat)}
              unit="g"
              target={targetFat}
            />
          </div>

          {/* Quick Search CTA & Timeline */}
          <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E1E7E5] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#E6F3F1] text-[#075E54] border border-[#B8E2DC]">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#171C1B] text-sm">Quick Search Food Database</h3>
                <p className="text-xs text-[#68716F]">Search raw ingredients, prepared Indian dishes, or custom items.</p>
              </div>
            </div>

            <button
              onClick={() => setIsLogModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#0A7C6E] hover:bg-[#075E54] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-[#0A7C6E]"
            >
              <Plus className="w-4 h-4" />
              <span>Search & Add Food</span>
            </button>
          </div>

          {/* Meals Timeline */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#171C1B] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#0A7C6E]" />
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
