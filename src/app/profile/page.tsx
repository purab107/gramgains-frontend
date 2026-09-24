'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, UserProfile } from '@/services/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm';
import { DailyWeightModal } from '@/components/weight/DailyWeightModal';

function ProfilePageContent() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Navbar
          userProfile={userProfile}
          onOpenWeightModal={() => setIsWeightModalOpen(true)}
          title="Profile & Metabolic Settings"
          subtitle="Configure your personal body metrics, target rate of change, and macro presets."
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          {loading ? (
            <div className="py-20 text-center text-xs text-muted-foreground">
              Loading metabolic profile...
            </div>
          ) : (
            <ProfileSettingsForm
              initialProfile={userProfile}
              onProfileUpdated={(updated) => setUserProfile(updated)}
            />
          )}
        </main>
      </div>

      <DailyWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        initialWeight={userProfile?.weightKg || 70}
        onLogged={() => loadProfile()}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageContent />
    </AuthGuard>
  );
}
