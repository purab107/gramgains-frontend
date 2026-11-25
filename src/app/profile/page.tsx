'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  User, 
  Calculator, 
  Settings, 
  ShieldCheck, 
  Scale, 
  Sparkles, 
  Flame, 
  Target 
} from 'lucide-react';
import { ApiService, UserProfile } from '@/services/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DailyWeightModal } from '@/components/weight/DailyWeightModal';
import { 
  ProfileInfoTab, 
  MacroCalculatorTab, 
  AppSettingsTab, 
  DataAccountTab 
} from '@/components/profile';

type TabKey = 'profile' | 'calculator' | 'settings' | 'account';

function ProfileHubInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;

  const [activeTab, setActiveTab] = useState<TabKey>(tabParam || 'profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  useEffect(() => {
    if (tabParam && ['profile', 'calculator', 'settings', 'account'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const prof = await ApiService.getProfile();
      setUserProfile(prof);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`);
  };

  const handleProfileUpdated = (updated: UserProfile) => {
    setUserProfile(updated);
  };

  const tabs: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: 'profile', label: 'Profile & Goals', icon: User },
    { key: 'calculator', label: 'Macro Calculator', icon: Calculator },
    { key: 'settings', label: 'App Settings', icon: Settings },
    { key: 'account', label: 'Data & Account', icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Navbar
          userProfile={userProfile}
          onOpenWeightModal={() => setIsWeightModalOpen(true)}
          title="Profile & Preferences Hub"
          subtitle="Manage your personal biometrics, macro calculations, and app configurations in one unified space."
        />

        <main className="flex-1 p-4 pb-24 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">Loading your profile hub...</p>
            </div>
          ) : (
            <>
              {/* Profile Header Hero Banner */}
              <div className="bg-card border border-border p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground tracking-tight">
                        {userProfile?.name || 'Athlete'}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {userProfile?.goal ? userProfile.goal.replace('_', ' ') : 'FITNESS'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {userProfile?.age ?? 25} yrs • {userProfile?.gender === 'FEMALE' ? 'Female' : 'Male'} • {userProfile?.heightCm ?? 175} cm
                    </p>
                  </div>
                </div>

                {/* Quick Stats Badges & Log Weight Trigger */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <div className="px-3.5 py-2 rounded-2xl bg-muted/40 border border-border text-xs font-mono">
                    <span className="text-[10px] text-muted-foreground font-sans block">Scale Weight</span>
                    <span className="font-extrabold text-foreground text-sm">
                      {userProfile?.weightKg ?? 70} <span className="text-xs font-normal text-muted-foreground">kg</span>
                    </span>
                  </div>

                  <div className="px-3.5 py-2 rounded-2xl bg-muted/40 border border-border text-xs font-mono">
                    <span className="text-[10px] text-muted-foreground font-sans block">Maintenance</span>
                    <span className="font-extrabold text-foreground text-sm">
                      {userProfile?.tdee ?? 2400} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                    </span>
                  </div>

                  <div className="px-3.5 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-xs font-mono">
                    <span className="text-[10px] text-primary font-sans font-semibold block">Target Intake</span>
                    <span className="font-extrabold text-primary text-sm">
                      {userProfile?.targetCalories ?? 2000} <span className="text-xs font-normal">kcal</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsWeightModalOpen(true)}
                    className="p-2.5 rounded-2xl bg-card hover:bg-muted border border-border text-foreground transition-all flex items-center justify-center shrink-0 shadow-xs"
                    title="Log Scale Weight"
                  >
                    <Scale className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>

              {/* Segmented Tab Navigation Bar */}
              <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 border border-border rounded-2xl overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none ${
                        isActive
                          ? 'bg-card text-foreground shadow-xs border border-border font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Content Display */}
              <div className="pt-1">
                {activeTab === 'profile' && (
                  <ProfileInfoTab
                    profile={userProfile}
                    onProfileUpdated={handleProfileUpdated}
                    onOpenWeightModal={() => setIsWeightModalOpen(true)}
                    onSwitchToCalculator={() => handleTabChange('calculator')}
                  />
                )}

                {activeTab === 'calculator' && (
                  <MacroCalculatorTab
                    profile={userProfile}
                    onProfileUpdated={handleProfileUpdated}
                  />
                )}

                {activeTab === 'settings' && (
                  <AppSettingsTab
                    profile={userProfile}
                    onProfileUpdated={handleProfileUpdated}
                  />
                )}

                {activeTab === 'account' && (
                  <DataAccountTab
                    profile={userProfile}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <DailyWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        initialWeight={userProfile?.weightKg}
        onLogged={() => loadProfile()}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground">
          Loading Profile Hub...
        </div>
      }>
        <ProfileHubInner />
      </Suspense>
    </AuthGuard>
  );
}
