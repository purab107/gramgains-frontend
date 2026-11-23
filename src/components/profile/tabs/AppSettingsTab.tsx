'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Ruler, 
  Calendar, 
  Zap, 
  Droplets, 
  Check, 
  Save, 
  AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiService, UserProfile } from '@/services/api';

interface AppSettingsTabProps {
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const AppSettingsTab: React.FC<AppSettingsTabProps> = ({
  profile,
  onProfileUpdated,
}) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  // Units state
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  // Adaptive & Coach settings
  const [isAdaptiveEnabled, setIsAdaptiveEnabled] = useState(true);
  const [checkInDayOfWeek, setCheckInDayOfWeek] = useState(1);
  const [calorieSmoothing, setCalorieSmoothing] = useState(true);
  // Nutrition & Water settings
  const [dailyWaterTargetMl, setDailyWaterTargetMl] = useState(2500);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read local preferences
    if (typeof window !== 'undefined') {
      const storedTheme = (localStorage.getItem('gramgains_theme') as any) || 'system';
      setTheme(storedTheme);
      const storedUnits = (localStorage.getItem('gramgains_units') as any) || 'metric';
      setUnits(storedUnits);
      const storedSmoothing = localStorage.getItem('gramgains_calorie_smoothing');
      if (storedSmoothing !== null) {
        setCalorieSmoothing(storedSmoothing === 'true');
      }
      const storedWater = localStorage.getItem('gramgains_water_target_ml');
      if (storedWater) {
        setDailyWaterTargetMl(parseInt(storedWater, 10) || 2500);
      }
    }

    if (profile) {
      setIsAdaptiveEnabled(profile.isAdaptiveEnabled !== false);
      setCheckInDayOfWeek(profile.checkInDayOfWeek ?? 1);
    }
  }, [profile]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gramgains_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (newTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    }
  };

  const handleUnitsChange = (newUnits: 'metric' | 'imperial') => {
    setUnits(newUnits);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gramgains_units', newUnits);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('gramgains_theme', theme);
        localStorage.setItem('gramgains_units', units);
        localStorage.setItem('gramgains_calorie_smoothing', String(calorieSmoothing));
        localStorage.setItem('gramgains_water_target_ml', String(dailyWaterTargetMl));
      }

      const updated = await ApiService.updateProfile({
        isAdaptiveEnabled,
        checkInDayOfWeek: Number(checkInDayOfWeek),
      });

      setSaveSuccess(true);
      onProfileUpdated(updated);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6">
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>App preferences and coaching schedules updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: Display & Appearance */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Display &amp; Appearance</h3>
            <p className="text-xs text-muted-foreground">Customize color theme and measurement units.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Theme Mode */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Theme Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                  theme === 'light'
                    ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                  theme === 'dark'
                    ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                  theme === 'system'
                    ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Units */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Measurement System</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUnitsChange('metric')}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                  units === 'metric'
                    ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                <Ruler className="w-4 h-4" />
                <span>Metric (kg, cm, ml)</span>
              </button>
              <button
                type="button"
                onClick={() => handleUnitsChange('imperial')}
                className={`py-2.5 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                  units === 'imperial'
                    ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                <Ruler className="w-4 h-4" />
                <span>Imperial (lbs, in, oz)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Adaptive Metabolic Coach Settings */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Adaptive Metabolic Engine</h3>
            <p className="text-xs text-muted-foreground">Configure dynamic expenditure adjustments and weekly check-in routine.</p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Toggle Adaptive Engine */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border">
            <div>
              <p className="text-xs font-semibold text-foreground">Adaptive Expenditure Algorithm</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Automatically recalculates your true metabolic expenditure from daily weigh-ins and logged meals.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={isAdaptiveEnabled}
                onChange={(e) => setIsAdaptiveEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Calorie Smoothing */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border">
            <div>
              <p className="text-xs font-semibold text-foreground">Calorie Transition Smoothing</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Caps weekly calorie adjustments to gentle steps (±100 kcal max) to prevent sudden hunger or metabolic shocks.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={calorieSmoothing}
                onChange={(e) => setCalorieSmoothing(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Weekly Check-In Day */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Weekly Check-In Day</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              The day of the week GramGains reviews your 7-day weight velocity and recommends target macro updates.
            </p>
            <select
              value={checkInDayOfWeek}
              onChange={(e) => setCheckInDayOfWeek(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value={1}>Monday (Recommended — Post-weekend baseline)</option>
              <option value={0}>Sunday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: Nutrition & Hydration Preferences */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Hydration &amp; Daily Goals</h3>
            <p className="text-xs text-muted-foreground">Set your daily hydration targets for the tracker dashboard.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">Daily Water Intake Target</span>
            <span className="font-bold text-foreground font-mono text-sm">
              {dailyWaterTargetMl} ml{' '}
              <span className="text-xs font-normal text-muted-foreground">
                ({(dailyWaterTargetMl / 1000).toFixed(1)} L)
              </span>
            </span>
          </div>

          <input
            type="range"
            min={1500}
            max={5000}
            step={250}
            value={dailyWaterTargetMl}
            onChange={(e) => setDailyWaterTargetMl(parseInt(e.target.value, 10))}
            className="w-full accent-primary cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>1,500 ml (Baseline)</span>
            <span>2,500 ml (Standard)</span>
            <span>5,000 ml (Athlete)</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="h-11 px-6 rounded-xl font-bold gap-2 shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Preferences...' : 'Save App Preferences'}</span>
        </Button>
      </div>
    </form>
  );
};
