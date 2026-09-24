'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiService, 
  UserProfile, 
  AdaptiveStatusResponse, 
  WeightHistoryResponse, 
  AnalyticsOverviewResponse, 
  AnalyticsPatternsResponse, 
  AdaptiveCheckInResponse 
} from '@/services/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { WeightTrendChart } from '@/components/analytics/WeightTrendChart';
import { MetabolicEngineCard } from '@/components/analytics/MetabolicEngineCard';
import { AdherenceAndChronoCards } from '@/components/analytics/AdherenceAndChronoCards';
import { WeightHistoryDrawer } from '@/components/weight/WeightHistoryDrawer';
import { WeeklyCheckInModal } from '@/components/adaptive/WeeklyCheckInModal';
import { WeeklyCheckInBanner } from '@/components/adaptive/WeeklyCheckInBanner';
import { DailyWeightModal } from '@/components/weight/DailyWeightModal';
import { Scale, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AnalyticsDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  // Data states
  const [adaptiveStatus, setAdaptiveStatus] = useState<AdaptiveStatusResponse | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightHistoryResponse | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [patterns, setPatterns] = useState<AnalyticsPatternsResponse | null>(null);
  const [checkIn, setCheckIn] = useState<AdaptiveCheckInResponse | null>(null);

  // Modal / Drawer states
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  useEffect(() => {
    loadAllAnalytics();
  }, [selectedDays]);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      const [prof, statusData, weightData, overviewData, patternsData] = await Promise.all([
        ApiService.getProfile().catch(() => null),
        ApiService.getAdaptiveStatus().catch(() => null),
        ApiService.getWeightLogs(selectedDays).catch(() => null),
        ApiService.getAnalyticsOverview(selectedDays).catch(() => null),
        ApiService.getAnalyticsPatterns(14).catch(() => null),
      ]);

      setUserProfile(prof);
      setAdaptiveStatus(statusData);
      setWeightHistory(weightData);
      setOverview(overviewData);
      setPatterns(patternsData);

      // Check for pending check-in
      if (statusData?.targets?.isCheckInAvailable) {
        const checkInData = await ApiService.getCheckIn().catch(() => null);
        if (checkInData && checkInData.status === 'PENDING') {
          setCheckIn(checkInData);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInApplied = () => {
    setCheckIn(null);
    loadAllAnalytics();
  };

  const handleWeightLogged = () => {
    loadAllAnalytics();
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Navbar
          userProfile={userProfile}
          onOpenWeightModal={() => setIsWeightModalOpen(true)}
          title="Metabolic Analytics & Trends"
          subtitle="Real-world energy expenditure, smoothed weight trends, and behavioral insights."
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Actions: Quick Log Weight & Refresh */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Intelligence Dashboard
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWeightModalOpen(true)}
                className="rounded-xl gap-1.5 text-xs font-semibold"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Log Scale Weight</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={loadAllAnalytics}
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                title="Refresh analytics"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Pending Weekly Check-In Alert Banner */}
          {checkIn && (
            <WeeklyCheckInBanner
              onReview={() => setIsCheckInModalOpen(true)}
              onDismiss={() => setCheckIn(null)}
              headline={checkIn.headline}
              adjustmentKcal={checkIn.adjustmentKcal}
            />
          )}

          {/* CARD 1: Adaptive Metabolic Engine Status */}
          <MetabolicEngineCard status={adaptiveStatus} />

          {/* CARD 2: Dual Curve Weight Trend Chart (Recharts) */}
          <WeightTrendChart
            data={weightHistory}
            targetWeightKg={userProfile?.targetWeightKg}
            selectedDays={selectedDays}
            onDaysChange={setSelectedDays}
            onOpenHistory={() => setIsHistoryDrawerOpen(true)}
          />

          {/* CARDS 3 & 4: Adherence, Energy Balance, and Chrono-Nutrition */}
          <AdherenceAndChronoCards
            overview={overview}
            patterns={patterns}
          />
        </main>
      </div>

      {/* Modals & Drawers */}
      <WeeklyCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        checkIn={checkIn}
        onApplied={handleCheckInApplied}
      />

      <WeightHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        logs={weightHistory?.logs || []}
        onRefresh={loadAllAnalytics}
      />

      <DailyWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        onLogged={handleWeightLogged}
        initialWeight={adaptiveStatus?.weightTrend?.latestRawKg || userProfile?.weightKg || 70}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsDashboard />
    </AuthGuard>
  );
}
