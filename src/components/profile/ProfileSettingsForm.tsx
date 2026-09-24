'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Flame, 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Save, 
  Calendar, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiService, UserProfile } from '@/services/api';

interface ProfileSettingsFormProps {
  initialProfile: UserProfile | null;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  initialProfile,
  onProfileUpdated,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<string>('MODERATE');
  const [goal, setGoal] = useState<'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK'>('WEIGHT_LOSS');

  // Adaptive & Macro Settings
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>(68);
  const [targetRateKgPerWeek, setTargetRateKgPerWeek] = useState<number>(-0.5);
  const [isAdaptiveEnabled, setIsAdaptiveEnabled] = useState<boolean>(true);
  const [macroPreset, setMacroPreset] = useState<'BALANCED' | 'HIGH_PROTEIN' | 'KETO' | 'LOW_CARB' | 'CUSTOM'>('BALANCED');
  const [proteinGramsPerKg, setProteinGramsPerKg] = useState<number>(2.0);
  const [fatPercent, setFatPercent] = useState<number>(25.0);
  const [checkInDayOfWeek, setCheckInDayOfWeek] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      setAge(initialProfile.age || 25);
      setGender(initialProfile.gender || 'MALE');
      setHeightCm(initialProfile.heightCm || 175);
      setWeightKg(initialProfile.weightKg || 70);
      setActivityLevel(initialProfile.activityLevel || 'MODERATE');
      setGoal(initialProfile.goal || 'WEIGHT_LOSS');
      setTargetWeightKg(initialProfile.targetWeightKg ?? 68);
      setTargetRateKgPerWeek(initialProfile.targetRateKgPerWeek ?? -0.5);
      setIsAdaptiveEnabled(initialProfile.isAdaptiveEnabled !== false);
      setMacroPreset(initialProfile.macroPreset || 'BALANCED');
      setProteinGramsPerKg(initialProfile.proteinGramsPerKg || 2.0);
      setFatPercent(initialProfile.fatPercent || 25.0);
      setCheckInDayOfWeek(initialProfile.checkInDayOfWeek ?? 1);
    }
  }, [initialProfile]);

  // Live Formula Estimate Calculation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr += gender === 'FEMALE' ? -161 : 5;

  const activityMap: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTRA_ACTIVE: 1.9,
  };
  const tdee = bmr * (activityMap[activityLevel] || 1.55);

  const dailyRateDelta = Math.round((targetRateKgPerWeek * 7700) / 7);
  const liveTargetCalories = Math.max(800, Math.round(tdee + dailyRateDelta));

  // Dynamic Macro Distribution Preview
  let previewProtein = Math.round(weightKg * proteinGramsPerKg);
  let previewFat = Math.round((liveTargetCalories * (fatPercent / 100)) / 9);
  let previewCarbs = Math.round(Math.max(0, liveTargetCalories - (previewProtein * 4) - (previewFat * 9)) / 4);
  const previewFiber = Math.round((liveTargetCalories / 1000) * 14);

  if (macroPreset === 'HIGH_PROTEIN') {
    previewProtein = Math.round(weightKg * 2.2);
    previewFat = Math.round((liveTargetCalories * 0.25) / 9);
    previewCarbs = Math.round(Math.max(0, liveTargetCalories - (previewProtein * 4) - (previewFat * 9)) / 4);
  } else if (macroPreset === 'KETO') {
    previewProtein = Math.round((liveTargetCalories * 0.20) / 4);
    previewFat = Math.round((liveTargetCalories * 0.75) / 9);
    previewCarbs = Math.round(Math.max(0, liveTargetCalories - (previewProtein * 4) - (previewFat * 9)) / 4);
  }

  const isLowCalorie = (gender === 'FEMALE' && liveTargetCalories < 1200) || (gender === 'MALE' && liveTargetCalories < 1500);

  const handlePresetSelect = (preset: typeof macroPreset) => {
    setMacroPreset(preset);
    if (preset === 'BALANCED') {
      setProteinGramsPerKg(2.0);
      setFatPercent(25.0);
    } else if (preset === 'HIGH_PROTEIN') {
      setProteinGramsPerKg(2.2);
      setFatPercent(25.0);
    } else if (preset === 'KETO') {
      setProteinGramsPerKg(1.6);
      setFatPercent(75.0);
    } else if (preset === 'LOW_CARB') {
      setProteinGramsPerKg(2.0);
      setFatPercent(40.0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const updated = await ApiService.updateProfile({
        name,
        age,
        gender,
        heightCm,
        weightKg,
        activityLevel: activityLevel as any,
        goal,
        targetWeightKg: targetWeightKg !== '' ? Number(targetWeightKg) : null,
        targetRateKgPerWeek: Number(targetRateKgPerWeek),
        isAdaptiveEnabled,
        macroPreset,
        proteinGramsPerKg: Number(proteinGramsPerKg),
        fatPercent: Number(fatPercent),
        checkInDayOfWeek: Number(checkInDayOfWeek),
      });

      setSuccess(true);
      onProfileUpdated?.(updated);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl text-foreground">
      {/* Save Alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-semibold flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>Profile and adaptive targets updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: Personal Attributes */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Personal Information</h3>
            <p className="text-xs text-muted-foreground">Baselines used for initial Mifflin-St Jeor metabolic estimation.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-muted-foreground mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1 font-medium">Biological Sex</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1 font-medium">Age</label>
            <input
              type="number"
              min={14}
              max={100}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 25)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1 font-medium">Height (cm)</label>
            <input
              type="number"
              min={100}
              max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(parseFloat(e.target.value) || 175)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1 font-medium">Current Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min={30}
              max={250}
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1 font-medium">Activity Multiplier</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="SEDENTARY">Sedentary (Desk Job, 1.2x)</option>
              <option value="LIGHT">Light Activity (1-3 days/wk, 1.375x)</option>
              <option value="MODERATE">Moderate (3-5 days/wk, 1.55x)</option>
              <option value="VERY_ACTIVE">Very Active (6-7 days/wk, 1.725x)</option>
              <option value="EXTRA_ACTIVE">Extra Active (Athlete/Physical Job, 1.9x)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: Adaptive Metabolic Settings & Rate Slider */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Adaptive Target Engine</h3>
              <p className="text-xs text-muted-foreground">Adjust your desired rate of weight gain or loss.</p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={isAdaptiveEnabled}
              onChange={(e) => setIsAdaptiveEnabled(e.target.checked)}
              className="rounded accent-primary w-4 h-4 cursor-pointer"
            />
            <span>Enable Adaptive Engine</span>
          </label>
        </div>

        {/* Target Rate Slider */}
        <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">Target Rate of Weight Change</span>
            <span className="font-extrabold text-foreground text-sm">
              {targetRateKgPerWeek > 0 ? `+${targetRateKgPerWeek}` : targetRateKgPerWeek} kg/week
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                ({dailyRateDelta > 0 ? `+${dailyRateDelta}` : dailyRateDelta} kcal/day)
              </span>
            </span>
          </div>

          <input
            type="range"
            min={-1.0}
            max={0.5}
            step={0.05}
            value={targetRateKgPerWeek}
            onChange={(e) => setTargetRateKgPerWeek(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>-1.0 kg/wk (Aggressive Cut)</span>
            <span>0.0 kg/wk (Maintain)</span>
            <span>+0.5 kg/wk (Lean Bulk)</span>
          </div>
        </div>

        {/* Target Goal Weight & Check-In Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-muted-foreground mb-1 font-medium">Goal Body Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="e.g. 68.0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1 font-medium">Weekly Check-In Day</label>
            <select
              value={checkInDayOfWeek}
              onChange={(e) => setCheckInDayOfWeek(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value={1}>Monday (Recommended)</option>
              <option value={0}>Sunday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: Macro Presets & Live Calculation Preview */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Macro Distribution Presets</h3>
            <p className="text-xs text-muted-foreground">Select a standard dietary macro split or customize grams per kg.</p>
          </div>
        </div>

        {/* Preset Pills */}
        <div className="flex flex-wrap gap-2">
          {(['BALANCED', 'HIGH_PROTEIN', 'LOW_CARB', 'KETO', 'CUSTOM'] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                macroPreset === preset
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}
            >
              {preset.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Custom Sliders if CUSTOM is selected */}
        {macroPreset === 'CUSTOM' && (
          <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protein (g per kg bodyweight)</span>
                <span className="font-bold text-foreground">{proteinGramsPerKg} g/kg</span>
              </div>
              <input
                type="range"
                min={1.2}
                max={3.0}
                step={0.1}
                value={proteinGramsPerKg}
                onChange={(e) => setProteinGramsPerKg(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fat Percentage of Calories</span>
                <span className="font-bold text-foreground">{fatPercent}%</span>
              </div>
              <input
                type="range"
                min={15}
                max={45}
                step={1}
                value={fatPercent}
                onChange={(e) => setFatPercent(parseInt(e.target.value, 10))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Low-Calorie Safety Floor Warning */}
        {isLowCalorie && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Clinical Low-Calorie Safety Notice</strong>
              <p className="mt-0.5 leading-relaxed">
                Calculated target ({liveTargetCalories} kcal) is below recommended clinical minimums ({gender === 'FEMALE' ? '1,200' : '1,500'} kcal). Prolonged extreme deficits risk metabolic slowing, muscle wasting, and nutrient deficiencies.
              </p>
            </div>
          </div>
        )}

        {/* Live Calculation Preview Card */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">Calculated Daily Target</span>
              <span className="text-2xl font-black text-foreground">{liveTargetCalories} kcal</span>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <span>BMR: {Math.round(bmr)} kcal</span>
              <span className="block">TDEE: {Math.round(tdee)} kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">Protein</span>
              <span className="text-sm font-bold text-foreground">{previewProtein}g</span>
            </div>
            <div className="p-2 rounded-xl bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">Carbs</span>
              <span className="text-sm font-bold text-foreground">{previewCarbs}g</span>
            </div>
            <div className="p-2 rounded-xl bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">Fat</span>
              <span className="text-sm font-bold text-foreground">{previewFat}g</span>
            </div>
            <div className="p-2 rounded-xl bg-card border border-border">
              <span className="text-[10px] text-muted-foreground block">Fiber</span>
              <span className="text-sm font-bold text-foreground">{previewFiber}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="h-11 px-6 rounded-xl font-bold gap-2 shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Profile & Targets'}</span>
        </Button>
      </div>
    </form>
  );
};
