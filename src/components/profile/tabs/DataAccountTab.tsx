'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  LogOut, 
  Trash2, 
  UserX, 
  Sparkles, 
  FileSpreadsheet, 
  FileCode,
  CheckCircle2,
  AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile, ApiService } from '@/services/api';
import { useSession, signOut } from '@/lib/auth-client';
import { useIsGuest, endGuestSession } from '@/lib/guest-session';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/auth/AuthModal';

interface DataAccountTabProps {
  profile: UserProfile | null;
}

export const DataAccountTab: React.FC<DataAccountTabProps> = ({ profile }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isGuest = useIsGuest();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [clearStatus, setClearStatus] = useState<string | null>(null);

  const userEmail = session?.user?.email || (isGuest ? 'guest@gramgains.local' : 'athlete@gramgains.app');

  const handleExportJSON = () => {
    try {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        profile,
        appSettings: {
          theme: typeof window !== 'undefined' ? localStorage.getItem('gramgains_theme') : null,
          units: typeof window !== 'undefined' ? localStorage.getItem('gramgains_units') : null,
          waterTarget: typeof window !== 'undefined' ? localStorage.getItem('gramgains_water_target_ml') : null,
        },
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gramgains-profile-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('JSON Profile data exported successfully!');
      setTimeout(() => setExportStatus(null), 3500);
    } catch (e: any) {
      setExportStatus(`Failed to export: ${e.message}`);
    }
  };

  const handleExportCSV = async () => {
    try {
      // Create a CSV summary of current profile & target metrics
      const rows = [
        ['Metric', 'Value', 'Unit'],
        ['Name', profile?.name || 'Athlete', ''],
        ['Gender', profile?.gender || 'MALE', ''],
        ['Age', String(profile?.age || 25), 'years'],
        ['Height', String(profile?.heightCm || 175), 'cm'],
        ['Weight', String(profile?.weightKg || 70), 'kg'],
        ['Activity Level', profile?.activityLevel || 'MODERATE', ''],
        ['Goal', profile?.goal || 'WEIGHT_LOSS', ''],
        ['Target Calories', String(profile?.targetCalories || 2000), 'kcal/day'],
        ['Target Protein', String(profile?.targetProtein || 140), 'g/day'],
        ['Target Carbs', String(profile?.targetCarbs || 200), 'g/day'],
        ['Target Fat', String(profile?.targetFat || 60), 'g/day'],
        ['Target Fiber', String(profile?.targetFiber || 28), 'g/day'],
        ['Baseline BMR', String(profile?.bmr || 1650), 'kcal/day'],
        ['Maintenance TDEE', String(profile?.tdee || 2400), 'kcal/day'],
        ['Target Rate Change', String(profile?.targetRateKgPerWeek || -0.5), 'kg/week'],
      ];

      const csvContent = rows.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gramgains-metrics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('CSV Summary metrics exported successfully!');
      setTimeout(() => setExportStatus(null), 3500);
    } catch (e: any) {
      setExportStatus(`Failed to export: ${e.message}`);
    }
  };

  const handleRerunOnboarding = () => {
    if (confirm('Do you want to re-run the initial onboarding setup? Your target calories will be recalculated.')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gramgains_onboarded');
      }
      router.push('/onboarding');
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear local cache and saved preferences? This does not delete your cloud account.')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gramgains_theme');
        localStorage.removeItem('gramgains_units');
        localStorage.removeItem('gramgains_water_target_ml');
        localStorage.removeItem('gramgains_calorie_smoothing');
      }
      setClearStatus('Local cache cleared.');
      setTimeout(() => setClearStatus(null), 3000);
    }
  };

  const handleSignOut = async () => {
    try {
      if (isGuest) {
        endGuestSession();
      } else {
        await signOut();
      }
      router.replace('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {exportStatus && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportStatus}</span>
        </div>
      )}

      {clearStatus && (
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{clearStatus}</span>
        </div>
      )}

      {/* Guest Mode Conversion Banner */}
      {isGuest && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Guest Explorer Mode</span>
            </div>
            <h3 className="text-base font-bold text-foreground">Save Your Progress &amp; Unlock Sync</h3>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              Create a free account to ensure your custom macro presets, meal history, and weight trends are safely stored and synced across devices.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }}
            className="rounded-xl px-5 py-2.5 font-bold shadow-md shrink-0"
          >
            Create Free Account
          </Button>
        </div>
      )}

      {/* Account Identity Details */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Account &amp; Authentication</h3>
            <p className="text-xs text-muted-foreground">Manage your credentials and active session.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-4 rounded-2xl bg-muted/20 border border-border">
            <span className="text-[11px] text-muted-foreground font-medium block">Signed-in Identity</span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">{profile?.name || 'Athlete'}</span>
            <span className="text-[11px] text-muted-foreground">{userEmail}</span>
          </div>

          <div className="p-4 rounded-2xl bg-muted/20 border border-border">
            <span className="text-[11px] text-muted-foreground font-medium block">Account Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${isGuest ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="text-sm font-bold text-foreground">
                {isGuest ? 'Guest Session' : 'Verified Athlete Account'}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              {isGuest ? 'Session-only storage' : 'Cloud synchronized'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Data Export &amp; Portability</h3>
            <p className="text-xs text-muted-foreground">Export your nutrition metrics, targets, and body data anytime.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-4 rounded-2xl border border-border bg-background hover:bg-muted/50 transition-all text-left flex items-start gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Export Metrics (CSV)
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Download spreadsheet-ready CSV of all targets, BMR, TDEE, and macro baselines.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="p-4 rounded-2xl border border-border bg-background hover:bg-muted/50 transition-all text-left flex items-start gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Export Full Backup (JSON)
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Download full raw JSON backup of profile attributes and local app preferences.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Recalibration & Setup Wizard */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Recalibration Wizard</h3>
            <p className="text-xs text-muted-foreground">Start fresh with the step-by-step onboarding wizard if lifestyle or goals reset.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-muted/20 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-foreground">Re-run Initial Onboarding</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Re-answers fitness experience, weight change expectations, and generates a fresh baseline plan.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleRerunOnboarding}
            className="rounded-xl font-semibold shrink-0"
          >
            Start Setup Wizard
          </Button>
        </div>
      </div>

      {/* Danger Zone & Logout */}
      <div className="bg-card border border-destructive/20 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-destructive">Account Actions &amp; Session</h3>
            <p className="text-xs text-muted-foreground">Session control and cache resets.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleClearCache}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4 text-muted-foreground" />
            <span>Clear Local Storage Cache</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex-1 py-2.5 px-4 rounded-xl border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {isGuest ? <UserX className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
            <span>{isGuest ? 'Exit Guest Mode' : 'Sign Out of Account'}</span>
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
        onSuccess={() => {
          setIsAuthOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};
