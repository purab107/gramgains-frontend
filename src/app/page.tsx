'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  UserProfile, 
  DashboardSummaryResponse, 
  MealLogItem 
} from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { SplashScreen } from '../components/SplashScreen';
import { OnboardingWizard } from '../components/OnboardingWizard';
import { Heatmap } from '../components/Heatmap';
import { MacroCard } from '../components/MacroCard';
import { DailyTimeline } from '../components/DailyTimeline';
import { MealLoggerModal } from '../components/MealLoggerModal';
import { 
  Flame, 
  Zap, 
  TrendingUp, 
  Utensils, 
  Plus, 
  Sparkles, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function DashboardHomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [logs, setLogs] = useState<MealLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    loadProfileAndData();
  }, [selectedDate]);

  const loadProfileAndData = async () => {
    try {
      setLoading(true);

      // Load User Profile
      let prof: UserProfile | null = null;
      try {
        prof = await ApiService.getProfile();
        setUserProfile(prof);

        // If user hasn't set up custom target/weight yet, open onboarding wizard
        if (!prof || prof.name === 'Athlete' && prof.weightKg === 70 && prof.heightCm === 175) {
          // Check localStorage flag if onboarding was completed
          const completedOnboarding = localStorage.getItem('gramgains_onboarded');
          if (!completedOnboarding) {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.warn('Backend profile not available yet, using defaults', err);
      }

      // Fetch Summary & Logs for selected date
      try {
        const [sumData, dailyData] = await Promise.all([
          ApiService.getDashboardSummary(selectedDate),
          ApiService.getDailyLogs(selectedDate),
        ]);
        setSummary(sumData);
        setLogs(dailyData.logs);
      } catch (err) {
        console.error('Failed loading daily summary/logs:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (updatedProf: UserProfile) => {
    setUserProfile(updatedProf);
    localStorage.setItem('gramgains_onboarded', 'true');
    setShowOnboarding(false);
    loadProfileAndData();
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        initialProfile={userProfile}
      />
    );
  }

  const targetCals = summary?.calories.target ?? userProfile?.targetCalories ?? 2200;
  const consumedCals = summary?.calories.consumed ?? 0;
  const remainingCals = summary?.calories.remaining ?? Math.max(0, targetCals - consumedCals);
  const percentDone = summary?.calories.percentageDone ?? (targetCals > 0 ? Math.min(100, Math.round((consumedCals / targetCals) * 100)) : 0);

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white">
      {/* Sidebar navigation */}
      <Sidebar userProfile={userProfile} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
          onOpenLogModal={() => setIsLogModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-emerald-950/20 border border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Daily Metabolic Overview</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {userProfile?.name ?? 'Athlete'} 👋
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Here's your nutritional progress and meal logging breakdown for {selectedDate}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOnboarding(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-all"
              >
                Recalculate TDEE
              </button>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food</span>
              </button>
            </div>
          </div>

          {/* Calorie Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Today's Calories Gauge Card */}
            <div className="glass-panel p-6 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300">Calories Consumed</span>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  {percentDone}% Target
                </span>
              </div>

              <div className="my-2">
                <div className="text-4xl font-black text-white tracking-tight">
                  {consumedCals}{' '}
                  <span className="text-sm font-normal text-slate-400">/ {targetCals} kcal</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full mt-3 overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentDone}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                <span>Logged {summary?.totalMealsLogged ?? logs.length} items today</span>
                <span className="text-emerald-400 font-medium">Goal: {userProfile?.goal ?? 'Maintain'}</span>
              </div>
            </div>

            {/* Calories Left Card */}
            <div className="glass-panel p-6 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300">Calories Remaining</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="my-2">
                <div className="text-4xl font-black text-emerald-400 tracking-tight">
                  {remainingCals}{' '}
                  <span className="text-sm font-normal text-slate-400">kcal left</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {remainingCals > 0
                    ? 'You are within your daily target limit!'
                    : 'Daily calorie target achieved!'}
                </p>
              </div>

              <div className="text-xs text-slate-400 pt-3 border-t border-white/5 flex justify-between">
                <span>Daily Budget:</span>
                <span className="font-semibold text-white">{targetCals} kcal</span>
              </div>
            </div>

            {/* Target & TDEE Card */}
            <div className="glass-panel p-6 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300">Metabolic Goal</span>
                </div>
                <span className="text-xs text-blue-400 font-mono">BMR: {userProfile?.bmr ?? 1650}</span>
              </div>

              <div className="my-2">
                <div className="text-3xl font-bold text-white tracking-tight">
                  {userProfile?.tdee ?? 2200}{' '}
                  <span className="text-xs font-normal text-slate-400">kcal Maintenance</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Target set to <span className="text-white font-semibold">{targetCals} kcal</span> based on {userProfile?.goal || 'Maintenance'}.
                </div>
              </div>

              <div className="text-xs text-slate-400 pt-3 border-t border-white/5 flex justify-between">
                <span>Activity level:</span>
                <span className="text-blue-400 font-semibold">{userProfile?.activityLevel || 'MODERATE'}</span>
              </div>
            </div>
          </div>

          {/* Macro Breakdown Cards */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Today's Macro Breakdown</span>
            </h2>
            <div className="grid-macros">
              <MacroCard
                label="PROTEIN"
                value={summary?.macros.protein.consumed ?? 0}
                unit="g"
                target={summary?.macros.protein.target ?? userProfile?.targetProtein ?? 140}
                color="#10B981"
              />
              <MacroCard
                label="CARBOHYDRATES"
                value={summary?.macros.carbohydrates.consumed ?? 0}
                unit="g"
                target={summary?.macros.carbohydrates.target ?? userProfile?.targetCarbs ?? 250}
                color="#3B82F6"
              />
              <MacroCard
                label="FAT"
                value={summary?.macros.fat.consumed ?? 0}
                unit="g"
                target={summary?.macros.fat.target ?? userProfile?.targetFat ?? 65}
                color="#8B5CF6"
              />
              <MacroCard
                label="FIBER"
                value={summary?.macros.fiber.consumed ?? 0}
                unit="g"
                target={summary?.macros.fiber.target ?? userProfile?.targetFiber ?? 30}
                color="#F59E0B"
              />
            </div>
          </div>

          {/* Activity Heatmap Component */}
          <Heatmap daysCount={90} />

          {/* Today's Logged Meals Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Today's Meal Timeline</span>
              </h2>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Food</span>
              </button>
            </div>

            <DailyTimeline logs={logs} onLogDeleted={loadProfileAndData} />
          </div>
        </main>
      </div>

      {/* Log Food Entry Modal */}
      <MealLoggerModal
        date={selectedDate}
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onLogged={loadProfileAndData}
      />
    </div>
  );
}
