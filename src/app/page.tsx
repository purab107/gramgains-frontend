'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  UserProfile, 
  DashboardSummaryResponse, 
  MealLogItem,
  AdaptiveCheckInResponse 
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
import { DailyWeightModal } from '@/components/weight/DailyWeightModal';
import { WeeklyCheckInBanner } from '@/components/adaptive/WeeklyCheckInBanner';
import { WeeklyCheckInModal } from '@/components/adaptive/WeeklyCheckInModal';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar,
  Scale,
  Sparkles,
  X
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

  // Weight Prompt & Weekly Check-In states
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [hasPendingWeight, setHasPendingWeight] = useState(false);
  const [dismissedWeightBanner, setDismissedWeightBanner] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<AdaptiveCheckInResponse | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  useEffect(() => {
    // Remove loading class to prevent flash of unstyled content
    document.body.classList.remove('loading');
    
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

      // Check weight logs for today and trigger initial pop-up if not logged yet
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const weightRes = await ApiService.getWeightLogs(7);
        const loggedToday = weightRes?.logs?.some((l) => l.date === todayStr);

        if (!loggedToday) {
          setHasPendingWeight(true);
          const hasShownPopupSession = sessionStorage.getItem(`gramgains_weight_popup_${todayStr}`);
          if (!hasShownPopupSession) {
            sessionStorage.setItem(`gramgains_weight_popup_${todayStr}`, 'true');
            setIsWeightModalOpen(true);
          }
        } else {
          setHasPendingWeight(false);
        }
      } catch (err) {
        console.warn('Failed checking today weight log status:', err);
      }

      // Check if weekly check-in is pending
      try {
        const checkInData = await ApiService.getCheckIn();
        if (checkInData && checkInData.status === 'PENDING') {
          setPendingCheckIn(checkInData);
        } else {
          setPendingCheckIn(null);
        }
      } catch (err) {
        // Silent catch for check-in
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
          onOpenWeightModal={() => setIsWeightModalOpen(true)}
          hasPendingWeight={hasPendingWeight}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Pending Weekly Check-In Alert Banner */}
          {pendingCheckIn && (
            <WeeklyCheckInBanner
              onReview={() => setIsCheckInModalOpen(true)}
              onDismiss={() => setPendingCheckIn(null)}
              headline={pendingCheckIn.headline}
              adjustmentKcal={pendingCheckIn.adjustmentKcal}
            />
          )}

          {/* Today's Weight Pending Reminder Banner */}
          {hasPendingWeight && !dismissedWeightBanner && (
            <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-foreground animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Today&apos;s Weigh-In Pending
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Log your morning scale reading to keep your adaptive energy expenditure calibrated.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => setDismissedWeightBanner(true)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
                <Button
                  size="sm"
                  onClick={() => setIsWeightModalOpen(true)}
                  className="h-8 rounded-xl font-bold gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Log Weight</span>
                </Button>
              </div>
            </div>
          )}

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
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Today&apos;s Meal Timeline</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLogModalOpen(true)}
                  className="gap-1 text-primary hover:text-primary"
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

      {/* Daily Weight Modal */}
      <DailyWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        onLogged={() => {
          setHasPendingWeight(false);
          loadProfileAndData();
        }}
        initialWeight={userProfile?.weightKg || 70}
      />

      {/* Weekly Check-In Modal */}
      <WeeklyCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        checkIn={pendingCheckIn}
        onApplied={() => {
          setPendingCheckIn(null);
          loadProfileAndData();
        }}
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
