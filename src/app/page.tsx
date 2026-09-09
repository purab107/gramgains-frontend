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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
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

        if (!prof || prof.name === 'Athlete' && prof.weightKg === 70 && prof.heightCm === 175) {
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
          {/* Header Banner */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Daily Metabolic Overview</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Welcome back, {userProfile?.name ?? 'Athlete'} 👋
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nutritional breakdown and meal logging for {selectedDate}.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowOnboarding(true)}
                  >
                    Recalculate TDEE
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsLogModalOpen(true)}
                    className="gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Food</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calorie Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Today's Calories Gauge Card */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-secondary text-secondary-foreground border border-border">
                      <Flame className="w-4 h-4" />
                    </div>
                    <CardTitle className="uppercase tracking-wider text-muted-foreground">
                      Calories Consumed
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="font-mono normal-case tracking-normal">
                    {percentDone}% Target
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="text-3xl font-black font-mono text-foreground tracking-tight">
                  {consumedCals}{' '}
                  <span className="text-xs font-normal text-muted-foreground">/ {targetCals} kcal</span>
                </div>
                <Progress value={consumedCals} max={targetCals} className="mt-3 h-2.5" />
              </CardContent>

              <CardFooter className="text-xs text-muted-foreground">
                <span>Logged {summary?.totalMealsLogged ?? logs.length} items</span>
                <span className="ml-auto text-primary font-semibold font-mono">
                  Goal: {userProfile?.goal ?? 'Maintain'}
                </span>
              </CardFooter>
            </Card>

            {/* Calories Left Card */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-secondary text-secondary-foreground border border-border">
                      <Zap className="w-4 h-4" />
                    </div>
                    <CardTitle className="uppercase tracking-wider text-muted-foreground">
                      Calories Remaining
                    </CardTitle>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="text-3xl font-black font-mono text-primary tracking-tight">
                  {remainingCals}{' '}
                  <span className="text-xs font-normal text-muted-foreground">kcal left</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {remainingCals > 0
                    ? 'Within your daily target limit.'
                    : 'Daily calorie target achieved.'}
                </p>
              </CardContent>

              <CardFooter className="text-xs text-muted-foreground">
                <span>Daily Budget:</span>
                <span className="ml-auto font-semibold font-mono text-foreground">{targetCals} kcal</span>
              </CardFooter>
            </Card>

            {/* Target & TDEE Card */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-secondary text-secondary-foreground border border-border">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <CardTitle className="uppercase tracking-wider text-muted-foreground">
                      Metabolic Goal
                    </CardTitle>
                  </div>
                  <span className="text-xs text-primary font-mono font-semibold">
                    BMR: {userProfile?.bmr ?? 1650}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
                  {userProfile?.tdee ?? 2200}{' '}
                  <span className="text-xs font-normal text-muted-foreground">kcal TDEE</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Target:{' '}
                  <span className="text-foreground font-semibold font-mono">{targetCals} kcal</span>{' '}
                  ({userProfile?.goal || 'Maintenance'}).
                </div>
              </CardContent>

              <CardFooter className="text-xs text-muted-foreground">
                <span>Activity:</span>
                <span className="ml-auto text-primary font-semibold uppercase">
                  {userProfile?.activityLevel || 'MODERATE'}
                </span>
              </CardFooter>
            </Card>
          </div>

          {/* Macro Breakdown Cards */}
          <div>
            <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" />
              <span>Today's Macro Breakdown</span>
            </h2>
            <div className="grid-macros">
              <MacroCard
                label="PROTEIN"
                value={summary?.macros.protein.consumed ?? 0}
                unit="g"
                target={summary?.macros.protein.target ?? userProfile?.targetProtein ?? 140}
              />
              <MacroCard
                label="CARBOHYDRATES"
                value={summary?.macros.carbohydrates.consumed ?? 0}
                unit="g"
                target={summary?.macros.carbohydrates.target ?? userProfile?.targetCarbs ?? 250}
              />
              <MacroCard
                label="FAT"
                value={summary?.macros.fat.consumed ?? 0}
                unit="g"
                target={summary?.macros.fat.target ?? userProfile?.targetFat ?? 65}
              />
              <MacroCard
                label="FIBER"
                value={summary?.macros.fiber.consumed ?? 0}
                unit="g"
                target={summary?.macros.fiber.target ?? userProfile?.targetFiber ?? 30}
              />
            </div>
          </div>

          {/* Activity Heatmap Component */}
          <Heatmap daysCount={90} />

          {/* Today's Logged Meals Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Today's Meal Timeline</span>
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
