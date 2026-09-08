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
  Sparkles,
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
  const targetFiber = userProfile?.targetFiber ?? 30;

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
          onOpenLogModal={() => setIsLogModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl bg-slate-900/80 border border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Daily Meal Logger</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Log Your Meals & Track Macros
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Search Indian food database (IFCT 2017 & INDB recipes) and log custom portions.
              </p>
            </div>

            {/* Date Navigator Bar */}
            <div className="flex items-center gap-2 bg-slate-950 border border-white/10 p-1.5 rounded-2xl">
              <button
                onClick={() => changeDateBy(-1)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-white">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{selectedDate}</span>
              </div>

              <button
                onClick={() => changeDateBy(1)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
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
              color="#F59E0B"
            />
            <MacroCard
              label="PROTEIN"
              value={Math.round(summary.protein)}
              unit="g"
              target={targetProtein}
              color="#10B981"
            />
            <MacroCard
              label="CARBS"
              value={Math.round(summary.carbohydrates)}
              unit="g"
              target={targetCarbs}
              color="#3B82F6"
            />
            <MacroCard
              label="FAT"
              value={Math.round(summary.fat)}
              unit="g"
              target={targetFat}
              color="#8B5CF6"
            />
          </div>

          {/* Quick Search CTA & Timeline */}
          <div className="glass-panel p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Quick Search Food Database</h3>
                <p className="text-xs text-slate-400">Search raw ingredients, prepared Indian dishes, or custom items.</p>
              </div>
            </div>

            <button
              onClick={() => setIsLogModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Search & Add Food</span>
            </button>
          </div>

          {/* Meals Timeline */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
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
