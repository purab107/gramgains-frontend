'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  UserProfile, 
  DashboardSummaryResponse, 
  MealLogItem,
  AdaptiveCheckInResponse,
  AdaptiveStatusResponse,
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
  AddFoodSheet,
  type MealTypeKey
} from '@/components';
import { DailyWeightModal } from '@/components/weight/DailyWeightModal';
import { WeeklyCheckInBanner } from '@/components/adaptive/WeeklyCheckInBanner';
import { WeeklyCheckInModal } from '@/components/adaptive/WeeklyCheckInModal';
import { CalibratePlanCard } from '@/components/adaptive/CalibratePlanCard';
import { CalorieTransitionCard } from '@/components/adaptive/CalorieTransitionCard';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar,
  Scale,
  Sparkles,
  X,
  Flame,
  Loader2,
} from 'lucide-react';
import { useDevSkip } from '@/components/dev-skip';
import { isDevSkip } from '@/lib/dev-skip';
import { isGuestSession } from '@/lib/guest-session';

function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function DashboardHomePage() {
  const devSkip = useDevSkip();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('onboarding') === 'true';
    }
    return false;
  });
  const [showSplash, setShowSplash] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [logs, setLogs] = useState<MealLogItem[]>([]);
  const [waterTotalMl, setWaterTotalMl] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealTypeKey>('BREAKFAST');

  const handleOpenAddFood = (type: MealTypeKey = 'BREAKFAST') => {
    setActiveMealType(type);
    setIsAddFoodOpen(true);
  };

  // Weight Prompt & Weekly Check-In states
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [hasPendingWeight, setHasPendingWeight] = useState(false);
  const [dismissedWeightBanner, setDismissedWeightBanner] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<AdaptiveCheckInResponse | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [adaptiveStatus, setAdaptiveStatus] = useState<AdaptiveStatusResponse | null>(null);

  // React to DevSkip Modal Triggers
  useEffect(() => {
    if (!devSkip.activeModalTrigger) return;
    if (devSkip.activeModalTrigger === 'weight') {
      setIsWeightModalOpen(true);
      devSkip.triggerModal(null);
    } else if (devSkip.activeModalTrigger === 'checkin') {
      setIsCheckInModalOpen(true);
      devSkip.triggerModal(null);
    } else if (devSkip.activeModalTrigger === 'food') {
      handleOpenAddFood('BREAKFAST');
      devSkip.triggerModal(null);
    }
  }, [devSkip.activeModalTrigger]);

  // React to DevSkip Stage and Override changes
  useEffect(() => {
    if (!isDevSkip()) return;

    if (devSkip.activeOverrides.showOnboarding === 'true') {
      setShowOnboarding(true);
    } else if (devSkip.activeOverrides.showOnboarding === 'false') {
      setShowOnboarding(false);
    }

    if (devSkip.activeOverrides.hasPendingWeight === 'true') {
      setHasPendingWeight(true);
      setDismissedWeightBanner(false);
    } else if (devSkip.activeOverrides.hasPendingWeight === 'false') {
      setHasPendingWeight(false);
    }

    loadProfileAndData();
  }, [devSkip.activeStageId, devSkip.activeOverrides]);

  useEffect(() => {
    // Check if onboarding was requested via URL query param
    const searchParams = new URLSearchParams(window.location.search);
    const isExplicitOnboarding = searchParams.get('onboarding') === 'true';
    if (isExplicitOnboarding) {
      setShowOnboarding(true);
      setShowSplash(false);
      return;
    }

    // Only show splash screen once per browser session for normal dashboard visits
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
      let shouldOnboard = false;
      const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const isExplicitOnboarding = searchParams.get('onboarding') === 'true';
      const isGuest = isGuestSession();

      try {
        prof = await ApiService.getProfile();
        setUserProfile(prof);

        shouldOnboard =
          isExplicitOnboarding ||
          (!isGuest && prof && prof.onboardingCompleted === false);

        if (shouldOnboard) {
          setShowOnboarding(true);
        }
      } catch (err) {
        console.warn('Backend profile not available yet, using defaults', err);
        if (isExplicitOnboarding) {
          setShowOnboarding(true);
        }
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

      // Check weight logs for today ONLY if onboarding is completed
      if (!shouldOnboard && (prof?.onboardingCompleted !== false || isGuestSession())) {
        try {
          const todayStr = getLocalDateString();
          const weightRes = await ApiService.getWeightLogs(7);
          const loggedToday = weightRes?.logs?.some((l) => l.date?.startsWith(todayStr));

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

      // Fetch adaptive status for calibration & lead-up
      try {
        const adStatus = await ApiService.getAdaptiveStatus();
        setAdaptiveStatus(adStatus);
      } catch (err) {
        // Silent catch for adaptive status
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLeadUp = async () => {
    try {
      const updated = await ApiService.updateProfile({ skipLeadUp: true });
      setUserProfile(updated);
      await loadProfileAndData();
    } catch (err) {
      console.error('Failed to skip lead-up:', err);
    }
  };

  const handleOnboardingComplete = (updatedProf: UserProfile) => {
    setUserProfile(updatedProf);
    setShowOnboarding(false);

    // Clean up ?onboarding query param if present
    if (typeof window !== 'undefined' && window.location.search.includes('onboarding=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('onboarding');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }

    // Always prompt the first daily weight check-in immediately after completing onboarding
    const todayStr = getLocalDateString();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`gramgains_weight_popup_${todayStr}`, 'true');
    }
    setHasPendingWeight(true);
    setIsWeightModalOpen(true);

    loadProfileAndData();
  };

  // If profile is not yet loaded on initial render, show branded loading screen to prevent dashboard flash
  if (!userProfile && loading && !isGuestSession() && !isDevSkip()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground animate-pulse shadow-lg">
            <Flame className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading GramGains...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        initialProfile={userProfile}
      />
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
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
          onOpenLogModal={() => handleOpenAddFood('BREAKFAST')}
          onOpenWeightModal={() => setIsWeightModalOpen(true)}
          hasPendingWeight={hasPendingWeight}
        />

        <main className="flex-1 p-4 pb-24 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
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
            {/* Left Column: Calibration Card + 7-Day Calorie Bar Chart */}
            <div className="lg:col-span-7 space-y-4">
              <CalorieTransitionCard
                leadUpStatus={
                  adaptiveStatus?.leadUpStatus ||
                  (userProfile?.leadUpActive
                    ? {
                        isActive: true,
                        currentStep: userProfile.leadUpCurrentStep ?? 0,
                        totalSteps: userProfile.leadUpTotalSteps ?? 1,
                        startDate: userProfile.leadUpStartDate,
                        calculatedGoalTarget: userProfile.calculatedGoalTarget ?? userProfile.targetCalories,
                        schedule: userProfile.leadUpScheduleJson,
                      }
                    : null)
                }
                activeTargetCalories={userProfile?.targetCalories}
                onSkipLeadUp={handleSkipLeadUp}
                onLogWeight={() => setIsWeightModalOpen(true)}
              />
              <CalibratePlanCard
                confidenceLevel={userProfile?.confidenceLevel}
                confidenceDays={userProfile?.confidenceDays}
                onLogWeight={() => setIsWeightModalOpen(true)}
              />
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
                  onClick={() => handleOpenAddFood('BREAKFAST')}
                  className="gap-1 text-primary hover:text-primary"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Food</span>
                </Button>
              </div>

              <DailyTimeline
                logs={logs}
                onLogDeleted={loadProfileAndData}
                onAddMeal={(mealKey) => handleOpenAddFood((mealKey as MealTypeKey) || 'BREAKFAST')}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Side Panel: Add Food Sheet */}
      <AddFoodSheet
        open={isAddFoodOpen}
        onOpenChange={setIsAddFoodOpen}
        selectedDate={selectedDate}
        mealType={activeMealType}
        onMealTypeChange={setActiveMealType}
        onFoodLogged={loadProfileAndData}
      />

      {/* Daily Weight Modal */}
      <DailyWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        onLogged={() => {
          setHasPendingWeight(false);
          loadProfileAndData();
        }}
        initialWeight={userProfile?.weightKg}
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
