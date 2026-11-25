'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Sliders, 
  AlertTriangle, 
  Check, 
  Save, 
  Lock, 
  LogIn, 
  Dna, 
  Target, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiService, UserProfile } from '@/services/api';
import { MACRO_COLORS } from '@/lib/constants';
import { useIsGuest } from '@/lib/guest-session';
import { AuthModal } from '@/components/auth/AuthModal';

interface MacroCalculatorTabProps {
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const MacroCalculatorTab: React.FC<MacroCalculatorTabProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const isGuest = useIsGuest();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Input states
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<
    'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE'
  >('MODERATE');
  const [goal, setGoal] = useState<'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK'>('WEIGHT_LOSS');
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>(68);
  const [targetRateKgPerWeek, setTargetRateKgPerWeek] = useState<number>(-0.5);

  // Macro distribution settings
  const [macroPreset, setMacroPreset] = useState<'BALANCED' | 'HIGH_PROTEIN' | 'KETO' | 'LOW_CARB' | 'CUSTOM'>('BALANCED');
  const [proteinGramsPerKg, setProteinGramsPerKg] = useState<number>(1.8);
  const [fatPercent, setFatPercent] = useState<number>(28.0);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setGender(profile.gender || 'MALE');
      setAge(profile.age || 25);
      setHeightCm(profile.heightCm || 175);
      setWeightKg(profile.weightKg || 70);
      setActivityLevel(profile.activityLevel || 'MODERATE');
      setGoal(profile.goal || 'WEIGHT_LOSS');
      setTargetWeightKg(profile.targetWeightKg ?? 68);
      setTargetRateKgPerWeek(profile.targetRateKgPerWeek ?? -0.5);
      setMacroPreset(profile.macroPreset || 'BALANCED');
      setProteinGramsPerKg(profile.proteinGramsPerKg || 1.8);
      setFatPercent(profile.fatPercent || 28.0);
    }
  }, [profile]);

  // Dynamic Metabolic Calculations
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr += gender === 'FEMALE' ? -161 : 5;

  const activityMultipliers: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTRA_ACTIVE: 1.9,
  };
  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

  const dailyDelta = Math.round((targetRateKgPerWeek * 7700) / 7);
  const rawTarget = Math.round(tdee + dailyDelta);
  const clinicalFloor = gender === 'FEMALE' ? 1200 : 1500;
  const targetCalories = Math.max(clinicalFloor, rawTarget);
  const isFloorApplied = rawTarget < clinicalFloor;

  // Reference Body Weight calculation for high BMI
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 22;
  let referenceWeightKg = weightKg;
  if (bmi > 25) {
    if (targetWeightKg && Number(targetWeightKg) > 0) {
      const targetBmi = Number(targetWeightKg) / (heightM * heightM);
      if (targetBmi >= 18.5 && targetBmi <= 25) {
        referenceWeightKg = Number(targetWeightKg);
      } else {
        referenceWeightKg = Math.round(23.0 * heightM * heightM * 10) / 10;
      }
    } else {
      referenceWeightKg = Math.round(23.0 * heightM * heightM * 10) / 10;
    }
  }

  // Preset Handler
  const handlePresetSelect = (preset: typeof macroPreset) => {
    setMacroPreset(preset);
    if (preset === 'BALANCED') {
      setProteinGramsPerKg(1.8);
      setFatPercent(28.0);
    } else if (preset === 'HIGH_PROTEIN') {
      setProteinGramsPerKg(2.2);
      setFatPercent(25.0);
    } else if (preset === 'KETO') {
      setProteinGramsPerKg(1.8);
      setFatPercent(75.0);
    } else if (preset === 'LOW_CARB') {
      setProteinGramsPerKg(2.0);
      setFatPercent(40.0);
    }
  };

  // Macro Grams Calculation
  let targetProtein = Math.round(referenceWeightKg * Math.min(2.2, Math.max(1.4, proteinGramsPerKg || 1.8)));
  let fatFraction = Math.min(0.75, Math.max(0.20, (fatPercent || 28.0) / 100));

  if (macroPreset === 'HIGH_PROTEIN') {
    targetProtein = Math.round(referenceWeightKg * 2.2);
    fatFraction = 0.25;
  } else if (macroPreset === 'KETO') {
    targetProtein = Math.round(referenceWeightKg * 1.8);
    fatFraction = 0.75;
  } else if (macroPreset === 'LOW_CARB') {
    targetProtein = Math.round(referenceWeightKg * 2.0);
    fatFraction = 0.40;
  }

  let targetFat = Math.round((targetCalories * fatFraction) / 9);
  const minFatGrams = Math.round(referenceWeightKg * 0.6);
  targetFat = Math.max(targetFat, minFatGrams);

  const carbCalories = targetCalories - (targetProtein * 4) - (targetFat * 9);
  const targetCarbs = Math.round(Math.max(0, carbCalories) / 4);
  const targetFiber = Math.min(38, Math.max(20, Math.round((targetCalories / 1000) * 14)));

  const handleSyncToDashboard = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      const payload: Partial<UserProfile> = {
        gender,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        activityLevel,
        goal,
        targetWeightKg: targetWeightKg !== '' ? Number(targetWeightKg) : null,
        targetRateKgPerWeek: Number(targetRateKgPerWeek),
        bmr: Math.round(bmr),
        tdee,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        targetFiber,
        macroPreset,
        proteinGramsPerKg: Number(proteinGramsPerKg),
        fatPercent: Number(fatPercent),
      };

      const updated = await ApiService.updateProfile(payload);
      setSaveSuccess(true);
      onProfileUpdated(updated);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to sync targets');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>New targets synced! Your dashboard and daily meal tracker are now updated.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Guest Locked Banner */}
      {isGuest && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
            <Lock className="w-4 h-4 shrink-0" />
            <span>You are in <strong>Guest Mode</strong>. Calculations are interactive in-memory and will not persist across browser sessions.</span>
          </div>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shrink-0 hover:bg-primary/90 transition-all"
          >
            Create Account to Save
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calculation Parameters & Macro Preset Sliders */}
        <div className="lg:col-span-7 space-y-5">
          {/* Baseline Simulation Controls */}
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Metabolic Simulator</h3>
                <p className="text-xs text-muted-foreground">Tweak metrics to dynamically model your energy expenditure.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <label className="block text-muted-foreground font-sans mb-1 font-medium">Sex</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground font-sans focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-sans mb-1 font-medium">Age</label>
                <input
                  type="number"
                  min={14}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 25)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-sans mb-1 font-medium">Height (cm)</label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 175)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-sans mb-1 font-medium">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min={30}
                  max={250}
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="col-span-2 sm:col-span-4">
                <label className="block text-muted-foreground font-sans mb-1 font-medium">Activity Multiplier</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground font-sans focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="SEDENTARY">Sedentary — Desk job / low movement (1.2x)</option>
                  <option value="LIGHT">Lightly Active — Training 1–3 days/wk (1.375x)</option>
                  <option value="MODERATE">Moderately Active — Training 3–5 days/wk (1.55x)</option>
                  <option value="VERY_ACTIVE">Very Active — Training 6–7 days/wk (1.725x)</option>
                  <option value="EXTRA_ACTIVE">Extra Active — Physical occupation + 2x training (1.9x)</option>
                </select>
              </div>
            </div>

            {/* Target Rate Slider in Calculator */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Desired Rate of Change</span>
                <span className="font-bold text-foreground font-mono">
                  {targetRateKgPerWeek > 0 ? `+${targetRateKgPerWeek}` : targetRateKgPerWeek} kg/wk
                  <span className="text-[11px] text-muted-foreground font-normal ml-1">
                    ({dailyDelta > 0 ? `+${dailyDelta}` : dailyDelta} kcal/day)
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
            </div>
          </div>

          {/* Macro Presets & Sliders */}
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Dietary Macro Distribution</h3>
                <p className="text-xs text-muted-foreground">Choose a macro structure or dial in custom protein & fat ratios.</p>
              </div>
            </div>

            {/* Preset Selection Pills */}
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

            {/* Custom Sliders */}
            {macroPreset === 'CUSTOM' && (
              <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protein (g per kg reference weight)</span>
                    <span className="font-bold text-foreground font-mono">{proteinGramsPerKg} g/kg</span>
                  </div>
                  <input
                    type="range"
                    min={1.4}
                    max={2.2}
                    step={0.1}
                    value={proteinGramsPerKg}
                    onChange={(e) => setProteinGramsPerKg(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fat Percentage of Calories</span>
                    <span className="font-bold text-foreground font-mono">{fatPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={45}
                    step={1}
                    value={fatPercent}
                    onChange={(e) => setFatPercent(parseInt(e.target.value, 10))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Safety Floor Alert */}
            {isFloorApplied && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Clinical Low-Calorie Safety Floor Applied</strong>
                  <p className="mt-0.5 leading-relaxed">
                    Calculated raw target ({rawTarget} kcal) is below the minimum safe threshold ({clinicalFloor} kcal). We have clamped your recommended target to protect metabolic rate and vital organ function.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Calculated Output Hero & Sync Action */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Live Metabolic Model
                </span>
                <h3 className="text-base font-bold text-foreground">Calculated Outcomes</h3>
              </div>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>

            {/* BMR and TDEE Split */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[11px] text-muted-foreground font-sans font-medium">BMR (Basal)</div>
                <div className="text-lg font-black text-foreground mt-0.5">
                  {Math.round(bmr)} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[11px] text-muted-foreground font-sans font-medium">Maintenance TDEE</div>
                <div className="text-lg font-black text-foreground mt-0.5">
                  {tdee} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                </div>
              </div>
            </div>

            {/* Hero Calorie Target */}
            <div className="p-5 rounded-2xl bg-primary text-primary-foreground text-center shadow-md">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/80 block">
                Recommended Daily Intake
              </span>
              <div className="text-3xl font-black font-mono mt-1 text-primary-foreground">
                {targetCalories}{' '}
                <span className="text-sm font-normal text-primary-foreground/80">kcal/day</span>
              </div>
              <span className="text-[11px] text-primary-foreground/85 mt-1 block">
                Net Delta: {dailyDelta > 0 ? `+${dailyDelta}` : dailyDelta} kcal vs maintenance
              </span>
            </div>

            {/* Target Macros Breakdown */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Daily Macro Distribution
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className="p-3 rounded-2xl border flex flex-col justify-between"
                  style={{ backgroundColor: `${MACRO_COLORS.protein}12`, borderColor: `${MACRO_COLORS.protein}35` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: MACRO_COLORS.protein }}>PROTEIN</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{proteinGramsPerKg}g/kg</span>
                  </div>
                  <div className="text-base font-bold text-foreground font-mono mt-1">{targetProtein}g</div>
                </div>

                <div
                  className="p-3 rounded-2xl border flex flex-col justify-between"
                  style={{ backgroundColor: `${MACRO_COLORS.carbs}12`, borderColor: `${MACRO_COLORS.carbs}35` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: MACRO_COLORS.carbs }}>CARBS</span>
                    <span className="text-[10px] text-muted-foreground font-mono">Energy</span>
                  </div>
                  <div className="text-base font-bold text-foreground font-mono mt-1">{targetCarbs}g</div>
                </div>

                <div
                  className="p-3 rounded-2xl border flex flex-col justify-between"
                  style={{ backgroundColor: `${MACRO_COLORS.fat}12`, borderColor: `${MACRO_COLORS.fat}35` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: MACRO_COLORS.fat }}>FAT</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{fatPercent}% Cal</span>
                  </div>
                  <div className="text-base font-bold text-foreground font-mono mt-1">{targetFat}g</div>
                </div>

                <div
                  className="p-3 rounded-2xl border flex flex-col justify-between"
                  style={{ backgroundColor: `${MACRO_COLORS.fiber}12`, borderColor: `${MACRO_COLORS.fiber}35` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: MACRO_COLORS.fiber }}>FIBER</span>
                    <span className="text-[10px] text-muted-foreground font-mono">Target</span>
                  </div>
                  <div className="text-base font-bold text-foreground font-mono mt-1">{targetFiber}g</div>
                </div>
              </div>
            </div>

            {/* Sync Action */}
            <Button
              type="button"
              onClick={handleSyncToDashboard}
              disabled={saving}
              className="w-full h-11 rounded-xl font-bold gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Syncing Targets...' : 'Sync Targets to Dashboard'}</span>
            </Button>
          </div>
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
