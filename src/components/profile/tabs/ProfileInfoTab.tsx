'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Scale, 
  Target, 
  Zap, 
  Check, 
  AlertTriangle, 
  Save, 
  Activity, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiService, UserProfile } from '@/services/api';

interface ProfileInfoTabProps {
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenWeightModal?: () => void;
  onSwitchToCalculator?: () => void;
}

export const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
  profile,
  onProfileUpdated,
  onOpenWeightModal,
  onSwitchToCalculator,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('MODERATE');
  const [goal, setGoal] = useState<'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK'>('WEIGHT_LOSS');
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>(68);
  const [targetRateKgPerWeek, setTargetRateKgPerWeek] = useState<number>(-0.5);
  const [isAdaptiveEnabled, setIsAdaptiveEnabled] = useState<boolean>(true);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setGender(profile.gender || 'MALE');
      setAge(profile.age || 25);
      setHeightCm(profile.heightCm || 175);
      setWeightKg(profile.weightKg || 70);
      setActivityLevel(profile.activityLevel || 'MODERATE');
      setGoal(profile.goal || 'WEIGHT_LOSS');
      setTargetWeightKg(profile.targetWeightKg ?? 68);
      setTargetRateKgPerWeek(profile.targetRateKgPerWeek ?? -0.5);
      setIsAdaptiveEnabled(profile.isAdaptiveEnabled !== false);
    }
  }, [profile]);

  // Derived BMI
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? Math.round((weightKg / (heightM * heightM)) * 10) / 10 : 22;
  let bmiCategory = 'Normal';
  let bmiColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-sky-500 bg-sky-500/10 border-sky-500/20';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  }

  // Live Mifflin-St Jeor Formula
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr += gender === 'FEMALE' ? -161 : 5;
  const activityMap: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTRA_ACTIVE: 1.9,
  };
  const tdee = Math.round(bmr * (activityMap[activityLevel] || 1.55));
  const dailyRateDelta = Math.round((targetRateKgPerWeek * 7700) / 7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      const updated = await ApiService.updateProfile({
        name: name.trim() || 'Athlete',
        gender,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        activityLevel,
        goal,
        targetWeightKg: targetWeightKg !== '' ? Number(targetWeightKg) : null,
        targetRateKgPerWeek: Number(targetRateKgPerWeek),
        isAdaptiveEnabled,
      });

      setSaveSuccess(true);
      onProfileUpdated(updated);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Messages */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>Profile and goal metrics updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground block">Current Weight</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-foreground font-mono">{weightKg}</span>
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          {onOpenWeightModal && (
            <button
              type="button"
              onClick={onOpenWeightModal}
              className="mt-2 text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Log Today</span>
            </button>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground block">BMI Status</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-foreground font-mono">{bmi}</span>
          </div>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${bmiColor}`}>
            {bmiCategory}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground block">BMR Estimate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-foreground font-mono">{Math.round(bmr)}</span>
            <span className="text-xs text-muted-foreground">kcal/day</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-2 block">Basal metabolism</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground block">Baseline TDEE</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-primary font-mono">{tdee}</span>
            <span className="text-xs text-muted-foreground">kcal/day</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-2 block">Maintenance energy</span>
        </div>
      </div>

      {/* SECTION 1: Personal Baseline Attributes */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Personal Attributes</h3>
            <p className="text-xs text-muted-foreground">Core physical metrics used for metabolic formula baselines.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-muted-foreground mb-1.5 font-medium">Athlete Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Purab Sahare"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1.5 font-medium">Biological Sex</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('MALE')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  gender === 'MALE'
                    ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('FEMALE')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  gender === 'FEMALE'
                    ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1.5 font-medium">Age (years)</label>
            <input
              type="number"
              min={14}
              max={100}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 25)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1.5 font-medium">Height (cm)</label>
            <input
              type="number"
              min={100}
              max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(parseFloat(e.target.value) || 175)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1.5 font-medium">Current Weight (kg)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min={30}
                max={250}
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 pr-12"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-muted-foreground font-mono">kg</span>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-muted-foreground mb-1.5 font-medium">Activity Level (Lifestyle & Training)</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="SEDENTARY">Sedentary — Desk job, little to no structured exercise (1.2x)</option>
              <option value="LIGHT">Lightly Active — Light training 1–3 days/week (1.375x)</option>
              <option value="MODERATE">Moderately Active — Moderate workouts 3–5 days/week (1.55x)</option>
              <option value="VERY_ACTIVE">Very Active — Hard workouts 6–7 days/week (1.725x)</option>
              <option value="EXTRA_ACTIVE">Extra Active — Physical labor or 2x daily training (1.9x)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: Fitness Strategy & Rate Goals */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Fitness Goal & Target Rate</h3>
              <p className="text-xs text-muted-foreground">Select your primary direction and speed of weight change.</p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
            <input
              type="checkbox"
              checked={isAdaptiveEnabled}
              onChange={(e) => setIsAdaptiveEnabled(e.target.checked)}
              className="rounded accent-primary w-4 h-4 cursor-pointer"
            />
            <span className="hidden sm:inline">Adaptive Engine</span>
          </label>
        </div>

        {/* Goal Strategy Buttons */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">Strategy</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'WEIGHT_LOSS', label: 'Weight Loss', desc: 'Caloric Deficit' },
              { id: 'MAINTAIN', label: 'Maintenance', desc: 'Metabolic Balance' },
              { id: 'BULK', label: 'Muscle Bulk', desc: 'Caloric Surplus' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setGoal(item.id as any);
                  if (item.id === 'WEIGHT_LOSS' && targetRateKgPerWeek >= 0) setTargetRateKgPerWeek(-0.5);
                  if (item.id === 'MAINTAIN') setTargetRateKgPerWeek(0);
                  if (item.id === 'BULK' && targetRateKgPerWeek <= 0) setTargetRateKgPerWeek(0.25);
                }}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  goal === item.id
                    ? 'bg-primary border-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className={`text-[10px] mt-0.5 ${goal === item.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Target Rate Slider */}
        <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">Target Rate of Weight Change</span>
            <span className="font-extrabold text-foreground text-sm font-mono">
              {targetRateKgPerWeek > 0 ? `+${targetRateKgPerWeek}` : targetRateKgPerWeek} kg/week
              <span className="text-xs font-normal text-muted-foreground ml-1.5 font-sans">
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

        {/* Goal Body Weight Target */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-muted-foreground mb-1.5 font-medium">Goal Target Weight (kg)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="e.g. 68.0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 pr-12"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-muted-foreground font-mono">kg</span>
            </div>
            {targetWeightKg && Number(targetWeightKg) > 0 && (
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Delta: {Math.round((Number(targetWeightKg) - weightKg) * 10) / 10} kg from current
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Looking to simulate or fine-tune macros?</span>
            </span>
            <p className="text-[11px] text-muted-foreground mt-1">
              Use the Macro Calculator to customize protein g/kg, fat percentages, and test clinical deficit floors.
            </p>
            {onSwitchToCalculator && (
              <button
                type="button"
                onClick={onSwitchToCalculator}
                className="mt-2 text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-start"
              >
                <span>Open Macro Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
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
          <span>{saving ? 'Saving Changes...' : 'Save Profile Metrics'}</span>
        </Button>
      </div>
    </form>
  );
};
