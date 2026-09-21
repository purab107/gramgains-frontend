'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  UserProfile, 
  DashboardSummaryResponse, 
  MealLogItem 
} from '../services/api';
import { 
  Sidebar,
  Navbar,
  AuthGuard,
  SplashScreen,
  OnboardingWizard,
  WeeklyCaloriesBarChart,
  TodayOverviewCards,
  DailyTimeline,
  MealLoggerModal
} from '@/components';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar
} from 'lucide-react';

function DashboardHomePage() {
  const [showSplash, setShowSplash] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [logs, setLogs] = useState<MealLogItem[]>([]);
  const [waterTotalMl, setWaterTotalMl] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    // Only show splash screen once per browser session
    const hasSeenSplash = sessionStorage.getItem('gramgains_splash_seen');
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem('gramgains_splash_seen', 'true');
    setShowSplash(false);
  };

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

        // Trigger onboarding for new users who have the auto-generated default profile
        if (!prof || (prof.name === 'Athlete' && prof.weightKg === 70 && prof.heightCm === 175)) {
          setShowOnboarding(true);
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
        setWaterTotalMl(dailyData.water?.totalMl || sumData?.water?.consumed || 0);
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
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        initialProfile={userProfile}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar navigation */}
      <Sidebar userProfile={userProfile} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
          onOpenLogModal={() => setIsLogModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* New Modern 4-Card Overview (Calories circular gauge + Protein, Carbs, Fats, Water) */}
          <TodayOverviewCards
            summary={summary}
            userProfile={userProfile}
            waterTotalMl={waterTotalMl}
          />

          {/* 2-Column Grid Layout: Left = 7-Day Bar Chart (7/12 cols), Right = Today's Meal Timeline (5/12 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 7-Day Calorie Bar Chart */}
            <div className="lg:col-span-7">
              <WeeklyCaloriesBarChart />
            </div>

            {/* Right Column: Today's Logged Meals Timeline */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                  <span>Today's Meal Timeline</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLogModalOpen(true)}
                  className="gap-1 text-[var(--accent)] hover:text-[var(--accent-hover)] hover:bg-[var(--accent-muted)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Food</span>
                </Button>
              </div>

              <DailyTimeline logs={logs} onLogDeleted={loadProfileAndData} />
            </div>
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

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardHomePage />
    </AuthGuard>
  );
}
